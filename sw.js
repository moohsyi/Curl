const CACHE='curl-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png',
 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const isApp=u.origin===location.origin, isLib=u.hostname==='cdn.jsdelivr.net';
  if(!isApp&&!isLib)return; // let Supabase API calls go straight to network
  e.respondWith(
    isLib ? caches.match(r).then(h=>h||fetch(r).then(n=>{const c=n.clone();caches.open(CACHE).then(x=>x.put(r,c));return n}))
          : fetch(r).then(n=>{const c=n.clone();caches.open(CACHE).then(x=>x.put(r,c));return n}).catch(()=>caches.match(r).then(h=>h||caches.match('./index.html')))
  );
});
