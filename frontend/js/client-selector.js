async function loadClientSelector(){

const res = await fetch("/api/clients")
const clients = await res.json()

const selector = document.getElementById("clientSelector")

if(!selector) return

selector.innerHTML=""

clients.forEach(c=>{

const opt=document.createElement("option")
opt.value=c.id
opt.textContent=c.name

selector.appendChild(opt)

})

const saved=localStorage.getItem("dynamis_client")

if(saved){
selector.value=saved
}

selector.addEventListener("change",()=>{

localStorage.setItem("dynamis_client",selector.value)

location.reload()

})

}

document.addEventListener("DOMContentLoaded",loadClientSelector)