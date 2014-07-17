#/bin/bash
DESTDIR=/Users/aditya/mongoBackup
SOURCEDIR=db.mastermind.pointsource.us:/data
echo -e "\n Copying mongo prodclone db FROM:\n$SOURCEDIR\nTO:\n$DESTDIR"
rsync -Crcv --rsync-path="sudo rsync" "$SOURCEDIR"/mm_db_prodclone.* "$DESTDIR"
echo -e "\nDone"
