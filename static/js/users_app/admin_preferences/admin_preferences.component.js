'use strict';

angular.module('admin_preferences').
  component('adminPreferences', {
    templateUrl: '/api/templates/users_app/admin_preferences.html',
    controller: function(Data, User, $filter, $cookies,$http,$location,$routeParams,$rootScope,$scope,$route,){
      //startup
      $scope.deletecrucible = false
      $scope.editteam = false

///////////REFERENCE APPLICATION ADMIN///////////////////////

      Data.getActivations().$promise.then(
        function(result){
          $scope.activations = result
          $scope.activation = $scope.activations[0]
        },
        function(error){console.log(error)}
      )


      $scope.addActivation = function(start, end){
        Data.createActivation({startdate: start, expiration: end}).$promise.then(
          function(success){console.log(success)},
          function(fail){console.log(fail)}
        )
      }

///////////SETUP SCHEDULE///////////////////////

//Get the next year of Mondays
    var mondays = [];
    var today  = new Date(),
        year   = today.getFullYear(),
        month  = today.getMonth(),
        date   = today.getDate(),
        offset = 1 -(today.getDay() || 7), // days till next Monday
        sunOffset = 7 - (today.getDay() || 7); // days till next Monday

    for(var i = 0 ; i < 53 ; i++) {
      mondays.push( [new Date(year, month, date + offset + 7 * i),
                     new Date(year, month, date + sunOffset + 7 * i)]
                   );
    }
    $scope.dates= {
      availableDates: mondays,
      selectedDate: mondays[0]
    }

    var twodigit = function(number){
      var formattedNumber = ("0" + number).slice(-2);
      return formattedNumber
    }
    var createtextdate = function(date){
      var ready_date = String(date.getFullYear()) + "-" + String(twodigit(date.getMonth()+1)) + "-" + String(twodigit(date.getDate()))
      return(ready_date)
    }

    var initSetupTeams = function(){
      Data.getSetupTeams({q: createtextdate(mondays[0][0])}).$promise.then(
        function(success){
            for (var i = 0; i < mondays.length; i++){
              for (var j = 0; j < success.length; j++){
                if (createtextdate(mondays[i][0]) == success[j].date){
                  mondays[i].push(success[j].team)
                  mondays[i].push(success[j].id)
                }
              }
            }//for
        },
        function(fail){console.log(fail)}
      )
    }

    initSetupTeams();


    $scope.addTeam = function(date, teamtext){
      console.log(date);
      console.log(teamtext.text);

      Data.createTeam({date: createtextdate(date),
                       team: teamtext.text,
                        }).$promise.then(
          function(success){
            console.log(success)
            initSetupTeams();
          },
          function(error){
            console.log(error)
          }
        )
    }


    $scope.start_teamedit = function(){
      $scope.editteam = true;
    }

    $scope.resetteam = function(){
      $scope.editteam = false;
    }

    $scope.updateTeam = function(newtext, id){
      console.log(newtext)
      console.log(id)
      Data.updateTeam({team: newtext,
                      id: id}).$promise.then(
          function(success){
            $scope.dates.selectedDate[2] = newtext;
          },
          function(error){
            console.log(error)
          }
        )

    }





///////////USERS///////////////////////
      var getUsers = function(){
        Data.getUsers().$promise.then(
          function(result){
            $scope.users = {
              availableOptions: result,
              selectedOption: result[0]
            }
          },
          function(error){console.log(error)});
      }
      //get some data
      Data.getBranches().$promise.then(
        function(result){
          $scope.branches = result
          $scope.usercreate = {
            selected_branch: $scope.branches[0],
            admin: false,}
            //sequence...
            getUsers();

        },
        function(error){console.log(error)});


      $scope.clearfields = function(){
        $scope.usercreate = {email: '', selected_branch: $scope.branches[0]}
        $scope.useredit = {}
        $scope.deletecrucible = false;
      }

      //edit user code
      $scope.editUser = function(useredit, selectedoption){

        //the API requires that we send a branch (I just haven't figured out how to make it not required)
        if (typeof useredit.branch == 'undefined'){
          useredit.branch = selectedoption.branch
        }
        User.userUpdate({id: selectedoption.id,
                         password: useredit.password,
                         branch: useredit.branch.id,
                         email: useredit.email,
                         admin: useredit.is_admin,
                        })
          .$promise.then(function(success){
            console.log(success)
            getUsers();
            $scope.clearfields()
            }, function(error){console.log(error)});
      }//editUser

      //create user code
      $scope.createUser = function(usercreate){
        User.userCreate({username: usercreate.username,
                         password: usercreate.password,
                         branch: usercreate.selected_branch.id,
                         admin: usercreate.admin,
                         email: usercreate.email,
                          }).$promise.then(
            function(success){
              console.log(success)
              getUsers();
            },
            function(error){
              console.log(error)
            }
          )
          $scope.clearfields()}

      //delete user code

      $scope.deletetoggle = function(){
        $scope.deletecrucible = !$scope.deletecrucible;
      }

      $scope.deleteUser = function(user_id){
        User.userDelete({id: user_id}).$promise.then(
          function(success){
            console.log(success)
            getUsers();
        },
        function(error){console.log(error)}
      )
      $scope.clearfields()
      };




}});




// watch to see if different user is selected.
// $scope.$watch(function(){
//   if ($scope.users){
//     $scope.useredit = {
//       branch: $filter('filter')($scope.branches, $scope.users.selectedOption.branch)[0],
//     }//$scope.useredit
//   }//if
// })//$scope.watch``
