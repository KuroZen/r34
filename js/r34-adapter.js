// config
const serviceUrl = "https://r34-json-api.herokuapp.com";
const pageSize = 12;

// angular
var app = angular.module('r34App', []);
app.controller('r34Ctrl', function ($scope, $http) {
    $scope.activeTags = [];
    $scope.pageId = 0;

    $scope.getPosts = function () {
        let tags = "";
        if ($scope.activeTags.length > 0) {
            tags = "&tags=" + $scope.activeTags.join("+");
        }

        $scope.pageId = 0;
        $http.get(serviceUrl + "/posts?limit=" + pageSize + tags)
            .then(function (response) {
                $scope.posts = response.data;
            });
    };

    $scope.getMorePosts = function () {
        let tags = "";
        if ($scope.activeTags.length > 0) {
            tags = "&tags=" + $scope.activeTags.join("+");
        }

        $scope.pageId++;
        console.log($scope.currentPost);
        $http.get(serviceUrl + "/posts?limit=" + pageSize + tags + "&pid=" + $scope.pageId)
            .then(function (response) {
                $scope.posts.push(...response.data);
            });
    }

    $scope.details = function (postId) {
        let selector = "#" + postId + " > .collapse";
        $(selector).collapse("toggle");
    };

    $scope.addTag = function (tag) {
        if (tag === undefined) {
            tag = $("#input_tag").val();
        }

        if (tag && tag != "" && !$scope.activeTags.includes(tag)) {
            $scope.activeTags.push(tag);
        }
    };

    $scope.removeTag = function (tag) {
        $scope.activeTags.splice($scope.activeTags.indexOf(tag), 1);
    };

    $scope.loadMore = function () {

    };
});