var socket = io()
var adressList
function displayAdress(list){
    while(document.getElementById("ul").firstChild){
        document.getElementById("ul").removeChild(document.getElementById("ul").firstChild)
    }
    var htmlString = list.map(object => {
        return `
            <div class="adressWrapper" onclick="redir('/info.html?id=${object.id}')">
                <li>
                    <label>Adresse:</label>
                    <p>${object.adress}</p>
                    <label>Hus Eier:</label>
                    <p>${object.owner}</p>
                </li>
            </div>
        `
    }).join("")
    document.getElementById("ul").innerHTML = htmlString
}
(function(){
    socket.emit("getAdresses")
})()
function redir(adress){
    window.location.href=adress
}
socket.on("adresses", (list) => {
    adressList = list
    displayAdress(list)
})
document.getElementById("search").addEventListener("keyup", (e) => {
    var validAdresses = []
    adressList.forEach(adress => {
        if(adress.adress.toLowerCase().includes(e.target.value.toLowerCase()) || adress.owner.toLowerCase().includes(e.target.value.toLowerCase())){
            validAdresses.push(adress)
        }
    })
    displayAdress(validAdresses)
})