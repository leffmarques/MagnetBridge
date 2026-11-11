#!/bin/bash
set -e

PROJECT_ROOT="/app/applet/android-project/StremioMagnetBridge"
ANDROID_JAR="/opt/android-sdk/android.jar"
BUILD_DIR="/tmp/apk-build"
OUTPUT_DIR="/app/applet/public"
OUTPUT_DOWNLOADS="/app/applet/public/downloads"

echo "=== Building MagnetBridge APK v0.8.0 ==="
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/gen" "$BUILD_DIR/obj" "$BUILD_DIR/apk" "$OUTPUT_DIR" "$OUTPUT_DOWNLOADS"

echo "[1/6] Compiling Android resources with AAPT..."
aapt package -f -m \
  -J "$BUILD_DIR/gen" \
  -M "$PROJECT_ROOT/app/src/main/AndroidManifest.xml" \
  -S "$PROJECT_ROOT/app/src/main/res" \
  -I "$ANDROID_JAR"

echo "[2/6] Compiling Java classes with javac..."
javac -source 8 -target 8 \
  -cp "$ANDROID_JAR:$BUILD_DIR/gen" \
  -d "$BUILD_DIR/obj" \
  "$BUILD_DIR/gen/com/stremiomagnetbridge/app/R.java" \
  "$PROJECT_ROOT/app/src/main/java/com/stremiomagnetbridge/app/BencodeEncoder.java" \
  "$PROJECT_ROOT/app/src/main/java/com/stremiomagnetbridge/app/TorrentMetadata.java" \
  "$PROJECT_ROOT/app/src/main/java/com/stremiomagnetbridge/app/MetadataEngine.java" \
  "$PROJECT_ROOT/app/src/main/java/com/stremiomagnetbridge/app/MainActivity.java"

echo "[3/6] Converting to Dalvik DEX format with dx..."
/usr/bin/dalvik-exchange --dex --output="$BUILD_DIR/apk/classes.dex" "$BUILD_DIR/obj"

echo "[4/6] Creating unaligned APK package..."
aapt package -f \
  -M "$PROJECT_ROOT/app/src/main/AndroidManifest.xml" \
  -S "$PROJECT_ROOT/app/src/main/res" \
  -I "$ANDROID_JAR" \
  -F "$BUILD_DIR/apk/unaligned.apk"

cd "$BUILD_DIR/apk"
aapt add unaligned.apk classes.dex
cd /app/applet

echo "[5/6] Aligning APK (4-byte boundary) with zipalign..."
zipalign -f -p 4 "$BUILD_DIR/apk/unaligned.apk" "$BUILD_DIR/apk/aligned.apk"

echo "[6/6] Signing APK with apksigner (v1 + v2 + v3 scheme)..."
apksigner sign \
  --ks /opt/android-sdk/debug.keystore \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$OUTPUT_DIR/MagnetBridge.apk" \
  "$BUILD_DIR/apk/aligned.apk"

# Copy to downloads directory as well
cp "$OUTPUT_DIR/MagnetBridge.apk" "$OUTPUT_DOWNLOADS/MagnetBridge.apk"
cp "$OUTPUT_DIR/MagnetBridge.apk" "$OUTPUT_DOWNLOADS/MagnetBridge-v0.8.0.apk"

# Also bundle updated source code
cd /app/applet/android-project
zip -r "$OUTPUT_DOWNLOADS/MagnetBridge-source-v0.8.0.zip" StremioMagnetBridge > /dev/null
cp "$OUTPUT_DOWNLOADS/MagnetBridge-source-v0.8.0.zip" "$OUTPUT_DIR/MagnetBridge-source.zip"
cd /app/applet

echo "=== Build Successful! ==="
ls -lh "$OUTPUT_DIR/MagnetBridge.apk"
apksigner verify --verbose "$OUTPUT_DIR/MagnetBridge.apk"
aapt dump badging "$OUTPUT_DIR/MagnetBridge.apk" | head -n 12
