var THREEGRAPHS = { };

THREEGRAPHS.Utils = function () {
  
};

// A function to Detect touch devices - solution by Gregers Rygg
// maybe look for better one

THREEGRAPHS.Utils.prototype.isTouchDevice = function () {
  var el = document.createElement ( 'div' );
  el.setAttribute ( 'ongesturestart', 'return;' );
  if ( typeof el.ongesturestart == "function" ){
     return true;
  }else {
     return false;
  }
};

// A function to calcuate lighter hex colour for the wireframe 
// courtesy of Craig Buckler:
// http://www.sitepoint.com/javascript-generate-lighter-darker-color/

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
      c = Math.round( Math.min( Math.max( 0, c + (c * lum) ), 255) ).toString( 16 );  
      rgb += ( "00"+c ).substr( c.length );  
  }
  return rgb;
};