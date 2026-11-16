// MH v23: optional profile/filter endpoint diagnostics without modifying user data.
(function(){
  const flags={ProfileDebug:"false",Debug:"false"};
  for(const part of String(typeof $argument==="string"?$argument:"").split("&")){
    const p=part.indexOf("=");if(p>0&&Object.prototype.hasOwnProperty.call(flags,part.slice(0,p)))
      flags[part.slice(0,p)]=part.slice(p+1).toLowerCase();
  }
  try{
    if(flags.ProfileDebug!=="true"||flags.Debug!=="true")return $done({});
    const path=String(($request&&$request.url)||"").split("?")[0].replace(/^https?:\/\/[^/]+/i,"");
    const kind=/changeProfileInfo/i.test(path)?"profile":/getFilters/i.test(path)?"filters":"other";
    const status=String(($response&&($response.statusCode||$response.status))||"unknown");
    const raw=$response&&$response.body;
    let count="unknown";
    if(typeof raw==="string"&&raw) {
      try{
        const doc=JSON.parse(raw);
        const candidates=[doc,doc&&doc.data,doc&&doc.result,doc&&doc.result&&doc.result.data];
        for(const n of candidates)if(n&&Array.isArray(n.filters)){count=String(n.filters.length);break;}
      }catch(_){}
    }
    console.log("[MH23-PF] endpoint="+kind+" status="+status+" filter-count="+count);
  }catch(_){}
  return $done({});
})();