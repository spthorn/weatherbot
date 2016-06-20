// lib/weatherbot.js

var util = require('util');
var SlackBot = require('slackbots'); // see https://www.npmjs.com/package/slackbots

// Constructor function for new class
var WeatherBot = function Constructor(settings)
{
    this.settings = settings;
    this.settings.name = this.settings.name || 'weatherbot';

    this.user = null; // we'll manually fill on startup
};

// New class inherits methods and properties from the SlackBot constructor
util.inherits(WeatherBot, SlackBot);

module.exports = WeatherBot;

WeatherBot.prototype.run = function() {
    // call the original SlackBot constructor class
    WeatherBot.super_.call(this, this.settings);

    // attach callbacks
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

// -------------------------------------------------------------------------------------------
// onStart stuff
// Triggered when our bot connects to the Slack server
// -------------------------------------------------------------------------------------------
WeatherBot.prototype._onStart = function() {
    this._loadBotUser();
    this._sendGreeting();
};

// When the SlackBot class connects to the Slack server, it downloads a list
// with all the users in the organization and saves it in the [users] attribute
// as an array of objects. Find the one that has the same username of our bot,
// and save it to the [user] member of our class.
WeatherBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

// Send a greeting message when the bot starts up
// The [as_user] attribute allows our bot to post the message as itself (visualized with
// its avatar and name).
WeatherBot.prototype._sendGreeting = function () {
    var self = this;
    this.postTo("weatherbot_testing", 'Weatherbot now online', {as_user:true});
};
// -------------------------------------------------------------------------------------------
// onMessage stuff
// Triggered when a realtime message is received in the underlying websocket connection 
// managed by the SlackBots module. Intercepts every realtime API message that is readable
// by our bot (i.e. every chat message in the channels where the bot is installed, also
// private messages directed to the bot, etc).
//
// Parameter [message] contains all the info that describes the real time event received
// through the Slack real time API.
// -------------------------------------------------------------------------------------------
WeatherBot.prototype._onMessage = function(message) {
    var self = this;
    console.log("Message type: " + message.type);
    if (message.type === 'message' && Boolean(message.text)) { // if it's a chat message with text
        if (message.user !== this.user.id) { // if it's not from the weatherbot itself
            // Typical message:
            // { type: 'message',
            //   channel: 'G1J6BPZUZ',
            //   user: 'U02JT5B8Y',
            //   text: 'weatherbot, what's the temp?,
            //   ts: '1466425658.000075',
            //   team: 'T02JRJDUM' }    
            console.log(message);

            var weatherBotObj = this.users.filter(function (item) {
                return item.name === "weatherbot";
            })[0];

            // See if message contains "weatherbot" or "@weatherbot"
            if (message.text.toLowerCase().indexOf('weatherbot') > -1 ||
                message.text.indexOf('<@' + weatherBotObj.id + '>') > -1 ||
                message.channel == "D1J64DQJ0" // this is the direct channel from weatherbot to spthorn
            )
            {
                // Get a replyto name
                var replyto;
                if (message.channel[0] == "C") {
                    var obj = self._getChannelById(message.channel);
                    replyto = obj.name;
                }
                if (message.channel[0] == "G") {
                    var obj = self._getGroupById(message.channel);
                    replyto = obj.name;
                }
                if (message.channel[0] == "D") {
                    var obj = self._getUserById(message.user);
                    replyto = obj.name;
                };

                // Look for specific content
                var msg;
                var err;
                if (message.text.indexOf("help") > -1) {
                    msg = "'weatherbot status' shows the current office weather. (weatherbot v1.0)";
                    self.postTo(replyto, msg, {as_user: true});
                }
                if (message.text.indexOf("status") > -1) {
                    var http = require('http');
                    var options = {
                        host: 'spthorn.com',
                        path: '/slackMonitorQuery.php'
                    }
                    var request = http.request(options, function (res) {
                        var data = '';
                        res.on('data', function (chunk) { data += chunk; });
                        res.on('end', function () {
                            self.postTo(replyto, data, {as_user: true});
                        });
                    });
                    request.on('error', function (e) {
                        self.postTo("spthorn", e.message, {as_user: true});
                        self.postTo(replyto, "Dang. The weatherbot monitor is down. Support contacted.", {as_user: true});
                    });
                    request.end();
                }
            }
        }
    }
};


// -------------------------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------------------------

// Realtime messages reference channels with IDs, but
// all the functions to post messages use the name of the channel as a parameter, so we need
// to retrieve the channel name given its ID.
//
// These basic functions exist in SlackBot, but return a promise, so aren't as clear to use.
WeatherBot.prototype._getChannelById = function(id) {
    return this.channels.filter(function (item) {
        return item.id === id;
    })[0];
};
WeatherBot.prototype._getGroupById = function(id) {
    return this.groups.filter(function (item) {
        return item.id === id;
    })[0];
};
WeatherBot.prototype._getUserById = function(id) {
    return this.users.filter(function (item) {
        return item.id === id;
    })[0];
};

WeatherBot.prototype._getWeatherBotUser = function(channelId) {
    return this.users.filter(function (item) {
        return item.name === "weatherbot";
    })[0];
};
