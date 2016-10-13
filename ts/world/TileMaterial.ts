import TextureMaterial= require('./TextureMaterial');
import ImageUtils = require('./Image');

class TileMaterial extends TextureMaterial{
  level: number;

  constructor(args?: any){
    super(args);
    if (args) {
      if (!args.image && typeof args.url === "string") {
        var tileImage = ImageUtils.get(args.url);
        if (tileImage) {
          args.image = tileImage;
          delete args.url;
        }
      }
      this.level = typeof args.level == "number" && args.level >= 0 ? args.level : 20;
    }    
  }

  onLoad() {
    if (this.level <= ImageUtils.MAX_LEVEL) {
      ImageUtils.add(this.image.src, this.image);
    }
    super.onLoad();
  }
}

export = TileMaterial;