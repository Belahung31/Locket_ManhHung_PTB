// MH FULL v21.1 — RevenueCat response diagnostics.
// NEVER changes the server response, purchases, subscriptions, entitlements, or identity.
(function () {
  var flags = {RevenueCat:"true",Debug:"false"};
  String(typeof $argument==="string" ? $argument : "").split("&").forEach(function(part) {
    var i=part.indexOf("="),name=part.slice(0,i),value=part.slice(i+1).toLowerCase();
    if(i>0 && Object.prototype.hasOwnProperty.call(flags,name))flags[name]=value;
  });
  try {
    if(flags.RevenueCat!=="false"&&flags.Debug==="true"){
      var raw=($response&&$response.body)||"";
      var status=($response&&$response.status)||($response&&$response.statusCode)||"unknown";
      if(!raw) console.log("[MH21.1-RC] response status="+status+" no body (e.g., 304)");
      else {
        var parsed=JSON.parse(raw);
        var sub=parsed&&parsed.subscriber;
        var ent=sub&&sub.entitlements;
        var subs=sub&&sub.subscriptions;
        console.log("[MH21.1-RC] response status="+status+
          " entitlement-count="+(ent&&typeof ent==="object"?Object.keys(ent).length:0)+
          " subscription-count="+(subs&&typeof subs==="object"?Object.keys(subs).length:0));
      }
    }
  }catch(err){
    if(flags.Debug==="true")console.log("[MH21.1-RC] response body not valid JSON; unchanged");
  }
  $done({});
})();
