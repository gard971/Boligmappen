var socket = io()
var ID;
var urlParams;
(function(){
    var queryString = window.location.search
    urlParams = new URLSearchParams(queryString)
    if(!urlParams.get("id")){
        alert("noe gikk galt. Sender deg tilbake til hovedsiden")
    }
    else if(localStorage.getItem("username") && localStorage.getItem("key")){
        socket.emit("getAdress", localStorage.getItem("username"), localStorage.getItem("key"), urlParams.get("id"))
    }
    else  if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        socket.emit("getAdress", sessionStorage.getItem("username"), sessionStorage.getItem("key"), urlParams.get("id"))
    }
    else if(urlParams.get("id")){
        window.location.href=`login.html?redirect=info.html?id=${urlParams.get("id")}`
    }
    else{
        window.location.href="/"
    }
})()
function windowHandle(ElementID, visible){
    document.getElementById(ElementID).hidden = !visible
}
socket.on("adress", (adress, isOwner) => {
            if(!isOwner){
                document.getElementById("newMemberForm").hidden = true
            }
            document.getElementById("uploadForm").action = `/upload?id=${adress.id}`
            console.log(document.getElementById("uploadForm").action)
            var div = document.getElementById("infoContainer")
            var downloadsDiv = document.getElementById("downloadsContainer")
            var header = document.createElement("h1")
            var First = adress.owner.substring(0, 1).toUpperCase()
            First += adress.owner.substring(1)
            adress.owner = First
            if(First.indexOf(" ") != -1){
                var nameArray = First.split(" ")
                var lastLetter = nameArray[1].substring(0, 1).toUpperCase()
                nameArray[1] = lastLetter + nameArray[1].substring(1)
                console.log(nameArray)
                adress.owner = nameArray.join(" ")
            }
            header.innerHTML = adress.owner
            div.appendChild(header)
            var undertitle = document.createElement("h3")
            undertitle.innerHTML = adress.adress
            div.appendChild(undertitle)
            adress.info.forEach(element => {
                var p = document.createElement("h5")
                p.innerHTML = element.name + "<img src='media/arrow.png' class='downloadArrow'>"
                p.className = "downlodable"
                p.onclick = function(){
                    window.location.href=`/download?id=${element.id}`
                }
                downloadsDiv.appendChild(p)
            })
            var id = 0;
            adress.userAccess.forEach(accessElem => {
                var removeUserCont = document.createElement("div")
                removeUserCont.id = id
                id++
                var p = document.createElement("p")
                p.classList.add("pHolder")
                p.innerHTML = accessElem.username
                removeUserCont.appendChild(p)
                var img = document.createElement("img")
                img.src = "media/close.png"
                img.classList.add("userDelPNG")
                removeUserCont.appendChild(img)
                document.getElementById("removeUserCont").appendChild(removeUserCont)
                removeUserCont.onclick = function(){
                    removeUser(accessElem.username, adress.adress, id)
                }
            })    
    })
document.getElementById("fileupload").addEventListener("change", e => {
    var htmlString = ""
    document.getElementById("uploadlabel").innerHTML = `fil ${e.srcElement.files[0].name} lastet opp`
})
document.getElementById("newMemberForm").addEventListener("submit", e => {
    e.preventDefault();
    var username
    var key
    if(localStorage.getItem("username") && localStorage.getItem("key")){
        username = localStorage.getItem("username") 
        key = localStorage.getItem("key") 
    }
    else if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        username = sessionStorage.getItem("username") 
        key = sessionStorage.getItem("key") 
    }
    else{
        window.location.href=`login.html?redirect=info.html?id=${urlParams.get("id")}`
        return false;
    }
    if(document.getElementById("timelimitCheck").checked){
        var array = [0, document.getElementById("timeInput").value]
        socket.emit("AddUser", username, key, urlParams.get("id"), document.getElementById("memberToAdd").value, array)
    }
    else{
        socket.emit("AddUser", username, key, urlParams.get("id"), document.getElementById("memberToAdd").value)
    }
})
function timelimit(checked){
    document.getElementById("timeCont").hidden =! checked
    document.getElementById("timeInput").required = checked
}
function removeUser(usernameToDel, adress, htmlElemID){
    
    var Loggedinusername;
    var key;
    if(localStorage.getItem("username") && localStorage.getItem("key")){
        Loggedinusername = localStorage.getItem("username")
        key = localStorage.getItem("key")
    }
    else if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        Loggedinusername = sessionStorage.getItem("username")
        key = sessionStorage.getItem("key")
    }
    else{
        window.location.href=`login.html?redirect=info.html?id=${ID}`
        return false;
    }
    if(usernameToDel == Loggedinusername){
        if(confirm("Er du sikker på at du vil fjerne din egen tilgang til denne adressen?")){   
            socket.emit("removeUser", Loggedinusername, key, usernameToDel, adress, htmlElemID)
        }
    }
    else{
        socket.emit("removeUser", Loggedinusername, key, usernameToDel, adress, htmlElemID)
    }
}
socket.on("userRemoved", () => {
    console.log("userRemoved")
    window.location.reload()
})
socket.on("userAdded", () => {
    alert("bruker lagt til")
    window.location.reload()
})