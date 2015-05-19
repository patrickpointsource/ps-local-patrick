module.exports = {
    views: {
        AllProjectPhaseRoles: {
            map: function(doc){
                if (doc.form == 'ProjectPhaseRoles'){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllProjectPhaseRoles: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == 'ProjectPhaseRoles'){
                    if(doc.phase){
                        index('phase', doc.phase);
                    }
                }
            }
        }
    }
}