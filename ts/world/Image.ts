///<amd-module name="world/Image"/>
interface ImageHashMap{
  [key: string] : HTMLImageElement;
}

const ImageUtils = {
  //缓存图片信息1、2、3、4级的图片信息
  MAX_LEVEL: 4, //缓存图片的最大level
  images: <ImageHashMap>{},
  
  add(url: string, img: HTMLImageElement) {
    this.images[url] = img;
  },

  get(url: string) : HTMLImageElement {
    return this.images[url];
  },

  remove(url: string): void {
    delete this.images[url];
  },

  clear(): void {
    this.images = {};
  },

  getCount() {
    var count = 0;
    for (var url in this.images) {
      if (this.images.hasOwnProperty(url)) {
        count++;
      }
    }
    return count;
  }
};

export = ImageUtils;