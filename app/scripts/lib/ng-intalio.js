'use strict';

angular.module('ng-intalio', []);
angular.module('ng-intalio').config( ['$locationProvider', function( $locationProvider ){
  $locationProvider.html5Mode(true) ;
}]);
angular.module('ng-intalio').factory('intalioContext', ['$location', function($location){
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
angular.module('ng-intalio').service('intalio',['intalioContext','$q','$http',function(intalioContext,$q,$http){
  this.getTask = function(){
    var deferred = $q.defer();
    var content = {
      getTaskRequest:{
        '@xmlns':{'$':'http:\/\/www.intalio.com\/BPMS\/Workflow\/TaskManagementServices-20051109\/'},
        taskId:{'$':intalioContext.taskid},
        participantToken:{'$':intalioContext.token}
      }
    };
    var req = {
      method: 'POST',
      url: '/intalio/ode/processes/TaskManagementServices.TaskManagementServicesSOAP/',
      data: content,
      headers: {
        'Content-Type':'application/json/badgerfish'
      }
    };
    $http(req).
      success(function(data){
        deferred.resolve(data['tms:getTaskResponse']['tms:task']['tms:input']);
      }).
      error(function(data,status,headers,config){
        deferred.reject({data:data,status:status,headers:headers,config:config});
      });
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
    var req = {
      method: 'POST',
      url: '/intalio/ode/processes/completeTask',
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
}]); 