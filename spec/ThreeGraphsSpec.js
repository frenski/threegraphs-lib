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
      if ( parseFloat(agent.substring(agent.indexOf('Firefox') + 8)) >= 4 ){
        canSupport = 2;
      }
    }
    if ( agent.indexOf('Chrome') != -1 ){
      canSupport = 1;
      if ( parseFloat(agent.substring(agent.indexOf('Chrome') + 7).split(' ')[0]) >= 7 ){
        canSupport = 2;
      }
    }
    if ( agent.indexOf('Safari') != -1 ){
      canSupport = 1;
      if ( parseFloat(agent.substring(agent.indexOf('Version') + 8).split(' ')[0]) >= 5.1 ){
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
  var nCube = new THREEGRAPHS.BarCube( "CC0000", 0, 0, 7, "ffffff", 'full', false, { row:"row", col:"col" }, 0, 10, 10 );
  nCube.addBar ( scene );
  
  it ( 'should create a new bar object', function () {
    expect ( nCube.barobj.geometry ).toBeDefined();
  });
  
  it ( 'should have a width equal to the sqare size defined', function () {
    expect ( nCube.barobj.geometry.width ).toEqual( THREEGRAPHS.Settings.squareSize );
  });
  
  it ( 'should have a height equal to value percentage ot the max value and the height of the scales', function () {
    expect ( nCube.barobj.geometry.height ).toEqual( 700 );
  });
  
  it ( 'should have an RGB colour equal to the hex one defined', function () {
    expect ( nCube.barobj.material.color.toString() ).toEqual( ({ r:0.8, g:0, b:0 }).toString() );
  });
});


 /* 
  * Specs for the Bar Cubes class
  */

describe("Pie Parts", function() {
  
  var scene = new THREE.Scene();
  var label = document.createElement('div');
  var pieP = new THREEGRAPHS.PiePart( 7, 20, 500, 0, {x:0,y:0},
                                      "CC0000", "ffffff", 'full', false,
                                      { col:"col" } );
  pieP.addPie ( scene );
  
  it ( 'should create a new pie object', function () {
    expect ( pieP.pieobj.geometry ).toBeDefined();
  });
  
  it ( 'should have an RGB colour equal to the hex one defined', function () {
    expect ( pieP.pieobj.material.color.toString() ).toEqual( ({ r:0.8, g:0, b:0 }).toString() );
  });
  
});


describe("Area Pollies", function() {
  
  var scene = new THREE.Scene();
  var label = document.createElement('div');
  var nArea = new THREEGRAPHS.AreaPoly( "CC0000", 0, [3,7,2], "ffffff", 'full', false, { row:"row", col:"col" }, 0, 10, 10 );
  nArea.addArea ( scene );
  
  it ( 'should create a new area object', function () {
    expect ( nArea.areaobj.geometry ).toBeDefined();
  });
  
  it ( 'should have an RGB colour equal to the hex one defined', function () {
    expect ( nArea.areaobj.material.color.toString() ).toEqual( ({ r:0.8, g:0, b:0 }).toString() );
  });
  
});


describe("Bar charts", function () {
  
  var sData;
  var newBarChart;
  var sData = { 
          cols: [ { name:"col1", color:"CC0000" }, 
                 { name:"col2", color:"00CC00" }
               ],
         rows: [ { name: "row 1", values: [5,6] }, 
                 { name: "row 2", values: [3,9] }
               ]
    };
  
  it ( 'should instantiate the data variables', function () {
    newBarChart = new THREEGRAPHS.BarChart ( sData );
    expect( newBarChart.dataValues[0][0] ).toEqual(5);
  });

  
  it ( ' should instantiate the scene variables ', function (){
    newBarChart.initSceneVars();
    expect( newBarChart.scene.visible ).toEqual(true);
    expect( newBarChart.camera.position.x ).toEqual(500);
    expect( THREEGRAPHS.Settings.zDeviation ).toEqual(-200);
  });
  
  it ( 'should instantiate the renderer', function () {
    newBarChart.initWebGLScene();
    expect( newBarChart.renderer.domElement ).toBeDefined();
  });

  it ( 'should add 3 grounds', function () {
    expect( newBarChart.scene.children[0].geometry.vertices.length ).toEqual(4);
    expect( newBarChart.scene.children[1].geometry.vertices.length ).toEqual(4);
    expect( newBarChart.scene.children[2].geometry.vertices.length ).toEqual(4);
  });
  
  it( 'should add text for the scales', function () {
    expect( newBarChart.sTextCols[0].txtobj.geometry ).toBeDefined();
  });
  
  it( 'should create bars with the same amount as the data itmes', function () {
    expect( newBarChart.bars.length ).toEqual(4);
  });
  
  it( 'should create lights', function () {
    console.log ( newBarChart.scene );
    expect( newBarChart.scene.__lights[2].position.x).toEqual(600);
  });
  
});