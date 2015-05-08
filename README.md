# PS Sprout Project

This is a Sprout-based project!

Please populate this Markdown-based README with information pertinent to your project!

## Getting Started

### Install sprout-cli

First, make sure you have access to the PointSource NPM registry. [Check here](https://github.com/pointsource/sprout-cli/wiki/Accessing-PointSource-NPM-Registry) for details.

Next, install sprout-cli. Sprout is available from PointSource's private npm registry. You can install it by running:

```
npm install -g sprout-cli
```

Alternatively, the beta version of sprout is also available through npm:

```
npm install -g sprout-cli@beta
```

However, the latest non-beta version should be acceptable.

### Clone the repo and checkout the `newsprout` branch

```
git clone git@github.com:PointSource/MasterMind.git
cd MasterMind
git checkout newsprout
```

### Install `npm` and `bower` dependencies via `sprout-cli`

```
sprout npm install
sprout bower install
cd client
npm install
cd ..
```

Ideally all of these will be replaced in future versions of `sprout-cli` with simply `sprout install`.

### Startup the server and client

##### Using `sprout-cli`'s handy utility:

```
sprout project start
```

##### Or manually:

For the client:
```
cd client
gulp
```

For the server:
```
cd server
nodemon
```

### Access 

The client will be running at [http://localhost:8080](http://localhost:8080). You can login at [http://localhost:8080/login.html](http://localhost:8080/login.html). The client gulp server will proxy any API requests at /v3 (e.g. [http://localhost:8080/v3/tasks](http://localhost:8080/v3/tasks)).

The server is running at [http://localhost:3000](http://localhost:3000). If you've authenticated via the client and visit an API endpoint, the proper cookies should be sent to consider you authenticated, but it might be simplest to use the aforementioned proxy to more closely replicate what a production scenario would be like.