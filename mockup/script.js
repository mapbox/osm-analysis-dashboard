(function() {

    var zoomLevels = {
        'z8': {
            'minzoom': 0,
            'maxzoom': 4.01,
            'multiplier': 64 * 16 * 16
        },
        'z10': {
            'minzoom': 4,
            'maxzoom': 6.01,
            'multiplier': 64 * 16
        },
        'z12': {
            'minzoom': 6,
            'maxzoom': 9.01,
            'multiplier': 64
        },
        'z15': {
            'minzoom': 9,
            'maxzoom': 23,
            'multiplier': 1
        }
    };

    var colorStops = [
        '#fff',
        '#ccc',
        '#aaa',
        '#888',
        '#444',
        '#000'
    ];

    var filterProperties = {
        'editCount': {
            'label': 'Total Edit Count',
            'stops': [0, 100, 500, 1500, 2500, 8000]
        },
        'editedBuildings': {
            'label': 'Total Buildings Edited',
            'stops': [0, 80, 250, 500, 1000, 5000]
        }
    };

    var urlHash = window.location.hash;
    var appState = getObjectFromHash(urlHash);

    // Set personal token
    mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';

    // instantiate the "before" map
    window.beforeMap = new mapboxgl.Map({
        container: 'before',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    // instantiate the "after" map
    var afterMap = new mapboxgl.Map({
        container: 'after',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    // setup compare plugin with both maps
    var map = new mapboxgl.Compare(beforeMap, afterMap, {
        // Set this to enable comparing two maps by mouse movement:
        // mousemove: true
    });

    beforeMap.once('load', function() {
        beforeMap.addSource('beforesource', {
            type: 'vector',
            url: getTileUrl(appState.startYear)
        });
        var beforeLayers = getAllLayers('beforesource', appState.filterProperty, zoomLevels);
        beforeLayers.forEach(function(layer) {
            beforeMap.addLayer(layer);
        });
    });

    afterMap.once('load', function() {
        afterMap.addSource('aftersource', {
            type: 'vector',
            url: getTileUrl(appState.endYear)
        });
        var afterLayers = getAllLayers('aftersource', appState.filterProperty, zoomLevels);
        afterLayers.forEach(function(layer) {
            afterMap.addLayer(layer);
        });
    });

    


    /*
        Get JSON for all layers that can be added to the map per zoom level

        @param source {String} source eg. 'beforesource'
        @param filter {String} filter property, eg. 'editCount'
        @param zooms {Object} zoom levels
        @returns {Array} Array of layer objects that can be added to the map
    */
    function getAllLayers(source, filter, zooms) {
        return Object.keys(zooms).map(function(zoomLevel) {
            return {
                'id': zoomLevel,
                'type': 'fill',
                'source': source,
                'source-layer': 'layer=' + zoomLevel,
                'minzoom': zoomLevels[zoomLevel].minzoom,
                'maxzoom': zoomLevels[zoomLevel].maxzoom,
                'paint': {
                    'fill-color': {
                        'property': filter,
                        'stops': getStops(filter, zoomLevel)
                    },
                    'fill-opacity': 1
                }
            }
        });
    }


    /*
        Returns stops for a filter and zoom level

        @param filter {String} filterProperty eg. editCount
        @param zoomLevel {String} zoom level, eg. z12
        @returns {Array} Stop values
    */
    function getStops(filter, zoomLevel) {
        var stops = [];
        for (var i = 0; i < 6; i++) {
            var baseValue = filterProperties[filter].stops[i];
            console.log('base value', baseValue);
            var value = baseValue * zoomLevels[zoomLevel].multiplier;
            var color = colorStops[i];
            stops.push([value, color]);
        }
        return stops;
    }

    /*
        Returns a JSON object after parsing a querystring

        @param hash {String} string representing query-string to parse
        @returns {JSON} object with key-value pairs
    */
    function getObjectFromHash(hash) {
        // TODO: actually write / steal this function,
        // currently just return a default object
        return {
            'lat': 0,
            'lon': 0,
            'zoom': 1,
            'startYear': '2010-Q1',
            'endYear': '2010-Q4',
            'filterProperty': 'editCount'
        };
    }

    /*
        Returns the tile url for a year / quarter combination

        @param yearString {String} string like '2010-Q1'
        @returns {String} url to mapbox tileset
    */
    function getTileUrl(yearString) {
        return `mapbox://jenningsanderson.${yearString}-agg`;
    }

})();




// (function() {



//     //FIXME: we should not need this silly random generator or this global
//     // I just couldn't figure out how to remove layers from the map.
//     var currentLayerId = generateRandomId();
//     function generateRandomId() {
//         return 'tileset-' + Math.ceil(Math.random() * 10000); 
//     }

//     /*
//         Gets JSON for layer to add to the map

//         @param zoom {Float}
//         @param year {String} eg. 2010-Q1
//         @param filterProperty {String} eg. editCount
//         @returns {JSON} JSON for layer object
//     */
//     function getLayer(zoom, year, filterProperty) {
//         var tileset = 'mapbox://jenningsanderson.' + year + '-agg';
//         var sourceLayer = getSourceLayerForZoom(zoom);
//         return {
//             id: 'tileset',
//             type: 'fill',
//             'source-layer': sourceLayer,
//             source: {
//                 'type' : 'vector',
//                 'url' : tileset
//             },
//             paint : {
//                 'fill-color' : {
//                     'property': filterProperty,

//                     //TODO: get stops from configuration per property
//                     'stops': [
//                         [0, '#fff'],
//                         [500, '#ccc'],
//                         [1000, '#999'],
//                         [2500, '#666'],
//                         [5000, '#000'],
//                         [25000, '#f00']
//                     ]
//                 },
//                 'fill-opacity' : 1
//             }        
//         };
//     }

//     /*
//         Takes a zoom level and returns which layer of the tileset to use

//         @param zoom {Float}
//         @returns {String} eg. "layer=z12"
//     */
//     function getSourceLayerForZoom(zoom) {
//         var prefix = 'layer=z';
//         if (zoom > 9) {
//             return prefix + '15';
//         }
//         if (zoom > 6) {
//             return prefix + '12';
//         }
//         if (zoom > 4) {
//             return prefix + '10';
//         }
//         return prefix + '8';
//     }

//     /*
//         Returns a JSON object after parsing a querystring

//         @param hash {String} string representing query-string to parse
//         @returns {JSON} object with key-value pairs
//     */
//     function getObjectFromHash(hash) {
//         // TODO: actually write / steal this function,
//         // currently just return a default object
//         return {
//             'lat': 0,
//             'lon': 0,
//             'zoom': 1,
//             'startYear': '2010-Q1',
//             'endYear': '2010-Q4',
//             'filterProperty': 'editCount'
//         };
//     }

//     var urlHash = window.location.hash;
//     var appState = getObjectFromHash(urlHash);

//     /*
//         Refreshes layers on both maps based on state passed in

//         @param state {Object} needs zoom, startYear, endYear and filterProperty properties
//         @returns {undefined} refreshes both maps
//     */
//     function refreshBothMaps(state) {
//         var newLayerId = generateRandomId();
//         var beforeLayer = getLayer(state.zoom, state.startYear, state.filterProperty);
//         var afterLayer = getLayer(state.zoom, state.startYear, state.filterProperty);
//         beforeLayer.id = newLayerId;
//         afterLayer.id = newLayerId;
//         if (beforeMap.getLayer('tileset')) {
//             console.log('removing layer');
//             beforeMap.removeLayer(currentLayerId);
//         }
//         if (afterMap.getLayer('tileset')) {
//             console.log('removing layer');
//             afterMap.removeLayer(currentLayerId);
//         }
//         setTimeout(function() { beforeMap.addLayer(beforeLayer) }, 2500);
//         setTimeout(function() { afterMap.addLayer(afterLayer); }, 2500);
//     }

//     // Set personal token
//     mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';

//     var beforeMap = new mapboxgl.Map({
//         container: 'before',
//         style: 'mapbox://styles/mapbox/light-v9',
//         center: [appState.lon, appState.lat],
//         zoom: appState.zoom
//     });

//     var afterMap = new mapboxgl.Map({
//         container: 'after',
//         style: 'mapbox://styles/mapbox/light-v9',
//         center: [appState.lon, appState.lat],
//         zoom: appState.zoom
//     });

//     var map = new mapboxgl.Compare(beforeMap, afterMap, {
//         // Set this to enable comparing two maps by mouse movement:
//         // mousemove: true
//     });

//     beforeMap.addControl(new MapboxGeocoder({
//         accessToken: mapboxgl.accessToken
//     }), 'top-left');

//     beforeMap.on('load', function() {
//         var layer = getLayer(appState.zoom, appState.startYear, appState.filterProperty);
//         beforeMap.addLayer(layer);
//     });

//     beforeMap.on('zoomend', function() {
//         var zoom = beforeMap.getZoom();
//         appState.zoom = zoom;
//         refreshBothMaps(appState);
//     });

//     afterMap.on('load', function() {
//         var layer = getLayer(appState.zoom, appState.startYear, appState.filterProperty);
//         afterMap.addLayer(layer);
//     });

// })();

