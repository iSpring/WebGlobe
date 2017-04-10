import MeshTextureMaterial from './MeshTextureMaterial';
import ImageUtils from '../Image';

type ImageType = HTMLImageElement | string;

export default class TileMaterial extends MeshTextureMaterial{
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
};