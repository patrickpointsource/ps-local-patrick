import cloudant
import json
import requests
import bson

#======================================================
def updateDocs(designName, viewName, db):
	print("Updating ...")
	options = {'keys': ['projects/5387526ae4b07248e0715331']}

	design = db.design(designName)
	view = design.view(viewName)

	#view = db.view('Admin', 'debug', {keys: ['projects/47ad7f3ed51ecc254f45f223e42f7620']})
	bulkdocs = {"docs":[]}

	i=0
	for d in view.iter(params=options):
		i=i+1
		print d
		if (i > 1):
			#doc = db.get(d['id']).json()
			#print doc
			doc = db.document(d['id'])
			rev = doc.get().json()['_rev']
			print "Deleting doc ", d['id'], "rev:", rev
			doc.delete(rev)
		#d = d['value']
		#print(d['_id'])
	#save = db.bulk_docs(bulkdocs)
	#print(save.json())
	#print(save.status_code)




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
design = db.design('Admin')

updateDocs('Admin', 'debug', db)
