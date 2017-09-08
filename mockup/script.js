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
        'totalUsersEver': {
            'label': 'Total Users Ever',
            'stops': [0, 5, 15, 40, 100, 300]
        },
        'userCount': {
            'label': 'Total Users on Tile',
            'stops': [0, 20, 50, 100, 250, 600]
        }
    };


    var urlHash = window.location.hash;
    var appState = getObjectFromHash(urlHash);

    // Set personal token
    mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';

    // instantiate the "before" map
    var beforeMap = new mapboxgl.Map({
        container: 'before',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    // instantiate the "after" map
    var afterMap = new mapboxgl.Map({
        container: 'after',
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    // setup compare plugin with both maps
    var map = new mapboxgl.Compare(beforeMap, afterMap, {
        // Set this to enable comparing two maps by mouse movement:
        // mousemove: true
    });

    setupPopupHandler(beforeMap);
    setupPopupHandler(afterMap);

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

    beforeMap.on('moveend', function() {
        var center = beforeMap.getCenter();
        var lon = center.lng;
        var lat = center.lat;
        var zoom = beforeMap.getZoom();
        console.log('asdf', lon, lat, zoom);
        setHash({
            lon: lon,
            lat: lat,
            zoom: zoom
        });
    });

    /*
        Creates the click handler to show a popup

        @param {MapboxGL Map} Mapbox GL Map object on which to instantiate
    */
    function setupPopupHandler(mapObject) {
        var layers = Object.keys(zoomLevels);
        mapObject.on('click', function(e) {
            var features = mapObject.queryRenderedFeatures(e.point, {layers: layers})

            if (!features.length) { return };
            var jsonString = JSON.stringify(features[features.length-1].properties, null, 2);
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<pre>${jsonString}</pre>`)
                .addTo(mapObject);
        });
    }


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
        var queryParams = {};
        hash = hash.substring(1); // remove starting '#'
        var hashSplit = hash.split("?");
        var split = hash.split('&');
        for (var i = 0; i < split.length; i++) {
            var temp = split[i].split("=");
            if (temp.length == 2){
                queryParams[temp[0]] = temp[1];
            }
        }
        var defaults = {
            'lat': 0,
            'lon': 0,
            'zoom': 1,
            'startYear': '2010-Q1',
            'endYear': '2010-Q4',
            'filterProperty': 'totalUsersEver'
        };
        return Object.assign(defaults, queryParams);
    }


    /*
        Updates the current URL hash with properties passed in
    */
    function setHash(props) {
        var currentObj = getObjectFromHash(window.location.hash);
        var newObject = Object.assign(currentObj, props);
        window.location.hash = objectToHash(newObject);
    }


    /*
        Takes an object and returns a query-param style URL hash

        @param queryObj {Object} Object to be converted
        @returns {String} query-param style string that can be set as
            hash
    */
    function objectToHash(queryObj) {
        var paramsArray = [];
        for (var param in queryObj) {
            if (queryObj.hasOwnProperty(param) && queryObj[param]) {
                var s = param + '=' + queryObj[param];
                paramsArray.push(s);
            }
        }
        return paramsArray.join('&');
    }


    /*
        Returns the tile url for a year / quarter combination

        @param yearString {String} string like '2010-Q1'
        @returns {String} url to mapbox tileset
    */
    function getTileUrl(yearString) {
        return `mapbox://jenningsanderson.${yearString}-agg-v2`;
    }


    /*
        Loop to populate filter properties
    */
    $(document).ready(function (){
      var obj = filterProperties;
      var labels = Object.keys(obj)
        .map(e => filterProperties[e].label)
        .forEach (k => {
          var insertCheckbox = "<label class='radio-container color-white py3'>";
              insertCheckbox += "<input name='radio-basic' type='radio'>";
              insertCheckbox += "<div class='radio radio--white mr6'></div>";
              insertCheckbox += k;
              insertCheckbox += "</label>";
          $('.checkbox-wrapper').append(insertCheckbox);
      });
    });

    /*
        Add Start Year Options
    */
    $(document).ready(function(){
      var myDiv = document.getElementById('startYear');
      var selectList = document.createElement('select');
      $(selectList).addClass('select select--stroke select--stroke-lighten50 w-full my3');
      myDiv.appendChild(selectList);

      var optionList = document.createElement('option');
      optionList.value = appState.startYear;
      optionList.text = appState.startYear;

      selectList.appendChild(optionList);
      $(myDiv).append("<div class='select-arrow'></div>");
    })


    /*
        Add End Year Options
    */
    $(document).ready(function(){
      var myDiv = document.getElementById('endYear');
      var selectList = document.createElement('select');
      $(selectList).addClass('select select--stroke select--stroke-lighten50 w-full my3');
      myDiv.appendChild(selectList);

      var optionList = document.createElement('option');
      optionList.value = appState.endYear;
      optionList.text = appState.endYear;

      selectList.appendChild(optionList);
      $(myDiv).append("<div class='select-arrow'></div>");
    })

    /*
        Generate Gradient Legend
    */
    var gradient = [
        'rgba(255, 255, 255, 1)',
        'rgba(204, 204, 204, 1)',
        'rgba(170, 170, 170, 1)',
        'rgba(136, 136, 136, 1)',
        'rgba(68, 68, 68, 1)',
        'rgba(0, 0, 0, 1)'
      ];

      var gradientCss = '(left';
      var perc=0;
      for (var i = 0; i < gradient.length; ++i) {
          perc = perc+Math.random(1)*30+5;
          gradientCss += ',' + gradient[i] + ' ' + perc + "%"  ;
      }
      gradientCss += ')';

      $('#legend-gradient').css('background', '-webkit-linear-gradient' + gradientCss);
      $('#legend-gradient').css('background', '-moz-linear-gradient' + gradientCss);
      $('#legend-gradient').css('background', '-o-linear-gradient' + gradientCss);


})();
