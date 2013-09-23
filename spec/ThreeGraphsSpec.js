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
    expect( utils.colorLuminance('d17100',0.5) ).toEqual('ffaa00');
  });
  
  it("should get the maximal value in a 2-dimensional array", function( ) {
    expect( utils.getMaxArr([[5,3,1,12],[7,2,4]]) ).toEqual(12);
  });
  
  it("should get the minumal value in a 2-dimensional array", function( ) {
    expect( utils.getMinArr([[5,3,1,12],[7,2,4]]) ).toEqual(1);
  });
  
  it("should calculate the round of a max number", function( ) {
    expect( utils.getRoundMax(3.892) ).toEqual(3);
  });
  
  it("should count the total number of elements in a two dimentional array", function( ) {
    expect( utils.getTotalArr([[5,3,1,12],[7,2,4]]) ).toEqual(7);
  });
  
});