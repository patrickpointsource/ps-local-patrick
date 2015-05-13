module.exports = {
    views: {
        AllTasks: {
            map: function(doc){
                if (doc.form == "Tasks"){
                    emit(doc._id, doc);
                }
            }
        },
        AllTaskNames: {
            map: function(doc){
                if (doc.form == 'Tasks'){
                    emit(doc._id, doc.name);
                }
            }
        },
    },
    indexes: {
        SearchAllTasks: {
            analyzer: 'standard',
            index: function (doc) {
                if(doc.form == "Tasks"){
                    index('name', doc.name);
                }
            }
        }
    }
}