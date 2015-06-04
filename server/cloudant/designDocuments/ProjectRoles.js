/* global emit, index */
module.exports = {
    views: {
        AllProjectRoles: {
            map: function(doc){
                if (doc.form === 'ProjectRoles'){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllProjectRoles: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form === 'ProjectRoles'){
                    if(doc.project){
                        index('project', doc.project);
                    }
                }
            }
        }
    }
};
