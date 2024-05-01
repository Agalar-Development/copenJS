let socket
let content = 0

$.ajax({
    url: "/api/socket", success: function (result) {
        socket = new WebSocket(`ws://${document.location.host}:${JSON.parse(atob(result)).wsp}`);
        socket.onopen = function (e) {
            socket.send("client")
            receive()
        }
    }
})

const receive = () => {
    socket.onmessage = async (res) => {
        var socketData = JSON.parse(res.data)
        document.getElementById("mode").innerText = socketData.mode
        document.getElementById("statusText").innerText = "Online"
        document.getElementById("statusText").style.color = "#00AF12"
        if (socketData.mode === "Masscan") {
            var data = socketData.data.replace(/\s/g, '').replace("\n", "").split(",")
            document.getElementById("rate").innerText = data[0].split(":")[1]
            document.getElementById("done").innerText = data[1].split("done")[0]
            document.getElementById("remain").innerText = data[2].split("remaining")[0]
            document.getElementById("found").innerText = data[3].split("found=")[1]
        }
        else if (socketData.mode === "copenJS") {
            document.getElementById("remain").style.display = "none"
            document.getElementById("remain2").style.display = "none"
            document.getElementById("done").style.display = "none"
            document.getElementById("done2").style.display = "none"
            document.getElementById("mode").style.color = "#610094"
            document.getElementById("rate").innerText = (socketData.main.total - socketData.main.totalLast) * 2 + " IP/s"
            document.getElementById("found").innerText = socketData.main.finds
            document.getElementById("crip").innerText = socketData.main.lastIp
            document.getElementById("assigned").innerText = socketData.main.assigned
            document.getElementById("crrate").innerText = ((socketData.main.finds / socketData.main.total) * 100).toFixed(2) + "%"
            document.getElementById("subpr").innerText = socketData.main.subprocesses
            document.getElementById("tcp").innerText = socketData.main.tcpRestarts
            document.getElementById("details").style.display = "contents"
            socketData.subproc.forEach((data, n) => {
                if (document.getElementById(`subproc${n}`) === null) {
                    document.getElementById("subprocess-div").innerHTML += ` <p class="text" id="subproc${n}" style="font-size: 20px;"><a id="proc${n}" style="color:#950101">Process ${n}: </a> Current IP: <a id="curip${n}" style="color:#610094">0.0.0.0</a>, Last Response: <a id="lresp${n}" style="color:#610094">0ms</a>, Status: <a id="stat${n}" style="color:#610094">Idle</a>, Assigned: <a id="assign${n}" style="color: #610094">0</a>, Find: <a id="find${n}" style="color: #610094">0</a>, Restarts: <a id ="restart${n}" style="color: #610094">0</a>, No-Ping: <a id="ping${n}" style="color: #610094">0</a></p>`
                }
                if (document.getElementById("subprocess-div").style.display !== "none") {
                    document.getElementById(`curip${n}`).innerText = data.currentIp
                    document.getElementById(`lresp${n}`).innerText = data.lastresponsetext + "ms"
                    document.getElementById(`stat${n}`).innerText = (data.assigned >= 1) ? "Working" : "Idle"
                    document.getElementById(`assign${n}`).innerText = data.assigned
                    document.getElementById(`find${n}`).innerText = data.finds
                    document.getElementById(`restart${n}`).innerText = data.restarts
                    document.getElementById(`ping${n}`).innerText = data.currentPings
                }
            })
        }
    }
}

const processShow = () => $("#subprocess-div").fadeToggle(200)

const rotate = (data) => {
    data.classList.toggle("rotated90")
    var id = data.parentElement.id.split("datacontent")[1]
    if (data.classList.length === 2) {
        $("#extraInfo" + id).animate({
            "margin-top": "10%",
        }, "fast")
    }
    else {
        $("#extraInfo" + id).animate({
            "margin-top": "0%",
        }, "fast")
    }
}

const createContent = (data) => {
    var base = document.createElement("div")
    var basic = document.createElement("div")
    basic.style = "text-align: center; position: static; display: flex;"
    base.style = "text-align: center; display: contents; position: relative"
    basic.id = `datacontent${content}`
    basic.classList.add("datacontent")
    var imageNode = document.createElement("img")
    imageNode.src = (data.favicon === null) ? "./copenJS.png" : data.favicon
    imageNode.style = "user-select: none;border-radius: 50%; margin: 12px 12px 12px 12px; height: 96px; width: 96px;"
    basic.appendChild(imageNode)
    var textNode = document.createElement("div")
    textNode.style = "font-family: 'Noto Sans'; text-align: left; margin-top: auto; margin-bottom: auto; margin-left: 8px; margin-right: auto; font-size: 20px; color: #FFFFFF;"
    textNode.innerHTML += data.motdHTML
    basic.appendChild(textNode)
    var buttonNode = document.createElement("img")
    buttonNode.className = "rotatable"
    buttonNode.style = "user-select: none; position: sticky; right: 50%; margin-left: 45%; margin-top: auto; margin-bottom: 3px; width: 32px; height: 32px; top: 90px"
    buttonNode.src = "./icons8-down-480.png"
    buttonNode.setAttribute("onclick", `rotate(this)`)
    basic.appendChild(buttonNode)
    var infoNode = document.createElement("div")
    infoNode.style = "font-family: 'Inter'; text-align: right; margin-top: auto; margin-bottom: auto; margin-left: auto; font-size: 20px; margin-right: 12px;"
    infoNode.innerHTML += `<span style="color: #FFFFFF" onclick="copyClipboard(this)")"> IP: ${data.ip}</span>
     <span class="dataInfo" style="color: #FFFFFF" title="${data.version}"> Version: ${data.protocolversion}</span>
     <span class="dataInfo" style="color: #FFFFFF"> Latency: ${data.latency}ms</span>
     <br>
     <span class="dataInfo" style="color: #FFFFFF"> Players: ${data.currentplayers}/${data.maxplayers}</span>`
    basic.appendChild(infoNode)
    base.appendChild(basic)
    base.innerHTML += "<br>"
    var extraInfoNode = document.createElement("div")
    extraInfoNode.style = "text-align: center; position: relative; display: flex;"
    extraInfoNode.id = `extraInfo${content}`
    base.appendChild(extraInfoNode)
    content++
    document.getElementById("database").appendChild(base)
}

const fetchDatabase = () => {
    $.ajax({
        type: "POST",
        url: "/api/database/fetch", success: function (result) {
            result.data.forEach((data) => {
                createContent(data)
            })
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ skip: content }),
        processData: false
    })
}

const copyClipboard = (element) => {
    if (element.innerText === "Copied!") return 0
    navigator.clipboard.writeText(`${element.innerText.replace("IP: ", "")}`)
    var temp = element.innerText
    element.innerText = "Copied!"
    setTimeout(() => {
        element.innerText = temp
    }, 1000)
}

fetchDatabase()
