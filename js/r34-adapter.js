// config
const serviceUrl = "https://r34-json-api.herokuapp.com";

// angular
var app = angular.module('r34App', []);
app.controller('r34Ctrl', function ($scope, $http) {
    $http.get(serviceUrl)
        .then(function (response) {
            $scope.result = response.data;
        });
});