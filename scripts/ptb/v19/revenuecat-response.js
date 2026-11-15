// ManhHung FULL v19.1 - RevenueCat diagnostics only.
// Keeps purchases and entitlement status exactly as received.
// No request tokens, account identifiers or receipt contents are logged.
try {
  const raw = ($response && $response.body) || "";
  if (!raw) {
    console.log("[MH19-RC] no response body (possibly HTTP 304)");
    $done({});
  } else {
    let data;
    try { data = JSON.parse(raw); }
    catch (_) {
      console.log("[MH19-RC] response is not JSON; unchanged");
      $done({});
    }
    if (data && typeof data === "object") {
      const subscriber = data.subscriber && typeof data.subscriber === "object" ? data.subscriber : null;
      const entitlements = subscriber && subscriber.entitlements && typeof subscriber.entitlements === "object" ? subscriber.entitlements : null;
      const count = entitlements ? Object.keys(entitlements).length : 0;
      console.log("[MH19-RC] response received; entitlement records=" + count + "; unchanged");
    }
    $done({});
  }
} catch (err) {
  console.log("[MH19-RC] fallback; response unchanged");
  $done({});
}