import maxmind from 'maxmind';
import download from 'download';
import config from "../config.json" assert { type: "json" };

const update = async () => await download(`${config.scanner.ipinfo.url}.${config.scanner.ipinfo['db-type']}?token=${config.scanner.ipinfo.token}`, '../db', { extract: (config.scanner.ipinfo['db-type'] === 'mmdb') ? false : true, filename: "latest." + config.scanner.ipinfo['db-type'] });

const database = await maxmind.open('./db/latest.' + config.scanner.ipinfo['db-type']);

module.exports = {
    update,
    database
}