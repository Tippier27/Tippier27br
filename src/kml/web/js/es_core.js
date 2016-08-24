//Core javascript functions for KMLK inner functionality
//Created by DarkLBP (https://krothium.com)
var status_interval = setInterval(function(){status();}, 1000);
var progress_value = 0;
var play_value = "0";
var profile_value = "";
var keepAlive_interval = setInterval(function(){keepAlive();}, 1000);
var keepAlive_requested = false;
var authenticate_requested = false;
function authenticate(){
    if (!authenticate_requested){
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        if (username === "" || password === "" || username === null || password === null){
            swal("Error", "¡Credenciales inválidas!", "error");
        } else {
            var parameters = toBase64(username) + ":" + toBase64(password);
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    authenticate_requested = false;
                    var response = xhr.responseText;
                    if (response === "OK"){
                        redirect("/play.html");
                    } else {
                        swal("Error", response, "error");
                    }
                }
            };
            xhr.onerror = function(){
                swal("Error", "Fallo al enviar la petición authentication.", "error");
            };
            xhr.open("POST", "/action/authenticate", true);
            xhr.send(parameters);  
            authenticate_requested = true;
        }
    }
}
function loadProfileData(){
    if (location.href.indexOf("?") !== -1){
        var name_base = location.href.split("?")[1];
        if (name_base === null){
            swal("Error", "¡Petición de perfil inválida!", "error");
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    var response = xhr.responseText;
                    var data = response.split(":");
                    if (data.constructor === Array){
                        if (data.length === 9){
                            var name = fromBase64(data[0]);
                            document.getElementById("profileTitle").innerHTML = '<i class="fa fa-newspaper-o"></i> Perfil: ' + name;
                            document.getElementById("profileName").value = name;
                            document.getElementById("snapshot").checked = (fromBase64(data[2]) === "true");
                            document.getElementById("oldBeta").checked = (fromBase64(data[3]) === "true");
                            document.getElementById("oldAlpha").checked = (fromBase64(data[4]) === "true");
                            var xhr2 = new XMLHttpRequest();
                            xhr2.onreadystatechange = function() {
                                if (xhr2.readyState === XMLHttpRequest.DONE) {
                                    var response2 = xhr2.responseText;
                                    var vers = response2.split(":");
                                    if (vers.constructor === Array){
                                        var data_length = vers.length;
                                        var value = "";
                                        for (var i = 0; i < data_length; i++){
                                            if (vers[i] === "latest"){
                                                value += '<option value="latest">Usar Última Versión</option>';
                                            } else {
                                                var name = fromBase64(vers[i]);
                                                value += '<option value="' + vers[i] + '">' + name + '</option>';
                                            }
                                        }
                                        document.getElementById("versionList").innerHTML = value;
                                    } else {
                                        swal("Error", "No se pudo cargar la lista de versiones.", "error");
                                    }
                                    document.getElementById("versionList").value = data[1];
                                    if (data[5] !== "noset"){
                                        document.getElementById("gameDirectory").value = fromBase64(data[5]);
                                    }
                                    if (data[6] !== "noset"){
                                        var resolution = fromBase64(data[6]);
                                        document.getElementById("resX").value = resolution.split("x")[0];
                                        document.getElementById("resY").value = resolution.split("x")[1];
                                    }
                                    if (data[7] !== "noset"){
                                        document.getElementById("javaExecutable").value = fromBase64(data[7]);
                                    }
                                    if (data[8] !== "noset"){
                                        document.getElementById("javaArgs").value = fromBase64(data[8]);
                                    }
                                }
                            };
                            xhr2.onerror = function(){
                                swal("Error", "Fallo al enviar la petición versions.", "error");
                            };
                            xhr2.open("POST", "/action/versions", true);
                            xhr2.send();
                        }else{
                            swal("Error", "El servidor respondión con una cantidad inválida de información.", "error");
                        }
                    } else {
                        swal("Error", "No se puedo cargar la información del perfil.", "error");
                    }
                }
            };
            xhr.onerror = function(){
                swal("Error", "Fallo al enviar la petición profiledata.", "error");
            };
            xhr.open("POST", "/action/profiledata", true);
            xhr.send(name_base);
        }
    } else {
        document.getElementById("profileTitle").innerHTML = '<i class="fa fa-newspaper-o"></i> Nuevo Perfil';
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var response2 = xhr.responseText;
                var vers = response2.split(":");
                if (vers.constructor === Array){
                    var data_length = vers.length;
                    var value = "";
                    for (var i = 0; i < data_length; i++){
                        if (vers[i] === "latest"){
                            value += '<option value="latest">Usar Última Versión</option>';
                        } else {
                            var name = fromBase64(vers[i]);
                            value += '<option value="' + vers[i] + '">' + name + '</option>';
                        }
                    }
                    document.getElementById("versionList").innerHTML = value;
                } else {
                    swal("Error", "No se pudo cargar la lista de versiones.", "error");
                }
            }
        };
        xhr.onerror = function(){
            swal("Error", "Fallo al enviar la petición versions.", "error");
        };
        xhr.open("POST", "/action/versions", true);
        xhr.send();
    }
}
function refreshVersionList(){
    var parameters = toBase64(document.getElementById("snapshot").checked.toString()) + ":" + toBase64(document.getElementById("oldBeta").checked.toString()) + ":" + toBase64(document.getElementById("oldAlpha").checked.toString());
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            var vers = response.split(":");
            if (vers.constructor === Array){
                var data_length = vers.length;
                var value = "";
                for (var i = 0; i < data_length; i++){
                    if (vers[i] === "latest"){
                        value += '<option value="latest">Usar Última Versión</option>';
                    } else {
                        var name = fromBase64(vers[i]);
                        value += '<option value="' + vers[i] + '">' + name + '</option>';
                    }
                }
                document.getElementById("versionList").innerHTML = value;
            } else {
                swal("Error", "No se pudo cargar la lista de versiones.", "error");
            }
            var xhr2 = new XMLHttpRequest();
            xhr2.onreadystatechange = function() {
                if (xhr2.readyState === XMLHttpRequest.DONE) {
                    var response2 = xhr2.responseText;
                    document.getElementById("versionList").value = fromBase64(response2.split(":")[0]);
                }
            };
            xhr2.onerror = function(){
                swal("Error", "Fallo al enviar la petición selectedversion.", "error");
            };
            xhr2.open("POST", "/action/selectedversion", true);
            xhr2.send();
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición versions.", "error");
    };
    xhr.open("POST", "/action/versions", true);
    xhr.send(parameters);
}
function saveProfile(){
    if (location.href.indexOf("?") !== -1){
        var name_base = location.href.split("?")[1].replace('#', '');
    } else {
        var name_base = "noset";
    }
    if (name_base === null){
        swal("Error", "¡Petición de perfil inválida!", "error");
    } else {
        var name = "noset";
        var version = document.getElementById("versionList").value;
        var snapshot = toBase64(document.getElementById("snapshot").checked.toString());
        var oldbeta = toBase64(document.getElementById("oldBeta").checked.toString());
        var oldalpha = toBase64(document.getElementById("oldAlpha").checked.toString());
        var gamedir = "noset";
        var resolution = "noset";
        var javaexec = "noset";
        var javaargs = "noset";
        if (document.getElementById("profileName").value !== ""){
            name = toBase64(document.getElementById("profileName").value);
        }
        if (document.getElementById("gameDirectory").value !== ""){
            gamedir = toBase64(document.getElementById("gameDirectory").value);
        }
        if (document.getElementById("resX").value !== "" && document.getElementById("resY").value !== ""){
            resolution = toBase64(document.getElementById("resX").value + "x" + document.getElementById("resY").value);
        }
        if (document.getElementById("javaExecutable").value !== ""){
            javaexec = toBase64(document.getElementById("javaExecutable").value);
        }
        if (document.getElementById("javaArgs").value !== ""){
            javaargs = toBase64(document.getElementById("javaArgs").value);
        }
        var parameters = name_base + ":" + name + ":" + version + ":" + snapshot + ":" + oldbeta + ":" + oldalpha + ":" + gamedir + ":" + resolution + ":" + javaexec + ":" + javaargs;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var response = xhr.responseText;
                if (response !== "OK"){
                    swal("Error", response, "error");
                } else {
                    if (name_base === "noset"){
                        swal({title: "Éxito", text: "Perfil " + fromBase64(name) + " añadido satisfactoriamente.", type: "success", closeOnConfirm: false}, function(){redirect("/profiles.html");});
                    } else {
                        swal({title: "Éxito", text: "Perfil " + fromBase64(name_base) + " guardado satisfactoriamente.", type: "success", closeOnConfirm: false}, function(){redirect("/profiles.html");});
                    }
                }
            }
        };
        xhr.onerror = function(){
            swal("Error", "Fallo al enviar la petición saveprofile.", "error");
        };
        xhr.open("POST", "/action/saveprofile", true);
        xhr.send(parameters);
    }
}
function playGame(){
    var xhr = new XMLHttpRequest();
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición play.", "error");
    };
    xhr.open("POST", "/action/play", true);
    xhr.send();
}
function status(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            var data = response.split(":");
            if (data.constructor === Array){
                if (data.length === 2){
                    var status = data[0];
                    var progress = data[1];
                    if (progress !== progress_value){
                        document.getElementById("progress").innerHTML = '<progress value="' + progress + '" max="100"></progress>'
                        progress_value = progress;
                    }
                    if (status !== play_value){
                        switch (status){
                            case "0":
                                document.getElementById("play").innerHTML = '<a class="red-button wide playButton" onclick="playGame()" href="#">JUGAR</a>';
                                break;
                            case "1":
                                document.getElementById("play").innerHTML = '<a class="red-button wide playButton" onclick="playGame()" href="#">DESCARGANDO</a>';
                                break;
                            case "2":
                                document.getElementById("play").innerHTML = '<a class="red-button wide playButton" onclick="playGame()" href="#">JUGANDO</a>';
                                break;
                        }
                        play_value = status;
                    }
                }
            }
        }
    };
    xhr.open("POST", "/action/status", true);
    xhr.send();
}
function keepAlive(){
    if (!keepAlive_requested){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                keepAlive_requested = false;
            }
        };
        xhr.onerror = function(){
            clearInterval(status_interval);
            clearInterval(keepAlive_interval);
            swal("Error", "Conexión perdida con el launcher.\nAhora puedes cerrar esta página de forma segura.", "error");  
        };
        xhr.open("POST", "/action/keepalive", true);
        xhr.send();
        keepAlive_requested = true;
    }
}
function loadSignature(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            document.getElementById("signature").innerHTML = "<center>" + response + "</center>";
        }
    };
    xhr.onerror = function(){
        document.getElementById("signature").innerHTML = "<center>Fallo al cargar la firma.</center>";
    };
    xhr.open("POST", "/action/signature", true);
    xhr.send();
}
function logOut(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response === "OK"){
                redirect("/login.html");
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición logout.", "error");
    };
    xhr.open("POST", "/action/logout", true);
    xhr.send();
}
function loadProfiles(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            var data = response.split(":");
            if (data.constructor === Array){
                var data_length = data.length;
                var value = "";
                for (var i = 0; i < data_length; i++){
                    var name = fromBase64(data[i]);
                    value += '<option value="' + data[i] + '">' + name + '</option>';
                }
                document.getElementById("profiles").innerHTML = value;
            } else {
                swal("Error", "No se puedo cargar la lista de perfiles.", "error");
            }
            var xhr2 = new XMLHttpRequest();
            xhr2.onreadystatechange = function() {
                if (xhr2.readyState === XMLHttpRequest.DONE) {
                    var response2 = xhr2.responseText;
                    document.getElementById("profiles").value = response2;
                    profile_value = response2;
                }
            };
            xhr2.onerror = function(){
                swal("Error", "Fallo al enviar la petición selectedprofile.", "error");
            };
            xhr2.open("POST", "/action/selectedprofile", true);
            xhr2.send();
            
            var xhr3 = new XMLHttpRequest();
            xhr3.onreadystatechange = function() {
                if (xhr3.readyState === XMLHttpRequest.DONE) {
                    var response3 = xhr3.responseText;
                    document.getElementById("version").innerHTML = "Minecraft " + fromBase64(response3.split(":")[1]);
                }
            };
            xhr3.onerror = function(){
                swal("Error", "Fallo al enviar la petición seslectedversion.", "error");
            };
            xhr3.open("POST", "/action/selectedversion", true);
            xhr3.send();
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición profiles.", "error");
    };
    xhr.open("POST", "/action/profiles", true);
    xhr.send();
}
function loadProfileList(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            var data = response.split(":");
            if (data.constructor === Array){
                var data_length = data.length;
                var value = "";
                for (var i = 0; i < data_length; i++){
                    var name = fromBase64(data[i]);
                    value += '<b>' + name + '</b><a class="red-button halfWideButton" href=\"/profile.html?' + data[i] + '\">EDITAR</a><a class="red-button halfWideButton" onclick="deleteProfile(\'' + data[i] + '\');" href="#">ELIMINAR</a><br>';
                }
                value += '<br><a class="red-button wide" href="/profile.html">CREAR NUEVO</a>';
                document.getElementById("profileList").innerHTML = value;
            } else {
                swal("Error", "No se pudo cargar la lista de versiones.", "error");
            }
        }
    };
    xhr.onerror = function(){
         swal("Error", "Fallo al enviar la petición profiles.", "error");
    };
    xhr.open("POST", "/action/profiles", true);
    xhr.send();
}
function setSelectedProfile(){
    var selected = document.getElementById("profiles").value;
    if (selected !== profile_value){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var response = xhr.responseText;
                if (response !== "OK"){
                    swal("Error", "Fallo al cambiar el perfil seleccionado.", "error");
                }
                loadProfiles();
            }
        };
        xhr.onerror = function(){
            swal("Error", "Fallo al enviar la petición setselectedprofile.", "error");
        };
        xhr.open("POST", "/action/setselectedprofile", true);
        xhr.send(selected);
    }
}
function deleteProfile(base64name){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response !== "OK"){
                swal("Error", "Fallo al eliminar el perfil " + fromBase64(base64name) + ".", "error");
            } else {
                swal("Éxito", "Perfil " + fromBase64(base64name) + " eliminado satisfactoriamente.", "success");
                loadProfileList();
                loadProfiles();
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición deleteprofile.", "error");
    };
    xhr.open("POST", "/action/deleteprofile", true);
    xhr.send(base64name);
}
function updateSkin(){
    if (document.getElementById("skinFile").files.length > 0){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var response = xhr.responseText;
                if (response !== "OK"){
                    swal("Error", response, "error");
                } else {
                    swal({title: "Éxito", text: "Skin guardada satisfactoriamente.", type: "success", closeOnConfirm: false}, function(){redirect("/account.html");});
                }
            }
        };
        xhr.onerror = function(){
            swal("Error", "Fallo al enviar la petición changeskin.", "error");
        };
        xhr.open("POST", "/action/changeskin", true);
        xhr.setRequestHeader("Content-Type", document.getElementById("skinFile").files[0].type);
        xhr.setRequestHeader("Content-Length", document.getElementById("skinFile").files[0].length);
        xhr.setRequestHeader("Content-Extra", document.getElementById("skinFormat").value);
        xhr.send(document.getElementById("skinFile").files[0]);
    } else {
        swal("Advertencia", "Selecciona una skin primero.", "warning");
    }
}
function updateCape(){
    if (document.getElementById("capeFile").files.length > 0){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var response = xhr.responseText;
                if (response !== "OK"){
                    swal("Error", response, "error");
                } else {
                    swal({title: "Éxito", text: "Capa guardada satisfactoriamente.", type: "success", closeOnConfirm: false}, function(){redirect("/account.html");});
                }
            }
        };
        xhr.onerror = function(){
            swal("Error", "Fallo al enviar la petición changecape.", "error");
        };
        xhr.open("POST", "/action/changecape", true);
        xhr.setRequestHeader("Content-Type", document.getElementById("capeFile").files[0].type);
        xhr.setRequestHeader("Content-Length", document.getElementById("capeFile").files[0].length);
        xhr.send(document.getElementById("capeFile").files[0]);
    } else {
        swal("Advertencia", "Selecciona una capa primero.", "warning");
    }
}
function updateCapePreview(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response !== ""){
                document.getElementById("capePreview").innerHTML = "<img src=\"" + response + "\">";
            } else {
                document.getElementById("capePreview").innerHTML = "Ninguna";
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición getcape.", "error");
    };
    xhr.open("POST", "/action/getcape", true);
    xhr.send();
}
function updateSkinPreview(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response !== ""){
                document.getElementById("skinPreview").innerHTML = "<img src=\"" + response + "\">";
            } else {
                document.getElementById("skinPreview").innerHTML = "Ninguna";
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición getskin.", "error");
    };
    xhr.open("POST", "/action/getskin", true);
    xhr.send();
}
function deleteSkin(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response !== "OK"){
                swal("Error", "Fallo al eliminar la skin.\nError: " + response, "error");
            } else {
                swal("Éxito", "Skin eliminada satisfactoriamente.", "success");
                updateSkinPreview();
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición deleteskin.", "error");
    };
    xhr.open("POST", "/action/deleteskin", true);
    xhr.send();
}
function deleteCape(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response !== "OK"){
                swal("Error", "Fallo al eliminar la capa.\nError: " + response, "error");
            } else {
                swal("Éxito", "Capa eliminada satisfactoriamente.", "success");
                updateCapePreview();
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición deletecape.", "error");
    };
    xhr.open("POST", "/action/deletecape", true);
    xhr.send();
}
function switchLanguage(){
    var xhr = new XMLHttpRequest();
    var l = toBase64(document.getElementById("langSelect").value);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = xhr.responseText;
            if (response !== "OK"){
                swal("Error", "Fallo al cambiar el idioma.\nError: " + response, "error");
            } else {
                createCookie("lang", document.getElementById("langSelect").value, 365);
                location.reload();
            }
        }
    };
    xhr.onerror = function(){
        swal("Error", "Fallo al enviar la petición switchlanguage.", "error");
    };
    xhr.open("POST", "/action/switchlanguage", true);
    xhr.send(l);
}