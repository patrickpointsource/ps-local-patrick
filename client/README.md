# PS Reference App

This is a reference implementation for the PointSource App Foundation (Sprout) projects.

It was generated using the PointSource [generator-sprout-client](https://github.com/PointSource/generator-sprout-client).

## Requirements

You'll need the following software installed to get started.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Git](http://git-scm.com/downloads): Use the installer for your OS.
    * Windows users can also try [Git for Windows](http://git-for-windows.github.io/).
  * [Ruby](https://www.ruby-lang.org/en/): Use the installer for your OS. For Windows users, [JRuby](http://jruby.org/) is a popular alternative.
    * With Ruby installed, run `gem install bundler sass`.
  * [Gulp](http://gulpjs.com/) and [Bower](http://bower.io): Run `[sudo] npm install -g gulp bower`

## Get Started

Clone this repository, where `app` is the name of your app.

```bash
git clone https://github.com/PointSource/PSReference.git app
```

Change into the directory.

```bash
cd app
```

Install the dependencies. Running `npm install` will also automatically run `bower install` after. If you're running Mac OS or Linux, you may need to run `sudo npm install` instead, depending on how your machine is configured. Running `bundle` will install the correct version of Sass for the template.

```bash
npm install
bower install
bundle
```

While you're working on your project, run:

```bash
gulp
```

This will compile the Sass and assemble your Angular app. **Now go to `localhost:8080` in your browser to see it in action.**