@echo off
echo Initializing Git repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Woreda Reporting System with Amharic support and Ethiopian calendar"

echo.
echo Git repository initialized successfully!
echo.
echo To push to GitHub:
echo 1. Create a new repository on GitHub
echo 2. Run: git remote add origin YOUR_GITHUB_URL
echo 3. Run: git push -u origin main
echo.
pause
