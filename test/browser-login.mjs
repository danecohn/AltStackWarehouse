// Real Nextcloud authorization-code login against the isolated CI identity server.
import assert from 'node:assert/strict';
const cookies=new Map();
async function request(url,options={}){
 const target=new URL(url),selected=[...cookies.values()].filter(c=>c.host===target.hostname&&target.pathname.startsWith(c.path)).map(c=>c.name+'='+c.value).join(';');
 const response=await fetch(target,{...options,redirect:'manual',headers:{...options.headers,...(selected?{cookie:selected}:{})},signal:AbortSignal.timeout(30000)});
 for(const raw of response.headers.getSetCookie()){
  const parts=raw.split(';'),equals=parts[0].indexOf('='),name=parts[0].slice(0,equals),value=parts[0].slice(equals+1),path=parts.find(p=>p.trim().toLowerCase().startsWith('path='))?.trim().slice(5)||'/';
  const key=target.hostname+'|'+path+'|'+name;if(parts.some(p=>p.trim().toLowerCase()==='max-age=0'))cookies.delete(key);else cookies.set(key,{host:target.hostname,path,name,value});
 }
 return response;
}
let target='http://127.0.0.1/apps/user_oidc/login/1',response,approved=false;
for(let step=0;step<20;step++){
 response=await request(target);const url=new URL(target);
 if(url.port==='3100'&&/^\/sso\/interaction\/[^/]+$/.test(url.pathname)){
  response=await request(target+'/confirm',{method:'POST',headers:{origin:'http://127.0.0.1:3100','content-type':'application/x-www-form-urlencoded'},body:'altstack_session=fixture-human'});approved=true;
 }
 if(response.status>=300&&response.status<400&&response.headers.has('location')){target=new URL(response.headers.get('location'),target).href;continue;}
 assert.equal(response.status,200,(await response.text()).replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(-2500));break;
}
assert.ok(approved,'Nextcloud must authenticate through AltStack');
response=await request('http://127.0.0.1/ocs/v2.php/cloud/user?format=json',{headers:{'OCS-APIRequest':'true'}});
const body=await response.json();assert.equal(response.status,200,JSON.stringify(body));assert.equal(body.ocs.data.id,'ast_ad95d5fa651ba86d8923fe1238d24a4f1988a752');
console.log('Nextcloud authorization-code login established the correct AltStack account session.');

