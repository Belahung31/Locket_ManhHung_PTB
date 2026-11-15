// ManhHung PTB v18 - Firebase Remote Config filter + caption adapter.
// Only appends to compatible response fields. Does NOT modify Gold/subscription state.
const BASE = 'https://locket-ptb-manhhung.mhung31122007.workers.dev';
function idOf(v) { return typeof v === 'string' ? v : v && typeof v === 'object' ? (v.id || v.uid || v.overlay_id || null) : null; }
function mergeArray(dst, src, kind) {
  if (!Array.isArray(dst) || !Array.isArray(src)) return false;
  const sample = dst.find(x => x != null);
  if (sample !== undefined && (kind === 'string' ? typeof sample !== 'string' : (typeof sample !== 'object' || Array.isArray(sample)))) return false;
  const ids = new Set(dst.map(idOf)); let changed = false;
  for (const item of src) { const id = idOf(item); if (id && !ids.has(id)) { dst.push(item); ids.add(id); changed = true; } }
  return changed;
}
function groups(dst, src) {
  if (!Array.isArray(dst) || !Array.isArray(src)) return false;
  let changed = false;
  for (const g of src) {
    if (!g || typeof g.section !== 'string' || !Array.isArray(g.items)) continue;
    let group = dst.find(x => x && x.section === g.section);
    if (!group) { dst.push(g); changed = true; continue; }
    if (Array.isArray(group.items)) {
      const seen = new Set(group.items.map(x => x && x.overlay_id));
      for (const item of g.items) if (item && item.overlay_id && !seen.has(item.overlay_id)) {
        group.items.push(item); seen.add(item.overlay_id); changed = true;
      }
    }
  }
  return changed;
}
function field(target, key, edit) {
  if (!target || typeof target !== 'object' || !(key in target)) return false;
  const wasString = typeof target[key] === 'string';
  let value = target[key];
  if (wasString) { try { value = JSON.parse(value); } catch (_) { return false; } }
  const changed = edit(value);
  if (changed) target[key] = wasString ? JSON.stringify(value) : value;
  return changed;
}
function patchCamera(c, add) {
  if (!c || typeof c !== 'object' || Array.isArray(c) || !add || !add.filters) return false;
  let changed = false;
  const ids = add.filters.map(f => f.id);
  for (const key of ['filters', 'remoteFilters', 'remote_filters']) changed = mergeArray(c[key], add.filters, 'object') || changed;
  for (const key of ['pickerFilters', 'picker_filters', 'filterIds', 'filter_ids']) changed = mergeArray(c[key], ids, 'string') || changed;
  for (const key of ['filterGroups', 'filter_groups']) changed = mergeArray(c[key], add.filterGroups || [], 'object') || changed;
  for (const key of ['sheetFilters', 'sheet_filters']) {
    if (!Array.isArray(c[key])) continue;
    const sample = c[key].find(x => x != null);
    changed = mergeArray(c[key], typeof sample === 'string' ? ids : (add.filterGroups || []), typeof sample === 'string' ? 'string' : 'object') || changed;
  }
  // Only enable existing filter-interface settings; never insert subscription entitlements.
  for (const key of ['showFilterButton', 'sheetEnabled', 'show_filter_button', 'sheet_enabled']) {
    if (key in c && c[key] === false) { c[key] = true; changed = true; }
  }
  return changed;
}
function patchContainer(container, payload) {
  if (!container || typeof container !== 'object') return false;
  let changed = field(container, 'camera_filter_config', cfg => patchCamera(cfg, payload.camera_filter_config));
  const captions = payload.captions || {};
  changed = field(container, 'overlay_items', items => groups(items, captions.overlay_items || [])) || changed;
  changed = field(container, 'overlay_dynamic_captions', arr => mergeArray(arr, captions.overlay_dynamic_captions || [], 'string')) || changed;
  return changed;
}
(async () => {
  const original = $response.body || '';
  try {
    if (!original || !/camera_filter_config|overlay_items|overlay_dynamic_captions/.test(original)) {
      console.log('[MH18-RC] no matching fields'); return $done({body:original});
    }
    const data = JSON.parse(original);
    const payload = await new Promise((resolve, reject) => $httpClient.get(
      {url:BASE+'/locket/patch',timeout:12000}, (error, response, body) => {
        if (error || !response || Number(response.status || response.statusCode || 200) >= 400) return reject(error || new Error('Worker patch unavailable'));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      }
    ));
    let changed = false;
    if (data && typeof data === 'object') {
      changed = patchContainer(data.entries, payload) || changed;
      changed = patchContainer(data, payload) || changed;
      changed = field(data, 'camera_filter_config', cfg => patchCamera(cfg, payload.camera_filter_config)) || changed;
    }
    console.log('[MH18-RC] ' + (changed ? 'filter/caption data added' : 'compatible fields not found or already present'));
    $done({body:changed ? JSON.stringify(data) : original});
  } catch (e) { console.log('[MH18-RC] fallback: '+String(e)); $done({body:original}); }
})();