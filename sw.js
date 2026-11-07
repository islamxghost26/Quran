const V='quran-v9',KEEP=['quran-data','quran-audio'],SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-48.png','hero.jpg','night.jpg','taf.jpg','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&!KEEP.includes(x)).map(x=>caches.delete(x)))));self.clients.claim()});
async function ranged(m,r){const b=await m.arrayBuffer(),h=r.headers.get('range'),T='audio/mpeg';
  if(!h)return new Response(b,{status:200,headers:{'Content-Type':T,'Content-Length':b.byteLength,'Accept-Ranges':'bytes'}});
  const x=/bytes=(\d*)-(\d*)/.exec(h)||[],s=+x[1]||0,e=Math.min(x[2]?+x[2]:b.byteLength-1,b.byteLength-1);
  return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':T,'Content-Range':`bytes ${s}-${e}/${b.byteLength}`,'Content-Length':e-s+1,'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
  if(/(islamic\.network|everyayah\.com)$/.test(u.hostname)){ // audio: use downloaded copy when present
    e.respondWith((async()=>{const m=await (await caches.open('quran-audio')).match(u.href);return m?ranged(m,r):fetch(r)})());return}
  if(r.headers.has('range')||u.pathname.endsWith('version.json'))return;
  if(u.hostname==='api.alquran.cloud'){
    if(/\/surah$|\/juz\/\d+\/quran-uthmani$/.test(u.pathname))return; // stored by the app in quran-data
    e.respondWith(fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x}).catch(()=>caches.match(r)));return}
  if(r.mode==='navigate'){ // app shell: cache first, refresh in background
    e.respondWith(caches.match('index.html').then(m=>{const n=fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put('index.html',c))}return x}).catch(()=>m);return m||n}));return}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)){
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{const n=fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put(r,c));return x}).catch(()=>m);return m||n}))}
});
