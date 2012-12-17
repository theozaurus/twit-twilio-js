//= require callback
//= require ./connection

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
