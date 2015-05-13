module.exports = {
    views: {
        AllDepartmentCategories: {
            map: function(doc){
                if (doc.form == "DepartmentCategory"){
                    emit(doc._id, doc);
                }
            }
        }
    },
    indexes: {
        SearchAllDepartmentCategories: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "DepartmentCategory"){
                    index('name', doc.name);
                }
            }
        }
    }
}