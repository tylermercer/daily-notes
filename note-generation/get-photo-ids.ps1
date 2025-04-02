# Load .env file to get the access key
$envFile = ".env"

if (Test-Path $envFile) {
    $envVars = Get-Content $envFile | Where-Object { $_ -match '^\s*[^#]' }
    foreach ($line in $envVars) {
        if ($line -match '^UNSPLASH_ACCESS_KEY=(.*)$') {
            $apiKey = $matches[1]
        }
    }
} else {
    Write-Error "No .env file found in the current directory."
    exit
}

# Ensure the access key is loaded
if (-not $apiKey) {
    Write-Error "API key is missing from .env file."
    exit
}


# Define the Unsplash API URL for the ocean topic
$unsplashApiUrl = "https://api.unsplash.com/topics/nature/photos"

# Define parameters
$perPage = 30  # Number of images per page (Unsplash allows up to 30 per request)
$totalImages = 365  # Total number of image IDs needed
$pageCount = [math]::Ceiling($totalImages / $perPage)

# Initialize an empty array to store image IDs
$imageIds = @()

# Loop through pages and fetch the image data
for ($page = 1; $page -le $pageCount; $page++) {
    $url = "$unsplashApiUrl" + "?client_id=$apiKey&per_page=$perPage&page=$page"

    # Send the request to the Unsplash API and get the response
    $response = Invoke-RestMethod -Uri $url -Method Get

    # Add image IDs to the array
    $response | ForEach-Object {
        $imageIds += $_.id
    }
}

# Optionally, save to a file
$imageIds | Out-File -FilePath "ocean_image_ids.txt"