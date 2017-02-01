'use strict';
const request = require('request');
const imdb = require('imdb-api');
let randMsg = require('../messages');
let greetrandNum = Math.floor((Math.random() * Object.keys(randMsg.greeting.message).length) + 0);
let alfrandNum = Math.floor((Math.random() * Object.keys(randMsg.alfmsg.message).length) + 0);
const greeting = randMsg.greeting.message[greetrandNum];
const alfmsg = randMsg.alfmsg.message[alfrandNum];
const {moviemsg, tvmsg, eventmsg, theatersmsg, cablemsg} = randMsg;
class postbacks {

  getstarted(sender, f, API_URL, WEB_URL) {
    f.getProfile(sender)
      .then(profile => {
        const {first_name, last_name, gender, profile_pic, timezone} = profile;
        //console.log(gender);
        let sex = gender === undefined ? 'none' : gender;
            request({
              uri: API_URL+'/subscriber/store',
              qs: {
                fbid: sender,
                fname: first_name,
                lname: last_name,
                gender: sex,
                pic: profile_pic,
                timezone: timezone
              },
              method: 'POST'
            }, (error, response, body) => {
              //console.log(body);
              if(!error && response.statusCode === 200) {
                let data = JSON.parse(body);
                let text = '';
                if(data.exists === true)
                {
                      text = `${greeting} ${first_name} :D`;
                } else {
                      text = `${greeting} ${first_name} :D`;
                }
                text += ' '+alfmsg;
                let servicesbuttons = f.servicesbuttons(text);
                f.btn(sender, servicesbuttons);
              } else {
                f.txt(sender, ':( Sorry for inconvinient please come back later.')
              }
            });
      })
      .catch(error => console.log(error));
  }

  movies(sender, f) {
    let text = moviemsg;
    f.btn(sender, f.moviesdata(text));
  }
  theaters(sender, f) {
    let text = theatersmsg;
    f.btn(sender, f.theatersdata(text));
  }

  tv(sender, f) {
    let text = tvmsg;
    f.btn(sender, f.tvBtn(text));
  }

  tvLocal(sender, f) {
    let movies = [];
    let moviename = ['A Violent Prosecutor', 'Seklusyon', 'Split', 'The Great Wall', 'xXx: Return of Xander Cage'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `script/instruction here 🎥`);
          setTimeout(function(){
            f.generic(sender, f.tvLocalResult(movies));
            setTimeout(function(){
              f.btn(sender, f.tvLocalBtn('script here...'));
            }, 1000);
          }, 1000);
        }
    });
    }
    console.log(movies)
  }

  tvLocalProviders(sender, f) {
    f.generic(sender, f.tvLocalProvidersData());
  }

  tvCable(sender, f) {
    let movies = [];
    let moviename = ['A Violent Prosecutor', 'Seklusyon', 'Split', 'The Great Wall', 'xXx: Return of Xander Cage'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `script/instruction here 🎥`);
          setTimeout(function(){
            f.generic(sender, f.tvLocalResult(movies));
            setTimeout(function(){
              f.btn(sender, f.tvCableBtn('script here...'));
            }, 1000);
          }, 1000);
        }
    });
    }
    console.log(movies)
  }

  tvCableProviders(sender, f) {
    f.generic(sender, f.cableProvidersData());
  }

  nowshowinglist(sender, f) {
    f.list(sender, f.nowshowingdata());
  }

  nowshowinggeneric(sender, f) {
    let movies = [];
    let moviename = ['A Violent Prosecutor', 'Seklusyon', 'Split', 'The Great Wall', 'xXx: Return of Xander Cage'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `script/instruction here 🎥`);
          setTimeout(function(){
            f.generic(sender, f.nowshowingdatageneric(movies));
            setTimeout(function(){
              f.btn(sender, f.nsbtn('script here...'));
            }, 1000);
          }, 1000);
        }
    });
    }
  }

  nextattraction(sender, f) {
    let movies = [];
    let moviename = ['Why Him?', 'Monster Trucks'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `script/instruction here 🎥`);
          setTimeout(function(){
          f.generic(sender, f.nowshowingdatageneric(movies));
            setTimeout(function(){
              f.btn(sender, f.nabtn('script here...'));
            }, 1000);
          }, 1000);
        }
    });
    }
  }

  comingsoon(sender, f) {
    let movies = [];
    let moviename = ['Resident Evil: The Final Chapter', 'Kung Fu Yoga', 'Sakaling Hindi Makarating'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `script/instruction here 🎥`);
          setTimeout(function(){
          f.generic(sender, f.csMovies(movies));
            setTimeout(function(){
              f.btn(sender, f.csbtn('script here...'));
            }, 1000);
          },1000);
        }
    });
    }
  }

  featuredOnline(sender, f) {
    let movies = [];
    let moviename = ['The Shawshank Redemption', 'The Godfather', 'The Dark Knight', '12 Angry Men', 'Schindler\'s List '];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `Featured Movies 🎥`);
          setTimeout(function() {
          f.generic(sender, f.onlineFeaturedData(movies));
            setTimeout(function(){
              f.btn(sender, f.onlinebtn('script here...'));
            }, 1000);
          }, 1000);
        }
    });
    }
  }

  onlineProviders(sender, f) {
    f.txt(sender, `script here...`);
    setTimeout(function(){
      f.generic(sender, f.onlineProvidersBtn('script here'));
    }, 1000)
  }

  cableFeatured(sender, f) {
    let movies = [];
    let moviename = ['The Veil', 'BATMAN & ROBIN', 'THE TRANSPORTER REFUELED', 'ROBIN HOOD: MEN IN TIGHTS', 'SUPERMAN II', 'MORTAL KOMBAT ANNIHILATION'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.txt(sender, `script/instruction here 🎥`);
          setTimeout(function(){
            f.generic(sender, f.cableFeaturedData(movies));
            setTimeout(function(){
              f.btn(sender, f.cableBtn('script here..'));
            },1000);
          },1000)
        }
    });
    }
  }

  cableProviders(sender, f) {
    let text = cablemsg;
    f.generic(sender, f.cableProvidersData());
  }

  events(sender, f) {
    let text = eventmsg;
    f.quick(sender, f.eventsCategoryBtn(text));
  }

  eventsCategories(sender, f, parentCat) {
    switch (parentCat) {
      case 'music':
        f.quick(sender, f.eventsSubCat('script here', parentCat));
      break;
      case 'conventions':
        f.quick(sender, f.eventsSubCat('script here', parentCat));
      break;
      default:
    }
  }

  showEvents(sender, f) {
    f.generic(sender, f.eventsResult());
    setTimeout(function(){
      f.btn(sender, f.eventResultBtn('script here'));
    }, 1000)
  }

  btnEvents(sender, f) {
    let text = 'What would you like to do next? Type q to quit.';
    f.btn(sender, f.btnEventsData(text));
  }

  tvFeatured(sender, f) {
    let movies = [];
    let moviename = ['Narcos', 'Big Bang Theory', 'Game of Thrones', 'Daredevil', 'Arrow', 'SuperGirl'];
    for(let i = 0, len = moviename.length; i < len; i++) {
    imdb.getReq({ name: moviename[i]}, (err, things) => {
        movies.push(things);
        if(len === movies.length) { 
          f.generic(sender, f.tvShowsFeaturedData(movies));
        }
    });
    }
  }

  

}

module.exports = postbacks;
