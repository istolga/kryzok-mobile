(function() {
    'use strict';

    angular
        .module('kryzok.calendar', ['kryzok.calendar.service'])
        .controller('ListCalendarController', ListCalendarController);

    ListCalendarController.$inject = ['$state', '$scope', 'CalendarService', '$cordovaSocialSharing'];
    function ListCalendarController($state, $scope, CalendarService, $cordovaSocialSharing) {
        console.log("in list calendar controller");

        var vm = this;
        $scope.schedules = [];
        $scope.activities = {};
        $scope.shouldShowDelete = true;
        $scope.listCanSwipe = true;

        vm.activate = function () {
            CalendarService.getSchedules().then(function(response) {
                console.log("in done function");
                if (response.schedules) {
                    $scope.schedules = response.schedules;
                }
                if (response.activities) {
                    $scope.activities = response.activities;
                }
            });
        };
        $scope.viewItem = function(itemId, _scheduleDate, _fromTime, _toTime) {
            console.log("in view item, will go to schedule");
            $state.go('app.schedule', {
                scheduleId: itemId,
                scheduleDate: _scheduleDate,
                fromTime: _fromTime,
                toTime: _toTime
            });
        };
        $scope.share = function(itemId, _event) {
            console.log("in share");
            _event.stopPropagation();
            var schedule = $scope.activities[itemId];

            var message = "";
            var subject = "";
            var link = "";
            if (schedule) {
                message = "Check it out: " + schedule.title;
                if (schedule.location) {
                    message += " located at " + schedule.location.address + " " + schedule.location.city +
                      " " + schedule.location.state_province;
                }
                subject = schedule.title;
                if (schedule.website) {
                    link = schedule.website;
                }
            }
            $cordovaSocialSharing
              .share(message, subject, null, link)
              .then(function(result) {
                  console.log("success in share");
              }, function(err) {
                  console.log("error in share");
              });
        };
        $scope.edit = function () {
            console.log("in edit");
        };
        $scope.delete = function () {
            console.log("in delete");
        };
        $scope.openYelp = function(_event) {
            console.log("open yelp");
            _event.stopPropagation();

            window.open('yelp:');
        };
        $scope.search = function () {
        	$state.go('app.search', {
    			refresh: new Date().getTime()
    		});
        };

        vm.activate();
    }
})();