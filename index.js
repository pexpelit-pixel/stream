const STORAGEBOX_URL =
  "https://cdn.storagetobox.com/d5711e99-ebec-40a0-b420-99f6d632b288?expires=1787319000&amp;sig=44c5ea1800cc6a617eb905bfc064b4e1fe6eddb8644f912e658df705a8e1f6d8";

const VIDEO_ID = "44c5ea1800cc6a617eb905bfc064b4e1fe6eddb8644f912e658df705a8e1f6d8";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === `/${VIDEO_ID}.mp4`) {
      return proxyMp4(request);
    }

    return new Response(
      `https://stream.sakittakberdarah.workers.dev/${VIDEO_ID}.mp4`,
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
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
    "Access-Control-Allow-Headers",
    "Range, Content-Type"
  );
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
