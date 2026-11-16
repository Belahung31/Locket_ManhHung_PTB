// ManhHung FULL v20.2 - RevenueCat read-only observer, controlled by Arguments.
const flags={RevenueCat:"true",Debug:"false"};
for(const item of String(typeof $argument==="string"?$argument:"").split("&")){
 const p=item.indexOf("=");
 if(p>0&&Object.prototype.hasOwnProperty.call(flags,item.slice(0,p)))flags[item.slice(0,p)]=item.slice(p+1).toLowerCase();
}
try{
 if(flags.RevenueCat!=="false"&&flags.Debug==="true"){
  const raw=$response&&$response.body;
  if(!raw)console.log("[MH20.2-RC] empty response");
  else {
   const data=JSON.parse(raw);
   const e=data&&data.subscriber&&data.subscriber.entitlements;
   console.log("[MH20.2-RC] entitlement count="+(e&&typeof e==="object"?Object.keys(e).length:0));
  }
 }
}catch(err){if(flags.Debug==="true")console.log("[MH20.2-RC] unreadable response");}
$done({});