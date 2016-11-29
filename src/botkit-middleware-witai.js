var Wit = require('node-wit').Wit;

module.exports = function(accessToken, actions) {

    var client = new Wit({accessToken, actions});

    var middleware = {};

    middleware.receive = function(bot, message, next) {
        if (message.text) {
            const sessionId = uuid.v1();
            const steps = 5;
            let context = {};
            client.runActions(sessionId, message.text, context, steps)
                .then((ctx) => {
                    context = ctx;
                })
                .catch(err => console.error(err))
        } else {
            next();
        }
    };

    middleware.hears = function(tests, message) {
        if (message.entities && message.entities.intent) {
            for (var i = 0; i < message.entities.intent.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                    if (message.entities.intent[i].value == tests[t] &&
                        message.entities.intent[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    return middleware;
};
