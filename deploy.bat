@echo off
echo Installing dependencies...
npm install

echo Building the project...
npm run build

echo Project ready for deployment!
echo.
echo To deploy to Vercel:
echo 1. Install Vercel CLI: npm i -g vercel
echo 2. Run: vercel --prod
echo.
pause