// config
const serviceUrl = "https://r34-json-api.herokuapp.com";
const autoCompleteUrl = "https://rule34.xxx/autocomplete.php";

// angular
var app = angular.module('r34App', ['infinite-scroll']);
app.controller('r34Ctrl', function ($http) {
    var crtl = this;

    // init function
    crtl.init = function () {

        // init variables
        crtl.activeTags = [];
        crtl.pageId = 0;
        crtl.pageSize = 10;
        crtl.noImagesLeft = false;
        crtl.lastScroll = 0;

        // init awesomplete
        var input = document.getElementById("input_tag");
        input.addEventListener("input", function () {
            crtl.getSuggestions();
        });
        crtl.awesomplete = new Awesomplete(input, {
            minChars: 3,
            maxItems: 10
        });

        // init switches
        $(".switch").bootstrapSwitch();
    };

    // get posts
    crtl.getPosts = function (mode) {
        crtl.lastScroll = Date.now();
        let tags = "";
        let page = "";
        if (crtl.activeTags.length > 0) {
            tags = "&tags=" + crtl.activeTags.join("+");
        }

        if (mode === "append") {
            crtl.pageId++;
            page = "&pid=" + crtl.pageId;
        } else {
            crtl.pageId = 0;
            crtl.noImagesLeft = false;
        }

        $http.get(serviceUrl + "/posts?limit=" + crtl.pageSize + tags + page)
            .then(function (response) {
                let posts = response.data;

                if (posts.length === 0) {
                    crtl.noImagesLeft = true;
                }

                let filtered = false;
                if ($('#approved').prop('checked')) {
                    filtered = true;
                    posts = posts.filter(post => post.score > 0);
                }

                if (mode === "append") {
                    crtl.posts.push(...posts);
                } else {
                    crtl.posts = posts;
                }

                if (filtered && crtl.posts.length < crtl.pageSize) {
                    crtl.getPosts("append");
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    // collapse details
    crtl.details = function (postId) {
        let selector = "#" + postId + " > .collapse";
        $(selector).collapse("toggle");
    };

    // add a tag to selection
    crtl.addTag = function (tag) {
        if (tag === undefined) {
            tag = $("#input_tag").val();
            $("#input_tag").val("");
        }

        if (tag && tag != "" && !crtl.activeTags.includes(tag)) {
            crtl.activeTags.push(tag);
        }
    };

    // remove a tag from selection
    crtl.removeTag = function (tag) {
        crtl.activeTags.splice(crtl.activeTags.indexOf(tag), 1);
    };

    // get tags for awesomplete
    crtl.getSuggestions = function () {
        let search = $("#input_tag").val() + "*";
        if (search.length > crtl.awesomplete.minChars) {
            $http.get(serviceUrl + "/tags?limit=" + crtl.awesomplete.maxItems + "&name=" + search)
                .then(function (response) {
                    crtl.awesomplete.list = response.data.map(tag => tag.name);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    crtl.vote = function (postId, type) {
        $http.get("https://rule34.xxx/index.php?page=post&s=vote&id=" + postId + "&type=" + type)
            .then(function (response) {
                crtl.posts.find(post => post.id === postId).score = parseInt(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    // load more posts
    crtl.infiniteScroll = function () {
        let now = Date.now();
        if (now - crtl.lastScroll > 1000) {
            crtl.getPosts("append");
            crtl.lastScroll = now;
        }
    };

    // check if infinite-scroll should be disabled
    crtl.infiniteScrollDisabled = function () {
        return $("#infiniteScroll").prop('checked') !== true || crtl.noImagesLeft;
    };
});