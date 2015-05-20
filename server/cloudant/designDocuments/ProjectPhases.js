module.exports = {
    views: {
        AllProjectPhases: {
            map: function(doc){
                if (doc.form == 'ProjectPhases'){
                    emit(doc._id, doc);
                }
            }
        },
        AllProjectPhaseNames: {
            map: function(doc){
                if (doc.form == 'ProjectPhases'){
                    emit(doc._id, doc.name);
                }
            }
        }
    },
    indexes: {
        SearchAllProjectPhases: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == 'ProjectPhases'){
                    index('name', doc.name);
                    if(doc.project){
                        index('project', doc.project);
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
}