#!/usr/bin/env bash
set -euo pipefail

# --- Build the Android APK for Turningpoint Church Nakuru ---
# This script:
#   1. Builds the Next.js app as a static export
#   2. Copies web assets into the Android project
#   3. Compiles the debug APK
#   4. Copies the APK to ~/Documents

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_NAME="Turningpoint Church Nakuru.apk"
OUTPUT_PATH="$HOME/Documents/$OUTPUT_NAME"
JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk}"

echo "========================================"
echo "  Building Turningpoint Church Nakuru APK"
echo "========================================"
echo ""

# Step 1: Static export
echo "[1/4] Building Next.js static export..."
cd "$PROJECT_DIR"
NEXT_EXPORT=true npm run build
echo "  ✓ Static export complete"
echo ""

# Step 2: Copy to Android
echo "[2/4] Copying web assets to Android project..."
npx cap copy android
echo "  ✓ Assets copied"
echo ""

# Step 3: Build APK
echo "[3/4] Compiling Android APK (this may take a while)..."
cd "$PROJECT_DIR/android"
JAVA_HOME="$JAVA_HOME" ./gradlew assembleDebug
echo "  ✓ APK compiled"
echo ""

# Step 4: Copy APK to Documents
echo "[4/4] Copying APK to Documents..."
cp "$PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk" "$OUTPUT_PATH"
echo "  ✓ APK copied to: $OUTPUT_PATH"
echo ""

# Summary
APK_SIZE=$(ls -lh "$OUTPUT_PATH" | awk '{print $5}')
echo "========================================"
echo "  Build complete!"
echo "  APK: $OUTPUT_PATH"
echo "  Size: $APK_SIZE"
echo "========================================"
