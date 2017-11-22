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
    'motorwayLength_normAggArea':{
      'label' : 'Highway Density',
      'desc'  : "Kilometers of roads (motorways), normalized by square kilometer (km of highway per square kilometer of map area)",
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalars' : [1,1,1,1], // This is a continually normalized property.
      'units' : 'km / sq.km.'
    },
    'unclassifiedLength_normAggArea':{
      'label' : 'Unclassified Highway Density',
      'desc'  : "Kilometers of highways without classification, normalized by square kilometer (km of highway per square kilometer of map area)",
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalars' : [1,1,1,1], // This is a continually normalized property.
      'units' : 'km / sq.km.'
    },
    'editedHighwayKM':{
      'label' : 'Edited KM of Highway',
      'desc'  : "Kilometers of highway tags that were edited in during this quarter",
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalars' : [1,64,256,512],
      'units' : 'km'
    },
    'newHighwayKM':{
      'label' : 'New KM of Highway',
      'desc'  : "Kilometers of highway tags that were created (version=1) this quarter",
      'stops' : [0, 1, 2, 4, 8, 16],
      'zoomScalars' : [1,64,256,512], // This is a continually normalized property.
      'units' : 'km'
    },
    'buildingCount_normAggArea':{
      'label' : 'Building Density',
      'desc'  : "Number of buildings, normalized by square kilometer (km of buildings per square kilometer of map area)",
      'stops' : [0, 100, 500, 1000, 3000, 5000],
      'zoomScalars' : [1,0.75,0.5,0.25], //
      'units' : 'buildings per sq.km'
    },
    'newBuildings':{
      'label' : 'New Buildings',
      'desc'  : "Number of buildings added to the map",
      'stops' : [0, 100, 500, 1000, 3000, 5000],
      'zoomScalars' : [1,8,16,32], //
      'units' : 'Buildings'
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

var lookupActiveLayerIDFromZoom = function(zoom){
  if (zoom < 5){
    return 'z8'
  }else if (zoom < 7){
    return 'z10'
  }else if (zoom < 10){
    return 'z12'
  }else{
    return 'z15'
  }
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

var ACTIVE_QUARTERS = [
//  '2006-Q1','2006-Q2','2006-Q3','2006-Q4',
  '2007-Q1','2007-Q2','2007-Q3','2007-Q4',
  '2008-Q1','2008-Q2','2008-Q3','2008-Q4',
  '2009-Q1','2009-Q2','2009-Q3','2009-Q4',
  '2010-Q1','2010-Q2','2010-Q3','2010-Q4',
  '2011-Q1','2011-Q2','2011-Q3','2011-Q4',
  '2012-Q1','2012-Q2','2012-Q3','2012-Q4',
  '2013-Q1','2013-Q2','2013-Q3','2013-Q4',
  '2014-Q1','2014-Q2','2014-Q3','2014-Q4',
  '2015-Q1','2015-Q2','2015-Q3','2015-Q4',
  '2016-Q1','2016-Q2','2016-Q3','2016-Q4',
  '2017-Q1','2017-Q2'
]
