///<amd-module name="world/materials/TileMaterial"/>
import MeshTextureMaterial= require('./MeshTextureMaterial');
import ImageUtils = require('../Image');

type ImageType = HTMLImageElement | string;

class TileMaterial extends MeshTextureMaterial{
  level: number;

  constructor(level: number, imageOrUrl: ImageType){
    super();
    this.level = level >= 0 ? level : 20;
    this.setImageOrUrl(imageOrUrl);
  }

  onLoad() {
    if (this.level <= ImageUtils.MAX_LEVEL) {
      ImageUtils.add(this.image.src, this.image);
    }
    super.onLoad();
  }
}

export = TileMaterial;