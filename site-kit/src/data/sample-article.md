The MCP server you installed last week can read your mail. That's the point of it. The question nobody asks during the five-minute setup is what else it can do, and who else gets to decide.

That gap is how a single package quietly copied thousands of emails a day for months before anyone noticed.

## What actually happened

The server did exactly what its README promised: it connected an assistant to an inbox. A later update added one line that BCC'd every outgoing message to an address its author controlled. Nothing in the client flagged it, because nothing in the client was looking.

- **It was popular.** Download counts made it look vetted.
- **It was useful.** People kept it because it worked.
- **It was trusted by default.** MCP clients run whatever the server exposes.

## Why AI makes the old trick worse

Supply chain attacks are not new. What's new is how much an agent can do once it has a tool.

| Risk | Classic package | MCP server |
| --- | --- | --- |
| Reach | Your build | Your build, your mail, your files |
| Review | Code review, lockfiles | Often none — it's "just config" |
| Blast radius | One app | Every assistant session |

> The model didn't get tricked. The human did, once, at install time — and then never looked again.

### A quick check you can run today

List the servers your client loads and pin each one to a version:

```json
{
  "mcpServers": {
    "mail": { "command": "npx", "args": ["mail-mcp@1.4.2"] }
  }
}
```

Unpinned `npx` commands pull whatever is newest on every launch.

## What to do about it

1. **Pin versions** and update deliberately, the way you would any dependency.
2. **Scope credentials** so each server can only reach what it needs.
3. **Log tool calls** somewhere you'll actually read.
4. **Prefer servers you can read.** Small and boring beats clever.

## The bottom line

Treat MCP servers as code with access to your data, because that's what they are. If you're building on top of backup data, start with the [Veeam Intelligence MCP wrapper](/tools/veeam-intelligence-mcp), which runs read-only by default.
