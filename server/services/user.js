module.exports.init = function(){
    
};

module.exports.getUser = function(googleId, callback){
    var access = services.get('dbAccess');
    access.db.view('People', 'AllPeopleByGoogleId', { keys: [googleId] }, function(err, docs){
        if(err){
            return callback(err);
        }
        if(docs.rows.length === 0){
            return callback('The indicated user doesn\'t exist.');
        }
        callback(null, docs.rows[0]);
    });
};