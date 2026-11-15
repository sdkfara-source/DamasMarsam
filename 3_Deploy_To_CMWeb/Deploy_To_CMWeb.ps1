<#
.SYNOPSIS
    Honest deploy/verify helper for Damascus Digital Studio (SVU-F25 CM).

.DESCRIPTION
    This script does NOT fake a deployment. It can:
      - Verify that the planned public domain is actually serving the site.
      - Optionally upload the project to an FTP/FTPS host when real
        credentials and a provisioned hosting account are available.

    The planned domain damascus-digital.infinityfreeapp.com currently
    resolves in DNS but is not attached to a hosting account, so InfinityFree
    returns a "DNS Resolution Error / Domain Not Found" page. Verify mode
    reports that state and exits non-zero until a real deployment succeeds.

.PARAMETER Verify
    Probe the public URL and exit 0 only when the response looks like the
    deployed storefront. Exits non-zero otherwise. This is the default mode.

.PARAMETER Deploy
    Upload files over FTP/FTPS. Requires -FtpHost, -FtpUser and -FtpPassword.
    Use -WhatIfDeploy to print the upload plan without transferring files.

.PARAMETER Domain
    Public URL to verify. Defaults to the planned project domain.

.PARAMETER LocalPath
    Folder to upload in -Deploy mode. Defaults to the project root.

.PARAMETER RemotePath
    Remote root folder on the FTP server (e.g. /htdocs).

.PARAMETER FtpHost
    FTP/FTPS hostname.

.PARAMETER FtpUser
    FTP username.

.PARAMETER FtpPassword
    FTP password. Prefer passing it from a secure prompt or secret store;
    do not hard-code credentials in this repository.

.PARAMETER UseSsl
    Use FTPS (Explicit TLS) for the control/data channel.

.PARAMETER WhatIfDeploy
    Show what would be uploaded without connecting to FTP.

.EXAMPLE
    .\Deploy_To_CMWeb.ps1 -Verify

.EXAMPLE
    .\Deploy_To_CMWeb.ps1 -Deploy -FtpHost ftpupload.net -FtpUser <user> -FtpPassword <secret> -RemotePath /htdocs -UseSsl
#>

[CmdletBinding(DefaultParameterSetName = 'Verify')]
param(
    [Parameter(ParameterSetName = 'Verify')]
    [switch] $Verify,

    [Parameter(ParameterSetName = 'Deploy', Mandatory = $true)]
    [switch] $Deploy,

    [string] $Domain = 'https://damascus-digital.infinityfreeapp.com',

    [string] $LocalPath = '',

    [string] $RemotePath = '/htdocs',

    [Parameter(ParameterSetName = 'Deploy')]
    [string] $FtpHost,

    [Parameter(ParameterSetName = 'Deploy')]
    [string] $FtpUser,

    [Parameter(ParameterSetName = 'Deploy')]
    [string] $FtpPassword,

    [Parameter(ParameterSetName = 'Deploy')]
    [switch] $UseSsl,

    [Parameter(ParameterSetName = 'Deploy')]
    [switch] $WhatIfDeploy
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Resolve project root robustly (works under -File and interactive invocation).
if (-not $LocalPath) {
    $scriptPath = $PSCommandPath
    if (-not $scriptPath) { $scriptPath = $MyInvocation.MyCommand.Path }
    if (-not $scriptPath) { $scriptPath = $MyInvocation.ScriptName }
    if ($scriptPath) {
        $LocalPath = Split-Path -Parent (Split-Path -Parent $scriptPath)
    } else {
        $LocalPath = (Get-Location).Path
    }
}

function Write-Status([string] $Level, [string] $Message) {
    $color = switch ($Level) {
        'OK'   { 'Green' }
        'WARN' { 'Yellow' }
        'ERR'  { 'Red' }
        default { 'Cyan' }
    }
    Write-Host "[$Level] $Message" -ForegroundColor $color
}

function Test-PublicSite([string] $Url) {
    $result = [ordered]@{
        Url        = $Url
        Reachable  = $false
        StatusCode = $null
        LooksLive  = $false
        Detail     = ''
    }

    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 5
        $result.Reachable = $true
        $result.StatusCode = $resp.StatusCode
        $body = [string]$resp.Content

        $domainNotFound = ($body -match 'Domain Not Found') -or ($body -match 'DNS Resolution Error') -or ($body -match 'does not have an account at InfinityFree')
        $isStorefront   = ($body -match 'Damascus Digital Studio') -or ($body -match 'مرسم دمشق')

        if ($isStorefront -and -not $domainNotFound) {
            $result.LooksLive = $true
            $result.Detail = 'Storefront content detected.'
        } elseif ($domainNotFound) {
            $result.Detail = 'Domain resolves, but the hosting account/site is not attached (InfinityFree domain-not-found page).'
        } else {
            $result.Detail = 'HTTP response received but it does not look like the Damascus Digital Studio storefront.'
        }
    } catch {
        $result.Detail = "Request failed: $($_.Exception.Message)"
    }

    return [pscustomobject]$result
}

function Get-UploadFiles([string] $Root) {
    $exclude = @('\.git\\', '\\_oc4_verify\\', '\\node_modules\\')
    Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object {
        $path = $_.FullName
        foreach ($pattern in $exclude) { if ($path -match $pattern) { return $false } }
        return $true
    }
}

function Ensure-FtpDirectory([string] $UriBase, [string] $RelativeDir, [System.Net.NetworkCredential] $Cred, [bool] $Ssl) {
    if (-not $RelativeDir) { return }
    $parts = $RelativeDir -split '[\\/]+' | Where-Object { $_ -and $_ -ne '.' }
    $current = $UriBase.TrimEnd('/')
    foreach ($part in $parts) {
        $current = "$current/$part"
        try {
            $req = [System.Net.FtpWebRequest]::Create($current)
            $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $req.Credentials = $Cred
            $req.EnableSsl = $Ssl
            $req.UseBinary = $true
            $req.KeepAlive = $false
            $resp = $req.GetResponse()
            $resp.Close()
        } catch {
            # Directory may already exist; ignore 550.
        }
    }
}

function Send-FtpFile([string] $Uri, [string] $LocalFile, [System.Net.NetworkCredential] $Cred, [bool] $Ssl) {
    $req = [System.Net.FtpWebRequest]::Create($Uri)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $req.Credentials = $Cred
    $req.EnableSsl = $Ssl
    $req.UseBinary = $true
    $req.KeepAlive = $false
    $bytes = [System.IO.File]::ReadAllBytes($LocalFile)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $resp = $req.GetResponse()
    $resp.Close()
}

# ----------------------------- main -----------------------------

if (-not $Deploy) { $Verify = $true }

Write-Status 'INFO' "Project root : $LocalPath"
Write-Status 'INFO' "Verify URL   : $Domain"

$verifyResult = Test-PublicSite -Url $Domain
if ($verifyResult.LooksLive) {
    Write-Status 'OK' "Domain is live (HTTP $($verifyResult.StatusCode)). $($verifyResult.Detail)"
} elseif ($verifyResult.Reachable) {
    Write-Status 'WARN' "Domain is reachable (HTTP $($verifyResult.StatusCode)) but NOT serving the storefront. $($verifyResult.Detail)"
} else {
    Write-Status 'ERR' "Domain verification failed. $($verifyResult.Detail)"
}

if ($Deploy) {
    if (-not $FtpHost -or -not $FtpUser -or -not $FtpPassword) {
        Write-Status 'ERR' 'Deploy mode requires -FtpHost, -FtpUser and -FtpPassword.'
        exit 2
    }

    $files = @(Get-UploadFiles -Root $LocalPath)
    Write-Status 'INFO' "Files selected for upload: $($files.Count)"

    if ($WhatIfDeploy) {
        Write-Status 'WARN' 'WhatIfDeploy: no files will be transferred. Upload plan follows:'
        foreach ($f in $files) {
            $rel = $f.FullName.Substring($LocalPath.Length).TrimStart('\', '/')
            Write-Host "  PLAN  $rel"
        }
        Write-Status 'INFO' 'Re-run without -WhatIfDeploy to perform the FTP upload.'
    } else {
        $cred = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
        $base = "ftp://$($FtpHost.TrimEnd('/'))/$($RemotePath.TrimStart('/'))"
        $base = $base.TrimEnd('/')
        Ensure-FtpDirectory -UriBase "ftp://$($FtpHost.TrimEnd('/'))" -RelativeDir $RemotePath.TrimStart('/') -Cred $cred -Ssl ([bool]$UseSsl)

        $i = 0
        foreach ($f in $files) {
            $i++
            $rel = $f.FullName.Substring($LocalPath.Length).TrimStart('\', '/')
            $remoteRel = $rel -replace '\\', '/'
            $dir = [System.IO.Path]::GetDirectoryName($remoteRel)
            if ($dir) { Ensure-FtpDirectory -UriBase $base -RelativeDir $dir -Cred $cred -Ssl ([bool]$UseSsl) }
            $uri = "$base/$remoteRel"
            Write-Host "  [$i/$($files.Count)] $remoteRel"
            Send-FtpFile -Uri $uri -LocalFile $f.FullName -Cred $cred -Ssl ([bool]$UseSsl)
        }
        Write-Status 'OK' 'FTP upload completed. Running post-deploy verification...'
        $verifyResult = Test-PublicSite -Url $Domain
        if ($verifyResult.LooksLive) {
            Write-Status 'OK' "Post-deploy verification passed (HTTP $($verifyResult.StatusCode))."
        } else {
            Write-Status 'ERR' "Post-deploy verification FAILED. $($verifyResult.Detail)"
        }
    }
}

if (-not $verifyResult.LooksLive) {
    Write-Status 'ERR' 'Deployment is not verified as live. This script exits non-zero by design.'
    Write-Status 'INFO' 'Action required: attach the domain to a provisioned hosting account, upload 1_Runnable_Storefront_WebApp and/or 2_OpenCart4_Server_Package, then re-run -Verify.'
    exit 1
}

exit 0
