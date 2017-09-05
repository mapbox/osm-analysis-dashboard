(function() {



    //FIXME: we should not need this silly random generator or this global
    // I just couldn't figure out how to remove layers from the map.
    var currentLayerId = generateRandomId();
    function generateRandomId() {
        return 'tileset-' + Math.ceil(Math.random() * 10000); 
    }

    /*
        Gets JSON for layer to add to the map

        @param zoom {Float}
        @param year {String} eg. 2010-Q1
        @param filterProperty {String} eg. editCount
        @returns {JSON} JSON for layer object
    */
    function getLayer(zoom, year, filterProperty) {
        var tileset = 'mapbox://jenningsanderson.' + year + '-agg';
        var sourceLayer = getSourceLayerForZoom(zoom);
        return {
            id: 'tileset',
            type: 'fill',
            'source-layer': sourceLayer,
            source: {
                'type' : 'vector',
                'url' : tileset
            },
            paint : {
                'fill-color' : {
                    'property': filterProperty,

                    //TODO: get stops from configuration per property
                    'stops': [
                        [0, '#fff'],
                        [500, '#ccc'],
                        [1000, '#999'],
                        [2500, '#666'],
                        [5000, '#000'],
                        [25000, '#f00']
                    ]
                },
                'fill-opacity' : 1
            }        
        };
    }

    /*
        Takes a zoom level and returns which layer of the tileset to use

        @param zoom {Float}
        @returns {String} eg. "layer=z12"
    */
    function getSourceLayerForZoom(zoom) {
        var prefix = 'layer=z';
        if (zoom > 9) {
            return prefix + '15';
        }
        if (zoom > 6) {
            return prefix + '12';
        }
        if (zoom > 4) {
            return prefix + '10';
        }
        return prefix + '8';
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

    var urlHash = window.location.hash;
    var appState = getObjectFromHash(urlHash);

    /*
        Refreshes layers on both maps based on state passed in

        @param state {Object} needs zoom, startYear, endYear and filterProperty properties
        @returns {undefined} refreshes both maps
    */
    function refreshBothMaps(state) {
        var newLayerId = generateRandomId();
        var beforeLayer = getLayer(state.zoom, state.startYear, state.filterProperty);
        var afterLayer = getLayer(state.zoom, state.startYear, state.filterProperty);
        beforeLayer.id = newLayerId;
        afterLayer.id = newLayerId;
        if (beforeMap.getLayer('tileset')) {
            console.log('removing layer');
            beforeMap.removeLayer(currentLayerId);
        }
        if (afterMap.getLayer('tileset')) {
            console.log('removing layer');
            afterMap.removeLayer(currentLayerId);
        }
        setTimeout(function() { beforeMap.addLayer(beforeLayer) }, 2500);
        setTimeout(function() { afterMap.addLayer(afterLayer); }, 2500);
    }

    // Set personal token
    mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';

    var beforeMap = new mapboxgl.Map({
        container: 'before',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    var afterMap = new mapboxgl.Map({
        container: 'after',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    var map = new mapboxgl.Compare(beforeMap, afterMap, {
        // Set this to enable comparing two maps by mouse movement:
        // mousemove: true
    });

    beforeMap.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }), 'top-left');

    beforeMap.on('load', function() {
        var layer = getLayer(appState.zoom, appState.startYear, appState.filterProperty);
        beforeMap.addLayer(layer);
    });

    beforeMap.on('zoomend', function() {
        var zoom = beforeMap.getZoom();
        appState.zoom = zoom;
        refreshBothMaps(appState);
    });

    afterMap.on('load', function() {
        var layer = getLayer(appState.zoom, appState.startYear, appState.filterProperty);
        afterMap.addLayer(layer);
    });

})();

