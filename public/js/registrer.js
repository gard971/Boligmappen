var socket = io()
document.getElementById("registrerForm").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(document.getElementById("username").value)
    if (document.getElementById("password").value == document.getElementById("password2").value) {
        socket.emit("register", document.getElementById("email").value, document.getElementById("username").value, document.getElementById("password").value, )
    }
})
socket.on("userCreated", () => {
    alert("bruker opprettet")
    window.location.href="nyadresse.html"
})
socket.on("usernameExists", () => {
    document.getElementById("wrongP").hidden = false
})