// ManhHung FULL v20.1 - RevenueCat request cache compatibility.
// Based on the header strategy in MinhHiep08's module; no subscription edits.
(function () {
  try {
    const h = Object.assign({}, $request.headers || {});
    let changed = false;
    for (const key of Object.keys(h)) {
      if (/^(x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)) {
        delete h[key];
        changed = true;
      }
    }
    if (changed) console.log("[MH20-RC] request cache validators removed");
    $done(changed ? {headers:h} : {});
  } catch (err) {
    console.log("[MH20-RC] request fallback");
    $done({});
  }
})();