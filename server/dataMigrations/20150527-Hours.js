var _ = require('underscore');

module.exports = function(dbAccess, callback) {
	var db = dbAccess.db;

	db.view('views', 'Hours', function(err, allDocs) {
		if (err) {
			return callback(err);
		}

		var toInsert = [];
		var toDelete = [];
		var found = _.find(allDocs.rows, function(doc) {
			var node;
			var d;

			//	    console.log(doc);

			if (doc.value) {
				d = doc.value;
				//	        console.log("\nDEBUG " + d._id + " Original");
				//	        console.log(d);

				delete d.resource;
				delete d.about;

				node = d.person;
				if (node) {
					if (node.resource) {
						d.person = node.resource.replace("people/", "");
					}
				}

				node = d.project;
				if (node) {
					if (node.resource) {
						d.project = node.resource.replace("projects/", "");
					}
				}

				node = d.task;
				if (node) {
					if (node.resource) {
						d.task = node.resource.replace("tasks/", "");
					}
				}

				//	        console.log("DEBUG " + d._id + " Updated");
				//	        console.log(d);

				toInsert.push(d);
			}
		});

		if (!found) {
			db.bulk({
				docs : toInsert
			}, function(err, results) {
				return callback(err);
			});
		}

	});
};
