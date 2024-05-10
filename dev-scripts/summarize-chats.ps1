# Assuming your OpenAI API key is stored in the environment variable "OPENAI_API_KEY"
$openAiApiKey = [System.Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")

# Define the OpenAI API URL for the chat completions endpoint
$openAiUrl = "https://api.openai.com/v1/engines/gpt-3.5-turbo/completions"

# Prepare the headers with the authorization
$headers = @{
    "Authorization" = "Bearer $openAiApiKey"
    "Content-Type" = "application/json"
}


# Define the directory containing the chat files
$directory = "docs/chats/"

# Get all markdown files in the directory
$files = Get-ChildItem -Path $directory -Filter "Codeium Chat - *.md"
write-host "Filess: $files"
foreach ($file in $files) {
    # Get the full path of the file
    $filepath = Join-Path $directory $file.Name

    # Get the last modification time of the file
    $fileModificationDateTime = (Get-Item $filepath).LastWriteTime

    # If the file was modified within the last 24 hours, skip it
    # if ((Get-Date) - $fileModificationDateTime -lt [TimeSpan]::FromDays(1)) {
    #     continue
    # }

    # Read the content of the file
    $content = Get-Content $filepath -Raw

    # Look for the first occurrence of the datetime pattern and convert it to a datetime object
    $datetimePattern = '\d{1,2}:\d{2} [ap]m, [A-Z][a-z]{2} \d{1,2}, \d{4}'
    $dateStr = [Regex]::Match($content, $datetimePattern).Value
    if ($dateStr) {
        # Parse the datetime string into a datetime object
        $dateObj = [DateTime]::ParseExact($dateStr, "h:mm tt, MMM d, yyyy", $null)
    }

    # Truncate the content if necessary (not shown in this example)
    $safeCharLimit = 16000  # Adjust this limit based on your observations
    if ($content.Length -gt $safeCharLimit) {
        $content = $content.Substring(0, $safeCharLimit) + "..."
    }
    # The instruction to summarize the chat
    $instruction = "Please summarize the following chat:"
    # The chat content that needs to be summarized
    $chatContent = $content  # Your chat content here

    # Create the full prompt including the instruction and the chat content
    $fullPrompt = $instruction + "`n`n" + $chatContent
    # Send the content to an API to obtain a summary (not shown in this example)

    # Define the data payload for the API request
    $body = @{
        prompt = $fullPrompt
        max_tokens = 150   # Adjust as needed
        temperature = 0.7  # Adjust as needed
    } | ConvertTo-Json -Depth 10
    write-host $body
    
    # Send the API request
    $response = Invoke-RestMethod -Method Post -Uri $openAiUrl -Headers $headers -Body $body
    $summary = $response.choices[0].text.Trim()

    # Write the summary to the console
    Write-Host $summary


    # # Construct the new content with the summary and original content
    # $newContent = "---`n"
    # $newContent += "original file name: " + $file.Name + "`n"
    # $newContent += "summary: " + $summary + "`n"
    # $newContent += "date: " + $dateObj.ToString("yyyy-MM-ddTHH:mm") + "`n"
    # $newContent += "---`n`n"
    # $newContent += $content

    
    # # Write the new content back to the file
    # Set-Content -Path $filepath -Value $newContent

    # # Rename the file with a new name based on the summary and date
    # $title = $title.ToLower().Replace(' ', '-').Replace('_', '-')
    # $title = [Regex]::Replace($title, "[^\w\-]", "")
    # $newFilename = $dateObj.ToString("yyyy-MM-dd") + "-" + $title + ".md"
    # Write-Host "Renaming $($file.Name) to $newFilename"
    # Rename-Item -Path $filepath -NewName $newFilename
}