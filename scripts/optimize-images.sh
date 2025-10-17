#!/bin/bash

#
# Image Optimization Script for VBCards
#
# This script optimizes PNG images in public/data directory using:
# - sips (macOS built-in image tool)
# - pngquant (optional, for better PNG compression)
# - cwebp (optional, for WebP conversion)
#
# Usage:
#   ./scripts/optimize-images.sh [options]
#
# Options:
#   --quality <0-100>   Quality for WebP/PNG (default: 85)
#   --format <format>   Output format: webp|png|both (default: webp)
#   --backup            Create backup before optimization
#   --dry-run           Show what would be done without executing
#   --in-place          Optimize files in place (overwrites originals)
#   --help              Show this help message
#

set -e

# Default configuration
QUALITY=85
FORMAT="webp"
BACKUP=false
DRY_RUN=false
IN_PLACE=false
SOURCE_DIR="public/data"
OUTPUT_DIR="public/data-optimized"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quality)
            QUALITY="$2"
            shift 2
            ;;
        --format)
            FORMAT="$2"
            shift 2
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --in-place)
            IN_PLACE=true
            shift
            ;;
        --help)
            grep "^#" "$0" | grep -v "^#!/" | sed 's/^# //g' | sed 's/^#//g'
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate format
if [[ ! "$FORMAT" =~ ^(webp|png|both)$ ]]; then
    echo -e "${RED}Invalid format: $FORMAT. Must be webp, png, or both${NC}"
    exit 1
fi

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}Error: Source directory '$SOURCE_DIR' not found${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to format bytes to human readable
format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "$(( bytes / 1048576 ))MB"
    fi
}

# Check for optional tools
HAS_PNGQUANT=false
HAS_CWEBP=false

if command -v pngquant &> /dev/null; then
    HAS_PNGQUANT=true
    print_status "pngquant found - will use for PNG optimization"
fi

if command -v cwebp &> /dev/null; then
    HAS_CWEBP=true
    print_status "cwebp found - will use for WebP conversion"
fi

# Set output directory based on in-place flag
if [ "$IN_PLACE" = true ]; then
    OUTPUT_DIR="$SOURCE_DIR"
fi

# Display configuration
echo ""
print_status "=== Image Optimization Configuration ==="
echo "  Source directory: $SOURCE_DIR"
echo "  Output directory: $OUTPUT_DIR"
echo "  Quality: $QUALITY"
echo "  Format: $FORMAT"
echo "  In-place: $IN_PLACE"
echo "  Backup: $BACKUP"
echo "  Dry run: $DRY_RUN"
echo ""

# Create backup if requested
if [ "$BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    BACKUP_DIR="${SOURCE_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    print_status "Creating backup at $BACKUP_DIR..."
    cp -r "$SOURCE_DIR" "$BACKUP_DIR"
    print_success "Backup created"
fi

# Create output directory
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$OUTPUT_DIR"
fi

# Find all PNG files
PNG_FILES=$(find "$SOURCE_DIR" -type f -name "*.png")
TOTAL_FILES=$(echo "$PNG_FILES" | wc -l | tr -d ' ')
CURRENT=0
TOTAL_ORIGINAL_SIZE=0
TOTAL_OPTIMIZED_SIZE=0

print_status "Found $TOTAL_FILES PNG files to process"
echo ""

# Process each file
while IFS= read -r source_file; do
    CURRENT=$((CURRENT + 1))

    # Get relative path
    REL_PATH="${source_file#$SOURCE_DIR/}"
    DIR_PATH=$(dirname "$REL_PATH")
    FILENAME=$(basename "$source_file" .png)

    # Create output directory structure
    OUTPUT_SUBDIR="$OUTPUT_DIR/$DIR_PATH"

    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$OUTPUT_SUBDIR"
    fi

    # Get original file size
    ORIGINAL_SIZE=$(stat -f%z "$source_file")
    TOTAL_ORIGINAL_SIZE=$((TOTAL_ORIGINAL_SIZE + ORIGINAL_SIZE))

    # Progress indicator
    PERCENT=$((CURRENT * 100 / TOTAL_FILES))
    printf "\r[%3d%%] Processing %d/%d: %s" "$PERCENT" "$CURRENT" "$TOTAL_FILES" "$REL_PATH"

    if [ "$DRY_RUN" = true ]; then
        continue
    fi

    # Optimize based on format
    if [ "$FORMAT" = "webp" ] || [ "$FORMAT" = "both" ]; then
        OUTPUT_WEBP="$OUTPUT_SUBDIR/${FILENAME}.webp"

        if [ "$HAS_CWEBP" = true ]; then
            # Use cwebp for WebP conversion (no resize)
            cwebp -q "$QUALITY" "$source_file" -o "$OUTPUT_WEBP" &> /dev/null
        else
            print_warning "cwebp not found - WebP conversion requires 'brew install webp'"
            continue
        fi

        if [ -f "$OUTPUT_WEBP" ]; then
            WEBP_SIZE=$(stat -f%z "$OUTPUT_WEBP")
            TOTAL_OPTIMIZED_SIZE=$((TOTAL_OPTIMIZED_SIZE + WEBP_SIZE))
        fi
    fi

    if [ "$FORMAT" = "png" ] || [ "$FORMAT" = "both" ]; then
        OUTPUT_PNG="$OUTPUT_SUBDIR/${FILENAME}.png"

        if [ "$IN_PLACE" = true ]; then
            # Optimize in place
            if [ "$HAS_PNGQUANT" = true ]; then
                pngquant --quality=80-95 --ext .png --force "$source_file" &> /dev/null
                PNG_SIZE=$(stat -f%z "$source_file")
            else
                # Just copy if pngquant not available
                cp "$source_file" "$OUTPUT_PNG"
                PNG_SIZE=$ORIGINAL_SIZE
            fi
        else
            # Copy to output directory first
            cp "$source_file" "$OUTPUT_PNG"

            # Optimize with pngquant if available
            if [ "$HAS_PNGQUANT" = true ]; then
                pngquant --quality=80-95 --ext .png --force "$OUTPUT_PNG" &> /dev/null
            fi

            PNG_SIZE=$(stat -f%z "$OUTPUT_PNG")
        fi

        if [ "$FORMAT" = "png" ]; then
            TOTAL_OPTIMIZED_SIZE=$((TOTAL_OPTIMIZED_SIZE + PNG_SIZE))
        fi
    fi

done <<< "$PNG_FILES"

echo "" # New line after progress

# Calculate savings
if [ "$DRY_RUN" = false ]; then
    SAVED_SIZE=$((TOTAL_ORIGINAL_SIZE - TOTAL_OPTIMIZED_SIZE))
    SAVED_PERCENT=0
    if [ $TOTAL_ORIGINAL_SIZE -gt 0 ]; then
        SAVED_PERCENT=$((SAVED_SIZE * 100 / TOTAL_ORIGINAL_SIZE))
    fi

    echo ""
    print_status "=== Optimization Summary ==="
    echo "  Total files processed: $TOTAL_FILES"
    echo "  Original size: $(format_bytes $TOTAL_ORIGINAL_SIZE)"
    echo "  Optimized size: $(format_bytes $TOTAL_OPTIMIZED_SIZE)"
    echo "  Saved: $(format_bytes $SAVED_SIZE) (${SAVED_PERCENT}%)"
    echo ""

    if [ "$SAVED_PERCENT" -gt 50 ]; then
        print_success "Excellent compression achieved!"
    elif [ "$SAVED_PERCENT" -gt 30 ]; then
        print_success "Good compression achieved!"
    else
        print_warning "Moderate compression achieved. Consider adjusting quality settings."
    fi

    echo ""
    print_status "Optimized images saved to: $OUTPUT_DIR"

    if [ "$BACKUP" = true ]; then
        print_status "Backup saved to: $BACKUP_DIR"
    fi
else
    echo ""
    print_warning "Dry run completed - no files were modified"
fi

echo ""
print_success "Optimization complete!"

# Installation instructions for optional tools
if [ "$HAS_PNGQUANT" = false ] || [ "$HAS_CWEBP" = false ]; then
    echo ""
    print_warning "Optional tools not installed:"
    if [ "$HAS_PNGQUANT" = false ]; then
        echo "  - pngquant: Install with 'brew install pngquant' for better PNG compression"
    fi
    if [ "$HAS_CWEBP" = false ]; then
        echo "  - cwebp: Install with 'brew install webp' for WebP conversion"
    fi
fi
