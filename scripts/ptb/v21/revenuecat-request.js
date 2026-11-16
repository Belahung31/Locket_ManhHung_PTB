// MH FULL v21.1 — RevenueCat conditional-cache cleanup (read-only, no purchase spoofing)
// Applies only to RevenueCat endpoints selected by Shadowrocket.
(function () {
  var flags = {RevenueCat:"true", Debug:"false"};
  String(typeof $argument === "string" ? $argument : "").split("&").forEach(function (part) {
    var i=part.indexOf("="), name=part.slice(0,i), value=part.slice(i+1).toLowerCase();
    if(i>0 && Object.prototype.hasOwnProperty.call(flags,name))flags[name]=value;
  });
  try {
    if(flags.RevenueCat==="false")return $done({});
    var headers=Object.assign({},($request&&$request.headers)||{});
    var deleted=0;
    Object.keys(headers).forEach(function(key){
      if(/^(x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)){
        delete headers[key];deleted++;
      }
    });
    if(flags.Debug==="true")console.log("[MH21.1-RC] request cache-headers-removed="+deleted);
    return $done(deleted?{headers:headers}:{});
  } catch(err) {
    if(flags.Debug==="true")console.log("[MH21.1-RC] request fallback");
    return $done({});
  }
})();
