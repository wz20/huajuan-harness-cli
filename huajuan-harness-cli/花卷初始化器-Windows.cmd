@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Huajuan Harness CLI
chcp 65001 >nul
cd /d "%~dp0"

if not exist ".harness\.huajuan.json" (
  echo [ERROR] 未找到完整的 .harness。
  echo 请先解压整个 Huajuan-Harness ZIP，再双击本脚本。
  if not defined HUAJUAN_NO_PAUSE pause
  exit /b 1
)
if not exist ".harness\.huajuan.mjs" (
  echo [ERROR] Huajuan CLI 文件缺失，请重新下载并完整解压。
  if not defined HUAJUAN_NO_PAUSE pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未找到 Node.js 20 或更高版本。
  echo 安装 Node.js 后，请关闭本窗口并重新双击启动器。
  if not defined HUAJUAN_NO_PAUSE pause
  exit /b 1
)

node -e "const marker=require('./.harness/.huajuan.json');process.exit(marker.product==='huajuan-harness'?0:1)"
if errorlevel 1 (
  echo [ERROR] 当前 .harness 不是有效的 Huajuan Harness。
  if not defined HUAJUAN_NO_PAUSE pause
  exit /b 1
)

set "NODE_MAJOR="
for /f "delims=" %%V in ('node -p "process.versions.node.split('.')[0]" 2^>nul') do set "NODE_MAJOR=%%V"
if not defined NODE_MAJOR (
  echo [ERROR] 无法读取 Node.js 版本。
  if not defined HUAJUAN_NO_PAUSE pause
  exit /b 1
)
if %NODE_MAJOR% LSS 20 (
  echo [ERROR] Node.js 版本过低，当前为 %NODE_MAJOR%，需要 20 或更高版本。
  if not defined HUAJUAN_NO_PAUSE pause
  exit /b 1
)

if defined HUAJUAN_INIT_ANSWERS_FILE (
  node ".harness\.huajuan.mjs" install-parent --answers "%HUAJUAN_INIT_ANSWERS_FILE%"
) else (
  node ".harness\.huajuan.mjs" install-parent
)
set "EXIT_CODE=%ERRORLEVEL%"
if not defined HUAJUAN_NO_PAUSE pause
exit /b %EXIT_CODE%
