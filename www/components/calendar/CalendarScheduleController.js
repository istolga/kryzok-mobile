(function() {
  'use strict';

  angular
    .module('kryzok.calendar.schedule', ['kryzok.calendar.service'])
    .controller('CalendarScheduleController', CalendarScheduleController);

  CalendarScheduleController.$inject = ['$scope', '$stateParams', '$ionicHistory', '$ionicPlatform', 'CalendarService'];
  function CalendarScheduleController($scope, $stateParams, $ionicHistory, $ionicPlatform, CalendarService) {
    console.log("in calendar schedule controller");

    var vm = this;
    $scope.schedule = {};
    $scope.mapsUrl = "geo:0,0";
    $scope.fromTime = $stateParams.fromTime;
    $scope.toTime = $stateParams.toTime;
    $scope.scheduleDate = $stateParams.scheduleDate;

    vm.activate = function () {
      console.log("in activate of CalendarScheduleController");
      CalendarService.getSchedules().then(function(response) {
        console.log("in done function for activities");
        var activities = response.activities;

        var scheduleId = $stateParams.scheduleId;
        if (activities && scheduleId) {
          console.log("show schedule with id: " + scheduleId);
          $scope.schedule = activities[scheduleId];

          if ($ionicPlatform.is('ios')) {
            $scope.mapsUrl = "maps://";
          }
          var location = $scope.schedule.location;
          if (location) {
            $scope.mapsUrl += "?q=" + location.address + "," + location.city + "," + location.state_province + ","
              + location.zip + "," + location.country;
          }
        }
      });
    };

    $scope.myGoBack = function () {
      $ionicHistory.goBack();
    };

    vm.activate();
  }
})();