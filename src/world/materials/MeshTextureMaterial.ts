///<amd-module name="world/materials/MeshTextureMaterial"/>
import Kernel = require("../Kernel");
import MathUtils = require("../math/Utils");
import Material = require("./Material");
import ImageUtils = require('../Image');

type ImageType = HTMLImageElement | string;

class MeshTextureMaterial extends Material {
    texture: WebGLTexture;
    image: HTMLImageElement;
    private ready:boolean = false;
    private deleted: boolean = false;

    constructor(imageOrUrl: ImageType = null, public flipY: boolean = false) {
        super();
        this.texture = Kernel.gl.createTexture();
        if(imageOrUrl){
            this.setImageOrUrl(imageOrUrl);
        }
    }

    isReady(): boolean{
        return this.ready && !this.deleted;
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
    protected onLoad() {
        //要考虑纹理已经被移除掉了图片才进入onLoad这种情况
        if (this.deleted) {
            return;
        }

        var gl = Kernel.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        if(this.flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +true);
        }else{
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +false);
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

        var isMipMap = this.image.width === this.image.height && MathUtils.isPowerOfTwo(this.image.width);

        if (isMipMap) {
            //使用MipMap
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //LINEAR_MIPMAP_NEAREST LINEAR_MIPMAP_LINEAR
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//gl.NEAREST
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);//gl.NEAREST
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.ready = true;
    }

    //释放显卡中的texture资源
    destroy() {
        var gl = Kernel.gl;
        // if (gl.isTexture(this.texture)) {
        //     gl.deleteTexture(this.texture);
        // }
        if(this.texture){
            gl.deleteTexture(this.texture);
        }
        if(this.image && !this.ready){
            console.log(`Cancel load image ${this.image.src}`);
            this.image.src = "";
        }
        this.ready = false;
        this.texture = null;
        this.deleted = true;
    }
}

export = MeshTextureMaterial;