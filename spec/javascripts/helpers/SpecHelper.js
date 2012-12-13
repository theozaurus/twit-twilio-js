beforeEach(function() {
  this.addMatchers({
    toBeAnInstanceOf: function(expectedClass) {
      var instance = this.actual;
      return instance instanceof expectedClass;
    }
  });
});

var fixtureBlock = function(){
  return document.getElementById("jasmine_content");
};

var fixtureClear = function(){
  var e = document.getElementById("jasmine_content");
  if(e){
    var childCount = e.childNodes.length;
    for (var i = childCount -1; i >= 0; i--){
      e.removeChild(e.childNodes[i]);
    }
  }
};
