# node-twitterbot

A simple way to build Twitter Bots using NodeJS, NPM and a handful of modules

## Installation

    npm install node-twitterbot

### Status

This should be considered a work in progress. It ought to work for you, but if not, please let me know.

### Dependencies

node-twitterbot handles it's own dependencies for you. It primarily uses:

[Twit](https://github.com/ttezel/twit/ "Twit on Github")
  
## Usage

    var TwitterBot = require("node-twitterbot").TwitterBot

After that, the TwitterBot constructor either needs an object containing the configuration for the Twitter Bot

    var Bot = new TwitterBot({
      "consumer_secret": "consumer_secret",
	    "consumer_key": "consumer_key",
    	"access_token": "access_token",
	    "access_token_secret": "access_token_secret"
	  });
	  
... or a path to a config JSON file.

    var Bot = new TwitterBot("path-to-config.json");
  
See more about the [TwitterBot class here](https://github.com/nkirby/node-twitterbot/wiki/TwitterBot "TwitterBot Wiki")

## Actions

In order to get your node-twitterbot to actually do something, you need to define actions. It is done through the addAction() method. It takes 2 parameters:

    actionName: a string value for the name of an action
  	actionFunction: a function to be called when a given action is scheduled. (See below for method signature)

So our addAction method might look like this:

    Bot.addAction("tweet", function(twitter, action, tweet) {
      Bot.tweet("I'm posting a tweet!");
    });
    
The twitter variable passed into the function is the [Twit](https://github.com/ttezel/twit/ "Twit on Github") object associated with a given node-twitterbot, and can be managed directly. The same Twit object is available as [TwitterBot].twitter as well.

The action variable passed into the function is the TwitterBotAction created by addAction.

And the tweet object is the tweet passed into the action (if there was one)

### TwitterBotActions

addAction() returns a TwitterBotAction object. 

    var tweetAction = Bot.addAction("tweet", function(twitter, action, tweet) {
      Bot.tweet("I'm posting a tweet!");
    });

But you will rarely need to directly hold onto the tweetAction directly. You can always get a reference to the action by calling

    Bot.actionWithName("tweet");

Which will return the TwitterBotAction object, or null if the name is invalid (or the action already removed)

See more about the [TwitterBotAction class here](https://github.com/nkirby/node-twitterbot/wiki/TwitterBotAction "TwitterBotAction Wiki")

### Grouping Actions

Actions are groupable by calling the TwitterBotAction objects group() method

    Bot.addAction("tweet", function(twitter, action, tweet) {
      Bot.tweet("I'm posting a tweet!");
    }).group("tweet posting");
    
Retrieving all actions in a group is possible via:

    Bot.allActions("tweet posting");
    
A TwitterBotAction can be part of multiple groups.

### Randomizing Actions

If you create multiple actions for a given TwitterBot, you can get a random one back by calling

    Bot.randomAction();
  
If you want a random action in a group, you can pass in the group name

    Bot.randomAction("group name");
    
### Weighting Actions

If you want to make the randomAction function a little less random, you can give weights to all TwitterBotActions

    Bot.addAction("tweet", function(twitter, action, tweet) {
      Bot.tweet("I'm posting a tweet!");
    }).group("tweet posting").weight(10);

You can then get a random action, taking the action weights into account, by calling:
    
    Bot.randomWeightedAction("tweet posting");
    

## Streaming

If you want to watch the Twitter timeline, you can use the built in TwitterBotStreamAction object. One is automatically provided for you as part of the TwitterBot.

    Bot.listen(listenerName, listenerFunction, function(twitter, action, tweet) {
      // Do something with the tweet
    });
    
The listenerName is a string that identifies the listener. The listenerFunction follows the following format:

    listenerFunction = function(tweet) {
      if (something)
        return true;
        
      return false;
    }
    
By returning true, you'll tell the listen() function to execute the passed callback method.

For example:

    Bot.listen("listening", tweetThatContainsName, function(twitter, action, tweet) {
      Bot.now(Bot.randomWeightedAction("reply actions"), tweet);
    });

Would cause our TwitterBot to perform some random action in the "reply actions" group, whenever the tweetThatContainsName() function returns true.

You can create a TwitterBotStreamAction via:

    var streamAction = new TwitterBotStreamAction(null, Bot)
    
The first parameter of the TwitterBotStreamAction constructor is an action function which won't actually be called (inherited from the standard TwitterBotAction constructor), so you don't need to actually pass anything in.

See more about the [TwitterBotStreamAction class here](https://github.com/nkirby/node-twitterbot/wiki/TwitterBotStreamAction "TwitterBotStreamAction")

## Scheduling

If you want to execute an action immediately, you can call the bot's now() function

    Bot.now("action name");
    Bot.now(function(twitter) {
    });
    Bot.now(twitterBotAction);
    
The now() function takes either an actionName identifier, a function with the same signaure as a TwitterBotAction, or an actual TwitterBotAction object

You can schedule actions into the future by calling

    Bot.schedule("action name", 1000);
    
Would cause the Bot's "action name" action to be called after 1000 ms (same as setTimeout)

### Rescheduling

Since the second parameter passed into the TwitterBotAction's method is the TwitterBotAction itself, you can call this:

    var tweetAction = Bot.addAction("tweet", function(twitter, action, tweet) {
      Bot.tweet("I'm posting a tweet!");
      action.schedule(1000);
    });

Which would cause the same action to be executed in 1000 ms

## Credits & Such

This project was created by Nathaniel Kirby

[nate@projectspong.com](mailto:nate@projectspong.com "nate@projectspong.com")

[@thenatekirby](http://twitter.com/thenatekirby "Nate Kirby on Twitter")

Use it at your own risk. Do not do stupid things with the Twitter API. It's called abuse, and if you use this code to spam people, you're
a jackass.

Special thanks to all the developers whose modules are used to build node-twitterbot. Thanks to the NPM and NodeJS teams as well.

And above all else, thanks to Twitter for providing me an output for these shenanigans.

### License

This software is provided via the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

