module.exports = {
    views: {
        AllDepartments: {
            map: function(doc){
                if (doc.form == "Department"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllDepartments: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Department"){
                    if(doc.code){
                        index('code', doc.code);
                    }
                    if(doc.manager){
                        index('manager', doc.manager);
                    }
                    if(doc.nickname){
                        index('nickname', doc.nickname);
                    }
                    if(doc.category){
                        index('category', doc.category);
                    }
                }
            }
        }
    }
};