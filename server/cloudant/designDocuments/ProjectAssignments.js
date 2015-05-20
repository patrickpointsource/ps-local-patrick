module.exports = {
    views: {
        AllProjectAssignments: {
            map: function(doc){
                if (doc.form == "ProjectAssignments"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllProjectAssignments: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "ProjectAssignments"){
                    if(doc.project){
                        index('project', doc.project);
                    }
                    if(doc.person){
                        index('person', doc.person);
                    }
                    if(doc.role){
                        index('role', doc.role);
                    }
                    if(doc.startDate){
                        index('numericStartDate', Number(doc.startDate.replace(/-/g, '')), {store: true});
                    }
                    if(doc.endDate){
                        index('numericEndDate', Number(doc.endDate.replace(/-/g, '')), {store: true});
                    }
                }
            }
        }
    }
};