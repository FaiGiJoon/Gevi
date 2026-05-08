import { GEVI } from "./index";

const gevi = new GEVI();
const port = 3000;

console.log(`Starting GEVI GUI server on http://localhost:${port}`);

Bun.serve({
  port: port,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("public/index.html"));
    }
    if (url.pathname === "/app.js") {
      return new Response(Bun.file("public/app.js"));
    }

    // API endpoints
    if (url.pathname === "/api/command" && req.method === "POST") {
      try {
        const body = await req.json();
        const response = await gevi.handleCommand(body);
        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ status: "error", message: String(e) }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});
