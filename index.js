// Route:
// https://domain-worker.com/storagebox/69d2310e.mp4
//
// URL sumber tetap disimpan di Worker, sehingga URL publik terlihat
// sebagai .mp4 dan browser tetap bisa melakukan Range Request.

const STORAGEBOX_URL =
  "https://cdn.storagetobox.com/d5711e99-ebec-40a0-b420-99f6d632b288?expires=1787238000&amp;sig=73ff8e164b63943e3ade2f1985cd97a58c634fe1056ddaf6f762027e3c1f27b57ba1e7261a46784c301bd87ca3d0";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/storagebox/69d2310e.mp4") {
      return proxyMp4(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};

async function proxyMp4(request) {
  const headers = new Headers();

  for (const name of [
    "Range",
    "If-Range",
    "Accept",
    "User-Agent",
    "Origin",
    "Referer"
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const upstream = await fetch(STORAGEBOX_URL, {
    method: "GET",
    headers,
    redirect: "follow"
  });

  const responseHeaders = new Headers(upstream.headers);

  responseHeaders.set("Content-Type", "video/mp4");
  responseHeaders.set("Accept-Ranges", "bytes");
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set(
    "Access-Control-Expose-Headers",
    "Content-Length, Content-Range, Accept-Ranges"
  );

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}
