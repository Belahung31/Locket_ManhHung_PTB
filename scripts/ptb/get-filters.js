// Mạnh Hùng PTB v17: add custom frames only into matching Locket filter list types.
// Keeps the native app response intact when its schema is unknown.
const BASE = 'https://locket-ptb-manhhung.mhung31122007.workers.dev';
function finish(body){$done({body});}
function httpJSON(url){return new Promise((resolve,reject)=>{
  $httpClient.get({url,timeout:12000},(err,res,body)=>{
    if(err)return reject(err);
    try { if(res && res.status && res.status>=400) throw Error('HTTP '+res.status);
      resolve(JSON.parse(body)); } catch(e){reject(e);}
  });
});}
function idOf(x){return typeof x==='string'?x:x&&typeof x==='object'?(x.id||x.uid||null):null;}
function merge(arr,add,type){
  if(!Array.isArray(arr)||!Array.isArray(add))return false;
  // Avoid mixing object records with string lists in an app-native response.
  const sample=arr.find(x=>x!=null);
  if(sample!==undefined){
    if(type==='id' && typeof sample!=='string')return false;
    if(type!=='id' && (typeof sample!=='object'||Array.isArray(sample)))return false;
  }
  const seen=new Set(arr.map(idOf)); let change=false;
  for(const item of add){const id=idOf(item);if(id&&!seen.has(id)){arr.push(item);seen.add(id);change=true;}}
  return change;
}
function patch(obj,catalog){
  if(!obj||typeof obj!=='object'||Array.isArray(obj))return false;
  let changed=false;
  const filters=catalog.filters||[], groups=catalog.groups||[], ids=filters.map(x=>x.id);
  for(const k of ['filters','remoteFilters','remote_filters']){
    if(k in obj)changed=merge(obj[k],filters,'filter')||changed;
  }
  for(const k of ['filterGroups','filter_groups','groups']){
    if(k in obj)changed=merge(obj[k],groups,'group')||changed;
  }
  for(const k of ['pickerFilters','picker_filters','filterIds','filter_ids']){
    if(k in obj)changed=merge(obj[k],ids,'id')||changed;
  }
  for(const k of ['sheetFilters','sheet_filters']){
    if(!Array.isArray(obj[k]))continue;
    const first=obj[k].find(v=>v!=null);
    changed=merge(obj[k],typeof first==='string'?ids:groups,typeof first==='string'?'id':'group')||changed;
  }
  return changed;
}
(async()=>{
 const original=$response.body;
 try{
   const data=JSON.parse(original); const catalog=await httpJSON(BASE+'/ptb/catalog');
   let changed=false;
   if(Array.isArray(data))changed=merge(data,catalog.filters,'filter');
   else if(data&&typeof data==='object'){
     for(const obj of [data,data.data,data.result,data.payload]){
       changed=patch(obj,catalog)||changed;
       if(obj && obj.camera_filter_config && typeof obj.camera_filter_config==='object')changed=patch(obj.camera_filter_config,catalog)||changed;
     }
   }
   console.log('[MH-PTB] getFilters: '+(changed?'added frames':'schema not matched'));
   finish(changed?JSON.stringify(data):original);
 }catch(e){console.log('[MH-PTB] getFilters fallback: '+e);finish(original);}
})();
