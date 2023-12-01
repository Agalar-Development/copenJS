package io.crawleyyou

import java.io.*
import java.time.*
import kotlin.text.*
import java.net.*
import java.nio.file.*
import java.util.concurrent.TimeUnit
import kotlin.collections.*
import kotlinx.serialization.json.*
import kotlinx.serialization.*

var protocolVersionHashMap = HashMap<String?, Int> ()
var maxPlayerHashMap = HashMap<String?, Int> ()
var protocolHashMap = HashMap<String?, Int> ()
var versionHashMap = HashMap<String?, Int> ()

var dataMaps = mutableListOf("ProtocolVersion", "MaxPlayer", "Protocol", "Version")
var hashMaps = mutableListOf(protocolVersionHashMap, maxPlayerHashMap, protocolHashMap, versionHashMap)

fun main(args: Array<String>) {
        try {
            println("Starting mode ${args[1]} with file ${args[0]}")
            copenJSParser(args[0], args[1].toInt(), args[2])
        } catch (e: Exception) {
            println("No input file/mode specified using sample file and starting scanner mode: copenJS")
            copenJSParser(Paths.get("").toAbsolutePath().parent.toString() + "/scan.json", 0)
        }
}

@Suppress("ClassName")
class copenJSParser (fileLocation: String, mode: Int, extra: String? = "null") {
    init {
        when (mode) {
            0 -> {
                ServerReader(fileLocation, extra)
            }
            1 -> {
                GraphReader(fileLocation)
            }
            else -> {
                println("No valid mode specified: $mode")
            }
        }
    }
    @Suppress("FunctionName")
    private fun ServerReader(args: String, startFrom: String?) {
        var count = 0
        var startStatus = false
        if (startFrom == "null") {
            startStatus = true
        }
        try {
            val client = Socket("localhost", 9532)
            println("Reading file: $args " + LocalDateTime.now().toString())
            FileReader(args).use { reader ->
                // Do not change this ip extracting method because if we try to parse all data with Json.parseToJsonElement it will give Java heap space error even if the program started with 4GB of memory.
                val json = reader.readText().split("{   \"ip\": \"")
                json.forEach { data ->
                    count++
                    val ip = data.split('"')[0]
                    if (startFrom == ip) {
                        startStatus = true
                    }
                    else if (startStatus) {
                        println("Current IP: $ip")
                        client.outputStream.write(ip.toByteArray())
                        TimeUnit.MILLISECONDS.sleep(5)
                    }
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
                    for (map in dataMaps) {
                        val index = dataMaps.indexOf(map)
                        when (hashMaps[index][data.jsonObject[map]?.jsonPrimitive?.content]) {
                            null -> {
                                hashMaps[index][data.jsonObject[map]?.jsonPrimitive?.content] = 1
                            }
                            else -> {
                                hashMaps[index][data.jsonObject[map]?.jsonPrimitive?.content] =
                                    hashMaps[index][data.jsonObject[map]?.jsonPrimitive?.content]!!.plus(
                                        1
                                    )
                            }
                        }
                    }
                }
                for (hashMapResult in hashMaps) {
                    val index = hashMaps.indexOf(hashMapResult)
                    val data = Json.encodeToString(hashMapResult.toList().toTypedArray())
                    File("${dataMaps[index]}.json").bufferedWriter().use { out ->
                        out.write(data)
                    }
                }
                println("Finished reading file: $args " + LocalDateTime.now().toString())
            }
        } catch (e: Exception) {
            println(e)
        }
    }
}