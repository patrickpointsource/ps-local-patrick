module.exports = {
    views: {
        AllRoles: {
            map: function(doc){
                if (doc.form == "Roles"){
                    emit(doc._id, doc);
                }
            }
        }
    }
}