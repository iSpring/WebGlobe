window.onload = function() {
    require([
            "world/Kernel",
            "world/Globe",
            "world/layers/BingTiledLayer",
            "world/layers/NokiaTiledLayer",
            "world/layers/OsmTiledLayer",
            "world/layers/SosoTiledLayer",
            "world/layers/GoogleTiledLayer",
            "world/services/SearchService"
        ],
        function(Kernel, Globe, BingTiledLayer, NokiaTiledLayer, OsmTiledLayer, SosoTiledLayer,
            GoogleTiledLayer, SearchService) {

            window.Kernel = Kernel;

            window.testSearchService = function(wd) {
                //http://apis.map.qq.com/jsapi?qt=syn&wd=酒店&pn=0&rn=5&output=json&b=115.63160389892579,40.208203447043054,117.18273610107423,39.59982601642098&l=11&c=000000
                SearchService.search(wd, 11, 115.63160389892579, 40.208203447043054, 117.18273610107423, 39.59982601642098, function(response) {
                    console.table(response.detail.pois);
                });
            };

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