@echo off
chcp 65001 > nul
echo Запуск Конструктора Спецификаций Spectool...
cd /d "%~dp0"
start http://localhost:3000
npm.cmd run dev
pause

