####################################################
# node-twitterbot
# A NodeJS module for creating Twitter Bots
# Nathaniel Kirby <nate@projectspong.com
# https://github.com/nkirby/node-twitterbot
####################################################

eventEmitter = require('events').EventEmitter

class TwitterBotAction extends eventEmitter
	constructor: (action, @owner) ->
		@on "action", (twitter) ->
			action twitter
		@init()
		@groups = []
		@weight = 0

	init: () ->

####################################################
# Groupings

	group: (groupName) ->
		@groups.push groupName
		this

	ungroup: (groupName) ->
		index = @groups.indexOf groupName
		if index > -1
			@groups.splice index, 1
		this

	isPartOfGroup: (groupName) ->
		return @groups.indexOf(groupName) > -1

####################################################
# Weighting

	weight: (@weight) ->
		this

module.exports.TwitterBotAction = TwitterBotAction