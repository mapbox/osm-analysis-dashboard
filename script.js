(function() {
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
        style: 'mapbox://styles/mapbox/light-v9',
        center: [appState.lon, appState.lat],
        zoom: appState.zoom
    });

    // setup compare plugin with both maps
    var map = new mapboxgl.Compare(beforeMap, afterMap, {
        // Set this to enable comparing two maps by mouse movement:
        // mousemove: true
    });

    // Add geocoder
    //var geocoder = new MapboxGeocoder({
    //    accessToken: mapboxgl.accessToken
    //});

    //$('#geocoder').append(geocoder.onAdd(beforeMap));

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    var lastSourceHoveredOn = "none";

    updateLegendLabels(appState);

    setupPopupHandler(beforeMap);
    setupPopupHandler(afterMap);

    beforeMap.once('load', function() {
        beforeMap.addSource('beforesource', {
            type: 'vector',
            url: getTileUrl(appState.startYear)
        });
        var beforeLayers = getAllLayers('beforesource', appState.filterProperty, zoomLevels);
        beforeLayers.forEach(function(layer) {
            beforeMap.addLayer(layer, 'place-islands');
        });
    });

    afterMap.once('load', function() {
        afterMap.addSource('aftersource', {
            type: 'vector',
            url: getTileUrl(appState.endYear)
        });
        var afterLayers = getAllLayers('aftersource', appState.filterProperty, zoomLevels);
        afterLayers.forEach(function(layer) {
            afterMap.addLayer(layer, 'place-islands');
        });
    });

    beforeMap.on('moveend', function() {
        var center = beforeMap.getCenter();
        var lon = center.lng;
        var lat = center.lat;
        var zoom = beforeMap.getZoom();
        setHash({
            lon: lon,
            lat: lat,
            zoom: zoom
        });
    });

    $(document).ready(function() {
        $('#filterBtn').click(function() {
            var params = {
                'startYear': $('#startYear').find('select').val(),
                'endYear': $('#endYear').find('select').val(),
                'filterProperty': $('[name=filter-property]:radio:checked').val()
            };
            setHash(params);
            location.reload();
        });
    });

    /*
        Creates the click handler to show a popup

        @param {MapboxGL Map} Mapbox GL Map object on which to instantiate
    */

    //Commenting out the clickable popup code

    /*
    function setupPopupHandler(mapObject) {
        var feat;
        var layers = Object.keys(zoomLevels);
        mapObject.on('click', function(e) {
            var features = mapObject.queryRenderedFeatures(e.point, {layers: layers})

            if (!features.length) { return };
            if (features.length==1){
              feat = features[0]
            }else{
              var l = features[0].properties.quadkey.length;
              var idx = 0;
              for(var i in features){
                if (features[i].properties.quadkey.length > l){
                  l = features[i].properties.quadkey.length;
                  idx = i;
                }
              }
              feat = features[idx]
            }
            var jsonString = JSON.stringify(feat.properties, null, 2);
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<pre>${jsonString}</pre>`)
                .addTo(mapObject);
        });
    }*/

    /*
        Creates a hover handler to show a popup on hover

        @param {MapboxGL Map} Mapbox GL Map object on which to instantiate
    */
    function setupPopupHandler(mapObject) {
        var feat;
        var layers = Object.keys(zoomLevels);

        mapObject.on('mousemove', function(e) {
            var features = mapObject.queryRenderedFeatures(e.point, {layers: layers})
            var featureNames = "";
            if(!features.length) {
                // Remove hand pointer & popup
                mapObject.getCanvas().style.cursor = '';
                popup.remove();
                return ;
            } else if (features.length==1){
              feat = features[0];
              featureNames = features[0].properties.quadkey;
            } else {
              var l = features[0].properties.quadkey.length;
              var idx = 0;              
              for(var i in features){
                var k=features[i].properties.quadkey;
                console.log(k);
                featureNames=(featureNames==='')? k: featureNames+", <br>"+k;
                if (features[i].properties.quadkey.length > l){
                  l = features[i].properties.quadkey.length;
                  idx = i;
                }
              }
              feat = features[idx];
            }
            // Change the cursor style as a UI indicator.
            mapObject.getCanvas().style.cursor = 'pointer';

            if(!(feat.layer.source === lastSourceHoveredOn)) {
                popup.remove();
            }

            // Show popup where the mouse is, with selected filter property
            var msgHTML = "<strong>"+filterProperties[appState.filterProperty].label+"</strong>: "
                          +feat.properties[appState.filterProperty]
                          +"<br>"+features.length+" tiles: <br>"+featureNames;
            popup.setLngLat(e.lngLat)
                 .setHTML(msgHTML)
                 .addTo(mapObject);
            lastSourceHoveredOn = feat.layer.source;
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
                'minzoom': zoomLevels[zoomLevel].minZoom,
                'maxzoom': zoomLevels[zoomLevel].maxZoom,
                'paint': {
                    'fill-color': {
                        'property': filter,
                        'stops': getStops(filter, zoomLevel)
                    },
                    'fill-opacity': (source === 'beforesource')? 0.5 : 1
                },
                'filter': getFilters(filter)
            };
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
            var value = baseValue * filterProperties[filter].zoomScalars[i];
            var color = colorStops[i];
            stops.push([value, color]);
        }
        return stops;
    }

    function getFilters(filter){
      return ['has',filter]
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
            'filterProperty': 'allUsersToDate'
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
                if ($.isNumeric(queryObj[param])){
                  queryObj[param] = Number(queryObj[param]).toFixed(3)
                }
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
        return `mapbox://jenningsanderson.${yearString}-agg`;
    }


    /*
        Loop to populate filter properties
    */
    $(document).ready(function (){
      var obj = filterProperties;
      var labels = Object.keys(obj)
        .map(e => { return { value: e, label: filterProperties[e].label, desc: filterProperties[e].desc }})
        .forEach (k => {
          if (appState.filterProperty) {
            var checked = appState.filterProperty === k.value ? 'checked' : '';
          } else {
            var checked = '';
          }
          // console.log(k)
          var insertCheckbox = `<label class='radio-container color-white py3'>
                                <input name='filter-property' ${checked} value='${k.value}' type='radio'>
                                <div class='radio radio--white mr6'></div>
                                ${k.label}
                              </label>
                              <p class="ml12 prose color-white txt txt-xs">${k.desc}</p>`
          $('.checkbox-wrapper').append(insertCheckbox);
      });
    });

    /*
        Date Range
    */
    $(document).ready(function(){
        let dateRange = {
            2010: ['Q1','Q2','Q3','Q4'],
            //2011: ['Q1','Q2','Q3','Q4'],
            //2012: ['Q1','Q2','Q3','Q4'],
            //2013: ['Q1','Q2','Q3','Q4'],
            //2014: ['Q1','Q2','Q3','Q4'],
            //2015: ['Q1','Q2','Q3','Q4'],
            2016: [/*'Q1','Q2',*/'Q3','Q4'],
            2017: ['Q1','Q2']//,'Q3']
        };

        $('.date-range').each(function() {
            var $this = $(this);
            var thisId = $this.attr('id');
            $this.append(
                $('<select/>')
                    .addClass('select select--stroke select--stroke-lighten50 w-full my3')
                    .each(function(){
                        var keyNames = Object.keys(dateRange);
                        for (var i in keyNames) {
                            for (var j = 0; j<dateRange[keyNames[i]].length; j++){
                                var optionValue = `${keyNames[i]}-${dateRange[keyNames[i]][j]}`
                                $(this).append(
                                    `<option value='${optionValue}'>${optionValue}</option>`);
                            }
                        }
                    })
                )
                .append (
                    $('<div class="select-arrow"></div>')
                );
            var currYear = appState[thisId] || null;
            if (currYear) {
                $this.find('select').val(currYear);
            }

        });

        // $('.date-range')

        })

    /*
        Generate Gradient Legend
    */
    function generateLegend(a, b) {
        var legend = {
            colorStops: [
                00,
                20,
                40,
                60,
                80,
                100
            ],
            colorPallete: [
                '#f0f9e8',
                '#ccebc5',
                '#a8ddb5',
                '#7bccc4',
                '#43a2ca',
                '#0868ac'
            ]
        };

        var gradientCss = '(left';

        for (var i = 0; i < legend.colorPallete.length; ++i) {
            gradientCss += ',' + legend.colorPallete[i] + ' ' + legend.colorStops[i] + "%"  ;
            $('#legend-gradient').css('background', '-webkit-linear-gradient' + gradientCss);
            $('#legend-gradient').css('background', '-moz-linear-gradient' + gradientCss);
            $('#legend-gradient').css('background', '-o-linear-gradient' + gradientCss);
        }
        gradientCss += ')';
    }
    generateLegend();

    /*
        Update the label for the two maps
        And the legend title
    */
    function updateLegendLabels(props) {
        //Labels on top of the map
        $('#before-label').text(props.startYear);
        $('#after-label').text(props.endYear);

        //Labels in Legend
        var currentFilter = filterProperties[props.filterProperty];
        $('#legend-property').text(currentFilter.label);
        $('#legend-low').text(currentFilter.stops[0]);
        $('#legend-high').text(currentFilter.stops[5]+"+");
    }
})();
