describe("Connection", function() {

  var klass = com.jivatechnology.TwitTwilio.Connection;
  var subject;

  var buildSubject = function(){
    subject = new klass(new Twilio.Connection());
    return subject;
  };

  beforeEach(function(){
    buildTwilioConnection();
    resetClasses();
    buildSubject();
  });

  describe("class method", function(){
    describe("'build'", function(){

      it("should return an instance of TwitTwilio.Connection", function(){
        var conn = new Twilio.Connection();
        var result = klass.build(conn);

        expect(result).toBeAnInstanceOf(klass);
      });

      it("should allow custom params to be passed too", function(){
        var conn = new Twilio.Connection();
        var params = {more: "complicated"};
        var result = klass.build(conn, params);

        expect(result.params()).toBe(params);
      });

      it("should return the same instance of TwitTwilio.Connection when passed the same Twilio.Connection", function(){
        var conn1 = new Twilio.Connection();
        var result1 = klass.build(conn1);
        var result2 = klass.build(conn1);

        expect(result1).toBe(result2);
      });

      it("should return the different instance of TwitTwilio.Connection when passed different Twilio.Connection", function(){
        var conn1 = new Twilio.Connection();
        var conn2 = new Twilio.Connection();

        var result1 = klass.build(conn1);
        var result2 = klass.build(conn2);

        expect(result1).not.toBe(result2);
      });

    });
  });

  describe("instantiation" , function(){

    it("should take a twilio connection and params", function(){
      var params = {agent: "Bob"};
      var twilio_connection = new Twilio.Connection();
      subject = new klass(twilio_connection, params);

      expect(subject).toBeAnInstanceOf(klass);
      expect(subject.params()).toBe(params);
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

    describe("#cancel", function(){
      it("should call to Twilio.Connection#cancel", function(){
        var called = false;
        Twilio.Connection.prototype.cancel = function(){ called = true; };

        subject.cancel();

        expect(called).toBeTruthy();
      });

      it("should raise an error if anything is passed", function(){
        var callback = function(){};

        expect(function(){ subject.cancel(callback); }).toThrow("Please add cancel callback using onCancel");
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
      it("should return the properties from the Twilio.Connection", function(){
        Twilio.Connection.prototype.properties = {custom: "PROPERTIES"};

        expect( subject.properties() ).toEqual({custom: "PROPERTIES"});
      });
    });

    describe("#params", function(){
      it("should return the params that where passed when created", function(){
        var params = {custom: "PARAMS"};

        subject = new klass(new Twilio.Connection(),params);

        expect( subject.params() ).toBe(params);
      });
    });

    describe("#isFor", function(){
      it("should compare the Twilio.Connection that the connection was instantiated with to the one passed in", function(){
        var conn1 = new Twilio.Connection();
        var conn2 = new Twilio.Connection();

        var subject1 = new klass(conn1);
        var subject2 = new klass(conn2);

        expect(subject1.isFor(conn1)).toBeTruthy();
        expect(subject2.isFor(conn1)).toBeFalsy();
      });
    });

    describe("#callbacksFrom", function(){
      it("should link the callbacks from a previous connection to this connection", function(){
        var conn1 = new Twilio.Connection();
        var conn2 = new Twilio.Connection();

        var called;
        var subject1 = new klass(conn1);
        subject1.onAccept.add( function(sub){ called = sub; } );

        var subject2 = new klass(conn2);
        subject2.callbacksFrom(subject1);

        Twilio.ConnectionCallbacks.accept();

        expect(called).toBe(subject2);
      });
    });

    // Callbacks
    describe("#onAccept",     function(){ shouldReturnCallbackListInstance("onAccept");     });
    describe("#onCancel",     function(){ shouldReturnCallbackListInstance("onCancel");     });
    describe("#onDisconnect", function(){ shouldReturnCallbackListInstance("onDisconnect"); });
    describe("#onError",      function(){ shouldReturnCallbackListInstance("onError");      });

  });

});
