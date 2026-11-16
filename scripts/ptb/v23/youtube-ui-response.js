// MH v23: optional, narrowly scoped YouTube UI preferences.
// JSON-only, no ads/Premium/subscription modifications, no requests forwarded.
(function(){
  const flags={HideShorts:"false",HideUpload:"false",Debug:"false"};
  for(const part of String(typeof $argument==="string"?$argument:"").split("&")){
    const p=part.indexOf("=");if(p>0&&Object.prototype.hasOwnProperty.call(flags,part.slice(0,p)))
      flags[part.slice(0,p)]=part.slice(p+1).toLowerCase();
  }
  if(flags.HideShorts!=="true"&&flags.HideUpload!=="true")return $done({});
  try{
    const raw=$response&&$response.body;
    if(typeof raw!=="string"||!raw)return $done({});
    const doc=JSON.parse(raw);
    if(!doc||typeof doc!=="object")return $done({});
    let changed=0,visited=0;
    const isObj=x=>x!==null&&typeof x==="object";
    const isShorts=x=>{
      if(!isObj(x))return false;
      if(x.reelShelfRenderer||x.reelItemRenderer||x.shortsLockupViewModel||x.shortsLockupViewModelHost||x.shortsFeedItemRenderer)return true;
      const p=x.pivotBarItemRenderer;
      if(isObj(p)){
        const endpoint=p.navigationEndpoint||p.onTap||{};
        if(endpoint.browseEndpoint&&endpoint.browseEndpoint.browseId==="FEshorts")return true;
      }
      const shelf=x.richShelfRenderer;
      if(isObj(shelf)){
        const title=shelf.title||{};
        if(title.simpleText==="Shorts"||Array.isArray(title.runs)&&title.runs.some(y=>y&&y.text==="Shorts"))return true;
      }
      return false;
    };
    const isUpload=x=>{
      if(!isObj(x))return false;
      if(x.uploadButtonRenderer||x.createButtonRenderer)return true;
      const p=x.pivotButtonRenderer;
      if(isObj(p)){
        const icon=(p.icon||{}).iconType||(p.icon&&p.icon.iconType);
        if(icon==="VIDEO_CALL"||icon==="UPLOAD")return true;
      }
      return false;
    };
    const drop=x=>(flags.HideShorts==="true"&&isShorts(x))||(flags.HideUpload==="true"&&isUpload(x));
    function prune(node,depth){
      if(depth>90||!isObj(node)||++visited>85000)return;
      if(Array.isArray(node)){
        for(let i=node.length-1;i>=0;i--){
          if(drop(node[i])){node.splice(i,1);changed++;}
          else prune(node[i],depth+1);
        }
      }else{
        for(const k of Object.keys(node)){
          if(flags.HideShorts==="true"&&["reelShelfRenderer","reelItemRenderer","shortsLockupViewModel","shortsLockupViewModelHost","shortsFeedItemRenderer"].includes(k)){delete node[k];changed++;continue;}
          if(flags.HideUpload==="true"&&["uploadButtonRenderer","createButtonRenderer"].includes(k)){delete node[k];changed++;continue;}
          prune(node[k],depth+1);
        }
      }
    }
    prune(doc,0);
    if(flags.Debug==="true")console.log("[MH23-YT] ui-nodes-removed="+changed);
    return $done(changed?{body:JSON.stringify(doc)}:{});
  }catch(err){
    if(flags.Debug==="true")console.log("[MH23-YT] non-JSON or incompatible payload; unchanged");
    return $done({});
  }
})();