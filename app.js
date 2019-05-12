

var latest_item = `
  <input type="checkbox" class="checkbox-input" id="new-item-check">
  <input type="text" class="checkbox-label" id="new-item-text"/>

`
var container = document.getElementById('container')
var latest_element = document.createElement("div")
latest_element.innerHTML = latest_item
latest_element.classList.add("checkbox")
container.append(latest_element)
getList(function(list){
  for(var object of list){
    display_item(object)
  }
})


document.getElementById("new-item-text").onchange = add_item

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


function display_item(object){
  if (object.selected)
    var checked = "checked"
  else 
    var checked = ""
  var item = `
    <input type="checkbox" class="checkbox-input" ${checked} id="item-check-${object.id}">
    <div class="checkbox-label" contenteditable="true" id="item-text-${object.id}">${object.text}</div>
  `
  var container = document.getElementById('container')
  var div = document.createElement("div")
  div.innerHTML = item
  div.classList.add("item")
  div.setAttribute("data-item-id", object.id)
  var mc = new Hammer(div)
  mc.on("swiperight", remove_item)
  container.insertBefore(div, latest_element)
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
