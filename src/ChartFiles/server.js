var express = require('express')
var config = require('../config.json')
var app = express()

app.listen(config.chart.port, () => {
    console.log("Chart api started at port: " + config.chart.port)
})

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use("/public", express.static(__dirname + "/chartfrontend"))

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/chartfrontend/index.html")
})

app.get("*", function (req, res) {
    if (req.url.slice(1).split("/")[0] === "chartdata" && !req.url.includes("..")) {
        res.sendFile(__dirname + "/chartdata/" + req.url.slice(1).split("/")[1] + ".json")
    }
})