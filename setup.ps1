
Write-Host "Installing Python requirements in ocr_env..." -ForegroundColor Green
cd ocr_env
.\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "Downloading sort" -ForegroundColor Green
if (!(Test-Path -Path "sort")) { New-Item -ItemType Directory -Path "sort" }
# Fetch the files
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/abewley/sort/master/sort.py" -OutFile "sort\sort.py"
New-Item -Path "sort\__init__.py" -ItemType File -Force
cd ..


Write-Host "Setting Backend" -ForegroundColor Green
cd backend
npm install
cd ..

Write-Host "Setting up frontend" -ForegroundColor Green
cd "license plate frontend"
npm install
cd ..

Write-Host "Setup Complete!" -ForegroundColor Cyan