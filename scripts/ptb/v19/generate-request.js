// ManhHung PTB v18 - route ONLY the six custom filters to the self-hosted Worker.
// Never forward Locket authentication/cookies to the image backend.
const BASE='https://locket-ptb-manhhung.mhung31122007.workers.dev';
const IDS=new Set(['mh_hoa_tuong_niem','mh_ban_tho_go','mh_hologram_bac_tim','mh_gau_dau_hong','mh_vu_tru_tim','mh_sweet_memories']);
try{
 const body=JSON.parse($request.body||'{}');
 let id='';
 const containers=[body,body&&body.data,body&&body.payload];
 for(const obj of containers){
  if(!obj||typeof obj!=='object')continue;
  for(const key of ['filterId','filter_id','filterUID','filterUid','uid','id','prompt','filter']){
   const x=obj[key],v=x&&typeof x==='object'?(x.id||x.uid):x;
   if(IDS.has(v)){id=v;break;}
  }
  if(id)break;
 }
 if(!id){$done({});}
 else{
  const secret=(typeof $argument==='string'?$argument:'').trim();
  if(secret.length<32||secret==='SET_YOUR_KEY'){
   console.log('[MH19-RENDER] missing PTB_KEY; original request kept');$done({});
  }else{
   const headers=Object.assign({},$request.headers||{});
   for(const key of Object.keys(headers)){
    if(/^(authorization|cookie|x-firebase-appcheck|x-goog.*|host|content-length|content-encoding|if-none-match|if-modified-since)$/i.test(key))delete headers[key];
   }
   headers['X-PTB-Key']=secret;
   headers['Content-Type']='application/json';
   console.log('[MH19-RENDER] custom filter '+id+' routed to Worker');
   $done({url:BASE+'/generateFilteredImage',headers,body:$request.body});
  }
 }
}catch(e){console.log('[MH19-RENDER] original request kept: '+String(e));$done({});}