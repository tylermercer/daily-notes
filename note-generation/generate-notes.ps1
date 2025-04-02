$quotesFile = "./note-generation/questions.txt" # Path to your newline-separated quotes file
$idsFile = "./note-generation/nature_image_ids.txt" # Path to your newline-separated image IDs file
$outputFolder = "./src/content-demo" # Folder where markdown files will be saved

# Ensure output folder exists
if (!(Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
}

# Read quotes from file
$quotes = Get-Content $quotesFile
$ids = Get-Content $idsFile

# Iterate over each day of the current year
$year = (Get-Date).Year
for ($day = 1; $day -le 365; $day++) {
    $date = [datetime]::new($year, 1, 1).AddDays($day - 1)
    $formattedDate = $date.ToString("yyyy-MM-dd")
    $filePath = "$outputFolder/$formattedDate.md"
    
    # Get random Unsplash image ID
    $unsplashId = $ids[$day-1]
    
    # Select a random quote
    $quote = $quotes[$day-1]
    
    # Write markdown content
    $content = "---
unsplashId: $unsplashId
---

$quote
"
    $content | Out-File -Encoding UTF8 -FilePath $filePath
}

Write-Output "Markdown files generated in $outputFolder"
