var db_version = 3

var openDatabase = function(){
  if (!window.indexedDB) {
    return false
  }
  var request = window.indexedDB.open("list-db", db_version)

  request.onerror = function(event) {
    console.log("Database error: ", event.target.error)
  }

  request.onupgradeneeded = function(event) {
    var db = event.target.result
    if (!db.objectStoreNames.contains("list")) {
      db.createObjectStore("list",
        {autoIncrement: true}
      )
    }
    if (!db.objectStoreNames.contains("settings")) {
      db.createObjectStore("settings",
        {keyPath: "key"}
      )
    }
  }
  return request
}

var openObjectStore = function(storeName, successCallback, transactionMode) {
  var db = openDatabase()
  if (!db) {
    return false
  }
  db.onsuccess = function(event) {
    var db = event.target.result
    var objectStore = db
      .transaction(storeName, transactionMode)
      .objectStore(storeName)
    successCallback(objectStore)
  }
  return true
}

var getSetting = function(key, successCallback){
  var texts = []
  var db = openObjectStore("settings", function(objectStore){
    objectStore.get(key).onsuccess = function(event){
      object = event.target.result
      successCallback(object)
    }
  })
}

var getList = function(successCallback){
  var texts = []
  var db = openObjectStore("list", function(objectStore){
    objectStore.openCursor().onsuccess = function(event){
      var cursor = event.target.result
      if (cursor) {
        var text = cursor.value
        text['id'] = cursor.key
        texts.push(text)
        cursor.continue()
      } else {
        successCallback(texts)
      }
    }
  })
}

var getSelectedList = function(successCallback){
  var texts = []
  var db = openObjectStore("list", function(objectStore){
    objectStore.openCursor().onsuccess = function(event){
      var cursor = event.target.result
      if (cursor) {
        var text = cursor.value
        if (text.selected) {
          text['id'] = cursor.key
          texts.push(text)
        }
        cursor.continue()
      } else {
        successCallback(texts)
      }
    }
  })
}

var addToObjectStore = function(storeName, object, successCallback){
  openObjectStore(storeName, function(store) {
    store.add(object).onsuccess = function(event){
      var id = event.target.result
      if(successCallback){
        successCallback(id)
      }
    }
  }, "readwrite")
  
}

var updateInObjectStore = function(storeName, id, object, successCallback){
  openObjectStore(storeName, function(objectStore){
    objectStore.openCursor().onsuccess = function(event){
      var cursor = event.target.result
      if (!cursor) {return}
      if (cursor.key === id) {
        cursor.update(object).onsuccess = function(){
          if (successCallback){
            successCallback()
          }
        }
        return
      }
      cursor.continue()
    }
  }, "readwrite")
}

var deleteFromObjectStore = function (storeName, id){
  openObjectStore(storeName, function(store){
    store.delete(id)
  }, "readwrite")
}
