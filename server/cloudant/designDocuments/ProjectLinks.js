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
                    if(doc.project){
                        index('project', doc.project);
                    }
                }
            }
        }
    }
}