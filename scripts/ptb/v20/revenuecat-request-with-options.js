// ManhHung FULL v20.3 - RevenueCat anti-cache aligned with NMS header7.js.
// This only clears cache validators; it NEVER changes purchase/subscription data.
(function () {
  const flags={RevenueCat:"true",Debug:"false"};
  for(const item of String(typeof $argument==="string"?$argument:"").split("&")) {
    const i=item.indexOf("=");
    if(i>0 && Object.prototype.hasOwnProperty.call(flags,item.slice(0,i)))
      flags[item.slice(0,i)]=item.slice(i+1).toLowerCase();
  }
  try {
    if(flags.RevenueCat==="false")return $done({});
    const headers=Object.assign({},$request.headers||{});
    let changed=false;
    let foundETag=false;
    for(const key of Object.keys(headers)) {
      const k=key.toLowerCase();
      if(k==="x-revenuecat-etag") {
        foundETag=true;
        if(headers[key]!==""){headers[key]="";changed=true;}
      } else if(k==="if-none-match"||k==="if-modified-since") {
        delete headers[key];changed=true;
      }
    }
    if(!foundETag){headers["X-RevenueCat-ETag"]="";changed=true;}
    if(changed && flags.Debug==="true")console.log("[MH20.3-RC] cache headers normalized");
    $done(changed ? {headers} : {});
  } catch(e) {
    if(flags.Debug==="true")console.log("[MH20.3-RC] unchanged due to request error");
    $done({});
  }
})();