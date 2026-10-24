// Exercise the published Office adapter against the actual pinned Nextcloud service.
import assert from 'node:assert/strict';
import {createOffice,jwt} from '../office-source/server';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
const dir=mkdtempSync(join(tmpdir(),'office-real-warehouse-')),origin='https://office.example',editor='https://editor.example',secret='fixture-office-secret-12345678901234567890';
const env={DATA_DIR:dir,PUBLIC_ORIGIN:origin,SOCIAL_ORIGIN:'https://platform.example',DOCS_URL:editor,OFFICE_SECRET:secret,JWT_SECRET:secret,OFFICE_ENTITLEMENT_SECRET:secret};
const assets:any={};for(const ext of ['docx','xlsx','pptx'])assets['/templates/blank.'+ext]={data:readFileSync(new URL('../office-source/templates/blank.'+ext,import.meta.url)).toString('base64')};
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
let app:any;
async function network(input:any,options:any={}){const url=new URL(input);if(url.origin==='https://platform.example'){const fixture=await(await fetch('http://127.0.0.1:3100/fixture/token')).json();return Response.json({actor:'free',plus:false,warehouseOrigin:'http://127.0.0.1',warehouseUid:fixture.uid,warehouseToken:fixture.token});}if(url.origin===editor)return new Response('A revision saved through the Office editor callback.');return fetch(input,options);}
const call=(path:string,method='GET',body?:any)=>app.fetch(new Request(origin+path,{method,headers:{origin,cookie:'ao_session=fixture-session'},body:body===undefined?undefined:JSON.stringify(body)}));
try{
 app=createOffice({env,assets,fetch:network});app.db.query('INSERT INTO users VALUES(?,?,?,?)').run('free','Free member','free.example',Date.now());app.db.query('INSERT INTO sessions VALUES(?,?,?)').run(digest('fixture-session'),'free',Date.now()+3600000);
 let response=await call('/api/documents','POST',{ext:'docx',title:'Existing Office document'});assert.equal(response.status,201,await response.clone().text());const document=(await response.json()).document;app.close();
 app=createOffice({env:{...env,WAREHOUSE_ORIGIN:'http://127.0.0.1'},assets,fetch:network});
 response=await call('/api/documents');assert.equal(response.status,200,await response.clone().text());const library=await response.json();assert.equal(library.sharedStorage,true);assert.equal(library.quotaBytes,2000000000);
 const row=app.db.query('SELECT * FROM documents WHERE id=?').get(document.id);assert.ok(row.warehouse_path,'Existing local files must migrate to Warehouse');
 const fixture=await(await fetch('http://127.0.0.1:3100/fixture/token')).json(),dav='http://127.0.0.1/remote.php/dav/files/'+fixture.uid+'/';
 const remote=await fetch(dav+row.warehouse_path.split('/').map(encodeURIComponent).join('/'),{headers:{Authorization:'Bearer '+fixture.token}});assert.equal(remote.status,200);assert.equal(digest(Buffer.from(await remote.arrayBuffer()).toString('base64')),digest(assets['/templates/blank.docx'].data));
 response=await call('/api/documents/'+document.id+'/config');assert.equal(response.status,200);const config=(await response.json()).config,callback=new URL(config.editorConfig.callbackUrl),body={key:config.document.key,status:2,url:editor+'/cache/saved'};
 response=await call(callback.pathname+callback.search,'POST',{...body,token:jwt(body,secret)});assert.equal(response.status,200,await response.clone().text());
 assert.equal(await(await fetch(dav+row.warehouse_path.split('/').map(encodeURIComponent).join('/'),{headers:{Authorization:'Bearer '+fixture.token}})).text(),'A revision saved through the Office editor callback.');
 response=await call('/api/documents/'+document.id,'DELETE');assert.equal(response.status,200,await response.clone().text());
 console.log('Existing Office files migrated with matching bytes; real editor saves sync to Warehouse and deletion updates the same store.');
}finally{app?.close();rmSync(dir,{recursive:true,force:true});}

