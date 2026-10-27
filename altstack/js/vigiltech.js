// SPDX-License-Identifier: AGPL-3.0-or-later
// Nextcloud 33 stores appearance on BODY, and can change it without a page reload.
(()=>{
 const init=()=>{
  const body=document.body,root=document.documentElement;
  const sync=()=>{
   const themes=(body.getAttribute('data-themes')||'').split(/[,\s]+/);
   if(themes.some(t=>t.startsWith('dark')))root.setAttribute('data-theme','dark');
   else if(themes.some(t=>t.startsWith('light')))root.setAttribute('data-theme','light');
   else root.removeAttribute('data-theme');
  };
  sync();new MutationObserver(sync).observe(body,{attributes:true,attributeFilter:['data-themes']});
  // Visible label only; the existing OIDC provider identifier remains compatible.
  for(const a of document.querySelectorAll('a[href*="/user_oidc/login/"]'))if(a.textContent.includes('AltStack')){
   for(const n of a.childNodes)if(n.nodeType===3)n.textContent=n.textContent.replace(/\bAltStack\b/g,'VigilTech');
   for(const n of a.querySelectorAll('span'))if(n.childElementCount===0)n.textContent=n.textContent.replace(/\bAltStack\b/g,'VigilTech');
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
