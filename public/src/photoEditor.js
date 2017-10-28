var PhotoEditor = function(parentEl){
    this.editView = new EditView( parentEl, this.onClick.bind(this) );

    this.diceImages = [];
}

PhotoEditor.prototype = {

    remove: function(){
        this.removeCanvas();
        this.editView.remove();
    },

    onClick: function(){
        this.diceImages.activeIndex++;
        if(this.diceImages.activeIndex >= 6){
            this.diceImages.activeIndex = 0;
        }
        this.canvasWrapper.clear();
        this.canvasWrapper.drawAllImages();
    },

    openImage(src, orientation){
        //this.removeCanvas();

        //var orientationTransforms = 
        console.log('@ openImage orientation: ' + orientation);

        return Utils.loadImage(src, orientation)
        .then(function(imgObj){

            var width = imgObj.properties.width;
            var height = imgObj.properties.height;
            var cw = this.canvasWrapper = new CanvasWrapper(width, height);

            this.canvasWrapperEl = this.canvasWrapper.canvas;
            cw.addImage('original',imgObj);

            this.editView.addResizableElement(cw.canvas, width, height);

            return this.loadDiceImages().then(function(){
                cw.drawAllImages();
                return cw;
            });


        }.bind(this));
    },

    loadDiceImages: function(){
        var cw = this.canvasWrapper;

        return Utils.loadImages([
            'src/images/dice/dice-1.png',
            'src/images/dice/dice-2.png',
            'src/images/dice/dice-3.png',
            'src/images/dice/dice-4.png',
            'src/images/dice/dice-5.png',
            'src/images/dice/dice-6.png',
        ], 0.2)
        .then(function(imagesObj){

            console.log('@ loaded image objects', imagesObj);
            this.diceImages = imagesObj;
            this.diceImages.activeIndex = 3;
            cw.addImage('dice', this.diceImages);

        }.bind(this));

    },

    removeCanvas: function(){

        if(this.canvasWrapperEl){
            this.canvasWrapperEl.remove();
        }

        if(this.canvasWrapper){
            this.canvasWrapper = null;
        }

    },

    getFinalImageURL: function(){
        var imageUrl = this.canvasWrapper.getImageURL();
        
        return imageUrl;
    }
};

/* TESTS */
/* set to true to perform tests */
if(false){
    var photoEdit = window.photoEdit = new PhotoEditor( document.body );
    photoEdit.openImage('test/test-images/dj-selfie.jpg');
}

// ORIENTATION TESTS
if(false){
    photoEdit = new PhotoEditor( document.body );
    photoEdit.openImage('test/test-images/IMG_0218.JPG', 6);
}

if(false){
    photoEdit = new PhotoEditor( document.body );
    photoEdit.openImage('test/test-images/dj-selfie.jpg', 1);
}
if(false){
    var photoEdit;
    var i = 1;
    function doTest(){
        photoEdit = new PhotoEditor( document.body );
        photoEdit.openImage('test/test-images/dj-selfie.jpg', 2);

        setTimeout( function(){
            photoEdit.remove();
            i++;
            if(i <= 8){
                doTest();
            }
        }, 1000);
    }
    
    doTest();
}