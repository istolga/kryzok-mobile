(function() {
    'use strict';

    angular.module('kryzok.exception', []).factory('ExceptionService', ExceptionService);

    ExceptionService.$inject = ["$http"];

    function ExceptionService($http) {
        return {
            catcher: catcher
        };

        function catcher(message) {
            return function(reason) {
                console.log(message + " " + reason);
            };
        }
    }
})();