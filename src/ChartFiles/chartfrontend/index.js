const createChart = async (chart, file, title, mindata) => {
    var xArray = []
    var yArray = []
    await Get(file).then(res => {
        res.forEach(element => {
            if (element.second > mindata) {
                xArray.push(`${element.first}`);
                yArray.push(element.second);
            }
        });
    }).finally(() => {
        const data = [{
            labels: xArray,
            values: yArray,
            type: "pie"
        }];

        const layout = {
            title: title + " Min Usage: " + mindata
        };
        Plotly.newPlot(chart, data, layout);
    })
}

const Get = async (filename) => new Promise((resolve, reject) => {
    resolve(axios.get("http://" + document.location.hostname + ":" + document.location.port + "/chartdata/" + filename).then(res => res.data).catch(err => console.log(err)))
})

const divarr = ["player", "protocol", "protocolver", "version"]
const filearr = ["MaxPlayer", "Protocol", "ProtocolVersion", "Version"]
const titlearr = ["Most Used Max Player Data", "Most Used Protocols", "Most Used Protocol Versions", "Most Used Versions"]

divarr.forEach((element, n) => {
    createChart(element, filearr[n], titlearr[n], 500)
})