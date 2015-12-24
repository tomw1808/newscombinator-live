(function () {
    'use strict';

    // Define the module
    angular.module('newscombinator', ['foundation' /* add dependencies specific to this module */]);


}());
(function () {
    'use strict';

    angular.module('newscombinator')
        .controller("CtrlMain", function ($scope, $stateParams, $state, $http, $interval, $document, NotificationFactory, $window) {

            if ("Notification" in $window) {
                $window.Notification.requestPermission(function () {
                    //new $window.Notification("Test", {body: "Test test"});
                });
            }

            function loadMoreFollow() {
                if($scope.followDoc != undefined && $scope.followDoc.id != undefined) {
                    $http({
                        method: "GET",
                        url: "http://www.newscombinator.com/api/search/morelikethis/",
                        params: {
                            "q": "id:" + $scope.followDoc.id
                        }
                    }).then(function (response) {
                        if($scope.followDoc.similar_docs == undefined) {
                            $scope.followDoc.similar_docs = response.data.response.docs;
                        } else {
                            angular.forEach(response.data.response.docs, function (article, i) {
                                if ($scope.followDoc.similar_docs.map(function(e) { return e.id; }).indexOf(article.id) == -1) {
                                    $scope.followDoc.similar_docs.unshift(article);
                                    if ("Notification" in $window) {
                                        $window.Notification.requestPermission(function () {

                                            var title = article.title_website;
                                            var body = article.content_short;
                                            var icon = (article.content_image == undefined || article.content_image == null || article.content_image == '') ? null : "http://scrs.nagrgtr.com.s3-website-eu-west-1.amazonaws.com/" + article.content_image + ".jpg";

                                            var notification = new $window.Notification(title, {
                                                body: body,
                                                icon: icon
                                            });
                                            notification.onclick = $scope.showNewArticles;
                                        });
                                    }
                                }
                            });
                        }

                    }, function (error_response) {
                    });
                }
            }

            $scope.newArticles = [];
            $scope.articleIds = [];
            $scope.newArticleIds = [];
            $scope.followDoc = {};

            $scope.expanded = {};

            var queryString = '( _val_:"log(add(1,num_similar_docs))"^8.5 _val_:"log(add(1,num_total_points))"^2.0  _val_:"log(add(1,num_twitter_upvotes))"^8.0 _val_:"recip(ms(NOW/HOUR,created_at),3.16e-11,2300,1)"^1.5)';

            $scope.loading = false;


            var notifSet = new NotificationFactory({
                position: 'top-right'
            });

            $scope.assignFollowDoc = function (doc) {
                $scope.followDoc = doc;
                loadMoreFollow();
                $interval(loadMoreFollow, 15000);
            };

            $scope.showNewArticles = function () {
                Array.prototype.unshift.apply($scope.result.data.response.docs, $scope.newArticles);
                $scope.articleIds = $scope.articleIds.concat($scope.newArticleIds);
                $scope.newArticleIds = [];
                $scope.newArticles = [];

                document.getElementsByClassName("ui-view-block")[0].scrollTop = 0;
                $document[0].title = "Newscombinator Live";
            };


            function loadContent() {


                if(!$scope.loading) {
                    $scope.loading = true;
                    $http({
                        method: 'GET',
                        url: 'http://www.newscombinator.com/api/search',
                        params: {
                            "q": queryString,
                            "dismax": 0,
                            "highlight": 0,
                            "only_newest_similar":1,
                            "rows": 30,
                            "fq[]": "language:en"

                        }
                    }).then(function successCallback(response) {

                        $scope.loading = false;
                        angular.extend($scope.expanded, response.data.expanded);
                        if ($scope.result == undefined) {
                            $scope.result = response;
                            angular.forEach(response.data.response.docs, function (o, i) {
                                if ($scope.articleIds.indexOf(o.id) == -1 && $scope.newArticleIds.indexOf(o.id) == -1) {
                                    $scope.articleIds.push(o.id);
                                }
                            });


                        } else {
                            angular.forEach(response.data.response.docs, function (article, i) {
                                if ($scope.articleIds.indexOf(article.id) == -1 && $scope.newArticleIds.indexOf(article.id) == -1) {

                                    if (document.getElementsByClassName("ui-view-block")[0].scrollTop <= 1) {
                                        $scope.articleIds.push(article.id);
                                        $scope.result.data.response.docs.unshift(article);
                                    } else {
                                        $scope.newArticles.push(article);
                                        $scope.newArticleIds.push(article.id);
                                    }


                                    if ("Notification" in $window) {
                                        $window.Notification.requestPermission(function () {

                                            var title = article.title_website;
                                            var body = article.content_short;
                                            var icon = (article.content_image == undefined || article.content_image == null || article.content_image == '') ? null : "http://scrs.nagrgtr.com.s3-website-eu-west-1.amazonaws.com/" + article.content_image + ".jpg";

                                            var notification = new $window.Notification(title, {
                                                body: body,
                                                icon: icon
                                            });
                                            notification.onclick = $scope.showNewArticles;
                                        });
                                    } else {
                                        notifSet.addNotification({
                                            title: "New Article",
                                            content: "Scroll to the top to see new articles.",
                                            color: 'success',
                                            autoclose: 3000
                                        });

                                    }
                                }
                            });
                            if ($scope.newArticleIds.length > 0) {

                                $document[0].title = "(" + $scope.newArticleIds.length + ") Newscombinator Live";
                            } else {
                                $document[0].title = "Newscombinator Live";
                            }


                        }

                        // this callback will be called asynchronously
                        // when the response is available
                    }, function errorCallback(response) {
                        $scope.loading = false;
                        console.error(response);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }

            $interval(loadContent, 15000);
            loadContent();

            $scope.nextPage = function () {
                if (!$scope.loading) {
                    $scope.loading = true;
                    $http({
                        method: 'GET',
                        url: 'http://www.newscombinator.com/api/search',
                        params: {
                            "q": queryString,
                            "dismax": 0,
                            "highlight": 0,
                            "only_newest_similar": 1,
                            "rows": 10,
                            "start": $scope.articleIds.length,
                            "fq[]": "language:en"

                        }
                    }).then(function successCallback(response) {
                        $scope.loading = false;
                        angular.extend($scope.expanded, response.data.expanded);
                        angular.forEach(response.data.response.docs, function (article, i) {
                            if ($scope.articleIds.indexOf(article.id) == -1 && $scope.newArticleIds.indexOf(article.id) == -1) {
                                $scope.articleIds.push(article.id);
                                $scope.result.data.response.docs.push(article);
                            }
                        });
                    }, function errorCallback(response) {
                        $scope.loading = false;
                        console.error(response);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }
        });


}());

'use strict';

angular.module('newscombinator')
    .filter('getfavicon', function () {
        return function(data) {
            var    a      = document.createElement('a');
            a.href = data;

            var favicon = "favicon.ico";
            if(a.hostname.indexOf("makerland") != -1) {
                favicon = "static/img/makerland_favicon_SMALL.ico";
            }
            if(a.hostname.indexOf("soylentnews") != -1) {
                favicon = "favicon-soylentnews.png";
            }
            if(a.hostname.indexOf("inbound") != -1) {
                favicon = "assets/sites/inbound/img/fav.ico";
            }
            return a.protocol + "//" + a.hostname+"/"+favicon;
        };
    });
'use strict';

angular.module('newscombinator')
    .filter('gethostname', function () {
        return function(data, sourcemode) {
            if(data != undefined && data.indexOf("reddit") != -1 && sourcemode != undefined) {
                return data.replace("http://www.","");
            }
            var    a      = document.createElement('a');
            a.href = data;
            return a.hostname.replace("www.","").replace("news.","");
        };
    });
'use strict';

angular.module('newscombinator')
    .filter('showtitle',  function($filter) {
        return function(objResult, arrHighlight) {

            if(objResult == undefined) {
                console.log(objResult);
            }

            if(objResult.title_website != '' && objResult.title_website != null && objResult.title_website.indexOf("Firespotting! Interesting Ideas, Every Day!") == -1) {


                if(arrHighlight != undefined) {
                    return $filter('highlight')(objResult.title_website, arrHighlight, objResult.id, "title_website");
                } else {
                    return objResult.title_website;
                }
            }

            if(objResult.title_link != ''  && objResult.title_link != null) {
                return objResult.title_link;
            }



            return objResult.url;
        }
    });
'use strict';

angular.module('newscombinator')
    .directive('keepScrollPosition', function() {
        return function(scope, el, attrs) {
            scope.$watch(
                function() {
                    return document.getElementsByClassName("ui-view-block")[0].scrollHeight;
                },
                function(newHeight, oldHeight) {
                    console.debug('Height was changed', oldHeight, newHeight);
                    //el[0].scrollTop = newHeight - oldHeight;
                    document.getElementsByClassName("ui-view-block")[0].scrollTop = document.getElementsByClassName("ui-view-block")[0].scrollTop + (newHeight - oldHeight);
                });
        };
    });
(function () {
    'use strict';

    angular.module('application', [
            'ui.router',
            'ngAnimate',
            //foundation
            'foundation',
            'foundation.dynamicRouting',
            'foundation.dynamicRouting.animations',
            //user
            'angular-loading-bar',
            'infinite-scroll',
            'newscombinator'
        ])
        .config(config)
        .run(run)
    ;

    config.$inject = ['$urlRouterProvider', '$locationProvider'];

    function config($urlProvider, $locationProvider) {
        $urlProvider.otherwise('/');

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

    function run() {
        FastClick.attach(document.body);
    }

})();
