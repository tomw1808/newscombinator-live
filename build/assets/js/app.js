
(function() {
    'use strict';

    // Define the module
    angular.module('newscombinator', ['foundation' /* add dependencies specific to this module */ ]);


}());
(function() {
    'use strict';

    angular.module('newscombinator')
        .controller("CtrlMain", function ($scope, $stateParams, $state, $http, $interval, $document, NotificationFactory, $window) {

            if("Notification" in $window) {
                $window.Notification.requestPermission(function() {
                    //new $window.Notification("Test", {body: "Test test"});
                });
            }

            $scope.newArticles = [];
            $scope.articleIds = [];
            $scope.newArticleIds = [];

            $scope.expanded = {};

            var loading = false;

            function arrayObjectIndexOf(arr, obj){
                for(var i = 0; i < arr.length; i++){
                    if(angular.equals(arr[i], obj)){
                        return i;
                    }
                }
                return -1;
            }
            var notifSet = new NotificationFactory({
                position: 'top-right'
            });


            $scope.showNewArticles = function() {
                Array.prototype.unshift.apply($scope.result.data.response.docs, $scope.newArticles);
                $scope.articleIds = $scope.articleIds.concat($scope.newArticleIds);
                $scope.newArticleIds = [];
                $scope.newArticles = [];

                $document[0].title = "Newscombinator Live";
            };



            function loadContent() {

                if (loading) {
                } else {
                    loading = true;
                    $http({
                        method: 'GET',
                        url: 'http://www.newscombinator.com/api/search?dismax=0&highlight=0&only_newest_similar=1&q=(+_val_:%22log(add(1,num_total_points))%22%5E0++_val_:%22log(add(1,num_twitter_upvotes))%22%5E0+_val_:%22recip(ms(NOW%2FHOUR,created_at),3.16e-11,2300,1)%22%5E5)&rows=30'
                    }).then(function successCallback(response) {

                        angular.extend($scope.expanded, response.data.expanded);
                        if ($scope.result == undefined) {
                            $scope.result = response;
                            angular.forEach(response.data.response.docs, function(o,i) {
                                $scope.articleIds.push(o.id);
                            });


                        } else {
                            angular.forEach(response.data.response.docs, function (o, i) {
                                if ($scope.articleIds.indexOf(o.id) == -1 && $scope.newArticleIds.indexOf(o.id) == -1) {
                                    $scope.newArticles.push(o);
                                    $scope.newArticleIds.push(o.id);


                                    if("Notification" in $window) {
                                        $window.Notification.requestPermission(function() {

                                            var title = $scope.newArticles[$scope.newArticles.length - 1].title_website;
                                            var body = $scope.newArticles[$scope.newArticles.length - 1].content_short;
                                            var icon = $scope.newArticles[$scope.newArticles.length - 1].content_image == undefined ? null : "http://scrs.nagrgtr.com.s3-website-eu-west-1.amazonaws.com/"+$scope.newArticles[$scope.newArticles.length - 1].content_image+".jpg";

                                            var notification = new $window.Notification(title, {body: body, icon: icon});
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
                            if($scope.newArticleIds.length > 0) {

                                $document[0].title = "(" + $scope.newArticleIds.length + ") Newscombinator Live";
                            } else {
                                $document[0].title = "Newscombinator Live";
                            }


                        }

                        loading = false;
                        // this callback will be called asynchronously
                        // when the response is available
                    }, function errorCallback(response) {
                        loading = false;
                        console.error(response);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }

            $interval(loadContent, 15000);
            loadContent();

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
            if(data.indexOf("reddit") != -1 && sourcemode != undefined) {
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
