#!/bin/bash

DB="https://wsteredderessidectillyno:I4L6ywMDwbanRIHLAQ26IvmP@cketchuck.cloudant.com/mastermind/_bulk_docs"
echo $DB
curl -d @exportCollection/exp_mm_db_stage_Tasks.json -X POST -H "Accept: application/json" -H 'Content-Type:application/json' $DB