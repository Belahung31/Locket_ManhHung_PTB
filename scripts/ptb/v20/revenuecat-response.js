// ManhHung FULL v20.1 - RevenueCat response diagnostics (read only).
// Leaves purchase history, entitlements, subscriptions and original status unchanged.
(function () {
  try {
    const raw = $response && $response.body;
    if (typeof raw !== "string" || !raw.length) {
      console.log("[MH20-RC] empty RevenueCat response, possibly 304");
    } else {
      const data = JSON.parse(raw);
      const subscriber = data && typeof data === "object" && data.subscriber;
      const entitlements = subscriber && subscriber.entitlements;
      const keys = entitlements && typeof entitlements === "object"
        ? Object.keys(entitlements) : [];
      console.log("[MH20-RC] RevenueCat response received; entitlement records=" + keys.length);
    }
  } catch (err) {
    console.log("[MH20-RC] non-JSON response; unchanged");
  }
  $done({});
})();