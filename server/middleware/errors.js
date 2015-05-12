/* Copyright © 2015 PointSource, LLC. All rights reserved. */
exports.init = function(app, logger) {
    app.use(function(err, req, res, next) {
        if (err.name === 'ValidationError') {
            res.status(400).json({error: err.message, detail: err.subErrors});
        } else {
            next();
        }
    });
}