module.exports = {
    views: {
        AllSecurityRoles: {
            map: function(doc){
                if (doc.form == "SecurityRoles"){
                    emit(doc._id, doc);
                }
            }
        }
    }
}