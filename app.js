'use strict';
// create an API server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const PORT = process.env.PORT || 5000;

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())
app.use((req, res, next) => f.verifySignature(req, res, next));

const config = require('./config');
// FB Messenger Webhooks, Send API
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

//URLs
const API_URL = config.API_URL;
const WEB_URL = config.WEB_URL;
const DIR_IMAGE_URL = config.DIR_IMAGE_URL;

// Custom payload
const postbacks = require('./postbacks');
const p = new postbacks();

// Session
const session = require('./session');
// WIT Actions
const actions = require('./actions')(session, f);

// WIT.AI
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN,
	actions
});

//imdb api
const imdb = require('imdb-api');

// Register the webhooks
app.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Handle incoming
app.post('/', (req, res, next) => {
	f.incoming(req, res, msg => {
		const {
			sender,
			postback,
			message,
		} = msg;

		//turn typing indicators on
		f.senderAction(sender);

		//Custom Payload
		if(postback) {
			let sessionId = session.init(sender);
			let {context} = session.get(sessionId);
			switch(postback.payload) {
				case 'GET_STARTED':
					p.getstarted(sender, f, API_URL, WEB_URL);
					context.action = 'get_started';
					session.update(sessionId, context);
				break;
				case 'MENU_MOVIES':
					p.movies(sender, f);
					context.action = 'movies';
					session.update(sessionId, context);
				break;
				case 'MENU_THEATERS':
					p.theaters(sender, f);
					context.action = 'movies';
					session.update(sessionId, context);
				break;
				case 'MENU_TV':
					p.tv(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'MENU_TV_LOCAL':
					p.tvLocal(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'MENU_TV_LOCAL_PROVIDERS':
					p.tvLocalProviders(sender, f);
				break;
				case 'MENU_TV_CABLE':
					p.tvCable(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'MENU_TV_CABLE_PROVIDERS':
					p.tvCableProviders(sender, f);
				break;
				case 'MENU_NOW_SHOWING':
					p.nowshowinggeneric(sender, f);
					context.action = 'now_showing';
					session.update(sessionId, context);
				break;
				case 'MENU_NEXT_ATTRACTION':
					p.nextattraction(sender, f);
					context.action = 'now_showing';
					session.update(sessionId, context);
				break;
				case 'MENU_COMING_SOON':
					p.comingsoon(sender, f);
					context.action = 'coming_soon';
					session.update(sessionId, context);
				break;
				case 'MENU_ONLINE':
					p.featuredOnline(sender, f);
					context.action = 'online';
					session.update(sessionId, context);
				break;
				case 'MENU_ONLINE_PROVIDERS':
					p.onlineProviders(sender, f);
					context.action = 'online';
					session.update(sessionId, context);
				break;
				case 'MENU_CABLE':
					p.cableFeatured(sender, f);
					context.action = 'cable';
					session.update(sessionId, context);
				break;
				case 'MENU_CABLE_PROVIDERS':
					p.cableProviders(sender, f);
					context.action = 'cable';
					session.update(sessionId, context);
				break;
				case 'MENU_EVENTS':
					p.events(sender, f);
				break;
				case 'MENU_MUSIC':
					p.eventsCategories(sender, f, 'music');
				break;
				case 'MENU_SHOWS':
					p.eventsCategories(sender, f, 'shows');
				break;
				case 'MENU_CONVENTIONS':
					p.eventsCategories(sender, f, 'conventions');
				break;
				case 'MENU_SPORTS':
					p.eventsCategories(sender, f, 'sports');
				break;
				case 'MENU_CAMPUS':
					p.eventsCategories(sender, f, 'campus');
				break;
				case 'MENU_EVENT_OTHER':
					p.eventsCategories(sender, f, 'other');
				break;
				default:
					
			}
			console.log(context);
		}

		if(message) {
			let sessionId = session.init(sender);
			let {context} = session.get(sessionId);
			let msgtxt = message.text.toLowerCase();

			switch(msgtxt) {
				case 'movies':
				case 'movie':
					//f.txt(sender, 'movies');
					p.movies(sender, f);
					context.action = 'movies';
					session.update(sessionId, context);
				break;
				case 'tv shows':
				case 'tv show':
					p.tv(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'events':
				case 'event':
					p.events(sender, f);
					context.action = 'events';
					context.eventLocation = '';
					session.update(sessionId, context);
				break;
				case 'music':
					p.eventsCategories(sender, f, 'music');
				break;
				case 'shows':
					p.showEvents(sender, f);
				break;
				case 'conventions':
					p.eventsCategories(sender, f, 'conventions');
				break;
				case 'sports & lifestyle':
					p.showEvents(sender, f);
				break;
				case 'campus':
					p.showEvents(sender, f);
				break;
				case 'others':
					p.showEvents(sender, f);
				break;
				case 'gig':
					p.showEvents(sender, f);
				break;
				case 'concert':
					p.showEvents(sender, f);
				break;
				case 'fairs & exhibit':
					p.showEvents(sender, f);
				break;
				case 'talks & workshop':
					p.showEvents(sender, f);
				break;
				case 'conferences':
					p.showEvents(sender, f);
				break;
				case 'now showing':
					p.nowshowinggeneric(sender, f);
					context.action = 'now_showing';
					session.update(sessionId, context);
				break;
				case 'next attraction':
					p.nextattraction(sender, f);
					context.action = 'now_showing';
					session.update(sessionId, context);
				break;
				case 'coming soon':
					p.comingsoon(sender, f);
					context.action = 'coming_soon';
					session.update(sessionId, context);
				break;
				case 'q':
				case 'quit':
					f.txt(sender, 'Cool, You can use the blue line on the left corner to start again.');
					session.delete(sessionId);
				break;
				default:

					if(context && context.action) {
						console.log(context);
					    switch (context.action) {
					    	case 'movies':
					    	case 'now_showing':
					    	case 'coming_soon':
					    		imdb.getReq({ name: msgtxt}, (err, info) => {
									if(info) {
										let title = info.title,	plot = info.plot, genres = info.genres, director = info.director, 
										actors = info.actors, rating = info.rating, poster = info.poster;
										console.log(info);
										f.img(sender, poster) ;
										setTimeout(function() { 
											f.txt(sender, `Title: ${title}\nGenres: ${genres}\nDirector: ${director}\nCasts: ${actors}\nRating: ${rating}`); 
										}, 2000);
									}

									if(err) {
										f.txt(sender, ':( Ooops...can\'t find that movie. are you sure that movie exist? Please check your spelling.');
									}
							    });
					    	break;
					    	case 'events':
					    		if(context.eventType === '') {
					    			p.showEvents(sender, f);
					    			// setTimeout(function(){
					    			// 	p.btnEvents(sender, f);
					    			// }, 2000);
					    			context.eventType = message.text;
					    			session.update(sessionId, context);
					    		}
					    	break;
					    	case 'tv':
					    		imdb.getReq({ name: msgtxt}, (err, info) => {
									if(info) {
										let title = info.title,	plot = info.plot, genres = info.genres, director = info.director, 
										actors = info.actors, rating = info.rating, poster = info.poster;
										console.log(info);
										f.img(sender, poster) ;
										setTimeout(function() { 
											f.txt(sender, `Title: ${title}\nGenres: ${genres}\nDirector: ${director}\nCasts: ${actors}\nRating: ${rating}`); 
										}, 2000);
									}

									if(err) {
										f.txt(sender, ':( Ooops...can\'t find that tv show. are you sure that show exist? Please check your spelling.');
									}
							    });
					    	break;
					    	default:
					    }
					} else {
						wit.runActions(sessionId, message.text, context)
						.then(ctx => {
							// Delete session if the conversation is over
							ctx.jobDone ? session.delete(sessionId) : session.update(sessionId, ctx);
							//console.log(ctx);
						})
						.catch(error => console.log(`Error: ${error}`));
					}
			}	
		}

		
	});
	return next();
});


// Persistent Menu
f.showPersistent([
	{
		type: "postback",
		title: "Movies",
		payload: "MENU_MOVIES"
	},
	{
		type: "postback",
		title: "TV Shows",
		payload: "MENU_TV"
	},
	{
		type: "postback",
		title: "Events",
		payload: "MENU_EVENTS"
	}
]);

// Subscribe
f.subscribe();

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`)
});