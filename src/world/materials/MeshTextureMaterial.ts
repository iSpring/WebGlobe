///<amd-module name="world/materials/MeshTextureMaterial"/>
import Kernel = require("../Kernel");
import MathUtils = require("../math/Math");
import Material = require("./Material");
import ImageUtils = require('../Image');

type ImageType = HTMLImageElement | string;

class MeshTextureMaterial extends Material {
    texture: WebGLTexture;
    image: HTMLImageElement;
    url: string;
    private ready:boolean = false;
    private deleted: boolean = false;

    constructor(imageOrUrl?: ImageType) {
        super();
        this.texture = Kernel.gl.createTexture();
        if(imageOrUrl){
            this.setImageOrUrl(imageOrUrl);
        }
    }

    getType(){
        return "MeshTextureMaterial";
    }

    isReady(): boolean{
        return this.ready;
    }

    setImageOrUrl(imageOrUrl?: ImageType){
        if(!imageOrUrl){
            return;
        }
        if (imageOrUrl instanceof Image && imageOrUrl.width > 0 && imageOrUrl.height > 0) {
            this.setImage(imageOrUrl);
        } else if (typeof imageOrUrl === "string") {
            this.setImageUrl(imageOrUrl);
        }
    }

    setImage(image: HTMLImageElement) {
        if (image.width > 0 && image.height > 0) {
            this.ready = false;
            this.image = image;
            this.onLoad();
        }
    }

    setImageUrl(url: string) {
        var tileImage = ImageUtils.get(url);
        if(tileImage){
            this.setImage(tileImage);
        }else{
            this.ready = false;
            this.image = new Image();
            //很重要，因为图片是跨域获得的，所以一定要加上此句代码
            this.image.crossOrigin = 'anonymous';
            this.image.onload = this.onLoad.bind(this);
            this.image.src = url;
        }
    }

    //图片加载完成时触发
    onLoad() {
        //要考虑纹理已经被移除掉了图片才进入onLoad这种情况
        if (this.deleted) {
            return;
        }

        Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, this.texture);
        Kernel.gl.pixelStorei(Kernel.gl.UNPACK_FLIP_Y_WEBGL, +true);

        Kernel.gl.texImage2D(Kernel.gl.TEXTURE_2D, 0, Kernel.gl.RGBA, Kernel.gl.RGBA, Kernel.gl.UNSIGNED_BYTE, this.image);

        // var isMipMap = this.image.width === this.image.height && MathUtils.isPowerOfTwo(this.image.width);

        // if (isMipMap) {
        //     //使用MipMap
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);//LINEAR_MIPMAP_LINEAR
            
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_S, Kernel.gl.CLAMP_TO_EDGE);
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_T, Kernel.gl.CLAMP_TO_EDGE);
            
        //     Kernel.gl.generateMipmap(Kernel.gl.TEXTURE_2D);
        // } else {
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR);//gl.NEAREST
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR);//gl.NEAREST

        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_S, Kernel.gl.CLAMP_TO_EDGE);
        //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_T, Kernel.gl.CLAMP_TO_EDGE);
        // }

        //使用MipMap
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR); //LINEAR_MIPMAP_NEAREST LINEAR_MIPMAP_LINEAR
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_S, Kernel.gl.CLAMP_TO_EDGE);
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_T, Kernel.gl.CLAMP_TO_EDGE);
        Kernel.gl.generateMipmap(Kernel.gl.TEXTURE_2D);

        Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, null);

        this.ready = true;
    }

    // test(){
    //     Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, this.texture);
    //     Kernel.gl.pixelStorei(Kernel.gl.UNPACK_FLIP_Y_WEBGL, +true);

    //     Kernel.gl.texImage2D(Kernel.gl.TEXTURE_2D, 0, Kernel.gl.RGBA, Kernel.gl.RGBA, Kernel.gl.UNSIGNED_BYTE, this.image);
    //     //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //     //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     //使用MipMap
    //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);
    //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR); //LINEAR_MIPMAP_NEAREST LINEAR_MIPMAP_LINEAR
    //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_S, Kernel.gl.CLAMP_TO_EDGE);
    //     Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_T, Kernel.gl.CLAMP_TO_EDGE);
    //     Kernel.gl.generateMipmap(Kernel.gl.TEXTURE_2D);
    //     Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, null);
    // }

    //释放显卡中的texture资源
    destroy() {
        if (Kernel.gl.isTexture(this.texture)) {
            Kernel.gl.deleteTexture(this.texture);
        }
        this.texture = null;
        this.deleted = true;
    }
}

export = MeshTextureMaterial;