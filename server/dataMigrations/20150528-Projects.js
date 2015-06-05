var _ = require('underscore');

module.exports = function(dbAccess, callback) {
	var db = dbAccess.db;

	db.view('Projects', 'AllProjects', function(err, allDocs) {
		if (err) {
			return callback(err);
		}

		var toInsert = [];
		var found = _.find(allDocs.rows, function(doc) {
			var node;
			var d;
			var doSave = false;

			if (doc.value) {
				d = doc.value;
				// console.log('\nDEBUG ' + d._id + ' Original');
				// console.log(d);

				if (d.resource) {
					delete d.resource;
					doSave = true;
				}
				if (d.about) {
					delete d.about;
					doSave = true;
				}

				node = d.executiveSponsor;
				if (node) {
					if (node.resource) {
						d.executiveSponsor = cleanupResource(node.resource);
						doSave = true;
					}
				}

				node = d.salesSponsor;
				if (node) {
					if (node.resource) {
						d.salesSponsor = cleanupResource(node.resource);
						doSave = true;
					}
				}

				node = d.created;
				if (node) {
					if (node.resource) {
						d.created.by = cleanupResource(node.resource);
						delete d.created.name;
						delete d.created.resource;
						doSave = true;
					}
				}

				node = d.modified;
				if (node) {
					if (node.resource) {
						d.modified.by = cleanupResource(node.resource);
						delete d.modified.name;
						delete d.modified.resource;
						doSave = true;
					}
				}

				// console.log('DEBUG ' + d._id + ' Updated');
				// console.log(d);

				if (doSave) {
					console.log('Document ' + d._id + ' pushed for Update.');
					toInsert.push(d);
				}
			} else {
				return true;
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

var cleanupResource = function(res) {
	var i = res.lastIndexOf('/');
	if (i > 0) {
		res = res.substr(i + 1);
	}

	return (res);
};
