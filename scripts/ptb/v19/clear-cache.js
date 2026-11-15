// ManhHung FULL v19.2: anti-304 request header cleanup.
// RevenueCat: handle X-RevenueCat-ETag as seen in Ohoang7's example.
// Never log sensitive request headers or modify receipt/subscription data.
(function () {
  try {
    const headers = Object.assign({}, $request.headers || {});
    const isRevenueCat = /^https?:\/\/api\.revenuecat\.com\//i.test($request.url || "");
    let changed = false;
    for (const name of Object.keys(headers)) {
      const normalized = name.toLowerCase();
      if (normalized === "if-none-match" || normalized === "if-modified-since" ||
          (isRevenueCat && normalized === "x-revenuecat-etag")) {
        delete headers[name];
        changed = true;
      }
    }
    if (changed) console.log("[MH19-CACHE] cache validator headers removed");
    $done(changed ? {headers} : {});
  } catch (err) {
    console.log("[MH19-CACHE] fallback - unchanged");
    $done({});
  }
})();