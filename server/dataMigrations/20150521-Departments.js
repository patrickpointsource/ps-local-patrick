var _ = require('underscore');
module.exports = function(dbAccess, callback){
    var db = dbAccess.db;
	db.view('views', 'Departments', {'include_docs': true}, function(err, allDocs){
		if(err){
			return callback(err);
		}
		
		var toInsert = [];
		var found = _.find(allDocs.rows, function(doc){
			var node;
			var d;
			
			if (doc.doc) {
				d = doc.doc;
				delete d.resource;
				delete d.about;
				
				if(d.departmentNickname){
					d.nickname = d.departmentNickname;
					delete d.departmentNickname;
				}
				
				if(d.departmentCode && d.departmentCode.name){
					d.code = d.departmentCode.name;
					delete d.departmentCode;
				}
				
				node = d.departmentCategory;
				if (node) {
					if (node.resource) {
						d.category = node.resource.replace('departmentcategories/', '');
					}
					delete d.departmentCategory;
				}
				
				node = d.departmentManager;
				if (node) {
					if (node.resource) {
						d.manager = node.resource.replace('people/', '');
					}
					delete d.departmentManager;
				}
				
				node = d.departmentPeople;
				if(_.isArray(node)){
					_.each(node, function(person, idx){
						if (person.resource) {
							person.resource = person.resource.replace('people/', '');
						}
					});
					d.people = node;
				};
				delete d.departmentPeople;
				
				toInsert.push(d);
			} else {
				return true;
			}
		});

		if(!found){
			db.bulk({docs: toInsert}, function(err, results){
				return callback(err);
			});
		}
	});
};