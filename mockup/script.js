// Set personal token
mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';


var beforeMap = new mapboxgl.Map({
    container: 'before',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [0, 0],
    zoom: 0
});

var afterMap = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [0, 0],
    zoom: 0
});

var map = new mapboxgl.Compare(beforeMap, afterMap, {
    // Set this to enable comparing two maps by mouse movement:
    // mousemove: true
});

beforeMap.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
}), 'top-left');

beforeMap.on('load', function() {
    var layer1 = beforeMap.addLayer({
        id: 'testBefore',
        type: 'fill',
        'source-layer': 'layer=z12',
        source: {
            'type' : 'vector',
            'url' : 'mapbox://jenningsanderson.2010-Q1-agg',
        },
        paint : {
            'fill-color' : '#0044b2',
            'fill-opacity' : 1
        }
    });
});


