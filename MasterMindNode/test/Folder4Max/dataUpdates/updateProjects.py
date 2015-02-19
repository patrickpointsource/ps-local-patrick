import cloudant
import json
import requests
import bson


def getResourceName(resourcePath, d, db):
	#resource = d[resourcePath]
	#print(resource)
	#if(resource is not None):
	if (resourcePath in d):
		resource = d[resourcePath]
		if((type(resource) == dict) and (not 'name' in resource) and ('resource' in resource)):
			#print("getResourceName ", resourcePath , " from ", resource['resource'])
			resourceType = resource['resource'].split('/')[0]
			resourceId = resource['resource'].split('/')[1]
			r = db.get(resourceId)
			if (r.status_code == 200):
				resourceDoc = r.json()
				if (resourceType == "people"):
					if (type(resourceDoc['name']) == dict):
						resource['name'] = resourceDoc['name']['fullName']
					else:
						resource['name'] = resourceDoc['name']
				elif (resourceType == "projects"):
					resource['name'] = resourceDoc['name']
				elif (resourceType == "tasks"):
					resource['name'] = resourceDoc['name']
				elif (resourceType == "roles"):
					resource['name'] = resourceDoc['title']

				#print(resourcePath, " updated node")
				#print(d[resourcePath])
	return(d)

#======================================================
def updateDocs(viewName, arrFlds, db):
	print("Updating " + viewName + " ...")
	view = index.view(viewName)
	bulkdocs = {"docs":[]}

	for d in view:
		d = d['value']
		print(d['_id'])
		for fld in arrFlds:
			d = getResourceName(fld, d, db)

		if (viewName == "Hours"):
			if (('description' in d) and (d['description'] == 'No Description Entered')):
				d.description = ""
		bulkdocs["docs"].append(d)
	save = db.bulk_docs(bulkdocs)
	#print(save.json())
	#print(save.status_code)


#======================================================
# For individual document debug purpose
def debugDocument(arrFlds, db):
	id = "52e423b1e4b0f8e25528e861"
	bulkdocs = {"docs":[]}

	d = db.get(id).json()
	for fld in arrFlds:
		d = getResourceName(fld, d, db)
	bulkdocs["docs"].append(d)
	save = db.bulk_docs(bulkdocs)
	print(save.status_code)
	print(save.json())


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
index = db.design('views')

#debugDocument(['created', 'modified', 'executiveSponsor'], db)

#updateDocs('Projects', ['created', 'modified', 'executiveSponsor'], db)
updateDocs('Hours', ['project', 'person', 'task'], db)
#updateDocs('People', ['primaryRole'], db)
#updateDocs('Assignments', ['project', 'person', 'task'], db)