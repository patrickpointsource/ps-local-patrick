module.exports = {
    views: {
        HoursAndProjectsForPerson: {
            map: function(doc){
                if(doc.form === 'Hours'){
                    // The next three lines will eventually be:
                    // if(doc.person){
                    //     emit([doc.person, 0], doc);
                    if(doc.person && doc.person.resource){
                        var person = doc.person.resource.replace('people/', '');
                        var date = doc.date.replace(/-/g, '');
                        emit([person, date, 0], {_id: doc._id});
                        emit([person, date, 3], {_id: person});

                        // The next three lines will eventually be:
                        // if(doc.project){
                        //     emit([doc.project, 1], {_id: doc.project});
                        if(doc.project && doc.project.resource){
                            var project = doc.project.resource.replace('projects/', '');
                            emit([person, date, 1], {_id: project});
                        }
                        // The next three lines will eventually be:
                        // if(doc.task){
                        //     emit([doc.task, 1], {_id: doc.task});
                        if(doc.task && doc.task.resource){
                            var task = doc.task.resource.replace('tasks/', '');
                            emit([person, date, 2], {_id: task});
                        }
                    }
                }
            }
        }
    }
}