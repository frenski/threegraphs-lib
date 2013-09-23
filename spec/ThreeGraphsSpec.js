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
  
});