#!/bin/bash

#
# Test script to optimize a single image
# This helps you verify the optimization quality before processing all images
#

set -e

# Select a sample image
SAMPLE_IMAGE="public/data/level_2/0039_nine.png"

if [ ! -f "$SAMPLE_IMAGE" ]; then
    echo "Sample image not found: $SAMPLE_IMAGE"
    exit 1
fi

# Create test output directory
mkdir -p test-output

echo "Testing image optimization on: $SAMPLE_IMAGE"
echo ""

# Get original file info
ORIGINAL_SIZE=$(stat -f%z "$SAMPLE_IMAGE")
ORIGINAL_DIMS=$(sips -g pixelWidth -g pixelHeight "$SAMPLE_IMAGE" | grep pixel)

echo "Original image:"
echo "  Size: $(echo $ORIGINAL_SIZE | awk '{printf "%.2f MB", $1/1048576}')"
echo "  $ORIGINAL_DIMS"
echo ""

# Test WebP conversion at different quality levels
echo "Testing WebP conversion at different quality levels..."
echo ""

for QUALITY in 75 80 85 90 95; do
    OUTPUT="test-output/test_q${QUALITY}.webp"
    cwebp -q $QUALITY "$SAMPLE_IMAGE" -o "$OUTPUT" &> /dev/null

    WEBP_SIZE=$(stat -f%z "$OUTPUT")
    SAVED=$((ORIGINAL_SIZE - WEBP_SIZE))
    PERCENT=$((SAVED * 100 / ORIGINAL_SIZE))

    printf "  Quality %2d: %7s (saved %7s, %2d%%)\n" \
        $QUALITY \
        "$(echo $WEBP_SIZE | awk '{printf "%.2f MB", $1/1048576}')" \
        "$(echo $SAVED | awk '{printf "%.2f MB", $1/1048576}')" \
        $PERCENT
done

echo ""
echo "Test complete! Check test-output/ directory to compare quality."
echo ""
echo "Commands to view images:"
echo "  open '$SAMPLE_IMAGE'           # Original"
echo "  open test-output/test_q85.webp  # Quality 85 (recommended)"
echo "  open test-output/test_q90.webp  # Quality 90 (higher quality)"
echo ""
echo "Once satisfied with quality, run the full optimization:"
echo "  ./scripts/optimize-images.sh --quality 85 --format webp"
