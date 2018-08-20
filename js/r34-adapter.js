// config
const serviceUrl = "https://r34-json-api.herokuapp.com";
const autoCompleteUrl = "https://rule34.xxx/autocomplete.php";

// angular
var app = angular.module('r34App', []);
app.controller('r34Ctrl', function ($scope, $http) {
    $scope.init = function () {
        $scope.activeTags = [];
        $scope.pageId = 0;
        $scope.pageSize = 10;

        var input = document.getElementById("input_tag");
        input.addEventListener("input", function () {
            $scope.getSuggestions();
        });
        $scope.awesomplete = new Awesomplete(input, {
            minChars: 3,
            maxItems: 5
        });
    };

    $scope.getPosts = function (mode) {
        let tags = "";
        let page = "";
        if ($scope.activeTags.length > 0) {
            tags = "&tags=" + $scope.activeTags.join("+");
        }

        if (mode === "append") {
            $scope.pageId++;
            page = "&pid=" + $scope.pageId;
        } else {
            $scope.pageId = 0;
        }

        $http.get(serviceUrl + "/posts?limit=" + $scope.pageSize + tags + page)
            .then(function (response) {
                let posts = response.data;

                let filtered = false;
                if ($('#approved').prop('checked')) {
                    filtered = true;
                    posts = posts.filter(post => post.score > 0);
                }

                if (mode === "append") {
                    $scope.posts.push(...posts);
                } else {
                    $scope.posts = posts;
                }

                if (filtered && $scope.posts.length < $scope.pageSize) {
                    $scope.getPosts("append");
                }
            })
            .catch(function(error) {
                console.log(error);
            });
    };

    $scope.details = function (postId) {
        let selector = "#" + postId + " > .collapse";
        $(selector).collapse("toggle");
    };

    $scope.addTag = function (tag) {
        if (tag === undefined) {
            tag = $("#input_tag").val();
            $("#input_tag").val("");
        }

        if (tag && tag != "" && !$scope.activeTags.includes(tag)) {
            $scope.activeTags.push(tag);
        }
    };

    $scope.removeTag = function (tag) {
        $scope.activeTags.splice($scope.activeTags.indexOf(tag), 1);
    };

    $scope.getSuggestions = function () {
        let search = $("#input_tag").val() + "*";
        $http.get(serviceUrl + "/tags?limit=5&name=" + search)
            .then(function (response) {
                console.log(response.data);
                $scope.awesomplete.list = response.data.map(tag => tag.name);
            })
            .catch(function(error) {
                console.log(error);
            });
    };

    $scope.vote = function (postId, type) {
        $http.get("https://rule34.xxx/index.php?page=post&s=vote&id=" + postId + "&type=" + type)
            .then(function (response) {
                $scope.posts.find(post => post.id === postId).score = parseInt(response.data);
            })
            .catch(function(error) {
                console.log(error);
            });

        // for now
        $("#" + postId + " .btn-vote").prop("disabled",true);
        $(this).css({color: "red !important"});
        $scope.posts.find(post => post.id === postId).score++;
    };
});