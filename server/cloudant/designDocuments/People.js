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
        }
    },
    indexes: {
        SearchAllPeople: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == 'People'){
                    index('name', doc.name);
                }
            }
        }
    }
}