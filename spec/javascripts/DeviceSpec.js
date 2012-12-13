describe("Device", function() {

  var klass = com.jivatechnology.TwitTwilio.Device;
  var subject;

  var buildTwilioDevice = function(){
    Twilio = {};
    Twilio.DeviceCallbacks = {};
    Twilio.Device = {
      setup:      function(token,params){ return Twilio.Device; },
      ready:      function(fun){ Twilio.DeviceCallbacks.ready             = fun; },
      offline:    function(fun){ Twilio.DeviceCallbacks.offline           = fun; },
      incoming:   function(fun){ Twilio.DeviceCallbacks.incoming          = fun; },
      cancel:     function(fun){ Twilio.DeviceCallbacks.cancel            = fun; },
      connect:    function(fun_or_params){ Twilio.DeviceCallbacks.connect = fun_or_params; },
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

  var buildSubject = function(){
    subject = new klass();
    return subject;
  };

  var twilioFlashSettingsElement = function(){
    return document.getElementById("__connectionFlash__").parentElement.parentElement;
  };

  beforeEach(function(){
    klass.resetInstance("TESTING");
    buildTwilioDevice();
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

    var shouldTriggerCallbacks = function(callbackName, callback){
      it("should trigger " + callbackName + " callbacks", function(){
        var called = false;
        subject[callbackName].add(function(){ called = true; });

        Twilio.DeviceCallbacks[callback]();

        expect(called).toBeTruthy();
      });
    };

    describe("'ready'",      function(){ shouldTriggerCallbacks("onReady","ready");           });
    describe("'offline'",    function(){ shouldTriggerCallbacks("onOffline","offline");       });
    describe("'incoming'",   function(){ shouldTriggerCallbacks("onIncoming","incoming");     });
    describe("'cancel'",     function(){ shouldTriggerCallbacks("onCancel","cancel");         });
    describe("'connect'",    function(){ shouldTriggerCallbacks("onConnect","connect");       });
    describe("'disconnect'", function(){ shouldTriggerCallbacks("onDisconnect","disconnect"); });
    describe("'presence'",   function(){ shouldTriggerCallbacks("onPresence","presence");     });
    describe("'error'",      function(){ shouldTriggerCallbacks("onError","error");           });

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

        Twilio.Device.connect = function(p){ passed = p; };

        subject.connect(params);

        expect(passed).toBe(params);
      });

      it("should not allow a function to be passed to Twilio.Device.connect", function(){
        expect( function(){ subject.connect(function(){}); } ).toThrow("Please add connect callback using onConnect");
      });
    });

    describe("#disconnectAll", function(){
      it("should link to Twilio.Device.disconnectAll", function(){
        expect(subject.disconnectAll).toBe(Twilio.Device.disconnectAll);
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
