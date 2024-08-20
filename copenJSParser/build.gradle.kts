plugins {
    kotlin("jvm") version "1.8.10"
    kotlin("plugin.serialization") version "1.8.10"
    application
}

group = "org.crawleyyou"
version = "1.3-DEV"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    implementation(kotlin("stdlib-jdk8"))
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
    runtimeOnly("org.jetbrains.kotlinx:kotlinx-serialization-runtime:1.0-M1-1.4.0-rc")
}

tasks.test {
    useJUnitPlatform()
}

tasks.create("BuildFatJar", Jar::class) {
    group = "build" // OR, for example, "build"
    description = "Creates a self-contained fat JAR of the application that can be run."
    manifest.attributes["Main-Class"] = "io.crawleyyou.MainKt"
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    val dependencies = configurations
        .runtimeClasspath
        .get()
        .map(::zipTree)
    from(dependencies)
    with(tasks.jar.get())
}

tasks.withType(Jar::class) {
    manifest {
        attributes["Manifest-Version"] = "1.3"
        attributes["Main-Class"] = "io.crawleyyou.MainKt"
    }
}

kotlin {
    jvmToolchain(8)
}

application {
    mainClass.set("io.crawleyyou.MainKt")
}