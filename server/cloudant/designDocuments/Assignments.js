module.exports = {
    views: {
        AllAssignments: {
            map: function(doc){
                if (doc.form == "Assignments"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllAssignments: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Assignments"){
                    if(doc.project && doc.project.resource){
                        index('project', doc.project.resource.replace('projects/', ''));
                    }
                    if(doc.members && doc.members.length){
                        for(var i=0; i<doc.members.length; i++){
                            if(doc.members[i].person && doc.members[i].person.resource)
                                index('person', doc.members[i].person.resource.replace('people/', ''));
                            }
                            if(doc.members[i].startDate){
                                index('numericStartDate', Number(doc.members[i].startDate.replace(/-/g, '')), {store: true});
                            }
                            if(doc.members[i].endDate){
                                index('numericEndDate', Number(doc.members[i].endDate.replace(/-/g, '')), {store: true});
                            }
                        }
                    }
                }
            }
        }
    }
};