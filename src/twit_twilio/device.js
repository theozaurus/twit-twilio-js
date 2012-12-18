//= require callback
//= require ./connection

(function(){

  var scope = this;
  var instance = null;

  var Connection   = this.Connection;
  var Callback     = com.jivatechnology.Callback;
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
        twilio_device.incoming(   function(conn){ var c = scope.Connection.build(conn); that.onIncoming.handle(c);   });
        twilio_device.cancel(     function(conn){ var c = scope.Connection.build(conn); that.onCancel.handle(c);     });
        twilio_device.connect(    function(conn){ var c = scope.Connection.build(conn); that.onConnect.handle(c);    });
        twilio_device.disconnect( function(conn){ var c = scope.Connection.build(conn); that.onDisconnect.handle(c); });

        // Presence
        twilio_device.presence( function(pres){ that.onPresence.handle(pres); });

        // Error
        twilio_device.error( function(err){
          err = err || {};
          if(err.message == "Access to microphone has been denied"){
            // Connection just created is junk - cancel it
            var connections = that.connections();
            var last_connection = connections[connections.length - 1];
            if(last_connection){
              last_connection.cancel();
              var params = last_connection.params();

              var retry = new Callback({func: function(){ that.connect(params); }, must_keep: false });
              internalOnHideFlashSettings.add(retry);
            }
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
        var element = flashSettingsElement();
        internalOnHideFlashSettings.handle(element);
        that.onHideFlashSettings.handle(element);
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

      //// Connection handling
      var connections = [];

      ////// This will take a Twilio.Connection turn it into a TwitTwilio
      ////// connection and add it to our connection list if missing
      ////// then return the TwitTwilio.Connection
      var addConnection = function(conn, params){
        var c = new scope.Connection.build(conn, params);
        if( connections.indexOf(c) < 0 ){
          connections.push(c);
        }
        return c;
      };

      //// Callbacks used internally
      var internalOnHideFlashSettings = new CallbackList({must_keep: false});

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
      this.connect = function(params){
        if(!(params instanceof Function)){
          var c = twilio_device.connect(params);
          chanceFlashSettingsShown = true;
          monitorFlashSettings();
          c = addConnection(c,params);
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
