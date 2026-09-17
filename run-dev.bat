@echo off
title Synapse MCQ Studio (Dev Mode)
cd /d "%~dp0"
echo Starting Synapse MCQ Studio in Hot-Reload Dev Mode...
bun run tauri dev
