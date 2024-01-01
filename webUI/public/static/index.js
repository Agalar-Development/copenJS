let socket

$.ajax({
    url: "/api/socket", success: function (result) {
        socket = new WebSocket(`ws://${document.location.host}:${JSON.parse(atob(result)).wsp}`);
        socket.onopen = function (e) {
            socket.send("client")
            test()
        }
    }
})

const test = () => {
    socket.onmessage = async (res) => {
        console.log(res.data)
    }
}
