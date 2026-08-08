@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

if not exist ".harness\.huajuan.json" (
  echo 初始化器当前目录缺少完整的 .harness。请保持 Release 文件结构不变。
  pause
  exit /b 1
)
if not exist ".harness\.huajuan.mjs" (
  echo Huajuan CLI 缺失。
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$marker = Get-Content -Raw -LiteralPath '.harness\.huajuan.json' | ConvertFrom-Json; if ($marker.product -ne 'huajuan-harness') { exit 1 }"
if errorlevel 1 (
  echo 当前 .harness 不是 Huajuan Harness。
  pause
  exit /b 1
)

set "NODE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE set "NODE=%%N"
if not defined NODE (
  echo 未找到 Node.js 20+。请安装后重试。
  pause
  exit /b 1
)

set "NODE_MAJOR=0"
for /f "delims=" %%V in ('"%NODE%" -p "process.versions.node.split('.')[0]"') do set "NODE_MAJOR=%%V"
if %NODE_MAJOR% LSS 20 (
  echo Node.js 版本过低，需要 20 或更高版本。
  pause
  exit /b 1
)

if defined HUAJUAN_INIT_ANSWERS_FILE (
  "%NODE%" ".harness\.huajuan.mjs" install-parent --answers "%HUAJUAN_INIT_ANSWERS_FILE%"
) else (
  "%NODE%" ".harness\.huajuan.mjs" install-parent
)
set "EXIT_CODE=%ERRORLEVEL%"
pause
exit /b %EXIT_CODE%
