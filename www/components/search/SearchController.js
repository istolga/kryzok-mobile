(function() {
    'use strict';

    var searchModule = angular.module('kryzok.search', []);
    searchModule.factory("SearchService", function($q, $http, EndpointService) {
        return {
            doSearch : function(params) {
                console.log(params);
                /*return $http({
                    url : EndpointService.SEARCH_ACTIVITY_URI,
                    method : 'GET',
                    params : params,
                    headers : {
                        "Accept" : "application/json",
                        'x-ddc-client-id' : MOBILE_CLIENT.CLIENT_ID
                    },
                    //TODO need to do it as promise as value doesn't give any status code, but at least go to error flow and hide loading image
                    timeout:3000
                });*/

                var dataExample = {
                    "totalHits": 100, "activities": [
                        {
                            "id": "5590fff87aaba93d6be5fa72",
                            "url": "https://activityhero.com/biz/56024-encore-lacrosse-burlingame-ca",
                            "title": "Encore Lacrosse",
                            "body": "Encore Brand Lacrosse provides the opportunity to all people to experience the inspirations",
                            "category": null,
                            "city": null,
                            "state": null,
                            "zip": null,
                            "streetAddress": null,
                            "createDate": 1435566072086,
                            "updateDate": 1435566072086
                        },

                        {
                            "id": "5590fff87aaba93d6bsdf34",
                            "url": "https://activityhero.com/biz/56024-encore-lacrosse-burlingame-ca",
                            "title": "Soccer",
                            "body": "Encore Brand Lacrosse provides the opportunity to all people to experience the inspirations",
                            "category": null,
                            "city": null,
                            "state": null,
                            "zip": null,
                            "streetAddress": null,
                            "createDate": 1435566072087,
                            "updateDate": 1435566072087
                        },

                        {
                            "id": "5590fff87aabaddddbe5fa66",
                            "url": "https://activityhero.com/biz/56024-encore-lacrosse-burlingame-ca",
                            "title": "Basketball",
                            "body": "Encore Brand Lacrosse provides the opportunity to all people to experience the inspirations",
                            "category": null,
                            "city": null,
                            "state": null,
                            "zip": null,
                            "streetAddress": null,
                            "createDate": 1435567573981,
                            "updateDate": 1435567573981
                        },

                        {
                            "id": "5590fff87aaba93d6b56743",
                            "url": "https://activityhero.com/biz/56024-encore-lacrosse-burlingame-ca",
                            "title": "Football",
                            "body": "Encore Brand Lacrosse provides the opportunity to all people to experience the inspirations",
                            "category": null,
                            "city": null,
                            "state": null,
                            "zip": null,
                            "streetAddress": null,
                            "createDate": 1435567573983,
                            "updateDate": 1435567573983
                        },

                        {
                            "id": "5590fff87aaba93d6be8888",
                            "url": "https://activityhero.com/biz/56024-encore-lacrosse-burlingame-ca",
                            "title": "Swimming",
                            "body": "Encore Brand Lacrosse provides the opportunity to all people to experience the inspirations",
                            "category": null,
                            "city": null,
                            "state": null,
                            "zip": null,
                            "streetAddress": null,
                            "createDate": 1435567675381,
                            "updateDate": 1435567675381
                        },

                        {
                            "id": "5590fff87aaba93d6be98769",
                            "url": "https://activityhero.com/biz/56024-encore-lacrosse-burlingame-ca",
                            "title": "Gymnastics",
                            "body": "Encore Brand Lacrosse provides the opportunity to all people to experience the inspirations",
                            "category": null,
                            "city": null,
                            "state": null,
                            "zip": null,
                            "streetAddress": null,
                            "createDate": 1435567675382,
                            "updateDate": 1435567675382
                        }
                    ]
                };
                return $q(function (resolve, reject) {
                    resolve({"data": dataExample, "status": 200});
                });
            }
        }
    });

    searchModule.service('QueryResult', function() {
        var that = this;

        that.content = [];
        that.size = 0;
        that.totalHits = 0;
        that.searchInfo = {};

        that.create = function(records, _totalHits, _searchInfo) {
            if (_totalHits !== 0) {
                console.log("records: " + records);
                for (var i = 0; i < records.length; ++i) {
                    var record = records[i];
                    that.content.push(record);
                }

                that.totalHits = _totalHits;
                that.size += records.length;
                console.log("size: " + that.size);
            } else {
                that.content = [];
                that.totalHits = 0;
                that.size += 0;
            }

            that.searchInfo = _searchInfo;
        };

        that.getRecordById = function(_recordId) {
            for (var item in this.content) {
                if (that.content[item].id === Number(_recordId)) {
                    return that.content[item];
                }
            }

            return null;
        };

        that.setRecordById = function (_recordId, record) {
            var item = null;
            for (var item in that.content) {
                if (that.content[item].id === Number(_recordId)) {
                    that.content[item] = record;
                    return;
                }
            }
        };

        that.clear = function() {
            that.content = [];
            that.size = 0;
            that.totalHits = 0;
            that.searchInfo = {};
        }
    });

    searchModule.service('Pagination', function() {
        this.pageSize = SEARCH.PAGE_SIZE;
        this.offset = 0;

    });

    searchModule.service('Filters', function($rootScope) {
        var that = this;

        that.groups = [];

        that.clear = function() {
            if (that.groups.length === 0) {
                return;
            }

            that.groups = [];
            $rootScope.$broadcast("clearFilter");
        };
    });

    searchModule.controller('SearchController', function($scope, $state, $stateParams,
            $ionicHistory, $ionicLoading, $ionicScrollDelegate, $ionicModal, $ionicListDelegate, 
            SearchService, QueryResult, Filters, Pagination) {

        var that = this;

        $scope.searchInfo = {freeText: $stateParams.keyword, ownedOnly: $stateParams.owned};
        $scope.content = [];
        $scope.activities = [];
        $scope.noMoreItemsAvailable = true;
        $scope.modal = null;

        that.currentTimeout = null;

        $ionicModal.fromTemplateUrl('components/search/_filter.html', {
            scope : $scope,
            animation : 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.myGoBack = function () {
            $ionicHistory.goBack();
        };

        $scope.keywordsChanged = function() {
            $scope.noMoreItemsAvailable = true;
            $ionicScrollDelegate.scrollTop();

            that.doSearch($scope.searchInfo, true);
        };

        $scope.addNewActivity = function() {
            $state.go('app.activity_add');
        };

        $scope.showFilters = function() {
            that.openModal();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.loadMore = function() {
            var filters = {};
            Pagination.offset += Pagination.pageSize;

            that.doSearch($scope.searchInfo);
        };

        $scope.doSearch = function(params, reset) {
            console.log("doSearch");
            // TODO: enable
            // cordova.plugins.Keyboard.close();
            that.showLoading();

            if (reset) {
                that.reset();
            }

            params['offset'] = Pagination.offset;
            params['pageSize'] = Pagination.pageSize;

            SearchService.doSearch(params).then(
                function(success) {
                    if(success.data && success.status && success.status === 200) {
                        console.log("[SearchController], success");
                        var data = success.data;
                        var records = data.activities;

                        QueryResult.create(records, data.totalHits, params);

                        if (records) {
                            for (var i = 0; i < records.length; ++i) {
                                var record = records[i];
                                $scope.content.push(record);
                                $scope.activities.push(record);

                            }
                            $scope.noMoreItemsAvailable = $scope.activities.length >= data.totalHits;
                        } else {
                            console.log("[SearchController]No data or status != 200, status: " + success.status);
                            $scope.noMoreItemsAvailable = true;
                        }

                        $ionicLoading.hide();
                    }
                }, function(error) {
                    console.log("[SearchController]This is error, status: " + error.status);
                    $ionicLoading.hide();
                    $scope.noMoreItemsAvailable = true;
                }
            );
        };

        that.showLoading = function() {
            $ionicLoading.show({
                template : 'Loading...',
                showBackdrop : true,
                maxWidth : 200,
                showDelay : 500
            });
        };

        that.openModal = function() {
            $scope.modal.show();
        };

        that.reset = function() {
            Pagination.offset = 0;
            Pagination.pageSize = SEARCH.PAGE_SIZE;
            $scope.content = [];
            $scope.activities = [];
            QueryResult.clear();
        };

        that.init = function() {
            console.log("[SearchController]scope init, history forward view: " + $ionicHistory.forwardView());
            console.log("[SearchController]ionic history: " + $ionicHistory);
            if ($ionicHistory.forwardView() !== null) {
                $scope.content = QueryResult.content;
                $scope.activities = QueryResult.content;
                $scope.searchInfo = QueryResult.searchInfo;

                return;
            }

            that.reset();
            $scope.doSearch($scope.searchInfo);
        };

        that.init();
    });

    searchModule.controller('FilterCtrl', function($scope,
            SearchService, Filters, QueryResult) {
        var that = this;

        $scope.groups = Filters.groups;

        var groups = {};
        groups["activity"] = [ {
            name : "Hide My Owned Activities",
            apiName : "excludeOwned",
            type: "boolean"
        }, {
            name : "Title",
            apiName : "title",
            type: "string"
        }, {
            name : "State",
            apiName : "state",
            type: "string"
        } ];


        
        $scope.$on('clearFilter', function() {
            $scope.groups = Filters.groups;
            initFilters();
        });

        $scope.cancelFilter = function() {
            $scope.closeModal();
        };

        $scope.applyFilter = function() {
            for (var i = 0; i < $scope.groups.length; ++i) {
                switch($scope.groups[i].type){
                    case "string": 
                        if ($scope.groups[i].filters.length !== 0) {
                            $scope.searchInfo[$scope.groups[i].apiName] = $scope.groups[i].filters.join(",");
                        }
                        break;
                    case "boolean": 
                        if($scope.groups[i].value != null) {
                            $scope.searchInfo[$scope.groups[i].apiName] = $scope.groups[i].value;
                        }
                        break;
                    default: break;
                }
            }
            $scope.closeModal();

            $scope.doSearch($scope.searchInfo, true);
        };

        $scope.toggleGroup = function(name) {
            $scope.activeGroupName = name;
        };

        $scope.isActiveGroup = function(name) {
            if (name === $scope.activeGroupName) {
                return true;
            }

            for (var i = 0; i < $scope.groups.length; ++i) {
                if ($scope.groups[i].name === name) {
                    return $scope.groups[i].filters.length !== 0;
                }
            }

            return false;
        };

        $scope.addSearchFilter = function(group, filter) {
            group.filters.push(filter);
            console.log("[FilterController] filter groups: " + Filters.groups);
        };

        $scope.deleteFilter = function(group, filterkeyword) {
            for (var i = 0; i < group.filters.length; ++i) {
                if (group.filters[i] === filterkeyword) {
                    group.filters.splice(i, i + 1);
                    console.log(group);
                    break;
                }
            }
        };

        that.init = function() {
            console.log("[FilterController]scope init");
            console.log("[FilterController]filter groups: " + Filters.groups);
            if (Filters.groups.length !== 0) {
                $scope.groups = Filters.groups;

                return;
            }

            that.initFilters();
        };

        that.initFilters = function() {
            for (var i = 0; i < groups["activity"].length; ++i) {
                $scope.groups[i] = {
                    name : groups["activity"][i].name,
                    type : groups["activity"][i].type,
                    apiName : groups["activity"][i].apiName,
                    filters : [],
                    value: null
                }
            }
        };

        that.init();
    });
})();