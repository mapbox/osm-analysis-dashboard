/*
  Moving these out of script.js to keep things simpler.
*/
var filterProperties = {
    'allUsersToDate': {
        'label': 'Total Users to Date',
        'desc' : "The total number of unique contributors that have ever been active in an area.",
        'stops': [0, 5, 20, 50, 100, 1000],
        'zoomScalars' : [1,1.25,1.5,2] //This is a unique count property
    },
    'usersOnTile': {
        'label': 'Users active per quarter',
        'desc' : "The total number of unique contributors active during the given time period being shown.",
        'stops': [0,10,20,30,40,50],
        'zoomScalars': [1,2,3,4] //Also a unique count property
    },
    'editCount': {
        'label': 'Edited Objects',
        'desc' : "Number of objects edited on the map in a given quarter.",
        'stops': [0, 25, 50, 100, 500, 1000],
        'zoomScalars' : [1,2,4,8] // This is a summed property, not averaged or Normalized
    },
    'namedHighwayLength_normAggArea':{
      'label' : 'Named Highway Density',
      'desc'  : "Kilometers of road that contain a <code>name</code> attribute, normalized by square kilometer (km of highway per square kilometer of map area)",
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalars' : [1,1,1,1], // This is a continually normalized property.
      'units' : 'km / sq.km.'

    },
    'buildingCount_normAggArea':{
      'label' : 'Building Density',
      'desc'  : "Number of buildings, normalized by square kilometer (km of buildings per square kilometer of map area)",
      'stops' : [0, 100, 500, 1000, 3000, 5000],
      'zoomScalars' : [1,0.75,0.5,0.25], //
      'units' : 'buildings per sq.km'
    }
};

/*
  Helper Vars and Functions for variable color ramps based on zoom
                    z0 - z5 (z8) z6,z7(z10) z8,z9,z10(z12) z11+(z15)   */
var zoomScalarMatch =[3,3,3,3,3,  2,2,       1,1,1,         0,0,0,0,0,0,0]
var zoomScalarMatchFromStr = {
  'z8':3,'z10':2,'z12':1,'z15':0
}
var zoomStrToScalarIndex = function(str){
  return zoomScalarMatchFromStr[str];
}
var zoomToScalarIndex = function(zoom){
  return zoomScalarMatch[Math.floor(zoom)];
}

var zoomLevels = {
    'z8': {
        'minZoom': 0,
        'maxZoom': 5,
    },
    'z10': {
        'minZoom': 5,
        'maxZoom': 7,
    },
    'z12': {
        'minZoom': 7,
        'maxZoom': 10,
    },
    'z15': {
        'minZoom': 10,
        'maxZoom': 23,
    }
};

var colorStops = [
    '#f0f9e8',
    '#ccebc5',
    '#a8ddb5',
    '#7bccc4',
    '#43a2ca',
    '#0868ac'
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
