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
        if (socketData.mode === "Masscan") {
            var data = socketData.data.replace(/\s/g, '').replace("\n", "").split(",")
            document.getElementById("statusText").innerText = "Online"
            document.getElementById("statusText").style.color = "#00AF12"
            document.getElementById("mode").innerText = socketData.mode
            document.getElementById("rate").innerText = data[0].split(":")[1]
            document.getElementById("done").innerText = data[1].split("done")[0]
            document.getElementById("found").innerText = data[3].split("found=")[1]
        }
    }
}
