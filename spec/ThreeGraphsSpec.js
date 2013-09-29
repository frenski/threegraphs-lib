 /* 
  * Specs for the Utils class
  */

describe("Utils", function() {
  
  var utils = new THREEGRAPHS.Utils( );
  
  it("should check if it's a touch device", function( ) {  
    var uagent = navigator.userAgent.toLowerCase( );
    if ( uagent.search("iphone") > -1 ){
      expect( utils.isTouchDevice ( ) ).toBeTruthy();
    }else{
      expect( utils.isTouchDevice ( ) ).toBeFalsy();
    }
  });
  
  it("should calculate the luminance of a colour", function( ) {
    expect( utils.colorLuminance('d17100',0.5) ).toEqual( 'ffaa00' );
  });
  
  it("should get the maximal value in a 2-dimensional array", function( ) {
    expect( utils.getMaxArr([[5,3,1,12],[7,2,4]]) ).toEqual( 12 );
  });
  
  it("should get the minumal value in a 2-dimensional array", function( ) {
    expect( utils.getMinArr([[5,3,1,12],[7,2,4]]) ).toEqual( 1 );
  });
  
  it("should calculate the round of a max number", function( ) {
    expect( utils.getRoundMax(98) ).toEqual( 100 );
  });
  
  it("should count the sum of all elements in a two dimentional array", function( ) {
    expect( utils.getTotalArr([[5,3,1,12],[7,2,4]]) ).toEqual( 34 );
  });
  
  it("should initiate the legend div", function( ) {
    var data = {  cols: [ { name:"2010", color:"d17100" }, 
                          { name:"2011", color:"d9bd00" } ],
                  rows: [ { name: "Product 1" } ]
                };
    var el = document.createElement('div');
    utils.initLegend(el, data);
    var col1 = el.getElementsByTagName("div");
    expect( col1[0].style.backgroundColor ).toEqual( 'rgb(209, 113, 0)' );
  });
  
  it("should generate the Three.js mouse controls", function( ) {
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    var camera = new THREE.PerspectiveCamera( 60, 
                                        window.innerWidth/window.innerHeight,
                                        1, 
                                        5000 );
    var controls = utils.mouseControls ( renderer, camera, 100, 1000 );
    expect( controls.minDistance ).toEqual( 100 );
  });
  
  it("should detect the browser", function( ){
    var agent = navigator.userAgent;
    var canSupport = 0;
    if ( agent.indexOf('Firefox') != -1 ){
      canSupport = 1;
      if ( parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 4 ){
        canSupport = 2;
      }
    }
    if ( agent.indexOf('Chrome') != -1 ){
      canSupport = 1;
      if ( parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome') + 7).split(' ')[0]) >= 7 ){
        canSupport = 2;
      }
    }
    if ( agent.indexOf('Safari') != -1 ){
      canSupport = 1;
      if ( parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Version') + 8).split(' ')[0]) >= 5.1 ){
        canSupport = 2;
      }
    }
    if ( navigator.appName.indexOf("Internet Explorer")!=-1 ){
      if ( navigator.appVersion.indexOf("MSIE 9") == -1 && navigator.appVersion.indexOf("MSIE 10") == -1 ) canSupport = 1;
      if ( navigator.appVersion.indexOf("MSIE 11") == -1 ) canSupport = 2;
    }
    
    if ( canSupport == 0 ){
      expect( utils.detectRenderer() ).toEqual( 'none' );
    } else if ( canSupport == 1 ){
      expect( utils.detectRenderer() ).toEqual( 'canvas' );
    } else if ( canSupport == 2 ){
      expect( utils.detectRenderer() ).toEqual( 'webgl' );
    }
    
  });
  
});


 /* 
  * Specs for the Bar Cubes class
  */

describe("Bar Cube", function() {
  
  var scene = new THREE.Scene();
  
  var label = document.createElement('div');
  var nCube = new THREEGRAPHS.BarCube( "d9bd00", 0, 0, 7, "ffffff", 'full', false, { row:"row", col:"col" }, 0, 10, 10 );
  nCube.addBar ( scene );
  
  it ( 'should create a new bar object', function () {
    expect ( nCube.barobj.geometry ).toBeDefined();
  });
  
  it ( 'should have a width size equate to the sqare size defined', function () {
    expect ( nCube.barobj.geometry.width ).toEqual( THREEGRAPHS.Settings.squareSize );
  });
  
});


 /* 
  * Specs for the Bar Cubes class
  */

describe("Pie Parts", function() {
  
  var scene = new THREE.Scene();
  
  it ( 'should create a new pie object', function () {
    var label = document.createElement('div');
    var pieP = new THREEGRAPHS.PiePart( 7, 20, 500, 0, {x:0,y:0},
                                        "d9bd00", "ffffff", 'full', false,
                                        { col:"col" } );
    pieP.addPie ( scene );
    expect ( pieP.pieobj.geometry ).toBeDefined();
  });
  
});