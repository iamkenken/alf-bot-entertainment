'use strict';
const request = require('request');
const crypto = require('crypto');

class FBeamer {
	constructor(config) {
		try {
			if(!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined || config.APP_SECRET === undefined) {
				throw new Error("Unable to access tokens!");
			} else {
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
				this.APP_SECRET = config.APP_SECRET;
			}
		} catch(e) {
			console.log(e);
		}
	}

	registerHook(req, res) {
		// If req.query.hub.mode is 'subscribe'
		// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
		// then send back an HTTP status 200 and req.query.hub.challenge
		console.log(req.query);
		// let {
		// 	mode,
		// 	verify_token,
		// 	challenge
		// } = req.query.hub;
		let mode = req.query["hub.mode"], verify_token = req.query["hub.verify_token"], challenge = req.query["hub.challenge"];
		if(mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
			return res.end(challenge);
		} else {
			console.log("Could not register webhook!");
			return res.status(403).end();
		}
	}

	verifySignature(req, res, next) {
		if(req.method === 'POST') {
			let signature = req.headers['x-hub-signature'];
			try {
				if(!signature) {
					throw new Error("Signature missing!");
				} else {
					let hash = crypto.createHmac('sha1', this.APP_SECRET).update(JSON.stringify(req.body)).digest('hex');
					try {
						if(hash !== signature.split("=")[1]) {
							throw new Error("Invalid Signature");
						}
					} catch(e) {
							res.sendStatus(500, e);
						}
				}
			} catch(e) {
				res.sendStatus(500, e);
			}
		}

		return next();

	}

	subscribe() {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST'
		}, (error, response, body) => {
			if(!error && JSON.parse(body).success) {
				console.log("Subscribed to the page!");
			} else {
				console.log(error);
			}
		});
	}

	getProfile(id) {
		return new Promise((resolve, reject) => {
			request({
				uri: `https://graph.facebook.com/v2.7/${id}`,
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'GET'
			}, (error, response, body) => {
				if(!error & response.statusCode === 200) {
					resolve(JSON.parse(body));
				} else {
					reject(error);
				}
			});
		});
	}

	incoming(req, res, cb) {
		// Extract the body of the POST request
		let data = req.body;
		if(data.object === 'page') {
			// Iterate through the page entry Array
			data.entry.forEach(pageObj => {
				// Iterate through the messaging Array
				pageObj.messaging.forEach(msgEvent => {
					let messageObj = {
						sender: msgEvent.sender.id,
						timeOfMessage: msgEvent.timestamp,
						message: msgEvent.message || undefined,
						postback: msgEvent.postback || undefined,
						quick_reply: msgEvent.message === undefined ? undefined : msgEvent.message.quick_reply || undefined,
					}
					cb(messageObj);
				});
			});
		}
		res.sendStatus(200);
	}

	sendMessage(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: payload
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					reject(error);
				}
			});
		});
	}

	// Show Persistent Menu
	showPersistent(payload) {
		let obj = {
			setting_type: "call_to_actions",
			thread_state: "existing_thread",
			call_to_actions: payload
		}

		request({
			uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST',
			json: obj
		}, (error, response) => {
			if(error) {
				console.log(error);
			}
		});
	}

	// Send a text message
	txt(id, text) {
		let obj = {
			recipient: {
				id
			},
			message: {
				text
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));

		return true;

	}

	// Send an image message
	img(id, url) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						url
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));

		return true;
	}

	quick(id, message) {
		let obj = {
			recipient: {
				id
			},
			message
		}
		this.sendMessage(obj)
			.catch(error => console.log('I am '+error));
	}

	btn(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'button',
						text: data.text,
						buttons: data.buttons
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	generic(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'generic',
						elements: data
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	senderAction(id) {
		let obj = {
			recipient: { id
			},
			sender_action: "typing_on"
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	//SEND API list template
	list(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'list',
						elements: data.elements,
						buttons: data.buttons
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}



	servicesbuttons(text) {
		let buttons ={
	    "text":text,
	    "quick_replies":[
	      {
	        "content_type":"text",
	        "title":"Movies",
	        "payload":"MENU_MOVIES"
	      },
				{
	        "content_type":"text",
	        "title":"TV Shows",
	        "payload":"MENU_TV"
	      },
				{
	        "content_type":"text",
	        "title":"Events",
	        "payload":"MENU_EVENTS"
	      }
	    ]
	  };

		return buttons;
	}

	moviesdata(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Theaters",
			    "payload":"MENU_THEATERS"
			  },
			  {
			    "type":"postback",
			    "title":"Online",
			    "payload":"MENU_ONLINE"
			  },
			  {
			    "type":"postback",
			    "title":"Cable",
			    "payload":"MENU_CABLE"
			  }
			]
		};

		return data;
	}

	theatersdata(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Now Showing",
			    "payload":"MENU_NOW_SHOWING"
			  },
			  {
			    "type":"postback",
			    "title":"Next Attraction",
			    "payload":"MENU_NEXT_ATTRACTION"
			  },
			  {
			    "type":"postback",
			    "title":"Coming Soon",
			    "payload":"MENU_COMING_SOON"
			  }
			]
		};

		return data;
	}

	nowshowingdata() {
		let data = {
			elements: [
				{
				    "title": "Classic T-Shirt Collection",
				    "image_url": "https://eastridgecenter.com/wp-content/uploads/2016/03/Movie-Releases.jpg",
				    "subtitle": "See all our colors",
				    "buttons": [
				        {
				            "title": "Trailer",
				            "type": "postback",
				            "payload": "payload"
				        },
				        {
				            "title": "More Info",
				            "type": "postback",
				            "payload": "payload"
				        }
				    ]
				},
				{
				    "title": "Classic T-Shirt Collection",
				    "image_url": "https://eastridgecenter.com/wp-content/uploads/2016/03/Movie-Releases.jpg",
				    "subtitle": "See all our colors",
				    "buttons": [
				        {
				            "title": "View",
				            "type": "postback",
				            "payload": "payload"
				        }
				    ]
				}
			],
			buttons: [
				{
				    "title": "View More",
				    "type": "postback",
				    "payload": "payload"
				}
			]
		}

		return data;
	}

	nowshowingdatageneric(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "postback",
						"title": "Trailer",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "Where to Watch",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "More Info",
						"payload": "payload"
					}
				]
			});
			if(len === data.length) {
				data.push({
				"title": 'Script/Instruction here..',
				"buttons":[
					{
						"type": "postback",
						"title": "Show More",
						"payload": "payload"
					}
				]
			});
			}
		}
		return data;
	}

	onlineFeaturedData(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "postback",
						"title": "Trailer",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "Where to Watch",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "More Info",
						"payload": "payload"
					}
				]
			});
			if(len === data.length) {
				data.push({
				"title": 'Script/Instruction here..',
				"buttons":[
					{
						"type": "postback",
						"title": "See Full List",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "Recommended",
						"payload": "payload"
					}
				]
			});
			}
		}
		return data;
	}

	providersData() {
		let data = [
			{
				    "title": "Sky Cable",
				    "image_url": "http://2.bp.blogspot.com/-_-uObddnfXs/T7BejeyqA4I/AAAAAAAAEZQ/QDjYgu9tsBI/s1600/skycable_logo.gif",
				    "subtitle": "description here",
				    "buttons": [
				        {
				            "title": "Select",
				            "type": "postback",
				            "payload": "MENU_SKY"
				        }
				    ]
				},
				{
				    "title": "Cignal",
				    "image_url": "http://vmobilecavitephilippines.weebly.com/uploads/1/3/1/0/13101774/8059610_orig.jpg",
				    "subtitle": "description here",
				    "buttons": [
				        {
				            "title": "Select",
				            "type": "postback",
				            "payload": "MENU_CIGNAL"
				        }
				    ]
				}
		]

		return data;
	}


	skyFeaturedData(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "postback",
						"title": "Schedule",
						"payload": "payload"
					}
				]
			});
			if(len === data.length) {
				data.push({
				"title": 'Script/Instruction here..',
				"buttons":[
					{
						"type": "postback",
						"title": "See Full List",
						"payload": "payload"
					}
				]
			});
			}
		}
		return data;
	}

	tvShowsFeaturedData(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
		data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot,
				"buttons":[
					{
						"type": "postback",
						"title": "Where to Watch",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "More Info",
						"payload": "payload"
					}
				]
			});
		}
		return data;
	}

	onlineBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Recommended",
			    "payload":"MENU_ONLINE_RECOMMENDED"
			  }
			]
		};

		return data;
	}

	tvBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Featured TV Shows",
			    "payload":"MENU_TV_FEATURED"
			  },
			  {
			    "type":"postback",
			    "title":"Trending",
			    "payload":"MENU_TV_TRENDING"
			  }
			]
		};

		return data;
	}

	eventsdata(text) {

		let data ={
			"text":text,
			"quick_replies":[
			  {
			    "content_type":"text",
			    "title":"Music",
			    "payload":"payload"
			  },
			  {
			    "content_type":"text",
			    "title":"Convention",
			    "payload":"payload"
			  },
			  {
			    "content_type":"text",
			    "title":"Sports & Lifestyle",
			    "payload":"payload"
			  },
			  {
			    "content_type":"text",
			    "title":"Shows",
			    "payload":"payload"
			  },
			  {
			    "content_type":"text",
			    "title":"Campus",
			    "payload":"payload"
			  },
			  {
			    "content_type":"text",
			    "title":"Others",
			    "payload":"payload"
			  }
			]
		};

		return data;
	}

	eventsResult() {
		let data = [
			{
				"title": "#HugotPlaylist",
				"image_url": "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/15826168_1234402739928825_2155050871105397501_n.jpg?oh=d576f28e337ffdf579ff06376e4f9c4b&oe=590E8486",
				"subtitle": "#HugotPlaylist with Ogie Alcasid, Ai Ai Delas Alas and Erik Santos with Special Guest Solenn Heusaff",
				"buttons":[
					{
						"type": "postback",
						"title": "Full Details",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "See Tickets",
						"payload": "payload"
					}
				]
			},
			{
				"title": "The Vice Ganda Concert",
				"image_url": "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/16003209_10155673822828032_6404413788619756976_n.jpg?oh=2b875773e7a6336fdf00d58a502356a7&oe=59050650",
				"subtitle": "It'll surely a fun Valentines show as Vice Ganda takes over the Araneta Coliseum for the fifth time this February!",
				"buttons":[
					{
						"type": "postback",
						"title": "Full Details",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "See Tickets",
						"payload": "payload"
					}
				]
			},
			{
				"title": "Goo Goo Dolls Live in Manila",
				"image_url": "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/14716105_10155318615713032_1331906193961180016_n.jpg?oh=b901a02c60c36203c395d685ed420bef&oe=59059B7B",
				"subtitle": "First time ever! Goo Goo Dolls are coming to Manila! Come see their first Manila gig to be held on February 11, 2017 - Smart Araneta Coliseum",
				"buttons":[
					{
						"type": "postback",
						"title": "Full Details",
						"payload": "payload"
					},
					{
						"type": "postback",
						"title": "See Tickets",
						"payload": "payload"
					}
				]
			},
			{
				"title": "More Options",
				"subtitle": "Script/Instruction here...",
				"buttons":[
					{
						"type": "postback",
						"title": "See Full List",
						"payload": "payload"
					}
				]
			}
		];

		return data;
	}

	btnEventsData(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Show more",
			    "payload":"payload"
			  },
			  {
			    "type":"postback",
			    "title":"New Search",
			    "payload":"payload"
			  },
			  {
			    "type":"postback",
			    "title":"Get Weekly Updates",
			    "payload":"payload"
			  }
			]
		};

		return data;
	}

}

module.exports = FBeamer;
