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
            println("Trying mode ${args[1]} with file ${args[0]}")
            copenJSParser(args[0], args[1].toInt())
        } catch (e: Exception) {
            println("No input file/mode specified using sample file and starting scanner mode: copenJS")
            copenJSParser(Paths.get("").toAbsolutePath().parent.toString() + "/scan.json", 0)
        }
}

@Suppress("CascadeIf")
class copenJSParser (fileLocation: String, mode: Int) {
    init {
        if (mode == 0) {
            ServerReader(fileLocation)
        }
        else if (mode == 1) {
            GraphReader(fileLocation)
        }
        else {
            println("No valid mode specified: $mode")
        }
    }
    @Suppress("FunctionName")
    private fun ServerReader(args: String) {
        var count = 0
        try {
            val client = Socket("localhost", 9532)
            println("Reading file: $args " + LocalDateTime.now().toString())
            FileReader(args).use { reader ->
                // Do not change this ip extracting method because if we try to parse all data with Json.parseToJsonElement it will give Java heap space error even if the program started with 4GB of memory.
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
    @Suppress("FunctionName")
    private fun GraphReader(args: String) {
        try {
            println("Reading file: $args " + LocalDateTime.now().toString())
            FileReader(args).use { reader ->
                val jsonElement = Json.parseToJsonElement(reader.readText())
                jsonElement.jsonArray.forEach { data ->
                    println(data.jsonObject["ProtocolVersion"]?.jsonPrimitive?.content)
                }
                println("Finished reading file: $args " + LocalDateTime.now().toString())
            }
        }
        catch (e: Exception) {
            println(e)
        }
    }
}