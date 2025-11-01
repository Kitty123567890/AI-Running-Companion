plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  kotlin("plugin.serialization") version "1.9.23"
}

android {
  namespace = "com.example.ai_running_companion"
  compileSdk = 34

  // Load API keys from environment or .env file
  val envFile = rootProject.file(".env")
  val envMap: Map<String, String> = if (envFile.exists()) {
    envFile.readLines()
      .map { it.trim() }
      .filter { it.isNotEmpty() && !it.startsWith("#") }
      .map { line ->
        val idx = line.indexOf('=')
        if (idx <= 0) "" to "" else line.substring(0, idx).trim() to line.substring(idx + 1).trim()
      }
      .filter { it.first.isNotEmpty() }
      .toMap()
  } else emptyMap()

  fun getSecret(name: String): String =
    System.getenv(name)
      ?: (envMap[name])
      ?: (project.findProperty(name) as String?)
      ?: ""

  defaultConfig {
    applicationId = "com.example.ai_running_companion"
    minSdk = 26
    targetSdk = 34
    versionCode = 1
    versionName = "1.0"

    // Expose secrets to AndroidManifest via placeholders
    manifestPlaceholders["GOOGLE_MAPS_API_KEY"] = getSecret("GOOGLE_MAPS_API_KEY")
    manifestPlaceholders["AMAP_API_KEY"] = getSecret("AMAP_API_KEY")
  }

  buildTypes {
    release {
      isMinifyEnabled = false
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
      )
    }
  }

  buildFeatures { compose = true }

  composeOptions {
    // Match Kotlin 1.9.23 (see Compose-Kotlin compatibility map)
    kotlinCompilerExtensionVersion = "1.5.12"
  }

  // Align Java/Kotlin compile targets to avoid mismatch
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  packaging {
    resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
  }
}

dependencies {
  implementation(platform("org.jetbrains.kotlin:kotlin-bom:1.9.23"))
  implementation("androidx.core:core-ktx:1.12.0")
  implementation("androidx.activity:activity-compose:1.8.2")
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

  // Compose
  implementation("androidx.compose.ui:ui:1.6.7")
  implementation("androidx.compose.material3:material3:1.2.1")
  implementation("androidx.compose.ui:ui-tooling-preview:1.6.7")
  debugImplementation("androidx.compose.ui:ui-tooling:1.6.7")

  // Material Components (XML themes incl. Theme.Material3.*)
  implementation("com.google.android.material:material:1.12.0")

  // Maps + Location
  implementation("com.google.android.gms:play-services-maps:18.2.0")
  implementation("com.google.maps.android:maps-compose:4.3.3")
  implementation("com.google.android.gms:play-services-location:21.0.1")

  // Networking
  implementation("com.squareup.okhttp3:okhttp:4.11.0")
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
