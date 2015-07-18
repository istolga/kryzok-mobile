(function() {
    'use strict';

    angular
        .module('kryzok.about', [])
        .controller('AboutController', AboutController);

    AboutController.$inject = ['$scope', '$ionicHistory'];
    function AboutController($scope, $ionicHistory) {
    	
    	$scope.myGoBack = function () {
    		$ionicHistory.goBack();
        };
    }
})();