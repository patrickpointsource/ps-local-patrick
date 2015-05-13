module.exports = {
    views: {
        AllHours: {
            map: function(doc){
                if (doc.form == "Hours"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllHours: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Hours"){
                    if(doc.person && doc.person.resource){
                        index('person', doc.person.resource.replace('people/', ''));
                    }
                    if(doc.date){
                        index('numericDate', Number(doc.date.replace(/-/g, '')), {store: true});
                    }
                    if(doc.project && doc.project.resource){
                        index('project', doc.project.resource.replace('projects/', ''));
                    }
                    if(doc.task && doc.task.resource){
                        index('task', doc.task.resource.replace('tasks/', ''));
                    }
                }
            }
        }
    }
}