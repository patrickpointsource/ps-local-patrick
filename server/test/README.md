Add your unit tests to this directory.

## REST Tests

To run the REST tests, install mocha, casperjs and phantomjs globally:

```
npm install -g mocha casperjs phantomjs
```

Then run the tests:

```
USER_GUSER="psapps2@pointsourcellc.com" USER_GPASSWD="PSapps123" ADMIN_GUSER="psapps@pointsourcellc.com" ADMIN_GPASSWD="ps@pp\$777" sprout test
```

Alternatively, run the test script directly:

```
USER_GUSER="psapps2@pointsourcellc.com" USER_GPASSWD="PSapps123" ADMIN_GUSER="psapps@pointsourcellc.com" ADMIN_GPASSWD="ps@pp\$777" node server/test/runTests.js
```