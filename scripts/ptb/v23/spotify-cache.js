// MH v23: Spotify conditional-cache cleanup only; never edits subscription/Premium flags.
(function(){
  const flags={SpotifyCache:"false",Debug:"false"};
  for(const part of String(typeof $argument==="string"?$argument:"").split("&")){
    const p=part.indexOf("=");if(p>0&&Object.prototype.hasOwnProperty.call(flags,part.slice(0,p)))
      flags[part.slice(0,p)]=part.slice(p+1).toLowerCase();
  }
  try{
    if(flags.SpotifyCache!=="true")return $done({});
    const h=Object.assign({},($request&&$request.headers)||{});
    let n=0;
    for(const key of Object.keys(h)){
      if(/^(if-none-match|if-modified-since)$/i.test(key)){delete h[key];n++;}
    }
    if(flags.Debug==="true")console.log("[MH23-SP] cache-headers-removed="+n);
    return $done(n?{headers:h}:{});
  }catch(_){
    if(flags.Debug==="true")console.log("[MH23-SP] unchanged (error)");
    return $done({});
  }
})();