# ✋ Ben Young Blog

Veeam Field CTO for APJ and a proud 5x Veeam Vanguard. Sharing my thoughts on technology and showcasing the art of the possible. 

This is the source. 

Head on over to view the site at <a href="https://benyoung.blog">benyoung.blog</a>

## Hat Tip to.... 🚀 EV0 Astro Theme 

EV0 Astro Theme is a free and open-source serverless blog template, built with Astro, Tailwind CSS, and TypeScript. It serves as a starting point for creating your personal portfolio website or showcasing your projects online. The template is open-source and released under the MIT license, meaning you are free to use, modify, and distribute it for personal or commercial purposes.

## 🚀 Getting Started


| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |
| `npm run youtube` | Fetches the Latest YouTube Channel Videos    |
| `npm run newpost` | Generate a New Blogpost Markdown Entry       |

Edit the HTML files in the `src/pages` directory to add your projects, experiences, and personal information.

## 📝 Configuration Blog

To configure your blog, edit the `src/config/config.json` file. This file contains the following options:

```scheme
{
  "site": {
    "title": "EV0 Astro Theme",
    "base_url": "https://ev0.gndx.dev/",
    "base_path": "/",
    "favicon": "/favicon.png",
    "logo": "https://s3.amazonaws.com/gndx.dev/ev0-astro-logo.png",
    "lang": "en",
    "description": "EV0 is a free and open-source serverless blog template, built with Astro, Tailwind CSS, and TypeScript.",
    "pageSize": 6
  },
  "features": {
    "youtube": true
  },
  "metadata": {
    "meta_author": "Oscar Barajas @gndx",
    "meta_description": "EV0 is a free and open-source serverless blog template, built with Astro, Tailwind CSS, and TypeScript."
  },
  "author": {
    "name": "Oscar Barajas Tavares @gndx",
    "avatar": "https://s3.amazonaws.com/gndx.dev/gndx-astro-avatar.png",
    "bio": "EV0 is a free and open-source serverless blog template, built with Astro, Tailwind CSS, and TypeScript."
  }
}
```

The menu is configured in the `src/config/menu.json` file. This file contains the following options:

```scheme
[
  {
    "name": "Home",
    "url": "/"
  },
  {
    "name": "Blog",
    "url": "/blog"
  },
]
```

Social networks are configured in the `src/config/social.json` file. This file contains the following options:

```scheme
  {
    "name": "Instagram",
    "url": "https://instagram.com/gndx"
    "svg": "...."
  }
```

## 🎥 YouTube Integration

To integrate your YouTube channel, you need to create a new file called `.env` in the root directory of your project. Then add the `CHANNEL_ID` and `API_KEY` to get the latest videos from your YouTube channel in `src/config/youtube.json`.

```scheme
npm run youtube
```

Your YouTube API is not used in production.

Requires an API KEY for YouTube API V3 - [Google Console](https://console.cloud.google.com/)

You can disable the youtube integration by modifying the `src/config/config.json`.

```json
  "features": {
    "youtube": false
  },
```

## 📝 Adding New Posts

To add a new post, run the following command:

```scheme
npm run newpost
```

Follow the instructions and this will generate a new markdown file in the `src/content/blog` directory. Edit the file to add your post content.

## 📂 Project Structure

```
/
├── public/
│   └── favicons/
│   └── fonts/
│   └── blog-placeholder.jpg
│   └── favicon.png
│   └── humans.txt
├── scripts/
│   └── youtube.cjs
├── src/
│   ├── components/
│   ├── config/
│   ├── content/
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── env.d.ts
└── package.json
└── astro.config.mjs
└── tailwind.config.js
└── tsconfig.json
└── .gitignore
```

<!-- ALL-CONTRIBUTORS-LIST:END -->

## 📃 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

