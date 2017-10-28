/*
    Copied from https://gist.github.com/amolk/1599412
    Actually works on the iPhon 5s iOS 10
*/

document.body.addEventListener('touchmove', function(event) {
  console.log(event.source);
  //if (event.source == document.body)
    event.preventDefault();
}, false);

window.onresize = function() {
    document.body.style.width=window.innerWidth + "px";
    document.body.style.height=window.innerHeight + "px";
}

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        window.onresize();
    }, false);
}
