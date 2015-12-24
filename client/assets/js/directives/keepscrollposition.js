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