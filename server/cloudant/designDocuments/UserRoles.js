module.exports = {
    views: {
        AllUserRoles: {
            map: function(doc){
                if (doc.form == "UserRoles"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllUserRoles: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "UserRoles"){
                    index('name', doc.name);
                }
            }
        }
    }
}