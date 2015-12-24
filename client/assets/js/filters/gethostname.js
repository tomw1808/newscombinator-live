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