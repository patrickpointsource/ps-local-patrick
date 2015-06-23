/* Copyright © 2015 PointSource, LLC. All rights reserved. */
/**
 * Init will be called during server startup. All the parameters will be injected automatically.
 *  app: express app
 *  randomizer: randomizer service
 *  logger: logger service
 */
module.exports.init = function(app, randomizer, logger) {

    app.get('/hello', function(req, res) {
        logger.debug('GET /hello');

        //Randomize the number of 'Hello World' messages displayed
        randomizer.get(function(num) {
            var message = "";
            for (var i = 0; i < num; i++) {
                message += '<div>Hello World</div>';
            }
            res.status(200).send(message);
        });
    });

    app.post('/hello', function(req, res) {
        logger.debug('POST /hello');
        res.status(200).send('Hello World: ' + JSON.stringify(req.body));
    });

    app.put('/hello', function(req, res) {
        logger.debug('PUT /hello');
        res.status(200).send('Hello World: ' + JSON.stringify(req.body));
    });

};
