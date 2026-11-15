// Mạnh Hùng PTB v17: append custom frames in matching Firebase Remote Config arrays.
// Do not falsify subscription entitlements or overwrite native filter data.
const BASE='https://locket-ptb-manhhung.mhung31122007.workers.dev';
const id=x=>typeof x==='string'?x:x&&typeof x==='object'?(x.id||x.uid||null):null;
const fetchJSON=url=>new Promise((ok,bad)=>$httpClient.get({url,timeout:12000},(e,r,b)=>{
 if(e)return bad(e);try{ok(JSON.parse(b));}catch(ex){bad(ex);}
}));
function merge(arr,add,kind){
 if(!Array.isArray(arr)||!Array.isArray(add))return false;
 const a=arr.find(x=>x!=null);
 if(a!==undefined && ((kind==='id' && typeof a!=='string')||(kind!=='id'&&typeof a!=='object')))return false;
 const ids=new Set(arr.map(id));let changed=false;
 for(const x of add){const name=id(x);if(name&&!ids.has(name)){arr.push(x);ids.add(name);changed=true;}}
 return changed;
}
function patch(cfg,cat){
 if(!cfg||typeof cfg!=='object')return false;
 const ids=cat.filters.map(f=>f.id),groups=cat.groups,filters=cat.filters;let changed=false;
 for(const field of ['pickerFilters','picker_filters'])changed=merge(cfg[field],ids,'id')||changed;
 for(const field of ['remoteFilters','remote_filters','filters'])changed=merge(cfg[field],filters,'filter')||changed;
 for(const field of ['filterGroups','filter_groups'])changed=merge(cfg[field],groups,'group')||changed;
 for(const field of ['sheetFilters','sheet_filters']){
   const a=cfg[field];if(!Array.isArray(a))continue;
   const first=a.find(x=>x!=null);
   changed=merge(a,typeof first==='string'?ids:groups,typeof first==='string'?'id':'group')||changed;
 }
 return changed;
}
(async()=>{
 const original=$response.body;
 try{
   const data=JSON.parse(original),cat=await fetchJSON(BASE+'/ptb/catalog');let changed=false;
   if(data&&typeof data==='object'){
     const e=data.entries;
     if(e&&typeof e==='object'&&e.camera_filter_config){
       if(typeof e.camera_filter_config==='string'){
         const parsed=JSON.parse(e.camera_filter_config);
         if(patch(parsed,cat)){e.camera_filter_config=JSON.stringify(parsed);changed=true;}
       }else changed=patch(e.camera_filter_config,cat)||changed;
     }
     if(data.camera_filter_config&&typeof data.camera_filter_config==='object')changed=patch(data.camera_filter_config,cat)||changed;
   }
   console.log('[MH-PTB] remote config '+(changed?'updated':'schema unmatched'));
   $done({body:changed?JSON.stringify(data):original});
 }catch(e){console.log('[MH-PTB] remote config fallback: '+e);$done({body:original});}
})();
