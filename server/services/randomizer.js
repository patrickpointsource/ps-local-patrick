/* Copyright © 2015 PointSource, LLC. All rights reserved. */
//Uses random.org to generate a random integer
var request = require('request');
var url, _logger;

exports.init = function(logger, config, callback) {
    var cfg = config.get('randomizer');

    //optional min/max can be set in the randomizer config
    var min = cfg.min || 0;
    var max = cfg.max || 100;
    url = 'http://www.random.org/integers/?num=1&min=' + min + '&max=' + max + '&col=1&base=10&format=plain&rnd=new';
    _logger = logger;
    callback();
};

exports.get = function(callback) {

    //custom log level
    _logger.debug('request URL:  ' +  url);
    request.get({url: url}, function(err, response, body) {
        if (err || response.statusCode !== 200) {
            _logger.error('Error getting random number');
            callback(0);
        } else {
            callback(Number(body));
        }
        
    });
};
