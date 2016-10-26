///<amd-module name="world/materials/MeshTextureMaterial"/>
import Kernel = require("../Kernel");
import MathUtils = require("../math/Math");
import Material = require("./Material");

class MeshTextureMaterial extends Material {
    texture: WebGLTexture;
    image: HTMLImageElement;
    url: string;
    ready: boolean = false;
    isDelete: boolean = false;

    constructor(args: any) {
        super();
        if (args.image instanceof Image && args.image.width > 0 && args.image.height > 0) {
            this.setImage(args.image);
        } else if (typeof args.url === "string") {
            this.setImageUrl(args.url);
        }
    }

    getType(){
        return "MeshTextureMaterial";
    }

    isReady(){
        return this.ready;
    }

    setImage(image: HTMLImageElement) {
        if (image.width > 0 && image.height > 0) {
            this.image = image;
            this._onLoad();
        }
    }

    setImageUrl(url: string) {
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';//很重要，因为图片是跨域获得的，所以一定要加上此句代码
        this.ready = false;
        this.image.onload = this._onLoad.bind(this);
        this.image.src = url;
    }

    //图片加载完成时触发
    _onLoad() {
        //要考虑纹理已经被移除掉了图片才进入onLoad这种情况
        if (this.isDelete) {
            return;
        }

        Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, this.texture);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);

        Kernel.gl.texImage2D(Kernel.gl.TEXTURE_2D, 0, Kernel.gl.RGBA, Kernel.gl.RGBA, Kernel.gl.UNSIGNED_BYTE, this.image);

        var isMipMap = this.image.width === this.image.height && MathUtils.isPowerOfTwo(this.image.width);

        if (isMipMap) {
            //使用MipMap
            Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);
            Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);//LINEAR_MIPMAP_LINEAR
            Kernel.gl.generateMipmap(Kernel.gl.TEXTURE_2D);
        } else {
            Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR);//gl.NEAREST
            Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR);//gl.NEAREST
        }

        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_S, Kernel.gl.CLAMP_TO_EDGE);
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_T, Kernel.gl.CLAMP_TO_EDGE);

        Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, null);

        this.ready = true;
    }

    //释放显卡中的texture资源
    destroy() {
        if (Kernel.gl.isTexture(this.texture)) {
            Kernel.gl.deleteTexture(this.texture);
        }
        this.texture = null;
        this.isDelete = true;
        this.ready = false;
    }
}

export = MeshTextureMaterial;