(function() {

  // instantiate the "main" map
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [appState.lon, appState.lat],
    zoom: appState.zoom,
  });

  // Add geocoder
  var geocoder = new MapboxGeocoder({
     accessToken: mapboxgl.accessToken
  });

  $('#geocoder').append(geocoder.onAdd(map));

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
  });

  updateLegendLabels(appState);

  setupPopupHandler(map);

  map.once('load', function() {

    map.addSource('beforesource', {
        type: 'vector',
        url: getTileUrl(appState.year)
    });
    var mapLayers = getAllLayers('beforesource', appState.filterProperty, zoomLevels);
    mapLayers.forEach(function(layer) {
      map.addLayer(layer, 'place-islands');
    });
  });

  map.on('moveend', function() {
    var center = map.getCenter();
    var lon = center.lng;
    var lat = center.lat;
    var zoom = map.getZoom();
    setHash({
      lon: lon,
      lat: lat,
      zoom: zoom
    });
  });

  map.on('zoomend',function(){
    updateLegendAxis(appState.filterProperty, map.getZoom())
  })

    $(document).ready(function() {
      $('#filterBtn').click(function() {
        var params = {
          'year': $('#year').find('select').val(),
          'filterProperty': $('[name=filter-property]:selected').val()
        };
        setHash(params);
        location.reload();
      });
    });


    /*
        Creates a hover handler to show a popup on hover

        @param {MapboxGL Map} Mapbox GL Map object on which to instantiate
    */
    function setupPopupHandler(mapObject) {
        var feat;
        var layers = Object.keys(zoomLevels);

        mapObject.on('mousemove', function(e) {
            var features = mapObject.queryRenderedFeatures(e.point, {layers: layers})
            if(!features.length) {
                // Remove hand pointer & popup
                mapObject.getCanvas().style.cursor = '';
                popup.remove();
                return ;
            } else if (features.length==1){
              feat = features[0];
            } else {
              var l = features[0].properties.quadkey.length;
              var idx = 0;
              for(var i in features){
                if (features[i].properties.quadkey.length > l){
                  l = features[i].properties.quadkey.length;
                  idx = i;
                }
              }
              feat = features[idx];
            }
            // Change the cursor style as a UI indicator.
            mapObject.getCanvas().style.cursor = 'pointer';

            // if(!(feat.layer.source === lastSourceHoveredOn)) {
            //     popup.remove();
            // }

            // Show popup where the mouse is, with selected filter property
            var msgHTML = "<strong>"+filterProperties[appState.filterProperty].label+"</strong>: "
                          +feat.properties[appState.filterProperty];
                          //Add the line below to debug no. of tiles
                          //+"<br>"+features.length+" tiles.";
            popup.setLngLat(e.lngLat)
                 .setHTML(msgHTML)
                 .addTo(mapObject);
            //lastSourceHoveredOn = feat.layer.source;
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
                    'fill-opacity': 1
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
            var value = baseValue * filterProperties[filter].zoomScalars[zoomStrToScalarIndex(zoomLevel)];
            var color = colorStops[i];
            stops.push([value, color]);
        }

        return stops;

    }

    function getFilters(filter){
      return ['has',filter]
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
    $(document).ready(function () {
        var obj = filterProperties;
        var labels = Object.keys(obj);
        var values = labels.map ( e => {return { value: e, label: filterProperties[e].label, desc: filterProperties[e].desc}});

        $('.filter-wrapper').append(
            $('<select/>')
                .addClass('select select--stroke select--stroke-lighten50 w-full my3 select--s py3')
                .each( function () {

                values.forEach ( k => {
                    if (appState.filterProperty) {
                      var selected = (appState.filterProperty === k.value) ? 'selected' : '';
                    } else {
                      var selected = '';
                    }
                    $(this).append(
                        `<option name='filter-property' ${selected} value="${k.value}" data-description="${k.desc}">${k.label}</option>`
                    )
                })
            })
        )
        .append (
            $('<div class="select-arrow"></div>')
        )

        $('#filter-description').html( `<p class="mt3 prose color-white txt txt-s" id="ptext">${filterProperties[appState.filterProperty].desc}</p>`)
})




    /*
        Date Range
    */
    $(document).ready(function(){
        let dateRange = {
            2008: ['Q2','Q4'],
            2009: ['Q2','Q4'],
            2010: ['Q2','Q4'],
            2012: ['Q2','Q4'],
            2013: ['Q2','Q4'],
            2014: ['Q2','Q4'],
            2015: ['Q2','Q4'],
            2016: ['Q2','Q4'],
            2017: ['Q1']//,'Q2']
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

      //kind of hacky, but better than setting on map.on('moveend')
      $('#osm-link').on('mousedown',function(e){
        this.href = `http://www.openstreetmap.org/#map=${Math.floor(appState.zoom)}/${appState.lat}/${appState.lon}`
      })

      // Real Time loading of description and change button color on option change
      $('.filter-wrapper .select').change(function(){
          var $selected = $(this).find(':selected');
          $('#ptext').html($selected.data('description'));

      })

      $('.select').change(function(){
          $('#filterBtn').addClass('bg-green-light');
      })
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
      $('#before-label').text(props.year);

      //Labels in Legend
      var currentFilter = filterProperties[props.filterProperty];
      $('#legend-property').text(currentFilter.label);
      updateLegendAxis(props.filterProperty, props.zoom);
  }

  function updateLegendAxis(filterProperty, zoom){
    var curFilter = filterProperties[filterProperty];
    //console.warn(curFilter.stops[5]*curFilter.zoomScalars[zoomToScalarIndex(zoom)])
    $('#legend-low').text(curFilter.stops[0]*curFilter.zoomScalars[zoomToScalarIndex(zoom)] );
    $('#legend-mid').html(curFilter.stops[3]*curFilter.zoomScalars[zoomToScalarIndex(zoom)] + "<br>" +(curFilter.units||""));
    $('#legend-high').text(curFilter.stops[5]*curFilter.zoomScalars[zoomToScalarIndex(zoom)]+"+");
  }

  /*
    Load all layers to the background for map.querySourceFeatures() to works
  */
  var loadAllLayersToBackground = function(){
    console.warn('Adding all sources: ')

    for(year in ACTIVE_QUARTERS){
      console.log(year, ACTIVE_QUARTERS[year])
      map.addSource(ACTIVE_QUARTERS[year], {
        type: 'vector',
        url: getTileUrl(ACTIVE_QUARTERS[year])
      });

      //Then add all of the layers for this source
      var mapLayers = getAllLayers(ACTIVE_QUARTERS[year], appState.filterProperty, zoomLevels);
      mapLayers.forEach(function(layer) {
        layer.id = ACTIVE_QUARTERS[year] + layer.id;
        map.addLayer(layer);
        map.setPaintProperty(layer.id, 'fill-opacity', 0);
      });
    }
  }
  map.once('load',function(){
    loadAllLayersToBackground()
  })

  /*
      Query for the surrounding data in the tiles
  */
  $('#query-years').on('click',function(){
    console.warn('Querying other years for these details')

    //Query soure features doesn't work unless the features are actually 'visible' on the map;
    var relatedFeatures;
    var results = []
    for (var i in ACTIVE_QUARTERS){
      console.log('querying for: ',ACTIVE_QUARTERS[i])
      relatedFeatures = map.querySourceFeatures(ACTIVE_QUARTERS[i], {
        sourceLayer: lookupActiveLayerFromZoom(map.getZoom()),
        filter: getFilters(appState.filterProperty)
      });

      var average = _.mean(relatedFeatures.map(function(x){
        return x.properties[appState.filterProperty]
      }))
      results.push({q: ACTIVE_QUARTERS[i], 'avg': Number(average)})
    }
    console.log(results)
    createAvgBarChart(results,"#avgBarChart")
  })



})();
