/**
 * @author Yane Frenski / http://yane.fr/
 */

var THREEGRAPHS = { };

// MAIN VARIABLES 
THREEGRAPHS.mouse = { x: -3000, y: -3000 };

// MAIN SETTINGS
THREEGRAPHS.Settings = 
  {
    labelId : "threegraphs-valuelable",
    squareSize : 100,
    squareStep : 200,
    valHeight : 1000,
    backColor : "000000",
    yDeviation : 0,
    zDeviation : 0,
    xDeviation : 0,   // To be recalculated in the init function
    extrudeOpts : { amount: 150, 
                    bevelEnabled: true, 
                    bevelSegments: 5, 
                    steps: 5 }
  };

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


/**
 * A funciton to update the legend div
 */

THREEGRAPHS.Utils.prototype.initLegend = function ( el, schema ){
  el.innerHTML = "";
  for ( var i=0; i<schema.cols.length; i++ ){
    el.innerHTML += '<div style="margin-right:5px; background-color:#'+
                schema.cols[i].color+'" class="div-legend-color left"></div>'+
               '<div class="left" style="margin-right:10px;">'+
                schema.cols[i].name+'</div>';
  }
  el.innerHTML += '<div class="clear"></div>';
};

/**
 * A function to set the three.js camera mouse/touch controls
 */

THREEGRAPHS.Utils.prototype.mouseControls  = function ( renderer, camera, minDist, maxDist ){
  
  if ( this.isTouchDevice () ){
    controls = new THREE.TrackballControlsTouch( camera, renderer.domElement );
  }else{
    controls = new THREE.TrackballControls( camera, renderer.domElement );
  }
  controls.zoomSpeed = 0.3;
  controls.rotateSpeed = 0.1;
  controls.minDistance = minDist;
  controls.maxDistance = maxDist;
  
  // funciton to get the mouse position for the hover efect onthe pies
  document.addEventListener( 'mousemove', function ( event ){
    event.preventDefault();
    THREEGRAPHS.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    THREEGRAPHS.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }, false );

  // function to adjust the size of the canvas when resizing the window
  window.addEventListener( 'resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }, false );
  
  return controls;
};

/**
 * A function to detect the renderer based on the browser
 */

THREEGRAPHS.Utils.prototype.detectRenderer = function ( ){
  var ifcanvas = !! window.CanvasRenderingContext2D;
  var ifwebgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();
  
  // Init vars and scene depending on the renderer
  if ( ifwebgl ) {
    return 'webgl';
  }
  else if ( ifcanvas ) {
    return 'canvas';
  }
  else {
    return 'none';
  }
};

/**
 * BAR CUBE CLASS
 */
 
THREEGRAPHS.BarCube = function( color, x, z, val, valcolor, render, html_label, titles, minScaleVal, scaleDif, valHeight ) {

   // The render type - can be light and full
   this.renderType = render;

   //the 3D cube object
   this.barobj = null;

   //the 3D stroke (wireframe object) object
   this.wfobj = null;

   // should we set the wireframe
   this.hasWireframe = true;

   // should it have a label. The HTML one should point to a dom element
   this.hasHTMLLabel = html_label;

   // should it cast/receive shadows
   this.hasShadows = true;

   // position in the quadrant
   this.posx = x;
   this.posz = z;

   // value & height
   this.val = val;
   this.h = ((val - minScaleVal)/scaleDif)*THREEGRAPHS.Settings.valHeight;
   if ( this.h==0 ) this.h = 0.5;

   // rows and column titles
   this.titles = titles;

   // main cube colour
   this.color = parseInt(color,16);
   this.htmlcolor = "#"+color;
   var utils = new THREEGRAPHS.Utils ();
   this.lumcolor = utils.colorLuminance( color, 0.5 );
   this.darklumcolor = utils.colorLuminance( color, -0.3 );
   this.valcolor = parseInt(valcolor,16);

   // function to add the bar to the scene and position it
   this.addBar = function( target ){

     // Simple cube geometry for the bar
     var geometry = new THREE.CubeGeometry( THREEGRAPHS.Settings.squareSize, 
                                            this.h, 
                                            THREEGRAPHS.Settings.squareSize );

     // Material for the bars with transparency
     var material = new THREE.MeshPhongMaterial( {ambient: 0x000000,
                                                  color: this.color,
                                                  specular: 0x999999,
                                                  shininess: 100,
                                                  shading : THREE.SmoothShading,
                                                  opacity:0.8,
                                                  transparent: true
                                                 } );
     
     //  if we want a lower quality renderer - mainly with canvas renderer
     if( this.renderType == 'light' ){
       var material = new THREE.MeshLambertMaterial( { color: this.color, 
                                           shading: THREE.FlatShading, 
                                           overdraw: true } );
       this.hasWireframe = false;
       this.hasShadows = false;
     }
     
     // Creating the 3D object, positioning it and adding it to the scene
     this.barobj = new THREE.Mesh( geometry, material );
     
     // Adds shadows if selected as an option
     if( this.hasShadows ){
       this.barobj.castShadow = true;
       this.barobj.receiveShadow = true;
     }
     this.barobj.position.x = THREEGRAPHS.Settings.xDeviation + 
                              this.posx*THREEGRAPHS.Settings.squareStep + 
                              THREEGRAPHS.Settings.squareStep/2;
     this.barobj.position.y = THREEGRAPHS.Settings.yDeviation + this.h/2;
     this.barobj.position.z = THREEGRAPHS.Settings.zDeviation + 
                              this.posz*THREEGRAPHS.Settings.squareStep + 
                              THREEGRAPHS.Settings.squareStep/2;
     target.add( this.barobj );
     
     // If we want to have wireframe (with a lighter colour) we attach 2nd obj
     if(this.hasWireframe){

       // Creates cube with the same size
       var geometry = new THREE.CubeGeometry( THREEGRAPHS.Settings.squareSize, 
                                              this.h, 
                                              THREEGRAPHS.Settings.squareSize );

       // Generates a wireframe material
       var material = new THREE.MeshBasicMaterial( { 
                          color: parseInt( this.lumcolor, 16 ),
                          wireframe:true} );
       this.wfobj = new THREE.Mesh( geometry, material );
       this.wfobj.receiveShadow = true;

       // Adds the wireframe object to the main one
       this.barobj.add( this.wfobj );
     }
     
     
   };

   // function to show the label
   this.showLabel = function( posx, posy){

     if ( this.hasHTMLLabel ) {
       this.hasHTMLLabel.innerHTML = this.titles.row + 
                               '<p>' + this.titles.col + ': '+val+'</p>';
       this.hasHTMLLabel.style.display = 'block';
       // Back transformation of the coordinates
       posx = ( ( posx + 1 ) * window.innerWidth / 2 );
       posy = - ( ( posy - 1 ) * window.innerHeight / 2 );
       this.hasHTMLLabel.style.left = posx;
       this.hasHTMLLabel.style.top = posy;
     }

   };

   // function to hide the label
   this.hideLabel = function(){

     // Hides HTML Label if set - uses jquery for DOM manipulation
     if ( this.hasHTMLLabel ) {
       this.hasHTMLLabel.style.display = 'none';
     }

   };

   this.reposition = function ( x, y, z ){
     this.barobj.position.set ( x, y, z );
   }

   this.reorientation = function ( x, y, z ){
     this.barobj.rotation.set ( x, y, z );
   }


 };
