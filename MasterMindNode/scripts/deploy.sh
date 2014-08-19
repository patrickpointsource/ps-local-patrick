#!/bin/sh

SOURCEDIR=/Users/aditya/Documents/workspaces/Mastermind/MasterMindNode/dist/
DESTINATIONDIR=db.mastermind.pointsource.us:/home/aditya/dist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"
