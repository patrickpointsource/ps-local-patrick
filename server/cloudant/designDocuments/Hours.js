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
                    if(doc.person){
                        index('person', doc.person);
                    }
                    if(doc.date){
                        index('numericDate', Number(doc.date.replace(/-/g, '')), {store: true});
                    }
                    if(doc.project){
                        index('project', doc.project);
                    }
                    if(doc.task){
                        index('task', doc.task);
                    }
                }
            }
        }
    }
}