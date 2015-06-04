var _ = require('underscore');

module.exports = function(dbAccess, callback){
    var db = dbAccess.db;

    db.view('ProjectPhaseRoles', 'AllProjectPhaseRoles', function(err, allDocs){
        if(err){
            return callback(err);
        }

        var toInsert = [];
        var found = _.find(allDocs.rows, function(doc){
		    var node;
		    var d;
		    var doSave = false;
		
		    if (doc.value) {
		        d = doc.value;
//		        console.log('\nDEBUG ' + d._id + ' Original');
//		        console.log(d);
	
		        if (d.resource){
			        delete d.resource;
			        doSave = true;
		        }
		        if (d.about){
			        delete d.about;
			        doSave = true;
		        }
	
		        node = d.type;
		        if (node) {
					if (node.resource) {
						d.type = node.resource.replace('roles/', '');
						doSave = true;
					}
				}
	
		        node = d.originalAssignees;
		        if (_.isArray(node)) {
					_.each(node, function(arrayItem, idx) {
						if (arrayItem.person && arrayItem.person.resource) {
							node[idx].person = arrayItem.person.resource.replace('people/', '');
							doSave = true;
						}
					});
				};
	
			
//		        console.log('DEBUG ' + d._id + ' Updated');
//		        console.log(d);
	
		        if (doSave){
		        	console.log('Document ' + d._id + ' pushed for Update.');
		        	toInsert.push(d);
		        }
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