var status
function newAdress(){
    status = true;
    check()
}
function appendNewAdress(){
    var div = document.createElement("div")
    div.id = "newAdressContainer"
    var form = document.createElement("form")
    form.id = "newAdressForm"
    var input1 = document.createElement("input")
    input1.id = "adress"
    input1.placeholder = "Adresse"
    input1.required = true
    form.appendChild(input1)
    var br = document.createElement("br")
    form.appendChild(br)
    var input2 = document.createElement("input")
    input2.type = "submit"
    input2.value = "Oprett!"
    form.appendChild(input2)
    div.appendChild(form)
    if(status){
    document.body.appendChild(div)
    }
    else{
        window.location.href="login.html?redirect=newAdress"
    }
}
function check(redirect){
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
        if(redirect){ 
        window.location.href=`login.html?redirect=${redirect}`
        }
        else{
            window.location.href=`login.html`
        }
    }
    if(username){
        socket.emit("check", username, key)
    }
}
socket.on("allowed", () => {
    if(status){
           appendNewAdress()
    }
})
// socket.on("notAllowed", () => {
//     status == "false"
//     window.location.href=`login.html?redirect=${window.location.href}`
// })
socket.on("err", msg => {
    console.error(msg)
    alert(msg)
})
socket.on("redir", (location) => {
    window.location.href = location
})