/*
  Global vars & functions for the site
*/

var urlHash = window.location.hash;
var appState = getObjectFromHash(urlHash);

// Set personal token
mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGlwMTkzMSIsImEiOiJjajVobTc1c3MxeXNyMnFucXV5cnVyOWhvIn0.xAsGvnYs57UMqlwdAQP5nA';

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
      'startYear': '2010-Q2',
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
            //set the appState as well
            appState[param] = queryObj[param]
        }
    }
    return paramsArray.join('&');
}

function getUniqueFeatures(array, comparatorProperty) {
    var existingFeatureKeys = {};
    // Because features come from tiled vector data, feature geometries may be split
    // or duplicated across tile boundaries and, as a result, features may appear
    // multiple times in query results.
    var uniqueFeatures = array.filter(function(el) {
        if (existingFeatureKeys[el.properties[comparatorProperty]]) {
            return false;
        } else {
            existingFeatureKeys[el.properties[comparatorProperty]] = true;
            return true;
        }
    });

    return uniqueFeatures;
}
