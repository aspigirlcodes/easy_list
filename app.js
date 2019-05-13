


var container = document.getElementById('container')
var container2 = document.getElementById('container2')
container.style.display = "flex"
container2.style.display = "none"
getList(function(list){
  for(var object of list){
    display_item(object, true)
  }
})

document.getElementById("new-item-text").onchange = add_item
document.getElementById("save-button").onclick = save_list
document.getElementById("edit-button").onclick = edit_list

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
  container2.getElementsByClassName("items")[0].append(div)
}


function getDiv(target){
  if (target.classList.contains("item")) 
    return target
  else
    return target.parentNode
}

function remove_item(ev){
  var div = getDiv(ev.target)
  deleteFromObjectStore("list", parseInt(div.dataset.itemId))
  div.parentNode.removeChild(div);
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
  var things = container.getElementsByClassName("item")
  while (things.length > 0){
    things[0].remove()
  }
  getList(function(list){
    for(var object of list){
      display_item(object)
    }
  })
  container.style.display = "flex"
  container2.style.display = "none"
}
