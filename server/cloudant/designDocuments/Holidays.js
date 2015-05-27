module.exports = {
    views: {
        AllHolidays: {
            map: function(doc){
                if (doc.form == "Holidays"){
                    emit(doc._id, doc);
                }
            }
        },
        AllHolidaysByDate: {
            map: function(doc){
                if(doc.form === 'Holidays'){
                    var date = doc.date.replace(/-/g, '');
                    emit(date, null);
                }
            }
        }
    },
    indexes: {
        SearchAllHolidays: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Holidays"){
                    index('name', doc.name);
                    if(doc.date){
                        index('numericDate', Number(doc.date.replace(/-/g, '')), {store: true});
                    }
                }
            }
        }
    }
}