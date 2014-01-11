#!/bin/bash
SOURCEDIR=/Users/kmbauer/Workspaces/Projects/PSMasterMind/app/
DESTINATIONDIR=mm:/home/kmbauer/stage/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"
