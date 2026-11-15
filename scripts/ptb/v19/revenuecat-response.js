// ManhHung FULL v19.1 - RevenueCat diagnostics only.
// Reads the response without changing purchases, subscriptions or entitlements.
// Does not log account IDs, receipt bodies, tokens or personal data.
(function() {
  try {
    const raw = ($response && $response.body) || "";
    if (!raw) {
      console.log("[MH19-RC] no body (may be HTTP 304)");
    } else {
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.log("[MH19-RC] non-JSON response kept");
      }
      if (data && typeof data === "object") {
        const subscriber = data.subscriber && typeof data.subscriber === "object" ? data.subscriber : null;
        const entitlements = subscriber && subscriber.entitlements && typeof subscriber.entitlements === "object"
          ? subscriber.entitlements : null;
        const count = entitlements ? Object.keys(entitlements).length : 0;
        console.log("[MH19-RC] response reached; entitlement record count=" + count + "; original body unchanged");
      }
    }
  } catch (err) {
    console.log("[MH19-RC] exception; original body unchanged");
  }
  $done({});
})();