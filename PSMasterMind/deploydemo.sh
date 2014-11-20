#/bin/bash

# Test Comment (Sprint 22 only) deploy MasterMindNode to dist - deploy PSMasterMind to guidist
SOURCEDIR=/Users/anthonysegretto/Documents/workspace/PSMasterMind/dist/
DESTINATIONDIR=demo.mm.pointsource.vpc:/home/anthonysegretto/guidist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"

