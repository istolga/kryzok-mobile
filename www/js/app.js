// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var kruzokMobile = angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'kryzok.calendar', 'kryzok.calendar.filters',
  'kryzok.calendar.schedule','kryzok.search', 'kryzok.about', 'kryzok.exception']);

kruzokMobile.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});

kruzokMobile.config(function ($stateProvider, $urlRouterProvider, $compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(geo|maps):/);

  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "components/menu/_menu.html",
      controller: 'AppCtrl'
    })

    .state('app.about', {
      url: "/about",
      views: {
        'menuContent': {
          templateUrl: "components/about/_about.html",
          controller: 'AboutController'
        }
      }
    })

    .state('app.search', {
      url: "/search/activity/q=?keyword&owned&refresh",
      views: {
        'menuContent': {
          templateUrl: "components/search/_search.html",
          controller: 'SearchController'
        }
      }
    })

    .state('app.browse', {
      url: "/browse",
      views: {
        'menuContent': {
          templateUrl: "templates/browse.html"
        }
      }
    })

    .state('app.calendar', {
      url: "/calendar",
      views: {
        'menuContent': {
          templateUrl: "components/calendar/list_calendar.html",
          controller: 'ListCalendarController'
        }
      }
    })
    .state('app.schedule', {
      url: "/schedule?scheduleId&scheduleDate&fromTime&toTime",
      views: {
        'menuContent': {
          templateUrl: "components/calendar/calendar_schedule.html",
          controller: 'CalendarScheduleController'
        }
      }
    })

    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent': {
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/calendar');
});


kruzokMobile.factory("EndpointService", function () {
  var
    ACTIVITY_ENDPOINT = '/rest/v' + API_VERSION + '/activity';

  return {
    SEARCH_ACTIVITY_URI: [MOBILE_CLIENT.BASE_URL, ACTIVITY_ENDPOINT, "/search"].join("")
  }
});
