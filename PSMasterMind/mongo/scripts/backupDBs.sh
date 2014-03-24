#!/bin/sh
#set -x

MONGO_DIR='/Users/aditya/InstalledApps/mongodb-osx-x86_64-2.4.9'
MONGO_DATA_DIR='/data/db'
MONGO_CONF_DIR='/etc'
BACKUP_VOL='/data/db.bak'

DATE=`date "+%Y-%m-%d"`
export BACKUP_DIR=$BACKUP_VOL/$DATE

#flush and Lock the stage and prod databases
echo "Locking stage and prod databases."
$MONGO_DIR/bin/mongo mm_db_stage --eval "db.fsyncLock()"
$MONGO_DIR/bin/mongo mm_db_prod --eval "db.fsyncLock()"

#copy database and mongo conf files
echo "Using backup directory:" $BACKUP_DIR
if [ ! -d "$DIRECTORY" ]; then
  # Control will enter here if $DIRECTORY does not exist.
  mkdir $BACKUP_DIR
fi

if [ -f "$MONGO_CONF_DIR/mongod.conf" ]; then
  cp $MONGO_CONF_DIR/mongod.conf $BACKUP_DIR
fi

cp $MONGO_DATA_DIR/mm_db_stage.* $BACKUP_DIR
cp $MONGO_DATA_DIR/mm_db_prod.* $BACKUP_DIR

#Unlock the databases.
echo "Backup complete. Unlocking stage and prod databases."
$MONGO_DIR/bin/mongo mm_db_stage --eval "db.fsyncUnlock()"
$MONGO_DIR/bin/mongo mm_db_prod --eval "db.fsyncUnlock()"