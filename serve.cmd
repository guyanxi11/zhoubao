@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 本地预览（Ctrl+C 结束）
npx --yes serve .
