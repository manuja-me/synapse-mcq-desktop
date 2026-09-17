@echo off
title Synapse MCQ Studio
cd /d "%~dp0"
echo Starting Synapse MCQ Studio Native Desktop App...
start "" "%~dp0src-tauri\target\debug\app.exe"
