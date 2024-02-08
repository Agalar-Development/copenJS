const config = require("../config.json").scanner.cloudflare.R2
const R2 = require("@aws-sdk/client-s3")

const client = new R2.S3Client({ region: "auto", endpoint: config.endpoint, credentials: {
    accessKeyId: config["access-id"],
    secretAccessKey: config["secret-access"]
}}) 

const uploadFile = async (data, name) => new Promise(async (resolve, reject) => {
    await client.send(new R2.PutObjectCommand({
        Bucket: "copenjs",
        Key: name,
        Body: data,
        ContentEncoding: 'base64',
        ContentType: 'image/png'
    })).then((res) => {
        resolve("File successfully uploaded to Cloudflare.")
    }).catch((err) => {
        console.log(err)
        reject("Error while uploading file to Cloudflare.")
    })
})

module.exports = {
    uploadFile
}