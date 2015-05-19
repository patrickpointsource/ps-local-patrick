module.exports = {
    views: {
        AllSkills: {
            map: function(doc){
                if (doc.form == "Skills"){
                    emit(doc._id, doc);
                }
            }
        }
    }
}