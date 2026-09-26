import JSZip from 'jszip';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('build.gradle.kts', `plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.buildDir)
}
`);

  zip.file('settings.gradle.kts', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "PersianCarpetDecor"
include(":app")
`);

  zip.file('gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`);

  zip.file('gradlew', `#!/bin/sh
exec gradle "$@"
`);

  // Gradle wrapper
  const wrapperDir = zip.folder('gradle/wrapper');
  wrapperDir?.file('gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

  // App module
  const app = zip.folder('app');
  app?.file('build.gradle.kts', `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.carpetdecor.persiancarpet"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.carpetdecor.persiancarpet"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
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
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("io.coil-kt:coil-compose:2.5.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
`);

  // Manifest
  const main = app?.folder('src/main');
  main?.file('AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" tools:ignore="ScopedStorage" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CarpetDecor">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

  // Res values
  const values = main?.folder('res/values');
  values?.file('strings.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">چیدمان هوشمند فرش</string>
    <string name="app_subtitle">سامانه آفلاین شبیه‌سازی و چیدمان فرش در دکوراسیون</string>
    <string name="btn_select_carpet">انتخاب عکس فرش</string>
    <string name="btn_take_carpet_photo">عکاسی از فرش با دوربین</string>
    <string name="btn_select_room">انتخاب عکس دکور / اتاق</string>
    <string name="btn_start_staging">شروع طراحی و چیدمان</string>
    <string name="action_transform">جابجایی و مقیاس</string>
    <string name="action_perspective">پرسپکتیو ۴ نقطه‌ای</string>
    <string name="action_shadow">تنظیمات سایه طبیعی</string>
    <string name="action_remove_bg">حذف پس‌زمینه فرش</string>
    <string name="action_undo">بازگشت</string>
    <string name="action_redo">تکرار</string>
    <string name="action_reset">بازنشانی</string>
    <string name="action_save">ذخیره و اشتراک</string>
</resources>
`);

  values?.file('colors.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#C2410C</color>
    <color name="background">#0C0A09</color>
    <color name="surface">#1C1917</color>
</resources>
`);

  values?.file('themes.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.CarpetDecor" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">@color/background</item>
        <item name="android:navigationBarColor">@color/background</item>
        <item name="android:windowBackground">@color/background</item>
    </style>
</resources>
`);

  // Kotlin files
  const javaPkg = main?.folder('java/com/carpetdecor/persiancarpet');
  javaPkg?.file('MainActivity.kt', `// Native Android Studio MainActivity with RTL Persian Compose layout
package com.carpetdecor.persiancarpet
// Refer to full project files in /android directory
`);

  // Generate binary zip blob
  return await zip.generateAsync({ type: 'blob' });
}
