window.onload = function() {
  require(["world/Globe", "world/BingTiledLayer", "world/NokiaTiledLayer", "world/OsmTiledLayer", "world/SosoTiledLayer", "world/TiandituTiledLayer", "world/GoogleTiledLayer"],
    function(Globe, BingTiledLayer, NokiaTiledLayer, OsmTiledLayer, SosoTiledLayer, TiandituTiledLayer, GoogleTiledLayer) {

      var canvas, globe;

      function startWebGL() {
        globe = new Globe(canvas);
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
          globe.setTiledLayer(newTiledLayer);
        }
      }

      function initAll() {
        canvas = document.getElementById("canvasId");
        startWebGL();
      }

      canvas = document.getElementById("canvasId");
      startWebGL();
    });
};