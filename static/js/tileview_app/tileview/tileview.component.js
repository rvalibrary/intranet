'use strict';

angular.module('tileview').
      component('tileView', {
        templateUrl: '/api/templates/tileview_app/tileview.html',
        controller: function(lcFuncs, lcData, tvFuncs, $scope, $cookies, $location, $http, $rootScope, $q, $window, $document, $interval, $filter){

          $scope.thisMonday = tvFuncs.getMonday(new Date()); // Mon Nov 08 2010
          $scope.thisSunday = tvFuncs.getSunday(new Date()); // Mon Nov 08 2010
          //Filters out the study rooms within template
          $scope.categoryfilter = function(detail){return detail.cid !== 2710}
          $scope.cancelledfilter = function(detail){
            return (detail.status !== 'Cancelled by Admin') && (detail.status !== 'Cancelled by User') && (detail.status !== 'Mediated Denied');
          }
          $scope.get_room_key = function(eid){return $scope.spaces_dict[eid]}
          $scope.get_time = function(timestring){
            var mytime = lcFuncs.formatDate(timestring)
            return mytime
          }

          //create dialog to ensure setup state change is truly desired
          var setup_dialog = function(message){
            $scope.dialog_text = message;
            $scope.viewdialog = true;
            var defer = $q.defer();
            if ($window.confirm(message)){
              defer.resolve();
            }else{
              defer.reject();
            }
            return(defer.promise);
          }

          $scope.onTileClick = function(detail){

            var oppositeSetup
            if (detail.setup){
              oppositeSetup = detail.setup ? "'setup incomplete'" : "'set up and ready to go'";
            }else{
              oppositeSetup = "'set up and ready to go'"
            }
            var message = "Change to " + oppositeSetup.toString() + "?";
            setup_dialog(message).then(
              function(success){
                detail.setup = !detail.setup;
                tvFuncs.setupComplete(detail.bookId, detail.fromDate)
              },
              function(rejected){
                console.log('canceled')
              }
            );
          }

          //determines whether setup is required based on the detail.q1906 property
          $scope.setupcompleteclass = function(detail){return tvFuncs.setupCompleteClass(this.detail)}


          $scope.toggle_libcal_listview = function(){
            var url = '/libcal';
            window.location = url;
            window.location.replace(url);
          }









          $scope.start_event_loop = function(){
              var funcArray = new Array();
              for (var i = 0; i < $scope.dateArray.length; i++ ){
                funcArray.push(getEvents($scope.dateArray[i]));
              }
              $q.all(funcArray)
              .then(function(data){
                var preSetupArray = lcFuncs.formatEvents(data);
                $scope.sortedarray = tvFuncs.addSetupProperties($scope.setupsQuery, preSetupArray);

              });
          }//$scope.start_event_loop()
          //check if there's a token. if not, get one
          if ($cookies.get("libcal_token")){$scope.renewtoken=false}else{$scope.renewtoken=true}
          // OBTAIN THE ACCESS TOKEN!
          var getEvents = function(iterdate){
            var d = $q.defer();
            $scope.loading_display = 'loadshow';
            $scope.loading_blur = 'page_blur';
            var eventsSuccess, eventsError
            eventsSuccess = function(result){
              var arraypush = {
                date: iterdate,
                eventinfo: result,}
              // output data console log the data, this is what you want to uncomment
              console.log(arraypush)
              $scope.loading_display = '';
              $scope.loading_blur = '';
              d.resolve(arraypush)
            }
            eventsError = function(result){
              console.log('events error'); console.log(result)
              $scope.renewtoken = true
              lcFuncs.tokenExpired(result, lcData().getRequestCreds({q:'springshare'}), requestCredsSuccess, requestCredsError)
            }
            lcData({token:$cookies.get("libcal_token"), iterdate:iterdate}).pullEvents({location_id:$scope.lbid})//$scope.libcaltoken
              .$promise.then(eventsSuccess, eventsError)
            //return the array
            return d.promise;
          }
          //progression here is the following (read code from bottom to top):
          //#0 getRequestCreds - ask local Django api for request creds
          //#1 getCreds - get the access token
          //#2 pullCats - get the categories of spaces for the location
          //#3 pullSpaces - get the spaces for all the categories
          //#4 setupQuery - get all event setups (from Django database)
          //#5 teamList - get the teamList
          var credsSuccess, credsError, catsSuccess,
              catsError, spacesSuccess, spacesError,
              requestCredsSuccess, requestCredsError,
              setupQuerySuccess, setupQueryError,
              teamSuccess, teamError

          ///////this is #5////////
            teamSuccess = function(success){
              console.log(success)
              try{$scope.teamList = success[0].team;}
              catch(err){$scope.teamList = null; console.log('no team list')}
              $scope.start_event_loop();
            }
            teamError = function(error){console.log(error)}
          ///////this is #4///////
          setupQuerySuccess = function(result){
            console.log(result);
            $scope.setupsQuery = result;
            lcData().getTeamList({q:lcFuncs.createtextdate($scope.thisMonday), t:'yes'}).$promise.then(teamSuccess, teamError)
          }
          setupQueryError = function(error){console.log(error)}
          ///////this is #3///////
          spacesSuccess = function(result){
            var raw_spaces_list = new Array();
            for (var i=0; i < result.length; i++){
              raw_spaces_list = raw_spaces_list.concat(result[i].items)}//for
            $scope.spaces_dict = {};
            for (var i=0; i< raw_spaces_list.length; i++){
              var dictval = raw_spaces_list[i].id;
              $scope.spaces_dict[dictval] = raw_spaces_list[i].name}//for
              // console.log($scope.spaces_dict)
            //run get_events on startup
            lcData().getSetupCompletes({q:lcFuncs.createtextdate(new Date())}).$promise.then(setupQuerySuccess, setupQueryError)
          }//spacesSuccess
          spacesError = function(result){
            console.log('spacesError error'); console.log(result)
            $scope.renewtoken = true
            lcFuncs.tokenExpired(result, lcData().getRequestCreds({q:'springshare'}), requestCredsSuccess, requestCredsError)
          }

          ///////this is #2///////
          catsSuccess = function(result){
            //we need a list of the category IDs, that's the goal of the following code
            $scope.data_not_available = false
            var cats = result[0].categories;
            var cat_string = '';
            try{
              for (var i = 0; i < cats.length; i++){
                cat_string = cat_string.concat(cats[i].cid );
                if (i+1 < cats.length){cat_string = cat_string.concat(',');}}//for
              //now we call the space puller
              // console.log(cats)
              lcData({token:$cookies.get("libcal_token"), categoryList:cat_string})
              .pullSpaces().$promise.then(spacesSuccess, spacesError);
            }catch(err){
              $scope.data_not_available = true
              $scope.message = "There are no accessible categories at this branch."
              console.log($scope.message)
            }
          };//catsSuccess
          catsError = function(result){
            console.log('Cats error'); console.log(result)
            $scope.renewtoken = true
            lcFuncs.tokenExpired(result, lcData().getRequestCreds({q:'springshare'}), requestCredsSuccess, requestCredsError)
          };

          ///////this is #1///////
          credsSuccess = function(result){
            $cookies.put("libcal_token", result.access_token)
            lcData({token:$cookies.get("libcal_token")}).pullCats({location_id:$scope.lbid})
            .$promise.then(catsSuccess, catsError);
          }
          credsError = function(result){console.log('Creds error'); console.log(result)}

          ///////this is #0///////
          requestCredsSuccess = function(result){
            if ($scope.renewtoken == false){
              $scope.dateArray = lcFuncs.getDates(tvFuncs.getDay(0), tvFuncs.getDay(1));
              lcData({token:$cookies.get("libcal_token")}).pullCats({location_id:$scope.lbid})
              .$promise.then(catsSuccess, catsError);
            }else{
              console.log('getting a new token')
              $scope.renewtoken = false
              lcData().getCreds({
                client_id: result[0].client_id,
                client_secret: result[0].client_secret,
                grant_type: result[0].grant_type,
              }).$promise.then(credsSuccess, credsError);
            }//ifelse statment
          }
          requestCredsError = function(result){console.log('requestCreds error'); console.log(result)}
          //get libcal branch mapping information
          var branchSuccess = function(response){
            var branchinfo = lcFuncs.setupBranches(response, $cookies.get('branch'))
            $scope.branch = branchinfo[0]
            $scope.lbid = branchinfo[1]
            $scope.lcalid = branchinfo[2]
            $scope.mapping = branchinfo[3]

            //mobile menu dropdown model assignment
            $scope.branch_menu_location = $scope.mapping[$scope.branch]
            // console.log($scope.lbid)
            lcData().getRequestCreds({q:'springshare'}).$promise.then(requestCredsSuccess, requestCredsError)
          }
          var branchError = function(response){console.log(response)}
          lcData().getBranchMapping().$promise.then(branchSuccess, branchError);


          //tileview refresh timer
          $interval(function(){
            lcData().getRequestCreds({q:'springshare'}).$promise.then(requestCredsSuccess, requestCredsError)
          },60000);

          //Refresh token every day (86400000 milliseconds)
          $interval(function(){
            var tokenSuccess = function(result){
              console.log(result)
              $cookies.put("token", result.token)
            }
            var tokenError = function(error){
              console.log('There was a token refresh error, contact Max.')
              console.log(result)
            }
            lcData().tokenRefresh({"token":$cookies.get("token")}).$promise.then(tokenSuccess, tokenError)
          },86400000)

        }//controller

      });
