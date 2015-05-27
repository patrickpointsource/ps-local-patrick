module.exports = {
    views: {
        AllVacations: {
            map: function(doc){
                if (doc.form == "Vacations"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllVacations: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Vacations"){
                    if(doc.person){
                        index('person', doc.person);
                    }
                    if(doc.manager){
                        index('manager', doc.manager);
                    }
                    if(doc.status){
                        index('status', doc.status);
                    }
                    if(doc.startDate){
                        var startDate = doc.startDate.split(' ');
                        if(startDate.length){
                            startDate = startDate[0];
                            index('numericStartDate', Number(startDate.replace(/-/g, '')), {store: true});
                        }
                    }
                    if(doc.endDate){
                        var endDate = doc.endDate.split(' ');
                        if(endDate.length){
                            endDate = endDate[0];
                            index('numericEndDate', Number(endDate.replace(/-/g, '')), {store: true});
                        }
                    }
                }
            }
        }
    }
};