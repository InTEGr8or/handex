Push-Location "D:/T3/Projects/self/handex.io"
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "assets"
$watcher.Filter = "jsconfig.json"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

$action = { Remove-Item -Path "assets/jsconfig.json" -Force }

Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action -SourceIdentifier "jsconfig-watcher"

Write-Host "The watcher has started. To stop the watcher, you can run: Unregister-Event -SourceIdentifier  'jsconfig-watcher'"

Pop-Location