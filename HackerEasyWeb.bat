@ echo off
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin

setlocal enabledelayedexpansion

:menu
cls
cd /d %~dp0
color F0
title HackerEasyWeb
echo.
echo HackerEasyWeb �������
echo.
echo 1) ����������
echo 2) ��װ������
echo 3) ж�ط�����
echo 4) �������ݿ�
echo 5) �˳��������
echo.
set /p "control=������ѡ�"
if "%control%" equ "1" goto start_server
if "%control%" equ "2" goto install_server
if "%control%" equ "3" goto uninstall_server
if "%control%" equ "4" goto backup_db
if "%control%" equ "5" goto quit_panel
echo.
echo ѡ�����
echo ��������ȷѡ��...
echo.
echo �����������
pause > nul
goto menu

:start_server
cls
cd /d %~dp0
title title HackerEasyWeb ������� - ����
cd HackerEasyWeb
"../node-v22.19.0-win-x64/npm.cmd" start
goto menu

:install_server
cls
cd /d %~dp0
title HackerEasyWeb ������� - ��װ
echo ����׼����������......
PowerShell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor 3072" 2>&1
echo ���������ļ�......
PowerShell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.19.0/node-v22.19.0-win-x64.zip' -OutFile '%cd%\node-v22.19.0-win-x64.zip'" 2>&1
if exist "%cd%\node-v22.19.0-win-x64.zip" (
   echo ���سɹ�,����Ϊ����ѹ...
   PowerShell -Command "Expand-Archive -Path '%cd%\node-v22.19.0-win-x64.zip' -DestinationPath '%cd%' -Force" 2>&1
   echo Ŀǰ��ѹ��ɣ�
   del "%cd%\node-v22.19.0-win-x64.zip"
   echo ��ʼ��װ�������......
   cd HackerEasyWeb
   "../node-v22.19.0-win-x64/npm.cmd" install
   echo.
   echo ��װ�ɹ�!
   echo ��������˳�
   pause > nul
   exit
) else (
   echo.
   echo ����ʧ��, ��������������Դ�Github�������°汾��HackerEasyWeb
   echo ��������˳�
   pause > nul
   exit
)

:uninstall_server
echo.
echo Not Ready
pause
goto menu

:backup_db
cls
cd /d %~dp0
title HackerEasyWeb ������� - �������ݿ�
echo.
echo ����ȷ�����ݿ��ļ�......
echo.
cd HackerEasyWeb
if exist "database.xlsx" (
   copy /y "database.xlsx" "C:\database.xlsx" > nul
   echo �ѳɹ�����database.xlsx��C�̸�Ŀ¼
   echo.
   echo ����������ؿ������
   pause > nul
   goto menu
) else (
   echo ����ʧ��,����ǰ������û�����ݿ��ļ�......
   echo ��������������һ�η���������ѡ�񱸷�
   echo.
   echo ����������ؿ������
   pause > nul
   goto menu
)

:quit_panel
cls
cd /d %~dp0
title HackerEasyWeb ������� - �˳��������
echo.
echo �����˳�......
exit