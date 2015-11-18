
(function() {
    'use strict';

    // Define the module
    angular.module('newscombinator', ['foundation' /* add dependencies specific to this module */ ]);


}());
(function() {
    'use strict';

    angular.module('newscombinator')
        .controller("CtrlMain", function ($scope, $stateParams, $state, $http, $interval, $document, NotificationFactory, $window) {


            $scope.newArticles = [];
            $scope.articleIds = [];
            $scope.newArticleIds = [];

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
                        url: 'http://www.newscombinator.com/api/search/?dismax=0&highlight=0&only_newest_similar=1&rows=30&q=%28%20_val_%3A%22log%28add%281%2Chn_num_points%29%29%22^6.25%20_val_%3A%22log%28add%281%2Csimilar_doc_ids_count_i%29%29%22^12.5%20_val_%3A%22recip%28ms%28NOW%2FHOUR%2Ccreated_at%29%2C3.16e-11%2C2300%2C1%29%22^2.5%29'
                    }).then(function successCallback(response) {

                        if ($scope.result == undefined) {
                            $scope.result = response;
                            angular.forEach(response.data.response.docs, function(o,i) {
                                $scope.articleIds.push(o.id);
                            });
                            if("Notification" in $window) {
                                $window.Notification.requestPermission(function() {
                                    //new $window.Notification("Test", {body: "Test test"});
                                });
                            }

                        } else {
                            angular.forEach(response.data.response.docs, function (o, i) {
                                if ($scope.articleIds.indexOf(o.id) == -1 && $scope.newArticleIds.indexOf(o.id) == -1) {
                                    $scope.newArticles.push(o);
                                    $scope.newArticleIds.push(o.id);
                                    if("Notification" in $window) {
                                        $window.Notification.requestPermission(function() {
                                            var max = $scope.newArticles.length > 5 ? 5 : $scope.newArticles.length;
                                            var body = "";
                                            for(var i = 0; i < max; i++) {
                                                body += $scope.newArticles[$scope.newArticles.length - 1 - i].title_website+"\n\n";
                                            }
                                            var notification = new $window.Notification("Newscombinator Live", {body: body});
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
