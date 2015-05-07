Add your unit tests to this directory.

## REST Tests

To run the REST tests, install casperjs and phantomjs globally:

```
npm install -g casperjs phantomjs
```

Then run the tests:

```
GUSER="<you@pointsource.com>" GPASSWD="<your-@ps.com-password>" sprout test
```

or, without sprout:

```
GUSER="<you@pointsource.com>" GPASSWD="<your-@ps.com-password>" node server/test/runTests.js
```