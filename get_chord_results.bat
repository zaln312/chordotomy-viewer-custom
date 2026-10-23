@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

REM ============================================================
REM  Drag-and-drop chord recognition script
REM   Input: any music file (xxx.flac etc.)
REM   Output: same directory as input
REM           xxx.chords.json      (chordotomy)
REM           xxx_ChordFormer.lab  (ChordFormer)
REM ============================================================

if "%~1"=="" (
    echo.
    echo  Usage: Drag a music file onto this script icon.
    echo.
    pause
    exit /b 1
)

set "MUSIC=%~f1"
set "NAME=%~n1"
set "DIR=%~dp1"
if "%DIR:~-1%"=="\" set "DIR=%DIR:~0,-1%"

set "JSON=%DIR%\%NAME%_chordotomy.json"
set "LAB=%DIR%\%NAME%_ChordFormer.lab"

echo ============================================================
echo   Input file : %MUSIC%
echo   Output dir : %DIR%
echo ============================================================

REM ---------- Overwrite check ----------
set "OVERWRITE="
set "FORCE="
if exist "%JSON%" set "OVERWRITE=1"
if exist "%LAB%" set "OVERWRITE=1"
if not defined OVERWRITE goto :SKIP_OVERWRITE_ASK

echo.
echo ============================================================
echo   The following output files already exist:
if exist "%JSON%" echo     %JSON%
if exist "%LAB%" echo     %LAB%
echo ============================================================

:ASK_OVERWRITE
set "ANS="
set /p "ANS=Overwrite? (Y/N, default N): "
if /i "%ANS%"=="Y" goto :DO_OVERWRITE
if /i "%ANS%"=="N" goto :CANCEL
if "%ANS%"=="" goto :CANCEL
echo Invalid input. Please enter Y or N.
goto :ASK_OVERWRITE

:DO_OVERWRITE
if exist "%JSON%" del /f /q "%JSON%"
if exist "%LAB%" del /f /q "%LAB%"
set "FORCE=--force"
goto :SKIP_OVERWRITE_ASK

:CANCEL
echo.
echo Cancelled. Old files were not overwritten.
pause
exit /b 0

:SKIP_OVERWRITE_ASK

REM ---------- Step 1 / 2: chordotomy analyze ----------
echo.
echo [Step 1/2] Running chordotomy analyze ...
echo ^> cd /d "%DIR%"
echo ^> chordotomy analyze %FORCE% "%MUSIC%"
echo ------------------------------------------------------------
pushd "%DIR%"
call chordotomy analyze %FORCE% "%MUSIC%"
set "RC=%ERRORLEVEL%"
popd
if not "%RC%"=="0" (
    echo.
    echo [ERROR] chordotomy failed ^(exit code %RC%^)
    pause
    exit /b %RC%
)
echo [OK] Generated: %JSON%

REM ---------- Select chord vocabulary ----------
echo.
echo ============================================================
echo   Select chord vocabulary:
echo     [1] ismir2017   14 templates    basic triads/6th/7th/sus, no inversions/9/11/13
echo     [2] submission  25 templates    ismir2017 - 6th, + inversions/9/11/13/half-dim
echo     [3] extended    25 templates    submission + 6th, - b7 inversion
echo     [4] full        380 templates   almost all chords
echo ============================================================
:ASK
set "CHOICE="
set "VOCAB="
set /p "CHOICE=Enter number (default 2 submission): "
if "%CHOICE%"=="" set "CHOICE=2"
if "%CHOICE%"=="1" set "VOCAB=ismir2017"
if "%CHOICE%"=="2" set "VOCAB=submission"
if "%CHOICE%"=="3" set "VOCAB=extended"
if "%CHOICE%"=="4" set "VOCAB=full"
if not defined VOCAB (
    echo Invalid input. Please enter a number between 1 and 4.
    goto :ASK
)
echo Selected vocabulary: %VOCAB%

REM ---------- Step 2 / 2: ChordFormer ----------
set "CHFORMER_DIR=C:\Users\Zaln\Documents\AAvscoding\ChordFormer-Artificial-Dataset-Benchmarking"

echo.
echo [Step 2/2] Running ChordFormer chord recognition ...
echo ^> cd /d "%CHFORMER_DIR%"
echo ^> call .venv\Scripts\activate
echo ^> uv run chord_recognition.py "%MUSIC%" "%LAB%" %VOCAB%
echo ------------------------------------------------------------
cd /d "%CHFORMER_DIR%"
if errorlevel 1 (
    echo [ERROR] Cannot enter ChordFormer directory: %CHFORMER_DIR%
    pause
    exit /b 1
)
call .venv\Scripts\activate
call uv run chord_recognition.py "%MUSIC%" "%LAB%" %VOCAB%
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
    echo.
    echo [ERROR] ChordFormer failed ^(exit code %RC%^)
    pause
    exit /b %RC%
)

echo.
echo ============================================================
echo   All done!
echo   Output files:
echo     %JSON%
echo     %LAB%
echo ============================================================
pause
endlocal