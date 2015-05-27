module.exports = function(res, obj, statusCode){
    res.header('Content-Type', 'application/json');
    if(statusCode){
        res.status(statusCode);
    }
    res.json(obj);
};
