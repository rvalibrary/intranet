'use strict';

angular.module('libcalApp').
            config(
              function(
                $locationProvider,
                $resourceProvider,
                $routeProvider,
              ){
                var onlyLoggedIn = function (User, $location,$q, $cookies,) {
                    var deferred = $q.defer();
                    if ($cookies.get("token")){
                      User.tokenVerify({token: $cookies.get("token")}).$promise.then(
                        function(success){
                          deferred.resolve();
                        },//success,
                        function(error){
                          rejection(deferred);
                          console.log(error)
                        }//error
                      )//user.tokenVerify
                    }else{
                      rejection(deferred);
                    }//else

                    function rejection(deferral){
                      deferral.reject();
                      var url = "/users/login";
                      window.location = url;
                      window.location.replace(url);
                    }
                    return deferred.promise;
                };

                $locationProvider.html5Mode(true);
                $resourceProvider.defaults.stripTrailingSlashes = false;

                $routeProvider
                .when('/libcal', {
                  template: '<events-list></events-list>',
                  resolve:{
                    loggedIn:onlyLoggedIn
                  },
                  css: [staticfiles('css/libcal_style.css'),staticfiles('css/menu_style.css')],
                })
                .otherwise({
                  template: "<div class='container'><h1>Page not found</h1></div>"
                })


        })

        // .controller('inputController', ['$scope', function($scope){
        //   $scope.user = 'Max'
        // }])
