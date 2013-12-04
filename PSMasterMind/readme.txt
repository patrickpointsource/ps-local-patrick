The deploy process of Mastermind hasn't been automated, so it's a bit of a pain.

Kevin came up with an easy method to deploy that I've followed. First, I tar up the directory using something like:

> tar cf Mastermind-*date*.tar PSMasterMind/

The downside of this is of course everything is getting included in the tarball. It's a large file.
I then move the file to Dropbox:

> mv Mastermind-*date*.tar ~/Dropbox/PS-Projects\ \&\ Opportunities/MasterMind\ -\ Resource\ Planner/Builds/

This takes a bit as Dropbox syncs the file.
SSH into the server:

> ssh mastermind.pointsource.us

Move to the server's directory.

> cd /opt/grunt

Upgrade to root.

> sudo -s

Right click on the Dropbox file and choose Share Dropbox Link.
Back in the terminal type:

> wget *Dropbox link*

Move the file to a more readable location.

> mv Mastermind-*date*.tar?abcdefghi... Mastermind-*date*.tar

Untar the file.

> tar xf Mastermind-*date*.tar

Change to the Mastermind directory.

> cd PSMastermind/

Open the Gruntfile.js

> vi Gruntfile.js

Find the connect.options configuration (/connect:<enter>)
Change options.port to 80.
Change options.hostname to '*'
Remove any other options.
Save the file (:wq)

Open the base app.js file.

> vi app/scripts/app.js

Find the server location property (/serverLocation)
Change to 'http://db.mastermind.pointsource.us:8080'
Save the file (:wq)

Kill all previous grunt processes just to be safe:

> killall grunt

And then start the server again.

> grunt server &

You are now done. After this you probably want to make this process not suck so much. Please do.