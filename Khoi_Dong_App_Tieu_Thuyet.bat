@echo off
chcp 65001 >nul
title Studio Sáng Tác Tiểu Thuyết Của Bi (Desktop & Mobile App v38.0)
set "APP_PATH=%~dp0index.html"

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_PATH:\=/%"
    exit /b 0
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%APP_PATH:\=/%"
    exit /b 0
)
start "" "%APP_PATH%"
