// ManhHung FULL v20: Filter + Caption response adapter.
// Adds only user-owned PTB records and captions to compatible fields.
// Never changes subscriptions, Gold, purchases, RevenueCat, or account identity.
const BASE = "https://locket-ptb-manhhung.mhung31122007.workers.dev";
const MH = "[MH20]";
const has = (o, k) => o != null && typeof o === "object" && Object.prototype.hasOwnProperty.call(o,k);
function idOf(x) {
  if (typeof x === "string") return x;
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  return x.id || x.uid || x.overlay_id || null;
}
function merge(dst, src, type) {
  if (!Array.isArray(dst) || !Array.isArray(src)) return 0;
  const existing = dst.find(x => x !== null && x !== undefined);
  if (existing !== undefined && (type === "string" ? typeof existing !== "string" : (typeof existing !== "object" || Array.isArray(existing)))) return 0;
  const seen = new Set(dst.map(idOf)); let n = 0;
  for (const item of src) {
    const id = idOf(item);
    if (!id || seen.has(id)) continue;
    dst.push(item); seen.add(id); n++;
  }
  return n;
}
function editField(obj, name, editor) {
  if (!has(obj,name)) return 0;
  const value = obj[name], encoded = typeof value === "string";
  let data = value;
  if (encoded) { try { data = JSON.parse(value); } catch (_) { return 0; } }
  const n = editor(data) || 0;
  if (n && encoded) obj[name] = JSON.stringify(data);
  return n;
}
function mergeCaptionSections(dest, src) {
  if (!Array.isArray(dest) || !Array.isArray(src)) return 0;
  let n=0;
  for(const item of src) {
    if (!item || !item.section || !Array.isArray(item.items)) continue;
    const exists=dest.find(x=>x&&x.section===item.section);
    if (!exists) { dest.push(item); n+=item.items.length; continue; }
    if (!Array.isArray(exists.items)) continue;
    const seen=new Set(exists.items.map(x=>x&&x.overlay_id));
    for(const cap of item.items) {
      if (cap && cap.overlay_id && !seen.has(cap.overlay_id)) {
        exists.items.push(cap); seen.add(cap.overlay_id); n++;
      }
    }
  }
  return n;
}
function setTrue(o,key) {
  if (!has(o,key)) return 0;
  if (o[key] !== false && o[key] !== "false") return 0;
  o[key] = typeof o[key] === "string" ? "true" : true;
  return 1;
}
function patchCamera(cfg, patch) {
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) return 0;
  const source = patch && patch.camera_filter_config;
  if (!source || typeof source !== "object") return 0;
  let n=0;
  for(const k of ["filters","remoteFilters","remote_filters"]) n+=merge(cfg[k], source.filters || source.remoteFilters || [], "object");
  for(const k of ["pickerFilters","picker_filters","filterIds","filter_ids"]) n+=merge(cfg[k], source.pickerFilters || [], "string");
  for(const k of ["filterGroups","filter_groups"]) n+=merge(cfg[k],source.filterGroups||[], "object");
  for(const k of ["sheetFilters","sheet_filters"]) {
    const a=cfg[k]; if (!Array.isArray(a)) continue;
    const item=a.find(x=>x!==null&&x!==undefined);
    const isString=typeof item==="string";
    n+=merge(a,isString ? (source.pickerFilters||[]) : (source.filterGroups||[]),isString?"string":"object");
  }
  for(const k of ["showFilterButton","sheetEnabled","show_filter_button","sheet_enabled","allowsCustomFilters","allows_custom_filters"])
    n+=setTrue(cfg,k);
  return n;
}
function patchContainer(obj,payload) {
  if (!obj || typeof obj!=="object" || Array.isArray(obj)) return 0;
  let n=0;
  // Remote Config can encode camera_filter_config, overlay_items as JSON strings.
  n+=editField(obj,"camera_filter_config",x=>patchCamera(x,payload));
  const patch=payload && payload.camera_filter_config;
  if (patch && ["pickerFilters","filters","remoteFilters","filterGroups","sheetFilters"].some(k=>has(obj,k)))
    n+=patchCamera(obj,payload);
  const captions=payload && payload.captions;
  if(captions) {
    n+=editField(obj,"overlay_items",x=>mergeCaptionSections(x,captions.overlay_items||[]));
    n+=editField(obj,"overlay_dynamic_captions",x=>merge(x,captions.overlay_dynamic_captions||[],"string"));
  }
  // Only enable pre-existing filter-related UI flags, never subscription entitlements.
  for(const k of ["camera_filters_enabled","camera_filter_enabled","filter_selection_enabled","camera_filter_sheet_selection_enabled","sheet_filters_selectable"])
    n+=setTrue(obj,k);
  if (obj.feature_gates && typeof obj.feature_gates==="object") {
    for(const k of ["camera_filters","camera_filter","camera_filter_sheet"]) {
      if (has(obj.feature_gates,k) && obj.feature_gates[k]!=="enabled") {
        obj.feature_gates[k]="enabled";n++;
      }
    }
  }
  return n;
}
function getJSON(url) {
  return new Promise((resolve,reject)=>{
    $httpClient.get({url,timeout:12000},(err,res,body)=>{
      if(err) return reject(err);
      const status=Number((res&&(res.statusCode||res.status))||200);
      if(status>=400) return reject(new Error("Worker HTTP "+status));
      try { resolve(JSON.parse(body)); } catch(e) { reject(e); }
    });
  });
}
(async()=>{
  const original=($response&&$response.body)||"";
  const path=(()=>{try{return new URL($request.url).pathname;}catch(_){return "unknown";}})();
  try {
    if (!original) {console.log(MH+" empty response "+path);return $done({body:original});}
    // JSON inspection stays local; no auth/receipt/personally-identifying data is logged.
    const data=JSON.parse(original);
    const isArray=Array.isArray(data);
    const hasRelevantKeys=isArray || (data && typeof data==="object" &&
       /"camera_filter_config"|"pickerFilters"|"filterGroups"|"remoteFilters"|"overlay_items"|"overlay_dynamic_captions"/.test(original));
    if (!hasRelevantKeys) {console.log(MH+" no filter/caption keys "+path);return $done({body:original});}
    const payload=await getJSON(BASE+"/locket/patch");
    let n=0;
    if(isArray) {
      if (/getFilters/i.test(path)) n+=merge(data,(payload.camera_filter_config||{}).filters||[],"object");
    } else if(data && typeof data==="object") {
      const containers=[data,data.entries,data.data,data.result,data.payload];
      for(const o of containers) n+=patchContainer(o,payload);
      // Some endpoints return a directly encoded camera_filter_config under data.
    }
    console.log(MH+" response "+path+" modified-records="+n);
    $done({body:n?JSON.stringify(data):original});
  }catch(e){
    console.log(MH+" fallback "+path+" error="+String(e&&e.message||e));
    $done({body:original});
  }
})();