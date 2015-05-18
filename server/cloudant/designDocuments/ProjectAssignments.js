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
                    if(doc.project && doc.project.resource){
                        index('project', doc.project.resource.replace('projects/', ''));
                    }
                    if(doc.person && doc.person.resource){
                        index('person', doc.person.resource.replace('people/', ''));
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