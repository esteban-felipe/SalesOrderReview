'use strict';

angular.module('ng-intalio', []);
angular.module('ng-intalio').config( ['$locationProvider', function( $locationProvider ){
  $locationProvider.html5Mode(true) ;
}]);
angular.module('ng-intalio').factory('intalioContext', ['$location', function($location){
  // console.log($location.search().token); 
  // console.log($location.absUrl()); 
  return {
    url : $location.absUrl(),
    taskid : $location.search().id,
    tasktype : $location.search().type,
    taskurl : $location.search().url,
    token : $location.search().token,
    user : $location.search().user,
    claimTaskOnOpen : $location.search().claimTaskOnOpen
  };
}]);
angular.module('ng-intalio').service('intalio',['intalioContext','$q','$http','$window',function(intalioContext,$q,$http,$window){
  var callService = function(serviceUrl,content){
    var deferred = $q.defer();
    var req = {
      method: 'POST',
      url: serviceUrl,
      data: content,
      headers: {
        'Content-Type':'application/json/badgerfish'
      }
    };
    $http(req).
      success(function(data){
        deferred.resolve(data);
      }).
      error(function(data,status,headers,config){
        deferred.reject({data:data,status:status,headers:headers,config:config});
      });
    return deferred.promise;
  };
  this.getTask = function(){
    var getContent = function(){
      return {
        getTaskRequest:{
          '@xmlns':{'$':'http:\/\/www.intalio.com\/BPMS\/Workflow\/TaskManagementServices-20051109\/'},
          taskId:{'$':intalioContext.taskid},
          participantToken:{'$':intalioContext.token}
        }
      };
    };
    var deferred = $q.defer();
    callService('/intalio/ode/processes/TaskManagementServices.TaskManagementServicesSOAP/',getContent()).then(
      function(data){ //Success callback
        deferred.resolve(data['tms:getTaskResponse']['tms:task']['tms:input']);
      },
      function(err){ //Failure callback
        /*
          This is a horrible hack due the fact that we are not recieving the data in the query string url encoded
        */
        if(err.data && err.data.Fault && err.data.Fault.$.indexOf('invalidParticipantTokenFault') > -1){
          intalioContext.token = intalioContext.token + '=';
          callService('/intalio/ode/processes/TaskManagementServices.TaskManagementServicesSOAP/',getContent()).then(
            function(data){ //Success callback
              deferred.resolve(data['tms:getTaskResponse']['tms:task']['tms:input']);
            },
            function(err){ //Failure callback
              deferred.reject(err);
            }
          );
        }
        else{
          deferred.reject(err);
        }
      }
    );
    return deferred.promise;
  };
  this.completeTask = function(output){
    var deferred = $q.defer();
    var content = {
      completeTaskRequest:{
        '@xmlns':{$:'http:\/\/www.intalio.com\/bpms\/workflow\/ib4p_20051115'},
        taskMetaData:{
          taskId:{$:intalioContext.taskid}
        },
        participantToken:{$:intalioContext.token},
        user:{$:intalioContext.user},
        taskOutput:output
      }
    };
    callService('/intalio/ode/processes/completeTask',content).then(
      function(data){
        $window.location.assign('empty.html');
        deferred.resolve(data);
      },
      function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
}]); 