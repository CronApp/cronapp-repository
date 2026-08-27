const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade"
]);

function buildUpstreamUrl(requestUrl, env) {
  return new URL(requestUrl.pathname + requestUrl.search, `${env.GITHUB_URL}`);
}

function buildUpstreamHeaders(request, env) {
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (lower === "host" || HOP_BY_HOP_HEADERS.has(lower)) {
      continue;
    }
    headers.set(key, value);
  }

  const credentials = btoa(`${env.GITHUB_USERNAME}:${env.GITHUB_TOKEN}`);
  headers.set("Authorization", `Basic ${credentials}`);

  return headers;
}

export default {
  async fetch(request, env) {
    if (!env.GITHUB_TOKEN) {
      return new Response("GITHUB_TOKEN not configured", { status: 500 });
    }

    const requestUrl = new URL(request.url);
    const upstreamUrl = buildUpstreamUrl(requestUrl, env);
    const headers = buildUpstreamHeaders(request, env);

    const hasBody = request.method !== "GET" && request.method !== "HEAD";

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual"
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    for (const hopHeader of HOP_BY_HOP_HEADERS) {
      responseHeaders.delete(hopHeader);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  },
};
