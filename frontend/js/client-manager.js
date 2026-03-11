async function loadClients(){

try{

const response = await fetch("http://localhost:3001/api/clients")

const clients = await response.json()

const dropdown = document.getElementById("clientSelect")

dropdown.innerHTML = ""

clients.forEach(client => {

const option = document.createElement("option")

option.value = client.id
option.textContent = client.name

dropdown.appendChild(option)

})

}catch(err){

console.error("Client load error",err)

}

}



async function addClient(){

const nameInput = document.getElementById("newClientName")

const name = nameInput.value.trim()

if(!name){
alert("Enter a client name")
return
}

try{

await fetch("http://localhost:3001/api/clients",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name:name
})

})

nameInput.value=""

loadClients()

}catch(err){

console.error("Add client error",err)

}

}



window.addEventListener("DOMContentLoaded",()=>{

loadClients()

})