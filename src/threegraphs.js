/**
 * @author Yane Frenski / http://yane.fr/
 */

var THREEGRAPHS = { };

// MAIN VARIABLES 
THREEGRAPHS.mouse = { x: -3000, y: -3000 };
THREEGRAPHS.touch = { device:false, x: -3000, y: -3000 };

// MAIN SETTINGS
THREEGRAPHS.Settings = 
  {
    canvas: null,
    labelId : "threegraphs-valuelable",
    squareSize : 100,
    squareStep : 200,
    valHeight : 1000,
    backColor : "000000",
    yDeviation : 0,
    zDeviation : 0,
    xDeviation : 0,   // To be recalculated in the init function
    pieRadius: 750,
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
  NiceScale class - javascript interpretation
  algorithm psuedo code from Graphics gems by Andrew S. Glassner
  http://books.google.at/books?id=fvA7zLEFWZgC&printsec=frontcover&redir_esc=y#v=onepage&q&f=false
  algorithm Java code by Steffen L. Norgren
  http://trollop.org/2011/03/15/algorithm-for-optimal-scaling-on-a-chart-axis/
  
  TODO: Fix the floating point problem!
  
**/

THREEGRAPHS.NiceScale = function ( min, max) {
 
  this.minPoint = min;
  this.maxPoint = max;
  this.maxTicks = 10;
  this.tickSpacing = 0;
  this.range = 0;
  this.niceMin = 0;
  this.niceMax = 0;
  this.tickNum = 0
 
 
    /**
     * Calculate and update values for tick spacing and nice
     * minimum and maximum data points on the axis.
     */
    this.calculate = function() {
        this.range = niceNum(this.maxPoint - this.minPoint, false);
        this.tickSpacing = niceNum(this.range / (this.maxTicks - 1), true);
        this.niceMin =
            Math.floor(this.minPoint / this.tickSpacing) * this.tickSpacing;
        this.niceMax =
            Math.ceil(this.maxPoint / this.tickSpacing) * this.tickSpacing;
        this.tickNum = this.range / this.tickSpacing;
    }
 
    /**
     * Returns a "nice" number approximately equal to range Rounds
     * the number if round = true Takes the ceiling if round = false.
     *
     * @param range the data range
     * @param round whether to round the result
     * @return a "nice" number to be used for the data range
     */
    var niceNum = function ( range, round ) {
        var exponent; /** exponent of range */
        var fraction; /** fractional part of range */
        var niceFraction; /** nice, rounded fraction */
 
        exponent = Math.floor(log10(range));
        fraction = range / Math.pow(10, exponent);
 
        if (round) {
                if (fraction < 1.5)
                    niceFraction = 1;
                else if (fraction < 3)
                    niceFraction = 2;
                else if (fraction < 7)
                    niceFraction = 5;
                else
                    niceFraction = 10;
        } else {
                if (fraction <= 1)
                    niceFraction = 1;
                else if (fraction <= 2)
                    niceFraction = 2;
                else if (fraction <= 5)
                    niceFraction = 5;
                else
                    niceFraction = 10;
        }
 
        return niceFraction * Math.pow(10, exponent);
    }
    
    var log10 = function(val) {
      return Math.log(val) / Math.LN10;
    }
 
    /**
     * Sets the minimum and maximum data points for the axis.
     *
     * @param minPoint the minimum data point on the axis
     * @param maxPoint the maximum data point on the axis
     */
    this.setMinMaxPoints = function ( minPoint, maxPoint) {
        this.minPoint = minPoint;
        this.maxPoint = maxPoint;
        this.calculate();
    }
 
    /**
     * Sets maximum number of tick marks we're comfortable with
     *
     * @param maxTicks the maximum number of tick marks for the axis
     */
    this.setMaxTicks = function ( maxTicks ) {
      this.maxTicks = maxTicks;
      this.calculate();
    }
 
 
}


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


 /**
  * PIE PART CLASS
  */

THREEGRAPHS.PiePart = function( val, totalval, radius, angprev, pos, color, valcolor, render, html_label, titles ) {

   // The render type - can be light and full
   this.renderType = render;

   //the 3D cube object
   this.pieobj = null;

   // the 3D object for the text label
   this.labelobj = null

   // The HTML label
   this.hasHTMLLabel = html_label;

   // should it cast/receive shadows
   this.hasShadows = true;

   // the position (usually 0;0;0)
   this.position = pos;

   // the radius size 
   this.radius = radius;

   // the previous angle - this one should start from it
   this.angPrev = angprev;

   // value and Total
   this.val = val;
   this.valTotal = totalval;

   // rows and column titles
   this.titles = titles;

   // extrude options
   this.extrudeOpts = THREEGRAPHS.Settings.extrudeOpts;

   // main cube colour
   this.color = parseInt(color,16);
   this.htmlcolor = "#"+color;
   this.valcolor = parseInt(valcolor,16);
   var utils = new THREEGRAPHS.Utils ();
   this.lumcolor = utils.colorLuminance( color, 0.5 );
   this.darklumcolor = utils.colorLuminance( color, -0.6 );

   // function to add the bar to the scene and position it
   this.addPie = function( target ){

     // Material for the bars with transparency
     var material = new THREE.MeshPhongMaterial( {ambient: 0x000000,
                                                  color: this.color,
                                                  specular: 0x777777,
                                                  shininess: 100,
                                                  shading : THREE.SmoothShading,
                                                  transparent: true
                                                 } );

     //  if we want a lower quality renderer - mainly with canvas renderer
     if( this.renderType == 'light' ){
       var material = new THREE.MeshLambertMaterial( { color: this.color, 
                                                       shading: THREE.FlatShading, 
                                                       overdraw: true } );
     }

     // Creats the shape, based on the value and the radius
     var shape = new THREE.Shape();
     var angToMove = ( Math.PI*2*( this.val/this.valTotal ) );
     shape.moveTo( this.position.x, this.position.y );
     shape.arc( this.position.x, this.position.y, THREEGRAPHS.Settings.pieRadius,
               this.angPrev, this.angPrev+angToMove, false );
     shape.lineTo( this.position.x, this.position.y );
     nextAng = this.angPrev + angToMove;

     var geometry = new THREE.ExtrudeGeometry( shape, this.extrudeOpts );

     this.pieobj = new THREE.Mesh( geometry, material );
     this.pieobj.rotation.set(90,0,0);

     // Creating the 3D object, positioning it and adding it to the scene
     this.pieobj = new THREE.Mesh( geometry, material );
     this.pieobj.rotation.set(Math.PI/2,0,0);
     
     // Adds shadows if selected as an option
     if( this.hasShadows ){
       this.pieobj.castShadow = true;
       this.pieobj.receiveShadow = true;
     }
     target.add( this.pieobj );

     return nextAng;

   };

   // function to show the label
   this.showLabel = function( posx, posy ){

     // Shows HTML Label if set - uses jquery for DOM manipulation
     if ( this.hasHTMLLabel ) {
       this.hasHTMLLabel.InnerHTML = this.titles.col + 
                               '<p>'+val+'</p>';
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


 };
 
 /**
  * AREA POLY CLASS
  */

THREEGRAPHS.AreaPoly = function( color, z, val, valcolor, render, html_label, titles, minScaleVal, scaleDif, valHeight ) {

    // The render type - can be light and full
    this.renderType = render;

    //the 3D cube object
    this.areaobj = null;

    // the 3D object for the text label
    this.labelobj = null;

    // should we set the wireframe
    this.hasWireframe = true;

    // should it have a label. The HTML one should point to a dom element
    this.hasLabel = true;
    this.hasHTMLLabel = html_label;

    // should it cast/receive shadows
    this.hasShadows = true;

    // position in the quadrant
    this.posz = z;

    // value & height
    this.val = val;

    // rows and column titles
    this.titles = titles;

    // vars to calculate the values
    this.minScaleVal = minScaleVal;
    this.scaleDif = scaleDif;
    this.valHeight = valHeight;

    // extrude options
    this.extrudeOpts = THREEGRAPHS.Settings.extrudeOpts;
    
    // main cube colour
    this.color = parseInt(color,16);
    this.htmlcolor = "#"+color;
    this.valcolor = parseInt(valcolor,16);
    var utils = new THREEGRAPHS.Utils ();
    this.lumcolor = utils.colorLuminance( color, 0.5 );
    this.darklumcolor = utils.colorLuminance( color, -0.3 );


    // function to add the bar to the scene and position it
    this.addArea = function( target ){
      
      // gets the square step from the settings
      var sqStep = THREEGRAPHS.Settings.squareStep;

      // starting points for X and Y
      var startX = THREEGRAPHS.Settings.xDeviation + sqStep/2;
      var startY = THREEGRAPHS.Settings.yDeviation;

      // Shape geometry
      var shape = new THREE.Shape();
      shape.moveTo( startX, startY );

      for (var i = 0; i < this.val.length; i++) {
        shape.lineTo( startX + i*sqStep, startY + calcPointYPos( this.val[i], 
                                       this.minScaleVal,
                                       this.scaleDif,
                                       this.valHeight) );
      }
      shape.lineTo( startX + ( this.val.length - 1)*sqStep , startY);
      shape.lineTo( startX, startY );

      var geometry = new THREE.ExtrudeGeometry( shape, this.extrudeOpts );

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
      this.areaobj = new THREE.Mesh( geometry, material );
      // Adds shadows if selected as an option
      if( this.hasShadows ){
        this.areaobj.castShadow = true;
        this.areaobj.receiveShadow = true;
      }
      this.areaobj.position.z = THREEGRAPHS.Settings.zDeviation + this.posz*sqStep
                                + sqStep/4 +this.extrudeOpts.amount/2;
      target.add( this.areaobj );
      
    };

    // function to show the label
    this.showLabel = function( posx, posy){

      // Shows HTML Label if set
      if ( this.hasHTMLLabel ) {
        var rowVals = "";
        for ( var i=0; i<this.titles.row.length; i++ ){
          rowVals += this.titles.row[i].name + ": " + this.val[i] + "<br>";
        }
        this.hasHTMLLabel.InnerHTML = this.titles.col + 
                                '<p>' + rowVals + '</p>';
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

    var calcPointYPos = function ( val , minScaleVal , scaleDif ,valHeight ) {
      return scaledVar = ( (val - minScaleVal)/scaleDif ) * valHeight;
    }

};


/**
 * BAR CHART OBJECT
 */

THREEGRAPHS.BarChart = function ( schema ) {
  
  this.schema = schema || 0;
  this.dataValues = [];
  for ( var i=0; i<schema.rows.length; i++ ){
    this.dataValues[i] = schema.rows[i].values;
  }
  
};

THREEGRAPHS.BarChart.prototype = {
  
  constructor: THREEGRAPHS.BarChart,
  scene: null,
  camera: null,
  camPos: { x: 500, y: 500, z: 1600 },
  renderer: null,
  projector: null,
  intersectedId: null,
  INTERSECTED: null,
  niceScale: null,
  bars: [],
  intersobj: [],
  sTextVals: [],
  sTextRows: [],
  sTextCols: [],
  
  
  initSceneVars : function () { // Initiates the main scene variable
    
    var utils =  new THREEGRAPHS.Utils();
    
    // Inits deviation position of the ground from the center
    THREEGRAPHS.Settings.yDeviation = -(THREEGRAPHS.Settings.valHeight/2);
    THREEGRAPHS.Settings.zDeviation = -(this.schema.cols.length*
                                        THREEGRAPHS.Settings.squareStep/2);
    THREEGRAPHS.Settings.xDeviation = -(this.schema.rows.length*
                                        THREEGRAPHS.Settings.squareStep/2);
    
    // Inits the value scale variables
    this.niceScale = new THREEGRAPHS.NiceScale ( 
      utils.getMinArr ( this.dataValues ),
      utils.getMaxArr ( this.dataValues ) 
    );
    this.niceScale.calculate ();
    
    // removes previous canvas if exists
    if( document.getElementsByTagName ('canvas')[0] !=null ) {
      document.removeChild ( document.getElementsByTagName ('canvas')[0] );
    }
    
    // Getting the projector for picking objects
    this.projector = new THREE.Projector();

    // Creating new scene
    this.scene = new THREE.Scene();

    // Setting the camera
    this.camera = new THREE.PerspectiveCamera( 60, 
                                          window.innerWidth/window.innerHeight,
                                          1, 
                                          5000 );
    this.camera.position.x = this.camPos.x;
    this.camera.position.y = this.camPos.y;
    this.camera.position.z = this.camPos.z;
    
  },
  
  initWebGLScene: function() { // Initiates a WEBGL Scene
    
    // Setting the renderer (with shadows)
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // Switch off the shadows for safari due to the three.js bug with it
    if ( navigator.userAgent.indexOf('Safari') != -1 ) {
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
    }
  }
  
};

