// ================================================
// node-twitterbot - version 0.0.1 
// A NodeJS module for creating Twitter Bots
// Nathaniel Kirby (nate@projectspong.com)
// https://github.com/nkirby/node-twitterbot
// ================================================

(function() {
  var Twit, TwitterBot, TwitterBotAction, TwitterBotStreamAction, eventEmitter, fs, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  Twit = require('twit');

  eventEmitter = require('events').EventEmitter;

  TwitterBot = (function(_super) {
    __extends(TwitterBot, _super);

    function TwitterBot(configOrFile) {
      var e;
      if (typeof configOrFile === "string") {
        try {
          this.config = JSON.parse(fs.readFileSync(configOrFile));
        } catch (_error) {
          e = _error;
          throw e;
        }
      } else {
        this.config = configOrFile;
      }
      this.actions = [];
      this.streamAction = new TwitterBotStreamAction(function() {
        return this.start();
      }, this);
      this.setupTwit();
    }

    TwitterBot.prototype.setupTwit = function() {
      this.twitter = new Twit({
        consumer_secret: this.config.consumer_secret,
        consumer_key: this.config.consumer_key,
        access_token: this.config.access_token,
        access_token_secret: this.config.access_token_secret
      });
      return this;
    };

    TwitterBot.prototype.tweet = function(text, callback) {
      if (typeof text !== "string") {
        return callback({
          message: "Cannot post a non-string"
        }, null);
      }
      return this.twitter.post("statuses/update", {
        status: text
      }, function(err, response) {
        if (callback && typeof callback === "function") {
          return callback(err, response);
        }
      });
    };

    TwitterBot.prototype.addAction = function(actionName, callback) {
      var action,
        _this = this;
      if (typeof callback === "function") {
        action = new TwitterBotAction(callback, this);
      } else {
        action = callback;
      }
      action.name = actionName;
      this.actions.push(action);
      this.on(actionName, function(params) {
        return action.emit("action", params);
      });
      return action;
    };

    TwitterBot.prototype.removeAction = function(actionName) {
      var index;
      this.removeAllListeners(actionName);
      index = this.actions.indexOf(actionName);
      if (index > -1) {
        return this.actions.splice(index, 1);
      }
    };

    TwitterBot.prototype.allActions = function(groupName) {
      var action, actions, _i, _len, _ref;
      actions = [];
      _ref = this.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        if (groupName) {
          if (action.isPartOfGroup(groupName)) {
            actions.push(action.name);
          }
        } else {
          actions.push(action);
        }
      }
      return actions;
    };

    TwitterBot.prototype.randomAction = function(groupName) {
      var actionItem, actions;
      actions = this.allActions(groupName);
      actionItem = actions[Math.floor(Math.random() * actions.length)];
      return actionItem;
    };

    TwitterBot.prototype.actionWithName = function(actionName) {
      var action, _i, _len, _ref;
      _ref = this.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        if (action.name === actionName) {
          return action;
        }
      }
      return null;
    };

    TwitterBot.prototype.startStreaming = function() {
      return this.streamAction.start();
    };

    TwitterBot.prototype.stopStreaming = function() {
      return this.streamAction.stop();
    };

    TwitterBot.prototype.listen = function(name, match, action) {
      return this.streamAction.listen(name, match, action);
    };

    TwitterBot.prototype.schedule = function(action, timeout) {
      if (!timeout) {
        return this.now(action);
      }
    };

    TwitterBot.prototype.now = function(action) {
      if (typeof action === "string") {
        action = this.actionWithName(action);
      } else if (typeof action === "function") {
        action = new TwitterBotAction(callback, this);
      }
      return action.emit("action", this.twitter);
    };

    return TwitterBot;

  })(eventEmitter);

  module.exports.TwitterBot = TwitterBot;

  eventEmitter = require('events').EventEmitter;

  TwitterBotAction = (function(_super) {
    __extends(TwitterBotAction, _super);

    function TwitterBotAction(action, owner) {
      this.owner = owner;
      this.on("action", function(twitter) {
        return action(twitter);
      });
      this.init();
      this.groups = [];
      this.weight = 0;
    }

    TwitterBotAction.prototype.init = function() {};

    TwitterBotAction.prototype.group = function(groupName) {
      this.groups.push(groupName);
      return this;
    };

    TwitterBotAction.prototype.ungroup = function(groupName) {
      var index;
      index = this.groups.indexOf(groupName);
      if (index > -1) {
        this.groups.splice(index, 1);
      }
      return this;
    };

    TwitterBotAction.prototype.isPartOfGroup = function(groupName) {
      return this.groups.indexOf(groupName) > -1;
    };

    TwitterBotAction.prototype.weight = function(weight) {
      this.weight = weight;
      return this;
    };

    return TwitterBotAction;

  })(eventEmitter);

  module.exports.TwitterBotAction = TwitterBotAction;

  eventEmitter = require('events').EventEmitter;

  TwitterBotStreamAction = (function(_super) {
    __extends(TwitterBotStreamAction, _super);

    function TwitterBotStreamAction() {
      _ref = TwitterBotStreamAction.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TwitterBotStreamAction.prototype.init = function() {
      var _this = this;
      this.streams = {};
      this.on("start", function() {
        _this.stream = _this.owner.twitter.stream("statuses/sample");
        _this.stream.on("tweet", function(tweet) {
          var key, value, _ref1;
          _ref1 = _this.streams;
          for (key in _ref1) {
            value = _ref1[key];
            if (value(tweet)) {
              _this.emit("stream-" + key, _this.owner.twitter, tweet);
            }
          }
          return tweet;
        });
        return _this;
      });
      return this.on("stop", function() {
        return _this.stream.stop();
      });
    };

    TwitterBotStreamAction.prototype.start = function() {
      return this.emit("start");
    };

    TwitterBotStreamAction.prototype.stop = function() {
      return this.emit("stop");
    };

    TwitterBotStreamAction.prototype.listen = function(name, match, callback) {
      var action;
      action = new TwitterBotAction(callback, this.owner);
      this.streams[name] = match;
      return this.on("stream-" + name, function(params) {
        return action.emit("action", this.owner.twitter, params);
      });
    };

    return TwitterBotStreamAction;

  })(TwitterBotAction);

  module.exports.TwitterBotStreamAction = TwitterBotStreamAction;

}).call(this);