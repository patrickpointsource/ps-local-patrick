var _ = require('underscore');

module.exports = function(dbAccess, callback) {
	var db = dbAccess.db;

	db.view('views', 'Vacations', function(err, allDocs) {
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

				node = d.person;
				if (node) {
					if (node.resource) {
						d.person = cleanupResource(node.resource);
						doSave = true;
					}
				}

				node = d.vacationManager;
				if (node) {
					if (node.resource) {
						d.manager = cleanupResource(node.resource);
						delete d.vacationManager;
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