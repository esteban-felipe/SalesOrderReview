'use strict';

angular.module('salesOrderReviewApp', ['ngResource','ng-intalio']);
angular.module('salesOrderReviewApp').filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);
angular.module('salesOrderReviewApp').controller('taskController', ['$scope','intalio','$location', function($scope,intalio,$location){
  $scope.decisionOptions = [
    {label: 'Approve', value:'Approve'},
    {label: 'Return', value:'Return'},
    {label: 'Reject', value:'Reject'},
  ];
  $scope.result = $scope.decisionOptions[0];
  $scope.submit = function(){
    $scope.data.SalesOrderReview.Decision.$=$scope.result.value;
    intalio.completeTask($scope.data).then(function(){
      $location.url('/intalio/index.htm#/workflow/tasks');
    });
  };
  $scope.decisionChanged = function(opt){
    $scope.result = opt;
  };
  intalio.getTask().then(function(d) {
    $scope.data = d;
    $scope.data.SalesOrderReview.Decision.$ = $scope.decisionOptions[0];
  });
 
}]);
