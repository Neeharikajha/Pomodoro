// Cloudflare Workers script for SPA routing
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Try to get the asset
    const response = await env.ASSETS.fetch(request);

    // If asset not found and it's a GET request, serve index.html
    if (response.status === 404 && request.method === "GET") {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  },
};
