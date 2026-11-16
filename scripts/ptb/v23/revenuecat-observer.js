// MH v23: reads RevenueCat statuses for debugging; NEVER creates/changes a subscription.
(function(){
  const flags={RevenueCat:"true",Debug:"false"};
  for(const part of String(typeof $argument==="string"?$argument:"").split("&")){
    const p=part.indexOf("=");if(p>0&&Object.prototype.hasOwnProperty.call(flags,part.slice(0,p)))
      flags[part.slice(0,p)]=part.slice(p+1).toLowerCase();
  }
  if(flags.RevenueCat!=="true"||flags.Debug!=="true")return $done({});
  try{
    const status=String(($response&&($response.statusCode||$response.status))||"unknown");
    const raw=$response&&$response.body;
    if(!raw){console.log("[MH23-RC] status="+status+" empty-body");return $done({});}
    const parsed=JSON.parse(raw),sub=parsed&&parsed.subscriber;
    const ents=sub&&sub.entitlements||{},subscriptions=sub&&sub.subscriptions||{};
    const names=Object.keys(ents),now=Date.now();
    let goldLike=0,unexpired=0;
    for(const name of names){
      if(!/gold|locket/i.test(name))continue;
      goldLike++;
      const e=ents[name];
      if(!e||typeof e!=="object")continue;
      const expiry=e.expires_date||e.expiration_date;
      if(expiry===null&&(e.purchase_date||e.original_purchase_date))unexpired++;
      else if(typeof expiry==="string"&&Number.isFinite(Date.parse(expiry))&&Date.parse(expiry)>now)unexpired++;
    }
    console.log("[MH23-RC] status="+status+" entitlement-count="+names.length+
      " subscription-count="+Object.keys(subscriptions).length+
      " gold-like-keys="+goldLike+" unexpired-gold-like-keys="+unexpired);
  }catch(_){console.log("[MH23-RC] JSON unavailable; body unchanged");}
  return $done({});
})();