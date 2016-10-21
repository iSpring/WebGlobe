window.onload = function() {
  require(["world/Globe", "world/layers/BingTiledLayer", "world/layers/NokiaTiledLayer", "world/layers/OsmTiledLayer",
  "world/layers/SosoTiledLayer", "world/layers/TiandituTiledLayer", "world/layers/GoogleTiledLayer"],
    function(Globe, BingTiledLayer, NokiaTiledLayer, OsmTiledLayer, SosoTiledLayer, TiandituTiledLayer, GoogleTiledLayer) {

      function startWebGL() {
        var canvas = document.getElementById("canvasId");
        window.globe = new Globe(canvas);
        var mapSelector = document.getElementById("mapSelector");
        mapSelector.onchange = changeTiledLayer;
        changeTiledLayer();
      }

      function changeTiledLayer() {
        var mapSelector = document.getElementById("mapSelector");
        mapSelector.blur();
        var newTiledLayer = null;
        var args = null;
        var value = mapSelector.value;
        switch (value) {
          case "bing":
            newTiledLayer = new BingTiledLayer();
            break;
          case "nokia":
            newTiledLayer = new NokiaTiledLayer();
            break;
          case "osm":
            newTiledLayer = new OsmTiledLayer();
            break;
          case "soso":
            newTiledLayer = new SosoTiledLayer();
            break;
          case "tianditu":
            newTiledLayer = new TiandituTiledLayer();
            break;
          default:
            break;
        }

        if (newTiledLayer) {
          window.globe.setTiledLayer(newTiledLayer);
        }
      }


      startWebGL();
    });
};