import MeshTextureMaterial= require('./MeshTextureMaterial');
import ImageUtils = require('../Image');

type ImageType = HTMLImageElement | string;

class TileMaterial extends MeshTextureMaterial{
  level: number;

  constructor(level: number, imageOrUrl: ImageType){
    super(imageOrUrl, true);
    this.level = level >= 0 ? level : 20;
  }

  onLoad() {
    if (this.level <= ImageUtils.MAX_LEVEL) {
      ImageUtils.add(this.image.src, this.image);
    }
    super.onLoad();
  }
}

export = TileMaterial;