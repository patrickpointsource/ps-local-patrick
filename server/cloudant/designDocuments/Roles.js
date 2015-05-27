module.exports = {
    views: {
        AllRoles: {
            map: function(doc){
                if (doc.form == "Roles"){
                    emit(doc._id, doc);
                }
            }
        },
        AllRoleTitles: {
            map: function(doc){
                if (doc.form == "Roles" && doc.title){
                    emit(doc._id, doc.title);
                }
            }
        }
    }
}