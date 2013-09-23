/**
 * @author Yane Frenski / http://yane.fr/
 */

var THREEGRAPHS = { };

/**
 * THE UTILITY FUNCTIONS CLASS
 */

THREEGRAPHS.Utils = function () {
  
};

/**
 * A function to Detect touch devices - solution by Gregers Rygg
 */

THREEGRAPHS.Utils.prototype.isTouchDevice = function () {
  var el = document.createElement ( 'div' );
  el.setAttribute ( 'ongesturestart', 'return;' );
  if ( typeof el.ongesturestart == "function" ){
     return true;
  }else {
     return false;
  }
};

/**
 * A function to calcuate lighter hex colour for the wireframe 
 * @author Craig Buckler:
 * http://www.sitepoint.com/javascript-generate-lighter-darker-color/
 */

THREEGRAPHS.Utils.prototype.colorLuminance = function ( hex, lum ) {
  // validate hex string  
  hex = String ( hex ).replace(/[^0-9a-f]/gi, '');  
  if ( hex.length < 6 ) {  
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];  
  }
  lum = lum || 0;  
  // convert to decimal and change luminosity  
  var rgb = "", c, i;  
  for ( i = 0; i < 3; i++ ) {  
      c = parseInt( hex.substr( i*2, 2 ), 16 );  
      c = Math.round( Math.min( Math.max( 0, c + (c * lum) ), 255) )
              .toString( 16 );  
      rgb += ( "00"+c ).substr( c.length );  
  }
  return rgb;
};

/**
 * A function to get the max value in a 2-dimensional array
 */

THREEGRAPHS.Utils.prototype.getMaxArr = function ( arr ){
  var maxVal = arr[0][0];
  for( var i=0; i<arr.length; i++ ){
    for ( var j=0; j<arr[i].length; j++ ){
      if( arr[i][j] > maxVal) maxVal = arr[i][j];
    }
  }
  return maxVal;
};

/**
 * Function to get the max value in a 2-dimensional array
 */
  
THREEGRAPHS.Utils.prototype.getMinArr = function ( arr ){
  var minVal = arr[0][0];
  for( var i=0; i<arr.length; i++ ){
    for ( var j=0; j<arr[i].length; j++ ){
      if( arr[i][j] < minVal) minVal = arr[i][j];
    }
  }
  return minVal;
};

/**
 * A function to get the closest rounding of the max value
 */
 
THREEGRAPHS.Utils.prototype.getRoundMax = function ( val ){
  
  var powsign = -1;
  if( val < 1 && val > -1){
    var roundRatio = 1;
  }else{
    var maxLength = val.toString().length;
    var roundRatio = Math.pow( 10, powsign*(maxLength-1) );
  }
  
  if( val > 0){
    return Math.ceil(val*roundRatio)/roundRatio;
  }else{
    return Math.round(val*roundRatio)/roundRatio;
  }
};

/**
 * A function to get total count in two dimentional array
 */

THREEGRAPHS.Utils.prototype.getTotalArr = function ( arr ){
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      if ( typeof arr[i][j] != 'number' ) arr[i][j] = 0;
      total += arr[i][j];
    }
  }
  return total;
};

