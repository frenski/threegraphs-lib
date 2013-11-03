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
       this.hasHTMLLabel.innerHTML = val;
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


THREEGRAPHS.animate = function ( obj ){
  
  var animateSc = function (){
    
    requestAnimationFrame( animateSc );
    
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
          obj.bars[obj.intersectedId].hideLabel();
        }
        obj.INTERSECTED = intersects[ 0 ].object;
        obj.INTERSECTED.currentHex = obj.INTERSECTED.material.emissive.getHex();
        obj.INTERSECTED.material.emissive.setHex( 
          parseInt( obj.bars[intersects[0].object.barid].darklumcolor, 16 ) );
        obj.bars[intersects[0].object.barid].showLabel( actCoord.x, 
                                                         actCoord.y );
        obj.intersectedId = intersects[0].object.barid;
      }
    } else {
      if ( obj.INTERSECTED ) {
        obj.INTERSECTED.material.emissive.setHex( 
          obj.INTERSECTED.currentHex );
        obj.bars[obj.intersectedId].hideLabel();
      }
      obj.intersectedId = null;
      obj.INTERSECTED = null;
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
                document.getElementById( THREEGRAPHS.Settings.labelId),
                { row:this.schema.rows[i].name, 
                  col:this.schema.cols[j].name },
                  this.niceScale.niceMin, 
                  this.niceScale.range, 
                  this.valHeight ) );
        this.bars[this.bars.length-1].addBar(this.scene);
        // Adds the bars objects to ones that need to be checked for intersection
        // This is used for the moseover action
        this.intersobj[this.bars.length-1] = this.bars[this.bars.length-1].barobj;
        this.intersobj[this.bars.length-1].barid = this.bars.length-1;
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
      for ( var i=0; i<this.schema.cols.length; i++ ) {
        for (var j=0; j<this.schema.rows.length; j++ ) {
          this.bars.push( new THREEGRAPHS.BarCube( 
                this.schema.cols[i].color, j, i, this.dataValues[i][j],
                THREEGRAPHS.Settings.valTextColor, 'light',
                document.getElementById( THREEGRAPHS.Settings.labelId),
                { row:this.schema.rows[j].name, 
                  col:this.schema.cols[i].name },
                  this.niceScale.niceMin, 
                  this.niceScale.range, 
                  this.valHeight ) );
          this.bars[this.bars.length-1].hasLabel = false;               
          this.bars[this.bars.length-1].addBar(this.scene);
          // Adds the bars objects to ones that need to be checked for intersection
          // This is used for the moseover action
          this.intersobj[this.bars.length-1] = this.bars[this.bars.length-1].barobj;
          this.intersobj[this.bars.length-1].barid = this.bars.length-1;
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
    THREEGRAPHS.animate ( this );
    
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
    this.totalVal = utils.getTotalArr ( this.dataValues ); 
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
    
  }
  
}

