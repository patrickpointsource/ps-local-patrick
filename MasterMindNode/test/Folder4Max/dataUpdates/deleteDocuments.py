import cloudant
import json
import requests
import bson

#======================================================
def deleteDocs(designName, viewName, db):
	print("Deleting ...")
	#options = {'keys': ['projects/5387526ae4b07248e0715331']}
	options = {}

	design = db.design(designName)
	view = design.view(viewName)

	#view = db.view('Admin', 'debug', {keys: ['projects/47ad7f3ed51ecc254f45f223e42f7620']})
	bulkdocs = {"docs":[]}

	#for d in view.iter(params=options):
	for d in view:
		doc = db.document(d['id'])
		rev = doc.get().json()['_rev']
		print "Deleting doc ", d['id'], "rev:", rev
		doc.delete(rev)





# setup Cloudant connection parameters
USERNAME = 'psdev1'
#USERNAME = 'mmoroz76'
account = cloudant.Account(USERNAME)
#login = account.login(USERNAME, 'p0ints0urce')
login = account.login('tathendersheaderefortati', 'e7wRT4nm0IgHGeWu07benG36')
#login = account.login('mmoroz76', 'notapassw0rd')
assert login.status_code == 200

db = account.database('mm_db_demo')
#db = account.database('mm_bogdan')

deleteDocs('Admin', 'docs2delete', db)
