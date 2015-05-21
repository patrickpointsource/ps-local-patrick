module.exports = {
    views: {
        AllSkills: {
            map: function(doc){
                if (doc.form == "Skills"){
                    emit(doc._id, doc);
                }
            }
        },
        AllSkillTitles: {
            map: function(doc){
                if (doc.form == "Skills" && doc.title){
                    emit(doc._id, doc.title);
                }
            }
        }
    }
}