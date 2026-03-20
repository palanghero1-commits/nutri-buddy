import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 8080);
const rootDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(rootDir, "dist");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function safeResolve(requestPath) {
  const pathname = decodeURIComponent((requestPath || "/").split("?")[0]);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const absolutePath = normalize(join(distDir, relativePath));

  if (!absolutePath.startsWith(distDir)) {
    return null;
  }

  return absolutePath;
}

function sendFile(response, filePath) {
  const extension = extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  if (!existsSync(distDir)) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build output not found. Run `npm run build` before starting the server.");
    return;
  }

  const resolvedPath = safeResolve(request.url);
  if (!resolvedPath) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Invalid request path.");
    return;
  }

  if (existsSync(resolvedPath)) {
    const stats = statSync(resolvedPath);
    if (stats.isDirectory()) {
      const indexPath = join(resolvedPath, "index.html");
      if (existsSync(indexPath)) {
        sendFile(response, indexPath);
        return;
      }
    } else {
      sendFile(response, resolvedPath);
      return;
    }
  }

  if (!extname(resolvedPath)) {
    sendFile(response, join(distDir, "index.html"));
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found.");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
