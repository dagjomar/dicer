var $ = function(selector){
    return document.querySelector(selector);
}

var input = $("#cameraInput");
input.addEventListener('change', function(e){
    console.log('@@ changed', e);
    data = e.target.files[0];
    reader = new FileReader();

    reader.onload = function(evt){
        var imgResult = evt.target.result;
        reader.onload = function(e){
            console.log('@ on loaded 2', this.result)
                var orientation = Utils.readExifOrientation(this.result);

                console.log('@ orientation: ', orientation);

            startPreview(imgResult, orientation);
        };
        reader.readAsArrayBuffer(data);


    };
    reader.readAsDataURL(data);

});


window.hide = function(selector){
    var elem = $(selector);
    elem.style.display="none";
}

window.show = function(selector){
    var elem = $(selector);
    elem.style.display="";
}
var photoEdit = null;

function destroyPreview(){
    if(photoEdit){
        photoEdit.remove();
    }
};

function startPreview(source, orientation){

    var photoEdit = window.photoEdit = new PhotoEditor( $("#preview-container") );
    photoEdit.openImage(source, orientation);

    show("#preview-page");
    hide("#empty-state-page");
}

function startEmptyState(){
    // console.log('@ startEmptyState');
    destroyPreview();
    hide("#preview-page");
    show("#empty-state-page");
}

function openFinalImage(){
    var image = photoEdit.getFinalImageURL();
    //console.log('@ openFinalImage', image);
    //var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    //var newWindow = window.open(image, 'dice-img', strWindowFeatures);
    //window.open(photoEdit.canvasWrapper.canvas.toDataURL("image/png"), '_blank');
    var link = document.createElement("a");
    link.href = image;
    link.target = "_blank";
    link.download = image;
    link.click();
    return false;
}

startEmptyState();

// var editView = new EditView( $("#preview-container") );
// hide("#empty-state-page");
// show("#preview-page");
    // startPreview("test/test-images/dj-selfie.jpg");
// hide("#empty-state-page");

// hide("#empty-state-page");
// show("#edit-page");



