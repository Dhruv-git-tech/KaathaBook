// ═══════════════════════════════════════════════
// KaathaBook Service Worker
// Enables offline support and caching
// ═══════════════════════════════════════════════

const CACHE_NAME='kaathabook-v1';
const ASSETS_TO_CACHE=[
  '/',
  '/kaathabook.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js'
];

// Install event - cache assets
self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll(ASSETS_TO_CACHE).catch(()=>{
        // Try to cache what we can if some fail
        ASSETS_TO_CACHE.forEach(url=>{
          cache.add(url).catch(()=>{});
        });
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(cacheNames=>{
      return Promise.all(
        cacheNames.map(cacheName=>{
          if(cacheName!==CACHE_NAME){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch',event=>{
  const{request}=event;
  const url=new URL(request.url);
  
  // Skip non-GET requests
  if(request.method!=='GET')return;
  
  // Skip external APIs (except critical ones)
  if(url.origin!==self.location.origin){
    // Only cache critical CDN resources
    if(url.hostname.includes('googleapis.com')||url.hostname.includes('cdnjs.com')||url.hostname.includes('unpkg.com')){
      event.respondWith(
        caches.match(request).then(response=>{
          return response||fetch(request).then(response=>{
            if(!response||response.status!==200||response.type==='error'){
              return response;
            }
            const responseToCache=response.clone();
            caches.open(CACHE_NAME).then(cache=>{
              cache.put(request,responseToCache);
            });
            return response;
          }).catch(()=>{
            return caches.match(request);
          });
        })
      );
    }
    return;
  }
  
  // Network first strategy for local assets
  event.respondWith(
    fetch(request).then(response=>{
      if(!response||response.status!==200||response.type==='error'){
        return caches.match(request);
      }
      const responseToCache=response.clone();
      caches.open(CACHE_NAME).then(cache=>{
        cache.put(request,responseToCache);
      });
      return response;
    }).catch(()=>{
      return caches.match(request).then(response=>{
        return response||new Response('Offline - Resource not cached',{status:503,statusText:'Service Unavailable'});
      });
    })
  );
});

// Background sync for offline transactions
self.addEventListener('sync',event=>{
  if(event.tag==='sync-transactions'){
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions(){
  try{
    const db=await openIndexedDB();
    const pendingTxs=await getPendingTransactions(db);
    if(pendingTxs.length>0){
      console.log(`📤 Syncing ${pendingTxs.length} pending transactions...`);
    }
  }catch(e){
    console.log('Sync error:',e);
  }
}

function openIndexedDB(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('KaathaBook',1);
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>resolve(request.result);
    request.onupgradeneeded=event=>{
      const db=event.target.result;
      if(!db.objectStoreNames.contains('pendingTransactions')){
        db.createObjectStore('pendingTransactions',{keyPath:'id'});
      }
    };
  });
}

function getPendingTransactions(db){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('pendingTransactions','readonly');
    const store=tx.objectStore('pendingTransactions');
    const request=store.getAll();
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>resolve(request.result);
  });
}

console.log('✅ KaathaBook Service Worker loaded');
