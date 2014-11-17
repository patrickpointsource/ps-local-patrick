#/bin/bash
#deploy MasterMindNode to dist - deploy PSMasterMind to guidist
SOURCEDIR=/Users/anthonysegretto/Documents/workspace/PSMasterMind/dist/
DESTINATIONDIR=demo.mm.pointsource.vpc:/home/anthonysegretto/dist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"

