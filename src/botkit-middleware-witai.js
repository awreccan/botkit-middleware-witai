var Wit = require('node-wit').Wit;

module.exports = function(config, actions) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var client = new Wit(config.token, actions);

    var middleware = {};

    middleware.receive = function(bot, message, next) {
        // Only parse messages of type text and mention the bot.
        // Otherwise it would send every single message to wit (probably don't want that).
        if (message.text && message.text.indexOf(bot.identity.id) > -1) {
            client.message(message.text, function(error, data) {
                if (error) {
                    next(error);
                } else {
                    message.entities = data.entities;
                    next();
                }
            });
        } else if (message.attachments) {
            message.intents = [];
            next();
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
