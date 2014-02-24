#/bin/bash
SOURCEDIR=/Users/aditya/Documents/workspaces/Mastermind/PSMasterMind/dist/
DESTINATIONDIR=mm:/home/aditya/dist/
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
rsync -Crcv "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"
