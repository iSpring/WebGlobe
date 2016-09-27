define(["world/TiledLayer"], function(TiledLayer) {
  //Google
  var GoogleTiledLayer = function(args) {
    TiledLayer.apply(this, arguments);
  };
  GoogleTiledLayer.prototype = new TiledLayer();
  GoogleTiledLayer.prototype.constructor = GoogleTiledLayer;
  GoogleTiledLayer.prototype.getImageUrl = function(level, row, column) {
    TiledLayer.prototype.getImageUrl.apply(this, arguments);
    var sum = level + row + column;
    var idx = 1 + sum % 3;
    var url = "//mt" + idx + ".google.cn/vt/lyrs=m@212000000&hl=zh-CN&gl=CN&src=app&x=" + column + "&y=" + row + "&z=" + level + "&s=Galil";
    return url;
  };
  return GoogleTiledLayer;
});