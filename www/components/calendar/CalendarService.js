(function() {
    'use strict';

    angular.module('kryzok.calendar.service', []).factory('CalendarService', CalendarService);

    CalendarService.$inject = ["$http", '$q', '$filter', 'ExceptionService'];
    var SCHEDULES_UPDATE_INTERVAL_MS = 2 * 3600 * 1000;

    function CalendarService($http, $q, $filter, ExceptionService) {
        var that = this;

        that.lastReqDate = null;
        that.schedules = [];//add saving it in some storage
        that.activites = {};

        return {
            getSchedules: getSchedules
        };
        function getSchedules() {
            if (that.schedules.length < 1 || isOldData()) {
                return requestNewSchedules();
            } else {
                console.log("returned cached schedules");
                return $q(function (resolve, reject) {
                    resolve({"schedules": that.schedules, "activities": that.activites});
                });
            }
        };

        function requestNewSchedules() {
            //TODO insert real call
            console.log("in requestNewSchedules");

            var headers = {
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            /*return $http({
                method: "GET",
                headers: headers,
                url: 'http://browsenpm.org/package.json'
                //data: {"email":"my@email.com","password":"secret"}
            })*/
            return $q(function (resolve, reject) {
                resolve({"data": "This is response", "status": 200});
            })
                .then(getSchedulesComplete)
                .catch(getSchedulesFailed);


            function getSchedulesComplete(response) {
                //TODO real data, set lastScheduleDate only when everything is success
                console.log("return data");

                var responseListSchedules = [
                    {"date":"2015-07-05",
                        "schedules":[
                            {"id": "123", "title": "MiniKickers soccer class", "fromTime": "07:00a", "toTime":"08:00a"},

                            {"id": "346","title": "Basketball", "fromTime": "11:00a", "toTime":"12:00p"},

                            {"id": "678","title": "Gymnastics", "fromTime": "03:00p", "toTime":"04:00p"}
                        ]},

                    {"date":"2015-07-06",
                        "schedules":[{"id": "678", "title": "Gymnastics", "fromTime": "03:00p", "toTime":"04:00p"}]
                    },
                    {"date":"2015-07-10",
                        "schedules":[{"id": "123", "title": "MiniKickers soccer class", "fromTime": "2:00pm", "toTime":"3:30pm"}]
                    }
                ];
                var responseListSchedulesGenerated = [];
                var maxDays = 60;
                var scheduleDate = new Date();
                for (var i = 0; i < maxDays; ++i) {
                    responseListSchedulesGenerated[i] = {};
                    responseListSchedulesGenerated[i].date = $filter('date')(scheduleDate, 'yyyy-MM-dd');
                    responseListSchedulesGenerated[i].schedules = responseListSchedules[i % 3].schedules;

                    scheduleDate.setDate(scheduleDate.getDate() + 1);
                }

                var response = { "listSchedules": responseListSchedulesGenerated,
                "activities": {
                    "123": {
                        "title": "MiniKickers soccer class",
                        "desc": "A FUNdamental Introduction to the game of soccer for players aged 2 - 5. Players learn the introductory skills of soccer through fun games, stories and music in weekly classes lasting 45 - 60 mins",
                        "location": {
                            "name": "Challenger Soccer Academy", "address": "1911 Elkhorn Court", "city": "San Mateo",
                            "state_province": "CA", "zip": "94040", "country": "USA"
                        },
                        "emails": {"primary": "academy@challengersports.com", "office": "info@challengersports.com"},
                        "phones": {"primary": "1.800.878.2167", "office": "1.800.878.2169"}
                    },

                    "346": {
                        "title": "Basketball",
                        "desc": "M & M Sports is a non-profit organization with the ultimate goal of providing organized sports and games for our youth and adults. This web site will keep you informed of up coming activities and provide registration forms for each activity",
                        "location": {
                            "name": "M&M Youth Sports", "address": "3298 Los Prados St", "city": "San Mateo",
                            "state_province": "CA", "zip": "94040", "country": "USA"
                        },
                        "emails": {"primary": "john_masters@sbcglobal.net"},
                        "phones": {"primary": "650-703-4740"}
                    },

                    "678": {
                        "title": "Gymnastics",
                        "desc": "Peninsula Gymnastics was founded for the purpose of creating a professional gymnastics training center in a friendly and professional atmosphere where all students can reach his/her potential",
                        "website": "http://www.peninsulagym.com",
                        "location": {
                            "name": "Peninsula Gymnastics", "address": "1740 Leslie Street", "city": "San Mateo",
                            "state_province": "CA", "zip": "94040", "country": "USA"
                        },
                        "emails": {"primary": "info@peninsulagym.com"},
                        "phones": {"primary": "650.571.7555"}
                    }
                }
                };
                that.schedules = response.listSchedules;
                that.activites = response.activities;
                that.lastReqDate = new Date();

                return {"schedules": that.schedules, "activities": that.activites};
            }

            function getSchedulesFailed(error) {
                ExceptionService.catcher("error happened")("reason");
                return getSchedulesComplete("any");
                //logger.error('XHR Failed for getSchedules.' + error.data);
            }
        };
        function isOldData() {
            if (that.lastReqDate) {
                var currentDate = new Date();
                var differenceInMs = currentDate.getTime() - that.lastReqDate.getTime();
                return differenceInMs > SCHEDULES_UPDATE_INTERVAL_MS
            }
            return true;
        }
    }
})();
