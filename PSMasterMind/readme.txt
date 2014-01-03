Deployment Guide

Prod: mastermind.pointsource.us/web (http://mastermind.pointsource.us will redirect you there)
Stage: mastermind.pointsource.us/stage

1.) Change config settings in PSMasterMind/app/scripts/login.js, see comments for appropriate environment settings

2.) Change the SOURCEDIR and DESTINATIONDIR in PSMasterMind/deploy.sh and/or PSMasterMind/deploystage.sh to match your project path and username

3.) Run deploy.sh to rsync up to the server at ~/web (or run deploystage.sh to rsync to ~/stage). Scripts are located inside PSMasterMind directory.

    ./deploy.sh
    OR
    ./deploystage.sh

4.) ssh to mastermind server.  This will put you in your home directoy where the project has been rsync'ed, and sudo copy the file to /var/www/html/[web or staging]

    ssh [AMAZON USERNAME]@mastermind.pointsource.us
    sudo rm -r /var/www/html/[web OR stage]
    sudo cp -r [web OR stage] /var/www/html/[web OR stage]

    * I have shell scripts deploy.sh and deploystage.sh in my home directory on the server (/home/sbehun) that you can sudo cp to your home directory, change the SOURCEDIR and DESTINATIONDIR and run as sudo (sudo ./deploy.sh) that will do all this for you if you prefer that method.




Once you've set up the shell scripts you can easily cd to PSMasterMind directory and run:

./deploy.sh
ssh [AMAZON USERNAME]@mastermind.pointsource.us
./deploy.sh