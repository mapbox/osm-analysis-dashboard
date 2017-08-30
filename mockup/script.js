// Set personal token
mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';

// Create instance of GL map
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
    center: [77.5943, 12.975], // starting position [lng, lat]
    zoom: 12 // starting zoom
});

map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
}), 'top-left');
