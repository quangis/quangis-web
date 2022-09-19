:: [SC] A private key for Django server. Any string. Make it as complex as possible
set DJANGO_KEY=
:: [SC] A username for the marklogic server
set TDB_USER=
:: [SC] A password for the marklogic server
set TDB_PASS=

:: [SC] address of the question parser service (e.g., localhost, 127.0.0.1, etc)
set QPARSE_IP=localhost
:: [SC] port on which the question parser service is running
set QPARSE_PORT=5570
:: [SC] how long to wait for a response from the question parser service (in milliseconds)
set QPARSE_WAIT=60000

:: [SC] this line starts the django test server at port 8081, change the port as it suits you
python manage.py runserver 8081