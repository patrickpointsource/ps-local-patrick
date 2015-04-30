var winston = require('winston');

module.exports.get = function(req, res, next){
    // Name param in req.swagger.params.name (.originalValue or .value)
    res.json([
        {
            "id": "Sample text",
            "name": "Sample text",
            "created": "Sample text"
        }
    ]);
};