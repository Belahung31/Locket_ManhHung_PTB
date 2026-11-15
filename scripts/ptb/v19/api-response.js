// ManhHung PTB v18 - conservative API filter adapter.
// On unrelated/sensitive responses, original body is returned unchanged.
const BASE = 'https://locket-ptb-manhhung.mhung31122007.workers.dev';
function id(v) {return typeof v==='string'?v:v&&typeof v==='object'?(v.id||v.uid||null):null;}
function add(dst,items,asString) {
 if(!Array.isArray(dst)||!Array.isArray(items))return false;
 const sample=dst.find(x=>x!=null);
 if(sample!==undefined && (asString?typeof sample!=='string':(typeof sample!=='object'||Array.isArray(sample))))return false;
 const seen=new Set(dst.map(id));let changed=false;
 for(const item of items){const k=id(item);if(k&&!seen.has(k)){dst.push(item);seen.add(k);changed=true;}}
 return changed;
}
function patch(x,cat) {
 if(!x||typeof x!=='object'||Array.isArray(x))return false;
 const items=cat.filters||[],ids=items.map(f=>f.id),groups=cat.groups||[];
 let changed=false;
 for(const k of ['filters','remoteFilters','remote_filters']) changed=add(x[k],items,false)||changed;
 for(const k of ['pickerFilters','picker_filters','filterIds','filter_ids']) changed=add(x[k],ids,true)||changed;
 for(const k of ['filterGroups','filter_groups']) changed=add(x[k],groups,false)||changed;
 for(const k of ['sheetFilters','sheet_filters']){
  const a=x[k];if(!Array.isArray(a))continue;
  const sample=a.find(v=>v!=null);
  changed=add(a,typeof sample==='string'?ids:groups,typeof sample==='string')||changed;
 }
 return changed;
}
(async()=>{
 const original=$response.body||'';
 console.log('[MH19-API] response matched '+($request.url||'').slice(0,120));
 const path=($request.url||'').split('?')[0].replace(/^https?:\/\/[^/]+/,'');
 try{
  if(!original || (!/getFilters/i.test(path) && !/"(?:filters|remoteFilters|filterGroups|camera_filter_config|pickerFilters)"/.test(original))){
   return $done({body:original});
  }
  const data=JSON.parse(original);
  const cat=await new Promise((ok,bad)=>$httpClient.get(
   {url:BASE+'/ptb/catalog',timeout:12000},(e,r,b)=>{
    if(e||!r||Number(r.status||r.statusCode||200)>=400)return bad(e||Error('Worker unavailable'));
    try{ok(JSON.parse(b));}catch(x){bad(x);}
   }
  ));
  let changed=false;
  if(Array.isArray(data) && /getFilters/i.test(path)) changed=add(data,cat.filters,false);
  const q=[data,data&&data.data,data&&data.result,data&&data.payload,data&&data.camera_filter_config];
  for(const obj of q){
   changed=patch(obj,cat)||changed;
   if(obj&&typeof obj==='object')changed=patch(obj.camera_filter_config,cat)||changed;
  }
  console.log('[MH19-API] '+path+' '+(changed?'added PTB':'no compatible filter structure'));
  $done({body:changed?JSON.stringify(data):original});
 }catch(e){console.log('[MH19-API] '+path+' fallback '+String(e));$done({body:original});}
})();