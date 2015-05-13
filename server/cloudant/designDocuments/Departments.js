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
                    if(doc.departmentCode && doc.departmentCode.name){
                        index('code', doc.departmentCode.name);
                    }
                    if(doc.departmentManager && doc.departmentManager.resource){
                        index('manager', doc.departmentManager.resource.replace('people/', ''));
                    }
                    if(doc.departmentNickname){
                        index('nickname', doc.departmentNickname);
                    }
                    if(doc.departmentCategory && doc.departmentCategory.resource){
                        index('category', doc.departmentCategory.resource.replace('departmentcategories/', ''));
                    }
                }
            }
        }
    }
};