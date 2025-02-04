@echo off
REM Create client structure
mkdir client\src\app\core
mkdir client\src\app\features\auth
mkdir client\src\app\features\conversion
mkdir client\src\app\features\dashboard
mkdir client\src\app\shared

REM Create server structure
mkdir server\src\config
mkdir server\src\controllers
mkdir server\src\middleware
mkdir server\src\models
mkdir server\src\routes
mkdir server\src\services\auth
mkdir server\src\services\queue
mkdir server\src\services\storage
mkdir server\src\utils

REM Create worker structure
mkdir worker\src\config
mkdir worker\src\services\converter
mkdir worker\src\services\queue
mkdir worker\src\services\storage
mkdir worker\src\utils

REM Create load-tests structure
mkdir load-tests\scripts\curl
mkdir load-tests\scripts\k6
mkdir load-tests\data
mkdir load-tests\results

REM Create docker structure
mkdir docker\client
mkdir docker\server
mkdir docker\worker
mkdir docker\nginx 