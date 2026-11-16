// ManhHung FULL v20.2 - cache cleanup with user controls.
const flags={PTB:"true",Caption:"true",RevenueCat:"true",Debug:"false"};
for(const s of String(typeof $argument==="string"?$argument:"").split("&")){
 const i=s.indexOf("=");
 if(i>0&&Object.prototype.hasOwnProperty.call(flags,s.slice(0,i)))flags[s.slice(0,i)]=s.slice(i+1).toLowerCase();
}
try{
 const uri=String(($request&&$request.url)||"");
 const rc=/^https?:\/\/api\.revenuecat\.com\//i.test(uri);
 const allowed=rc?flags.RevenueCat!=="false":(flags.PTB!=="false"||flags.Caption!=="false");
 if(!allowed){$done({});}
 else{
  const h=Object.assign({},$request.headers||{});let changed=false;
  for(const key of Object.keys(h)){
   const name=key.toLowerCase();
   if(name==="if-none-match"||name==="if-modified-since"||(rc&&name==="x-revenuecat-etag")){
    delete h[key];changed=true;
   }
  }
  if(changed&&flags.Debug==="true")console.log("[MH20.2-CACHE] cache validators removed");
  $done(changed?{headers:h}:{});
 }
}catch(err){$done({});}