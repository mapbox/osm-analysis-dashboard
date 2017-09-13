/*
  Moving these out of script.js to keep things simpler.
*/
var filterProperties = {
    'allUsersToDate': {
        'label': 'Total Users to Date',
        'stops': [0, 5, 15, 40, 100, 300]
    },
    'editCount': {
        'label': 'Edited Objects',
        'stops': [0, 20, 50, 100, 250, 600]
    },
    'namedHighwayDensity':{
      'label' : 'Named Highway Density',
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalers' : [1,1,1,1,1,1] // This is an averaged property, not a summed property.
    }
};

var zoomLevels = {
    'z8': {
        'minzoom': 0,
        'maxzoom': 4.01,
    },
    'z10': {
        'minzoom': 4,
        'maxzoom': 6.01,
    },
    'z12': {
        'minzoom': 6,
        'maxzoom': 9.01,
    },
    'z15': {
        'minzoom': 9,
        'maxzoom': 23,
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
