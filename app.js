

var scrollParam = 0
var container = document.getElementById('container')
var container2 = document.getElementById('container2')
container.style.display = "flex"
container2.style.display = "none"
getList(function(list){
  for(var object of list){
    display_item(object, true)
  }
})

mc = new Hammer(document.body)
mc.on("pan", redirect)

document.getElementById("new-item-text").onchange = add_item
document.getElementById("save-button").onclick = save_list
document.getElementById("edit-button").onclick = edit_list
document.getElementById("reload1").onclick = clear_selected
document.getElementById("reload2").onclick = clear_done

function add_item(){
  var text = document.getElementById('new-item-text')
  var selected = document.getElementById('new-item-check')
  var object = {'text': text.value, 'selected': selected.checked, 'done': false}
  addToObjectStore("list", object, function(id){
    object.id = id 
    display_item(object)
  })
  text.value = ""
  selected.checked = false
  
}

function display_item(object, is_new){
  if (object.selected && !is_new)
    var checked = "checked"
  else 
    var checked = ""
  var item = `
    <input type="checkbox" class="checkbox-input" ${checked} id="item-check-${object.id}">
    <div class="checkbox-label" contenteditable="true" id="item-text-${object.id}">${object.text}</div>
  `
  var div = document.createElement("div")
  div.innerHTML = item
  div.classList.add("item")
  div.setAttribute("data-item-id", object.id)
  if(is_new)
    div.setAttribute("data-item-done", false)
  else 
    div.setAttribute("data-item-done", object.done)
  var mc = new Hammer(div)
  mc.on("swiperight", remove_item)
  mc.on("tap", toggle_select)
  container.getElementsByClassName("items")[0].insertBefore(div, document.getElementById("new-item"))
}

function display_selected_item(object){
  if (object.done)
    var done = "done"
  else 
    var done = ""
  var item = `
    <div class="item-text ${done}" id="item-text-${object.id}">${object.text}</div>
  `
  var div = document.createElement("div")
  div.innerHTML = item
  div.classList.add("item")
  div.setAttribute("data-item-id", object.id)
  var mc = new Hammer(div)
  mc.on("tap", mark_done)
  mc.on("press", add_sort_event)
  mc.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL , enable: canEnable})
  mc.on("pan", sort)
  mc.on("pressup", stop_sort)
  container2.getElementsByClassName("items")[0].append(div)
}

function canEnable(rec, input){
  var div = getDiv(rec.manager.element)
  return div.classList.contains("panable")
}

function add_sort_event(ev){
  var div = getDiv(ev.target)
  div.style.marginLeft = "5px"
  div.style.marginTop = "5px"
  div.style.backgroundColor = "#333333"
  div.style.zIndex = 100
  div.classList.add('panable')
}
function sort(ev){
  if(ev.srcEvent.type === 'pointercancel') return //chrome hack https://github.com/hammerjs/hammer.js/issues/1050
  ev.preventDefault() // prevent scrolling in firefox
  var div = getDiv(ev.target)
  div.style.transform = 'translateY(' + (ev.deltaY + scrollParam) + 'px)' 
  var scrollMaxY = window.scrollMaxY || (Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                     document.documentElement.clientHeight, document.documentElement.scrollHeight, 
                     document.documentElement.offsetHeight ) - window.innerHeight)
  if (ev.center.y < 25 && window.scrollY > 0){
    window.scrollBy(0, -5)
    scrollParam -= 5
  } else if (ev.center.y > (window.innerHeight - 25) && window.scrollY < scrollMaxY){
    window.scrollBy(0, 5)
    scrollParam += 5
  }
  if(ev.isFinal) {
    div.style = ""
    div.classList.remove('panable')
    scrollParam = 0
    var targetDiv = getDiv(document.elementFromPoint(ev.center.x, ev.center.y))
    if (targetDiv.classList.contains("item"))
      div.parentNode.insertBefore(div, targetDiv)
    else 
      container2.getElementsByClassName("items")[0].appendChild(div)  
  } 
}

function stop_sort(ev){
  if(ev.srcEvent.type === 'pointercancel') return //chrome hack https://github.com/hammerjs/hammer.js/issues/1050
  var div = getDiv(ev.target)
  if(ev.isFinal) {
    div.style = ""
    div.classList.remove('panable')
    scrollParam = 0
  }
}

function getDiv(target){
  if (target.classList.contains("item")) 
    return target
  else
    return target.parentNode
}

function remove_item(ev){
  if (!(ev.center.y < window.innerHeight * 2 / 3 && ev.center.y > window.innerHeight / 3 && ev.center.x - ev.deltaX < window.innerWidth / 4)){
    var div = getDiv(ev.target)
    deleteFromObjectStore("list", parseInt(div.dataset.itemId))
    div.parentNode.removeChild(div);
  }
}

function toggle_select(ev){
  if (!ev.target.classList.contains("checkbox-input")){
    var div = getDiv(ev.target)
    var id = div.dataset.itemId
    var select = document.getElementById('item-check-' + id)
    select.checked = !select.checked
  }
}

function mark_done(ev){
  var div = getDiv(ev.target)
  var id = div.dataset.itemId
  var text = div.children[0]
  var object = {"text": text.innerHTML, "selected": true, "done": !text.classList.contains("done")}
  updateInObjectStore("list", parseInt(id), object)
  text.classList.toggle("done")
}

function save_list(){
  var items = container.getElementsByClassName("item")
  for(var item of items){
    var id = item.dataset.itemId
    var done = item.dataset.itemDone === "true"
    var selected = document.getElementById("item-check-" + id)
    var text = document.getElementById("item-text-" + id)
    var object = {'text': text.innerHTML, 'selected': selected.checked, 'done': done}
    updateInObjectStore("list", parseInt(id), object)
  }
  getSelectedList(function(list){
    container.style.display = "none"
    container2.style.display = "flex"
    container2.getElementsByClassName("items")[0].innerHTML = ""
    for(var item of list){
      display_selected_item(item)
    }
  })
  
}

function edit_list(){
  var items = container.getElementsByClassName("item")
  while (items.length > 0){
    items[0].remove()
  }
  getList(function(list){
    for(var object of list){
      display_item(object)
    }
  })
  container.style.display = "flex"
  container2.style.display = "none"
}

function clear_selected(){
  var items = container.getElementsByClassName("checkbox-input")
  for(var item of items){
    item.checked = false
  }
}

function clear_done(){
  var items = container2.getElementsByClassName("done")
  while(items.length > 0){
    var id = items[0].parentNode.dataset.itemId
    var object = {"text": items[0].innerHTML, "selected": true, "done": false}
    updateInObjectStore("list", parseInt(id), object)
    items[0].classList.remove("done")
  }
  
}

function redirect(ev){
  if (ev.center.y < window.innerHeight * 2 / 3 && ev.center.y > window.innerHeight / 3){
    if (ev.center.x - ev.deltaX < window.innerWidth / 4){
      document.body.style.transform = 'translateX(' + ev.deltaX + 'px)'
    }
    if (ev.isFinal) {
      if (ev.center.x > window.innerWidth * 3 / 4 && ev.deltaX > window.innerWidth * 3 / 4){
        window.location.href = "https://aspigirlcodes.github.io/thought_sort"
      } else {
        document.body.style.transform =  ''
      }
    }
  }
  
  
} 
