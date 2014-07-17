#/bin/bash
SOURCEDIR=/Users/aditya/mongoBackup
DESTDIR=db.mastermind.pointsource.us:/home/aditya/db
#DESTDIR=db.mastermind.pointsource.us:/data
echo -e "\n Copying mongo demo db FROM:\n$SOURCEDIR\nTO:\n$DESTDIR"
rsync -Crcv --rsync-path="sudo rsync" "$SOURCEDIR"/mm_db_demo.* "$DESTDIR"
echo -e "\nDone"
