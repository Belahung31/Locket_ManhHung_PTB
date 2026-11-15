// ManhHung PTB v18 - remove HTTP conditional caching only for selected filter/RC requests.
try {
 const headers = Object.assign({}, $request.headers || {});
 let changed = false;
 for (const key of Object.keys(headers)) {
  if (/^(if-none-match|if-modified-since)$/i.test(key)) { delete headers[key]; changed=true; }
 }
 if(changed) console.log('[MH18-CACHE] conditional cache headers removed');
 $done(changed ? {headers} : {});
} catch(e) { console.log('[MH18-CACHE] fallback '+String(e)); $done({}); }