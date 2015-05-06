module.exports = {
    views: {
        AllSecurityRoles: {
            map: function(doc){
                if (doc.form == "SecurityRoles"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllSecurityRoles: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "SecurityRoles"){
                    index('name', doc.name);
                }
            }
        }
    }
}