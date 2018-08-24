// config
const serviceUrl = "https://r34-json-api.herokuapp.com";
const autoCompleteUrl = "https://rule34.xxx/autocomplete.php";

// angular
var app = angular.module('r34App', ['infinite-scroll']);
app.controller('r34Ctrl', function ($http) {
    var controller = this;

    // init function
    controller.init = function () {

        // init variables
        controller.activeTags = [];
        controller.pageId = 0;
        controller.pageSize = 10;
        controller.noImagesLeft = false;
        controller.lastScroll = 0;
        // init awesomplete
        var input = document.getElementById("input_tag");
        input.addEventListener("input", function () {
            controller.getSuggestions();
        });
        controller.awesomplete = new Awesomplete(input, {
            minChars: 3,
            maxItems: 10,
            sort: false,
            filter: function (text, input) {
                let search = input.replace(" ", "_").toLowerCase();
                let string = text.value;
                return string.includes(search);
            }
        });
        $("div.awesomplete").addClass("flex-grow-1");


        // init switches
        $(".switch").bootstrapSwitch();
    };

    // get posts
    controller.getPosts = function (mode) {
        controller.lastScroll = Date.now();
        let tags = "";
        let page = "";
        if (controller.activeTags.length > 0) {
            tags = "&tags=" + controller.activeTags.join("+");
        }

        if (mode === "append") {
            controller.pageId++;
            page = "&pid=" + controller.pageId;
        } else {
            controller.pageId = 0;
            controller.noImagesLeft = false;
        }

        $http.get(serviceUrl + "/posts?limit=" + controller.pageSize + tags + page)
            .then(function (response) {
                let posts = response.data;

                if (posts.length === 0) {
                    controller.noImagesLeft = true;
                }

                let filtered = false;
                if ($('#approved').prop('checked')) {
                    filtered = true;
                    posts = posts.filter(post => post.score > 0);
                }

                if (mode === "append") {
                    controller.posts.push(...posts);
                } else {
                    controller.posts = posts;
                }

                if (filtered && controller.posts.length < controller.pageSize) {
                    controller.getPosts("append");
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    // collapse details
    controller.details = function (postId) {
        let selector = "#" + postId + " > .collapse";
        $(selector).collapse("toggle");
    };

    // add a tag to selection
    controller.addTag = function (tag) {
        if (tag === undefined) {
            tag = $("#input_tag").val();
            $("#input_tag").val("");
        }

        tag = tag.toLowerCase();

        if (tag && tag != "" && !controller.activeTags.includes(tag)) {
            controller.activeTags.push(tag);
        }
    };

    // remove a tag from selection
    controller.removeTag = function (tag) {
        controller.activeTags.splice(controller.activeTags.indexOf(tag), 1);
    };

    // toggle a tag
    controller.toggleTag = function (tag) {
        if (controller.activeTags.includes(tag)) {
            controller.removeTag(tag);
        } else {
            controller.addTag(tag);
        }
    };

    // get tags for awesomplete
    controller.getSuggestions = function () {
        let search = $("#input_tag").val().replace(" ","_") + "*";

        if (search.length > controller.awesomplete.minChars) {
            $http.get(serviceUrl + "/tags?limit=" + controller.awesomplete.maxItems + "&name=" + search + "&order_by=posts")
                .then(function (response) {
                    controller.awesomplete.list = response.data.map(tag => {
                        return {
                            label: tag.name + " (" + tag.posts + ")",
                            value: tag.name
                        };
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    controller.vote = function (postId, type) {
        $http.get("https://rule34.xxx/index.php?page=post&s=vote&id=" + postId + "&type=" + type)
            .then(function (response) {
                controller.posts.find(post => post.id === postId).score = parseInt(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    // load more posts
    controller.infiniteScroll = function () {
        let now = Date.now();
        if (now - controller.lastScroll > 1000) {
            controller.getPosts("append");
            controller.lastScroll = now;
        }
    };

    // check if infinite-scroll should be disabled
    controller.infiniteScrollDisabled = function () {
        return $("#infiniteScroll").prop('checked') !== true || controller.noImagesLeft;
    };
});
