module.exports = {
    views: {
        AllClients: {
            map: function(doc){
                if (doc.form == "Clients"){
                    emit(doc._id, doc);
                }
            }
        }
    }
}