# newscombinator-live
Live updates of different News items, from tech news to stock updates.

[Demo](http://live.newscombinator.com)

This is a test for [Babbleaway](http://babbleaway.com) the classifier app. The whole thing is built upon [foundation](http://foundation.zurb.com/apps.html) and is merely a test.

## Changes/Fixes in Libraries
In order to make it work, there is a change in one of the libraries necessary. The ngInifiteScroll library does not cooperate with the foundation way of displaying the viewport very well. I have not found any other solution than making a change in the library itself. 

Change the following line (173 sometimes line 177) in /bower_components/ngInfiniteScroll/ng-infinite-scroll.js:

    changeContainer(angular.element(elem.parent()));
          
to the following:

    changeContainer(angular.element(elem.parent().parent()));
    
   
   
    

## Usage

* git clone...
* bower install
* foundation watch
* apply the patch above.

In addition, after installing Windows 10 now, foundation build is not working anymore. its `gulp build` instead of `foundation build`. If someone knows why, I would be pleased if you could enlighten me.

## Other

My personal opinion is that Foundation is a pretty neat toolkit. 
Unfortunately the way the viewport is presented makes it "unpractical" for plugins imho. 
In general the concept is pretty cool, I would use it for further projects. The whole Design-line is neat. 
It just feels overall a little bit too beta for me to use it. For example I have not found any proper way to install and keep bower components. 
I would have to first `bower install --save myComponent` and then edit the gulpfile.js and try and find the appropriate js 
file from the library and then the add the appropriate css file to my app.scss as import. That give the whole 
thing a little bit of a clunky feeling. But overall a very cool project.