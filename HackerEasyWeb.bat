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
echo HackerEasyWeb 控制面板
echo.
echo 1) 启动服务器
echo 2) 安装服务器
echo 3) 卸载服务器
echo 4) 备份数据库
echo 5) 退出控制面板
echo.
set /p "control=请输入选项："
if "%control%" equ "1" goto start_server
if "%control%" equ "2" goto install_server
if "%control%" equ "3" goto uninstall_server
if "%control%" equ "4" goto backup_db
if "%control%" equ "5" goto quit_panel
echo.
echo 选项错误
echo 请输入正确选项...
echo.
echo 按任意键重试
pause > nul
goto menu

:start_server
cls
cd /d %~dp0
title title HackerEasyWeb 控制面板 - 启动
cd HackerEasyWeb
"../node-v22.19.0-win-x64/npm.cmd" start
goto menu

:install_server
cls
cd /d %~dp0
title HackerEasyWeb 控制面板 - 安装
echo 正在准备网络下载......
PowerShell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor 3072" 2>&1
echo 正在下载文件......
PowerShell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.19.0/node-v22.19.0-win-x64.zip' -OutFile '%cd%\node-v22.19.0-win-x64.zip'" 2>&1
if exist "%cd%\node-v22.19.0-win-x64.zip" (
   echo 下载成功,正在为您解压...
   PowerShell -Command "Expand-Archive -Path '%cd%\node-v22.19.0-win-x64.zip' -DestinationPath '%cd%' -Force" 2>&1
   echo 目前解压完成！
   del "%cd%\node-v22.19.0-win-x64.zip"
   echo 开始安装软件依赖......
   cd HackerEasyWeb
   "../node-v22.19.0-win-x64/npm.cmd" install
   echo.
   echo 安装成功!
   echo 按任意键退出
   pause > nul
   exit
) else (
   echo.
   echo 下载失败, 请检查您的网络或尝试从Github下载最新版本的HackerEasyWeb
   echo 按任意键退出
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
title HackerEasyWeb 控制面板 - 备份数据库
echo.
echo 正在确认数据库文件......
echo.
cd HackerEasyWeb
if exist "database.xlsx" (
   copy /y "database.xlsx" "C:\database.xlsx" > nul
   echo 已成功备份database.xlsx到C盘根目录
   echo.
   echo 按任意键返回控制面板
   pause > nul
   goto menu
) else (
   echo 备份失败,您当前服务器没有数据库文件......
   echo 您可以先启动过一次服务器后再选择备份
   echo.
   echo 按任意键返回控制面板
   pause > nul
   goto menu
)

:quit_panel
cls
cd /d %~dp0
title HackerEasyWeb 控制面板 - 退出控制面板
echo.
echo 正在退出......
exit