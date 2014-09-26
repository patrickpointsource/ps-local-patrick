#/bin/bash
SOURCEDIR=/Users/anthonysegretto/Documents/workspace/PSMasterMind/dist/
DESTINATIONDIR=mastermind.pointsource.us:/home/anthonysegretto/dist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"
