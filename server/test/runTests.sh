#!/bin/bash

auth_url="http://localhost:8080/login.html?justShowCode"

echo "Please go to:"
echo
echo "$auth_url"
echo
echo "After accepting, copy the code that appears in your browser and paste below:"
response=`{ echo 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n'; cat ../client/src/login.html; } | nc -l 8080`

read auth_code

AUTH_CODE="$auth_code" mocha -t 10000 test