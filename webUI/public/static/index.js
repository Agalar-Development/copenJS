let socket

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

const processShow = () => {
    if (document.getElementById("subprocess-div").style.display === "none") {
        $("#subprocess-div").fadeIn(200)
    }
    else {
        $("#subprocess-div").fadeOut(200)
    }
}
