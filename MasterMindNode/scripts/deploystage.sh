#!/bin/sh
#dist folder is for MasterMindNode and guidist is for PSMasterMind
SOURCEDIR=/Users/anthonysegretto/Documents/workspace/MasterMindNode/dist/
DESTINATIONDIR=stage.mm.pointsource.vpc:/home/anthonysegretto/dist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"

