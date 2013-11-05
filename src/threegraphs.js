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
    labelId : "threegraphs-valuelable",
    staticUrl : 'img',
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
                    steps: 5 },
    replaceImage : null
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
  
  var controls;
  
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

THREEGRAPHS.Utils.prototype.nonSupportedBrowsers = function ( ){
  var noBrowserDiv = document.createElement( 'div' );
  document.body.appendChild( noBrowserDiv );
  if( THREEGRAPHS.Utils.Settings.replaceImage ) {
    noBrowserDiv.innerHTML = '<img id="non-supported-img" src="'+
                              replaceImage+'" />';
  }else{
    noBrowserDiv.innerHTML = '<div id="non-supported-errormsg" />Unfortunately'+
                             'your browser doesn\'t support the threegraphs '+
                             'editor. Please use Chrome, Firefox 4+, Internet '+
                             'Explorer 9+, Safari 5+, or Opera.</div>';
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
 
THREEGRAPHS.BarCube = function( color, x, z, val, valcolor, render, html_label, titles, minScaleVal, scaleDif, valHeight, sqSize ) {

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
   
   this.sqSize = sqSize;

   // function to add the bar to the scene and position it
   this.addBar = function( target ){

     // Simple cube geometry for the bar
     var geometry = new THREE.CubeGeometry( this.sqSize, this.h, this.sqSize );

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
       var geometry = new THREE.CubeGeometry( this.sqSize, this.h, this.sqSize );

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
       this.hasHTMLLabel.innerHTML = '<b>' + this.titles.col + '</b>'+
                                     '<br>' + this.titles.row + ': '+val;
       this.hasHTMLLabel.style.display = 'block';
       // Back transformation of the coordinates
       posx = ( ( posx + 1 ) * window.innerWidth / 2 );
       posy = - ( ( posy - 1 ) * window.innerHeight / 2 );
       this.hasHTMLLabel.style.left = posx + 'px';
       this.hasHTMLLabel.style.top = posy + 'px';
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
       this.hasHTMLLabel.innerHTML = this.titles.row +  ':<br>'+val;
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
      shape.moveTo( startX, startY+1 );

      for (var i = 0; i < this.val.length; i++) {
        shape.lineTo( startX + i*sqStep, startY + calcPointYPos( this.val[i], 
                                       this.minScaleVal,
                                       this.scaleDif,
                                       this.valHeight) );
      }
      shape.lineTo( startX + ( this.val.length - 1)*sqStep , startY-1);
      // the -1 is a workaround before I fix the issue with the nice scales
      shape.lineTo( startX, startY+1 );

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
                                + sqStep/8;
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
        this.hasHTMLLabel.innerHTML = this.titles.col + 
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
 * A CLASS FOR THE SCALE TEXT
 */

THREEGRAPHS.ScaleText = function( text, type, pos, color, yStep ) {
  
  // the 3D object for the text label
  this.txtobj = null;
  
  // type: can be "val", "col", "row"
  this.ttype = type;
  
  // text
  this.txt = text;
  
  // position
  this.position = pos;
  
  // the difirance in position according y axis
  this.yStep = yStep;
  
  // the color
  this.color = 0x555555;
  if ( color ) this.color = parseInt(color,16);
  
  // label vars
  this.textSize = 30;
  this.textHeight = 5;
  this.textFont = "helvetiker";
  this.letterSize = 7 // this depends on the font
  
  // function to add the bar to the scene and position it
  this.addText = function( target ){
    
    var sqStep = THREEGRAPHS.Settings.squareStep;
    var xDeviation = THREEGRAPHS.Settings.xDeviation;
    var yDeviation = THREEGRAPHS.Settings.yDeviation;
    var zDeviation = THREEGRAPHS.Settings.zDeviation;
        
      // Create a three.js text geometry
    var geometry = new THREE.TextGeometry( this.txt, {
      size: this.textSize,
      height: this.textHeight,
      curveSegments: 3,
      font: this.textFont,
      weight: "bold",
      style: "normal",
      bevelEnabled: false
    });

    var material = new THREE.MeshPhongMaterial( { color: this.color, shading: THREE.FlatShading } );
      
    // Positions the text and adds it to the scene
    this.txtobj = new THREE.Mesh( geometry, material );
    
    if( this.ttype == "col" ) {
      this.txtobj.position.x = -xDeviation + 
                                sqStep/5;
      this.txtobj.position.y = -zDeviation - 
                                this.position * sqStep -
                                sqStep/2;
    } else if ( type == "row" ){
      this.txtobj.rotation.z = Math.PI/2;
      this.txtobj.position.x = xDeviation + 
                               this.position * sqStep +
                               sqStep/2;
      this.txtobj.position.y = zDeviation - 
                               sqStep/5 - this.txt.length *
                               ( this.textSize -  this.letterSize );
    } else {
      this.txtobj.rotation.y = Math.PI/2;
      this.txtobj.position.x = -zDeviation;
      this.txtobj.position.z = sqStep/5 + this.txt.length *
                               ( this.textSize -  this.letterSize );
      this.txtobj.position.y = yDeviation + this.position * 
                               yStep - this.textSize/2;
    }
    
    target.add( this.txtobj );

  };
  
  // function to show the label
  this.highlightText = function(){
  
    if(this.hasLabel){
      this.labelobj.visible = true;
    }  
    
  };
  
  // function to hide the label
  this.unhighlightText = function(){
  
    if(this.hasLabel){
      this.labelobj.visible = false;
    }  
    
  };
  
};


THREEGRAPHS.animate = function ( obj, type ){
  
  var animateSc = function (){
    
    requestAnimationFrame( animateSc );
    
    if ( type == 'bar'){
      var mainElements = obj.bars;
    } else if ( type == 'pie' ){
      var mainElements = obj.pies;
    } else if ( type == 'area' ){
      var mainElements = obj.areas;
    } else if ( type == 'world' ){
      var mainElements = obj.bars;
    }
    
    
    
    // Updateing the controls for the trackball camera
    obj.controls.update();

    // url: http://mrdoob.github.com/three.js/examples/webgl_interactive_cubes.html

    // Checks first if it's touch or mouse device
    if ( !THREEGRAPHS.touch.device ) {
      var actCoord = { x: THREEGRAPHS.mouse.x, y: THREEGRAPHS.mouse.y };
    } else {
      var actCoord = { x: THREEGRAPHS.touch.x, y: THREEGRAPHS.touch.y };
    }

    var vector = new THREE.Vector3( actCoord.x, actCoord.y, 1 );
    
    obj.projector.unprojectVector( vector, obj.camera );
    
    var ray = new THREE.Ray( obj.camera.position, 
                             vector.subSelf( obj.camera.position ).normalize() );
    var intersects = ray.intersectObjects( obj.intersobj );
    
    if ( intersects.length > 0 ) {
      if ( obj.INTERSECTED != intersects[ 0 ].object ) {
        if ( obj.INTERSECTED ) {
          obj.INTERSECTED.material.emissive.setHex( 
            obj.INTERSECTED.currentHex );
          mainElements[obj.intersectedId].hideLabel();
        }
        obj.INTERSECTED = intersects[ 0 ].object;
        obj.INTERSECTED.currentHex = obj.INTERSECTED.material.emissive.getHex();
        obj.INTERSECTED.material.emissive.setHex( 
          parseInt( mainElements[intersects[0].object.elemId].darklumcolor, 16 ) );
        mainElements[intersects[0].object.elemId].showLabel( actCoord.x, 
                                                         actCoord.y );
        obj.intersectedId = intersects[0].object.elemId;
      }
    } else {
      if ( obj.INTERSECTED ) {
        obj.INTERSECTED.material.emissive.setHex( 
          obj.INTERSECTED.currentHex );
        mainElements[obj.intersectedId].hideLabel();
      }
      obj.intersectedId = null;
      obj.INTERSECTED = null;
    }
    
    if( type=='world' ){
      if ( obj.browserRender == 'webgl' ) {
        // set the spotlight to move with the camera
        obj.spotLight.position.set( obj.camera.position.x, 
                                obj.camera.position.y-200, 
                                obj.camera.position.z+200);
      }
    }

    obj.renderer.render( obj.scene, obj.camera );
    
  }
  
  animateSc ();

}

/**
 * BAR CHART OBJECT
 */

THREEGRAPHS.BarChart = function ( schema ) {
  
  this.schema = schema || 0;
  this.dataValues = [];
  for ( var i=0; i<schema.rows.length; i++ ){
    this.dataValues[i] = [];
    for( var j=0; j<schema.cols.length; j++ ){
      this.dataValues[i][j] = schema.rows[i].values[j];
    }
  }
  
};

THREEGRAPHS.BarChart.prototype = {
  
  canvas: null,
  domContainer: null,
  constructor: THREEGRAPHS.BarChart,
  controls: null,
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
    
    // Removes previous canvas if exists    
    var exCanEl = document.getElementsByTagName("canvas");
    for (var i = exCanEl.length - 1; i >= 0; i--) {
        exCanEl[i].parentNode.removeChild(exCanEl[i]);
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
    if ( !this.canvas ) {
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    }else{
      this.renderer = new THREE.WebGLRenderer( { antialias: true, 
                                                 canvas: this.canvas } );
    }
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // Switch off the shadows for safari due to the three.js bug with it
    if ( navigator.userAgent.indexOf('Safari') == -1 ) {
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
    }
    
    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }
    
    this.domContainer.appendChild( this.renderer.domElement );
    
    //*** Adding the grounds
    // material for the grounds
    var gridTex = THREE.ImageUtils.loadTexture(
                   THREEGRAPHS.Settings.staticUrl+"/grid_pattern1.jpg");
    gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set( 5, 5 );

    var gridTex2 = THREE.ImageUtils.loadTexture(
                    THREEGRAPHS.Settings.staticUrl+"/grid_pattern2.jpg");
    gridTex2.wrapS = gridTex2.wrapT = THREE.RepeatWrapping;
    gridTex2.repeat.set( this.schema.rows.length, this.schema.cols.length );

    var materialX = new THREE.MeshPhongMaterial({
      ambient : 0x444444,
      color : 0x777777,
      shininess : 70, 
      specular : 0x888888,
      shading : THREE.SmoothShading,
      side: THREE.DoubleSide,
      map:gridTex2
    });

    var materialYZ = new THREE.MeshPhongMaterial({
      ambient : 0x444444,
      color : 0x999999,
      shininess : 70, 
      specular : 0x888888,
      shading : THREE.SmoothShading,
      side: THREE.DoubleSide,
      map:gridTex
    });
    
    var sqStep = THREEGRAPHS.Settings.squareStep;
    var valH = THREEGRAPHS.Settings.valHeight

    // Creating the ground-x
    var geometry = new THREE.PlaneGeometry( sqStep*this.schema.rows.length,
                                            sqStep*this.schema.cols.length );

    var groundX = new THREE.Mesh( geometry, materialX );
    groundX.rotation.x -= Math.PI/2;
    groundX.castShadow = false;
    groundX.receiveShadow = true;
    groundX.position.y = THREEGRAPHS.Settings.yDeviation;
    this.scene.add( groundX );

    // Creating the ground-y
    var geometry = new THREE.PlaneGeometry( 
                           sqStep*this.schema.rows.length,
                           valH);

    var groundY = new THREE.Mesh( geometry, materialYZ );
    groundY.castShadow = false;
    groundY.receiveShadow = true;
    groundY.position.z = THREEGRAPHS.Settings.zDeviation;
    this.scene.add( groundY );

    // craating the groynd-z
    var geometry = new THREE.PlaneGeometry( 
                          sqStep*this.schema.cols.length,
                          valH );

    var groundZ = new THREE.Mesh( geometry, materialYZ );
    groundZ.rotation.y -= Math.PI/2;
    groundZ.castShadow = false;
    groundZ.receiveShadow = true;
    groundZ.position.x = THREEGRAPHS.Settings.xDeviation;
    this.scene.add( groundZ );
    //////////////////
    
    //*** Adding texts for the scales
    for( var i=0; i<this.schema.cols.length; i++ ) {
      this.sTextCols[i] = new THREEGRAPHS.ScaleText( this.schema.cols[i].name,
                                "col", i, this.schema.cols[i].color );
      this.sTextCols[i].addText(groundX);
    }

    for( var i=0; i<this.schema.rows.length; i++ ) {
      this.sTextRows[i] = new THREEGRAPHS.ScaleText( this.schema.rows[i].name,
                                "row", i, THREEGRAPHS.Settings.scaleTextColor);
      this.sTextRows[i].addText(groundX);
    }

    var yStep = THREEGRAPHS.Settings.valHeight/this.niceScale.tickNum;
    for ( var i=0; i<= this.niceScale.tickNum; i++ ) {
      var val = this.niceScale.niceMin + i*this.niceScale.tickSpacing;
      var stringVal = val.toString();
      this.sTextVals[i] = new THREEGRAPHS.ScaleText(stringVal, "val", i, 
                                   this.scaleTextColor, yStep);
      this.sTextVals[i].addText(groundZ);
    }
    
    //*** Adding bars
    for ( var i=0; i<this.schema.rows.length; i++ ) {
      for (var j=0; j<this.schema.cols.length; j++ ) {
        this.bars.push( 
          new THREEGRAPHS.BarCube( 
                this.schema.cols[j].color, i, j, this.dataValues[i][j],
                THREEGRAPHS.Settings.valTextColor, 'full',
                document.getElementById( THREEGRAPHS.Settings.labelId ),
                { row:this.schema.rows[i].name, 
                  col:this.schema.cols[j].name },
                  this.niceScale.niceMin, 
                  this.niceScale.range, 
                  this.valHeight,
                  THREEGRAPHS.Settings.squareSize ) );
        this.bars[this.bars.length-1].addBar(this.scene);
        // Adds the bars objects to ones that need to be checked for intersection
        // This is used for the moseover action
        this.intersobj[this.bars.length-1] = this.bars[this.bars.length-1].barobj;
        this.intersobj[this.bars.length-1].elemId = this.bars.length-1;
      }
    }
    
    //*** Adding the lights
    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( 1, -1, 1 ).normalize();
    this.scene.add( light );

    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( -1, 1, -1 ).normalize();
    this.scene.add( light );

    light = new THREE.SpotLight( 0xd8d8d8, 2 );
    light.position.set( 600, 3000, 1500 );
    light.target.position.set( 0, 0, 0 );

    light.shadowCameraNear = 1000;
    light.shadowCameraFar = 5000;
    light.shadowCameraFov = 40;
    light.castShadow = true;
    light.shadowDarkness = 0.3;
    light.shadowBias = 0.0001;
    this.scene.add( light );
    ////////////////////
    
  },
  
  initCanvasScene: function() {
    
    var squareStep = THREEGRAPHS.Settings.squareStep;
    var valHeight = THREEGRAPHS.Settings.valHeight;
      
      // Setting the Canvas renderer
      if ( !this.canvas ) {
        this.renderer = new THREE.CanvasRenderer(  );
      }else{
        this.renderer = new THREE.CanvasRenderer( { canvas: this.canvas } );
      }
      this.renderer.setSize( window.innerWidth, window.innerHeight );

      if ( !this.domContainer ) {
        this.domContainer = document.createElement( 'div' );
        document.body.appendChild( this.domContainer );
      } else {
        this.domContainer = document.getElementById ( this.domContainer );
      }

      this.domContainer.appendChild( this.renderer.domElement );


      //*** Adding the grounds
      // *********************

      var groundSizeX = squareStep*this.schema.rows.length;
      var groundSizeY = squareStep*this.schema.cols.length;
      var lineMaterial = new THREE.LineBasicMaterial( { color: 0xaaaaaa, 
                                                        opacity: 0.8 } );

      // Adding the X ground

      var geometry = new THREE.Geometry();
      // putting the Y vertices
      for ( var i = 0; i <= groundSizeY; i += squareStep ) {
        geometry.vertices.push( new THREE.Vector3(  0, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(  groundSizeX, 0, i ) );
      }
      // putting the X vertices
      for ( var i = 0; i <= groundSizeX; i += squareStep ) {
        geometry.vertices.push( new THREE.Vector3( i, 0, 0 ) );
        geometry.vertices.push( new THREE.Vector3( i, 0, groundSizeY ) );
      }

      // Creating the line object and positioning it
      var groundX = new THREE.Line( geometry, lineMaterial );
      groundX.type = THREE.LinePieces;
      groundX.position.y = THREEGRAPHS.Settings.yDeviation;
      groundX.position.z = THREEGRAPHS.Settings.zDeviation;
      groundX.position.x = THREEGRAPHS.Settings.xDeviation;
      this.scene.add( groundX );

      // Adding the Y ground

      var geometry = new THREE.Geometry();
      // putting the X vertices
      for ( var i = 0; i <= valHeight; i += squareStep ) {
        geometry.vertices.push( new THREE.Vector3(  0, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(  groundSizeX, 0, i ) );
      }

      // Creating the line object and positioning it
      var groundY = new THREE.Line( geometry, lineMaterial );
      groundY.rotation.set( Math.PI/2, 0, 0 );
      groundY.type = THREE.LinePieces;
      groundY.position.y = -THREEGRAPHS.Settings.yDeviation;
      groundY.position.z = THREEGRAPHS.Settings.zDeviation;
      groundY.position.x = THREEGRAPHS.Settings.xDeviation;
      this.scene.add( groundY );

      // Adding the Y ground

      var geometry = new THREE.Geometry();
      // putting the X vertices
      for ( var i = 0; i <= valHeight; i += squareStep ) {
        geometry.vertices.push( new THREE.Vector3(  0, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(  groundSizeY, 0, i ) );
      }

      // Creating the line object and positioning it
      var groundZ = new THREE.Line( geometry, lineMaterial );
      groundZ.rotation.set( Math.PI/2, 0, Math.PI/2 );
      groundZ.type = THREE.LinePieces;
      groundZ.position.y = -THREEGRAPHS.Settings.yDeviation;
      groundZ.position.z = THREEGRAPHS.Settings.zDeviation;
      groundZ.position.x = THREEGRAPHS.Settings.xDeviation;
      this.scene.add( groundZ );


      //*** Adding bars ************
      // ***************************
      for ( var i=0; i<this.schema.rows.length; i++ ) {
        for (var j=0; j<this.schema.cols.length; j++ ) {
          this.bars.push( new THREEGRAPHS.BarCube( 
                this.schema.cols[j].color, i, j, this.dataValues[i][j],
                THREEGRAPHS.Settings.valTextColor, 'light',
                document.getElementById( THREEGRAPHS.Settings.labelId),
                { row:this.schema.rows[i].name, 
                  col:this.schema.cols[j].name },
                  this.niceScale.niceMin, 
                  this.niceScale.range, 
                  this.valHeight,
                  THREEGRAPHS.Settings.squareSize ) );
          this.bars[this.bars.length-1].hasLabel = false;               
          this.bars[this.bars.length-1].addBar(this.scene);
          // Adds the bars objects to ones that need to be checked for intersection
          // This is used for the moseover action
          this.intersobj[this.bars.length-1] = this.bars[this.bars.length-1].barobj;
          this.intersobj[this.bars.length-1].elemId = this.bars.length-1;
        }
      }

      //******************************


      //*** Adding the lights ********
      //******************************
      var ambientLight = new THREE.AmbientLight( 0xffffff );
      this.scene.add( ambientLight );

      var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
      directionalLight.position.x = 0.4;
      directionalLight.position.y = 0.4;
      directionalLight.position.z = - 0.2;
      directionalLight.position.normalize();
      this.scene.add( directionalLight );

      var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
      directionalLight.position.x = - 0.2;
      directionalLight.position.y = 0.5;
      directionalLight.position.z = - 0.1;
      directionalLight.position.normalize();
      this.scene.add( directionalLight );
      //******************************

    },


    // *** SCENE INITIALIZATION ***************************************************
    // ****************************************************************************
  
  init: function() {
    
    var utils = new THREEGRAPHS.Utils( );
    
    // Detecting the renderer:
    var browserRender = utils.detectRenderer ( );

    // Init vars and scene depending on the renderer
    if ( browserRender == 'webgl' ) {
      this.initSceneVars ();
      this.initWebGLScene ();
    }
    else if ( browserRender == 'canvas' ) {
      this.initSceneVars ();
      this.initCanvasScene ();
    }
    else {
      utils.nonSupportedBrowsers();
    }
    
    this.controls = utils.mouseControls ( this.renderer, this.camera , 500, 3500 );
    THREEGRAPHS.animate ( this, 'bar' );
    
  }
  
};



/**
 * BAR CHART OBJECT
 */
 
THREEGRAPHS.PieChart = function ( schema ) {

  this.schema = schema || 0;
  this.dataValues = [];
  for ( var i=0; i<schema.rows.length; i++ ){
    this.dataValues[i] = schema.rows[i].value;
  }

};

THREEGRAPHS.PieChart.prototype = {
  
  canvas: null,
  domContainer: null,
  constructor: THREEGRAPHS.PieChart,
  controls: null,
  scene: null,
  camera: null,
  camPos: { x: 500, y: 500, z: 1600 },
  renderer: null,
  projector: null,
  intersectedId: null,
  INTERSECTED: null,
  pies: [],
  intersobj: [],
  totalVal: 0,
  curAngle: 0,
  
  initSceneVars : function (){ // Initiates the main vars

    var utils =  new THREEGRAPHS.Utils();
    
    // Calclulating total value of all fields
    this.totalVal = utils.getTotalArr ( [this.dataValues] );

    // Setting the current angle of rotation
    this.curAngle = 0;

    // Removes previous canvas if exists    
    var exCanEl = document.getElementsByTagName("canvas");
    for (var i = exCanEl.length - 1; i >= 0; i--) {
        exCanEl[i].parentNode.removeChild(exCanEl[i]);
    }

    // Getting the projector for picking objects
    this.projector = new THREE.Projector();

    // Creating new scene
    this.scene = new THREE.Scene();

    // Setting the camera
    this.camera = new THREE.PerspectiveCamera( 70, 
                                          window.innerWidth/window.innerHeight,
                                          1, 
                                          5000 );
    this.camera.position.z = 1200;
    this.camera.position.x = 500;
    this.camera.position.y = 700;

  },
  
  initWebGLScene: function() { // Initiates a WEBGL Scene
    
    // Setting the renderer (with shadows)
    if ( !this.canvas ) {
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    }else{
      this.renderer = new THREE.WebGLRenderer( { antialias: true, 
                                                 canvas: this.canvas } );
    }
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    
    // Switch off the shadows for safari due to the three.js bug with it
    if ( navigator.userAgent.indexOf('Safari') == -1 ) {
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
    }
    
    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }
    
    this.domContainer.appendChild( this.renderer.domElement );
    
    // Adding pies
    for ( var i=0; i<this.schema.rows.length; i++ ) {
      if( this.dataValues[i] > 0 ){
        this.pies.push( new THREEGRAPHS.PiePart( 
                                this.dataValues[i], 
                                this.totalVal, 
                                THREEGRAPHS.Settings.pieRadius, 
                                this.curAngle, 
                                {x:0,y:0,z:0}, 
                                this.schema.rows[i].color, 
                                THREEGRAPHS.Settings.valTextColor, 
                                "full",
                                 document.getElementById( THREEGRAPHS.Settings.labelId ),
                                { row: this.schema.rows[i].name } 
                              ) );
        this.curAngle = this.pies[this.pies.length-1].addPie(this.scene);
        // Adds the pies objects to ones that need to be checked for intersection
        // This is used for the moseover action
        this.intersobj[this.pies.length-1] = this.pies[this.pies.length-1].pieobj;
        this.intersobj[this.pies.length-1].elemId = this.pies.length-1;
      }
    }
    
    // Adding the lights
    var light = new THREE.DirectionalLight( 0x777777 );
    light.position.set( 1, -1, 1 ).normalize();
    this.scene.add( light );
    
    var light = new THREE.DirectionalLight( 0x777777 );
    light.position.set( -1, 1, -1 ).normalize();
    this.scene.add( light );
    
    light = new THREE.SpotLight( 0xffffff, 1 );
    light.position.set( 600, 3000, 1500 );
    light.target.position.set( 0, 0, 0 );
    
    light.shadowCameraNear = 1000;
    light.shadowCameraFar = 5000;
    light.shadowCameraFov = 40;
    light.castShadow = true;
    light.shadowDarkness = 0.3;
    light.shadowBias = 0.0001;
    this.scene.add( light );
    
  },
  
  initCanvasScene: function (){
    
    // Setting the Canvas renderer
    if ( !this.canvas ) {
      this.renderer = new THREE.CanvasRenderer(  );
    }else{
      this.renderer = new THREE.CanvasRenderer( { canvas: this.canvas } );
    }
    
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }

    this.domContainer.appendChild( this.renderer.domElement );
    
    // Adding pies
    for ( var i=0; i<this.schema.rows.length; i++ ) {
      if( this.dataValues[i] > 0 ){
        this.pies.push( new THREEGRAPHS.PiePart( 
                                this.dataValues[i], 
                                this.totalVal, 
                                THREEGRAPHS.Settings.pieRadius, 
                                this.curAngle, 
                                {x:0,y:0,z:0}, 
                                this.schema.rows[i].color, 
                                THREEGRAPHS.Settings.valTextColor, 
                                "light",
                                 document.getElementById( THREEGRAPHS.Settings.labelId ),
                                { row: this.schema.rows[i].name } 
                              ) );
        this.curAngle = this.pies[this.pies.length-1].addPie(this.scene);
        // Adds the pies objects to ones that need to be checked for intersection
        // This is used for the moseover action
        this.intersobj[this.pies.length-1] = this.pies[this.pies.length-1].pieobj;
        this.intersobj[this.pies.length-1].elemId = this.pies.length-1;
      }
    }
    
    
    // Adding the lights
    var ambientLight = new THREE.AmbientLight( 0x777777 );
    this.scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0x777777 );
    directionalLight.position.x = 0.4;
    directionalLight.position.y = 0.4;
    directionalLight.position.z = - 0.2;
    directionalLight.position.normalize();
    this.scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( 0x777777 );
    directionalLight.position.x = - 0.2;
    directionalLight.position.y = 0.5;
    directionalLight.position.z = - 0.1;
    directionalLight.position.normalize();
    this.scene.add( directionalLight );
    
  },
  
  init: function() { // General scene initialization
    
    var utils = new THREEGRAPHS.Utils( );
    
    // Detecting the renderer:
    var browserRender = utils.detectRenderer ( );

    // Init vars and scene depending on the renderer
    if ( browserRender == 'webgl' ) {
      this.initSceneVars ();
      this.initWebGLScene ();
    }
    else if ( browserRender == 'canvas' ) {
      this.initSceneVars ();
      this.initCanvasScene ();
    }
    else {
      utils.nonSupportedBrowsers();
    }
    
    this.controls = utils.mouseControls ( this.renderer, this.camera , 500, 3500 );
    THREEGRAPHS.animate ( this, 'pie' );
    
  }
  
}



/**
 * AREA CHART OBJECT
 */

THREEGRAPHS.AreaChart = function ( schema ) {
  
  this.schema = schema || 0;
  this.dataValues = [];
  for ( var i=0; i<schema.cols.length; i++ ){
    this.dataValues[i] = [];
    for( var j=0; j<schema.rows.length; j++ ){
      this.dataValues[i][j] = schema.cols[i].values[j];
    }
  }
  
}

THREEGRAPHS.AreaChart.prototype = {
  
  canvas: null,
  domContainer: null,
  constructor: THREEGRAPHS.AreaChart,
  controls: null,
  scene: null,
  camera: null,
  camPos: { x: 500, y: 500, z: 1600 },
  renderer: null,
  projector: null,
  intersectedId: null,
  INTERSECTED: null,
  niceScale: null,
  areas: [],
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
    
    // Removes previous canvas if exists    
    var exCanEl = document.getElementsByTagName("canvas");
    for (var i = exCanEl.length - 1; i >= 0; i--) {
        exCanEl[i].parentNode.removeChild(exCanEl[i]);
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
  
  initWebGLScene : function (){
    
    // Setting the renderer (with shadows)
    if ( !this.canvas ) {
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    }else{
      this.renderer = new THREE.WebGLRenderer( { antialias: true, 
                                                 canvas: this.canvas } );
    }
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // Switch off the shadows for safari due to the three.js bug with it
    if ( navigator.userAgent.indexOf('Safari') == -1 ) {
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
    }
    
    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }
    
    this.domContainer.appendChild( this.renderer.domElement );
    
    //*** Adding the grounds
    // material for the grounds
    var gridTex = THREE.ImageUtils.loadTexture(
                   THREEGRAPHS.Settings.staticUrl+"/grid_pattern1.jpg");
    gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set( 5, 5 );

    var gridTex2 = THREE.ImageUtils.loadTexture(
                    THREEGRAPHS.Settings.staticUrl+"/grid_pattern2.jpg");
    gridTex2.wrapS = gridTex2.wrapT = THREE.RepeatWrapping;
    gridTex2.repeat.set( this.schema.rows.length, this.schema.cols.length );

    var materialX = new THREE.MeshPhongMaterial({
      ambient : 0x444444,
      color : 0x777777,
      shininess : 70, 
      specular : 0x888888,
      shading : THREE.SmoothShading,
      side: THREE.DoubleSide,
      map:gridTex2
    });

    var materialYZ = new THREE.MeshPhongMaterial({
      ambient : 0x444444,
      color : 0x999999,
      shininess : 70, 
      specular : 0x888888,
      shading : THREE.SmoothShading,
      side: THREE.DoubleSide,
      map:gridTex
    });
    
    var sqStep = THREEGRAPHS.Settings.squareStep;
    var valH = THREEGRAPHS.Settings.valHeight

    // Creating the ground-x
    var geometry = new THREE.PlaneGeometry( sqStep*this.schema.rows.length,
                                            sqStep*this.schema.cols.length );

    var groundX = new THREE.Mesh( geometry, materialX );
    groundX.rotation.x -= Math.PI/2;
    groundX.castShadow = false;
    groundX.receiveShadow = true;
    groundX.position.y = THREEGRAPHS.Settings.yDeviation;
    this.scene.add( groundX );

    // Creating the ground-y
    var geometry = new THREE.PlaneGeometry( 
                           sqStep*this.schema.rows.length,
                           valH);

    var groundY = new THREE.Mesh( geometry, materialYZ );
    groundY.castShadow = false;
    groundY.receiveShadow = true;
    groundY.position.z = THREEGRAPHS.Settings.zDeviation;
    this.scene.add( groundY );

    // craating the groynd-z
    var geometry = new THREE.PlaneGeometry( 
                          sqStep*this.schema.cols.length,
                          valH );

    var groundZ = new THREE.Mesh( geometry, materialYZ );
    groundZ.rotation.y -= Math.PI/2;
    groundZ.castShadow = false;
    groundZ.receiveShadow = true;
    groundZ.position.x = THREEGRAPHS.Settings.xDeviation;
    this.scene.add( groundZ );
    //////////////////
    
    //*** Adding texts for the scales
    for( var i=0; i<this.schema.cols.length; i++ ) {
      this.sTextCols[i] = new THREEGRAPHS.ScaleText( this.schema.cols[i].name,
                                "col", i, this.schema.cols[i].color );
      this.sTextCols[i].addText(groundX);
    }

    for( var i=0; i<this.schema.rows.length; i++ ) {
      this.sTextRows[i] = new THREEGRAPHS.ScaleText( this.schema.rows[i].name,
                                "row", i, THREEGRAPHS.Settings.scaleTextColor);
      this.sTextRows[i].addText(groundX);
    }

    var yStep = THREEGRAPHS.Settings.valHeight/this.niceScale.tickNum;
    for ( var i=0; i<= this.niceScale.tickNum; i++ ) {
      var val = this.niceScale.niceMin + i*this.niceScale.tickSpacing;
      var stringVal = val.toString();
      this.sTextVals[i] = new THREEGRAPHS.ScaleText(stringVal, "val", i, 
                                   this.scaleTextColor, yStep);
      this.sTextVals[i].addText(groundZ);
    }
    
    // Adding areas
    for ( var i=0; i<this.schema.cols.length; i++ ) {
      this.areas.push( new THREEGRAPHS.AreaPoly( 
                        this.schema.cols[i].color, 
                        i, 
                        this.dataValues[i], 
                        this.valTextColor,
                        'full', 
                        document.getElementById( THREEGRAPHS.Settings.labelId),
                        { row: this.schema.rows, 
                          col: this.schema.cols[i].name },
                          this.niceScale.niceMin, 
                          this.niceScale.range, 
                          THREEGRAPHS.Settings.valHeight ) );
      this.areas[this.areas.length-1].addArea( this.scene );
      // Adds the areas objects to ones that need to be checked for intersection
      // This is used for the moseover action
      this.intersobj[this.areas.length-1] = this.areas[this.areas.length-1].areaobj;
      this.intersobj[this.areas.length-1].elemId = this.areas.length-1;
    }
    
    // Adding the lights
    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( 1, -1, 1 ).normalize();
    this.scene.add( light );

    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( -1, 1, -1 ).normalize();
    this.scene.add( light );

    light = new THREE.SpotLight( 0xd8d8d8, 2 );
    light.position.set( 600, 3000, 1500 );
    light.target.position.set( 0, 0, 0 );

    light.shadowCameraNear = 1000;
    light.shadowCameraFar = 5000;
    light.shadowCameraFov = 40;
    light.castShadow = true;
    light.shadowDarkness = 0.3;
    light.shadowBias = 0.0001;
    this.scene.add( light );
    
  },
  
  initCanvasScene: function () {
    
    // Setting the Canvas renderer
    if ( !this.canvas ) {
      this.renderer = new THREE.CanvasRenderer(  );
    }else{
      this.renderer = new THREE.CanvasRenderer( { canvas: this.canvas } );
    }
    
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }

    this.domContainer.appendChild( this.renderer.domElement );
    

    // Adding the grounds
    
    var sqStep = THREEGRAPHS.Settings.squareStep;
    var valH = THREEGRAPHS.Settings.valHeight

    var groundSizeX = sqStep*this.schema.rows.length;
    var groundSizeY = sqStep*this.schema.cols.length;
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0xaaaaaa, 
                                                      opacity: 0.8 } );

    // Adding the X ground

    var geometry = new THREE.Geometry();
    // putting the Y vertices
    for ( var i = 0; i <= groundSizeY; i += sqStep ) {
      geometry.vertices.push( new THREE.Vector3(  0, 0, i ) );
      geometry.vertices.push( new THREE.Vector3(  groundSizeX, 0, i ) );
    }
    // putting the X vertices
    for ( var i = 0; i <= groundSizeX; i += sqStep ) {
      geometry.vertices.push( new THREE.Vector3( i, 0, 0 ) );
      geometry.vertices.push( new THREE.Vector3( i, 0, groundSizeY ) );
    }

    // Creating the line object and positioning it
    var groundX = new THREE.Line( geometry, lineMaterial );
    groundX.type = THREE.LinePieces;
    groundX.position.y = THREEGRAPHS.Settings.yDeviation;
    groundX.position.z = THREEGRAPHS.Settings.zDeviation;
    groundX.position.x = THREEGRAPHS.Settings.xDeviation;
    this.scene.add( groundX );

    // Adding the Y ground

    var geometry = new THREE.Geometry();
    // putting the X vertices
    for ( var i = 0; i <= valH; i += sqStep ) {
      geometry.vertices.push( new THREE.Vector3(  0, 0, i ) );
      geometry.vertices.push( new THREE.Vector3(  groundSizeX, 0, i ) );
    }

    // Creating the line object and positioning it
    var groundY = new THREE.Line( geometry, lineMaterial );
    groundY.rotation.set( Math.PI/2, 0, 0 );
    groundY.type = THREE.LinePieces;
    groundY.position.y = -THREEGRAPHS.Settings.yDeviation;
    groundY.position.z = THREEGRAPHS.Settings.zDeviation;
    groundY.position.x = THREEGRAPHS.Settings.xDeviation;
    this.scene.add( groundY );

    // Adding the Y ground

    var geometry = new THREE.Geometry();
    // putting the X vertices
    for ( var i = 0; i <= valH; i += sqStep ) {
      geometry.vertices.push( new THREE.Vector3(  0, 0, i ) );
      geometry.vertices.push( new THREE.Vector3(  groundSizeY, 0, i ) );
    }

    // Creating the line object and positioning it
    var groundZ = new THREE.Line( geometry, lineMaterial );
    groundZ.rotation.set( Math.PI/2, 0, Math.PI/2 );
    groundZ.type = THREE.LinePieces;
    groundZ.position.y = -THREEGRAPHS.Settings.yDeviation;
    groundZ.position.z = THREEGRAPHS.Settings.zDeviation;
    groundZ.position.x = THREEGRAPHS.Settings.xDeviation;
    this.scene.add( groundZ );


    // Adding areas
    for ( var i=0; i<this.schema.cols.length; i++ ) {
      this.areas.push( new THREEGRAPHS.AreaPoly( 
                        this.schema.cols[i].color, 
                        i, 
                        this.dataValues[i], 
                        this.valTextColor,
                        'light', 
                        document.getElementById( THREEGRAPHS.Settings.labelId),
                        { row: this.schema.rows, 
                          col: this.schema.cols[i].name },
                          this.niceScale.niceMin, 
                          this.niceScale.range, 
                          THREEGRAPHS.Settings.valHeight ) );
      this.areas[this.areas.length-1].addArea( this.scene );
      // Adds the areas objects to ones that need to be checked for intersection
      // This is used for the moseover action
      this.intersobj[this.areas.length-1] = this.areas[this.areas.length-1].areaobj;
      this.intersobj[this.areas.length-1].elemId = this.areas.length-1;
    }

    // Adding the lights
    var ambientLight = new THREE.AmbientLight( 0xffffff );
    this.scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
    directionalLight.position.x = 0.4;
    directionalLight.position.y = 0.4;
    directionalLight.position.z = - 0.2;
    directionalLight.position.normalize();
    this.scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
    directionalLight.position.x = - 0.2;
    directionalLight.position.y = 0.5;
    directionalLight.position.z = - 0.1;
    directionalLight.position.normalize();
    this.scene.add( directionalLight );

  },
  
  init: function() { //scene initialization
    
    var utils = new THREEGRAPHS.Utils( );
    
    // Detecting the renderer:
    var browserRender = utils.detectRenderer ( );

    // Init vars and scene depending on the renderer
    if ( browserRender == 'webgl' ) {
      this.initSceneVars ();
      this.initWebGLScene ();
    }
    else if ( browserRender == 'canvas' ) {
      this.initSceneVars ();
      this.initCanvasScene ();
    }
    else {
      utils.nonSupportedBrowsers();
    }
    
    this.controls = utils.mouseControls ( this.renderer, this.camera , 500, 3500 );
    THREEGRAPHS.animate ( this, 'area' );
    
  }
  
}


/**
 * WORLD CHART OBJECT
 */
 
THREEGRAPHS.WorldChart = function ( schema ) {

  this.schema = schema || 0;
  this.dataValues = [];
  for ( var i=0; i<schema.cols.length; i++ ){
    this.dataValues[i] = schema.cols[i].value;
  }

};


THREEGRAPHS.WorldChart.prototype = {
  
  canvas: null,
  browserRender: 'webgl',
  domContainer: null,
  constructor: THREEGRAPHS.WorldChart,
  controls: null,
  scene: null,
  camera: null,
  camPos: { x: 100, y: 100, z: 1800 },
  renderer: null,
  projector: null,
  intersectedId: null,
  INTERSECTED: null,
  niceScales: null,
  bars: [],
  intersobj: [],
  spotLight: null,
  globe: null,
  globeRadius: 750,
  countryFocus: "Libya",
  country : {
    "Afghanistan": {"lat": 33.00, "lng": 65.00},
    "Akrotiri": {"lat": 34.37, "lng": 32.58},
    "Albania": {"lat": 41.00, "lng": 20.00},
    "Algeria": {"lat": 28.00, "lng": 3.00},
    "American Samoa": {"lat": -14.20, "lng": -170.00},
    "Andorra": {"lat": 42.30, "lng": 1.30},
    "Angola": {"lat": -12.30, "lng": 18.30},
    "Anguilla": {"lat": 18.15, "lng": -63.10},
    "Antarctica": {"lat": -90.00, "lng": 0.00},
    "Antigua and Barbuda": {"lat": 17.03, "lng": -61.48},
    "Arctic Ocean": {"lat": 90.00, "lng": 0.00},
    "Argentina": {"lat": -34.00, "lng": -64.00},
    "Armenia": {"lat": 40.00, "lng": 45.00},
    "Aruba": {"lat": 12.30, "lng": -69.58},
    "Ashmore and Cartier Islands": {"lat": -12.14, "lng": 123.05},
    "Atlantic Ocean": {"lat": 0.00, "lng": -25.00},
    "Australia": {"lat": -27.00, "lng": 133.00},
    "Austria": {"lat": 47.20, "lng": 13.20},
    "Azerbaijan": {"lat": 40.30, "lng": 47.30},
    "Bahamas The": {"lat": 24.15, "lng": -76.00},
    "Bahrain": {"lat": 26.00, "lng": 50.33},
    "Bangladesh": {"lat": 24.00, "lng": 90.00},
    "Barbados": {"lat": 13.10, "lng": -59.32},
    "Belarus": {"lat": 53.00, "lng": 28.00},
    "Belgium": {"lat": 50.50, "lng": 4.00},
    "Belize": {"lat": 17.15, "lng": -88.45},
    "Benin": {"lat": 9.30, "lng": 2.15},
    "Bermuda": {"lat": 32.20, "lng": -64.45},
    "Bhutan": {"lat": 27.30, "lng": 90.30},
    "Bolivia": {"lat": -17.00, "lng": -65.00},
    "Bosnia and Herzegovina": {"lat": 44.00, "lng": 18.00},
    "Botswana": {"lat": -22.00, "lng": 24.00},
    "Bouvet Island": {"lat": -54.26, "lng": 3.24},
    "Brazil": {"lat": -10.00, "lng": -55.00},
    "British Indian Ocean Territory": {"lat": -6.00, "lng": 71.30},
    "British Virgin Islands": {"lat": 18.30, "lng": -64.30},
    "Brunei": {"lat": 4.30, "lng": 114.40},
    "Bulgaria": {"lat": 43.00, "lng": 25.00},
    "Burkina Faso": {"lat": 13.00, "lng": -2.00},
    "Burma": {"lat": 22.00, "lng": 98.00},
    "Burundi": {"lat": -3.30, "lng": 30.00},
    "Cambodia": {"lat": 13.00, "lng": 105.00},
    "Cameroon": {"lat": 6.00, "lng": 12.00},
    "Canada": {"lat": 60.00, "lng": -95.00},
    "Cape Verde": {"lat": 16.00, "lng": -24.00},
    "Cayman Islands": {"lat": 19.30, "lng": -80.30},
    "Central African Republic": {"lat": 7.00, "lng": 21.00},
    "Chad": {"lat": 15.00, "lng": 19.00},
    "Chile": {"lat": -30.00, "lng": -71.00},
    "China": {"lat": 35.00, "lng": 105.00},
    "Christmas Island": {"lat": -10.30, "lng": 105.40},
    "Clipperton Island": {"lat": 10.17, "lng": -109.13},
    "Cocos Islands": {"lat": -12.30, "lng": 96.50},
    "Colombia": {"lat": 4.00, "lng": -72.00},
    "Comoros": {"lat": -12.10, "lng": 44.15},
    "Democratic Republic Congo": {"lat": 0.00, "lng": 25.00},
    "Congo Republic of the": {"lat": -1.00, "lng": 15.00},
    "Cook Islands": {"lat": -21.14, "lng": -159.46},
    "Coral Sea Islands": {"lat": -18.00, "lng": 152.00},
    "Costa Rica": {"lat": 10.00, "lng": -84.00},
    "Cote d Ivoire": {"lat": 8.00, "lng": -5.00},
    "Croatia": {"lat": 45.10, "lng": 15.30},
    "Cuba": {"lat": 21.30, "lng": -80.00},
    "Curacao": {"lat": 12.10, "lng": -69.00},
    "Cyprus": {"lat": 35.00, "lng": 33.00},
    "Czech Republic": {"lat": 49.45, "lng": 15.30},
    "Denmark": {"lat": 56.00, "lng": 10.00},
    "Dhekelia": {"lat": 34.59, "lng": 33.45},
    "Djibouti": {"lat": 11.30, "lng": 43.00},
    "Dominica": {"lat": 15.25, "lng": -61.20},
    "Dominican Republic": {"lat": 19.00, "lng": -70.40},
    "Ecuador": {"lat": -2.00, "lng": -77.30},
    "Egypt": {"lat": 27.00, "lng": 30.00},
    "El Salvador": {"lat": 13.50, "lng": -88.55},
    "Equatorial Guinea": {"lat": 2.00, "lng": 10.00},
    "Eritrea": {"lat": 15.00, "lng": 39.00},
    "Estonia": {"lat": 59.00, "lng": 26.00},
    "Ethiopia": {"lat": 8.00, "lng": 38.00},
    "Falkland Islands": {"lat": -51.45, "lng": -59.00},
    "Faroe Islands": {"lat": 62.00, "lng": -7.00},
    "Fiji": {"lat": -18.00, "lng": 175.00},
    "Finland": {"lat": 64.00, "lng": 26.00},
    "France": {"lat": 46.00, "lng": 2.00},
    "French Polynesia": {"lat": -15.00, "lng": -140.00},
    "Gabon": {"lat": -1.00, "lng": 11.45},
    "Gambia The": {"lat": 13.28, "lng": -16.34},
    "Gaza Strip": {"lat": 31.25, "lng": 34.20},
    "Georgia": {"lat": 42.00, "lng": 43.30},
    "Germany": {"lat": 51.00, "lng": 9.00},
    "Ghana": {"lat": 8.00, "lng": -2.00},
    "Gibraltar": {"lat": 36.08, "lng": -5.21},
    "Greece": {"lat": 39.00, "lng": 22.00},
    "Greenland": {"lat": 72.00, "lng": -40.00},
    "Grenada": {"lat": 12.07, "lng": -61.40},
    "Guam": {"lat": 13.28, "lng": 144.47},
    "Guatemala": {"lat": 15.30, "lng": -90.15},
    "Guernsey": {"lat": 49.28, "lng": -2.35},
    "Guinea": {"lat": 11.00, "lng": -10.00},
    "Guinea Bissau": {"lat": 12.00, "lng": -15.00},
    "Guyana": {"lat": 5.00, "lng": -59.00},
    "Haiti": {"lat": 19.00, "lng": -72.25},
    "Heard Island and McDonald Islands": {"lat": -53.06, "lng": 72.31},
    "Vatican City": {"lat": 41.54, "lng": 12.27},
    "Honduras": {"lat": 15.00, "lng": -86.30},
    "Hong Kong": {"lat": 22.15, "lng": 114.10},
    "Hungary": {"lat": 47.00, "lng": 20.00},
    "Iceland": {"lat": 65.00, "lng": -18.00},
    "India": {"lat": 20.00, "lng": 77.00},
    "Indian Ocean": {"lat": -20.00, "lng": 80.00},
    "Indonesia": {"lat": -5.00, "lng": 120.00},
    "Iran": {"lat": 32.00, "lng": 53.00},
    "Iraq": {"lat": 33.00, "lng": 44.00},
    "Ireland": {"lat": 53.00, "lng": -8.00},
    "Isle of Man": {"lat": 54.15, "lng": -4.30},
    "Israel": {"lat": 31.30, "lng": 34.45},
    "Italy": {"lat": 42.50, "lng": 12.50},
    "Jamaica": {"lat": 18.15, "lng": -77.30},
    "Jan Mayen": {"lat": 71.00, "lng": -8.00},
    "Japan": {"lat": 36.00, "lng": 138.00},
    "Jersey": {"lat": 49.15, "lng": -2.10},
    "Jordan": {"lat": 31.00, "lng": 36.00},
    "Kazakhstan": {"lat": 48.00, "lng": 68.00},
    "Kenya": {"lat": 1.00, "lng": 38.00},
    "Kiribati": {"lat": 1.25, "lng": 173.00},
    "Korea North": {"lat": 40.00, "lng": 127.00},
    "Korea South": {"lat": 37.00, "lng": 127.30},
    "Kosovo": {"lat": 42.35, "lng": 21.00},
    "Kuwait": {"lat": 29.30, "lng": 45.45},
    "Kyrgyzstan": {"lat": 41.00, "lng": 75.00},
    "Laos": {"lat": 18.00, "lng": 105.00},
    "Latvia": {"lat": 57.00, "lng": 25.00},
    "Lebanon": {"lat": 33.50, "lng": 35.50},
    "Lesotho": {"lat": -29.30, "lng": 28.30},
    "Liberia": {"lat": 6.30, "lng": -9.30},
    "Libya": {"lat": 25.00, "lng": 17.00},
    "Liechtenstein": {"lat": 47.16, "lng": 9.32},
    "Lithuania": {"lat": 56.00, "lng": 24.00},
    "Luxembourg": {"lat": 49.45, "lng": 6.10},
    "Macau": {"lat": 22.10, "lng": 113.33},
    "Macedonia": {"lat": 41.50, "lng": 22.00},
    "Madagascar": {"lat": -20.00, "lng": 47.00},
    "Malawi": {"lat": -13.30, "lng": 34.00},
    "Malaysia": {"lat": 2.30, "lng": 112.30},
    "Maldives": {"lat": 3.15, "lng": 73.00},
    "Mali": {"lat": 17.00, "lng": -4.00},
    "Malta": {"lat": 35.50, "lng": 14.35},
    "Marshall Islands": {"lat": 9.00, "lng": 168.00},
    "Mauritania": {"lat": 20.00, "lng": -12.00},
    "Mauritius": {"lat": -20.17, "lng": 57.33},
    "Mayotte": {"lat": -12.50, "lng": 45.10},
    "Mexico": {"lat": 23.00, "lng": -102.00},
    "Federated States of Micronesia": {"lat": 6.55, "lng": 158.15},
    "Moldova": {"lat": 47.00, "lng": 29.00},
    "Monaco": {"lat": 43.44, "lng": 7.24},
    "Mongolia": {"lat": 46.00, "lng": 105.00},
    "Montenegro": {"lat": 42.30, "lng": 19.18},
    "Montserrat": {"lat": 16.45, "lng": -62.12},
    "Morocco": {"lat": 32.00, "lng": -5.00},
    "Mozambique": {"lat": -18.15, "lng": 35.00},
    "Namibia": {"lat": -22.00, "lng": 17.00},
    "Nauru": {"lat": -0.32, "lng": 166.55},
    "Navassa Island": {"lat": 18.25, "lng": -75.02},
    "Nepal": {"lat": 28.00, "lng": 84.00},
    "Netherlands": {"lat": 52.30, "lng": 5.45},
    "Netherlands Antilles": {"lat": 12.12, "lng": -68.15},
    "New Caledonia": {"lat": -21.30, "lng": 165.30},
    "New Zealand": {"lat": -41.00, "lng": 174.00},
    "Nicaragua": {"lat": 13.00, "lng": -85.00},
    "Niger": {"lat": 16.00, "lng": 8.00},
    "Nigeria": {"lat": 10.00, "lng": 8.00},
    "Niue": {"lat": -19.02, "lng": -169.52},
    "Norfolk Island": {"lat": -29.02, "lng": 167.57},
    "Northern Mariana Islands": {"lat": 15.12, "lng": 145.45},
    "Norway": {"lat": 62.00, "lng": 10.00},
    "Oman": {"lat": 21.00, "lng": 57.00},
    "Pacific Ocean": {"lat": 0.00, "lng": -160.00},
    "Pakistan": {"lat": 30.00, "lng": 70.00},
    "Palau": {"lat": 7.30, "lng": 134.30},
    "Panama": {"lat": 9.00, "lng": -80.00},
    "Papua New Guinea": {"lat": -6.00, "lng": 147.00},
    "Paracel Islands": {"lat": 16.30, "lng": 112.00},
    "Paraguay": {"lat": -23.00, "lng": -58.00},
    "Peru": {"lat": -10.00, "lng": -76.00},
    "Philippines": {"lat": 13.00, "lng": 122.00},
    "Pitcairn Islands": {"lat": -25.04, "lng": -130.06},
    "Poland": {"lat": 52.00, "lng": 20.00},
    "Portugal": {"lat": 39.30, "lng": -8.00},
    "Puerto Rico": {"lat": 18.15, "lng": -66.30},
    "Qatar": {"lat": 25.30, "lng": 51.15},
    "Romania": {"lat": 46.00, "lng": 25.00},
    "Russia": {"lat": 60.00, "lng": 100.00},
    "Rwanda": {"lat": -2.00, "lng": 30.00},
    "Saint Barthelemy": {"lat": 17.90, "lng": -62.85},
    "Saint Helena Ascension and Tristan da Cunha Saint Helena": {"lat": -15.57, "lng": -5.42},
    "Saint Kitts and Nevis": {"lat": 17.20, "lng": -62.45},
    "Saint Lucia": {"lat": 13.53, "lng": -60.58},
    "Saint Martin": {"lat": 18.05, "lng": -63.57},
    "Saint Pierre and Miquelon": {"lat": 46.50, "lng": -56.20},
    "Saint Vincent and the Grenadines": {"lat": 13.15, "lng": -61.12},
    "Samoa": {"lat": -13.35, "lng": -172.20},
    "San Marino": {"lat": 43.46, "lng": 12.25},
    "Sao Tome and Principe": {"lat": 1.00, "lng": 7.00},
    "Saudi Arabia": {"lat": 25.00, "lng": 45.00},
    "Senegal": {"lat": 14.00, "lng": -14.00},
    "Serbia": {"lat": 44.00, "lng": 21.00},
    "Seychelles": {"lat": -4.35, "lng": 55.40},
    "Sierra Leone": {"lat": 8.30, "lng": -11.30},
    "Singapore": {"lat": 1.22, "lng": 103.48},
    "Sint Maarten": {"lat": 18.4, "lng": -63.4},
    "Slovakia": {"lat": 48.40, "lng": 19.30},
    "Slovenia": {"lat": 46.07, "lng": 14.49},
    "Solomon Islands": {"lat": -8.00, "lng": 159.00},
    "Somalia": {"lat": 10.00, "lng": 49.00},
    "South Africa": {"lat": -29.00, "lng": 24.00},
    "South Georgia and South Sandwich Islands": {"lat": -54.30, "lng": -37.00},
    "South Sudan": {"lat": 4.51, "lng": 31.35},
    "Southern Ocean": {"lat": -60.00, "lng": 90.00},
    "Spain": {"lat": 40.00, "lng": -4.00},
    "Spratly Islands": {"lat": 8.38, "lng": 111.55},
    "Sri Lanka": {"lat": 7.00, "lng": 81.00},
    "Sudan": {"lat": 15.00, "lng": 30.00},
    "Suriname": {"lat": 4.00, "lng": -56.00},
    "Svalbard": {"lat": 78.00, "lng": 20.00},
    "Swaziland": {"lat": -26.30, "lng": 31.30},
    "Sweden": {"lat": 62.00, "lng": 15.00},
    "Switzerland": {"lat": 47.00, "lng": 8.00},
    "Syria": {"lat": 35.00, "lng": 38.00},
    "Taiwan": {"lat": 23.30, "lng": 121.00},
    "Tajikistan": {"lat": 39.00, "lng": 71.00},
    "Tanzania": {"lat": -6.00, "lng": 35.00},
    "Thailand": {"lat": 15.00, "lng": 100.00},
    "Timor Leste": {"lat": -8.50, "lng": 125.55},
    "Togo": {"lat": 8.00, "lng": 1.10},
    "Tokelau": {"lat": -9.00, "lng": -172.00},
    "Tonga": {"lat": -20.00, "lng": -175.00},
    "Trinidad and Tobago": {"lat": 11.00, "lng": -61.00},
    "Tunisia": {"lat": 34.00, "lng": 9.00},
    "Turkey": {"lat": 39.00, "lng": 35.00},
    "Turkmenistan": {"lat": 40.00, "lng": 60.00},
    "Turks and Caicos Islands": {"lat": 21.45, "lng": -71.35},
    "Tuvalu": {"lat": -8.00, "lng": 178.00},
    "Uganda": {"lat": 1.00, "lng": 32.00},
    "Ukraine": {"lat": 49.00, "lng": 32.00},
    "United Arab Emirates": {"lat": 24.00, "lng": 54.00},
    "United Kingdom": {"lat": 54.00, "lng": -2.00},
    "United States": {"lat": 38.00, "lng": -97.00},
    "Uruguay": {"lat": -33.00, "lng": -56.00},
    "Uzbekistan": {"lat": 41.00, "lng": 64.00},
    "Vanuatu": {"lat": -16.00, "lng": 167.00},
    "Venezuela": {"lat": 8.00, "lng": -66.00},
    "Vietnam": {"lat": 16.10, "lng": 107.50},
    "Virgin Islands": {"lat": 18.20, "lng": -64.50},
    "Wake Island": {"lat": 19.17, "lng": 166.39},
    "Wallis and Futuna": {"lat": -13.18, "lng": -176.12},
    "West Bank": {"lat": 32.00, "lng": 35.15},
    "Western Sahara": {"lat": 24.30, "lng": -13.00},
    "Yemen": {"lat": 15.00, "lng": 48.00},
    "Zambia": {"lat": -15.00, "lng": 30.00},
    "Zimbabwe": {"lat": -20.00, "lng": 30.00}
  },
  
  initSceneVars : function () { // Initiates the main scene variable
    
    // crates utils instance in order to use the functions
    var utils =  new THREEGRAPHS.Utils();
    
    // Inits deviation position of the ground from the center
    THREEGRAPHS.Settings.yDeviation = -(THREEGRAPHS.Settings.valHeight/2);
    THREEGRAPHS.Settings.zDeviation = -(this.schema.cols.length*
                                        THREEGRAPHS.Settings.squareStep/2);
    THREEGRAPHS.Settings.xDeviation = -(this.schema.rows.length*
                                        THREEGRAPHS.Settings.squareStep/2);
    
    // Removes previous canvas if exists    
    var exCanEl = document.getElementsByTagName("canvas");
    for (var i = exCanEl.length - 1; i >= 0; i--) {
        exCanEl[i].parentNode.removeChild(exCanEl[i]);
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
  
  initWebGLScene: function (){
    
    // initial setup
    // crates utils instance in order to use the functions
    var utils =  new THREEGRAPHS.Utils();
    
    // Converts numeric degrees to radians
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }
    
    // Setting the renderer (with shadows)
    if ( !this.canvas ) {
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    }else{
      this.renderer = new THREE.WebGLRenderer( { antialias: true, 
                                                 canvas: this.canvas } );
    }
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // Switch off the shadows for safari due to the three.js bug with it
    if ( navigator.userAgent.indexOf('Safari') == -1 ) {
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
    }
    
    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }
    
    this.domContainer.appendChild( this.renderer.domElement );
    
    // Creating the supernova

    // Create particle for glow
    var particles = new THREE.Geometry();
    particles.vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
    gpMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 3800,
            map: THREE.ImageUtils.loadTexture(
                THREEGRAPHS.Settings.staticUrl+"/world_glow.png"
            ),
            blending: THREE.AdditiveBlending,
        });
    var particleGlow = new THREE.ParticleSystem(particles,
                                                gpMaterial);
    particleGlow.sortParticles = true;
    this.scene.add(particleGlow);
    
    
    //Adding the globe
    
    // setting up the defuse map
    var matDif = THREE.ImageUtils.loadTexture( 
                      THREEGRAPHS.Settings.staticUrl+"/world_diffuse.jpg");
    
    // setting up the bump map
    var mapBump = THREE.ImageUtils.loadTexture( 
                        THREEGRAPHS.Settings.staticUrl+"/world_bump.jpg" );
    mapBump.anisotropy = 1;
    mapBump.repeat.set( 1, 1 );
    mapBump.offset.set( 0, 0 )
    mapBump.wrapS = mapBump.wrapT = THREE.RepeatWrapping;
    mapBump.format = THREE.RGBFormat;
    
    // setting up the material
    var sphereMaterial = new THREE.MeshPhongMaterial({
      ambient : 0x444444,
      color : 0x777777,
      shininess : 40, 
      specular : 0x222222,
      shading : THREE.SmoothShading,
      side: THREE.DoubleSide,
      map:matDif,
      bumpMap:mapBump,
      bumpScale: 10
    });
    
    // creaing the mesh
    this.globe = new THREE.Mesh(new THREE.SphereGeometry( this.globeRadius,
                                                          32,
                                                          32),
                                sphereMaterial);
    this.globe.receiveShadow = true;
    // add the globe to the scene
    this.scene.add( this.globe ); 
    
    // Calcluate scales
    this.niceScale = new THREEGRAPHS.NiceScale ( 
      utils.getMinArr ( [this.dataValues] ),
      utils.getMaxArr ( [this.dataValues] ) 
    );
    this.niceScale.calculate ();
    
    // Creating the bars and attaching them to the globe 
    for ( var i=0; i<this.schema.cols.length; i++ ) {
      if( this.dataValues[i] > 0 ) {
        // crating the bar object
        this.bars.push( new THREEGRAPHS.BarCube( 
                            this.schema.cols[i].color, 
                            0, 
                            i,
                            this.dataValues[i], 
                            THREEGRAPHS.Settings.valTextColor,
                            'full', 
                            document.getElementById( THREEGRAPHS.Settings.labelId ),
                            { row: this.schema.rows[0].name,
                              col: this.schema.cols[i].name },
                              this.niceScale.niceMin,
                              this.niceScale.range,
                              THREEGRAPHS.Settings.valHeight,
                              20 ) );
        // removeing the 3d label
        this.bars[this.bars.length-1].hasLabel = false;
        // getting the country from the country list
        var c = this.country[this.schema.cols[i].name];
        // add dummy object along wich we can rotate the bar for the longitute
        this.bars[this.bars.length-1].dummyLng = new THREE.Mesh( 
          new THREE.PlaneGeometry( 1, 1, 0, 0 ),
          new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
        this.globe.add(this.bars[this.bars.length-1].dummyLng);
        // add dummy object along wich we can rotate the bar for the latitude
        this.bars[this.bars.length-1].dummyLat = new THREE.Mesh( 
          new THREE.PlaneGeometry( 1, 1, 0, 0 ),
          new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
        this.bars[this.bars.length-1].dummyLng.add(
          this.bars[this.bars.length-1].dummyLat);
        // adding the bar to the scene and positioning it to the earth surface
        this.bars[this.bars.length-1].addBar(
          this.bars[this.bars.length-1].dummyLat);
        this.bars[this.bars.length-1].reposition(
          0, this.globeRadius+this.bars[this.bars.length-1].h/2, 0);
        // rotating the dummy object so that it snaps to the correct country
        this.bars[this.bars.length-1].dummyLng.rotation.y = 
          Math.PI + (c.lng).toRad();
        this.bars[this.bars.length-1].dummyLat.rotation.x = 
          Math.PI/2 - (c.lat).toRad();
        // adding the bar to the intersection objects
        this.intersobj[this.bars.length-1] = 
          this.bars[this.bars.length-1].barobj;
        this.intersobj[this.bars.length-1].elemId = this.bars.length-1;
      }
    }
    
    // focus the globe on a certain country
    var cfoc = this.country[this.countryFocus];
    this.globe.rotation.set(cfoc.lat.toRad(), Math.PI - cfoc.lng.toRad(), 0);
    
    // Adding the lights
    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( -1, 0, 1 ).normalize();
    this.scene.add( light );
    
    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( 0, 1, -1 ).normalize();
    this.scene.add( light );
    
    var light = new THREE.DirectionalLight( 0x999999 );
    light.position.set( 1, 0, -1 ).normalize();
    this.scene.add( light );
    
    this.spotLight = new THREE.SpotLight( 0xFFFFFF, 2 );
    this.spotLight.position.set( this.camPos.x, this.camPos.y, this.camPos.z );
    this.spotLight.target.position.set( 0, 0, 0 );
    
    this.spotLight.shadowCameraNear = 1;
    this.spotLight.shadowCameraFar = 3000;
    this.spotLight.shadowCameraFov = 100;
    this.spotLight.castShadow = true;
    this.spotLight.shadowDarkness = 0.4;
    this.spotLight.shadowBias = 0.001;
    // spotLight.shadowCameraVisible  = true;
    this.scene.add( this.spotLight );
    
  },
  
  initCanvasScene: function () {
    
    // initial setup
    // crates utils instance in order to use the functions
    var utils =  new THREEGRAPHS.Utils();
    
    // Converts numeric degrees to radians
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }
    
    // Setting the Canvas renderer
    if ( !this.canvas ) {
      this.renderer = new THREE.CanvasRenderer(  );
    }else{
      this.renderer = new THREE.CanvasRenderer( { canvas: this.canvas } );
    }
    
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    if ( !this.domContainer ) {
      this.domContainer = document.createElement( 'div' );
      document.body.appendChild( this.domContainer );
    } else {
      this.domContainer = document.getElementById ( this.domContainer );
    }

    this.domContainer.appendChild( this.renderer.domElement );
    
    // MAterials
    var mapText = THREE.ImageUtils.loadTexture( THREEGRAPHS.Settings.staticUrl
                                        +"/world_mapplain2.jpg");
    var material = new THREE.MeshBasicMaterial( { map: mapText, overdraw: true } );
    
    // Calcluate scales
    this.niceScale = new THREEGRAPHS.NiceScale ( 
      utils.getMinArr ( [this.dataValues] ),
      utils.getMaxArr ( [this.dataValues] ) 
    );
    this.niceScale.calculate ();
    
    // the globe
    this.globe = new THREE.Mesh(new THREE.SphereGeometry( this.globeRadius,
                                                          16,
                                                          16),
                                                        material);
    this.scene.add( this.globe );
    
    for ( var i=0; i<this.schema.cols.length; i++ ) {
      if( this.dataValues[i] > 0 ) {
        // crating the bar object
        this.bars.push( new THREEGRAPHS.BarCube( 
                            this.schema.cols[i].color, 
                            0, 
                            i,
                            this.dataValues[i], 
                            THREEGRAPHS.Settings.valTextColor,
                            'light', 
                            document.getElementById( THREEGRAPHS.Settings.labelId ),
                            { row: this.schema.rows[0].name,
                              col: this.schema.cols[i].name },
                              this.niceScale.niceMin,
                              this.niceScale.range,
                              THREEGRAPHS.Settings.valHeight,
                              20 ) );
        // removeing the 3d label
        this.bars[this.bars.length-1].hasLabel = false;
        // getting the country from the country list
        var c = this.country[this.schema.cols[i].name];
        // add dummy object along wich we can rotate the bar for the longitute
        this.bars[this.bars.length-1].dummyLng = new THREE.Mesh( 
          new THREE.PlaneGeometry( 1, 1, 0, 0 ),
          new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
        this.globe.add(this.bars[this.bars.length-1].dummyLng);
        // add dummy object along wich we can rotate the bar for the latitude
        this.bars[this.bars.length-1].dummyLat = new THREE.Mesh( 
          new THREE.PlaneGeometry( 1, 1, 0, 0 ),
          new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
        this.bars[this.bars.length-1].dummyLng.add(
          this.bars[this.bars.length-1].dummyLat);
        // adding the bar to the scene and positioning it to the earth surface
        this.bars[this.bars.length-1].addBar(
          this.bars[this.bars.length-1].dummyLat);
        this.bars[this.bars.length-1].reposition(
          0, this.globeRadius+this.bars[this.bars.length-1].h/2, 0);
        // rotating the dummy object so that it snaps to the correct country
        this.bars[this.bars.length-1].dummyLng.rotation.y = 
          Math.PI + (c.lng).toRad();
        this.bars[this.bars.length-1].dummyLat.rotation.x = 
          Math.PI/2 - (c.lat).toRad();
        // adding the bar to the intersection objects
        this.intersobj[this.bars.length-1] = 
          this.bars[this.bars.length-1].barobj;
        this.intersobj[this.bars.length-1].elemId = this.bars.length-1;
      }
    }
    
    // focus the globe on a certain country
    var cfoc = this.country[this.countryFocus];
    this.globe.rotation.set(cfoc.lat.toRad(), Math.PI - cfoc.lng.toRad(), 0);

    // Adding the lights 
    var ambientLight = new THREE.AmbientLight( 0xffffff );
    this.scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
    directionalLight.position.x = 0.4;
    directionalLight.position.y = 0.4;
    directionalLight.position.z = - 0.2;
    directionalLight.position.normalize();
    this.scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
    directionalLight.position.x = - 0.2;
    directionalLight.position.y = 0.5;
    directionalLight.position.z = - 0.1;
    directionalLight.position.normalize();
    this.scene.add( directionalLight );
    //******************************
    
  },
  
  init: function() { //scene initialization
    
    var utils = new THREEGRAPHS.Utils( );
    
    // Detecting the renderer:
    this.browserRender = utils.detectRenderer ( );

    // Init vars and scene depending on the renderer
    if ( this.browserRender == 'webgl' ) {
      this.initSceneVars ();
      this.initWebGLScene ();
    }
    else if ( this.browserRender == 'canvas' ) {
      this.initSceneVars ();
      this.initCanvasScene ();
    }
    else {
      utils.nonSupportedBrowsers();
    }
    
    this.controls = utils.mouseControls ( this.renderer, this.camera , 1200, 2800 );
    THREEGRAPHS.animate ( this, 'world' );
    
  }
  
};
