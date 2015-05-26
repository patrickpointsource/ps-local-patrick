module.exports = {
    views: {
        AllPeople: {
            map: function(doc){
                if (doc.form == 'People'){
                    emit(doc._id, doc);
                }
            }
        },
        AllPeopleNames: {
            map: function(doc){
                if (doc.form == 'People'){
                    emit(doc._id, doc.name);
                }
            }
        },
        AllPeopleByGoogleId: {
            map: function(doc){
                if (doc.form == 'People' && doc.googleId){
                    emit(doc.googleId, doc._id);
                }
            }
        },
        AllPeopleByDepartment: {
            map: function(doc){
                if(doc.form === 'People' && doc.department){
                    emit(doc.department, doc._id);
                }
            }
        }
    },
    indexes: {
        SearchAllPeople: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == 'People'){
                    index('name', doc.name);
                    if(doc.primaryRole){
                        index('primaryRole', doc.primaryRole);
                    }
                    if(doc.isActive !== undefined){
                        index('isActive', doc.isActive);
                    }
                    if(doc.secondaryRoles && doc.secondaryRoles.length){
                        for(var i=0; i<doc.secondaryRoles.length; i++){
                            index('role', doc.secondaryRoles[i]);
                        }
                    }
                }
            }
        }
    }
}