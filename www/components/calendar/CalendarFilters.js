(function () {
    'use strict';

    angular
        .module('kryzok.calendar.filters', [])
        .filter('prettyDate', PrettyDateFilter);

    PrettyDateFilter.$inject = ['$filter', 'ExceptionService'];
    function PrettyDateFilter($filter, ExceptionService) {
        return function (input) {
            var formattedDate = input;
            if (input) {
                var formattedDate = $filter('date')(input, 'EEEE, MMMM d');
                try {
                    var dateRegexp = /(\d+)-(\d+)-(\d+)/;
                    var dateArr = input.match(dateRegexp);
                    if (dateArr.length >= 4) {
                        var year = parseInt(dateArr[1]);
                        var month = parseInt(dateArr[2]);
                        var day = parseInt(dateArr[3]);

                        var currentDate = new Date();
                        if (currentDate.getDate() == day && currentDate.getFullYear() == year
                            && (currentDate.getMonth() + 1) == month) {
                            formattedDate = "Today, " + $filter('date')(input, 'MMMM d');
                        }
                        var tomorrowDate = new Date();
                        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                        if (tomorrowDate.getDate() == day && tomorrowDate.getFullYear() == year
                            && (tomorrowDate.getMonth() + 1) == month) {
                            formattedDate = "Tomorrow, " + $filter('date')(input, 'MMMM d');
                        }
                    }
                } catch (e) {
                    ExceptionService.catcher("exception while formatting pretty date")(e.message);
                }
            }
            return formattedDate;
        };
    }
})();