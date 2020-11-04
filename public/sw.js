var cacheName = 'Statics';
var broadcast = new BroadcastChannel('count-channel');

self.addEventListener('install', event => {  
  event.waitUntil(
    caches.open(cacheName)                  
    .then(cache => cache.addAll([//暫存到本機的檔案
      './',
      './js/PWA.js',
      //'./showPost.html',
      './js/index.js',
      './css/index.css',
      './img/logo144.png',
    ]))
  );  
});
self.addEventListener('fetch', function (event) {//攔截 網頁載入時Request
    //console.log('FetchIng');    
    event.respondWith(
        caches.match(event.request).then(function (response) {            
            /**/
            if (response) {//成功載入該項檔案 (有網路時/找caches中紀錄的檔案載入 使用)(造成 caches中有檔案更新要清除資料才能更新)
                //console.log(navigator.onLine);
                if(navigator.onLine){
                    return fetch(event.request).then((response) => {
                        return caches.open(cacheName).then((cache) => {
                          cache.put(event.request.url, response.clone());
                          return response;
                        }).catch((e)=>{
                            console.log(e);
                            return response;
                        })
                    })
                }
                return response;
            }
            return fetch(event.request).catch(function (e) {              
              //broadcast.postMessage({ msg:'沒有網路連線,請成功連結網路再使用!'});
              console.log('No InterNet');
              broadcast.postMessage({ msg:false});            
            });         
        })
    );
});
/*
if(navigator.onLine){//有網路時候
        caches.keys().then(function(cacheNames) {//Delete Caches Before Caches.addAll when connect network
            cacheNames.forEach(function(cacheName) {                    
                caches.delete(cacheName);
            });
        });
        console.log(`Delete Old Caches Done`);
    } 
 */
/*加入所有 fetch檔案 到Caches
return fetch(event.request).then((response) => {
              return caches.open(cacheName).then((cache) => {              
                // console.log(cache);
                // cache.put(event.request.url, response.clone());
                console.log('Add New::'+event.request.url);
                return response;
              }).catch(function (e) {              
                  //broadcast.postMessage({ msg:'沒有網路連線,請成功連結網路再使用!'});
                  console.log('No InterNet');
                  broadcast.postMessage({ msg:false});              
              });
          });
*/