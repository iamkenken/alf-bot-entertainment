'use strict';

let greetings = { 
	'0': 'Hi', 
	'1': 'Hey', 
	'2': 'Hello', 
	'3': 'Howdy', 
	'4': 'Kumusta' 
}
let greeting = greetings[Math.floor((Math.random() * Object.keys(greetings).length) + 0)];

let alfmsgs = {
		'0': 'It’s HeyAlf! Glad to have you here! If it’s movies, TV shows or events you’re looking for, you’ve come to the right place! Let me help you with what you need.',
		'1': 'It’s HeyAlf! Great to have you here! If it’s movies, TV shows or events you’re looking for, you’ve come to the right place! Let me help you with what you need.',
		'2': 'It’s HeyAlf! Nice to have you here! If it’s movies, TV shows or events you’re looking for, you’ve come to the right place! Let me help you with what you need.',
		'3': 'It’s HeyAlf! Happy to have you here! If it’s movies, TV shows or events you’re looking for, you’ve come to the right place! Let me help you with what you need.',
		'4': 'It’s HeyAlf! Thrilled to have you here! If it’s movies, TV shows or events you’re looking for, you’ve come to the right place! Let me help you with what you need.'
}
let alfmsg = alfmsgs[Math.floor((Math.random() * Object.keys(alfmsgs).length) + 0)];
 
let thanksmsgs = {
		'0': 'Cool 👍. Alf is always at your service 🎉:)',
		'1': 'Alf is always at your service. Hope I could help a bit. See ya! 🎉:)',
		'2': 'Alf is always at your service. Hope I could help a bit. 👍 See ya! 🎉:)'
}
let thanks = thanksmsgs[Math.floor((Math.random() * Object.keys(thanksmsgs).length) + 0)];

let byes = {
		'0': 'Cool. Alf is always at your service. ✋ Bye',
		'1': 'Alf is always at your service. Hope I could help a bit. See ya! ✋',
		'2': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!',
		'3': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!',
		'4': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!',
		'5': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!'
}
let bye = byes[Math.floor((Math.random() * Object.keys(byes).length) + 0)];

let moviemsgs = {
	'0': 'Awesome! I’m a movie lover myself. Let’s get started! Choose from the options below, or you can also search by movie title/artist/director.',
	'1': 'Great! I’m a movie lover myself. Let’s get started! Choose from the options below, or you can also search by movie title/artist/director.',
	'2': 'Cool! I’m a movie lover myself. Let’s get started! Choose from the options below, or you can also search by movie title/artist/director.',
	'3': 'Nice! I’m a movie lover myself. Let’s get started! Choose from the options below, or you can also search by movie title/artist/director.',
	'4': 'Awesome! I’m a movie lover myself. Let’s get to it! Choose from the options below, or you can also search by movie title/artist/director.',
	'5': 'Great! I’m a movie lover myself. Let’s get to it! Choose from the options below, or you can also search by movie title/artist/director.',
	'6': 'Cool! I’m a movie lover myself. Let’s get to it! Choose from the options below, or you can also search by movie title/artist/director.',
	'7': 'Nice! I’m a movie lover myself. Let’s get to it! Choose from the options below, or you can also search by movie title/artist/director.',
}
let moviemsg = moviemsgs[Math.floor((Math.random() * Object.keys(moviemsgs).length) + 0)];

let theatersmsgs = {
	'0': 'Excellent! Nothing beats watching movies on the big screen, don’t you think? Find out what’s good!',
	'1': 'Excellent! Nothing beats watching movies on the big screen, don’t you think?Find out what’s good!',
	'2': 'Great! Nothing beats watching movies on the big screen, don’t you think? Find out what’s good!',
	'3': 'Cool! Nothing beats watching movies on the big screen, don’t you think? Find out what’s good!',
	'4': 'Nice! Nothing beats watching movies on the big screen, don’t you think? Find out what’s good!'
}
let theatersmsg = theatersmsgs[Math.floor((Math.random() * Object.keys(theatersmsgs).length) + 0)];

let nsmsg = 'Catch these while they’re still in theaters!';
let namsg = 'Won’t be too long now before these movies come out!';
let csmsg = 'Watch out for these movies!'
let nacsmsg = 'Check what new movies will be out soon!'

let tvmsgs = {
	'0': 'Awesome! Find out what movies are on.',
	'1': 'Great! Find out what movies are on.',
	'2': 'Cool! Find out what movies are on.',
	'3': 'Nice! Find out what movies are on.'
}
let tvmsg = tvmsgs[Math.floor((Math.random() * Object.keys(tvmsgs).length) + 0)];
let moremovies = 'Check out more movies!';

let moviesonlinemsgs = {
	'0': 'Awesome! Do I sense a movie marathon? Take your pick!',
	'1': 'Great! Do I sense a movie marathon? Take your pick!',
	'2': 'Cool! Do I sense a movie marathon? Take your pick!',
	'3': 'Nice! Do I sense a movie marathon? Take your pick!'
}
let moviesonlinemsg = moviesonlinemsgs[Math.floor((Math.random() * Object.keys(moviesonlinemsgs).length) + 0)];

let eventmsg = 'script here';
let cablemsg = 'script here';

module.exports = {
	greeting,
	alfmsg,
	thanks,
	bye,
	moviemsg,
	eventmsg,
	tvmsg,
	theatersmsg,
	cablemsg,
	namsg,
	nsmsg,
	csmsg,
	nacsmsg,
	moremovies,
	moviesonlinemsg
}