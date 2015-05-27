var _ = require('underscore'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var skill = {
    convertForRestAPI: function(access, doc){
        var obj = {
            id: doc._id,
            name: doc.title
        };
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.SKILLS_KEY
        };
        if(doc.title){
            obj.title = doc.title;
        }
        if(!expectNew && doc.id){
            obj._id = doc.id;
        }
        return obj;
    }
};

module.exports.getSkills = util.generateCollectionGetHandler(
    securityResources.skills.resourceName, // resourceName
    securityResources.skills.permissions.viewSkills, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // No searching for Skills
        callback(false);
    },
    'Skills', // ddoc
    'AllSkills', // allDocsViewName
    skill.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleSkill = util.generateSingleItemCreateHandler(
    securityResources.skills.resourceName, // resourceName
    securityResources.skills.permissions.editSkills, // permission
    'skill', // key
    null, // validate
    skill.convertForDB, // convertForDB
    skill.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleSkill = util.generateSingleItemGetHandler(
    securityResources.skills.resourceName, // resourceName
    securityResources.skills.permissions.viewSkills, // permission
    'skill', // key
    skill.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleSkill = util.generateSingleItemUpdateHandler(
    securityResources.skills.resourceName, // resourceName
    securityResources.skills.permissions.editSkills, // permission
    'skill', // key
    null, // validate
    skill.convertForDB, // convertForDB
    skill.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleSkill = util.generateSingleItemDeleteHandler(
    securityResources.skills.resourceName, // resourceName
    securityResources.skills.permissions.editSkills, // permission
    'skill' // key
);
