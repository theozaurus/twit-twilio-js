


if ("undefined" == typeof com) { var com = {}; }
if (!com.jivatechnology) { com.jivatechnology = {}; }

com.jivatechnology.TwitTwilio = {};
if ("undefined" == typeof com) { var com = {}; }
if (!com.jivatechnology) { com.jivatechnology = {}; }

// this module function is called with com.jivatechnology as 'this'
(function(){

  var scope = this;

  this.Callback = (function(){

    // Return the constructor
    return function(opts){

      var options = opts;

      // Checks
      if(typeof options.func != "function"){
        throw("Callback created without a func");
      }

      // Private methods
      var marshal_to_function = function(value){
        if(typeof value != "function"){
          return function(){ return value; };
        } else {
          return value;
        }
      };

      options.must_keep = marshal_to_function(options.must_keep || false);

      // Privileged methods
      this.func = function(){
        return options.func.apply(options,arguments);
      };

      this.must_keep = function(){
        return options.must_keep.apply(options,arguments);
      };
    };

  })();

  this.CallbackList = (function(){

    // Private class level objects
    var merge_options = function(obj1,obj2){
      obj1 = obj1 || {};
      obj2 = obj2 || {};
      var obj3 = {};
      for (var attr1 in obj1) {
        if( obj1.hasOwnProperty(attr1) ){ obj3[attr1] = obj1[attr1]; }
      }
      for (var attr2 in obj2) {
        if( obj2.hasOwnProperty(attr2) ){ obj3[attr2] = obj2[attr2]; }
      }
      return obj3;
    };

    // Return the constructor
    return function(){

      // Private functions
      make_array = function(callbacks){
        if(!(callbacks instanceof Array)){
          callbacks = [callbacks];
        }
        return callbacks;
      };

      marshal = function(c){
        if(c instanceof scope.Callback){
          return c;
        }else{
          return new scope.Callback({func: c, must_keep: that.must_keep()});
        }
      };

      marshal_array = function(callbacks){
        results = [];
        for(var c in callbacks){
          if(callbacks.hasOwnProperty(c)){
            var marshalled = marshal(callbacks[c]);
            results = results.concat(marshalled);
          }
        }

        return results;
      };


      // Private variables
      var defaults = {
        must_keep: false
      };
      var opts;
      if(arguments.length > 0){
        var possibility = arguments[arguments.length - 1];
        if(possibility.constructor === Object){
          // Bare object, must be our options
          opts = possibility;
        }
      } else {
        opts = {};
      }
      var options = merge_options(defaults,opts);

      var list;

      var that = this;

      // Privileged functions
      this.must_keep = function(){
        if(arguments.length > 0){
          return options["must_keep"] = arguments[0];
        } else {
          return options["must_keep"];
        }
      };

      this.size = function(){
        return list.length;
      };

      this.add = function(callbacks){
        // Make sure callbacks is always an array
        callbacks = make_array(callbacks);

        // Make sure callbacks are com.jivatechnology.Callback
        callbacks = marshal_array(callbacks);

        // Add them
        list = list.concat.apply(list,callbacks);
        return callbacks;
      };

      this.clear = function(){
        list = [];
      };

      this.handle = function(issuccess){
        // Scan list in reverse order so we can delete elements
        // without causing problems
        var args = Array.prototype.slice.call(arguments);
        for(var i = list.length - 1; i >= 0; i--){
          // Call handle on each callback
          list[i].func.apply(this,args);
          // Check if it should be kept
          var keep = list[i].must_keep(this,args);
          if(!keep){ list.splice(i,1); }
        }
      };

      // Initialize list
      this.clear();

      // Add callbacks if any specified on creation
      if(arguments.length > 0 && arguments[0].constructor != Object ){
        this.add(arguments[0]);
      }
    };

  })();

}).call(com.jivatechnology);

(function(){

  var CallbackList = com.jivatechnology.CallbackList;
  this.Connection = (function(){

    return function(twilio_connection){
      var that = this;

      // Setup Twilio Connection Callbacks
      (function(){
        twilio_connection.accept(     function(conn){ that.onAccept.handle(that);     });
        twilio_connection.disconnect( function(conn){ that.onDisconnect.handle(that); });
        twilio_connection.error(      function(conn){ that.onError.handle(that);      });
      })();

      // Privileged methods

      //// Callbacks
      this.onAccept     = new CallbackList({must_keep: true});
      this.onDisconnect = new CallbackList({must_keep: true});
      this.onError      = new CallbackList({must_keep: true});

      //// Linked to Twilio.Connection method

      this.accept = function(){
        if(arguments.length === 0){
          twilio_connection.accept();
          return self;
        }
        else {
          throw "Please add accept callback using onAccept";
        }
      };

      this.disconnect = function(){
        if(arguments.length === 0){
          twilio_connection.disconnect();
          return self;
        }
        else {
          throw "Please add disconnect callback using onDisconnect";
        }
      };

      this.reject = function(){
        twilio_connection.reject();
        return that;
      };

      //// Mute control
      var muted = false;
      this.mute = function(){
        muted = true;
        twilio_connection.mute();
        return that;
      };

      this.unmute = function(){
        muted = false;
        twilio_connection.unmute();
        return that;
      };

      this.isMuted = function(){
        return muted;
      };

      //// DTMF
      this.sendDigits = function(digits){
        twilio_connection.sendDigits(digits);
        return that;
      };

      //// Status
      this.status = function(){
        return twilio_connection.status();
      };

      this.properties = function(){
        return twilio_connection.properties;
      };

    };

  })();

}).call(com.jivatechnology.TwitTwilio);



(function(){

  var that = this;
  var instance = null;

  var Connection   = this.Connection;
  var CallbackList = com.jivatechnology.CallbackList;

  this.Device = (function(){

    return function(){
      var that = this;

      if(instance){
        // Already instantiated
        throw "TwitTwilio.Device already instantiated, please use that instance";
      }
      instance = this;

      var twilio_device = Twilio.Device;

      // Setup Twilio Device Callbacks
      (function(){
        // Device
        twilio_device.ready(   function(device){ that.onReady.handle(that);   });
        twilio_device.offline( function(device){ that.onOffline.handle(that); });

        // Connection
        twilio_device.incoming(   function(conn){ that.onIncoming.handle(conn);   });
        twilio_device.cancel(     function(conn){ that.onCancel.handle(conn);     });
        twilio_device.connect(    function(conn){ that.onConnect.handle(conn);    });
        twilio_device.disconnect( function(conn){ that.onDisconnect.handle(conn); });

        // Presence
        twilio_device.presence( function(pres){ that.onPresence.handle(pres); });

        // Error
        twilio_device.error( function(err){
          err = err || {};
          if(err.message == "Access to microphone has been denied"){
            // Connection just created is junk - cancel it
            var connections = that.connections();
            var last_connection = connections[connections.length - 1];
            if(last_connection){ last_connection.cancel(); }
          }

          that.onError.handle(err);
        });
      })();

      // Monitor flash settings
      var flashSettingsShown       = false;
      var chanceFlashSettingsShown = false;
      var flashSettingsShow = function(){
        flashSettingsShown = true;
        that.onShowFlashSettings.handle(flashSettingsElement());
      };

      var flashSettingsHide = function(){
        flashSettingsShown       = false;
        chanceFlashSettingsShown = false;
        that.onHideFlashSettings.handle(flashSettingsElement());
      };

      //// DOM Flash setting functions
      var flashSettingsElement = function(){
        var e = document.getElementById("__connectionFlash__");
        return e && e.parentElement && e.parentElement.parentElement;
      };

      var isFlashSettingsElementShown = function(){
        var element = flashSettingsElement();
        return element && element.style.visibility == "visible";
      };

      var hideFlashSettingsElement = function(){
        var e = flashSettingsElement();
        e.style.visibility = "hidden";
        e.style.height     = "1px";
        e.style.width      = "1px";
      };

      //// Timed check
      var monitorFlashSettings = function(){
        var elementShown = isFlashSettingsElementShown();
        if( elementShown ) {
          // Automatically popped up by Twilio so sync our state
          if(!flashSettingsShown){ flashSettingsShow(); }
          // Check again in 100ms
          setTimeout(monitorFlashSettings,100);
        } else if (!elementShown && flashSettingsShown){
          flashSettingsHide();
        } else if (!elementShown && chanceFlashSettingsShown ){
          // Nothing present on screen but there is a chance it will appear shortly
          setTimeout(monitorFlashSettings,100);
        }
      };

      // Privileged methods

      this.setup = function(token, params){
        twilio_device.setup(token, params);
        return that;
      };

      //// Callbacks for device
      this.onReady      = new CallbackList({must_keep: true});
      this.onOffline    = new CallbackList({must_keep: true});

      //// Callbacks for connection
      this.onIncoming   = new CallbackList({must_keep: true});
      this.onCancel     = new CallbackList({must_keep: true});
      this.onConnect    = new CallbackList({must_keep: true});
      this.onDisconnect = new CallbackList({must_keep: true});

      //// Callbacks for presence
      this.onPresence   = new CallbackList({must_keep: true});

      //// Callbacks for errors
      this.onError      = new CallbackList({must_keep: true});

      //// Callbacks for flash settings
      this.onShowFlashSettings = new CallbackList({must_keep: true});
      this.onHideFlashSettings = new CallbackList({must_keep: true});

      // Access to Twilio Device functions
      var connections = [];

      this.connect = function(opts){
        if(!(opts instanceof Function)){
          var c = twilio_device.connect(opts);
          chanceFlashSettingsShown = true;
          monitorFlashSettings();
          connections.push(c);
          return c;
        }
        else {
          throw "Please add connect callback using onConnect";
        }
      };

      this.connections = function(){ return connections; };

      this.status        = twilio_device.status;
      this.sounds        = twilio_device.sounds;
      this.disconnectAll = twilio_device.disconnectAll;

      // Handle showing security settings
      this.showFlashSettings = function(){
        if(!flashSettingsShown){
          twilio_device.showPermissionsDialog();
          flashSettingsShow();
          monitorFlashSettings();
        }
      };

      this.hideFlashSettings = function(){
        if(flashSettingsShown){
          hideFlashSettingsElement();
          flashSettingsHide();
        }
      };

      this.isFlashSettingsShown = function(){
        return flashSettingsShown;
      };

    };

  })();

  this.Device.instance = function(){
    return instance;
  };

  this.Device.resetInstance = function(s){
    if(s == "TESTING"){
      instance = null;
    } else {
      throw "This is for testing only";
    }
  };

}).call(com.jivatechnology.TwitTwilio);
