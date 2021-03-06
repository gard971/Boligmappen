var socket = io();
(function(){ // check function
    var username 
    var key
    if(localStorage.getItem("key") && localStorage.getItem("username")){
        username = localStorage.getItem("username")
        key = localStorage.getItem("key")
    }
    else if(sessionStorage.getItem("key") && sessionStorage.getItem("username")){
        username = sessionStorage.getItem("username")
        key = sessionStorage.getItem("key")
    }
    else{
        window.location.href="login.html?redirect=nyadresse.html"
    }
    if(username){
        socket.emit("check", username, key)
    }
})()
document.getElementById("newAdressForm").addEventListener("submit", e => {
    e.preventDefault()
    if(localStorage.getItem("username") && localStorage.getItem("key")){
    username = localStorage.getItem("username")
    key = localStorage.getItem("key")
    }
    else if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        username = sessionStorage.getItem("username")
        key = sessionStorage.getItem("key")
    }
    else{
        window.location.href="login?redirect=nyadresse.html"
        return false;
    }
    socket.emit("newAdress", username, key, document.getElementById("adress").value) 
})
socket.on("adressExists", () => {
    document.getElementById("status").hidden = false
})
socket.on("adressCreated", () => {
    alert("adress created")
    window.location.href="/"
})
socket.on("notAllowed", () => {
    window.location.href="index.html?redirect=newAdress.html"
})