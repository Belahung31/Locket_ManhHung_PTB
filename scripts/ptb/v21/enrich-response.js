// ManhHung FULL v21 (beta): independent PTB/Caption adapter.
// Compatible with the CURRENT Worker v17 /locket/patch shape:
// {camera_filter_config:{picker_filters, sheet_filters, remoteFilters, filters, ...}, captions:{...}}
// Keep native filters and response fields. Never modify subscriptions, Gold or identity.
const BASE="https://locket-ptb-manhhung.mhung31122007.workers.dev";
const FLAGS={PTB:true,Caption:true,Debug:false};
for (const part of String(typeof $argument==="string"?$argument:"").split("&")) {
  const pos=part.indexOf("=");if(pos<1)continue;
  const key=part.slice(0,pos),value=part.slice(pos+1).toLowerCase();
  if(Object.prototype.hasOwnProperty.call(FLAGS,key) && (value==="true"||value==="false"))
    FLAGS[key]=(value==="true");
}
const info=m=>{if(FLAGS.Debug)console.log("[MH21] "+m);};
const object=x=>x!==null && typeof x==="object"&&!Array.isArray(x);
const list=x=>Array.isArray(x)?x:[];
const id=x=>typeof x==="string"?x:object(x)?(x.id||x.uid||x.filter_id||x.overlay_id||null):null;
function mergeArray(dst,source) {
  if(!Array.isArray(dst)||!Array.isArray(source))return 0;
  const example=dst.find(x=>x!=null);
  const type=example===undefined? (source.length&&typeof source[0]) : typeof example;
  if(type!=="string"&&type!=="object")return 0;
  let changed=0;const known=new Set(dst.map(id));
  for(const item of source) {
    if(typeof item!==type||item===null||Array.isArray(item))continue;
    const key=id(item);
    if(!key||known.has(key))continue;
    dst.push(item);known.add(key);changed++;
  }
  return changed;
}
function ensureArray(o,key,items) {
  if(!object(o)||!Array.isArray(items)||!items.length)return 0;
  if(!Object.prototype.hasOwnProperty.call(o,key)) {o[key]=[];}
  return mergeArray(o[key],items);
}
function mergeGroups(dest,src){
  if(!Array.isArray(dest)||!Array.isArray(src))return 0;
  let changed=0;
  for(const group of src) {
    if(!object(group)||!id(group))continue;
    const existing=dest.find(x=>object(x)&&id(x)===id(group));
    if(!existing) {dest.push(group);changed++;continue;}
    for(const key of ["filter_ids","filterIds"])
      if(Array.isArray(existing[key])&&Array.isArray(group[key]))changed+=mergeArray(existing[key],group[key]);
  }
  return changed;
}
function ensureGroup(o,key,items) {
  if(!object(o)||!Array.isArray(items)||!items.length)return 0;
  if(!Object.prototype.hasOwnProperty.call(o,key))o[key]=[];
  return mergeGroups(o[key],items);
}
function trueFlag(o,key) {
  if(!object(o))return 0;
  if(o[key]===true||o[key]==="true")return 0;
  o[key]=typeof o[key]==="boolean"?true:"true";
  return 1;
}
function applyConfig(cfg,source) {
  if(!object(cfg)||!object(source))return 0;
  const items=list(source.filters).length?source.filters:list(source.remoteFilters);
  const ids=(list(source.picker_filters).length?source.picker_filters:
    list(source.pickerFilters).length?source.pickerFilters:items.map(id)).filter(x=>typeof x==="string");
  const groups=list(source.sheet_filters).length?source.sheet_filters:list(source.sheetFilters);
  let n=0;
  for(const key of ["picker_filters","pickerFilters"])n+=ensureArray(cfg,key,ids);
  for(const key of ["sheet_filters","sheetFilters"])n+=ensureGroup(cfg,key,groups);
  for(const key of ["filter_groups","filterGroups"])n+=ensureGroup(cfg,key,groups);
  for(const key of ["filters","remoteFilters","remote_filters"]) {
    const dest=cfg[key],existing=Array.isArray(dest)?dest.find(x=>x!=null):undefined;
    n+=ensureArray(cfg,key,typeof existing==="string"?ids:items);
  }
  for(const key of ["allows_custom_filters","allowsCustomFilters","show_filter_button","showFilterButton",
    "sheet_enabled","sheetEnabled","open_sheet_immediately","openSheetImmediately"]) {
    if(cfg[key]!==true){cfg[key]=true;n++;}
  }
  return n;
}
function editField(o,key,fn,makeIfAbsent) {
  if(!object(o))return 0;
  const exists=Object.prototype.hasOwnProperty.call(o,key);
  if(!exists&&!makeIfAbsent)return 0;
  const wasText=exists&&typeof o[key]==="string";
  let value=exists?o[key]:makeIfAbsent();
  if(wasText){try{value=JSON.parse(value);}catch(_){return 0;}}
  const n=fn(value);
  if(n) o[key]=wasText||!exists?JSON.stringify(value):value;
  return n;
}
function mergeCaptionGroups(dst,src) {
  if(!Array.isArray(dst)||!Array.isArray(src))return 0;
  let n=0;
  for(const group of src){
    if(!object(group)||typeof group.section!=="string"||!Array.isArray(group.items))continue;
    let g=dst.find(x=>object(x)&&x.section===group.section);
    if(!g){dst.push(group);n+=group.items.length;continue;}
    if(Array.isArray(g.items))n+=mergeArray(g.items,group.items);
  }
  return n;
}
function patchEntries(entries,patch) {
  if(!object(entries)||!object(patch))return 0;
  let n=0;
  if(FLAGS.PTB){
    const config=patch.camera_filter_config;
    if(object(config)) {
      // Crucial v21 fix: create camera_filter_config even when Firebase had no such field.
      n+=editField(entries,"camera_filter_config",c=>applyConfig(c,config),()=>({}));
      for(const key of ["camera_filters_enabled","camera_filter_button_enabled",
        "camera_filter_sheet_enabled","filter_selection_enabled","allows_custom_filters"]) n+=trueFlag(entries,key);
    }
  }
  if(FLAGS.Caption&&object(patch.captions)) {
    const c=patch.captions;
    if(Array.isArray(c.overlay_items))
      n+=editField(entries,"overlay_items",x=>mergeCaptionGroups(x,c.overlay_items),()=>[]);
    if(Array.isArray(c.overlay_dynamic_captions))
      n+=editField(entries,"overlay_dynamic_captions",x=>mergeArray(x,c.overlay_dynamic_captions),()=>[]);
  }
  return n;
}
function patchGetFilters(body,patch) {
  if(!FLAGS.PTB||!object(patch)||!object(patch.camera_filter_config))return 0;
  const c=patch.camera_filter_config,items=list(c.filters).length?c.filters:list(c.remoteFilters);
  const ids=list(c.picker_filters).length?c.picker_filters:items.map(id);
  let n=0;
  if(Array.isArray(body))return mergeArray(body,typeof body.find(x=>x!=null)==="string"?ids:items);
  const targets=[body,body&&body.data,body&&body.result,body&&body.result&&body.result.data,
     body&&body.payload,body&&body.payload&&body.payload.data];
  for(const node of targets){
    if(!object(node)||!Array.isArray(node.filters))continue;
    const first=node.filters.find(x=>x!=null);
    n+=mergeArray(node.filters,typeof first==="string"?ids:items);
  }
  return n;
}
function worker(url) {
  return new Promise((resolve,reject)=>{
    $httpClient.get({url,timeout:12000},(e,r,b)=>{
      if(e)return reject(e);
      if(Number((r&&(r.statusCode||r.status))||200)>=400)return reject(new Error("Worker unavailable"));
      try{resolve(JSON.parse(b));}catch(x){reject(x);}
    });
  });
}
(async()=>{
  const original=String(($response&&$response.body)||"");
  const url=String(($request&&$request.url)||"");
  const isRC=/^https?:\/\/firebaseremoteconfig(?:realtime)?\.googleapis\.com\//i.test(url);
  const isFilters=/\/(?:getFilters|v1\/filters|api\/filter)(?:\/|\?|$)/i.test(url);
  const path=url.split("?")[0].replace(/^https?:\/\/[^/]+/,"");
  try{
    if(!FLAGS.PTB&&!FLAGS.Caption){info("disabled");return $done({body:original});}
    if(!isRC&&!isFilters && !/"camera_filter_config"/.test(original))
      return $done({body:original});
    if(!original.trim()){info("no response body");return $done({body:original});}
    const data=JSON.parse(original);
    const patch=await worker(BASE+"/locket/patch");
    let changes=0;
    if(isRC&&object(data)) {
      const entries=object(data.entries)?data.entries:
        object(data.data)&&object(data.data.entries)?data.data.entries:null;
      if(entries)changes+=patchEntries(entries,patch);
      else info("RC entries not found");
    }
    if(isFilters)changes+=patchGetFilters(data,patch);
    if(object(data)&&object(data.camera_filter_config)&&FLAGS.PTB)
      changes+=applyConfig(data.camera_filter_config,patch.camera_filter_config);
    info("endpoint="+path+" changes="+changes);
    $done({body:changes?JSON.stringify(data):original});
  }catch(err){
    info("fallback endpoint="+path+" error="+String(err&&err.message||err));
    $done({body:original});
  }
})();