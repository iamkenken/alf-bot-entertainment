'use strict';
const request = require('request');
let randMsg = require('../messages');
const {greeting, alfmsg, moviemsg, tvmsg, eventmsg, theatersmsg, cablemsg, nsmsg, namsg, csmsg, nacsmsg, moremovies, moviesonlinemsg} = randMsg;
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
    f.quick(sender, f.moviesdataQuick(text));
  }

  theaters(sender, f) {
    f.txt(sender, theatersmsg);
    setTimeout(function(){
      f.generic(sender, f.moviesResults());
      setTimeout(function(){
        f.quick(sender, f.nsbtnQuick(nacsmsg));
      }, 2000);
    }, 1000);
  }

  nowshowinglist(sender, f) {
    f.list(sender, f.nowshowingdata());
  }

  nowshowinggeneric(sender, f) {
    f.txt(sender, nsmsg);
    setTimeout(function(){
      f.generic(sender, f.moviesResults());
      setTimeout(function(){
        f.quick(sender, f.nsbtnQuick(nacsmsg));
      }, 1000);
    }, 1000);
  }

  nextattraction(sender, f) {

    f.txt(sender, namsg);
    setTimeout(function(){
    f.generic(sender, f.moviesResults());
      setTimeout(function(){
        f.quick(sender, f.nabtnQuick('script here (required)'));
      }, 2000);
    }, 1000);

  }

  comingsoon(sender, f) {
    f.txt(sender, csmsg);
    setTimeout(function(){
    f.generic(sender, f.csMoviesResults());
      setTimeout(function(){
        f.quick(sender, f.csbtnQuick('script here (required)'));
      }, 2000);
    },1000);
  }

  featuredOnline(sender, f) {
    f.txt(sender, moviesonlinemsg);
    setTimeout(function() {
      f.generic(sender, f.moviesResults());
      setTimeout(function(){
        f.btn(sender, f.onlinebtn(moremovies));
      }, 1000);
    }, 1000);
  }

  onlineProviders(sender, f) {
    f.txt(sender, `script here...`);
    setTimeout(function(){
      f.generic(sender, f.onlineProvidersBtn('script here'));
    }, 1000)
  }

  cableFeatured(sender, f) {

    f.txt(sender, tvmsg);
    setTimeout(function(){
      f.generic(sender, f.moviesResults());
      setTimeout(function(){
        f.btn(sender, f.cableBtn(moremovies));
      },2000);
    },1000)

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

  tv(sender, f) {
    f.quick(sender, f.tvBtnQuick(tvmsg));
  }

  tvLocal(sender, f) {

    f.txt(sender, `script/instruction here 🎥`);
    setTimeout(function(){
      f.generic(sender, f.tvLocalResult());
      setTimeout(function(){
        f.btn(sender, f.tvLocalBtn('script here (required)'));
      }, 2000);
    }, 1000);

  }

  tvLocalProviders(sender, f) {
    f.generic(sender, f.tvLocalProvidersData());
  }

  tvCable(sender, f) {

    f.txt(sender, `script/instruction here 🎥`);
    setTimeout(function(){
      f.generic(sender, f.tvLocalResult());
      setTimeout(function(){
        f.btn(sender, f.tvCableBtn('script here (required)'));
      }, 2000);
    }, 1000);

  }

  tvCableProviders(sender, f) {
    f.generic(sender, f.cableProvidersData());
  }

}

module.exports = postbacks;
