// Drives one Explainer: canvas, transport bar and chapter list. Ported from the standalone
// explainer page, scoped to its root element so a page can hold more than one.
import { explainers, type Film } from './registry';

const LEAD = 0.05; // "pause at each chapter" stops just before the next one, with its message held
const ICON_PLAY = 'M8 5v14l11-7z';
const ICON_PAUSE = 'M7 5h4v14H7zM13 5h4v14h-4z';
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

class Player {
  private film!: Film;
  private ctx!: CanvasRenderingContext2D;
  private t = 0;
  private playing = false;
  /** False until the first play; the poster shows and the first "next" plays chapter one instead of skipping it */
  private started = false;
  private last = 0;
  private stopAt: number | null = null;
  private playFrom = 0;
  private played = new Set<number>();
  private open = new Set<number>([0]);
  private lastGroup = 0;
  private chBtns: HTMLButtonElement[] = [];
  private secHeads: HTMLButtonElement[] = [];
  private secLists: HTMLOListElement[] = [];
  /** Clip mode: [start, end] in seconds, from data-from / data-to chapter labels */
  private clip: [number, number] | null = null;

  private readonly cv: HTMLCanvasElement;
  private readonly stage: HTMLElement;
  private readonly playBtn: HTMLButtonElement;
  private readonly playIcon: SVGPathElement;
  private readonly beatsEl: HTMLElement;
  private readonly presenter: HTMLInputElement;
  private readonly nowEl: HTMLElement;

  constructor(private readonly root: HTMLElement) {
    const $ = <T extends Element>(s: string) => root.querySelector<T>(s)!;
    this.cv = $('canvas');
    this.stage = $('[data-stage]');
    this.playBtn = $('[data-play]');
    this.playIcon = $('[data-play] path');
    this.beatsEl = $('[data-beats]');
    this.presenter = $('[data-presenter]');
    this.nowEl = $('[data-now]');
  }

  async init() {
    const info = explainers[this.root.dataset.explainer ?? ''];
    if (!info) return;
    const ctx = this.cv.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.film = (await info.load()).default(ctx);
    this.buildBeats();
    this.bind();
    this.clip = this.clipRange();
    const part = Number(this.root.dataset.part);
    if (this.clip) this.t = this.clip[0];
    else if (part) this.goToPart(part, false);
    else if (this.root.hasAttribute('data-deeplink')) this.fromHash(false);
    this.fillPoster(info);
    this.fit();
    document.fonts?.ready.then(() => this.draw());
    this.root.classList.add('is-ready');
  }

  private get bs() {
    return this.film.beats;
  }
  private endOf = (i: number) => (i + 1 < this.bs.length ? this.bs[i + 1][0] : this.film.duration);
  private chapterAt(x: number) {
    let on = 0;
    this.bs.forEach((b, i) => {
      if (x >= b[0] - 0.001) on = i;
    });
    return on;
  }
  /** Chapter labels in data-from / data-to to a time range; null when not a clip or a label is unknown */
  private clipRange(): [number, number] | null {
    const { from, to } = this.root.dataset;
    if (!from) return null;
    const i0 = this.bs.findIndex((b) => b[1] === from);
    const i1 = this.bs.findIndex((b) => b[1] === (to || from));
    if (i0 < 0 || i1 < i0) {
      console.warn(`[explainer] unknown clip range "${from}" to "${to}"`);
      return null;
    }
    return [this.bs[i0][0], this.endOf(i1)];
  }
  private computeStop() {
    if (this.clip) return this.clip[1] - LEAD;
    if (!this.presenter.checked) return null;
    for (const b of this.bs.slice(1)) {
      const s = b[0] - LEAD;
      if (s > this.t + 0.05) return s;
    }
    return null;
  }
  private markPlayed() {
    this.bs.forEach((_, i) => {
      const end = this.endOf(i);
      if (end <= this.t + 0.06 && end > this.playFrom + 0.06) this.played.add(i);
    });
  }

  private buildBeats() {
    const id = this.root.id || 'xp';
    this.beatsEl.replaceChildren();
    this.film.groups.forEach((name, g) => {
      const sec = document.createElement('div');
      sec.className = 'sec';
      const h = document.createElement('button');
      h.type = 'button';
      h.className = 'sechead';
      h.innerHTML = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6z"/></svg><span class="name"></span><span class="count"></span>';
      h.querySelector('.name')!.textContent = name;
      const ol = document.createElement('ol');
      ol.id = `${id}-sec${g}`;
      h.setAttribute('aria-controls', ol.id);
      h.addEventListener('click', () => {
        if (this.open.has(g)) this.open.delete(g);
        else this.open.add(g);
        this.draw();
      });
      this.bs.forEach(([bt, label, grp], i) => {
        if (grp !== g) return;
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ch';
        b.innerHTML = '<span></span><span class="prog"></span>';
        b.firstElementChild!.textContent = label;
        b.addEventListener('click', () => {
          this.t = bt;
          this.draw();
          this.setPlaying(true);
        });
        li.appendChild(b);
        ol.appendChild(li);
        this.chBtns[i] = b;
      });
      sec.appendChild(h);
      sec.appendChild(ol);
      this.beatsEl.appendChild(sec);
      this.secHeads[g] = h;
      this.secLists[g] = ol;
    });
  }

  private fit() {
    const r = this.cv.getBoundingClientRect();
    const w = Math.max(320, Math.round(r.width * (window.devicePixelRatio || 1)));
    this.cv.width = w;
    this.cv.height = Math.round((w * this.film.height) / this.film.width);
    this.draw();
  }

  private draw() {
    const { film, ctx, cv, bs, t } = this;
    ctx.setTransform(cv.width / film.width, 0, 0, cv.height / film.height, 0, 0);
    film.render(t, { holdCaptions: this.presenter.checked });
    const on = this.chapterAt(t);
    const g = bs[on][2];
    if (g !== this.lastGroup) {
      this.open.clear();
      this.open.add(g);
      this.lastGroup = g;
    }
    this.chBtns.forEach((b, i) => {
      b.classList.toggle('on', i === on);
      b.classList.toggle('played', this.played.has(i) && i !== on);
      const p = i !== on ? 0 : clamp((t - bs[i][0]) / (this.endOf(i) - bs[i][0]), 0, 1);
      b.querySelector<HTMLElement>('.prog')!.style.width = `${p * 100}%`;
      if (i === on) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    this.secHeads.forEach((h, k) => {
      const isOpen = this.open.has(k);
      h.setAttribute('aria-expanded', String(isOpen));
      this.secLists[k].hidden = !isOpen;
      h.classList.toggle('current', k === g);
      const idx = bs.map((b, i) => (b[2] === k ? i : -1)).filter((i) => i >= 0);
      h.querySelector('.count')!.textContent = `${idx.filter((i) => this.played.has(i)).length}/${idx.length}`;
    });
    const sm = document.createElement('small');
    sm.textContent = film.groups[g];
    this.nowEl.replaceChildren(sm, document.createTextNode(bs[on][1]));
  }

  private setPlaying(p: boolean) {
    this.playing = p;
    this.playIcon.setAttribute('d', p ? ICON_PAUSE : ICON_PLAY);
    this.playBtn.setAttribute('aria-label', p ? 'Pause' : 'Play');
    this.playBtn.title = p ? 'Pause' : 'Play';
    if (p && !this.started) {
      this.started = true;
      this.root.classList.add('is-started');
    }
    // a clip that has finished (or was moved outside its range) replays from its start
    if (p && this.clip && (this.t >= this.clip[1] - LEAD - 0.01 || this.t < this.clip[0])) this.t = this.clip[0];
    if (p) {
      this.playFrom = this.t;
      this.stopAt = this.computeStop();
      this.last = performance.now();
      requestAnimationFrame(this.loop);
    }
  }

  private loop = (now: number) => {
    if (!this.playing) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    if (this.stopAt !== null && this.t >= this.stopAt) this.t = this.stopAt;
    this.markPlayed();
    if (this.stopAt !== null && this.t >= this.stopAt) {
      this.draw();
      this.setPlaying(false);
      return;
    }
    this.draw();
    requestAnimationFrame(this.loop); // the summary keeps looping until paused
  };

  private next() {
    if (!this.started) return this.setPlaying(true);
    if (this.presenter.checked && !this.playing && this.t > 0) return this.setPlaying(true);
    const n = this.bs.find((b) => b[0] > this.t + 0.1);
    if (n) {
      this.t = n[0];
      this.draw();
      this.setPlaying(true);
    } else if (!this.playing) this.setPlaying(true);
  }

  private prev() {
    const i = this.chapterAt(this.t);
    this.t = this.t - this.bs[i][0] > 1.5 || i === 0 ? this.bs[i][0] : this.bs[i - 1][0];
    this.draw();
    this.setPlaying(true);
  }

  /** Jump to the first chapter of part n (1-based), paused */
  goToPart(n: number, redraw = true) {
    const beat = this.bs.find((b) => b[2] === n - 1);
    if (!beat) return false;
    this.setPlaying(false);
    this.t = beat[0];
    this.open.clear();
    this.open.add(n - 1);
    this.lastGroup = n - 1;
    if (redraw) this.draw();
    if (!this.started) this.fillPoster();
    return true;
  }

  /** Poster over the stage until the first play: title, or the part and chapter when opened at one */
  private fillPoster(info = explainers[this.root.dataset.explainer ?? '']) {
    const set = (sel: string, text: string) => {
      const el = this.root.querySelector(sel);
      if (el) el.textContent = text;
    };
    const on = this.chapterAt(this.t);
    const parts = new Set(this.bs.map((b) => b[2])).size - (this.film.groups.at(-1) === 'Summary' ? 1 : 0);
    if (this.clip) {
      const secs = Math.round(this.clip[1] - this.clip[0]);
      set('[data-poster-title]', this.bs[on][1]);
      set('[data-poster-sub]', this.film.groups[this.bs[on][2]]);
      set('[data-poster-meta]', `${secs} second clip. Click to play.`);
      return;
    }
    set('[data-poster-title]', this.t > 0 ? `${this.film.groups[this.bs[on][2]]}` : (info?.title ?? ''));
    set('[data-poster-sub]', this.t > 0 ? this.bs[on][1] : (info?.tagline ?? ''));
    set('[data-poster-meta]', `${parts} parts, ${this.bs.length} chapters. Click to play.`);
  }

  private fromHash(scroll: boolean) {
    const n = Number(location.hash.match(/^#part-(\d+)$/)?.[1]);
    if (n && this.goToPart(n, scroll) && scroll) this.root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private bind() {
    const $ = (s: string) => this.root.querySelector<HTMLElement>(s)!;
    this.playBtn.addEventListener('click', () => this.setPlaying(!this.playing));
    $('[data-next]').addEventListener('click', () => this.next());
    $('[data-prev]').addEventListener('click', () => this.prev());
    this.presenter.addEventListener('change', () => {
      if (this.playing) this.stopAt = this.computeStop();
      this.draw();
    });
    this.stage.addEventListener('click', () => (this.clip ? this.setPlaying(!this.playing) : this.next()));
    $('[data-fs]').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else this.stage.requestFullscreen?.();
    });
    document.addEventListener('fullscreenchange', () => setTimeout(() => this.fit(), 60));
    // Keys only while focus is inside this explainer, so the page itself still scrolls
    this.root.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ' && e.target === this.stage) {
        e.preventDefault();
        this.setPlaying(!this.playing);
      } else if (this.clip) {
        return;
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prev();
      }
    });
    new ResizeObserver(() => this.fit()).observe(this.stage);
    // Pause when scrolled out of view, so a long post isn't animating off-screen
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && this.playing) this.setPlaying(false);
    }).observe(this.stage);
    if (this.root.hasAttribute('data-deeplink')) window.addEventListener('hashchange', () => this.fromHash(true));
  }
}

export function mountExplainers() {
  document.querySelectorAll<HTMLElement>('[data-explainer]:not(.is-mounted)').forEach((el) => {
    el.classList.add('is-mounted');
    new Player(el).init();
  });
}
