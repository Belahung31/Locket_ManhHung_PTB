// ManhHung FULL v20.2 - optional PTB rendering; no login headers forwarded.
const BASE="https://locket-ptb-manhhung.mhung31122007.workers.dev";
const IDS=new Set(["mh_hoa_tuong_niem","mh_ban_tho_go","mh_hologram_bac_tim","mh_gau_dau_hong","mh_vu_tru_tim","mh_sweet_memories"]);
const filterKeys=["filterId","filter_id","filterUID","filterUid","uid","id","prompt","filter"];
const args={PTB:"true",Debug:"false",PTB_KEY:""};
const argument=String(typeof $argument==="string"?$argument:"");
for(const item of argument.split("&")) {
 const index=item.indexOf("=");
 if(index>0 && Object.prototype.hasOwnProperty.call(args,item.slice(0,index)))args[item.slice(0,index)]=item.slice(index+1);
}
const debug=message=>{if(args.Debug==="true")console.log(message);};
try {
 if(args.PTB==="false"){debug("[MH20.2-RENDER] PTB disabled");$done({});}
 else if(!$request.body||typeof $request.body!=="string"){debug("[MH20.2-RENDER] body not JSON string");$done({});}
 else {
  let body;
  try {body=JSON.parse($request.body);} catch(e) {body=null;}
  if(!body||typeof body!=="object"){$done({});}
  else{
   let id="";
   for(const obj of [body,body.data,body.payload,body.result]){
    if(!obj||typeof obj!=="object")continue;
    for(const key of filterKeys){
     const value=obj[key],name=value&&typeof value==="object"?(value.id||value.uid):value;
     if(IDS.has(name)){id=name;break;}
    }
    if(id)break;
   }
   if(!id){debug("[MH20.2-RENDER] default filter; unchanged");$done({});}
   else{
    const secret=args.PTB_KEY.trim();
    if(secret.length<32||secret==="SET_YOUR_KEY") {debug("[MH20.2-RENDER] PTB_KEY missing");$done({});}
    else{
     const headers=Object.assign({},$request.headers||{});
     for(const key of Object.keys(headers)){
      if(/^(authorization|proxy-authorization|cookie|set-cookie|x-firebase-.*|x-goog.*|x-api-key|host|content-length|content-encoding|if-none-match|if-modified-since)$/i.test(key))delete headers[key];
     }
     headers["X-PTB-Key"]=secret;
     headers["Content-Type"]="application/json";
     debug("[MH20.2-RENDER] rerouted custom PTB "+id);
     $done({url:BASE+"/generateFilteredImage",headers,body:$request.body});
    }
   }
  }
 }
} catch(err) {debug("[MH20.2-RENDER] fallback");$done({});}