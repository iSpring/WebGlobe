///<amd-module name="world/TextureMaterial"/>
import Kernel = require('./Kernel');

class TextureMaterial {
    texture: WebGLTexture = null;
    image: HTMLImageElement = null;
    loaded: boolean = false;
    delete: boolean = false;

    constructor(args: any) {
        this.texture = Kernel.gl.createTexture();
        this.image = null;
        this.loaded = false;
        this.delete = false;
        if (args.image instanceof Image && args.image.width > 0 && args.image.height > 0) {
            this.setImage(args.image);
        } else if (typeof args.url == "string") {
            this.setImageUrl(args.url);
        }
    }

    setImage(image: HTMLImageElement): void {
        if (image.width > 0 && image.height > 0) {
            this.image = image;
            this.onLoad();
        }
    };
    
    setImageUrl(url: string): void {
        this.image = new Image();
        this.image.crossOrigin = 'anonymous'; //很重要，因为图片是跨域获得的，所以一定要加上此句代码
        this.image.onload = this.onLoad.bind(this);
        this.image.src = url;
    };

    //图片加载完成时触发
    onLoad(): void {
        //要考虑纹理已经被移除掉了图片才进入onLoad这种情况
        if (this.delete) {
            return;
        }

        Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, this.texture);
        Kernel.gl.pixelStorei(Kernel.gl.UNPACK_FLIP_Y_WEBGL, +true);

        Kernel.gl.texImage2D(Kernel.gl.TEXTURE_2D, 0, Kernel.gl.RGBA, Kernel.gl.RGBA, Kernel.gl.UNSIGNED_BYTE, this.image);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //使用MipMap
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MIN_FILTER, Kernel.gl.LINEAR_MIPMAP_NEAREST);
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_MAG_FILTER, Kernel.gl.LINEAR); //LINEAR_MIPMAP_NEAREST LINEAR_MIPMAP_LINEAR
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_S, Kernel.gl.CLAMP_TO_EDGE);
        Kernel.gl.texParameteri(Kernel.gl.TEXTURE_2D, Kernel.gl.TEXTURE_WRAP_T, Kernel.gl.CLAMP_TO_EDGE);
        Kernel.gl.generateMipmap(Kernel.gl.TEXTURE_2D);
        Kernel.gl.bindTexture(Kernel.gl.TEXTURE_2D, null);
        this.loaded = true;
    };

    //释放显卡中的texture资源
    releaseTexture(): void {
        if (Kernel.gl.isTexture(this.texture)) {
            Kernel.gl.deleteTexture(this.texture);
            this.delete = true;
        }
    };
}

export = TextureMaterial;