#!/bin/bash
SOURCEDIR=/Users/sbehun/workspaces/resourceplanner/PSMasterMind/app
DESTINATIONDIR=/Users/sbehun/Sites/local.mastermind.pointsource.us/web
echo -e "\nDeploying mastermind build FROM:\n$SOURCEDIR\nTO:\n$DESTINATIONDIR"
if [ -d "$DESTINATIONDIR" ]; then
  rm -r "$DESTINATIONDIR"
fi
cp -r "$SOURCEDIR" "$DESTINATIONDIR"
echo -e "\nDone"