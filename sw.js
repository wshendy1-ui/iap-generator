/* IAP Generator — offline support.
   The app is one HTML file, so offline support is a small cache: the page, its
   manifest and its icons. Pages are served from the cache first, so the app opens
   instantly with or without a connection. The page asks this worker to check for a
   newer version in the background; when one arrives it is stored and the page offers
   "Update ready — tap to reload", so nothing changes under someone mid-IAP. */
const CACHE='iap-generator-offline-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('iap-generator-offline-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

const versionOf=t=>{const m=/const APP_VERSION='([^']+)'/.exec(t||'');return m?m[1]:null;};
const pageKey=u=>{const x=new URL(u);x.search='';x.hash='';return x.href;};

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const key=req.mode==='navigate'?pageKey(req.url):req;
    const hit=await cache.match(key,{ignoreSearch:true})||(req.mode==='navigate'?await cache.match('./index.html'):null);
    if(hit) return hit;
    try{
      const res=await fetch(req);
      if(res&&res.ok&&res.type==='basic') cache.put(key,res.clone()).catch(()=>{});
      return res;
    }catch(err){
      return new Response('Offline, and this file has not been saved for offline use yet.',{status:503,headers:{'Content-Type':'text/plain'}});
    }
  })());
});

self.addEventListener('message',e=>{
  const d=e.data||{}, port=e.ports&&e.ports[0];
  const reply=m=>{ try{ port?port.postMessage(m):e.source&&e.source.postMessage(m); }catch(_){} };
  if(d.type==='cache-page'&&d.url){
    // make sure the address the app was opened from is stored, whatever its file name
    e.waitUntil(caches.open(CACHE).then(async c=>{
      const k=pageKey(d.url);
      if(!(await c.match(k))) await c.add(new Request(k,{cache:'reload'})).catch(()=>{});
      reply({type:'cached'});
    }));
  }
  if(d.type==='check-update'&&d.url){
    e.waitUntil((async()=>{
      const c=await caches.open(CACHE), k=pageKey(d.url);
      let fresh;
      try{ fresh=await fetch(k,{cache:'no-cache'}); }catch(_){ reply({type:'offline'}); return; }
      if(!fresh.ok){ reply({type:'offline'}); return; }
      const text=await fresh.clone().text();
      const have=await c.match(k), haveV=have?versionOf(await have.text()):null, newV=versionOf(text);
      if(newV&&newV!==d.running){
        // the server has a different version from the one running: store it if we
        // have not already, and offer it (also covers an update stored earlier but
        // not yet reloaded into)
        if(newV!==haveV) await c.put(k,fresh);
        if(k.endsWith('/')) await c.put(new URL('index.html',k).href,new Response(text,{headers:{'Content-Type':'text/html; charset=utf-8'}}));
        reply({type:'update-ready',version:newV});
      }else{
        if(!have) await c.put(k,fresh);
        reply({type:'up-to-date',version:newV||haveV});
      }
    })());
  }
});
