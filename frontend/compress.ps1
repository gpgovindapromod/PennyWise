Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\HP\Desktop\Finance\client\public\sports-car-hero.jpg"
$destPath = "C:\Users\HP\Desktop\Finance\client\public\sports-car-hero-opt.jpg"

$original = [System.Drawing.Image]::FromFile($srcPath)
$newWidth = 1000
$newHeight = [int]($original.Height * ($newWidth / $original.Width))
$resized = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
$graph = [System.Drawing.Graphics]::FromImage($resized)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph.DrawImage($original, 0, 0, $newWidth, $newHeight)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]70)

$resized.Save($destPath, $codec, $encoderParams)

$original.Dispose()
$resized.Dispose()
$graph.Dispose()

Write-Output "Optimized image generated successfully."
