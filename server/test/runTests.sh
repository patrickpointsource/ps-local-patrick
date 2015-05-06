#!/bin/bash

client_id='141952851027-natg34uiqel1uh66im6k7r1idec5u8dh.apps.googleusercontent.com'
client_secret='xx9Om8aLgwzlmeBmSGoOqwdh' 
scope='profile'
# Form the request URL
# http://goo.gl/U0uKEb
auth_url="http://localhost:8080/login.html?justShowCode"

echo "Please go to:"
echo
echo "$auth_url"
echo
echo "After accepting, copy the code that appears in your browser and paste below:"
response=`{ echo 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n'; cat ../client/src/login.html; } | nc -l 8080`

read auth_code

AUTH_CODE="$auth_code" mocha -t 10000 test