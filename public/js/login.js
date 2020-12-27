var socket = io()
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()
    socket.emit("login", document.getElementById("username").value, document.getElementById("password").value)
})
socket.on("passwordWrong", () => {
    document.getElementById("wrongP").hidden = false
})
socket.on("passwordCorrect", (username, key) => {
    if(document.getElementById("rememberMe").checked){
        localStorage.setItem("username", username)
        localStorage.setItem("key", key)
    }
    else{
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("key", key)
    }
    var searchParams = window.location.search
    var urlParams = new URLSearchParams(searchParams)
    if(urlParams.get("redirect")){
        if(urlParams.get("redirect") == "newAdress"){
            newAdress()
        }
        else if(urlParams.get("redirect")){
            window.location.href=urlParams.get("redirect")
        }
        else{
            window.location.href="/"
        }
    }
    else{
        window.location.href="index.html"
    }
})
socket.on("allowed", () => {
    window.location.href="index.html"
});
(function(){
    if(localStorage.getItem("username") && localStorage.getItem("key")){
        socket.emit("check", localStorage.getItem("username"), localStorage.getItem("key"))
    }
    else if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        socket.emit("check", sessionStorage.getItem("username"), sessionStorage.getItem("key"))
    }
})()