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

var buildTwilio = function(){
  Twilio = {
    // Throws an error unless overridden
    require: function(lib){ undefined.apply(); }
  };
};

var buildTwilioConnection = function(){
  Twilio.ConnectionCallbacks = {};
  Twilio.Connection = function(){};
  Twilio.Connection.prototype = {
    accept:     function(fun){ Twilio.ConnectionCallbacks.accept     = fun; },
    cancel:     function(fun){ Twilio.ConnectionCallbacks.cancel     = fun; },
    disconnect: function(fun){ Twilio.ConnectionCallbacks.disconnect = fun; },
    error:      function(fun){ Twilio.ConnectionCallbacks.error      = fun; },
    mute:       function(){},
    unmute:     function(){},
    sendDigits: function(){},
    status:     function(){return "pending";},
    properties: {received: "params"}
  };
};

var buildTwilioDevice = function(){
  Twilio.DeviceCallbacks = {};
  Twilio.Device = {
    setup:      function(token,params){ return Twilio.Device; },
    ready:      function(fun){ Twilio.DeviceCallbacks.ready             = fun; },
    offline:    function(fun){ Twilio.DeviceCallbacks.offline           = fun; },
    incoming:   function(fun){ Twilio.DeviceCallbacks.incoming          = fun; },
    cancel:     function(fun){ Twilio.DeviceCallbacks.cancel            = fun; },
    connect:    function(fun_or_params){ Twilio.DeviceCallbacks.connect = fun_or_params; return new Twilio.Connection(); },
    disconnect: function(fun){ Twilio.DeviceCallbacks.disconnect        = fun; },
    presence:   function(fun){ Twilio.DeviceCallbacks.presence          = fun; },
    error:      function(fun){ Twilio.DeviceCallbacks.error             = fun; },

    showPermissionsDialog: function(){
      var e = document.createElement("div");
      var attr = document.createAttribute("style");
      attr.value = "position: fixed; z-index: 99999; top: 0px; left: 0px; width: 100%; height: auto; overflow: hidden; visibility: visible;";
      e.setAttributeNode(attr);
      e.innerHTML = '<div><object type="application/x-shockwave-flash" id="__connectionFlash__" style="visibility: visible;"></object><button>Close</button></div>';
      fixtureBlock().appendChild(e);
    }
  };
};

var resetMocks = function(){
  buildTwilio();
  buildTwilioConnection();
  buildTwilioDevice();
};

var resetClasses = function(){
  com.jivatechnology.TwitTwilio.Device.resetInstance("TESTING");
  com.jivatechnology.TwitTwilio.Connection.reset("TESTING");
};
