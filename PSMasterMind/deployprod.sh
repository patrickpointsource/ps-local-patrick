#/bin/bash

# MasterMindNode to prod
SOURCEDIR=/Users/anthonysegretto/git/MasterMind/PSMasterMind/dist/
DESTINATIONDIR=mm.pointsource.vpc:/home/anthonysegretto/guidist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"

