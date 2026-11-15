// ManhHung PTB v20: route only own six filter IDs; no login headers forwarded.
const BASE="https://locket-ptb-manhhung.mhung31122007.workers.dev";
const IDS=new Set(["mh_hoa_tuong_niem","mh_ban_tho_go","mh_hologram_bac_tim","mh_gau_dau_hong","mh_vu_tru_tim","mh_sweet_memories"]);
const keys=["filterId","filter_id","filterUID","filterUid","uid","id","prompt","filter"];
try {
  if (!$request.body || typeof $request.body !== "string") {
    console.log("[MH20-RENDER] unrecognized request body; unchanged"); $done({});
  } else {
    let body;
    try { body=JSON.parse($request.body); } catch (_) { body=null; }
    if(!body || typeof body!=="object") { console.log("[MH20-RENDER] not JSON; unchanged"); $done({}); }
    else {
      let chosen="";
      const containers=[body,body.data,body.payload,body.result].filter(x=>x&&typeof x==="object");
      for(const obj of containers) {
        for(const k of keys) {
          const v=obj[k],name=v&&typeof v==="object"?(v.id||v.uid):v;
          if(IDS.has(name)){chosen=name;break;}
        }
        if(chosen)break;
      }
      if(!chosen) {console.log("[MH20-RENDER] native filter; unchanged");$done({});}
      else {
        const secret=(typeof $argument==="string"?$argument:"").trim();
        if(secret.length<32 || secret==="SET_YOUR_KEY") {
          console.log("[MH20-RENDER] missing PTB_KEY; unchanged");$done({});
        } else {
          const headers=Object.assign({},$request.headers||{});
          for(const k of Object.keys(headers)) if(/^(authorization|proxy-authorization|cookie|set-cookie|x-firebase-.*|x-goog.*|x-api-key|host|content-length|content-encoding|if-none-match|if-modified-since)$/i.test(k)) delete headers[k];
          headers["Content-Type"]="application/json";
          headers["X-PTB-Key"]=secret;
          console.log("[MH20-RENDER] routing own PTB "+chosen);
          $done({url:BASE+"/generateFilteredImage",headers,body:$request.body});
        }
      }
    }
  }
} catch(e) {console.log("[MH20-RENDER] unchanged due to error");$done({});}