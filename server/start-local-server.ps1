$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
& 'C:\Program Files\nodejs\node.exe' '.\server\index.js'
