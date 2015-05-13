module.exports = {
    views: {
        AllConfigurations: {
            map: function(doc){
                if (doc.form == "Configuration"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllConfigurations: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Configuration"){
                    index('name', doc.name);
                }
            }
        }
    }
}