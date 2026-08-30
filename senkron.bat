@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  TR -^> ABD Paneli - senkron
echo  ---------------------------------

where git >nul 2>nul
if errorlevel 1 (
  echo  HATA: git bulunamadi.
  echo  https://git-scm.com/download/win adresinden kurup tekrar dene.
  pause
  exit /b 1
)

if exist "%USERPROFILE%\Downloads\state.json" (
  move /y "%USERPROFILE%\Downloads\state.json" "%~dp0state.json" >nul
  echo  state.json Indirilenler klasorunden alindi.
) else (
  echo  Indirilenler klasorunde state.json yok - mevcut dosya kullanilacak.
)

git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo  Degisiklik yok, gonderilecek bir sey bulunamadi.
  pause
  exit /b 0
)

git commit -m "panel: durum guncellendi"
git push
if errorlevel 1 (
  echo.
  echo  Gonderilemedi. GitHub girisi istenmis olabilir.
) else (
  echo.
  echo  Tamam. Telefondaki panel birkac dakika icinde guncellenir.
)
pause
