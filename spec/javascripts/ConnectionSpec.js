describe("Connection", function() {

  var klass = com.jivatechnology.TwitTwilio.Connection;
  var subject;

  var buildTwilioConnection = function(){
    Twilio = {};
    Twilio.ConnectionCallbacks = {};
    Twilio.Connection = function(){};
    Twilio.Connection.prototype = {
      accept:     function(fun){ Twilio.ConnectionCallbacks.accept     = fun; },
      disconnect: function(fun){ Twilio.ConnectionCallbacks.disconnect = fun; },
      error:      function(fun){ Twilio.ConnectionCallbacks.error      = fun; },
      mute:       function(){},
      unmute:     function(){},
      sendDigits: function(){},
      status:     function(){return "pending";},
      properties: {received: "params"}
    };
  };

  var buildSubject = function(){
    subject = new klass(new Twilio.Connection());
    return subject;
  };

  beforeEach(function(){
    buildTwilioConnection();
    buildSubject();
  });

  describe("instantiation" , function(){

    it("should take a twilio connection", function(){
      var twilio_connection = new Twilio.Connection();
      subject = new klass(twilio_connection);

      expect(subject).toBeAnInstanceOf(klass);
    });

  });

  describe("events from Twilio" , function(){

    var shouldTriggerCallbacks = function(callbackName, callback){
      it("should trigger " + callbackName + " callbacks", function(){
        var called = false;
        subject[callbackName].add(function(){ called = true; });

        Twilio.ConnectionCallbacks[callback]();

        expect(called).toBeTruthy();
      });
    };

    describe("'accept'",     function(){ shouldTriggerCallbacks("onAccept",     "accept"); });
    describe("'disconnect'", function(){ shouldTriggerCallbacks("onDisconnect", "disconnect"); });
    describe("'error'",      function(){ shouldTriggerCallbacks("onError",      "error"); });
  });

  describe("instance method" , function(){

    var shouldReturnCallbackListInstance = function(name){
      return it("should return a Callback instance", function(){
        expect(subject[name]).toBeAnInstanceOf(com.jivatechnology.CallbackList);
      });
    };

    describe("#accept", function(){
      it("should call to Twilio.Connection#accept", function(){
        var called = false;
        Twilio.Connection.prototype.accept = function(){ called = true; };

        subject.accept();

        expect(called).toBeTruthy();
      });

      it("should raise an error if anything is passed", function(){
        var callback = function(){};

        expect(function(){ subject.accept(callback); }).toThrow("Please add accept callback using onAccept");
      });
    });

    describe("#disconnect", function(){
      it("should call to Twilio.Connection#disconnect", function(){
        var called = false;
        Twilio.Connection.prototype.disconnect = function(){ called = true; };

        subject.disconnect();

        expect(called).toBeTruthy();
      });
    });

    describe("#mute", function(){
      it("should call to Twilio.Connection#mute", function(){
        var called = false;
        Twilio.Connection.prototype.mute = function(){ called = true; };

        subject.mute();

        expect(called).toBeTruthy();
      });
    });

    describe("#unmute", function(){
      it("should call to Twilio.Connection#unmute", function(){
        var called = false;
        Twilio.Connection.prototype.unmute = function(){ called = true; };

        subject.unmute();

        expect(called).toBeTruthy();
      });
    });

    describe("#isMuted", function(){
      it("should return false initially", function(){
        expect(subject.isMuted()).toBeFalsy();
      });

      it("should return true when muted", function(){
        subject.mute();

        expect(subject.isMuted()).toBeTruthy();
      });

      it("should return false when unmuted", function(){
        subject.unmute();

        expect(subject.isMuted()).toBeFalsy();
      });
    });

    describe("#sendDigits", function(){
      it("should call to Twilio.Connection#sendDigits", function(){
        var called = false;
        Twilio.Connection.prototype.sendDigits = function(){ called = true; };

        subject.sendDigits();

        expect(called).toBeTruthy();
      });
    });

    describe("#status", function(){
      it("should call to Twilio.Connection#status", function(){
        var called = false;
        Twilio.Connection.prototype.status = function(){ called = true; };

        subject.status();

        expect(called).toBeTruthy();
      });
    });

    describe("#properties", function(){
      it("should return the parameters property from the Twilio.Connection", function(){
        Twilio.Connection.prototype.properties = {custom: "PROPERTIES"};

        expect( subject.properties() ).toEqual({custom: "PROPERTIES"});
      });
    });

    // Callbacks
    describe("#onAccept",     function(){ shouldReturnCallbackListInstance("onAccept");     });
    describe("#onDisconnect", function(){ shouldReturnCallbackListInstance("onDisconnect"); });
    describe("#onError",      function(){ shouldReturnCallbackListInstance("onError");      });

  });

});
