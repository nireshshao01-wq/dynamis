async function loadHeader(){

    const response = await fetch("/components/header.html")

    const html = await response.text()

    document.getElementById("header-placeholder").innerHTML = html

}

document.addEventListener("DOMContentLoaded", loadHeader)