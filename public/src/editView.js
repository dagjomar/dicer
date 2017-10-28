var EditView = function(parentEl, onClick){
    this.parentEl = parentEl;

    this.onClick = onClick;

    this.domEl = this.generateDOM();
    this.parentEl.appendChild( this.domEl );

    this.paddingW = 20;
    this.paddingH = 20;

    window.addEventListener('resize', this.onResize.bind(this) );
    this.onResize();
}

EditView.prototype = {
    remove: function(){
        if(this.domEl){
            this.domEl.remove();
        }
    },

    generateDOM: function(){
        var editWrapper = this.editWrapper = document.createElement("div");
        editWrapper.className = 'editview-wrapper';

        editWrapper.addEventListener('click', function(e){
            if(this.onClick){
                this.onClick();
            }
        }.bind(this));

        return editWrapper;
        // var dom =  '<div class="editview-wrapper">'+
        //                 '<img class="editview-img select" src="test/test-images/example-portrait.jpg" id="photo-container" />'+
        //             '</div>';
    },

    onResize: function(){
        if(!this.resizableEl){
            return;
        }

        // These are the absolute max for anything
        var maxWidth = this.editWrapper.clientWidth - this.paddingW;
        var maxHeight = this.editWrapper.clientHeight - this.paddingH;

        var imgRatio = this.originalWidth / this.originalHeight;
        var wrapperRatio = maxWidth / maxHeight;

        var imgW, imgH;

        if( imgRatio >= wrapperRatio){
            // Image will fit if the width is within maxWidth
            imgW = maxWidth;
            imgH = (imgW / imgRatio);
        }else{
            // Image will fit if the height is within maxHeight
            imgH = maxHeight;
            imgW = imgH * imgRatio;
        }

        this.resizableEl.style.width = imgW + 'px';
        this.resizableEl.style.height = imgH + 'px';
    },

    addResizableElement: function(el, originalWidth, originalHeight){
        this.removeResizableElement();

        this.resizableEl = el;
        this.originalWidth = originalWidth;
        this.originalHeight = originalHeight;

        this.editWrapper.appendChild(el);

        this.onResize();

    },

    setPadding: function(w,h){
        this.paddingW = w;
        this.paddingH = h;
        this.onResize();
    },

    removeResizableElement: function(){
        if(this.resizableEl){
            this.resizableEl.remove();
            this.originalWidth = null;
            this.originalHeight = null;
        }
    }
};

/* TESTS */
if(false){
    var editView = window.editView = new EditView( document.body );
    console.log('editView', editView);
    var img = document.createElement('img');
    img.src="test/test-images/dj-selfie.jpg";
    editView.addResizableElement(img, 720, 1280);

}