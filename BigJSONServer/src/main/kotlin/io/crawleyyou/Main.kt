package io.crawleyyou

import java.io.*
import java.time.*
import kotlin.text.*
import java.net.*
import java.nio.file.*
import java.util.concurrent.TimeUnit
import kotlin.collections.*

fun main(args: Array<String>) {
    try {
        BigJSONReader(args[0])
    }
    catch (e: Exception) {
        println("No input file specified using sample file.")
        BigJSONReader(Paths.get("").toAbsolutePath().parent.toString() + "/scan.json")
    }
}

class BigJSONReader (args: String) {
    init {
        JSONReader(args)
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
}

