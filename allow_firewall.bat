@echo off
echo Настройка Windows Firewall для Central Reporting...

REM Разрешаем входящие подключения на порт 8080 (backend)
netsh advfirewall firewall add rule name="Central Reporting Backend" dir=in action=allow protocol=TCP localport=8080

REM Разрешаем входящие подключения на порт 3000 (frontend)
netsh advfirewall firewall add rule name="Central Reporting Frontend" dir=in action=allow protocol=TCP localport=3000

echo.
echo Готово! Порты 3000 и 8080 открыты для входящих подключений.
echo Теперь другие компьютеры в сети могут подключаться к вашему серверу.
pause
