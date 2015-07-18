(function() {
    'use strict';

    var searchModule = angular.module('kryzok.search', []);
    searchModule.factory("SearchService", function($http, EndpointService) {
        return {
            doSearch : function(params) {
                console.log(params);
                return $http({
                    url : EndpointService.SEARCH_ACTIVITY_URI,
                    method : 'GET',
                    params : params,
                    headers : {
                        "Accept" : "application/json",
                        'x-ddc-client-id' : MOBILE_CLIENT.ID
                    },
                    //TODO need to do it as promise as value doesn't give any status code, but at least go to error flow and hide loading image
                    timeout:3000
                });
            }
        }
    });

    searchModule.service('QueryResult', function() {
        this.content = [];
        this.size = 0;
        this.totalHits = 0;
        this.searchInfo = {};

        this.create = function(records, totalHits, searchInfo) {
            if (totalHits !== 0) {
                for (var i = 0; i < records.length; ++i) {
                    var record = records[i];
                    this.content.push(record);
                }

                this.totalHits = totalHits;
                this.size += records.length;
            } else {
                this.content = [];
                this.totalHits = 0;
                this.size += 0;
            }

            this.searchInfo = searchInfo;
        };

        this.getRecordById = function(jigsawId) {
            for (var item in this.content) {
                if (this.content[item].contactId === Number(jigsawId)) {
                    return this.content[item];
                }
            }

            return null;
        }

        this.setRecordById = function(jigsawId, record) {
        var item = null;
            for (var item in this.content) {
                if (this.content[item].contactId === Number(jigsawId)) {
                    this.content[item] = record;
                    return;
                }
            }
        }

        this.clear = function() {
            this.content = [];
            this.size = 0;
            this.totalHits = 0;
            this.searchInfo = {};
        }
    });

    searchModule.service('Pagination', function() {
        this.pageSize = SEARCH.PAGE_SIZE;
        this.offset = 0;

    });

    searchModule.service('Filters', function($rootScope) {
        this.groups = [];

        this.clear = function() {
            if (this.groups.length === 0) {
                return;
            }

            this.groups = [];
            $rootScope.$broadcast("clearFilter");
        };
    });

    searchModule.controller('SearchController', function($scope, $state, $rootScope, $stateParams, 
            $ionicHistory, $ionicLoading, $ionicScrollDelegate, $ionicModal, $ionicListDelegate, 
            SearchService, QueryResult, Filters, Pagination) {
        $scope.searchInfo = {freeText: $stateParams.keyword, ownedOnly: $stateParams.owned};
        $scope.content = [];
        $rootScope.contacts = [];

        $scope.myGoBack = function () {
    		$ionicHistory.goBack();
        };
        
        $scope.doSearch = function(params, reset) {
            console.log("doSearch");
            // TODO: enable
            // cordova.plugins.Keyboard.close();
            $scope.showLoading();

            if (reset) {
                $scope.reset();
            }

            params['offset'] = Pagination.offset;
            params['pageSize'] = Pagination.pageSize;

            SearchService.doSearch(params).then(
                function(success) {
                    if(success.data && success.status && success.status === 200) {
                        console.log("[SearchController], success");
                        var data = success.data;
                        var records = data.contacts

                        QueryResult.create(records, data.totalHits, params);

                        if (records) {
                            for (var i = 0; i < records.length; ++i) {
                                var record = records[i];
                                $scope.content.push(record);
                                $rootScope.contacts.push(record);

                            }
                            $scope.noMoreItemsAvailable = $rootScope.contacts.length >= data.totalHits;
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

        var currentTimeout = null;

        $scope.keywordsChanged = function() {
            $scope.noMoreItemsAvailable = true;
            $ionicScrollDelegate.scrollTop();

            $scope.doSearch($scope.searchInfo, true);
        };
        
        $scope.addNewContact = function() {
            $state.go('app.contact_add');
        };

        $scope.showLoading = function() {
            $ionicLoading.show({
                template : 'Loading...',
                showBackdrop : true,
                maxWidth : 200,
                showDelay : 500
            });
        };

        $ionicModal.fromTemplateUrl('components/search/_filter.html', {
            scope : $scope,
            animation : 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.showFilers = function() {
            $scope.openModal();
        }

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.noMoreItemsAvailable = true;

        $scope.loadMore = function() {
            var filters = {};
            Pagination.offset += Pagination.pageSize;

            $scope.doSearch($scope.searchInfo);
        };

        $scope.reset = function() {
            Pagination.offset = 0;
            Pagination.pageSize = SEARCH.PAGE_SIZE;
            $scope.content = [];
            $rootScope.contacts = [];
            QueryResult.clear();
        };

        $scope.init = function() {
            console.log("[SearchController]scope init, history forward view: " + $ionicHistory.forwardView());
            console.log("[SearchController]ionic history: " + $ionicHistory);
            if ($ionicHistory.forwardView() !== null) {
                $scope.content = QueryResult.content;
                $rootScope.contacts = QueryResult.content;
                $scope.searchInfo = QueryResult.searchInfo;

                return;
            }

            $scope.reset();
            $scope.doSearch($scope.searchInfo);
        }

        $scope.init();
    });

    searchModule.controller('FilterCtrl', function($scope, $rootScope,
            SearchService, Filters, QueryResult) {
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

        $scope.groups = Filters.groups;
        
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
        }

        $scope.toggleGroup = function(name) {
            $scope.activeGroupName = name;
        }

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
        }

        $scope.addSearchFilter = function(group, filter) {
            group.filters.push(filter);
            console.log("[FilterController] filter groups: " + Filters.groups);
        }

        $scope.deleteFilter = function(group, filterkeyword) {
            for (var i = 0; i < group.filters.length; ++i) {
                if (group.filters[i] === filterkeyword) {
                    group.filters.splice(i, i + 1);
                    console.log(group);
                    break;
                }
            }
        }

        $scope.init = function() {
            console.log("[FilterController]scope init");
            console.log("[FilterController]filter groups: " + Filters.groups);
            if (Filters.groups.length !== 0) {
                $scope.groups = Filters.groups;

                return;
            }

            initFilters();
        };

        var initFilters = function() {
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

        $scope.init();
    });
})();