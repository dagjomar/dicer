var Utils = {
    readExifOrientation: function(result){

        var exif = EXIF.readFromBinaryFile(result);
        //console.log('@ exif', exif);
        return exif.Orientation;

    },

    isOrientationRotated: function(orientation){
        switch (orientation){
            case 1: return false; break;
            case 2: return false; break;
            case 3: return false; break;
            case 4: return false; break;
            case 5: return true; break;
            case 6: return true; break;
            case 7: return true; break;
            case 8: return true; break;
            default: return false;
        }
    },

    getOrientationTransformation: function(orientation){
        console.log('@ getOrientationTransformation for orientation: ', orientation);
        var transformation = {
            translate: null,
            rotate: null,
            scale: null
        };

        switch(orientation){
            case 1:
                break;
            case 2:
                // horizontal flip
                transformation.translate = [1,0];
                transformation.scale = [-1,1];
                break;
            case 3:
                // 180° rotate left
                // ctx.translate(canvas.width, canvas.height);
                // ctx.rotate(Math.PI);
                break;
            case 4:
                // vertical flip
                // ctx.translate(0, canvas.height);
                // ctx.scale(1, -1);
                break;
            case 5:
                // vertical flip + 90 rotate right
                // ctx.rotate(0.5 * Math.PI);
                // ctx.scale(1, -1);
                break;
            case 6:
                // 90° rotate right
                transformation.translate = [0, -1];
                transformation.rotate = 0.5 * Math.PI;
                // ctx.rotate(0.5 * Math.PI);
                // ctx.translate(0, -canvas.height);
                break;
            case 7:
                // horizontal flip + 90 rotate right
                // ctx.rotate(0.5 * Math.PI);
                // ctx.translate(canvas.width, -canvas.height);
                // ctx.scale(-1, 1);
                break;
            case 8:
                // 90° rotate left
                // ctx.rotate(-0.5 * Math.PI);
                // ctx.translate(-canvas.width, 0);
                break;
        }

        return transformation;
    },

    // Takes in a src string and returns an image object with DOM element and other properties
    // Takes in an optional orientation, as an EXIF Orientation integer
    loadImage: function(src, orientation){

        var promiseFunc = function(orientation){
            var orient = orientation;

            return function(resolve, reject){

                var onLoad = function (){

                    var transformStuff = Utils.getOrientationTransformation(orient);

                    var transformRotated = Utils.isOrientationRotated(orient);

                    // console.log('@ naturalWidth: ', this.naturalWidth);
                    // console.log('@ naturalHeight: ', this.naturalHeight);

                    var width = transformRotated ? this.naturalHeight : this.naturalWidth;
                    var height = transformRotated ? this.naturalWidth : this.naturalHeight;

                    var orientation = (width > height) ? 'landscape' : 'portrait';
                    orientation = orient;

                    var ratio = width / height;

                    var object = {
                        img: img,
                        src: src,
                        properties: {
                            width: width,
                            height: height,
                            naturalWidth: this.naturalWidth,
                            naturalHeight: this.naturalHeight,
                            orientation: orientation,
                            ratio: ratio,
                            transformation: transformStuff
                        }
                    };

                    resolve(object);
                };

                var img = new Image();

                img.onload = onLoad;
                img.src = src;
            };

        }(orientation);

        return new Promise(promiseFunc);

    },

    loadImages: function(arr, scale){
        var promises = arr.map( Utils.loadImage );
        return Promise.all( promises ).then(function(images){
            var maxWidth = 0;
            var maxHeight = 0;
            images.map(function(obj){
                if(obj.properties.width > maxWidth){ maxWidth = obj.properties.width; }
                if(obj.properties.height > maxHeight){ maxHeight = obj.properties.height; }
                obj.properties.scale = scale;
            });
            return { type: 'polyimage', images: images, activeIndex: 0, properties: {maxWidth: maxWidth, maxHeight: maxHeight}};
        });
    }
}

// TESTS
if(false){
    Utils.loadImage("test/test-images/dj-selfie.jpg", 6).then(function(obj){
        console.log(' got image', obj);
        console.assert( obj.properties.width == 720, 'width');
        console.assert( obj.properties.height == 1280, 'height');
        console.assert( obj.properties.orientation == 6, 'orientation');
        console.assert( obj.properties.ratio == 0.5625, 'ratio');
        console.assert( obj.properties.transformation.rotate == 1.5707963267948966, 'rotation');

    });
}

if(false){
    var isRotated1 = Utils.isOrientationRotated(1);
    console.assert(isRotated1 == false, '1 == not rotated');
    var isRotated6 = Utils.isOrientationRotated(6);
    console.assert(isRotated6 == true, '6 == rotated');
}




function CanvasWrapper(width, height){
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext("2d");
    this.width  = this.canvas.width  = width;
    this.height = this.canvas.height = height;
    this.canvas.style.position="relative"; /* more for debug purposes */
    this.canvas.style.width="100%"; /* more for debug purposes */

    this.images = {};
}

CanvasWrapper.prototype = {

    // Adds a src to the canvas as an image object
    // Give it an id to refer to it later
    // Give it initial coords
    addImage: function(id, obj, coords){
        var coords = coords || {x: 0, y: 0};
        obj.id = id;
        obj.coords = coords;
        this.images[id] = obj;
        return this.images[id];
    },

    removeImage: function(id){
        if(this.images[id]){
            this.images[id] = null;
            delete this.images[id];
        }
    },

    // Given that an image with an id exist, draw it on canvas
    drawImage: function(id){
        if(!this.images[id]){
            throw new Error("Image with id " + id + " does not exist");
        }

        var imageObj;
        if( this.images[id].type == "polyimage" ){
            var index = this.images[id].activeIndex;
            imageObj = this.images[id].images[index];
        }else{
            imageObj = this.images[id];
        }
        // console.log('@ draw image obj: ', imageObj);
         // save the unrotated context of the canvas so we can restore it later
        // the alternative is to untranslate & unrotate after drawing
        this.ctx.save();

        var rotate = imageObj.properties.transformation.rotate;

        var width = imageObj.properties.naturalWidth;
        var height = imageObj.properties.naturalHeight;
        var x = this.images[id].coords.x;
        var y = this.images[id].coords.y;

        var scale = imageObj.properties.scale;
        if(scale){
            var ratio = width / height;
            width = this.canvas.width * scale;
            height = width *ratio;
        }

        if(rotate){
            // move to the center of the canvas
            this.ctx.translate(this.canvas.width/2,this.canvas.height/2);
            this.ctx.rotate(rotate);
            x = -width/2 + ( this.images[id].coords.x );
            y = -height/2 + ( this.images[id].coords.y );
        }

        this.ctx.drawImage(imageObj.img, x, y, width, height);

        this.ctx.restore();
    },

    setImageCoords: function(id, coords){
        this.images[id].coords = coords;
    },

    setImageXY: function(id, x, y){
        this.setImageCoords(id, {x: x, y: y});
    },

    getImageURL: function(){
        return this.canvas.toDataURL("image/png");
    },

    clear: function(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawAllImages: function(){
        for (var id in this.images) {
            if (this.images.hasOwnProperty(id)) {
                this.drawImage(id);
            }
        }
    }
};

// TESTS
if(false){

    Utils.loadImage('test/test-images/dj-selfie.jpg')
    .then(function(imgObj){
        var width = imgObj.properties.width;
        var height = imgObj.properties.height;
        window.cw = cw = new CanvasWrapper(width, height);
        console.assert(cw.width == width, 'canvas width');
        console.assert(cw.height == height, 'canvas height');

        return cw.addImage('selfie',imgObj);
    })
    .then(function(obj){
        cw.drawImage('selfie');

        var imageUrl = cw.getImageURL();
        //console.log('@ got image url', getImage);
        console.assert( imageUrl.substr(0, 21) == 'data:image/png;base64', 'got image png string');

        return true;
    }).then(function(){
        return Utils.loadImage('src/images/dice-6.png');
    }).then(function(imgObj){
        cw.addImage('dice', imgObj);
        cw.setImageXY('dice', 100,100);
        cw.drawImage('dice');
        cw.clear();
        cw.drawAllImages();

        document.body.appendChild(cw.canvas);
        return cw;
    });

}

/* TESTS */
/* set to true to perform test */
if(false){

    Utils.loadImages([
        'src/images/dice/dice-1.png',
        'src/images/dice/dice-2.png',
        'src/images/dice/dice-3.png',
        'src/images/dice/dice-4.png',
        'src/images/dice/dice-5.png',
        'src/images/dice/dice-6.png',
    ], 0.5)
    .then(function(imagesObj){

        console.log('@ loaded image objects', imagesObj);
        console.assert( imagesObj.images[3].properties.scale == 0.5, 'scale' );
        var width = imagesObj.properties.maxWidth;
        var height = imagesObj.properties.maxHeight;
        window.cw = cw = new CanvasWrapper(width, height);
        cw.addImage('dices', imagesObj);
        imagesObj.activeIndex = 2;
        document.body.appendChild(cw.canvas);
        cw.drawAllImages();

        setInterval(function(){
            imagesObj.activeIndex ++;
            if(imagesObj.activeIndex > 5){
                imagesObj.activeIndex = 0;
            }
            cw.clear();
            cw.drawAllImages();
        }, 100);
    });

}