//= require callback

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
