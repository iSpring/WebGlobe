import Kernel = require("../Kernel");
import MathUtils = require("../math/Utils");
import Material = require("./Material");
import ImageUtils = require('../Image');

type ImageType = HTMLImageElement | string;

class MeshTextureMaterial extends Material {
    texture: WebGLTexture;
    image: HTMLImageElement;
    private ready: boolean = false;
    private deleted: boolean = false;

    constructor(imageOrUrl: ImageType = null, public flipY: boolean = false) {
        super();
        this.texture = Kernel.gl.createTexture();
        if (imageOrUrl) {
            this.setImageOrUrl(imageOrUrl);
        }
    }

    isReady(): boolean {
        return this.ready && !this.deleted;
    }

    setImageOrUrl(imageOrUrl?: ImageType) {
        if (!imageOrUrl) {
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
        if (tileImage) {
            this.setImage(tileImage);
        } else {
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

        if (this.flipY) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +true);
        } else {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +false);
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

        //http://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
        /*
        TEXTURE_MIN_FILTER is the setting used when the size you are drawing is smaller than the largest mip.
        TEXTURE_MAG_FILTER is the setting used when the size you are drawing is larger than the largest mip.
        For TEXTURE_MAG_FILTER only NEAREST and LINEAR are valid settings.
        You can choose what WebGL does by setting the texture filtering for each texture. There are 6 modes

        NEAREST = choose 1 pixel from the biggest mip
        LINEAR = choose 4 pixels from the biggest mip and blend them
        NEAREST_MIPMAP_NEAREST = choose the best mip, then pick one pixel from that mip
        LINEAR_MIPMAP_NEAREST = choose the best mip, then blend 4 pixels from that mip
        NEAREST_MIPMAP_LINEAR = choose the best 2 mips, choose 1 pixel from each, blend them
        LINEAR_MIPMAP_LINEAR = choose the best 2 mips. choose 4 pixels from each, blend them

        You might be thinking why would you ever pick anything other than LINEAR_MIPMAP_LINEAR which is arguably the best one.
        There are many reasons. One is that LINEAR_MIPMAP_LINEAR is the slowest. Reading 8 pixels is slower than reading 1 pixel.
        On modern GPU hardware it's probably not an issue if you are only using 1 texture at a time but modern games might use 2 to 4 textures at once.
        4 textures * 8 pixels per texture = needing to read 32 pixels for every pixel drawn.
        That's going to be slow. Another reason is if you're trying to achieve a certain effect.
        For example if you want something to have that pixelated retro look maybe you want to use NEAREST.
        Mips also take memory. In fact they take 33% more memory.
        That can be a lot of memory especially for a very large texture like you might use on a title screen of a game.
        If you are never going to draw something smaller than the largest mip why waste memory for those mips.
        Instead just use NEAREST or LINEAR as they only ever use the first mip.
        */

        /*var isMipMap = this.image.width === this.image.height && MathUtils.isPowerOfTwo(this.image.width);

        if (isMipMap) {
            //使用MipMap
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }*/

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // gl.bindTexture(gl.TEXTURE_2D, null);

        this.ready = true;
    }

    //释放显卡中的texture资源
    destroy() {
        var gl = Kernel.gl;
        // if (gl.isTexture(this.texture)) {
        //     gl.deleteTexture(this.texture);
        // }
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }
        if (this.image && !this.ready) {
            // console.log(`Cancel load image ${this.image.src}`);
            this.image.src = "";
        }
        this.ready = false;
        this.texture = null;
        this.deleted = true;
    }
}

export = MeshTextureMaterial;