// MH v23: Spotify endpoint diagnostics only, no Pro/Premium flags or payload processing.
(function(){
  var flags={SpotifyDebug:"false",Debug:"false"};
  for(const part of String(typeof $argument==="string"?$argument:"").split("&")){
    const p=part.indexOf("=");if(p>0&&Object.prototype.hasOwnProperty.call(flags,part.slice(0,p)))
      flags[part.slice(0,p)]=part.slice(p+1).toLowerCase();
  }
  try{
    if(flags.SpotifyDebug!=="true"||flags.Debug!=="true")return $done({});
    const url=String(($request&&$request.url)||"");
    const endpoint=url.includes("/bootstrap/")?"bootstrap":url.includes("/customize")?"customize":"other";
    const status=String(($response&&($response.statusCode||$response.status))||"unknown");
    console.log("[MH23-SP] endpoint="+endpoint+" status="+status);
  }catch(_){}
  return $done({});
})();