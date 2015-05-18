module.exports = {
    views: {
        AllMigrations: {
            map: function(doc){
                if (doc.form == 'Migrations'){
                    emit(doc._id, doc);
                }
            }
        },
        AllMigrationNames: {
            map: function(doc){
                if (doc.form == 'Migrations'){
                    emit(doc._id, doc.name);
                }
            }
        }
    },
    indexes: {
        SearchAllMigrations: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Migrations"){
                    index('name', doc.name);
                }
            }
        }
    }
};