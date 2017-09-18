/*
  Moving these out of script.js to keep things simpler.
*/
var filterProperties = {
    'allUsersToDate': {
        'label': 'Total Users to Date',
        'desc' : "The total number of unique contributors that have ever been active in an area.",
        'stops': [0, 5, 15, 40, 100, 300],
        'zoomScalars' : [1,1,1,1,1,1] // This is an averaged property, not a summed property.
    },
    'usersOnTile': {
        'label': 'Users active per quarter',
        'desc' : "The total number of unique contributors active during the given time period being shown.",
        'stops': [0,10,20,30,40,50],
        'zoomScalars': [1,1,1,1,1,1]
    },
    'editCount': {
        'label': 'Edited Objects',
        'desc' : "Number of edits to the map in a given quarter.",
        'stops': [0, 20, 50, 100, 250, 600],
        'zoomScalars' : [1,1,1,1,1,1] // This is a summed property, not averaged or Normalized
    },
    'namedHighwayDensity':{
      'label' : 'Named Highway Density',
      'desc'  : "Kilometers of road that contain a <code>name</code> attribute.",
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalars' : [1,1,1,1,1,1] // This is an averaged property, not a summed property.
    }
};

var zoomLevels = {
    'z8': {
        'minZoom': 0,
        'maxZoom': 4.01,
    },
    'z10': {
        'minZoom': 4,
        'maxZoom': 6.01,
    },
    'z12': {
        'minZoom': 6,
        'maxZoom': 9.01,
    },
    'z15': {
        'minZoom': 9,
        'maxZoom': 23,
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
/*
var colorStops = [
    'rgba(255,255,255,0.8)',
    'rgba(200,200,200,0.8)',
    'rgba(150,150,150,0.8)',
    'rgba(100,100,100,0.8)',
    'rgba(50,50,50,0.8)',
    'rgba(0,0,0,0.8)'
];
*/
