#!/bin/bash
SOURCEDIR=/Users/sbehun/workspaces/resourceplanner/PSMasterMind/app/
DESTINATIONDIR=mm:/home/sbehun/web/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"