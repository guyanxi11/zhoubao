@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Local preview. Press Ctrl+C to stop.
npx --yes --package=serve serve -l 4177 .
