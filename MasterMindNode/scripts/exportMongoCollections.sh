#!/bin/bash

if [ ! $1 ]; then
        echo " Example of use: $0 database_name [dir_to_store]"
        exit 1
fi
db=$1
out_dir=$2
if [ ! $out_dir ]; then
        out_dir="./"
else
        mkdir -p $out_dir
fi

tmp_file="collections.js"
echo "print('_ ' + db.getCollectionNames())" > $tmp_file
cols=`./mongo $db $tmp_file | grep '_ ' | awk '{print $2}' | tr ',' ' '`
for c in $cols
do
  cat <(printf {\"docs\":) <(./mongoexport -d $db -c $c --jsonArray | jsawk 'if (this["_id"]) this["_id"] = this["_id"]["$oid"]' | jsawk -v schema=$c 'this["schema"] = schema'  ) <(printf }) > "$out_dir/exp_${db}_${c}.json"
done
#rm $tmp_file