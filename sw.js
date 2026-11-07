const V='quran-v6',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-48.png','hero.jpg','night.jpg','taf.jpg','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);if(r.method!=='GET'||r.headers.has('range'))return;
  if(u.hostname==='api.alquran.cloud'){ // network-first, cached fallback
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put(r,c));return x}).catch(()=>caches.match(r)));return}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)){ // stale-while-revalidate
    e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put(r,c));return x}).catch(()=>m);return m||n}))}
});
