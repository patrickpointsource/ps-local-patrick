module.exports = {
    views: {
        AllLinks: {
            map: function(doc){
                if (doc.form == "ProjectLinks"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllLinks: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "ProjectLinks"){
                    if(doc.project && doc.project.resource){
                        index('project', doc.project.resource.replace('projects/', ''));
                    }
                }
            }
        }
    }
}