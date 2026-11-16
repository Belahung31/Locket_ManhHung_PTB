// ManhHung FULL v20.2 - RevenueCat conditional anti-304. No subscription edits.
const flags={RevenueCat:"true",Debug:"false"};
for(const item of String(typeof $argument==="string"?$argument:"").split("&")){
 const p=item.indexOf("=");
 if(p>0&&Object.prototype.hasOwnProperty.call(flags,item.slice(0,p)))flags[item.slice(0,p)]=item.slice(p+1).toLowerCase();
}
try{
 if(flags.RevenueCat==="false"){$done({});}
 else{
  const h=Object.assign({},$request.headers||{});let changed=false;
  for(const key of Object.keys(h)){
   if(/^(x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)){delete h[key];changed=true;}
  }
  if(changed&&flags.Debug==="true")console.log("[MH20.2-RC] cache validators removed");
  $done(changed?{headers:h}:{});
 }
}catch(err){$done({});}