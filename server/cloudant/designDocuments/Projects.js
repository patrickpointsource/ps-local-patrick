module.exports = {
    views: {
        AllProjects: {
            map: function(doc){
                if (doc.form == 'Projects'){
                    emit(doc._id, doc);
                }
            }
        },
        AllProjectNames: {
            map: function(doc){
                if (doc.form == 'Projects'){
                    emit(doc._id, doc.name);
                }
            }
        }
    },
    indexes: {
        SearchAllProjects: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == 'Projects'){
                    index('name', doc.name);
                    index('type', doc.type);
                    index('id', doc._id);
                    if(doc.committed !== undefined){
                        index('committed', doc.committed);
                    }

                    if(doc.executiveSponsor){
                        index('executiveSponsor', doc.executiveSponsor);
                    }
                    if(doc.salesSponsor){
                        index('salesSponsor', doc.salesSponsor);
                    }
                    if(doc.created && doc.created.by){
                        index('createdBy', doc.created.by, {store: true});
                    }
                    if(doc.modified && doc.modified.by){
                        index('modifiedBy', doc.modified.by, {store: true});
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