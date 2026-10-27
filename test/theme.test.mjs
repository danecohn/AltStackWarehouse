// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';
const source=readFileSync('altstack/js/vigiltech.js','utf8');
function page(initial,{loading=false}={}){
 const listeners=[];
 class Element{attrs=new Map();observers=[];getAttribute(k){return this.attrs.get(k)??null}setAttribute(k,v){this.attrs.set(k,v);for(const o of this.observers)if(o.options.attributeFilter.includes(k))o.callback()}removeAttribute(k){this.attrs.delete(k)}}
 const root=new Element(),body=new Element();body.setAttribute('data-themes',initial);const document={body,documentElement:root,readyState:loading?'loading':'complete',querySelectorAll:()=>[],addEventListener:(event,callback)=>listeners.push(callback)};
 class Observer{constructor(callback){this.callback=callback}observe(target,options){this.options=options;target.observers.push(this)}}
 runInNewContext(source,{document,MutationObserver:Observer});return{root,body,ready:()=>listeners.forEach(fn=>fn())};
}
test('real Nextcloud body appearance initializes tokens, follows changes, and restores System',()=>{const p=page('dark');assert.equal(p.root.getAttribute('data-theme'),'dark');p.body.setAttribute('data-themes','light');assert.equal(p.root.getAttribute('data-theme'),'light');p.body.setAttribute('data-themes','dark-highcontrast,opendyslexic');assert.equal(p.root.getAttribute('data-theme'),'dark');p.body.setAttribute('data-themes','');assert.equal(p.root.getAttribute('data-theme'),null)});
test('initialization waits for the body when the document is still loading',()=>{const p=page('light',{loading:true});assert.equal(p.root.getAttribute('data-theme'),null);p.ready();assert.equal(p.root.getAttribute('data-theme'),'light')});
