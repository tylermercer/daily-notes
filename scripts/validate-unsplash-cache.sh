#!/bin/bash

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed. Please install it (e.g., brew install jq or sudo apt install jq)."
    exit 1
fi

echo "Starting image URL validation..."
echo "--------------------------------"

# Loop through all JSON files in the current directory
for file in *.json; do
    echo "Processing file: $file"
    
    # Extract all values from the 'urls' object
    urls=$(jq -r '.urls[]' "$file")

    for url in $urls; do
        # Use curl to get the HTTP status code. 
        # --head: only fetch headers
        # --location: follow redirects
        # --silent: hide progress bar
        status=$(curl -o /dev/null -s -w "%{http_code}" --head --location "$url")

        if [ "$status" -eq 200 ]; then
            echo "  [OK]  $status - $url"
        else
            echo "  [FAIL] $status - $url"
        fi
    done
    echo "--------------------------------"
done

echo "Validation complete."