// SPDX-License-Identifier: AGPL-3.0-or-later
// 1. Follow Nextcloud's chosen theme: the VigilTech tokens switch on data-theme, and the system setting is left to the media query.
// 2. Visible provider label only; the existing OIDC provider identifier ("AltStack") remains compatible.
(()=>{
 const themes=(document.documentElement.getAttribute('data-themes')||'').split(',');
 if(themes.some(t=>t.startsWith('dark')))document.documentElement.setAttribute('data-theme','dark');
 else if(themes.some(t=>t.startsWith('light')))document.documentElement.setAttribute('data-theme','light');
 const run=()=>{for(const a of document.querySelectorAll('a[href*="/user_oidc/login/"]')){if(a.textContent.includes('AltStack')){for(const n of a.childNodes)if(n.nodeType===3)n.textContent=n.textContent.replace(/\bAltStack\b/g,'VigilTech');for(const n of a.querySelectorAll('span'))if(n.childElementCount===0)n.textContent=n.textContent.replace(/\bAltStack\b/g,'VigilTech');}}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
