describe("Device", function() {

  var klass = com.jivatechnology.TwitTwilio.Device;
  var subject;

  var buildSubject = function(){
    subject = new klass();
    return subject;
  };

  var twilioFlashSettingsElement = function(){
    return document.getElementById("__connectionFlash__").parentElement.parentElement;
  };

  beforeEach(function(){
    resetClasses();
    resetMocks();
  });

  afterEach(function(){
    fixtureClear();
  });

  describe("instantiation" , function(){

    it("should only allow one instance to be instantiated", function(){
      var obj = new klass();

      expect(obj).toBeAnInstanceOf(klass);

      expect(function(){ new klass(); }).toThrow("TwitTwilio.Device already instantiated, please use that instance");
    });

  });

  describe("class method", function(){

    describe("'instance'", function(){

      it("should return null if it has not been instantiated", function(){
        expect(klass.instance()).toBeNull();
      });

      it("should return the instance of the class if it has been instantiated", function(){
        var obj = new klass();
        expect(klass.instance()).toBe(obj);
      });

    });

    describe("'resetInstance'", function(){
      it("should throw an error", function(){
        expect(function(){ klass.resetInstance(); }).toThrow("This is for testing only");
      });
    });

  });

  describe("events from Twilio", function(){

    beforeEach(function(){
      buildSubject();
    });

    var shouldTriggerCallbacks = function(callbackName, callback, opts){
      it("should trigger " + callbackName + " callbacks", function(){
        var called = false;
        subject[callbackName].add(function(){ called = true; });

        opts = opts || {};
        var passing;

        if( opts.with_connection ){ passing = new Twilio.Connection(); }

        Twilio.DeviceCallbacks[callback](passing);

        expect(called).toBeTruthy();
      });
    };

    describe("'ready'",      function(){ shouldTriggerCallbacks("onReady","ready");           });
    describe("'offline'",    function(){ shouldTriggerCallbacks("onOffline","offline");       });

    describe("'incoming'",   function(){ shouldTriggerCallbacks("onIncoming",   "incoming",   {with_connection: true} ); });
    describe("'cancel'",     function(){ shouldTriggerCallbacks("onCancel",     "cancel",     {with_connection: true} ); });
    describe("'connect'",    function(){ shouldTriggerCallbacks("onConnect",    "connect",    {with_connection: true} ); });
    describe("'disconnect'", function(){ shouldTriggerCallbacks("onDisconnect", "disconnect", {with_connection: true} ); });

    describe("'presence'",   function(){ shouldTriggerCallbacks("onPresence","presence");     });

    describe("'error'", function(){

      it("if 'Access to microphone has been denied' is raised then should generate new connection when flash settings are closed", function(){
        var params      = {agent: "Bobo"};
        var connection1 = subject.connect(params);

        expect(subject.connections().length).toEqual(1);

        Twilio.DeviceCallbacks.error({message: "Access to microphone has been denied"});

        expect(subject.connections().length).toEqual(1);

        // Simulate user opening Flash settings, clicking allow and closing
        // Do this twice to make sure we don't generate more connections than we need
        subject.showFlashSettings();
        subject.hideFlashSettings();

        subject.showFlashSettings();
        subject.hideFlashSettings();

        var connections = subject.connections();
        var connection2 = connections[connections.length - 1];

        expect(connections.length).toEqual(2);
        expect(connection2.params()).toEqual(params);
      });

      shouldTriggerCallbacks("onError","error");
    });

    it("if there is no connection to the network (NetConnection.Connect.Failed) then it should try and reconnect in 5 seconds", function(){
      var params;
      var connection1;
      var startTime;

      runs(function(){
        params      = {agent: "Bobo"};
        connection1 = subject.connect(params);

        Twilio.DeviceCallbacks.error({code: "NetConnection.Connect.Failed"});

        startTime = new Date();

        expect(subject.connections().length).toEqual(1);
      });

      waitsFor(function(){
        var now = new Date();
        return (now - startTime) > 5100;
      });

      runs(function(){
        var connections = subject.connections();
        var connection2 = connections[connections.length - 1];

        expect(connections.length).toEqual(2);
        expect(connection2.params()).toEqual(params);
      });

    });

  });

  describe("property", function(){

    describe("#status", function(){
      it("should link to Twilio.Device.status", function(){
        expect(subject.status).toBe(Twilio.Device.status);
      });
    });

    describe("#sounds", function(){
      it("should link to Twilio.Device.sounds", function(){
        expect(subject.sounds).toBe(Twilio.Device.sounds);
      });
    });

  });

  describe("instance method", function(){

    var shouldReturnCallbackListInstance = function(name){
      return it("should return a Callback instance", function(){
        expect(subject[name]).toBeAnInstanceOf(com.jivatechnology.CallbackList);
      });
    };

    beforeEach(function(){
      buildSubject();
    });

    describe("#setup", function(){
      it("should call Twilio.Device.setup", function(){
        var passed_token, passed_params;
        Twilio.Device.setup = function(t,p){
          passed_token  = t;
          passed_params = p;
          return Twilio.Device;
        };

        subject.setup("123",{options: true});

        expect(passed_token).toEqual("123");
        expect(passed_params).toEqual({options: true});
      });
    });

    describe("#reconnect", function(){
      it("should take a TwitTwilio.Connection and create a new one", function(){
        var oldConnection = subject.connect();

        var newConnection = subject.reconnect(oldConnection);

        expect(newConnection).not.toBe(oldConnection);
        expect(newConnection).toBeAnInstanceOf(com.jivatechnology.TwitTwilio.Connection);
      });

      it("new connection should have same params as original connection", function(){
        var params = {agent: "Smith", phone_number: "4158675309"};
        var oldConnection = subject.connect(params);

        var newConnection = subject.reconnect(oldConnection);

        expect(newConnection.params()).toEqual(params);
      });

      it("new connection should have same mute state as original connection", function(){
        var oldConnection = subject.connect();
        oldConnection.mute();

        var newConnection = subject.reconnect(oldConnection);

        expect(newConnection.isMuted).toBeTruthy();
      });

      it("new connection should have the callbacks from the original connection", function(){
        var oldConnection = subject.connect();

        var newConnection = subject.reconnect(oldConnection);

        expect( newConnection.onAccept     ).toEqual( oldConnection.onAccept     );
        expect( newConnection.onCancel     ).toEqual( oldConnection.onCancel     );
        expect( newConnection.onDisconnect ).toEqual( oldConnection.onDisconnect );
        expect( newConnection.onError      ).toEqual( oldConnection.onError      );
      });
    });

    describe("#showFlashSettings", function(){

      it("should call #showPermissionsDialog on Twilio Device", function(){
        var called = false;

        Twilio.Device.showPermissionsDialog = function(){ called = true; };

        subject.showFlashSettings();

        expect(called).toBeTruthy();
      });

      it("should not call #showPermissionsDialog on Twilio Device twice if called twice", function(){
        var called = 0;

        var orig = Twilio.Device.showPermissionsDialog;
        Twilio.Device.showPermissionsDialog = function(){ called += 1; orig(); };

        subject.showFlashSettings();
        subject.showFlashSettings();

        expect(called).toEqual(1);
      });

      it("should set isFlashSettingsShown to true", function(){
        expect(subject.isFlashSettingsShown()).toBeFalsy();

        subject.showFlashSettings();

        expect(subject.isFlashSettingsShown()).toBeTruthy();
      });

      it("should trigger onShowFlashSettings", function(){
        var called = false;
        subject.onShowFlashSettings.add(function(){ called = true; });

        subject.showFlashSettings();

        expect(called).toBeTruthy();
      });

      it("should trigger onHideFlashSettings if dialogue is closed", function(){
        var called = false;

        runs(function(){
          subject.onHideFlashSettings.add(function(){ called = true; });

          subject.showFlashSettings();

          // Code that simulates how Twilio hides the dialogue
          var e = twilioFlashSettingsElement();
          e.style.visibility = "hidden";
        });

        waitsFor(function(){ return called; });

        runs(function(){ expect(called).toBeTruthy(); });
      });

    });

    describe("#hideFlashSettings", function(){

      beforeEach(function(){
        subject.showFlashSettings();
      });

      it("should hide DOM element", function(){
        var e = twilioFlashSettingsElement();

        expect(e.style.visibility).toEqual("visible");

        subject.hideFlashSettings();

        expect(e.style.visibility).toEqual("hidden");
      });

      it("should trigger onHideFlashSettings", function(){
        var called = false;
        subject.onHideFlashSettings.add(function(){ called = true; });

        subject.hideFlashSettings();

        expect(called).toBeTruthy();
      });

      it("should set isFlashSettingsShown to false", function(){
        expect( subject.isFlashSettingsShown() ).toBeTruthy();

        subject.hideFlashSettings();

        expect( subject.isFlashSettingsShown() ).toBeFalsy();
      });

    });

    describe("#connect", function(){
      it("should pass params to Twilio.Device.connect", function(){
        var params = {};
        var passed;

        var orig = Twilio.Device.connect;
        Twilio.Device.connect = function(p){ passed = p; return orig(p); };

        subject.connect(params);

        expect(passed).toBe(params);
      });

      it("should not allow a function to be passed to Twilio.Device.connect", function(){
        expect( function(){ subject.connect(function(){}); } ).toThrow("Please add connect callback using onConnect");
      });

    });

    describe("#connections", function(){
      it("should return an array of the connections attempted", function(){
        expect(subject.connections()).toEqual([]);

        var c1 = subject.connect();
        expect(subject.connections()).toEqual([c1]);

        var c2 = subject.connect();
        expect(subject.connections()).toEqual([c1,c2]);
      });
    });

    describe("#disconnectAll", function(){
      it("should link to Twilio.Device.disconnectAll", function(){
        expect(subject.disconnectAll).toBe(Twilio.Device.disconnectAll);
      });
    });

    describe("#isWebRTC", function(){

      it("should return false if Twilio cannot require RTC library", function(){
        expect(subject.isWebRTC()).toBeFalsy();
      });

      it("should return true if Twilio can require RTC library, and it reports WebRTC support", function(){
        orig = Twilio.Device.require;
        Twilio.require = function(module){
          if(module == 'twilio/rtc'){
            return {enabled: function(){return true;} };
          } else {
            return orig(module);
          }
        };

        expect(subject.isWebRTC()).toBeTruthy();
      });

      it("should return false if Twilio can require RTC library, and it reports no WebRTC support", function(){
        orig = Twilio.Device.require;
        Twilio.require = function(module){
          if(module == 'twilio/rtc'){
            return {enabled: function(){return false;} };
          } else {
            return orig(module);
          }
        };

        expect(subject.isWebRTC()).toBeFalsy();
      });


    });

    // Callbacks
    describe("#onReady",      function(){ shouldReturnCallbackListInstance("onReady");      });
    describe("#onOffline",    function(){ shouldReturnCallbackListInstance("onOffline");    });
    describe("#onIncoming",   function(){ shouldReturnCallbackListInstance("onIncoming");   });
    describe("#onCancel",     function(){ shouldReturnCallbackListInstance("onCancel");     });
    describe("#onConnect",    function(){ shouldReturnCallbackListInstance("onConnect");    });
    describe("#onDisconnect", function(){ shouldReturnCallbackListInstance("onDisconnect"); });
    describe("#onPresence",   function(){ shouldReturnCallbackListInstance("onPresence");   });
    describe("#onError",      function(){ shouldReturnCallbackListInstance("onError");      });

    describe("#onShowFlashSettings", function(){ shouldReturnCallbackListInstance("onShowFlashSettings"); });
    describe("#onHideFlashSettings", function(){ shouldReturnCallbackListInstance("onHideFlashSettings"); });

  });

});
