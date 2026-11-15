// Mạnh Hùng PTB v17: redirect ONLY the six owned filter IDs to our Worker.
// Keeps unrelated Locket traffic unchanged. Secret is provided locally via module argument.
const BASE='https://locket-ptb-manhhung.mhung31122007.workers.dev';
const IDS=new Set(['mh_hoa_tuong_niem','mh_ban_tho_go','mh_hologram_bac_tim','mh_gau_dau_hong','mh_vu_tru_tim','mh_sweet_memories']);
try {
 const body=JSON.parse($request.body||'{}');
 let id='';
 for(const k of ['filterId','filter_id','filterUID','filterUid','uid','id','prompt','filter']){
   const x=body[k],v=x&&typeof x==='object'?(x.id||x.uid):x;
   if(IDS.has(v)){id=v;break;}
 }
 if(!id){$done({});}
 else {
   const secret=(typeof $argument==='string'?$argument:'').trim();
   if(secret.length<32||secret==='SET_YOUR_KEY'){
     console.log('[MH-PTB] PTB_KEY missing. Original request preserved.');$done({});
   }else{
     const headers={...$request.headers};
     // Don't send user account credentials to our image processor.
     for(const key of Object.keys(headers)){
       if(/^(authorization|cookie|x-firebase-appcheck|x-goog.*|host|content-length|content-encoding|if-none-match|if-modified-since)$/i.test(key))delete headers[key];
     }
     headers['X-PTB-Key']=secret;headers['Content-Type']='application/json';
     console.log('[MH-PTB] routing custom filter '+id);
     $done({url:BASE+'/generateFilteredImage',headers,body:$request.body});
   }
 }
}catch(e){console.log('[MH-PTB] request fallback: '+e);$done({});}
