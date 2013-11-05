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
  var nCube = new THREEGRAPHS.BarCube( "CC0000", 0, 0, 7, "ffffff", 'full', false, { row:"row", col:"col" }, 0, 10, 10, 100 );
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
  
  it ( 'should instantiate the WebGL renderer', function () {
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
    expect( newBarChart.scene.__lights[2].position.x).toEqual(600);
  });
  
  it( 'should init the controls', function () {
    newBarChart = null;
    newBarChart = new THREEGRAPHS.BarChart ( sData );
    newBarChart.init();
    expect( newBarChart.controls ).not.toEqual( null );
  });
  
  it ( 'should instantiate the Canvas renderer', function () {
    newBarChart = null;
    newBarChart = new THREEGRAPHS.BarChart ( sData );
    newBarChart.initSceneVars();
    newBarChart.initCanvasScene();
    expect( newBarChart.renderer.domElement ).toBeDefined();
  });
  
});


describe("Pie charts", function () {
  
  var sData;
  var newPieChart;
  var sData = { 
          rows: [ { name:"row1", color:"CC0000", value: 5 }, 
                 { name:"row2", color:"00CC00", value: 2 },
                 { name:"row3", color:"0000CC", value: 12 }
               ]
    };
  
  it ( 'should instantiate the data variables', function () {
    newPieChart = new THREEGRAPHS.PieChart ( sData );
    expect( newPieChart.dataValues[0] ).toEqual(5);
  });
  
  it ( ' should instantiate the scene variables ', function (){
    newPieChart.initSceneVars();
    expect( newPieChart.scene.visible ).toEqual(true);
    expect( newPieChart.camera.position.x ).toEqual(500);
    expect( THREEGRAPHS.Settings.zDeviation ).toEqual(-200);
  });
  
  it ( 'should instantiate the WebGL renderer', function () {
    newPieChart.initWebGLScene();
    expect( newPieChart.renderer.domElement ).toBeDefined();
  });
  
  it( 'should create pies with the same amount as the data itmes', function () {
    expect( newPieChart.pies.length ).toEqual(3);
  });
  
  it( 'should create lights', function () {
    expect( newPieChart.scene.__lights[2].position.x).toEqual(600);
  });
  
  it( 'should init the controls', function () {
    newPieChart = null;
    newPieChart = new THREEGRAPHS.PieChart ( sData );
    newPieChart.init();
    expect( newPieChart.controls ).not.toEqual( null );
  });
  
  it ( 'should instantiate the Canvas renderer', function () {
    newPieChart = null;
    newPieChart = new THREEGRAPHS.PieChart ( sData );
    newPieChart.initSceneVars();
    newPieChart.initCanvasScene();
    expect( newPieChart.renderer.domElement ).toBeDefined();
  });

});


describe("Area charts", function () {
  
  var sData;
  var newAreaChart;
  var sData = { 
          cols: [ { name:"col1", color:"CC0000", values: [5,6,9] }, 
                 { name:"col2", color:"00CC00", values: [5,9,1] }
               ],
         rows: [ { name: "row 1" }, 
                 { name: "row 2" }
               ]
    };
    
  it ( 'should instantiate the data variables', function () {
    newAreaChart = new THREEGRAPHS.AreaChart ( sData );
    expect( newAreaChart.dataValues[0][0] ).toEqual(5);
  });
  
  it ( ' should instantiate the scene variables ', function (){
    newAreaChart.initSceneVars();
    expect( newAreaChart.scene.visible ).toEqual(true);
    expect( newAreaChart.camera.position.x ).toEqual(500);
    expect( THREEGRAPHS.Settings.zDeviation ).toEqual(-200);
  });
  
  it ( 'should instantiate the WebGL renderer', function () {
    newAreaChart.initWebGLScene();
    expect( newAreaChart.renderer.domElement ).toBeDefined();
  });
  
  it ( 'should add 3 grounds', function () {
    expect( newAreaChart.scene.children[0].geometry.vertices.length ).toEqual(4);
    expect( newAreaChart.scene.children[1].geometry.vertices.length ).toEqual(4);
    expect( newAreaChart.scene.children[2].geometry.vertices.length ).toEqual(4);
  });
  
  it( 'should add text for the scales', function () {
    expect( newAreaChart.sTextCols[0].txtobj.geometry ).toBeDefined();
  });
  
  it( 'should create bars with the same amount as the data itmes', function () {
    expect( newAreaChart.areas.length ).toEqual(2);
  });
  
  it( 'should create lights', function () {
    expect( newAreaChart.scene.__lights[2].position.x).toEqual(600);
  });
  
  it( 'should init the controls', function () {
    newAreaChart = null;
    newAreaChart = new THREEGRAPHS.AreaChart ( sData );
    newAreaChart.init();
    expect( newAreaChart.controls ).not.toEqual( null );
  });
  
  it ( 'should instantiate the Canvas renderer', function () {
    newAreaChart = null;
    newAreaChart = new THREEGRAPHS.AreaChart ( sData );
    newAreaChart.initSceneVars();
    newAreaChart.initCanvasScene();
    expect( newAreaChart.renderer.domElement ).toBeDefined();
  });
    
});

describe("World charts", function () {

  var sData;
  var newWorldChart;
  sData = { cols: [
                     { name:"Austria", color:"E28105", value: 32400 }, 
                     { name:"Belgium", color:"E28105", value: 29900 }, 
                     { name:"Bulgaria", color:"E28105", value: 11600 }
                    ],
                    rows:[{name:"Value info"}]
                  }

  it ( 'should instantiate the data variables', function () {
    newWorldChart = new THREEGRAPHS.WorldChart ( sData );
    expect( newWorldChart.dataValues[1] ).toEqual(29900);
  });
  
  it ( ' should instantiate the scene variables ', function (){
    newWorldChart.initSceneVars();
    expect( newWorldChart.scene.visible ).toEqual(true);
    expect( newWorldChart.camera.position.x ).toEqual(100);
  });
  
  it ( 'should instantiate the WebGL renderer', function () {
    newWorldChart.initWebGLScene();
    expect( newWorldChart.renderer.domElement ).toBeDefined();
  });
  
  it( 'should create globe', function () {
    expect( newWorldChart.globe.geometry.radius ).toEqual(750);
  });
  
  it( 'should create bars with the same amount as the data itmes', function () {
    expect( newWorldChart.bars.length ).toEqual(3);
  });
  
  it( 'should create lights', function () {
    expect( Math.ceil(newWorldChart.scene.__lights[2].position.x) ).toEqual(1);
  });
  
  it( 'should init the controls', function () {
    newWorldChart = null;
    newWorldChart = new THREEGRAPHS.WorldChart ( sData );
    newWorldChart.init();
    expect( newWorldChart.controls ).not.toEqual( null );
  });
  
  it ( 'should instantiate the Canvas renderer', function () {
    newWorldChart = null;
    newWorldChart = new THREEGRAPHS.WorldChart ( sData );
    newWorldChart.initSceneVars();
    newWorldChart.initCanvasScene();
    expect( newWorldChart.renderer.domElement ).toBeDefined();
  });

});