async function Log(color, string) {
    if (color == "green") {
     await console.log('\x1b[32m%s\x1b[0m', string);
    }
    else if (color == "red") {
      await  console.log('\x1b[31m%s\x1b[0m', string);
    }
    else if (color == "yellow") {
        await console.log('\x1b[33m%s\x1b[0m', string);
    }
}

module.exports.Log = Log