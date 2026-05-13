import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 4173);
const root = resolve(".");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const resolvedPath = resolve(root, normalize(relativePath));

  if (!resolvedPath.startsWith(root)) {
    return null;
  }

  return resolvedPath;
}

createServer((request, response) => {
  const filePath = resolveRequestPath(request.url);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});

setInterval(() => {
  // Keep the background development server alive in shell hosts that close stdin.
}, 60_000);
