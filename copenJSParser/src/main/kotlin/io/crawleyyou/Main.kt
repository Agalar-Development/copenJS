package io.crawleyyou

import java.io.*
import java.time.*
import kotlin.text.*
import java.net.*
import java.nio.file.*
import java.util.concurrent.TimeUnit
import kotlin.collections.*
import kotlinx.serialization.json.*

fun main(args: Array<String>) {
        try {
            BigJSONReader(args[1], args[0])
        } catch (e: Exception) {
            println("No input file specified using sample file and starting scanner Mode: copenJS")
            BigJSONReader(Paths.get("").toAbsolutePath().parent.toString() + "/scan.json", "copenJS")
        }
}

class BigJSONReader (fileLoc: String, mode: String) {
    init {
        if (mode === "copenJS") {
            JSONReader(fileLoc)
        }
        else if (mode === "copenGraph") {
            Reader2(fileLoc)
        }
    }
    @Suppress("FunctionName")
    private fun JSONReader(args: String) {
        var count = 0
        try {
            val client = Socket("localhost", 9532)
            println("Reading file: $args " + LocalDateTime.now().toString())
            FileReader(args).use { reader ->
                val json = reader.readText().split("{   \"ip\": \"")
                json.forEach { data ->
                    count++
                    val ip = data.split('"')[0]
                    println("Current IP: $ip")
                    client.outputStream.write(ip.toByteArray())
                    TimeUnit.MILLISECONDS.sleep(50)
                }
                println("$count IP's processed. " + LocalDateTime.now().toString())
            }
            println("Finished reading file: $args " + LocalDateTime.now().toString())
            client.close()
        }
        catch (e: Exception) {
            println(e)
        }
    }
    private fun Reader2(args: String) {
        try {
            println("Reading file: $args " + LocalDateTime.now().toString())
            FileReader(args).use { reader ->
                val jsondat = Json.parseToJsonElement(reader.readText())
                jsondat.jsonArray.forEach { data ->
                    println(data.jsonObject["IP"])}
            }
            println("Finished reading file: $args " + LocalDateTime.now().toString())
        }
        catch (e: Exception) {
            println(e)
        }
    }
}