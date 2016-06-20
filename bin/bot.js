// bin/bot.js


var WeatherBot = require('../lib/weatherbot');

var token = process.env.BOT_API_KEY; // required

var weatherbot = new WeatherBot({
    token: token
});

weatherbot.run();