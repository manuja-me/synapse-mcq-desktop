@echo off
title Synapse MCQ Studio
cd /d "%~dp0"
echo Launching Synapse MCQ Studio (Release Mode)...
if exist "%~dp0src-tauri\target\release\app.exe" (
    start "" "%~dp0src-tauri\target\release\app.exe"
) else (
    start "" "%~dp0src-tauri\target\debug\app.exe"
)
