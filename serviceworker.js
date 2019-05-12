var CACHE_NAME = "list_cache_v1"
var immutableRequests = [
  //css
  //"aria.modal.css",
  //js
  //"aria.modal.min.js",
  "hammer.min.js",
]
var mutableRequests = [
  "index.html",
  "style.css",
  "app.js",
  "db_interactions.js",
]

var CACHED_URLS = immutableRequests + mutableRequests


self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      var newImmutableRequests = []
      return Promise.all(
        immutableRequests.map(function(url){
          return caches.match(url).then(function(response){
            if (response) {
              return cache.put(url, response)
            } else {
              newImmutableRequests.push(url)
              return Promise.resolve()
            }
          })
        })
      ).then(function(){
        return cache.addAll(newImmutableRequests.concat(mutableRequests))
      }) 
    })
  )
})

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.map(function(cacheName){
          if (CACHE_NAME !== cacheName && cacheName.startsWith("list_cache")){
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener("fetch", function(event){
  var requestURL = new URL(event.request.url)
  // at ghpages we are not at root but at /thought_sort
  // because of this also we made all the paths in CACHED_URLS relative without /
  // so we have to cut the / of the pathname of the url
  if(requestURL.pathname === "/thought_sort/" || requestURL.pathname === "/")
    var cacheMatch = "index.html"
  else if (CACHED_URLS.includes(requestURL.pathname.slice(1))) 
    var cacheMatch = event.request
    
  if (typeof cacheMatch !== 'undefined'){
    // cache, falling back to network with frequent updates
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache){
        return cache.match(cacheMatch).then(function(cachedResponse){
          var fetchPromise = fetch(event.request).then(function(networkResponse){
            cache.put(cacheMatch, networkResponse.clone())
            return networkResponse
          })
          return cachedResponse || fetchPromise
        })
      })
    )
  } 
  //other requests will pass through untouched 
  
})  
