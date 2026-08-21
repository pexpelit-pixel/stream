const STORAGEBOX_URL =
  "https://cdn.storagetobox.com/d5711e99-ebec-40a0-b420-99f6ea1800cc6a617eb905bfc064b4e1fe6eddb8644f912e658df705a8e1f6d8";

const VIDEO_ID = "d5711e99-ebec-40a0-b420-99f6d632b288";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === `/${VIDEO_ID}.mp4`) {
      return proxyMp4(request);
    }

    if (url.pathname === "/") {
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

    return new Response("Not Found", { status: 404 });
  }
};

async function proxyMp4(request) {
  const headers = new Headers();

  const range = request.headers.get("Range");

  if (range) {
    headers.set("Range", range);
  }

  headers.set("Accept", "video/mp4,video/*;q=0.9,*/*;q=0.8");
  headers.set("User-Agent", "Mozilla/5.0");
  headers.set("Referer", "https://storagetobox.com/");
  headers.set("Origin", "https://storagetobox.com");

  const upstream = await fetch(STORAGEBOX_URL, {
    method: "GET",
    headers,
    redirect: "follow",
    cf: {
      cacheTtl: 0,
      cacheEverything: false
    }
  });

  if (!upstream.ok) {
    return new Response(
      JSON.stringify({
        ok: false,
        status: upstream.status,
        statusText: upstream.statusText,
        contentType: upstream.headers.get("content-type"),
        contentLength: upstream.headers.get("content-length"),
        contentRange: upstream.headers.get("content-range")
      }, null, 2),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const responseHeaders = new Headers();

  const copyHeaders = [
    "Content-Length",
    "Content-Range",
    "ETag",
    "Last-Modified"
  ];

  for (const name of copyHeaders) {
    const value = upstream.headers.get(name);
    if (value) {
      responseHeaders.set(name, value);
    }
  }

  responseHeaders.set("Content-Type", "video/mp4");
  responseHeaders.set("Accept-Ranges", "bytes");
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set(
    "Access-Control-Allow-Headers",
    "Range, Content-Type"
  );
  responseHeaders.set(
    "Access-Control-Expose-Headers",
    "Content-Length, Content-Range, Accept-Ranges, ETag"
  );
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}
