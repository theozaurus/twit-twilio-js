//= require callback

(function(){

  var scope = this;

  var connections = [];
  var connectionFor = function(twilio_connection){
    var l = connections.length;
    for(var i = 0; i < l; i++){
      var conn = connections[i];
      if( conn.isFor(twilio_connection) ){ return conn; }
    }
  };

  var CallbackList = com.jivatechnology.CallbackList;
  this.Connection = (function(){

    return function(twilio_connection){
      // Track instantiation of object
      connections.push(this);

      var that = this;

      // Setup Twilio Connection Callbacks
      (function(){
        twilio_connection.accept(     function(conn){ that.onAccept.handle(that);     });
        twilio_connection.cancel(     function(conn){ that.onCancel.handle(that);     });
        twilio_connection.disconnect( function(conn){ that.onDisconnect.handle(that); });
        twilio_connection.error(      function(conn){ that.onError.handle(that);      });
      })();

      // Privileged methods

      //// Callbacks
      this.onAccept     = new CallbackList({must_keep: true});
      this.onCancel     = new CallbackList({must_keep: true});
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

      this.cancel = function(){
        if(arguments.length === 0){
          twilio_connection.cancel();
          return self;
        }
        else {
          throw "Please add cancel callback using onCancel";
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

      //// Check this is a connection for a certain twilio connection
      this.isFor = function(expected_twilio_connection){
        return expected_twilio_connection === twilio_connection;
      };

    };

  })();

  this.Connection.build = function(twilio_connection){
    var c = connectionFor(twilio_connection);
    if(!c){ c = new scope.Connection(twilio_connection); }
    return c;
  };

  this.Connection.reset = function(s){
    if(s == "TESTING"){
      connections = [];
    } else {
      throw "This is for testing only";
    }
  };

}).call(com.jivatechnology.TwitTwilio);
