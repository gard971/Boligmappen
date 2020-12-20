var app = require("express")()
var express = require("express")
const http = require("http").createServer(app).listen(3000)
const fs = require("fs")
const path = require("path")
const io = require("socket.io")(http)
const formidable = require("formidable")
const bcrypt = require("bcrypt")
var saltRounds = 10;
var approvedKeys = []

app.post("/upload", (req, res) => {
    if (!req.query.id) {
        res.send("noe gikk galt. Fil ikke opplastet. <a href='index.html'>trykk her for å gå tilbake til hovedsiden <a>")
    } else {
        var formData = new formidable.IncomingForm()
        formData.parse(req, (err, fields, files) => {
            console.log(files.file)
            var extension = files.file.name.substr(files.file.name.lastIndexOf("."))
            var newPath = `data/${req.query.id}/` + fields.filename.split(" ").join("-") + extension
            if (fs.existsSync(newPath)) {
                res.write("Product name allready exists")
                res.end()

            } else {
                if (!fs.existsSync(`data/${req.query.id}`)) {
                    fs.mkdirSync(`data/${req.query.id}`)
                }
                fs.rename(files.file.path, newPath, function (error) {
                    if (error) {
                        throw error
                    } else {
                        res.redirect(`info.html?id=${req.query.id}`)
                        var adresses = jsonRead("data/adresses.json")
                        var geninfo = jsonRead("data/genInfo.json")
                        console.log(jsonRead("data/genInfo.json"))
                        console.log(geninfo.nextFileID)
                        adresses.forEach(adress => {
                            if (adress.id == req.query.id) {
                                var newObject = {
                                    "name": fields.filename,
                                    "id": geninfo.nextFileID
                                }
                                adress.info.push(newObject)
                                newObject = {
                                    "id": geninfo.nextFileID,
                                    "path": newPath
                                }
                                var files = jsonRead("data/files.json")
                                files.push(newObject)
                                jsonWrite(files, "data/files.json")
                                jsonWrite(adresses, "data/adresses.json")
                                geninfo.nextFileID++
                                jsonWrite(geninfo, "data/genInfo.json")
                            }
                        })
                    }
                })
            }
        })
    }
})

app.get("/download", (req, res) => {
    if (!req.query.id) {
        res.send("kunne ikke laste ned fil. ID mangler. <a href='index.html'>Trykk her for å gå tilbake til hoved siden</a>")
    } else {
        var files = jsonRead("data/files.json")
        var found = false
        files.forEach(file => {
            if (file.id == req.query.id) {
                res.download(file.path)
                //res.redirect(`/info.html?id=${req.query.id}`)
                found = true
            }
        })
        if (!found) {
            res.send("Oi, noe gikk galt. Venligst gå tilbake og prøv igjen")
        }
    }
})

app.use(express.static(path.join(__dirname + "/public")))

io.on("connection", socket => {
    socket.on("getAdresses", () => {
        socket.emit("adresses", jsonRead("data/adresses.json"))
    })
    socket.on("login", (username, password) => {
        var found = false
        var useranmeFromDataBase
        var json = jsonRead("data/users.json")
        for (var i = 0; i < json.length; i++) {
            useranmeFromDataBase = json[i].username
            isCorrect = bcrypt.compareSync(password, json[i].password)
            if (isCorrect && useranmeFromDataBase == username) {
                var key = Math.random()
                var newObject = {
                    "username": username,
                    "key": key
                }
                approvedKeys.push(newObject)
                socket.emit("passwordCorrect", username, key)
                found=true
            }
        }
        if (!found) {
            socket.emit("passwordWrong")
        }
    })
    //listens for register requests and checks if user allready exists then creates a new user if not
    socket.on("register", (email, username, nonHashPassword) => {
        hash(nonHashPassword).then(function (password) {
            if (password == false) {
                socket.emit("eror", "500 internal server error, Server could not secure your password properly and therfore it was not stored on the server. ERR:HASHERR")
                return false
            }
            var json = jsonRead("data/users.json")
            var found = false
            for (var i = 0; i < json.length; i++) {
                if (json[i].username == email) {
                    socket.emit("usernameExists")
                    found = true
                }
            }
            if (!found) {
                var newObject = {
                    "username": email,
                    "password": password,
                    "name": username,
                    "adresses":[]
                }
                json.push(newObject)
                jsonWrite(json, "data/users.json")
                socket.emit("userCreated")
            }
        })
    })
    //checks if the client has logged in before accesing logged in pages and redirects to the login page if not
    socket.on("check", (username, key) => {
        var allowed = check(username, key)
        if (!allowed) {
            socket.emit("notAllowed")
        }
        else{
            socket.emit("allowed")
        }
    })
    socket.on("newAdress", (username, key, adress) => {
        var completed
        approvedKeys.forEach(approvedKey => {
            completed = true
            if (approvedKey.key == key && approvedKey.username == username) {
                var users = jsonRead("data/users.json")
                var genInfo = jsonRead("data/genInfo.json")
                var adresses = jsonRead("data/adresses.json")
                users.forEach(user => {
                    if (user.username == username) {
                        newObject = {
                            "adress": adress,
                            "owner": user.name,
                            "id": genInfo.nextAdressID,
                            "info": [],
                            "userAccess":[{"username":username, "isOwner":true}]
                        }
                        var found = false
                        adresses.forEach(JSONadress => {
                            console.log(JSONadress.adress+" "+adress)
                            if(JSONadress.adress == adress){
                                found = true
                            }
                        })
                        console.log(found)
                        if(!found){
                            genInfo.nextAdressID++
                            jsonWrite(genInfo, "data/genInfo.json")
                            adresses.push(newObject)
                            jsonWrite(adresses, "data/adresses.json")
                            user.adresses.push(newObject.id)
                            jsonWrite(users, "data/users.json")
                            socket.emit("adressCreated")
                        }
                        else{
                            socket.emit("adressExists")
                        }
                    }
                })
            }
        })
        if(!completed){
            socket.emit("err", "500 internal server error. could not find logged in user")
        }
    })
    socket.on("getAdress", (username, key, adressID) => {
        var exitsts = false
        var allowed = false
        console.log(`${username} ${key} ${adressID}`)
        var userCheck = check(username, key)
        if(userCheck){
            var adresses = jsonRead("data/adresses.json")
            adresses.forEach(adress => {
                if(adress.id == adressID){
                    exitsts = true
                    adress.userAccess.forEach(user => {
                        if(user.username == username){
                            allowed = true
                            socket.emit("adress", adress, user.isOwner)
                        }
                    })
                }
            })
            if(exitsts && !allowed){
                socket.emit("err", "Du har ikke tilgang til denne adressen. Be eieren gi deg tilgang først")
                socket.emit("redir", "/")
            }
        }
    })
})

function jsonRead(path) {
    return JSON.parse(fs.readFileSync(path))
}

function jsonWrite(data, path) {
    fs.writeFileSync(path, JSON.stringify(data))
}
async function hash(password) {
    try {
        var hashPassword = await bcrypt.hash(password, saltRounds)
        return hashPassword.toString();
    } catch (error) {
        console.log(error)
        return false
    }
}
function check(username, key){
    var json = jsonRead("data/users.json")
        for (var i = 0; i < approvedKeys.length; i++) {
            if (approvedKeys[i].username == username && approvedKeys[i].key == key) {
                return true
            }
        }
        return false;
}