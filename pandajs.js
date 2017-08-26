pandaConfig = {
  "system" : {
    "orientation" : "landscape",
    "resizeToFill" : true,
    "scaleToFit" : false,
    "rotateImg" : "rotate_screen.png",
    "startScene" : "SceneTitle",
    "bgColor" : "#000000",
    "bgColorRotate" : "#ffffff",
    "webGL" : true,
    "canvasId" : "canvas"
  },
  "storage" : {
    "id" : "com.aksisoft.raroh"
  },
  "loader" : {
    "barColor" : 7600014,
    "barWidth" : 285,
    "barHeight" : 25
  },
  "useBlendModes" : true,
  "useTint" : true,
  "useShadows" : true,
  "sourceFolder" : "src",
  "outputFile" : "pandajs.js"
};
var core = {
  version : "1.5.2",
  config : "undefined" != typeof pandaConfig ? pandaConfig : {},
  coreModules : ["engine.loader", "engine.timer", "engine.system", "engine.audio", "engine.renderer", "engine.sprite", "engine.debug", "engine.storage", "engine.tween", "engine.scene", "engine.pool", "engine.analytics"],
  scale : 1,
  scene : null,
  debug : null,
  system : null,
  sound : null,
  pool : null,
  storage : null,
  keyboard : null,
  device : {},
  assets : {},
  plugins : {},
  json : {},
  renderer : null,
  modules : {},
  nocache : "",
  current : null,
  loadQueue : [],
  waitForLoad : 0,
  DOMLoaded : false,
  next : 1,
  anims : {},
  assetQueue : [],
  audioQueue : {},
  /**
   * @param {?} url
   * @return {?}
   */
  getJSON : function(url) {
    return this.json[this.assets[url]];
  },
  /**
   * @param {?} obj
   * @return {?}
   */
  copy : function(obj) {
    var l;
    var newArray;
    var i;
    if (!obj || ("object" != typeof obj || (obj instanceof HTMLElement || (obj instanceof this.Class || this.Container && obj instanceof this.Container)))) {
      return obj;
    }
    if (obj instanceof Array) {
      /** @type {Array} */
      newArray = [];
      /** @type {number} */
      i = 0;
      /** @type {number} */
      l = obj.length;
      for (;l > i;i++) {
        newArray[i] = this.copy(obj[i]);
      }
      return newArray;
    }
    newArray = {};
    for (i in obj) {
      newArray[i] = this.copy(obj[i]);
    }
    return newArray;
  },
  /**
   * @param {Object} first
   * @param {Object} settings
   * @return {?}
   */
  merge : function(first, settings) {
    var key;
    for (key in settings) {
      var object = settings[key];
      if ("object" != typeof object || (object instanceof HTMLElement || (object instanceof this.Class || object instanceof this.Container))) {
        first[key] = object;
      } else {
        if (!(first[key] && "object" == typeof first[key])) {
          /** @type {(Array|{})} */
          first[key] = object instanceof Array ? [] : {};
        }
        this.merge(first[key], object);
      }
    }
    return first;
  },
  /**
   * @param {?} obj
   * @return {?}
   */
  ksort : function(obj) {
    if (!obj || "object" != typeof obj) {
      return false;
    }
    var i;
    /** @type {Array} */
    var keys = [];
    var nobj = {};
    for (i in obj) {
      keys.push(i);
    }
    keys.sort();
    /** @type {number} */
    i = 0;
    for (;i < keys.length;i++) {
      nobj[keys[i]] = obj[keys[i]];
    }
    return nobj;
  },
  /**
   * @param {Object} el
   * @param {string} attr
   * @param {?} val
   * @return {undefined}
   */
  setVendorAttribute : function(el, attr, val) {
    var uc = attr.ucfirst();
    el[attr] = el["ms" + uc] = el["moz" + uc] = el["webkit" + uc] = el["o" + uc] = val;
  },
  /**
   * @param {Object} el
   * @param {string} attr
   * @return {?}
   */
  getVendorAttribute : function(el, attr) {
    var uc = attr.ucfirst();
    return el[attr] || (el["ms" + uc] || (el["moz" + uc] || (el["webkit" + uc] || el["o" + uc])));
  },
  /**
   * @param {Object} el
   * @param {string} attr
   * @return {undefined}
   */
  normalizeVendorAttribute : function(el, attr) {
    var prefixedVal = this.getVendorAttribute(el, attr);
    if (!el[attr]) {
      el[attr] = el[attr] || prefixedVal;
    }
  },
  /**
   * @return {undefined}
   */
  fullscreen : function() {
    if (this.system.canvas.requestFullscreen) {
      this.system.canvas.requestFullscreen();
    }
    if (this.system.canvas.requestFullScreen) {
      this.system.canvas.requestFullScreen();
    }
  },
  /**
   * @return {?}
   */
  fullscreenSupport : function() {
    return!(!this.system.canvas.requestFullscreen && !this.system.canvas.requestFullScreen);
  },
  /**
   * @param {string} callback
   * @param {Object} type
   * @return {?}
   */
  addAsset : function(callback, type) {
    return type = type || callback, callback = this.config.mediaFolder + callback + this.nocache, this.assets[type] = callback, -1 === this.assetQueue.indexOf(callback) && this.assetQueue.push(callback), type;
  },
  /**
   * @param {string} path
   * @param {Object} filename
   * @return {?}
   */
  addAudio : function(path, filename) {
    return filename = filename || path, path = this.config.mediaFolder + path + this.nocache, this.audioQueue[path] = filename, filename;
  },
  /**
   * @param {string} name
   * @param {Object} version
   * @return {?}
   */
  module : function(name, version) {
    if (this.current) {
      throw "Module " + this.current.name + " has no body";
    }
    if (this.modules[name] && this.modules[name].body) {
      throw "Module " + name + " is already defined";
    }
    return this.current = {
      name : name,
      requires : [],
      loaded : false,
      body : null,
      version : version
    }, "game.main" === name && this.current.requires.push("engine.core"), this.modules[name] = this.current, this.loadQueue.push(this.current), "engine.core" === this.current.name && (this.current.requires = this.coreModules, this.body(function() {
    })), this;
  },
  /**
   * @param {string} list
   * @return {?}
   */
  require : function(list) {
    var p;
    /** @type {Array.<?>} */
    list = Array.prototype.slice.call(arguments);
    /** @type {number} */
    p = 0;
    for (;p < list.length;p++) {
      if (list[p]) {
        if (-1 === this.current.requires.indexOf(list[p])) {
          this.current.requires.push(list[p]);
        }
      }
    }
    return this;
  },
  /**
   * @param {Function} body
   * @return {undefined}
   */
  body : function(body) {
    /** @type {Function} */
    this.current.body = body;
    /** @type {null} */
    this.current = null;
    if (this.loadFinished) {
      this.loadModules();
    }
  },
  /**
   * @param {number} ui
   * @param {Object} width
   * @param {string} height
   * @param {string} onFailed
   * @param {Function} system
   * @return {undefined}
   */
  start : function(ui, width, height, onFailed, system) {
    if (this.loadQueue.length > 0) {
      throw "Core not ready";
    }
    this.system = new this.System(width, height, system);
    if (this.Audio) {
      this.audio = new this.Audio;
    }
    if (this.Pool) {
      this.pool = new this.Pool;
    }
    if (this.DebugDraw) {
      if (this.DebugDraw.enabled) {
        this.debugDraw = new this.DebugDraw;
      }
    }
    if (this.Storage) {
      if (this.Storage.id) {
        this.storage = new this.Storage(this.Storage.id);
      }
    }
    if (this.Analytics) {
      if (this.Analytics.id) {
        this.analytics = new this.Analytics(this.Analytics.id);
      }
    }
    if (this.TweenEngine) {
      this.tweenEngine = new this.TweenEngine;
    }
    var plugin;
    for (plugin in this.plugins) {
      this.plugins[plugin] = new this.plugins[plugin];
    }
    this.loader = new (onFailed || this.Loader)(ui);
    if (!this.system.rotateScreenVisible) {
      this.loader.start();
    }
  },
  /**
   * @param {string} name
   * @param {string} failure
   * @return {undefined}
   */
  loadScript : function(name, failure) {
    /** @type {boolean} */
    this.modules[name] = true;
    this.waitForLoad++;
    /** @type {string} */
    var path = this.config.sourceFolder + "/" + name.replace(/\./g, "/") + ".js" + this.nocache;
    /** @type {Element} */
    var script = document.createElement("script");
    /** @type {string} */
    script.type = "text/javascript";
    /** @type {string} */
    script.src = path;
    var params = this;
    /**
     * @return {undefined}
     */
    script.onload = function() {
      params.waitForLoad--;
      params.loadModules();
    };
    /**
     * @return {?}
     */
    script.onerror = function() {
      throw "Failed to load module " + name + " at " + path + " required from " + failure;
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  },
  /**
   * @return {undefined}
   */
  loadModules : function() {
    var e;
    var idx;
    var i;
    var m;
    var id;
    var topAncestor;
    /** @type {number} */
    idx = 0;
    for (;idx < this.loadQueue.length;idx++) {
      m = this.loadQueue[idx];
      /** @type {boolean} */
      topAncestor = true;
      /** @type {number} */
      i = 0;
      for (;i < m.requires.length;i++) {
        id = m.requires[i];
        if (this.modules[id]) {
          if (!this.modules[id].loaded) {
            /** @type {boolean} */
            topAncestor = false;
          }
        } else {
          /** @type {boolean} */
          topAncestor = false;
          this.loadScript(id, m.name);
        }
      }
      if (topAncestor && m.body) {
        if (this.loadQueue.splice(idx, 1), 0 === this.loadQueue.length) {
          var inputIndex;
          for (inputIndex in this.config) {
            var fnUid = inputIndex.ucfirst();
            if (this[fnUid]) {
              var key;
              for (key in this.config[inputIndex]) {
                this[fnUid][key] = this.config[inputIndex][key];
              }
            }
          }
        }
        /** @type {boolean} */
        m.loaded = true;
        m.body(this);
        /** @type {boolean} */
        e = true;
        idx--;
      }
    }
    if (e && this.loadQueue.length > 0) {
      this.loadModules();
    } else {
      if (0 === this.waitForLoad && 0 !== this.loadQueue.length) {
        /** @type {Array} */
        var tagNameArr = [];
        /** @type {number} */
        idx = 0;
        for (;idx < this.loadQueue.length;idx++) {
          /** @type {Array} */
          var include = [];
          var codeSegments = this.loadQueue[idx].requires;
          /** @type {number} */
          i = 0;
          for (;i < codeSegments.length;i++) {
            m = this.modules[codeSegments[i]];
            if (!(m && m.loaded)) {
              include.push(codeSegments[i]);
            }
          }
          tagNameArr.push(this.loadQueue[idx].name + " (requires: " + include.join(", ") + ")");
        }
        throw "Unresolved modules:\n" + tagNameArr.join("\n");
      }
      /** @type {boolean} */
      this.loadFinished = true;
    }
  },
  /**
   * @param {?} callback
   * @param {?} element
   * @return {?}
   */
  setGameLoop : function(callback, element) {
    if (window.requestAnimationFrame) {
      /** @type {number} */
      var i = this.next++;
      /** @type {boolean} */
      this.anims[i] = true;
      var that = this;
      /**
       * @return {undefined}
       */
      var animate = function() {
        if (that.anims[i]) {
          window.requestAnimationFrame(animate, element);
          callback();
        }
      };
      return window.requestAnimationFrame(animate, element), i;
    }
    return window.setInterval(callback, 1E3 / 60);
  },
  /**
   * @param {?} name
   * @return {undefined}
   */
  clearGameLoop : function(name) {
    if (window.requestAnimationFrame) {
      delete this.anims[name];
    } else {
      window.clearInterval(name);
    }
  },
  /**
   * @return {undefined}
   */
  boot : function() {
    /** @type {Element} */
    var test_canvas = document.createElement("canvas");
    /** @type {boolean} */
    var t = !(!test_canvas.getContext || !test_canvas.getContext("2d"));
    if (!t) {
      if (!core.config.noCanvasURL) {
        throw "Canvas not supported";
      }
      window.location = core.config.noCanvasURL;
    }
    if (Math.distance = function(x, y, x2, y2) {
      return x = x2 - x, y = y2 - y, Math.sqrt(x * x + y * y);
    }, Math.randomBetween = function(min, max) {
      return Math.random() * (max - min) + min;
    }, Math.randomInt = function(min, max) {
      return Math.round(Math.randomBetween(min, max));
    }, this.Math = Math, Number.prototype.limit = function(next, res) {
      /** @type {Number} */
      var last = this;
      return next > last && (last = next), last > res && (last = res), last;
    }, Number.prototype.round = function(x) {
      return x = x ? Math.pow(10, x) : 1, Math.round(this * x) / x;
    }, Array.prototype.erase = function(item) {
      /** @type {number} */
      var i = this.length;
      for (;i >= 0;i--) {
        if (this[i] === item) {
          this.splice(i, 1);
        }
      }
      return this;
    }, Array.prototype.random = function() {
      return this[Math.floor(Math.random() * this.length)];
    }, Array.prototype.shuffle = function() {
      /** @type {number} */
      var len = this.length;
      /** @type {number} */
      var i = len;
      for (;i--;) {
        /** @type {number} */
        var j = parseInt(Math.random() * len);
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
      }
      return this;
    }, Function.prototype.bind = function(task) {
      /** @type {Function} */
      var fn = this;
      /** @type {Array} */
      var name = [];
      return Array.prototype.push.apply(name, arguments), name.shift(), function() {
        /** @type {Array} */
        var val = [];
        return Array.prototype.push.apply(val, name), Array.prototype.push.apply(val, arguments), fn.apply(task, val);
      };
    }, String.prototype.ucfirst = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }, this.coreModules = this.config.coreModules || this.coreModules, this.module("engine.core"), game.normalizeVendorAttribute(window, "requestAnimationFrame"), document.location.href.match(/\?nocache/) && (this.nocache = "?" + Date.now()), this.device.pixelRatio = window.devicePixelRatio || 1, this.device.screen = {
      width : window.screen.availWidth * this.device.pixelRatio,
      height : window.screen.availHeight * this.device.pixelRatio
    }, this.device.iPod = /iPod/i.test(navigator.userAgent), this.device.iPhone = /iPhone/i.test(navigator.userAgent), this.device.iPhone4 = this.device.iPhone && 2 === this.device.pixelRatio, this.device.iPhone5 = this.device.iPhone && (2 === this.device.pixelRatio && 1096 === this.device.screen.height), this.device.iPad = /iPad/i.test(navigator.userAgent), this.device.iPadRetina = this.device.iPad && 2 === this.device.pixelRatio, this.device.iOS = this.device.iPod || (this.device.iPhone || this.device.iPad), 
    this.device.iOS5 = this.device.iOS && /OS 5/i.test(navigator.userAgent), this.device.iOS6 = this.device.iOS && /OS 6/i.test(navigator.userAgent), this.device.iOS7 = this.device.iOS && /OS 7/i.test(navigator.userAgent), this.device.iOS71 = this.device.iOS && /OS 7_1/i.test(navigator.userAgent), this.device.android = /android/i.test(navigator.userAgent), this.device.android2 = /android 2/i.test(navigator.userAgent), this.device.ie9 = /MSIE 9/i.test(navigator.userAgent), this.device.ie10 = /MSIE 10/i.test(navigator.userAgent), 
    this.device.ie11 = /rv:11.0/i.test(navigator.userAgent), this.device.ie = this.device.ie10 || (this.device.ie11 || this.device.ie9), this.device.wp7 = /Windows Phone OS 7/i.test(navigator.userAgent), this.device.wp8 = /Windows Phone 8/i.test(navigator.userAgent), this.device.wp = this.device.wp7 || this.device.wp8, this.device.wt = this.device.ie && /Tablet/i.test(navigator.userAgent), this.device.opera = /Opera/i.test(navigator.userAgent), this.device.crosswalk = /Crosswalk/i.test(navigator.userAgent), 
    this.device.cocoonJS = !!navigator.isCocoonJS, this.device.ejecta = /Ejecta/i.test(navigator.userAgent), this.device.facebook = /FB/i.test(navigator.userAgent), this.device.mobile = this.device.iOS || (this.device.android || (this.device.wp || this.device.wt)), "undefined" == typeof navigator.plugins || 0 === navigator.plugins.length) {
      try {
        new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        /** @type {boolean} */
        this.device.flash = true;
      } catch (i) {
        /** @type {boolean} */
        this.device.flash = false;
      }
    } else {
      /** @type {boolean} */
      this.device.flash = !!navigator.plugins["Shockwave Flash"];
    }
    var j;
    for (j in this.device) {
      if (this.device[j] && this.config[j]) {
        var key;
        for (key in this.config[j]) {
          this.merge(this.config[key], this.config[j][key]);
        }
      }
    }
    this.config.sourceFolder = this.config.sourceFolder || "src";
    /** @type {string} */
    this.config.mediaFolder = this.config.mediaFolder ? this.config.mediaFolder + "/" : "media/";
    /** @type {NodeList} */
    var tags = document.getElementsByTagName("meta");
    /** @type {boolean} */
    var r = false;
    /** @type {number} */
    j = 0;
    for (;j < tags.length;j++) {
      if ("viewport" === tags[j].name) {
        /** @type {boolean} */
        r = true;
      }
    }
    if (!r) {
      /** @type {Element} */
      var metaEl = document.createElement("meta");
      /** @type {string} */
      metaEl.name = "viewport";
      /** @type {string} */
      var tempDate = "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no";
      if (this.device.iOS71) {
        tempDate += ",minimal-ui";
      }
      /** @type {string} */
      metaEl.content = tempDate;
      document.getElementsByTagName("head")[0].appendChild(metaEl);
    }
    if ("complete" === document.readyState) {
      this.DOMReady();
    } else {
      document.addEventListener("DOMContentLoaded", this.DOMReady.bind(this), false);
      window.addEventListener("load", this.DOMReady.bind(this), false);
    }
  },
  /**
   * @return {?}
   */
  DOMReady : function() {
    if (!this.DOMLoaded) {
      if (!document.body) {
        return setTimeout(this.DOMReady.bind(this), 13);
      }
      /** @type {boolean} */
      this.DOMLoaded = true;
      this.loadModules();
    }
  }
};
/** @type {boolean} */
var initializing = false;
/** @type {RegExp} */
var fnTest = /xyz/.test(function() {
  var e;
  return e;
}) ? /\b_super\b/ : /[\D|\d]*/;
core.Class = function() {
}, core.Class.extend = function(opt_attributes) {
  /**
   * @return {?}
   */
  function Class() {
    if (!initializing) {
      if (this.staticInit) {
        var obj = this.staticInit.apply(this, arguments);
        if (obj) {
          return obj;
        }
      }
      var i;
      for (i in this) {
        if ("object" == typeof this[i]) {
          this[i] = core.copy(this[i]);
        }
      }
      if (this.init) {
        this.init.apply(this, arguments);
      }
    }
    return this;
  }
  var _super = this.prototype;
  /** @type {boolean} */
  initializing = true;
  var prototype = new this;
  /** @type {boolean} */
  initializing = false;
  /**
   * @param {string} name
   * @param {Function} matcherFunction
   * @return {?}
   */
  var _superFactory = function(name, matcherFunction) {
    return function() {
      var c = this._super;
      this._super = _super[name];
      var e = matcherFunction.apply(this, arguments);
      return this._super = c, e;
    };
  };
  var name;
  for (name in opt_attributes) {
    prototype[name] = "function" == typeof opt_attributes[name] && ("function" == typeof _super[name] && fnTest.test(opt_attributes[name])) ? _superFactory(name, opt_attributes[name]) : opt_attributes[name];
  }
  return Class.prototype = prototype, Class.prototype.constructor = Class, Class.extend = core.Class.extend, Class.inject = function(prop) {
    var proto = this.prototype;
    var old = {};
    /**
     * @param {string} name
     * @param {Function} matcherFunction
     * @return {?}
     */
    var makeFn = function(name, matcherFunction) {
      return function() {
        var c = this._super;
        this._super = old[name];
        var e = matcherFunction.apply(this, arguments);
        return this._super = c, e;
      };
    };
    var name;
    for (name in prop) {
      if ("function" == typeof prop[name] && ("function" == typeof proto[name] && fnTest.test(prop[name]))) {
        old[name] = proto[name];
        proto[name] = makeFn(name, prop[name]);
      } else {
        proto[name] = prop[name];
      }
    }
  }, Class;
}, "undefined" != typeof exports ? ("undefined" != typeof module && (module.exports && (exports = module.exports = core)), exports.core = core) : (window.game = window.panda = core, core.boot()), game.module("engine.loader").body(function() {
  game.Loader = game.Class.extend({
    scene : null,
    loaded : 0,
    percent : 0,
    backgroundColor : 0,
    assetQueue : [],
    soundQueue : [],
    started : false,
    dynamic : true,
    callback : null,
    /**
     * @param {Object} parent
     * @return {undefined}
     */
    init : function(parent) {
      if (parent && parent.prototype.init || game.System.startScene) {
        this.scene = parent || (window[game.System.startScene] || game[game.System.startScene]);
        /** @type {boolean} */
        this.dynamic = false;
        /** @type {null} */
        game.System.startScene = null;
      } else {
        /** @type {Object} */
        this.callback = parent;
      }
      this.stage = game.system.stage;
      /** @type {number} */
      var i = 0;
      for (;i < game.assetQueue.length;i++) {
        if (!game.TextureCache[game.assetQueue[i]]) {
          this.assetQueue.push(this.getPath(game.assetQueue[i]));
        }
      }
      if (game.Audio) {
        var copies;
        for (copies in game.audioQueue) {
          this.soundQueue.push(copies);
        }
      }
      if (this.assetQueue.length > 0) {
        this.loader = new game.AssetLoader(this.assetQueue, true);
        this.loader.onProgress = this.progress.bind(this);
        this.loader.onComplete = this.loadAudio.bind(this);
        this.loader.onError = this.error.bind(this);
      }
      if (0 === this.assetQueue.length) {
        if (0 === this.soundQueue.length) {
          /** @type {number} */
          this.percent = 100;
        }
      }
    },
    /**
     * @return {undefined}
     */
    initStage : function() {
      if (game.Loader.logo && (this.logo = new game.Sprite(game.Texture.fromImage(game.Loader.logo)), this.logo.anchor.set(0.5, 1), this.logo.position.set(game.system.width / 2, game.system.height / 2 + this.logo.height / 2), this.stage.addChild(this.logo)), this.barBg = new game.Graphics, this.barBg.beginFill(game.Loader.barBg), this.barBg.drawRect(0, 0, game.Loader.barWidth, game.Loader.barHeight), this.barBg.position.set(game.system.width / 2 - game.Loader.barWidth / 2, game.system.height / 2 - 
      game.Loader.barHeight / 2), this.logo && (this.barBg.position.y += this.logo.height / 2 + game.Loader.barHeight + game.Loader.barMargin), this.stage.addChild(this.barBg), this.barFg = new game.Graphics, this.barFg.beginFill(game.Loader.barColor), this.barFg.drawRect(0, 0, game.Loader.barWidth, game.Loader.barHeight), this.barFg.position.set(game.system.width / 2 - game.Loader.barWidth / 2, game.system.height / 2 - game.Loader.barHeight / 2), this.logo && (this.barFg.position.y += this.logo.height / 
      2 + game.Loader.barHeight + game.Loader.barMargin), this.barFg.scale.x = this.percent / 100, this.stage.addChild(this.barFg), game.Tween && (game.Loader.logoTween && this.logo)) {
        /** @type {number} */
        this.logo.rotation = -0.1;
        (new game.Tween(this.logo)).to({
          rotation : 0.1
        }, 500).easing(game.Tween.Easing.Cubic.InOut).repeat().yoyo().start();
      }
    },
    /**
     * @return {undefined}
     */
    start : function() {
      if (this.started = true, !this.dynamic) {
        if (game.scene) {
          /** @type {number} */
          var i = this.stage.children.length - 1;
          for (;i >= 0;i--) {
            this.stage.removeChild(this.stage.children[i]);
          }
          this.stage.setBackgroundColor(this.backgroundColor);
          /** @type {boolean} */
          this.stage.interactive = false;
          /** @type {null} */
          this.stage.mousemove = this.stage.touchmove = null;
          /** @type {null} */
          this.stage.click = this.stage.tap = null;
          /** @type {null} */
          this.stage.mousedown = this.stage.touchstart = null;
          /** @type {null} */
          this.stage.mouseup = this.stage.mouseupoutside = this.stage.touchend = this.stage.touchendoutside = null;
          /** @type {null} */
          this.stage.mouseout = null;
        }
        if (game.audio && game.audio.stopAll(), "number" == typeof this.backgroundColor) {
          var sprite = new game.Graphics;
          sprite.beginFill(this.backgroundColor);
          sprite.drawRect(0, 0, game.system.width, game.system.height);
          this.stage.addChild(sprite);
        }
        this.initStage();
        if (game.scene) {
          game.scene = this;
        } else {
          this.loopId = game.setGameLoop(this.run.bind(this), game.system.canvas);
        }
      }
      if (this.assetQueue.length > 0) {
        this.loader.load();
      } else {
        this.loadAudio();
      }
    },
    /**
     * @param {?} textStatus
     * @return {undefined}
     */
    error : function(textStatus) {
      if (textStatus) {
        throw textStatus;
      }
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    progress : function(e) {
      if (e) {
        if (e.json) {
          if (!e.json.frames) {
            if (!e.json.bones) {
              game.json[e.url] = e.json;
            }
          }
        }
      }
      this.loaded++;
      /** @type {number} */
      this.percent = Math.round(this.loaded / (this.assetQueue.length + this.soundQueue.length) * 100);
      this.onPercentChange();
      if (this.dynamic) {
        if (this.loaded === this.assetQueue.length + this.soundQueue.length) {
          this.ready();
        }
      }
    },
    /**
     * @return {undefined}
     */
    onPercentChange : function() {
      if (this.barFg) {
        /** @type {number} */
        this.barFg.scale.x = this.percent / 100;
      }
    },
    /**
     * @return {undefined}
     */
    loadAudio : function() {
      /** @type {number} */
      var key_idx = this.soundQueue.length - 1;
      for (;key_idx >= 0;key_idx--) {
        game.audio.load(this.soundQueue[key_idx], this.progress.bind(this));
      }
    },
    /**
     * @return {?}
     */
    ready : function() {
      if (game.system.retina || game.system.hires) {
        var key;
        for (key in game.TextureCache) {
          if (-1 !== key.indexOf("@2x")) {
            game.TextureCache[key.replace("@2x", "")] = game.TextureCache[key];
            delete game.TextureCache[key];
          }
        }
      }
      return game.assetQueue.length = 0, game.Audio && (game.audioQueue = {}), this.dynamic ? void("function" == typeof this.callback && this.callback()) : this.setScene();
    },
    /**
     * @return {undefined}
     */
    setScene : function() {
      /** @type {number} */
      game.system.timer.last = 0;
      /** @type {number} */
      game.Timer.time = Number.MIN_VALUE;
      if (this.loopId) {
        game.clearGameLoop(this.loopId);
      }
      game.system.setScene(this.scene);
    },
    /**
     * @return {undefined}
     */
    run : function() {
      if (this.loopId) {
        this.last = game.Timer.time;
        game.Timer.update();
        /** @type {number} */
        game.system.delta = (game.Timer.time - this.last) / 1E3;
      }
      this.update();
      this.render();
    },
    /**
     * @return {undefined}
     */
    update : function() {
      if (this.startTime || (this.startTime = Date.now()), game.tweenEngine && game.tweenEngine.update(), !this._ready) {
        if (this.timer) {
          if (this.timer.time() >= 0) {
            /** @type {boolean} */
            this._ready = true;
            this.ready();
          }
        } else {
          if (this.loaded === this.assetQueue.length + this.soundQueue.length) {
            /** @type {number} */
            var deltaTime = Date.now() - this.startTime;
            /** @type {number} */
            var mseconds = Math.max(100, game.Loader.timeout - deltaTime);
            this.timer = new game.Timer(mseconds);
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    render : function() {
      game.system.renderer.render(this.stage);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    getPath : function(name) {
      return game.system.retina || game.system.hires ? name.replace(/\.(?=[^.]*$)/, "@2x.") : name;
    }
  });
  /** @type {number} */
  game.Loader.timeout = 500;
  /** @type {number} */
  game.Loader.barBg = 2301728;
  /** @type {number} */
  game.Loader.barColor = 15132648;
  /** @type {number} */
  game.Loader.barWidth = 200;
  /** @type {number} */
  game.Loader.barHeight = 20;
  /** @type {number} */
  game.Loader.barMargin = 10;
  /** @type {boolean} */
  game.Loader.logoTween = false;
  /** @type {null} */
  game.Loader.logo = null;
}), game.module("engine.timer").body(function() {
  game.Timer = game.Class.extend({
    target : 0,
    base : 0,
    last : 0,
    pauseTime : 0,
    /**
     * @param {number} expectedHashCode
     * @return {undefined}
     */
    init : function(expectedHashCode) {
      this.last = game.Timer.time;
      this.set(expectedHashCode);
    },
    /**
     * @param {number} expectedHashCode
     * @return {undefined}
     */
    set : function(expectedHashCode) {
      if ("number" != typeof expectedHashCode) {
        /** @type {number} */
        expectedHashCode = 0;
      }
      this.target = expectedHashCode || 0;
      this.reset();
    },
    /**
     * @return {undefined}
     */
    reset : function() {
      this.base = game.Timer.time;
      /** @type {number} */
      this.pauseTime = 0;
    },
    /**
     * @return {?}
     */
    delta : function() {
      /** @type {number} */
      var delta = game.Timer.time - this.last;
      return this.last = game.Timer.time, this.pauseTime ? 0 : delta;
    },
    /**
     * @return {?}
     */
    time : function() {
      /** @type {number} */
      var time = (this.pauseTime || game.Timer.time) - this.base - this.target;
      return time;
    },
    /**
     * @return {undefined}
     */
    pause : function() {
      if (!this.pauseTime) {
        this.pauseTime = game.Timer.time;
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      if (this.pauseTime) {
        this.base += game.Timer.time - this.pauseTime;
        /** @type {number} */
        this.pauseTime = 0;
      }
    }
  });
  /** @type {number} */
  game.Timer.last = 0;
  /** @type {number} */
  game.Timer.time = Number.MIN_VALUE;
  /** @type {number} */
  game.Timer.speedFactor = 1;
  /** @type {number} */
  game.Timer.maxStep = 50;
  /**
   * @return {undefined}
   */
  game.Timer.update = function() {
    /** @type {number} */
    var now = Date.now();
    if (!game.Timer.last) {
      /** @type {number} */
      game.Timer.last = now;
    }
    game.Timer.time += Math.min(now - game.Timer.last, game.Timer.maxStep) * game.Timer.speedFactor;
    /** @type {number} */
    game.Timer.last = now;
  };
}), game.module("engine.system").body(function() {
  game.System = game.Class.extend({
    width : null,
    height : null,
    delta : 0,
    timer : null,
    canvas : null,
    canvasId : "canvas",
    paused : false,
    hires : false,
    retina : false,
    rotateScreenVisible : false,
    gameLoopId : 0,
    newSceneClass : null,
    running : false,
    /**
     * @param {number} width
     * @param {number} height
     * @param {string} canvasId
     * @return {undefined}
     */
    init : function(width, height, canvasId) {
      if (width = width || game.System.width, height = height || game.System.height, "window" === width && (width = window.innerWidth), "window" === height && (height = window.innerHeight), "landscape" === game.System.orientation && (game.System.orientation = game.System.LANDSCAPE), "portrait" === game.System.orientation && (game.System.orientation = game.System.PORTRAIT), width || (width = game.System.orientation === game.System.PORTRAIT ? 768 : 1024), height || (height = game.System.orientation === 
      game.System.PORTRAIT ? 927 : 672), game.System.resizeToFill && (navigator.isCocoonJS && (window.innerWidth / window.innerHeight !== width / height && (game.System.orientation === game.System.LANDSCAPE ? width = height * (window.innerWidth / window.innerHeight) : height = width * (window.innerHeight / window.innerWidth)))), game.System.hires && ("number" == typeof game.System.hiresWidth && "number" == typeof game.System.hiresHeight ? window.innerWidth >= game.System.hiresWidth && (window.innerHeight >= 
      game.System.hiresHeight && (this.hires = true)) : window.innerWidth >= width * game.System.hiresFactor && (window.innerHeight >= height * game.System.hiresFactor && (this.hires = true))), game.System.retina && (2 === game.device.pixelRatio && (this.retina = true)), (this.hires || this.retina) && (width *= 2, height *= 2, game.scale = 2), "undefined" != typeof game.System.resize && (game.System.scale = game.System.resize), this.width = width, this.height = height, this.canvasId = canvasId || 
      (game.System.canvasId || this.canvasId), this.timer = new game.Timer, !document.getElementById(this.canvasId)) {
        /** @type {Element} */
        var canvas = document.createElement(navigator.isCocoonJS && game.System.screenCanvas ? "screencanvas" : "canvas");
        canvas.id = this.canvasId;
        document.body.appendChild(canvas);
      }
      if (game.System.canvas === false && (game.System.webGL = true), this.renderer = game.System.webGL ? new game.autoDetectRenderer(width, height, document.getElementById(this.canvasId), game.System.transparent, game.System.antialias) : new game.CanvasRenderer(width, height, document.getElementById(this.canvasId), game.System.transparent), this.canvas = this.renderer.view, this.stage = new game.Stage, game.normalizeVendorAttribute(this.canvas, "requestFullscreen"), game.normalizeVendorAttribute(this.canvas, 
      "requestFullScreen"), game.normalizeVendorAttribute(navigator, "vibrate"), document.body.style.margin = 0, this.retina ? (this.canvas.style.width = width / 2 + "px", this.canvas.style.height = height / 2 + "px") : (this.canvas.style.width = width + "px", this.canvas.style.height = height + "px"), !navigator.isCocoonJS) {
        var visibilityChange;
        if ("undefined" != typeof document.hidden) {
          /** @type {string} */
          visibilityChange = "visibilitychange";
        } else {
          if ("undefined" != typeof document.mozHidden) {
            /** @type {string} */
            visibilityChange = "mozvisibilitychange";
          } else {
            if ("undefined" != typeof document.msHidden) {
              /** @type {string} */
              visibilityChange = "msvisibilitychange";
            } else {
              if ("undefined" != typeof document.webkitHidden) {
                /** @type {string} */
                visibilityChange = "webkitvisibilitychange";
              }
            }
          }
        }
        document.addEventListener(visibilityChange, function() {
          if (game.System.pauseOnHide) {
            /** @type {boolean} */
            var e = !!game.getVendorAttribute(document, "hidden");
            if (e) {
              game.system.pause();
            } else {
              game.system.resume();
            }
          }
        }, false);
      }
      window.addEventListener("devicemotion", function(event) {
        game.accelerometer = game.accel = event.accelerationIncludingGravity;
      }, false);
      if (!navigator.isCocoonJS) {
        if ("object" == typeof game.System.backgroundColor) {
          game.System.bgColorMobile = game.System.backgroundColor.mobile;
          game.System.bgColorRotate = game.System.backgroundColor.rotate;
        }
        if ("object" == typeof game.System.backgroundImage) {
          game.System.bgImageMobile = game.System.backgroundImage.mobile;
          game.System.bgImageRotate = game.System.backgroundImage.rotate;
        }
        if (game.System.bgColor) {
          if (!game.System.bgColorMobile) {
            game.System.bgColorMobile = game.System.bgColor;
          }
        }
        if (game.System.bgColorMobile) {
          if (!game.System.bgColorRotate) {
            game.System.bgColorRotate = game.System.bgColorMobile;
          }
        }
        if (game.System.bgImage) {
          if (!game.System.bgImageMobile) {
            game.System.bgImageMobile = game.System.bgImage;
          }
        }
        if (game.System.bgImageMobile) {
          if (!game.System.bgImageRotate) {
            game.System.bgImageRotate = game.System.bgImageMobile;
          }
        }
        if (!game.device.mobile) {
          if (game.System.bgColor) {
            document.body.style.backgroundColor = game.System.bgColor;
          }
          if (game.System.bgImage) {
            /** @type {string} */
            document.body.style.backgroundImage = "url(" + game.config.mediaFolder + game.System.bgImage + ")";
          }
        }
        if (game.System.bgPosition) {
          document.body.style.backgroundPosition = game.System.bgPosition;
        }
      }
      if (navigator.isCocoonJS) {
        /** @type {string} */
        this.canvas.style.cssText = "idtkscale:" + game.System.idtkScale + ";";
      }
      game.renderer = this.renderer;
      if (!navigator.isCocoonJS) {
        this.initResize();
      }
    },
    /**
     * @param {?} milliseconds
     * @return {?}
     */
    vibrate : function(milliseconds) {
      return navigator.vibrate ? navigator.vibrate(milliseconds) : false;
    },
    /**
     * @return {undefined}
     */
    pause : function() {
      if (!this.paused) {
        /** @type {boolean} */
        this.paused = true;
        if (game.scene) {
          game.scene.pause();
        }
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      if (this.paused) {
        /** @type {boolean} */
        this.paused = false;
        /** @type {number} */
        game.Timer.last = Date.now();
        if (game.scene) {
          game.scene.resume();
        }
      }
    },
    /**
     * @param {Error} sceneClass
     * @return {undefined}
     */
    setScene : function(sceneClass) {
      if (this.running) {
        /** @type {Error} */
        this.newSceneClass = sceneClass;
      } else {
        this.setSceneNow(sceneClass);
      }
    },
    /**
     * @param {Error} SceneClass
     * @return {undefined}
     */
    setSceneNow : function(SceneClass) {
      if (game.tweenEngine) {
        /** @type {number} */
        game.tweenEngine.tweens.length = 0;
      }
      game.scene = new SceneClass;
      if (game.Debug) {
        if (game.Debug.enabled) {
          if (!navigator.isCocoonJS) {
            this.debug = new game.Debug;
          }
        }
      }
      this.startRunLoop();
    },
    /**
     * @return {undefined}
     */
    startRunLoop : function() {
      if (this.gameLoopId) {
        this.stopRunLoop();
      }
      this.gameLoopId = game.setGameLoop(this.run.bind(this), this.canvas);
      /** @type {boolean} */
      this.running = true;
    },
    /**
     * @return {undefined}
     */
    stopRunLoop : function() {
      game.clearGameLoop(this.gameLoopId);
      /** @type {boolean} */
      this.running = false;
    },
    /**
     * @return {undefined}
     */
    run : function() {
      if (!this.paused) {
        game.Timer.update();
        /** @type {number} */
        this.delta = this.timer.delta() / 1E3;
        game.scene.run();
        if (this.debug) {
          this.debug.update();
        }
        if (this.newSceneClass) {
          this.setSceneNow(this.newSceneClass);
          /** @type {null} */
          this.newSceneClass = null;
        }
      }
    },
    /**
     * @param {number} width
     * @param {number} height
     * @return {undefined}
     */
    resize : function(width, height) {
      this.width = this.canvas.width = width;
      this.height = this.canvas.height = height;
      /** @type {string} */
      this.canvas.style.width = width + "px";
      /** @type {string} */
      this.canvas.style.height = height + "px";
      this.renderer.resize(this.width, this.height);
    },
    /**
     * @return {undefined}
     */
    initResize : function() {
      if (this.ratio = game.System.orientation === game.System.LANDSCAPE ? this.width / this.height : this.height / this.width, game.System.center && (this.canvas.style.margin = "auto"), game.device.mobile) {
        if (!game.System.center) {
          /** @type {string} */
          this.canvas.style.position = "absolute";
          /** @type {string} */
          this.canvas.style.left = game.System.left + "px";
          /** @type {string} */
          this.canvas.style.top = game.System.top + "px";
        }
        document.addEventListener("touchstart", function(types) {
          types.preventDefault();
        }, false);
        /** @type {Element} */
        var div = document.createElement("div");
        if (div.innerHTML = game.System.rotateImg ? "" : game.System.rotateMsg, div.style.position = "absolute", div.style.height = "12px", div.style.textAlign = "center", div.style.left = 0, div.style.right = 0, div.style.top = 0, div.style.bottom = 0, div.style.margin = "auto", div.style.display = "none", div.id = "panda-rotate", game.System.rotateDiv = div, document.body.appendChild(game.System.rotateDiv), game.System.rotateImg) {
          /** @type {Image} */
          var img = new Image;
          var me = this;
          /**
           * @return {undefined}
           */
          img.onload = function() {
            /** @type {Image} */
            div.image = img;
            /** @type {string} */
            div.style.height = img.height + "px";
            div.appendChild(img);
            me.resizeRotateImage();
          };
          img.src = game.config.mediaFolder + game.System.rotateImg;
          /** @type {string} */
          img.style.position = "relative";
          /** @type {string} */
          img.style.maxWidth = "100%";
        }
      } else {
        if (this.canvas.style.position = "absolute", game.System.center ? (this.canvas.style.top = 0, this.canvas.style.left = 0, this.canvas.style.bottom = 0, this.canvas.style.right = 0) : (this.canvas.style.left = game.System.left + "px", this.canvas.style.top = game.System.top + "px"), game.System.scale) {
          var minWidth = "auto" === game.System.minWidth ? this.retina ? this.width / 4 : this.width / 2 : game.System.minWidth;
          var minHeight = "auto" === game.System.minHeight ? this.retina ? this.height / 4 : this.height / 2 : game.System.minHeight;
          var width = "auto" === game.System.maxWidth ? this.retina ? this.width / 2 : this.width : game.System.maxWidth;
          var maxHeight = "auto" === game.System.maxHeight ? this.retina ? this.height / 2 : this.height : game.System.maxHeight;
          if (game.System.minWidth) {
            /** @type {string} */
            this.canvas.style.minWidth = minWidth + "px";
          }
          if (game.System.minHeight) {
            /** @type {string} */
            this.canvas.style.minHeight = minHeight + "px";
          }
          if (game.System.maxWidth) {
            if (!game.System.scaleToFit) {
              /** @type {string} */
              this.canvas.style.maxWidth = width + "px";
            }
          }
          if (game.System.maxHeight) {
            if (!game.System.scaleToFit) {
              /** @type {string} */
              this.canvas.style.maxHeight = maxHeight + "px";
            }
          }
        }
      }
      if ("undefined" == typeof window.onorientationchange || game.device.android) {
        window.onresize = this.onResize.bind(this);
      } else {
        window.onorientationchange = this.onResize.bind(this);
      }
      this.onResize();
    },
    /**
     * @return {undefined}
     */
    checkOrientation : function() {
      this.orientation = window.innerWidth < window.innerHeight ? game.System.PORTRAIT : game.System.LANDSCAPE;
      if (game.device.android2) {
        if (320 === window.innerWidth) {
          if (251 === window.innerHeight) {
            this.orientation = game.System.PORTRAIT;
          }
        }
      }
      /** @type {boolean} */
      this.rotateScreenVisible = game.System.orientation !== this.orientation ? true : false;
      /** @type {string} */
      this.canvas.style.display = this.rotateScreenVisible ? "none" : "block";
      /** @type {string} */
      game.System.rotateDiv.style.display = this.rotateScreenVisible ? "block" : "none";
      if (this.rotateScreenVisible) {
        if (game.System.bgColorRotate) {
          document.body.style.backgroundColor = game.System.bgColorRotate;
        }
      }
      if (!this.rotateScreenVisible) {
        if (game.System.bgColorMobile) {
          document.body.style.backgroundColor = game.System.bgColorMobile;
        }
      }
      if (this.rotateScreenVisible) {
        if (game.System.bgImageRotate) {
          /** @type {string} */
          document.body.style.backgroundImage = "url(" + game.config.mediaFolder + game.System.bgImageRotate + ")";
        }
      }
      if (!this.rotateScreenVisible) {
        if (game.System.bgImageMobile) {
          /** @type {string} */
          document.body.style.backgroundImage = "url(" + game.config.mediaFolder + game.System.bgImageMobile + ")";
        }
      }
      if (this.rotateScreenVisible) {
        if (game.system) {
          if ("function" == typeof game.system.pause) {
            game.system.pause();
          }
        }
      }
      if (!this.rotateScreenVisible) {
        if (game.system) {
          if ("function" == typeof game.system.resume) {
            game.system.resume();
          }
        }
      }
      if (this.rotateScreenVisible) {
        this.resizeRotateImage();
      }
    },
    /**
     * @return {undefined}
     */
    resizeRotateImage : function() {
      if (this.rotateScreenVisible) {
        if (game.System.rotateDiv.image) {
          if (window.innerHeight < game.System.rotateDiv.image.height) {
            /** @type {string} */
            game.System.rotateDiv.image.style.height = window.innerHeight + "px";
            /** @type {string} */
            game.System.rotateDiv.image.style.width = "auto";
            /** @type {string} */
            game.System.rotateDiv.style.height = window.innerHeight + "px";
            /** @type {string} */
            game.System.rotateDiv.style.bottom = "auto";
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    onResize : function() {
      if (game.device.mobile && this.checkOrientation(), game.System.scale) {
        if (game.device.mobile) {
          /** @type {number} */
          var width = window.innerWidth;
          /** @type {number} */
          var height = window.innerHeight;
          if (game.device.iOS7) {
            if (256 === window.innerHeight) {
              /** @type {number} */
              height = 319;
            }
          }
          if (game.device.iOS7) {
            if (2 === game.device.pixelRatio) {
              if (this.orientation === game.System.LANDSCAPE) {
                height += 2;
              }
            }
          }
          if (game.System.resizeToFill) {
            if (!this.rotateScreenVisible) {
              if (width / height !== this.width / this.height) {
                if (this.orientation === game.System.LANDSCAPE) {
                  /** @type {number} */
                  this.width = this.height * (width / height);
                  /** @type {number} */
                  this.ratio = this.width / this.height;
                } else {
                  /** @type {number} */
                  this.height = this.width * (height / width);
                  /** @type {number} */
                  this.ratio = this.height / this.width;
                }
                this.renderer.resize(this.width, this.height);
              }
            }
          }
          if (game.System.orientation === game.System.LANDSCAPE) {
            /** @type {string} */
            this.canvas.style.height = height + "px";
            /** @type {string} */
            this.canvas.style.width = height * this.ratio + "px";
          } else {
            /** @type {string} */
            this.canvas.style.width = width + "px";
            /** @type {string} */
            this.canvas.style.height = width * this.ratio + "px";
          }
          if (!game.device.ejecta) {
            window.scroll(0, 1);
          }
          if (!this.rotateScreenVisible) {
            if (!!game.loader) {
              if (!game.loader.started) {
                game.loader.start();
              }
            }
          }
        } else {
          if (0 === window.innerWidth) {
            return;
          }
          if (window.innerWidth < this.width || (window.innerHeight < this.height || game.System.scaleToFit)) {
            if (window.innerWidth / this.width < window.innerHeight / this.height) {
              /** @type {string} */
              this.canvas.style.width = window.innerWidth + "px";
              /** @type {string} */
              this.canvas.style.height = window.innerWidth * (this.height / this.width) + "px";
            } else {
              /** @type {string} */
              this.canvas.style.height = window.innerHeight + "px";
              /** @type {string} */
              this.canvas.style.width = window.innerHeight * (this.width / this.height) + "px";
            }
          } else {
            /** @type {string} */
            this.canvas.style.width = this.width + "px";
            /** @type {string} */
            this.canvas.style.height = this.height + "px";
          }
        }
      }
    }
  });
  /** @type {boolean} */
  game.System.center = true;
  /** @type {number} */
  game.System.left = 0;
  /** @type {number} */
  game.System.top = 0;
  /** @type {boolean} */
  game.System.scale = true;
  /** @type {string} */
  game.System.minWidth = "auto";
  /** @type {string} */
  game.System.minHeight = "auto";
  /** @type {string} */
  game.System.maxWidth = "auto";
  /** @type {string} */
  game.System.maxHeight = "auto";
  /** @type {string} */
  game.System.idtkScale = "ScaleAspectFit";
  /** @type {boolean} */
  game.System.screenCanvas = true;
  /** @type {boolean} */
  game.System.hires = false;
  /** @type {number} */
  game.System.hiresFactor = 1.5;
  /** @type {null} */
  game.System.hiresWidth = null;
  /** @type {null} */
  game.System.hiresHeight = null;
  /** @type {boolean} */
  game.System.retina = false;
  /** @type {boolean} */
  game.System.pauseOnHide = true;
  /** @type {number} */
  game.System.PORTRAIT = 0;
  /** @type {number} */
  game.System.LANDSCAPE = 1;
  /** @type {number} */
  game.System.orientation = game.System.PORTRAIT;
  /** @type {null} */
  game.System.bgColor = null;
  /** @type {null} */
  game.System.bgColorMobile = null;
  /** @type {null} */
  game.System.bgColorRotate = null;
  /** @type {null} */
  game.System.bgImage = null;
  /** @type {null} */
  game.System.bgImageMobile = null;
  /** @type {null} */
  game.System.bgImageRotate = null;
  /** @type {null} */
  game.System.bgPosition = null;
  /** @type {null} */
  game.System.rotateMsg = null;
  /** @type {null} */
  game.System.rotateImg = null;
  /** @type {boolean} */
  game.System.webGL = false;
  /** @type {boolean} */
  game.System.transparent = false;
  /** @type {boolean} */
  game.System.antialias = false;
  /** @type {boolean} */
  game.System.resizeToFill = false;
  /** @type {string} */
  game.System.startScene = "SceneGame";
  /** @type {boolean} */
  game.System.scaleToFit = false;
  /** @type {null} */
  game.System.canvasId = null;
}), game.module("engine.audio").body(function() {
  game.Audio = game.Class.extend({
    format : null,
    soundMuted : false,
    soundVolume : 1,
    currentMusic : null,
    musicMuted : false,
    musicVolume : 1,
    sources : {},
    context : null,
    gainNode : null,
    /**
     * @return {undefined}
     */
    init : function() {
      if (game.normalizeVendorAttribute(window, "AudioContext"), game.device.iOS5 && (game.Audio.enabled = false), game.device.wp && (game.Audio.enabled = false), game.device.android2 && (game.Audio.enabled = false), game.device.cocoonJS || (navigator.onLine || (!game.device.mobile || (game.Audio.enabled = false))), game.Audio.enabled || (game.Audio.webAudio = false), game.Audio.webAudio && (!window.AudioContext && (game.Audio.webAudio = false)), game.Audio.enabled) {
        var check = new Audio;
        /** @type {number} */
        var i = 0;
        for (;i < game.Audio.formats.length;i++) {
          if (check.canPlayType(game.Audio.formats[i].type)) {
            this.format = game.Audio.formats[i].ext;
            break;
          }
        }
      }
      if (!this.format) {
        /** @type {boolean} */
        game.Audio.enabled = false;
      }
      if (game.Audio.enabled) {
        if (game.Audio.webAudio) {
          this.context = new AudioContext;
          if (this.context.createGain) {
            this.gainNode = this.context.createGain();
          } else {
            if (this.context.createGainNode) {
              this.gainNode = this.context.createGainNode();
            }
          }
          this.gainNode.connect(this.context.destination);
        }
      }
    },
    /**
     * @param {Function} context
     * @param {string} i
     * @param {?} alias
     * @return {undefined}
     */
    decode : function(context, i, alias) {
      if (this.context) {
        if (!context.response) {
          throw "Error loading audio: " + i;
        }
        this.context.decodeAudioData(context.response, this.loaded.bind(this, i, alias), this.loadError.bind(this, i));
      }
    },
    /**
     * @param {string} name
     * @param {Object} callback
     * @return {?}
     */
    load : function(name, callback) {
      if (!game.Audio.enabled) {
        return callback ? callback() : false;
      }
      var path = this.getPath(name);
      if (this.context) {
        /** @type {XMLHttpRequest} */
        var request = new XMLHttpRequest;
        request.open("GET", path, true);
        /** @type {string} */
        request.responseType = "arraybuffer";
        request.onload = this.decode.bind(this, request, name, callback);
        request.send();
      } else {
        var self = new Audio(path);
        if (game.device.ie) {
          this.loaded(name, callback, self);
        } else {
          self.loadCallback = this.loaded.bind(this, name, callback, self);
          self.addEventListener("canplaythrough", self.loadCallback, false);
          self.addEventListener("error", this.loadError.bind(this, name), false);
        }
        /** @type {string} */
        self.preload = "auto";
        self.load();
      }
    },
    /**
     * @param {string} path
     * @param {Object} callback
     * @param {Object} element
     * @return {undefined}
     */
    loaded : function(path, callback, element) {
      if (this.sources[game.audioQueue[path]]) {
        throw "Duplicate audio source: " + game.audioQueue[path];
      }
      if (!game.audioQueue[path]) {
        throw "Cannot find audio resource: " + path;
      }
      var id = game.audioQueue[path];
      this.sources[id] = {
        clips : [],
        audio : element,
        path : path
      };
      if (element instanceof Audio) {
        element.removeEventListener("canplaythrough", element.loadCallback, false);
        element.addEventListener("ended", function() {
          /** @type {boolean} */
          this.playing = false;
        }, false);
      }
      if (callback) {
        callback(path);
      }
    },
    /**
     * @param {string} resourceURL
     * @return {?}
     */
    loadError : function(resourceURL) {
      throw "Error loading: " + resourceURL;
    },
    /**
     * @param {string} name
     * @return {?}
     */
    getPath : function(name) {
      return name.replace(/[^\.]+$/, this.format + game.nocache);
    },
    /**
     * @param {string} name
     * @param {number} volume
     * @param {boolean} dataAndEvents
     * @param {Function} options
     * @param {number} deepDataAndEvents
     * @return {undefined}
     */
    play : function(name, volume, dataAndEvents, options, deepDataAndEvents) {
      if (!this.sources[name]) {
        throw "Cannot find source: " + name;
      }
      if (this.context) {
        var self = this.context.createBufferSource();
        self.buffer = this.sources[name].audio;
        /** @type {boolean} */
        self.loop = !!dataAndEvents;
        self.playbackRate.value = deepDataAndEvents || 1;
        /** @type {(function (...[?]): ?|null)} */
        self.onended = "function" == typeof options ? options.bind(this) : null;
        var source;
        if (this.context.createGain) {
          source = this.context.createGain();
        } else {
          if (this.context.createGainNode) {
            source = this.context.createGainNode();
          }
        }
        source.gain.value = volume || 1;
        source.connect(this.gainNode);
        self.connect(source);
        if (self.start) {
          self.start(0, this.sources[name].audio.pauseTime || 0);
        } else {
          if (self.noteOn) {
            self.noteOn(0, this.sources[name].audio.pauseTime || 0);
          }
        }
        this.sources[name].clips.push(self);
        this.sources[name].audio.volume = source.gain.value;
        /** @type {boolean} */
        this.sources[name].audio.loop = self.loop;
        /** @type {number} */
        this.sources[name].audio.startTime = this.context.currentTime - this.sources[name].audio.pauseTime || 0;
      } else {
        this.sources[name].audio.volume = volume || 1;
        /** @type {boolean} */
        this.sources[name].audio.loop = dataAndEvents;
        /** @type {boolean} */
        this.sources[name].audio.playing = true;
        /** @type {(function (...[?]): ?|null)} */
        this.sources[name].audio.onended = "function" == typeof options ? options.bind(this) : null;
        /** @type {number} */
        this.sources[name].audio.currentTime = 0;
        this.sources[name].audio.play();
      }
    },
    /**
     * @param {Object} dataAndEvents
     * @return {undefined}
     */
    stop : function(dataAndEvents) {
      if (!this.sources[dataAndEvents]) {
        throw "Cannot find source: " + dataAndEvents;
      }
      if (this.context) {
        /** @type {number} */
        var i = 0;
        for (;i < this.sources[dataAndEvents].clips.length;i++) {
          if (this.sources[dataAndEvents].clips[i].stop) {
            this.sources[dataAndEvents].clips[i].stop(true);
          } else {
            if (this.sources[dataAndEvents].clips[i].noteOff) {
              this.sources[dataAndEvents].clips[i].noteOff(true);
            }
          }
        }
        /** @type {number} */
        this.sources[dataAndEvents].clips.length = 0;
        /** @type {number} */
        this.sources[dataAndEvents].audio.pauseTime = 0;
      } else {
        if (navigator.isCocoonJS) {
          /** @type {number} */
          this.sources[dataAndEvents].audio.volume = 0;
        } else {
          this.sources[dataAndEvents].audio.pause();
        }
        /** @type {boolean} */
        this.sources[dataAndEvents].audio.playing = false;
        /** @type {number} */
        this.sources[dataAndEvents].audio.currentTime = 0;
      }
    },
    /**
     * @param {string} name
     * @return {undefined}
     */
    pause : function(name) {
      if (!this.sources[name]) {
        throw "Cannot find source: " + name;
      }
      if (this.context) {
        if (0 === this.sources[name].clips.length) {
          return;
        }
        /** @type {number} */
        var i = 0;
        for (;i < this.sources[name].clips.length;i++) {
          if (this.sources[name].clips[i].stop) {
            this.sources[name].clips[i].stop(true);
          } else {
            if (this.sources[name].clips[i].noteOff) {
              this.sources[name].clips[i].noteOff(true);
            }
          }
        }
        /** @type {number} */
        this.sources[name].clips.length = 0;
        /** @type {number} */
        this.sources[name].audio.pauseTime = (this.context.currentTime - this.sources[name].audio.startTime) % this.sources[name].audio.duration;
        if (this.context.currentTime > this.sources[name].audio.startTime + this.sources[name].audio.duration) {
          if (!this.sources[name].audio.loop) {
            /** @type {number} */
            this.sources[name].audio.pauseTime = 0;
          }
        }
      } else {
        if (this.sources[name].audio.currentTime > 0 && this.sources[name].audio.currentTime < this.sources[name].audio.duration || this.sources[name].audio.loop) {
          this.sources[name].audio.pause();
        }
      }
    },
    /**
     * @param {string} name
     * @return {undefined}
     */
    resume : function(name) {
      if (!this.sources[name]) {
        throw "Cannot find source: " + name;
      }
      if (this.context) {
        if (this.sources[name].audio.pauseTime) {
          this.play(name, this.sources[name].audio.volume, this.sources[name].audio.loop);
          /** @type {number} */
          this.sources[name].audio.pauseTime = 0;
        }
      } else {
        if (this.sources[name].audio.playing) {
          this.sources[name].audio.play();
        }
      }
    },
    /**
     * @param {string} name
     * @param {boolean} dataAndEvents
     * @param {number} tile
     * @param {Function} info
     * @param {number} deepDataAndEvents
     * @return {undefined}
     */
    playSound : function(name, dataAndEvents, tile, info, deepDataAndEvents) {
      if (game.Audio.enabled) {
        if (!this.soundMuted) {
          tile = tile || 1;
          this.play(name, tile * this.soundVolume, dataAndEvents, info, deepDataAndEvents);
        }
      }
    },
    /**
     * @param {Object} dataAndEvents
     * @return {undefined}
     */
    stopSound : function(dataAndEvents) {
      if (game.Audio.enabled) {
        if (dataAndEvents) {
          this.stop(dataAndEvents);
        } else {
          for (dataAndEvents in this.sources) {
            if (dataAndEvents !== this.currentMusic) {
              this.stop(dataAndEvents);
            }
          }
        }
      }
    },
    /**
     * @param {string} name
     * @return {undefined}
     */
    pauseSound : function(name) {
      if (game.Audio.enabled) {
        if (name) {
          this.pause(name);
        } else {
          for (name in this.sources) {
            if (name !== this.currentMusic) {
              this.pause(name);
            }
          }
        }
      }
    },
    /**
     * @param {string} source
     * @return {undefined}
     */
    resumeSound : function(source) {
      if (game.Audio.enabled) {
        if (source) {
          this.resume(source);
        } else {
          for (source in this.sources) {
            if (source !== this.currentMusic) {
              this.resume(source);
            }
          }
        }
      }
    },
    /**
     * @param {string} name
     * @param {number} sound
     * @return {undefined}
     */
    playMusic : function(name, sound) {
      if (game.Audio.enabled) {
        if (!this.musicMuted) {
          if (this.currentMusic) {
            this.stop(this.currentMusic);
          }
          /** @type {string} */
          this.currentMusic = name;
          sound = sound || 1;
          this.play(name, sound * this.musicVolume, true);
        }
      }
    },
    /**
     * @return {undefined}
     */
    stopMusic : function() {
      if (game.Audio.enabled) {
        if (this.currentMusic) {
          this.stop(this.currentMusic);
        }
        /** @type {null} */
        this.currentMusic = null;
      }
    },
    /**
     * @return {undefined}
     */
    pauseMusic : function() {
      if (game.Audio.enabled) {
        if (this.currentMusic) {
          this.pause(this.currentMusic);
        }
      }
    },
    /**
     * @return {undefined}
     */
    resumeMusic : function() {
      if (game.Audio.enabled) {
        if (this.currentMusic) {
          if (this.context) {
            this.play(this.currentMusic, this.musicVolume, true);
          } else {
            if (this.sources[this.currentMusic].audio.playing) {
              this.sources[this.currentMusic].audio.play();
            }
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    pauseAll : function() {
      if (game.Audio.enabled) {
        if (!this.soundMuted) {
          this.pauseSound();
        }
        if (!this.musicMuted) {
          this.pauseMusic();
        }
      }
    },
    /**
     * @return {undefined}
     */
    resumeAll : function() {
      if (game.Audio.enabled) {
        if (!this.soundMuted) {
          this.resumeSound();
        }
        if (!this.musicMuted) {
          this.resumeMusic();
        }
      }
    },
    /**
     * @return {undefined}
     */
    stopAll : function() {
      if (game.Audio.enabled) {
        if (!this.soundMuted) {
          this.stopSound();
        }
        if (!this.musicMuted) {
          this.stopMusic();
        }
      }
    }
  });
  /** @type {boolean} */
  game.Audio.enabled = true;
  /** @type {boolean} */
  game.Audio.webAudio = true;
  /** @type {Array} */
  game.Audio.formats = [{
    ext : "m4a",
    type : 'audio/mp4; codecs="mp4a.40.5"'
  }, {
    ext : "ogg",
    type : 'audio/ogg; codecs="vorbis"'
  }];
}), game.module("engine.renderer").body(function() {
  (function() {
    /** @type {Window} */
    var oldWin = window;
    var PIXI = PIXI || {};
    /** @type {number} */
    PIXI.WEBGL_RENDERER = 0;
    /** @type {number} */
    PIXI.CANVAS_RENDERER = 1;
    /** @type {string} */
    PIXI.VERSION = "v1.5.3";
    PIXI.blendModes = {
      NORMAL : 0,
      ADD : 1,
      MULTIPLY : 2,
      SCREEN : 3,
      OVERLAY : 4,
      DARKEN : 5,
      LIGHTEN : 6,
      COLOR_DODGE : 7,
      COLOR_BURN : 8,
      HARD_LIGHT : 9,
      SOFT_LIGHT : 10,
      DIFFERENCE : 11,
      EXCLUSION : 12,
      HUE : 13,
      SATURATION : 14,
      COLOR : 15,
      LUMINOSITY : 16
    };
    PIXI.scaleModes = {
      DEFAULT : 0,
      LINEAR : 0,
      NEAREST : 1
    };
    /** @type {number} */
    PIXI.INTERACTION_FREQUENCY = 30;
    /** @type {boolean} */
    PIXI.AUTO_PREVENT_DEFAULT = true;
    /** @type {number} */
    PIXI.RAD_TO_DEG = 180 / Math.PI;
    /** @type {number} */
    PIXI.DEG_TO_RAD = Math.PI / 180;
    /**
     * @param {number} x
     * @param {(number|string)} y
     * @return {undefined}
     */
    PIXI.Point = function(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    };
    /**
     * @return {?}
     */
    PIXI.Point.prototype.clone = function() {
      return new PIXI.Point(this.x, this.y);
    };
    /** @type {function (number, (number|string)): undefined} */
    PIXI.Point.prototype.constructor = PIXI.Point;
    /**
     * @param {number} expectedHashCode
     * @param {number} opt_attributes
     * @return {undefined}
     */
    PIXI.Point.prototype.set = function(expectedHashCode, opt_attributes) {
      this.x = expectedHashCode || 0;
      this.y = opt_attributes || (0 !== opt_attributes ? this.x : 0);
    };
    /**
     * @param {(number|string)} x
     * @param {(number|string)} y
     * @param {(number|string)} width
     * @param {(number|string)} height
     * @return {undefined}
     */
    PIXI.Rectangle = function(x, y, width, height) {
      this.x = x || 0;
      this.y = y || 0;
      this.width = width || 0;
      this.height = height || 0;
    };
    /**
     * @return {?}
     */
    PIXI.Rectangle.prototype.clone = function() {
      return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    };
    /**
     * @param {number} x
     * @param {number} y
     * @return {?}
     */
    PIXI.Rectangle.prototype.contains = function(x, y) {
      if (this.width <= 0 || this.height <= 0) {
        return false;
      }
      var xMin = this.x;
      if (x >= xMin && x <= xMin + this.width) {
        var startY = this.y;
        if (y >= startY && y <= startY + this.height) {
          return true;
        }
      }
      return false;
    };
    /** @type {function ((number|string), (number|string), (number|string), (number|string)): undefined} */
    PIXI.Rectangle.prototype.constructor = PIXI.Rectangle;
    PIXI.EmptyRectangle = new PIXI.Rectangle(0, 0, 0, 0);
    /**
     * @param {Array} points
     * @return {undefined}
     */
    PIXI.Polygon = function(points) {
      if (points instanceof Array || (points = Array.prototype.slice.call(arguments)), "number" == typeof points[0]) {
        /** @type {Array} */
        var best = [];
        /** @type {number} */
        var i = 0;
        var len = points.length;
        for (;len > i;i += 2) {
          best.push(new PIXI.Point(points[i], points[i + 1]));
        }
        /** @type {Array} */
        points = best;
      }
      /** @type {Array} */
      this.points = points;
    };
    /**
     * @return {?}
     */
    PIXI.Polygon.prototype.clone = function() {
      /** @type {Array} */
      var rings = [];
      /** @type {number} */
      var i = 0;
      for (;i < this.points.length;i++) {
        rings.push(this.points[i].clone());
      }
      return new PIXI.Polygon(rings);
    };
    /**
     * @param {number} val
     * @param {number} b
     * @return {?}
     */
    PIXI.Polygon.prototype.contains = function(val, b) {
      /** @type {boolean} */
      var inside = false;
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      var j = this.points.length - 1;
      for (;i < this.points.length;j = i++) {
        var o1 = this.points[i].x;
        var a = this.points[i].y;
        var o2 = this.points[j].x;
        var cy = this.points[j].y;
        /** @type {boolean} */
        var l = a > b != cy > b && (o2 - o1) * (b - a) / (cy - a) + o1 > val;
        if (l) {
          /** @type {boolean} */
          inside = !inside;
        }
      }
      return inside;
    };
    /** @type {function (Array): undefined} */
    PIXI.Polygon.prototype.constructor = PIXI.Polygon;
    /**
     * @param {(number|string)} x
     * @param {(number|string)} y
     * @param {?} radius
     * @return {undefined}
     */
    PIXI.Circle = function(x, y, radius) {
      this.x = x || 0;
      this.y = y || 0;
      this.radius = radius || 0;
    };
    /**
     * @return {?}
     */
    PIXI.Circle.prototype.clone = function() {
      return new PIXI.Circle(this.x, this.y, this.radius);
    };
    /**
     * @param {number} x
     * @param {number} y
     * @return {?}
     */
    PIXI.Circle.prototype.contains = function(x, y) {
      if (this.radius <= 0) {
        return false;
      }
      /** @type {number} */
      var dx = this.x - x;
      /** @type {number} */
      var dy = this.y - y;
      /** @type {number} */
      var r = this.radius * this.radius;
      return dx *= dx, dy *= dy, r >= dx + dy;
    };
    /** @type {function ((number|string), (number|string), ?): undefined} */
    PIXI.Circle.prototype.constructor = PIXI.Circle;
    /**
     * @param {(number|string)} x
     * @param {(number|string)} y
     * @param {number} width
     * @param {(number|string)} height
     * @return {undefined}
     */
    PIXI.Ellipse = function(x, y, width, height) {
      this.x = x || 0;
      this.y = y || 0;
      this.width = width || 0;
      this.height = height || 0;
    };
    /**
     * @return {?}
     */
    PIXI.Ellipse.prototype.clone = function() {
      return new PIXI.Ellipse(this.x, this.y, this.width, this.height);
    };
    /**
     * @param {number} value
     * @param {number} l
     * @return {?}
     */
    PIXI.Ellipse.prototype.contains = function(value, l) {
      if (this.width <= 0 || this.height <= 0) {
        return false;
      }
      /** @type {number} */
      var x = (value - this.x) / this.width;
      /** @type {number} */
      var s = (l - this.y) / this.height;
      return x *= x, s *= s, 1 >= x + s;
    };
    /**
     * @return {?}
     */
    PIXI.Ellipse.prototype.getBounds = function() {
      return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    };
    /** @type {function ((number|string), (number|string), number, (number|string)): undefined} */
    PIXI.Ellipse.prototype.constructor = PIXI.Ellipse;
    /**
     * @return {?}
     */
    PIXI.determineMatrixArrayType = function() {
      return "undefined" != typeof Float32Array ? Float32Array : Array;
    };
    PIXI.Matrix2 = PIXI.determineMatrixArrayType();
    /**
     * @return {undefined}
     */
    PIXI.Matrix = function() {
      /** @type {number} */
      this.a = 1;
      /** @type {number} */
      this.b = 0;
      /** @type {number} */
      this.c = 0;
      /** @type {number} */
      this.d = 1;
      /** @type {number} */
      this.tx = 0;
      /** @type {number} */
      this.ty = 0;
    };
    /**
     * @param {Array} color
     * @return {undefined}
     */
    PIXI.Matrix.prototype.fromArray = function(color) {
      this.a = color[0];
      this.b = color[1];
      this.c = color[3];
      this.d = color[4];
      this.tx = color[2];
      this.ty = color[5];
    };
    /**
     * @param {boolean} dataAndEvents
     * @return {?}
     */
    PIXI.Matrix.prototype.toArray = function(dataAndEvents) {
      if (!this.array) {
        /** @type {Float32Array} */
        this.array = new Float32Array(9);
      }
      var array = this.array;
      return dataAndEvents ? (this.array[0] = this.a, this.array[1] = this.c, this.array[2] = 0, this.array[3] = this.b, this.array[4] = this.d, this.array[5] = 0, this.array[6] = this.tx, this.array[7] = this.ty, this.array[8] = 1) : (this.array[0] = this.a, this.array[1] = this.b, this.array[2] = this.tx, this.array[3] = this.c, this.array[4] = this.d, this.array[5] = this.ty, this.array[6] = 0, this.array[7] = 0, this.array[8] = 1), array;
    };
    PIXI.identityMatrix = new PIXI.Matrix;
    /**
     * @return {undefined}
     */
    PIXI.DisplayObject = function() {
      this.position = new PIXI.Point;
      this.scale = new PIXI.Point(1, 1);
      this.pivot = new PIXI.Point(0, 0);
      /** @type {number} */
      this.rotation = 0;
      /** @type {number} */
      this.alpha = 1;
      /** @type {boolean} */
      this.visible = true;
      /** @type {null} */
      this.hitArea = null;
      /** @type {boolean} */
      this.buttonMode = false;
      /** @type {boolean} */
      this.renderable = false;
      /** @type {null} */
      this.parent = null;
      /** @type {null} */
      this.stage = null;
      /** @type {number} */
      this.worldAlpha = 1;
      /** @type {boolean} */
      this._interactive = false;
      /** @type {string} */
      this.defaultCursor = "pointer";
      this.worldTransform = new PIXI.Matrix;
      /** @type {Array} */
      this.color = [];
      /** @type {boolean} */
      this.dynamic = true;
      /** @type {number} */
      this._sr = 0;
      /** @type {number} */
      this._cr = 1;
      /** @type {null} */
      this.filterArea = null;
      this._bounds = new PIXI.Rectangle(0, 0, 1, 1);
      /** @type {null} */
      this._currentBounds = null;
      /** @type {null} */
      this._mask = null;
      /** @type {boolean} */
      this._cacheAsBitmap = false;
      /** @type {boolean} */
      this._cacheIsDirty = false;
    };
    /** @type {function (): undefined} */
    PIXI.DisplayObject.prototype.constructor = PIXI.DisplayObject;
    /**
     * @param {boolean} newValue
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype.setInteractive = function(newValue) {
      /** @type {boolean} */
      this.interactive = newValue;
    };
    Object.defineProperty(PIXI.DisplayObject.prototype, "interactive", {
      /**
       * @return {?}
       */
      get : function() {
        return this._interactive;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this._interactive = expectedHashCode;
        if (this.stage) {
          /** @type {boolean} */
          this.stage.dirty = true;
        }
      }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "worldVisible", {
      /**
       * @return {?}
       */
      get : function() {
        var currentNode = this;
        do {
          if (!currentNode.visible) {
            return false;
          }
          currentNode = currentNode.parent;
        } while (currentNode);
        return true;
      }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "mask", {
      /**
       * @return {?}
       */
      get : function() {
        return this._mask;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        if (this._mask) {
          /** @type {boolean} */
          this._mask.isMask = false;
        }
        /** @type {number} */
        this._mask = expectedHashCode;
        if (this._mask) {
          /** @type {boolean} */
          this._mask.isMask = true;
        }
      }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "filters", {
      /**
       * @return {?}
       */
      get : function() {
        return this._filters;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        if (expectedHashCode) {
          /** @type {Array} */
          var allSplits = [];
          /** @type {number} */
          var conditionIndex = 0;
          for (;conditionIndex < expectedHashCode.length;conditionIndex++) {
            var secondSplits = expectedHashCode[conditionIndex].passes;
            /** @type {number} */
            var j = 0;
            for (;j < secondSplits.length;j++) {
              allSplits.push(secondSplits[j]);
            }
          }
          this._filterBlock = {
            target : this,
            filterPasses : allSplits
          };
        }
        /** @type {number} */
        this._filters = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "cacheAsBitmap", {
      /**
       * @return {?}
       */
      get : function() {
        return this._cacheAsBitmap;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        if (this._cacheAsBitmap !== expectedHashCode) {
          if (expectedHashCode) {
            this._generateCachedSprite();
          } else {
            this._destroyCachedSprite();
          }
          /** @type {number} */
          this._cacheAsBitmap = expectedHashCode;
        }
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype.updateTransform = function() {
      if (this.rotation !== this.rotationCache) {
        this.rotationCache = this.rotation;
        /** @type {number} */
        this._sr = Math.sin(this.rotation);
        /** @type {number} */
        this._cr = Math.cos(this.rotation);
      }
      var worldTransform = this.parent.worldTransform;
      var object = this.worldTransform;
      var px = this.pivot.x;
      var py = this.pivot.y;
      /** @type {number} */
      var b01 = this._cr * this.scale.x;
      /** @type {number} */
      var b00 = -this._sr * this.scale.y;
      /** @type {number} */
      var b11 = this._sr * this.scale.x;
      /** @type {number} */
      var b10 = this._cr * this.scale.y;
      /** @type {number} */
      var b03 = this.position.x - b01 * px - py * b00;
      /** @type {number} */
      var b13 = this.position.y - b10 * py - px * b11;
      var a00 = worldTransform.a;
      var a01 = worldTransform.b;
      var a10 = worldTransform.c;
      var a11 = worldTransform.d;
      /** @type {number} */
      object.a = a00 * b01 + a01 * b11;
      /** @type {number} */
      object.b = a00 * b00 + a01 * b10;
      object.tx = a00 * b03 + a01 * b13 + worldTransform.tx;
      /** @type {number} */
      object.c = a10 * b01 + a11 * b11;
      /** @type {number} */
      object.d = a10 * b00 + a11 * b10;
      object.ty = a10 * b03 + a11 * b13 + worldTransform.ty;
      /** @type {number} */
      this.worldAlpha = this.alpha * this.parent.worldAlpha;
    };
    /**
     * @param {?} latLng
     * @return {?}
     */
    PIXI.DisplayObject.prototype.getBounds = function(latLng) {
      return latLng = latLng, PIXI.EmptyRectangle;
    };
    /**
     * @return {?}
     */
    PIXI.DisplayObject.prototype.getLocalBounds = function() {
      return this.getBounds(PIXI.identityMatrix);
    };
    /**
     * @param {?} deepDataAndEvents
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype.setStageReference = function(deepDataAndEvents) {
      this.stage = deepDataAndEvents;
      if (this._interactive) {
        /** @type {boolean} */
        this.stage.dirty = true;
      }
    };
    /**
     * @param {string} width
     * @return {?}
     */
    PIXI.DisplayObject.prototype.generateTexture = function(width) {
      var winSize = this.getLocalBounds();
      var renderer = new PIXI.RenderTexture(0 | winSize.width, 0 | winSize.height, width);
      return renderer.render(this, new PIXI.Point(-winSize.x, -winSize.y)), renderer;
    };
    /**
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype.updateCache = function() {
      this._generateCachedSprite();
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype._renderCachedSprite = function(context) {
      if (context.gl) {
        PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, context);
      } else {
        PIXI.Sprite.prototype._renderCanvas.call(this._cachedSprite, context);
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype._generateCachedSprite = function() {
      /** @type {boolean} */
      this._cacheAsBitmap = false;
      var size = this.getLocalBounds();
      if (this._cachedSprite) {
        this._cachedSprite.texture.resize(0 | size.width, 0 | size.height);
      } else {
        var texture = new PIXI.RenderTexture(0 | size.width, 0 | size.height);
        this._cachedSprite = new PIXI.Sprite(texture);
        this._cachedSprite.worldTransform = this.worldTransform;
      }
      var filters = this._filters;
      /** @type {null} */
      this._filters = null;
      this._cachedSprite.filters = filters;
      this._cachedSprite.texture.render(this, new PIXI.Point(-size.x, -size.y));
      /** @type {number} */
      this._cachedSprite.anchor.x = -(size.x / size.width);
      /** @type {number} */
      this._cachedSprite.anchor.y = -(size.y / size.height);
      this._filters = filters;
      /** @type {boolean} */
      this._cacheAsBitmap = true;
    };
    /**
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype._destroyCachedSprite = function() {
      if (this._cachedSprite) {
        this._cachedSprite.texture.destroy(true);
        /** @type {null} */
        this._cachedSprite = null;
      }
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype._renderWebGL = function(context) {
      /** @type {CanvasRenderingContext2D} */
      context = context;
    };
    /**
     * @param {?} seed
     * @return {undefined}
     */
    PIXI.DisplayObject.prototype._renderCanvas = function(seed) {
      seed = seed;
    };
    Object.defineProperty(PIXI.DisplayObject.prototype, "x", {
      /**
       * @return {?}
       */
      get : function() {
        return this.position.x;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.position.x = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "y", {
      /**
       * @return {?}
       */
      get : function() {
        return this.position.y;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.position.y = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer = function() {
      PIXI.DisplayObject.call(this);
      /** @type {Array} */
      this.children = [];
    };
    /** @type {Object} */
    PIXI.DisplayObjectContainer.prototype = Object.create(PIXI.DisplayObject.prototype);
    /** @type {function (): undefined} */
    PIXI.DisplayObjectContainer.prototype.constructor = PIXI.DisplayObjectContainer;
    /**
     * @param {?} child
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer.prototype.addChild = function(child) {
      this.addChildAt(child, this.children.length);
    };
    /**
     * @param {?} child
     * @param {number} index
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index) {
      if (!(index >= 0 && index <= this.children.length)) {
        throw new Error(child + " The index " + index + " supplied is out of bounds " + this.children.length);
      }
      if (child.parent) {
        child.parent.removeChild(child);
      }
      child.parent = this;
      this.children.splice(index, 0, child);
      if (this.stage) {
        child.setStageReference(this.stage);
      }
    };
    /**
     * @param {?} child
     * @param {?} node
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, node) {
      if (child !== node) {
        var name = this.children.indexOf(child);
        var id = this.children.indexOf(node);
        if (0 > name || 0 > id) {
          throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
        }
        this.children[name] = node;
        this.children[id] = child;
      }
    };
    /**
     * @param {number} index
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype.getChildAt = function(index) {
      if (index >= 0 && index < this.children.length) {
        return this.children[index];
      }
      throw new Error("Supplied index does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
    };
    /**
     * @param {?} child
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype.removeChild = function(child) {
      return this.removeChildAt(this.children.indexOf(child));
    };
    /**
     * @param {number} index
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype.removeChildAt = function(index) {
      var child = this.getChildAt(index);
      return this.stage && child.removeStageReference(), child.parent = void 0, this.children.splice(index, 1), child;
    };
    /**
     * @param {number} node
     * @param {number} a
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype.removeChildren = function(node, a) {
      var n = node || 0;
      var f = "number" == typeof a ? a : this.children.length;
      /** @type {number} */
      var l = f - n;
      if (l > 0 && f >= l) {
        var resultItems = this.children.splice(n, l);
        /** @type {number} */
        var i = 0;
        for (;i < resultItems.length;i++) {
          var result = resultItems[i];
          if (this.stage) {
            result.removeStageReference();
          }
          result.parent = void 0;
        }
        return resultItems;
      }
      throw new Error("Range Error, numeric values are outside the acceptable range");
    };
    /**
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer.prototype.updateTransform = function() {
      if (this.visible && (PIXI.DisplayObject.prototype.updateTransform.call(this), !this._cacheAsBitmap)) {
        /** @type {number} */
        var i = 0;
        var l = this.children.length;
        for (;l > i;i++) {
          this.children[i].updateTransform();
        }
      }
    };
    /**
     * @param {?} latLng
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype.getBounds = function(latLng) {
      if (0 === this.children.length) {
        return PIXI.EmptyRectangle;
      }
      if (latLng) {
        var worldTransform = this.worldTransform;
        this.worldTransform = latLng;
        this.updateTransform();
        this.worldTransform = worldTransform;
      }
      var bb;
      var b;
      var max0;
      /** @type {number} */
      var x = 1 / 0;
      /** @type {number} */
      var y = 1 / 0;
      /** @type {number} */
      var a = -1 / 0;
      /** @type {number} */
      var animExtentMax0 = -1 / 0;
      /** @type {boolean} */
      var d = false;
      /** @type {number} */
      var i = 0;
      var l = this.children.length;
      for (;l > i;i++) {
        var child = this.children[i];
        if (child.visible) {
          /** @type {boolean} */
          d = true;
          bb = this.children[i].getBounds(latLng);
          x = x < bb.x ? x : bb.x;
          y = y < bb.y ? y : bb.y;
          b = bb.width + bb.x;
          max0 = bb.height + bb.y;
          a = a > b ? a : b;
          animExtentMax0 = animExtentMax0 > max0 ? animExtentMax0 : max0;
        }
      }
      if (!d) {
        return PIXI.EmptyRectangle;
      }
      var wrapper = this._bounds;
      return wrapper.x = x, wrapper.y = y, wrapper.width = a - x, wrapper.height = animExtentMax0 - y, wrapper;
    };
    /**
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype.getLocalBounds = function() {
      var worldTransform = this.worldTransform;
      this.worldTransform = PIXI.identityMatrix;
      /** @type {number} */
      var i = 0;
      var l = this.children.length;
      for (;l > i;i++) {
        this.children[i].updateTransform();
      }
      var xy = this.getBounds();
      return this.worldTransform = worldTransform, xy;
    };
    /**
     * @param {?} deepDataAndEvents
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer.prototype.setStageReference = function(deepDataAndEvents) {
      this.stage = deepDataAndEvents;
      if (this._interactive) {
        /** @type {boolean} */
        this.stage.dirty = true;
      }
      /** @type {number} */
      var l = 0;
      var e = this.children.length;
      for (;e > l;l++) {
        var child = this.children[l];
        child.setStageReference(deepDataAndEvents);
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.DisplayObjectContainer.prototype.removeStageReference = function() {
      /** @type {number} */
      var l = 0;
      var e = this.children.length;
      for (;e > l;l++) {
        var child = this.children[l];
        child.removeStageReference();
      }
      if (this._interactive) {
        /** @type {boolean} */
        this.stage.dirty = true;
      }
      /** @type {null} */
      this.stage = null;
    };
    /**
     * @param {CanvasRenderingContext2D} env
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype._renderWebGL = function(env) {
      if (this.visible && !(this.alpha <= 0)) {
        if (this._cacheAsBitmap) {
          return void this._renderCachedSprite(env);
        }
        var index1;
        var iz;
        if (this._mask || this._filters) {
          if (this._mask) {
            env.spriteBatch.stop();
            env.maskManager.pushMask(this.mask, env);
            env.spriteBatch.start();
          }
          if (this._filters) {
            env.spriteBatch.flush();
            env.filterManager.pushFilter(this._filterBlock);
          }
          /** @type {number} */
          index1 = 0;
          iz = this.children.length;
          for (;iz > index1;index1++) {
            this.children[index1]._renderWebGL(env);
          }
          env.spriteBatch.stop();
          if (this._filters) {
            env.filterManager.popFilter();
          }
          if (this._mask) {
            env.maskManager.popMask(env);
          }
          env.spriteBatch.start();
        } else {
          /** @type {number} */
          index1 = 0;
          iz = this.children.length;
          for (;iz > index1;index1++) {
            this.children[index1]._renderWebGL(env);
          }
        }
      }
    };
    /**
     * @param {Object} set
     * @return {?}
     */
    PIXI.DisplayObjectContainer.prototype._renderCanvas = function(set) {
      if (this.visible !== false && 0 !== this.alpha) {
        if (this._cacheAsBitmap) {
          return void this._renderCachedSprite(set);
        }
        if (this._mask) {
          set.maskManager.pushMask(this._mask, set.context);
        }
        /** @type {number} */
        var viewId = 0;
        var e = this.children.length;
        for (;e > viewId;viewId++) {
          var view = this.children[viewId];
          view._renderCanvas(set);
        }
        if (this._mask) {
          set.maskManager.popMask(set.context);
        }
      }
    };
    /**
     * @param {?} texture
     * @return {undefined}
     */
    PIXI.Sprite = function(texture) {
      PIXI.DisplayObjectContainer.call(this);
      this.anchor = new PIXI.Point;
      this.texture = texture;
      /** @type {number} */
      this._width = 0;
      /** @type {number} */
      this._height = 0;
      /** @type {number} */
      this.tint = 16777215;
      /** @type {number} */
      this.blendMode = PIXI.blendModes.NORMAL;
      if (texture.baseTexture.hasLoaded) {
        this.onTextureUpdate();
      } else {
        this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
        this.texture.addEventListener("update", this.onTextureUpdateBind);
      }
      /** @type {boolean} */
      this.renderable = true;
    };
    /** @type {Object} */
    PIXI.Sprite.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    /** @type {function (?): undefined} */
    PIXI.Sprite.prototype.constructor = PIXI.Sprite;
    Object.defineProperty(PIXI.Sprite.prototype, "width", {
      /**
       * @return {?}
       */
      get : function() {
        return this.scale.x * this.texture.frame.width;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.scale.x = expectedHashCode / this.texture.frame.width;
        /** @type {number} */
        this._width = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.Sprite.prototype, "height", {
      /**
       * @return {?}
       */
      get : function() {
        return this.scale.y * this.texture.frame.height;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.scale.y = expectedHashCode / this.texture.frame.height;
        /** @type {number} */
        this._height = expectedHashCode;
      }
    });
    /**
     * @param {?} texture
     * @return {undefined}
     */
    PIXI.Sprite.prototype.setTexture = function(texture) {
      if (this.texture.baseTexture !== texture.baseTexture) {
        /** @type {boolean} */
        this.textureChange = true;
        this.texture = texture;
      } else {
        this.texture = texture;
      }
      /** @type {number} */
      this.cachedTint = 16777215;
      /** @type {boolean} */
      this.updateFrame = true;
    };
    /**
     * @return {undefined}
     */
    PIXI.Sprite.prototype.onTextureUpdate = function() {
      if (this._width) {
        /** @type {number} */
        this.scale.x = this._width / this.texture.frame.width;
      }
      if (this._height) {
        /** @type {number} */
        this.scale.y = this._height / this.texture.frame.height;
      }
      /** @type {boolean} */
      this.updateFrame = true;
    };
    /**
     * @param {?} latLng
     * @return {?}
     */
    PIXI.Sprite.prototype.getBounds = function(latLng) {
      var originalWidth_ = this.texture.frame.width;
      var oldHeight = this.texture.frame.height;
      /** @type {number} */
      var b00 = originalWidth_ * (1 - this.anchor.x);
      /** @type {number} */
      var b03 = originalWidth_ * -this.anchor.x;
      /** @type {number} */
      var b10 = oldHeight * (1 - this.anchor.y);
      /** @type {number} */
      var b13 = oldHeight * -this.anchor.y;
      var worldTransform = latLng || this.worldTransform;
      var a00 = worldTransform.a;
      var a10 = worldTransform.c;
      var a01 = worldTransform.b;
      var a11 = worldTransform.d;
      var padding = worldTransform.tx;
      var offset = worldTransform.ty;
      var maxX = a00 * b03 + a01 * b13 + padding;
      var n = a11 * b13 + a10 * b03 + offset;
      var right = a00 * b00 + a01 * b13 + padding;
      var i = a11 * b13 + a10 * b00 + offset;
      var h = a00 * b00 + a01 * b10 + padding;
      var value = a11 * b10 + a10 * b00 + offset;
      var y = a00 * b03 + a01 * b10 + padding;
      var r = a11 * b10 + a10 * b03 + offset;
      /** @type {number} */
      var maxh = -1 / 0;
      /** @type {number} */
      var max = -1 / 0;
      /** @type {number} */
      var x = 1 / 0;
      /** @type {number} */
      var min = 1 / 0;
      x = x > maxX ? maxX : x;
      x = x > right ? right : x;
      x = x > h ? h : x;
      x = x > y ? y : x;
      min = min > n ? n : min;
      min = min > i ? i : min;
      min = min > value ? value : min;
      min = min > r ? r : min;
      maxh = maxX > maxh ? maxX : maxh;
      maxh = right > maxh ? right : maxh;
      maxh = h > maxh ? h : maxh;
      maxh = y > maxh ? y : maxh;
      max = n > max ? n : max;
      max = i > max ? i : max;
      max = value > max ? value : max;
      max = r > max ? r : max;
      var wrapper = this._bounds;
      return wrapper.x = x, wrapper.width = maxh - x, wrapper.y = min, wrapper.height = max - min, this._currentBounds = wrapper, wrapper;
    };
    /**
     * @param {CanvasRenderingContext2D} env
     * @return {undefined}
     */
    PIXI.Sprite.prototype._renderWebGL = function(env) {
      if (this.visible && !(this.alpha <= 0)) {
        var index1;
        var iz;
        if (this._mask || this._filters) {
          var flash = env.spriteBatch;
          if (this._mask) {
            flash.stop();
            env.maskManager.pushMask(this.mask, env);
            flash.start();
          }
          if (this._filters) {
            flash.flush();
            env.filterManager.pushFilter(this._filterBlock);
          }
          flash.render(this);
          /** @type {number} */
          index1 = 0;
          iz = this.children.length;
          for (;iz > index1;index1++) {
            this.children[index1]._renderWebGL(env);
          }
          flash.stop();
          if (this._filters) {
            env.filterManager.popFilter();
          }
          if (this._mask) {
            env.maskManager.popMask(env);
          }
          flash.start();
        } else {
          env.spriteBatch.render(this);
          /** @type {number} */
          index1 = 0;
          iz = this.children.length;
          for (;iz > index1;index1++) {
            this.children[index1]._renderWebGL(env);
          }
        }
      }
    };
    /**
     * @param {Object} set
     * @return {undefined}
     */
    PIXI.Sprite.prototype._renderCanvas = function(set) {
      if (this.visible !== false && 0 !== this.alpha) {
        var frame = this.texture.frame;
        var context = set.context;
        var texture = this.texture;
        if (this.blendMode !== set.currentBlendMode && (set.currentBlendMode = this.blendMode, context.globalCompositeOperation = PIXI.blendModesCanvas[set.currentBlendMode]), this._mask && set.maskManager.pushMask(this._mask, set.context), frame && (frame.width && (frame.height && texture.baseTexture.source))) {
          context.globalAlpha = this.worldAlpha;
          var m = this.worldTransform;
          if (set.roundPixels ? context.setTransform(m.a, m.c, m.b, m.d, 0 | m.tx, 0 | m.ty) : context.setTransform(m.a, m.c, m.b, m.d, m.tx, m.ty), set.smoothProperty && (set.scaleMode !== this.texture.baseTexture.scaleMode && (set.scaleMode = this.texture.baseTexture.scaleMode, context[set.smoothProperty] = set.scaleMode === PIXI.scaleModes.LINEAR)), 16777215 !== this.tint) {
            if (this.cachedTint !== this.tint) {
              if (!texture.baseTexture.hasLoaded) {
                return;
              }
              this.cachedTint = this.tint;
              this.tintedTexture = PIXI.CanvasTinter.getTintedTexture(this, this.tint);
            }
            context.drawImage(this.tintedTexture, 0, 0, frame.width, frame.height, this.anchor.x * -frame.width, this.anchor.y * -frame.height, frame.width, frame.height);
          } else {
            if (texture.trim) {
              var w = texture.trim;
              context.drawImage(this.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, w.x - this.anchor.x * w.width, w.y - this.anchor.y * w.height, frame.width, frame.height);
            } else {
              context.drawImage(this.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, this.anchor.x * -frame.width, this.anchor.y * -frame.height, frame.width, frame.height);
            }
          }
        }
        /** @type {number} */
        var viewId = 0;
        var e = this.children.length;
        for (;e > viewId;viewId++) {
          var view = this.children[viewId];
          view._renderCanvas(set);
        }
        if (this._mask) {
          set.maskManager.popMask(set.context);
        }
      }
    };
    /**
     * @param {string} id
     * @return {?}
     */
    PIXI.Sprite.fromFrame = function(id) {
      var texture = PIXI.TextureCache[id];
      if (!texture) {
        throw new Error('The frameId "' + id + '" does not exist in the texture cache' + this);
      }
      return new PIXI.Sprite(texture);
    };
    /**
     * @param {string} imageUrl
     * @param {boolean} crossorigin
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    PIXI.Sprite.fromImage = function(imageUrl, crossorigin, deepDataAndEvents) {
      var texture = PIXI.Texture.fromImage(imageUrl, crossorigin, deepDataAndEvents);
      return new PIXI.Sprite(texture);
    };
    /**
     * @param {?} dataAndEvents
     * @return {undefined}
     */
    PIXI.SpriteBatch = function(dataAndEvents) {
      PIXI.DisplayObjectContainer.call(this);
      this.textureThing = dataAndEvents;
      /** @type {boolean} */
      this.ready = false;
    };
    /** @type {Object} */
    PIXI.SpriteBatch.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    /** @type {function (?): undefined} */
    PIXI.SpriteBatch.constructor = PIXI.SpriteBatch;
    /**
     * @param {?} x
     * @return {undefined}
     */
    PIXI.SpriteBatch.prototype.initWebGL = function(x) {
      this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(x);
      /** @type {boolean} */
      this.ready = true;
    };
    /**
     * @return {undefined}
     */
    PIXI.SpriteBatch.prototype.updateTransform = function() {
      PIXI.DisplayObject.prototype.updateTransform.call(this);
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.SpriteBatch.prototype._renderWebGL = function(context) {
      if (!!this.visible) {
        if (!(this.alpha <= 0)) {
          if (!!this.children.length) {
            if (!this.ready) {
              this.initWebGL(context.gl);
            }
            context.spriteBatch.stop();
            context.shaderManager.activateShader(context.shaderManager.fastShader);
            this.fastSpriteBatch.begin(this, context);
            this.fastSpriteBatch.render(this);
            context.shaderManager.activateShader(context.shaderManager.defaultShader);
            context.spriteBatch.start();
          }
        }
      }
    };
    /**
     * @param {Object} seed
     * @return {undefined}
     */
    PIXI.SpriteBatch.prototype._renderCanvas = function(seed) {
      var context = seed.context;
      context.globalAlpha = this.worldAlpha;
      PIXI.DisplayObject.prototype.updateTransform.call(this);
      var m = this.worldTransform;
      /** @type {boolean} */
      var a = true;
      /** @type {number} */
      var i = 0;
      for (;i < this.children.length;i++) {
        var sprite = this.children[i];
        if (sprite.visible) {
          var texture = sprite.texture;
          var pos = texture.frame;
          if (context.globalAlpha = this.worldAlpha * sprite.alpha, sprite.rotation % (2 * Math.PI) === 0) {
            if (a) {
              context.setTransform(m.a, m.c, m.b, m.d, m.tx, m.ty);
              /** @type {boolean} */
              a = false;
            }
            context.drawImage(texture.baseTexture.source, pos.x, pos.y, pos.width, pos.height, sprite.anchor.x * -pos.width * sprite.scale.x + sprite.position.x + 0.5 | 0, sprite.anchor.y * -pos.height * sprite.scale.y + sprite.position.y + 0.5 | 0, pos.width * sprite.scale.x, pos.height * sprite.scale.y);
          } else {
            if (!a) {
              /** @type {boolean} */
              a = true;
            }
            PIXI.DisplayObject.prototype.updateTransform.call(sprite);
            var end = sprite.worldTransform;
            if (seed.roundPixels) {
              context.setTransform(end.a, end.c, end.b, end.d, 0 | end.tx, 0 | end.ty);
            } else {
              context.setTransform(end.a, end.c, end.b, end.d, end.tx, end.ty);
            }
            context.drawImage(texture.baseTexture.source, pos.x, pos.y, pos.width, pos.height, sprite.anchor.x * -pos.width + 0.5 | 0, sprite.anchor.y * -pos.height + 0.5 | 0, pos.width, pos.height);
          }
        }
      }
    };
    /**
     * @param {Array} textures
     * @return {undefined}
     */
    PIXI.MovieClip = function(textures) {
      PIXI.Sprite.call(this, textures[0]);
      /** @type {Array} */
      this.textures = textures;
      /** @type {number} */
      this.animationSpeed = 1;
      /** @type {boolean} */
      this.loop = true;
      /** @type {null} */
      this.onComplete = null;
      /** @type {number} */
      this.currentFrame = 0;
      /** @type {boolean} */
      this.playing = false;
    };
    /** @type {Object} */
    PIXI.MovieClip.prototype = Object.create(PIXI.Sprite.prototype);
    /** @type {function (Array): undefined} */
    PIXI.MovieClip.prototype.constructor = PIXI.MovieClip;
    Object.defineProperty(PIXI.MovieClip.prototype, "totalFrames", {
      /**
       * @return {?}
       */
      get : function() {
        return this.textures.length;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.MovieClip.prototype.stop = function() {
      /** @type {boolean} */
      this.playing = false;
    };
    /**
     * @return {undefined}
     */
    PIXI.MovieClip.prototype.play = function() {
      /** @type {boolean} */
      this.playing = true;
    };
    /**
     * @param {number} frameNumber
     * @return {undefined}
     */
    PIXI.MovieClip.prototype.gotoAndStop = function(frameNumber) {
      /** @type {boolean} */
      this.playing = false;
      /** @type {number} */
      this.currentFrame = frameNumber;
      /** @type {number} */
      var round = this.currentFrame + 0.5 | 0;
      this.setTexture(this.textures[round % this.textures.length]);
    };
    /**
     * @param {number} recurring
     * @return {undefined}
     */
    PIXI.MovieClip.prototype.gotoAndPlay = function(recurring) {
      /** @type {number} */
      this.currentFrame = recurring;
      /** @type {boolean} */
      this.playing = true;
    };
    /**
     * @return {undefined}
     */
    PIXI.MovieClip.prototype.updateTransform = function() {
      if (PIXI.Sprite.prototype.updateTransform.call(this), this.playing) {
        this.currentFrame += this.animationSpeed;
        /** @type {number} */
        var round = this.currentFrame + 0.5 | 0;
        if (this.loop || round < this.textures.length) {
          this.setTexture(this.textures[round % this.textures.length]);
        } else {
          if (round >= this.textures.length) {
            this.gotoAndStop(this.textures.length - 1);
            if (this.onComplete) {
              this.onComplete();
            }
          }
        }
      }
    };
    /**
     * @param {Array} codeSegments
     * @return {?}
     */
    PIXI.MovieClip.prototype.fromFrames = function(codeSegments) {
      /** @type {Array} */
      var textures = [];
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        textures.push(new PIXI.Texture.fromFrame(codeSegments[i]));
      }
      return new PIXI.MovieClip(textures);
    };
    /**
     * @param {Array} codeSegments
     * @return {?}
     */
    PIXI.MovieClip.prototype.fromImages = function(codeSegments) {
      /** @type {Array} */
      var textures = [];
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        textures.push(new PIXI.Texture.fromImage(codeSegments[i]));
      }
      return new PIXI.MovieClip(textures);
    };
    /**
     * @return {undefined}
     */
    PIXI.FilterBlock = function() {
      /** @type {boolean} */
      this.visible = true;
      /** @type {boolean} */
      this.renderable = true;
    };
    /**
     * @param {string} text
     * @param {Object} style
     * @return {undefined}
     */
    PIXI.Text = function(text, style) {
      /** @type {Element} */
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      PIXI.Sprite.call(this, PIXI.Texture.fromCanvas(this.canvas));
      this.setText(text);
      this.setStyle(style);
      this.updateText();
      /** @type {boolean} */
      this.dirty = false;
    };
    /** @type {Object} */
    PIXI.Text.prototype = Object.create(PIXI.Sprite.prototype);
    /** @type {function (string, Object): undefined} */
    PIXI.Text.prototype.constructor = PIXI.Text;
    /**
     * @param {Object} style
     * @return {undefined}
     */
    PIXI.Text.prototype.setStyle = function(style) {
      style = style || {};
      style.font = style.font || "bold 20pt Arial";
      style.fill = style.fill || "black";
      style.align = style.align || "left";
      style.stroke = style.stroke || "black";
      style.strokeThickness = style.strokeThickness || 0;
      style.wordWrap = style.wordWrap || false;
      style.wordWrapWidth = style.wordWrapWidth || 100;
      style.wordWrapWidth = style.wordWrapWidth || 100;
      style.dropShadow = style.dropShadow || false;
      style.dropShadowAngle = style.dropShadowAngle || Math.PI / 6;
      style.dropShadowDistance = style.dropShadowDistance || 4;
      style.dropShadowColor = style.dropShadowColor || "black";
      /** @type {Object} */
      this.style = style;
      /** @type {boolean} */
      this.dirty = true;
    };
    /**
     * @param {?} text
     * @return {undefined}
     */
    PIXI.Text.prototype.setText = function(text) {
      this.text = text.toString() || " ";
      /** @type {boolean} */
      this.dirty = true;
    };
    /**
     * @return {undefined}
     */
    PIXI.Text.prototype.updateText = function() {
      this.context.font = this.style.font;
      var outputText = this.text;
      if (this.style.wordWrap) {
        outputText = this.wordWrap(this.text);
      }
      var lines = outputText.split(/(?:\r\n|\r|\n)/);
      /** @type {Array} */
      var lineWidths = [];
      /** @type {number} */
      var maxLineWidth = 0;
      /** @type {number} */
      var i = 0;
      for (;i < lines.length;i++) {
        var lineWidth = this.context.measureText(lines[i]).width;
        lineWidths[i] = lineWidth;
        /** @type {number} */
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }
      var width = maxLineWidth + this.style.strokeThickness;
      if (this.style.dropShadow) {
        width += this.style.dropShadowDistance;
      }
      this.canvas.width = width + this.context.lineWidth;
      var lineHeight = this.determineFontHeight("font: " + this.style.font + ";") + this.style.strokeThickness;
      /** @type {number} */
      var height = lineHeight * lines.length;
      if (this.style.dropShadow) {
        height += this.style.dropShadowDistance;
      }
      this.canvas.height = height;
      if (navigator.isCocoonJS) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.context.font = this.style.font;
      this.context.strokeStyle = this.style.stroke;
      this.context.lineWidth = this.style.strokeThickness;
      /** @type {string} */
      this.context.textBaseline = "top";
      var x;
      var y;
      if (this.style.dropShadow) {
        this.context.fillStyle = this.style.dropShadowColor;
        /** @type {number} */
        var text_shift_x = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance;
        /** @type {number} */
        var yOffset = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
        /** @type {number} */
        i = 0;
        for (;i < lines.length;i++) {
          /** @type {number} */
          x = this.style.strokeThickness / 2;
          /** @type {number} */
          y = this.style.strokeThickness / 2 + i * lineHeight;
          if ("right" === this.style.align) {
            x += maxLineWidth - lineWidths[i];
          } else {
            if ("center" === this.style.align) {
              x += (maxLineWidth - lineWidths[i]) / 2;
            }
          }
          if (this.style.fill) {
            this.context.fillText(lines[i], x + text_shift_x, y + yOffset);
          }
        }
      }
      this.context.fillStyle = this.style.fill;
      /** @type {number} */
      i = 0;
      for (;i < lines.length;i++) {
        /** @type {number} */
        x = this.style.strokeThickness / 2;
        /** @type {number} */
        y = this.style.strokeThickness / 2 + i * lineHeight;
        if ("right" === this.style.align) {
          x += maxLineWidth - lineWidths[i];
        } else {
          if ("center" === this.style.align) {
            x += (maxLineWidth - lineWidths[i]) / 2;
          }
        }
        if (this.style.stroke) {
          if (this.style.strokeThickness) {
            this.context.strokeText(lines[i], x, y);
          }
        }
        if (this.style.fill) {
          this.context.fillText(lines[i], x, y);
        }
      }
      this.updateTexture();
    };
    /**
     * @return {undefined}
     */
    PIXI.Text.prototype.updateTexture = function() {
      this.texture.baseTexture.width = this.canvas.width;
      this.texture.baseTexture.height = this.canvas.height;
      this.texture.frame.width = this.canvas.width;
      this.texture.frame.height = this.canvas.height;
      this._width = this.canvas.width;
      this._height = this.canvas.height;
      /** @type {boolean} */
      this.requiresUpdate = true;
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.Text.prototype._renderWebGL = function(context) {
      if (this.requiresUpdate) {
        /** @type {boolean} */
        this.requiresUpdate = false;
        PIXI.updateWebGLTexture(this.texture.baseTexture, context.gl);
      }
      PIXI.Sprite.prototype._renderWebGL.call(this, context);
    };
    /**
     * @return {undefined}
     */
    PIXI.Text.prototype.updateTransform = function() {
      if (this.dirty) {
        this.updateText();
        /** @type {boolean} */
        this.dirty = false;
      }
      PIXI.Sprite.prototype.updateTransform.call(this);
    };
    /**
     * @param {string} fontStyle
     * @return {?}
     */
    PIXI.Text.prototype.determineFontHeight = function(fontStyle) {
      var result = PIXI.Text.heightCache[fontStyle];
      if (!result) {
        var body = document.getElementsByTagName("body")[0];
        /** @type {Element} */
        var dummy = document.createElement("div");
        /** @type {Text} */
        var dummyText = document.createTextNode("M");
        dummy.appendChild(dummyText);
        dummy.setAttribute("style", fontStyle + ";position:absolute;top:0;left:0");
        body.appendChild(dummy);
        result = dummy.offsetHeight;
        PIXI.Text.heightCache[fontStyle] = result;
        body.removeChild(dummy);
      }
      return result;
    };
    /**
     * @param {string} text
     * @return {?}
     */
    PIXI.Text.prototype.wordWrap = function(text) {
      /** @type {string} */
      var result = "";
      var codeSegments = text.split("\n");
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        var b = this.style.wordWrapWidth;
        var lines = codeSegments[i].split(" ");
        /** @type {number} */
        var l = 0;
        for (;l < lines.length;l++) {
          var border = this.context.measureText(lines[l]).width;
          var a = border + this.context.measureText(" ").width;
          if (0 === l || a > b) {
            if (l > 0) {
              result += "\n";
            }
            result += lines[l];
            /** @type {number} */
            b = this.style.wordWrapWidth - border;
          } else {
            b -= a;
            result += " " + lines[l];
          }
        }
        if (i < codeSegments.length - 1) {
          result += "\n";
        }
      }
      return result;
    };
    /**
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    PIXI.Text.prototype.destroy = function(dataAndEvents) {
      if (dataAndEvents) {
        this.texture.destroy();
      }
    };
    PIXI.Text.heightCache = {};
    /**
     * @param {string} text
     * @param {Object} style
     * @return {undefined}
     */
    PIXI.BitmapText = function(text, style) {
      PIXI.DisplayObjectContainer.call(this);
      /** @type {Array} */
      this._pool = [];
      this.setText(text);
      this.setStyle(style);
      this.updateText();
      /** @type {boolean} */
      this.dirty = false;
    };
    /** @type {Object} */
    PIXI.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    /** @type {function (string, Object): undefined} */
    PIXI.BitmapText.prototype.constructor = PIXI.BitmapText;
    /**
     * @param {string} text
     * @return {undefined}
     */
    PIXI.BitmapText.prototype.setText = function(text) {
      this.text = text || " ";
      /** @type {boolean} */
      this.dirty = true;
    };
    /**
     * @param {Object} style
     * @return {undefined}
     */
    PIXI.BitmapText.prototype.setStyle = function(style) {
      style = style || {};
      style.align = style.align || "left";
      /** @type {Object} */
      this.style = style;
      var font = style.font.split(" ");
      this.fontName = font[font.length - 1];
      this.fontSize = font.length >= 2 ? parseInt(font[font.length - 2], 10) : PIXI.BitmapText.fonts[this.fontName].size;
      /** @type {boolean} */
      this.dirty = true;
      this.tint = style.tint;
    };
    /**
     * @return {undefined}
     */
    PIXI.BitmapText.prototype.updateText = function() {
      var data = PIXI.BitmapText.fonts[this.fontName];
      var pos = new PIXI.Point;
      /** @type {null} */
      var prevCharCode = null;
      /** @type {Array} */
      var chars = [];
      /** @type {number} */
      var scrollHeight = 0;
      /** @type {Array} */
      var coords = [];
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      var scale = this.fontSize / data.size;
      /** @type {number} */
      var index = 0;
      for (;index < this.text.length;index++) {
        var charCode = this.text.charCodeAt(index);
        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(index))) {
          coords.push(pos.x);
          /** @type {number} */
          scrollHeight = Math.max(scrollHeight, pos.x);
          i++;
          /** @type {number} */
          pos.x = 0;
          pos.y += data.lineHeight;
          /** @type {null} */
          prevCharCode = null;
        } else {
          var charData = data.chars[charCode];
          if (charData) {
            if (prevCharCode) {
              if (charData[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode];
              }
            }
            chars.push({
              texture : charData.texture,
              line : i,
              charCode : charCode,
              position : new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)
            });
            pos.x += charData.xAdvance;
            prevCharCode = charCode;
          }
        }
      }
      coords.push(pos.x);
      /** @type {number} */
      scrollHeight = Math.max(scrollHeight, pos.x);
      /** @type {Array} */
      var lineAlignOffsets = [];
      /** @type {number} */
      index = 0;
      for (;i >= index;index++) {
        /** @type {number} */
        var copies = 0;
        if ("right" === this.style.align) {
          /** @type {number} */
          copies = scrollHeight - coords[index];
        } else {
          if ("center" === this.style.align) {
            /** @type {number} */
            copies = (scrollHeight - coords[index]) / 2;
          }
        }
        lineAlignOffsets.push(copies);
      }
      var start = this.children.length;
      /** @type {number} */
      var lenChars = chars.length;
      var tint = this.tint || 16777215;
      /** @type {number} */
      index = 0;
      for (;lenChars > index;index++) {
        var child = start > index ? this.children[index] : this._pool.pop();
        if (child) {
          child.setTexture(chars[index].texture);
        } else {
          child = new PIXI.Sprite(chars[index].texture);
        }
        /** @type {number} */
        child.position.x = (chars[index].position.x + lineAlignOffsets[chars[index].line]) * scale;
        /** @type {number} */
        child.position.y = chars[index].position.y * scale;
        /** @type {number} */
        child.scale.x = child.scale.y = scale;
        child.tint = tint;
        if (!child.parent) {
          this.addChild(child);
        }
      }
      for (;this.children.length > lenChars;) {
        var item = this.getChildAt(this.children.length - 1);
        this._pool.push(item);
        this.removeChild(item);
      }
      /** @type {number} */
      this.textWidth = scrollHeight * scale;
      /** @type {number} */
      this.textHeight = (pos.y + data.lineHeight) * scale;
    };
    /**
     * @return {undefined}
     */
    PIXI.BitmapText.prototype.updateTransform = function() {
      if (this.dirty) {
        this.updateText();
        /** @type {boolean} */
        this.dirty = false;
      }
      PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
    PIXI.BitmapText.fonts = {};
    /**
     * @return {undefined}
     */
    PIXI.InteractionData = function() {
      this.global = new PIXI.Point;
      /** @type {null} */
      this.target = null;
      /** @type {null} */
      this.originalEvent = null;
    };
    /**
     * @param {?} displayObject
     * @return {?}
     */
    PIXI.InteractionData.prototype.getLocalPosition = function(displayObject) {
      var worldTransform = displayObject.worldTransform;
      var global = this.global;
      var a00 = worldTransform.a;
      var a01 = worldTransform.b;
      var a02 = worldTransform.tx;
      var a10 = worldTransform.c;
      var a11 = worldTransform.d;
      var a12 = worldTransform.ty;
      /** @type {number} */
      var id = 1 / (a00 * a11 + a01 * -a10);
      return new PIXI.Point(a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id, a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id);
    };
    /** @type {function (): undefined} */
    PIXI.InteractionData.prototype.constructor = PIXI.InteractionData;
    /**
     * @param {?} stage
     * @return {undefined}
     */
    PIXI.InteractionManager = function(stage) {
      this.stage = stage;
      this.mouse = new PIXI.InteractionData;
      this.touchs = {};
      this.tempPoint = new PIXI.Point;
      /** @type {boolean} */
      this.mouseoverEnabled = true;
      /** @type {Array} */
      this.pool = [];
      /** @type {Array} */
      this.interactiveItems = [];
      /** @type {null} */
      this.interactionDOMElement = null;
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseOut = this.onMouseOut.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      /** @type {number} */
      this.last = 0;
      /** @type {string} */
      this.currentCursorStyle = "inherit";
      /** @type {boolean} */
      this.mouseOut = false;
    };
    /** @type {function (?): undefined} */
    PIXI.InteractionManager.prototype.constructor = PIXI.InteractionManager;
    /**
     * @param {Object} displayObject
     * @param {?} iParent
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.collectInteractiveSprite = function(displayObject, iParent) {
      var children = displayObject.children;
      var l = children.length;
      /** @type {number} */
      var e = l - 1;
      for (;e >= 0;e--) {
        var child = children[e];
        if (child._interactive) {
          /** @type {boolean} */
          iParent.interactiveChildren = true;
          this.interactiveItems.push(child);
          if (child.children.length > 0) {
            this.collectInteractiveSprite(child, child);
          }
        } else {
          /** @type {null} */
          child.__iParent = null;
          if (child.children.length > 0) {
            this.collectInteractiveSprite(child, iParent);
          }
        }
      }
    };
    /**
     * @param {Object} target
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.setTarget = function(target) {
      /** @type {Object} */
      this.target = target;
      if (null === this.interactionDOMElement) {
        this.setTargetDomElement(target.view);
      }
    };
    /**
     * @param {Object} Input
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.setTargetDomElement = function(Input) {
      this.removeEvents();
      if (window.navigator.msPointerEnabled) {
        /** @type {string} */
        Input.style["-ms-content-zooming"] = "none";
        /** @type {string} */
        Input.style["-ms-touch-action"] = "none";
      }
      /** @type {Object} */
      this.interactionDOMElement = Input;
      Input.addEventListener("mousemove", this.onMouseMove, true);
      Input.addEventListener("mousedown", this.onMouseDown, true);
      Input.addEventListener("mouseout", this.onMouseOut, true);
      Input.addEventListener("touchstart", this.onTouchStart, true);
      Input.addEventListener("touchend", this.onTouchEnd, true);
      Input.addEventListener("touchmove", this.onTouchMove, true);
      window.addEventListener("mouseup", this.onMouseUp, true);
    };
    /**
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.removeEvents = function() {
      if (this.interactionDOMElement) {
        /** @type {string} */
        this.interactionDOMElement.style["-ms-content-zooming"] = "";
        /** @type {string} */
        this.interactionDOMElement.style["-ms-touch-action"] = "";
        this.interactionDOMElement.removeEventListener("mousemove", this.onMouseMove, true);
        this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, true);
        this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, true);
        this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, true);
        this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, true);
        this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, true);
        /** @type {null} */
        this.interactionDOMElement = null;
        window.removeEventListener("mouseup", this.onMouseUp, true);
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.update = function() {
      if (this.target) {
        /** @type {number} */
        var now = Date.now();
        /** @type {number} */
        var diff = now - this.last;
        if (diff = diff * PIXI.INTERACTION_FREQUENCY / 1E3, !(1 > diff)) {
          /** @type {number} */
          this.last = now;
          /** @type {number} */
          var j = 0;
          if (this.dirty) {
            /** @type {boolean} */
            this.dirty = false;
            var spaces = this.interactiveItems.length;
            /** @type {number} */
            j = 0;
            for (;spaces > j;j++) {
              /** @type {boolean} */
              this.interactiveItems[j].interactiveChildren = false;
            }
            /** @type {Array} */
            this.interactiveItems = [];
            if (this.stage.interactive) {
              this.interactiveItems.push(this.stage);
            }
            this.collectInteractiveSprite(this.stage, this.stage);
          }
          var len = this.interactiveItems.length;
          /** @type {string} */
          var i = "inherit";
          /** @type {boolean} */
          var up = false;
          /** @type {number} */
          j = 0;
          for (;len > j;j++) {
            var item = this.interactiveItems[j];
            item.__hit = this.hitTest(item, this.mouse);
            this.mouse.target = item;
            if (item.__hit && !up) {
              if (item.buttonMode) {
                i = item.defaultCursor;
              }
              if (!item.interactiveChildren) {
                /** @type {boolean} */
                up = true;
              }
              if (!item.__isOver) {
                if (item.mouseover) {
                  item.mouseover(this.mouse);
                }
                /** @type {boolean} */
                item.__isOver = true;
              }
            } else {
              if (item.__isOver) {
                if (item.mouseout) {
                  item.mouseout(this.mouse);
                }
                /** @type {boolean} */
                item.__isOver = false;
              }
            }
          }
          if (this.currentCursorStyle !== i) {
            /** @type {string} */
            this.currentCursorStyle = i;
            /** @type {string} */
            this.interactionDOMElement.style.cursor = i;
          }
        }
      }
    };
    /**
     * @param {Event} event
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onMouseMove = function(event) {
      this.mouse.originalEvent = event || window.event;
      var rect = this.interactionDOMElement.getBoundingClientRect();
      /** @type {number} */
      this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
      /** @type {number} */
      this.mouse.global.y = (event.clientY - rect.top) * (this.target.height / rect.height);
      var spaces = this.interactiveItems.length;
      /** @type {number} */
      var j = 0;
      for (;spaces > j;j++) {
        var item = this.interactiveItems[j];
        if (item.mousemove) {
          item.mousemove(this.mouse);
        }
      }
    };
    /**
     * @param {Event} event
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onMouseDown = function(event) {
      this.mouse.originalEvent = event || window.event;
      if (PIXI.AUTO_PREVENT_DEFAULT) {
        this.mouse.originalEvent.preventDefault();
      }
      var spaces = this.interactiveItems.length;
      /** @type {number} */
      var j = 0;
      for (;spaces > j;j++) {
        var item = this.interactiveItems[j];
        if ((item.mousedown || item.click) && (item.__mouseIsDown = true, item.__hit = this.hitTest(item, this.mouse), item.__hit && (item.mousedown && item.mousedown(this.mouse), item.__isDown = true, !item.interactiveChildren))) {
          break;
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onMouseOut = function() {
      var spaces = this.interactiveItems.length;
      /** @type {string} */
      this.interactionDOMElement.style.cursor = "inherit";
      /** @type {number} */
      var j = 0;
      for (;spaces > j;j++) {
        var item = this.interactiveItems[j];
        if (item.__isOver) {
          this.mouse.target = item;
          if (item.mouseout) {
            item.mouseout(this.mouse);
          }
          /** @type {boolean} */
          item.__isOver = false;
        }
      }
      /** @type {boolean} */
      this.mouseOut = true;
      /** @type {number} */
      this.mouse.global.x = -1E4;
      /** @type {number} */
      this.mouse.global.y = -1E4;
    };
    /**
     * @param {Event} event
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onMouseUp = function(event) {
      this.mouse.originalEvent = event || window.event;
      var spaces = this.interactiveItems.length;
      /** @type {boolean} */
      var up = false;
      /** @type {number} */
      var j = 0;
      for (;spaces > j;j++) {
        var item = this.interactiveItems[j];
        item.__hit = this.hitTest(item, this.mouse);
        if (item.__hit && !up) {
          if (item.mouseup) {
            item.mouseup(this.mouse);
          }
          if (item.__isDown) {
            if (item.click) {
              item.click(this.mouse);
            }
          }
          if (!item.interactiveChildren) {
            /** @type {boolean} */
            up = true;
          }
        } else {
          if (item.__isDown) {
            if (item.mouseupoutside) {
              item.mouseupoutside(this.mouse);
            }
          }
        }
        /** @type {boolean} */
        item.__isDown = false;
      }
    };
    /**
     * @param {Object} item
     * @param {Object} interactionData
     * @return {?}
     */
    PIXI.InteractionManager.prototype.hitTest = function(item, interactionData) {
      var global = interactionData.global;
      if (!item.worldVisible) {
        return false;
      }
      /** @type {boolean} */
      var isSprite = item instanceof PIXI.Sprite;
      var worldTransform = item.worldTransform;
      var a00 = worldTransform.a;
      var a01 = worldTransform.b;
      var a02 = worldTransform.tx;
      var a10 = worldTransform.c;
      var a11 = worldTransform.d;
      var a12 = worldTransform.ty;
      /** @type {number} */
      var id = 1 / (a00 * a11 + a01 * -a10);
      /** @type {number} */
      var actual = a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id;
      /** @type {number} */
      var a = a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id;
      if (interactionData.target = item, item.hitArea && item.hitArea.contains) {
        return item.hitArea.contains(actual, a) ? (interactionData.target = item, true) : false;
      }
      if (isSprite) {
        var b;
        var width = item.texture.frame.width;
        var height = item.texture.frame.height;
        /** @type {number} */
        var expected = -width * item.anchor.x;
        if (actual > expected && (expected + width > actual && (b = -height * item.anchor.y, a > b && b + height > a))) {
          return interactionData.target = item, true;
        }
      }
      var l = item.children.length;
      /** @type {number} */
      var i = 0;
      for (;l > i;i++) {
        var x = item.children[i];
        var hit = this.hitTest(x, interactionData);
        if (hit) {
          return interactionData.target = item, true;
        }
      }
      return false;
    };
    /**
     * @param {Event} e
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onTouchMove = function(e) {
      var event;
      var rect = this.interactionDOMElement.getBoundingClientRect();
      var codeSegments = e.changedTouches;
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      i = 0;
      for (;i < codeSegments.length;i++) {
        var touch = codeSegments[i];
        event = this.touchs[touch.identifier];
        event.originalEvent = e || window.event;
        /** @type {number} */
        event.global.x = (touch.clientX - rect.left) * (this.target.width / rect.width);
        /** @type {number} */
        event.global.y = (touch.clientY - rect.top) * (this.target.height / rect.height);
        if (navigator.isCocoonJS) {
          event.global.x = touch.clientX;
          event.global.y = touch.clientY;
        }
        /** @type {number} */
        var j = 0;
        for (;j < this.interactiveItems.length;j++) {
          var item = this.interactiveItems[j];
          if (item.touchmove) {
            if (item.__touchData[touch.identifier]) {
              item.touchmove(event);
            }
          }
        }
      }
    };
    /**
     * @param {Event} event
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onTouchStart = function(event) {
      var rect = this.interactionDOMElement.getBoundingClientRect();
      if (PIXI.AUTO_PREVENT_DEFAULT) {
        event.preventDefault();
      }
      var codeSegments = event.changedTouches;
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        var touch = codeSegments[i];
        var touchData = this.pool.pop();
        if (!touchData) {
          touchData = new PIXI.InteractionData;
        }
        touchData.originalEvent = event || window.event;
        this.touchs[touch.identifier] = touchData;
        /** @type {number} */
        touchData.global.x = (touch.clientX - rect.left) * (this.target.width / rect.width);
        /** @type {number} */
        touchData.global.y = (touch.clientY - rect.top) * (this.target.height / rect.height);
        if (navigator.isCocoonJS) {
          touchData.global.x = touch.clientX;
          touchData.global.y = touch.clientY;
        }
        var spaces = this.interactiveItems.length;
        /** @type {number} */
        var j = 0;
        for (;spaces > j;j++) {
          var item = this.interactiveItems[j];
          if ((item.touchstart || item.tap) && (item.__hit = this.hitTest(item, touchData), item.__hit && (item.touchstart && item.touchstart(touchData), item.__isDown = true, item.__touchData = item.__touchData || {}, item.__touchData[touch.identifier] = touchData, !item.interactiveChildren))) {
            break;
          }
        }
      }
    };
    /**
     * @param {Event} event
     * @return {undefined}
     */
    PIXI.InteractionManager.prototype.onTouchEnd = function(event) {
      var rect = this.interactionDOMElement.getBoundingClientRect();
      var codeSegments = event.changedTouches;
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        var touch = codeSegments[i];
        var touchData = this.touchs[touch.identifier];
        /** @type {boolean} */
        var up = false;
        /** @type {number} */
        touchData.global.x = (touch.clientX - rect.left) * (this.target.width / rect.width);
        /** @type {number} */
        touchData.global.y = (touch.clientY - rect.top) * (this.target.height / rect.height);
        if (navigator.isCocoonJS) {
          touchData.global.x = touch.clientX;
          touchData.global.y = touch.clientY;
        }
        var spaces = this.interactiveItems.length;
        /** @type {number} */
        var j = 0;
        for (;spaces > j;j++) {
          var item = this.interactiveItems[j];
          if (item.__touchData) {
            if (item.__touchData[touch.identifier]) {
              item.__hit = this.hitTest(item, item.__touchData[touch.identifier]);
              touchData.originalEvent = event || window.event;
              if (item.touchend || item.tap) {
                if (item.__hit && !up) {
                  if (item.touchend) {
                    item.touchend(touchData);
                  }
                  if (item.__isDown) {
                    if (item.tap) {
                      item.tap(touchData);
                    }
                  }
                  if (!item.interactiveChildren) {
                    /** @type {boolean} */
                    up = true;
                  }
                } else {
                  if (item.__isDown) {
                    if (item.touchendoutside) {
                      item.touchendoutside(touchData);
                    }
                  }
                }
                /** @type {boolean} */
                item.__isDown = false;
              }
              /** @type {null} */
              item.__touchData[touch.identifier] = null;
            }
          }
        }
        this.pool.push(touchData);
        /** @type {null} */
        this.touchs[touch.identifier] = null;
      }
    };
    /**
     * @param {boolean} backgroundColor
     * @return {undefined}
     */
    PIXI.Stage = function(backgroundColor) {
      PIXI.DisplayObjectContainer.call(this);
      this.worldTransform = new PIXI.Matrix;
      /** @type {boolean} */
      this.interactive = true;
      this.interactionManager = new PIXI.InteractionManager(this);
      /** @type {boolean} */
      this.dirty = true;
      this.stage = this;
      this.stage.hitArea = new PIXI.Rectangle(0, 0, 1E5, 1E5);
      this.setBackgroundColor(backgroundColor);
    };
    /** @type {Object} */
    PIXI.Stage.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    /** @type {function (boolean): undefined} */
    PIXI.Stage.prototype.constructor = PIXI.Stage;
    /**
     * @param {Object} deepDataAndEvents
     * @return {undefined}
     */
    PIXI.Stage.prototype.setInteractionDelegate = function(deepDataAndEvents) {
      this.interactionManager.setTargetDomElement(deepDataAndEvents);
    };
    /**
     * @return {undefined}
     */
    PIXI.Stage.prototype.updateTransform = function() {
      /** @type {number} */
      this.worldAlpha = 1;
      /** @type {number} */
      var i = 0;
      var l = this.children.length;
      for (;l > i;i++) {
        this.children[i].updateTransform();
      }
      if (this.dirty) {
        /** @type {boolean} */
        this.dirty = false;
        /** @type {boolean} */
        this.interactionManager.dirty = true;
      }
      if (this.interactive) {
        this.interactionManager.update();
      }
    };
    /**
     * @param {boolean} backgroundColor
     * @return {undefined}
     */
    PIXI.Stage.prototype.setBackgroundColor = function(backgroundColor) {
      this.backgroundColor = backgroundColor || 0;
      this.backgroundColorSplit = PIXI.hex2rgb(this.backgroundColor);
      var hex = this.backgroundColor.toString(16);
      /** @type {string} */
      hex = "000000".substr(0, 6 - hex.length) + hex;
      /** @type {string} */
      this.backgroundColorString = "#" + hex;
    };
    /**
     * @return {?}
     */
    PIXI.Stage.prototype.getMousePosition = function() {
      return this.interactionManager.mouse.global;
    };
    /** @type {number} */
    var lastTime = 0;
    /** @type {Array} */
    var vendors = ["ms", "moz", "webkit", "o"];
    /** @type {number} */
    var x = 0;
    for (;x < vendors.length && !window.requestAnimationFrame;++x) {
      window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
      window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
      /**
       * @param {function (number): ?} callback
       * @return {number}
       */
      window.requestAnimationFrame = function(callback) {
        /** @type {number} */
        var currTime = (new Date).getTime();
        /** @type {number} */
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        /** @type {number} */
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        return lastTime = currTime + timeToCall, id;
      };
    }
    if (!window.cancelAnimationFrame) {
      /**
       * @param {number} id
       * @return {?}
       */
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
    window.requestAnimFrame = window.requestAnimationFrame;
    /**
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    PIXI.hex2rgb = function(deepDataAndEvents) {
      return[(deepDataAndEvents >> 16 & 255) / 255, (deepDataAndEvents >> 8 & 255) / 255, (255 & deepDataAndEvents) / 255];
    };
    /**
     * @param {Array} b
     * @return {?}
     */
    PIXI.rgb2hex = function(b) {
      return(255 * b[0] << 16) + (255 * b[1] << 8) + 255 * b[2];
    };
    if ("function" != typeof Function.prototype.bind) {
      Function.prototype.bind = function() {
        /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
        var __slice = Array.prototype.slice;
        return function(context) {
          /**
           * @return {undefined}
           */
          function bound() {
            /** @type {Array} */
            var new_t = args.concat(__slice.call(arguments));
            fn.apply(this instanceof bound ? this : context, new_t);
          }
          var fn = this;
          /** @type {Array.<?>} */
          var args = __slice.call(arguments, 1);
          if ("function" != typeof fn) {
            throw new TypeError;
          }
          return bound.prototype = function F(proto) {
            return proto && (F.prototype = proto), this instanceof F ? void 0 : new F;
          }(fn.prototype), bound;
        };
      }();
    }
    /**
     * @return {?}
     */
    PIXI.AjaxRequest = function() {
      /** @type {Array} */
      var branchDataJSON = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Microsoft.XMLHTTP"];
      if (!window.ActiveXObject) {
        return window.XMLHttpRequest ? new window.XMLHttpRequest : false;
      }
      /** @type {number} */
      var conditionIndex = 0;
      for (;conditionIndex < branchDataJSON.length;conditionIndex++) {
        try {
          return new window.ActiveXObject(branchDataJSON[conditionIndex]);
        } catch (i) {
        }
      }
    };
    /**
     * @return {?}
     */
    PIXI.canUseNewCanvasBlendModes = function() {
      /** @type {Element} */
      var cnv = document.createElement("canvas");
      /** @type {number} */
      cnv.width = 1;
      /** @type {number} */
      cnv.height = 1;
      var ctx = cnv.getContext("2d");
      return ctx.fillStyle = "#000", ctx.fillRect(0, 0, 1, 1), ctx.globalCompositeOperation = "multiply", ctx.fillStyle = "#fff", ctx.fillRect(0, 0, 1, 1), 0 === ctx.getImageData(0, 0, 1, 1).data[0];
    };
    /**
     * @param {number} x
     * @return {?}
     */
    PIXI.getNextPowerOfTwo = function(x) {
      if (x > 0 && 0 === (x & x - 1)) {
        return x;
      }
      /** @type {number} */
      var y = 1;
      for (;x > y;) {
        y <<= 1;
      }
      return y;
    };
    /**
     * @return {undefined}
     */
    PIXI.EventTarget = function() {
      var listeners = {};
      /** @type {function (string, ?): undefined} */
      this.addEventListener = this.on = function(event, one) {
        if (void 0 === listeners[event]) {
          /** @type {Array} */
          listeners[event] = [];
        }
        if (-1 === listeners[event].indexOf(one)) {
          listeners[event].push(one);
        }
      };
      /** @type {function (Event): undefined} */
      this.dispatchEvent = this.emit = function(data) {
        if (listeners[data.type] && listeners[data.type].length) {
          /** @type {number} */
          var id = 0;
          var cnl = listeners[data.type].length;
          for (;cnl > id;id++) {
            listeners[data.type][id](data);
          }
        }
      };
      /** @type {function (string, ?): undefined} */
      this.removeEventListener = this.off = function(event, element) {
        var classes = listeners[event].indexOf(element);
        if (-1 !== classes) {
          listeners[event].splice(classes, 1);
        }
      };
      /**
       * @param {?} name
       * @return {undefined}
       */
      this.removeAllEventListeners = function(name) {
        var eventListeners = listeners[name];
        if (eventListeners) {
          /** @type {number} */
          eventListeners.length = 0;
        }
      };
    };
    /**
     * @param {number} width
     * @param {number} height
     * @param {string} view
     * @param {string} transparent
     * @param {number} antialias
     * @return {?}
     */
    PIXI.autoDetectRenderer = function(width, height, view, transparent, antialias) {
      if (!width) {
        /** @type {number} */
        width = 800;
      }
      if (!height) {
        /** @type {number} */
        height = 600;
      }
      var r = function() {
        try {
          /** @type {Element} */
          var canvas = document.createElement("canvas");
          return!!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        } catch (t) {
          return false;
        }
      }();
      return r ? new PIXI.WebGLRenderer(width, height, view, transparent, antialias) : new PIXI.CanvasRenderer(width, height, view, transparent);
    };
    /**
     * @param {number} width
     * @param {number} height
     * @param {string} view
     * @param {string} transparent
     * @param {number} antialias
     * @return {?}
     */
    PIXI.autoDetectRecommendedRenderer = function(width, height, view, transparent, antialias) {
      if (!width) {
        /** @type {number} */
        width = 800;
      }
      if (!height) {
        /** @type {number} */
        height = 600;
      }
      var _tryInitOnFocus = function() {
        try {
          /** @type {Element} */
          var canvas = document.createElement("canvas");
          return!!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        } catch (t) {
          return false;
        }
      }();
      /** @type {boolean} */
      var _isFocused = /Android/i.test(navigator.userAgent);
      return _tryInitOnFocus && !_isFocused ? new PIXI.WebGLRenderer(width, height, view, transparent, antialias) : new PIXI.CanvasRenderer(width, height, view, transparent);
    };
    PIXI.PolyK = {};
    /**
     * @param {(Array|Int8Array|Uint8Array)} points
     * @return {?}
     */
    PIXI.PolyK.Triangulate = function(points) {
      /** @type {boolean} */
      var udataCur = true;
      /** @type {number} */
      var size = points.length >> 1;
      if (3 > size) {
        return[];
      }
      /** @type {Array} */
      var vec3 = [];
      /** @type {Array} */
      var vertices = [];
      /** @type {number} */
      var i = 0;
      for (;size > i;i++) {
        vertices.push(i);
      }
      /** @type {number} */
      i = 0;
      /** @type {number} */
      var len = size;
      for (;len > 3;) {
        var d = vertices[(i + 0) % len];
        var b = vertices[(i + 1) % len];
        var a = vertices[(i + 2) % len];
        var endPoint = points[2 * d];
        var oldconfig = points[2 * d + 1];
        var x1 = points[2 * b];
        var QUnit = points[2 * b + 1];
        var maxY = points[2 * a];
        var y = points[2 * a + 1];
        /** @type {boolean} */
        var v = false;
        if (PIXI.PolyK._convex(endPoint, oldconfig, x1, QUnit, maxY, y, udataCur)) {
          /** @type {boolean} */
          v = true;
          /** @type {number} */
          var j = 0;
          for (;len > j;j++) {
            var c = vertices[j];
            if (c !== d && (c !== b && (c !== a && PIXI.PolyK._PointInTriangle(points[2 * c], points[2 * c + 1], endPoint, oldconfig, x1, QUnit, maxY, y)))) {
              /** @type {boolean} */
              v = false;
              break;
            }
          }
        }
        if (v) {
          vec3.push(d, b, a);
          vertices.splice((i + 1) % len, 1);
          len--;
          /** @type {number} */
          i = 0;
        } else {
          if (i++ > 3 * len) {
            if (!udataCur) {
              return window.console.log("PIXI Warning: shape too complex to fill"), [];
            }
            /** @type {Array} */
            vec3 = [];
            /** @type {Array} */
            vertices = [];
            /** @type {number} */
            i = 0;
            for (;size > i;i++) {
              vertices.push(i);
            }
            /** @type {number} */
            i = 0;
            /** @type {number} */
            len = size;
            /** @type {boolean} */
            udataCur = false;
          }
        }
      }
      return vec3.push(vertices[0], vertices[1], vertices[2]), vec3;
    };
    /**
     * @param {number} start1
     * @param {number} d
     * @param {number} start
     * @param {number} b
     * @param {number} end
     * @param {number} a
     * @param {number} next
     * @param {number} g
     * @return {?}
     */
    PIXI.PolyK._PointInTriangle = function(start1, d, start, b, end, a, next, g) {
      /** @type {number} */
      var x0 = next - start;
      /** @type {number} */
      var x1 = g - b;
      /** @type {number} */
      var z0 = end - start;
      /** @type {number} */
      var z1 = a - b;
      /** @type {number} */
      var eyex = start1 - start;
      /** @type {number} */
      var eyey = d - b;
      /** @type {number} */
      var m00 = x0 * x0 + x1 * x1;
      /** @type {number} */
      var m10 = x0 * z0 + x1 * z1;
      /** @type {number} */
      var b1 = x0 * eyex + x1 * eyey;
      /** @type {number} */
      var m11 = z0 * z0 + z1 * z1;
      /** @type {number} */
      var b3 = z0 * eyex + z1 * eyey;
      /** @type {number} */
      var y2 = 1 / (m00 * m11 - m10 * m10);
      /** @type {number} */
      var xy = (m11 * b1 - m10 * b3) * y2;
      /** @type {number} */
      var wy = (m00 * b3 - m10 * b1) * y2;
      return xy >= 0 && (wy >= 0 && 1 > xy + wy);
    };
    /**
     * @param {number} endPoint
     * @param {number} b
     * @param {number} min
     * @param {number} a
     * @param {number} max
     * @param {number} v11
     * @param {boolean} value
     * @return {?}
     */
    PIXI.PolyK._convex = function(endPoint, b, min, a, max, v11, value) {
      return(b - a) * (max - min) + (min - endPoint) * (v11 - a) >= 0 === value;
    };
    /**
     * @return {undefined}
     */
    PIXI.initDefaultShaders = function() {
    };
    /**
     * @param {WebGLRenderingContext} gl
     * @param {Object} shaderSrc
     * @return {?}
     */
    PIXI.CompileVertexShader = function(gl, shaderSrc) {
      return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
    };
    /**
     * @param {WebGLRenderingContext} gl
     * @param {Object} shaderSrc
     * @return {?}
     */
    PIXI.CompileFragmentShader = function(gl, shaderSrc) {
      return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
    };
    /**
     * @param {WebGLRenderingContext} gl
     * @param {Array} shaderSrc
     * @param {?} shaderType
     * @return {?}
     */
    PIXI._CompileShader = function(gl, shaderSrc, shaderType) {
      var vsData = shaderSrc.join("\n");
      var shader = gl.createShader(shaderType);
      return gl.shaderSource(shader, vsData), gl.compileShader(shader), gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : (window.console.log(gl.getShaderInfoLog(shader)), null);
    };
    /**
     * @param {WebGLRenderingContext} gl
     * @param {?} vertexSrc
     * @param {?} fragmentSrc
     * @return {?}
     */
    PIXI.compileProgram = function(gl, vertexSrc, fragmentSrc) {
      var fs = PIXI.CompileFragmentShader(gl, fragmentSrc);
      var vs = PIXI.CompileVertexShader(gl, vertexSrc);
      var program = gl.createProgram();
      return gl.attachShader(program, vs), gl.attachShader(program, fs), gl.linkProgram(program), gl.getProgramParameter(program, gl.LINK_STATUS) || window.console.log("Could not initialise shaders"), program;
    };
    /**
     * @param {?} gl
     * @return {undefined}
     */
    PIXI.PixiShader = function(gl) {
      this.gl = gl;
      /** @type {null} */
      this.program = null;
      /** @type {Array} */
      this.fragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"];
      /** @type {number} */
      this.textureCount = 0;
      /** @type {Array} */
      this.attributes = [];
      this.init();
    };
    /**
     * @return {undefined}
     */
    PIXI.PixiShader.prototype.init = function() {
      var gl = this.gl;
      var program = PIXI.compileProgram(gl, this.vertexSrc || PIXI.PixiShader.defaultVertexSrc, this.fragmentSrc);
      gl.useProgram(program);
      this.uSampler = gl.getUniformLocation(program, "uSampler");
      this.projectionVector = gl.getUniformLocation(program, "projectionVector");
      this.offsetVector = gl.getUniformLocation(program, "offsetVector");
      this.dimensions = gl.getUniformLocation(program, "dimensions");
      this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
      this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
      this.colorAttribute = gl.getAttribLocation(program, "aColor");
      if (-1 === this.colorAttribute) {
        /** @type {number} */
        this.colorAttribute = 2;
      }
      /** @type {Array} */
      this.attributes = [this.aVertexPosition, this.aTextureCoord, this.colorAttribute];
      var uniformName;
      for (uniformName in this.uniforms) {
        this.uniforms[uniformName].uniformLocation = gl.getUniformLocation(program, uniformName);
      }
      this.initUniforms();
      this.program = program;
    };
    /**
     * @return {undefined}
     */
    PIXI.PixiShader.prototype.initUniforms = function() {
      /** @type {number} */
      this.textureCount = 1;
      var self;
      var gl = this.gl;
      var name;
      for (name in this.uniforms) {
        self = this.uniforms[name];
        var type = self.type;
        if ("sampler2D" === type) {
          /** @type {boolean} */
          self._init = false;
          if (null !== self.value) {
            this.initSampler2D(self);
          }
        } else {
          if ("mat2" === type || ("mat3" === type || "mat4" === type)) {
            /** @type {boolean} */
            self.glMatrix = true;
            /** @type {number} */
            self.glValueLength = 1;
            if ("mat2" === type) {
              self.glFunc = gl.uniformMatrix2fv;
            } else {
              if ("mat3" === type) {
                self.glFunc = gl.uniformMatrix3fv;
              } else {
                if ("mat4" === type) {
                  self.glFunc = gl.uniformMatrix4fv;
                }
              }
            }
          } else {
            self.glFunc = gl["uniform" + type];
            /** @type {number} */
            self.glValueLength = "2f" === type || "2i" === type ? 2 : "3f" === type || "3i" === type ? 3 : "4f" === type || "4i" === type ? 4 : 1;
          }
        }
      }
    };
    /**
     * @param {Element} elem
     * @return {undefined}
     */
    PIXI.PixiShader.prototype.initSampler2D = function(elem) {
      if (elem.value && (elem.value.baseTexture && elem.value.baseTexture.hasLoaded)) {
        var gl = this.gl;
        if (gl.activeTexture(gl["TEXTURE" + this.textureCount]), gl.bindTexture(gl.TEXTURE_2D, elem.value.baseTexture._glTextures[gl.id]), elem.textureData) {
          var options = elem.textureData;
          var _minFilter = options.magFilter ? options.magFilter : gl.LINEAR;
          var _wrapT = options.minFilter ? options.minFilter : gl.LINEAR;
          var MAG_FILTER = options.wrapS ? options.wrapS : gl.CLAMP_TO_EDGE;
          var WRAP = options.wrapT ? options.wrapT : gl.CLAMP_TO_EDGE;
          var size = options.luminance ? gl.LUMINANCE : gl.RGBA;
          if (options.repeat && (MAG_FILTER = gl.REPEAT, WRAP = gl.REPEAT), gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!options.flipY), options.width) {
            var swap = options.width ? options.width : 512;
            var height = options.height ? options.height : 2;
            var smooth = options.border ? options.border : 0;
            gl.texImage2D(gl.TEXTURE_2D, 0, size, swap, height, smooth, size, gl.UNSIGNED_BYTE, null);
          } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, size, gl.RGBA, gl.UNSIGNED_BYTE, elem.value.baseTexture.source);
          }
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, _minFilter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _wrapT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, MAG_FILTER);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, WRAP);
        }
        gl.uniform1i(elem.uniformLocation, this.textureCount);
        /** @type {boolean} */
        elem._init = true;
        this.textureCount++;
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.PixiShader.prototype.syncUniforms = function() {
      /** @type {number} */
      this.textureCount = 1;
      var p;
      var ctx = this.gl;
      var i;
      for (i in this.uniforms) {
        p = this.uniforms[i];
        if (1 === p.glValueLength) {
          if (p.glMatrix === true) {
            p.glFunc.call(ctx, p.uniformLocation, p.transpose, p.value);
          } else {
            p.glFunc.call(ctx, p.uniformLocation, p.value);
          }
        } else {
          if (2 === p.glValueLength) {
            p.glFunc.call(ctx, p.uniformLocation, p.value.x, p.value.y);
          } else {
            if (3 === p.glValueLength) {
              p.glFunc.call(ctx, p.uniformLocation, p.value.x, p.value.y, p.value.z);
            } else {
              if (4 === p.glValueLength) {
                p.glFunc.call(ctx, p.uniformLocation, p.value.x, p.value.y, p.value.z, p.value.w);
              } else {
                if ("sampler2D" === p.type) {
                  if (p._init) {
                    ctx.activeTexture(ctx["TEXTURE" + this.textureCount]);
                    ctx.bindTexture(ctx.TEXTURE_2D, p.value.baseTexture._glTextures[ctx.id] || PIXI.createWebGLTexture(p.value.baseTexture, ctx));
                    ctx.uniform1i(p.uniformLocation, this.textureCount);
                    this.textureCount++;
                  } else {
                    this.initSampler2D(p);
                  }
                }
              }
            }
          }
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.PixiShader.prototype.destroy = function() {
      this.gl.deleteProgram(this.program);
      /** @type {null} */
      this.uniforms = null;
      /** @type {null} */
      this.gl = null;
      /** @type {null} */
      this.attributes = null;
    };
    /** @type {Array} */
    PIXI.PixiShader.defaultVertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec2 aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;", 
    "   vColor = vec4(color * aColor.x, aColor.x);", "}"];
    /**
     * @param {WebGLRenderingContext} gl
     * @return {undefined}
     */
    PIXI.PixiFastShader = function(gl) {
      /** @type {WebGLRenderingContext} */
      this.gl = gl;
      /** @type {null} */
      this.program = null;
      /** @type {Array} */
      this.fragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"];
      /** @type {Array} */
      this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aPositionCoord;", "attribute vec2 aScale;", "attribute float aRotation;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform mat3 uMatrix;", "varying vec2 vTextureCoord;", "varying float vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   vec2 v;", "   vec2 sv = aVertexPosition * aScale;", "   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);", 
      "   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);", "   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;", "   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}"];
      /** @type {number} */
      this.textureCount = 0;
      this.init();
    };
    /**
     * @return {undefined}
     */
    PIXI.PixiFastShader.prototype.init = function() {
      var gl = this.gl;
      var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
      gl.useProgram(program);
      this.uSampler = gl.getUniformLocation(program, "uSampler");
      this.projectionVector = gl.getUniformLocation(program, "projectionVector");
      this.offsetVector = gl.getUniformLocation(program, "offsetVector");
      this.dimensions = gl.getUniformLocation(program, "dimensions");
      this.uMatrix = gl.getUniformLocation(program, "uMatrix");
      this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
      this.aPositionCoord = gl.getAttribLocation(program, "aPositionCoord");
      this.aScale = gl.getAttribLocation(program, "aScale");
      this.aRotation = gl.getAttribLocation(program, "aRotation");
      this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
      this.colorAttribute = gl.getAttribLocation(program, "aColor");
      if (-1 === this.colorAttribute) {
        /** @type {number} */
        this.colorAttribute = 2;
      }
      /** @type {Array} */
      this.attributes = [this.aVertexPosition, this.aPositionCoord, this.aScale, this.aRotation, this.aTextureCoord, this.colorAttribute];
      this.program = program;
    };
    /**
     * @return {undefined}
     */
    PIXI.PixiFastShader.prototype.destroy = function() {
      this.gl.deleteProgram(this.program);
      /** @type {null} */
      this.uniforms = null;
      /** @type {null} */
      this.gl = null;
      /** @type {null} */
      this.attributes = null;
    };
    /**
     * @return {undefined}
     */
    PIXI.StripShader = function() {
      /** @type {null} */
      this.program = null;
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform float alpha;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));", "   gl_FragColor = gl_FragColor * alpha;", "}"];
      /** @type {Array} */
      this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "varying vec2 vTextureCoord;", "uniform vec2 offsetVector;", "varying float vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / projectionVector.y + 1.0 , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", 
      "   vColor = aColor;", "}"];
    };
    /**
     * @return {undefined}
     */
    PIXI.StripShader.prototype.init = function() {
      var gl = PIXI.gl;
      var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
      gl.useProgram(program);
      this.uSampler = gl.getUniformLocation(program, "uSampler");
      this.projectionVector = gl.getUniformLocation(program, "projectionVector");
      this.offsetVector = gl.getUniformLocation(program, "offsetVector");
      this.colorAttribute = gl.getAttribLocation(program, "aColor");
      this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
      this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
      this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
      this.alpha = gl.getUniformLocation(program, "alpha");
      this.program = program;
    };
    /**
     * @param {WebGLRenderingContext} gl
     * @return {undefined}
     */
    PIXI.PrimitiveShader = function(gl) {
      /** @type {WebGLRenderingContext} */
      this.gl = gl;
      /** @type {null} */
      this.program = null;
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}"];
      /** @type {Array} */
      this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec4 aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform float alpha;", "uniform vec3 tint;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vColor = aColor * vec4(tint * alpha, alpha);", 
      "}"];
      this.init();
    };
    /**
     * @return {undefined}
     */
    PIXI.PrimitiveShader.prototype.init = function() {
      var gl = this.gl;
      var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
      gl.useProgram(program);
      this.projectionVector = gl.getUniformLocation(program, "projectionVector");
      this.offsetVector = gl.getUniformLocation(program, "offsetVector");
      this.tintColor = gl.getUniformLocation(program, "tint");
      this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
      this.colorAttribute = gl.getAttribLocation(program, "aColor");
      /** @type {Array} */
      this.attributes = [this.aVertexPosition, this.colorAttribute];
      this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
      this.alpha = gl.getUniformLocation(program, "alpha");
      this.program = program;
    };
    /**
     * @return {undefined}
     */
    PIXI.PrimitiveShader.prototype.destroy = function() {
      this.gl.deleteProgram(this.program);
      /** @type {null} */
      this.uniforms = null;
      /** @type {null} */
      this.gl = null;
      /** @type {null} */
      this.attribute = null;
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLGraphics = function() {
    };
    /**
     * @param {?} graphics
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.WebGLGraphics.renderGraphics = function(graphics, context) {
      var gl = context.gl;
      var projection = context.projection;
      var j = context.offset;
      var program = context.shaderManager.primitiveShader;
      if (!graphics._webGL[gl.id]) {
        graphics._webGL[gl.id] = {
          points : [],
          indices : [],
          lastIndex : 0,
          buffer : gl.createBuffer(),
          indexBuffer : gl.createBuffer()
        };
      }
      var obj = graphics._webGL[gl.id];
      if (graphics.dirty) {
        /** @type {boolean} */
        graphics.dirty = false;
        if (graphics.clearDirty) {
          /** @type {boolean} */
          graphics.clearDirty = false;
          /** @type {number} */
          obj.lastIndex = 0;
          /** @type {Array} */
          obj.points = [];
          /** @type {Array} */
          obj.indices = [];
        }
        PIXI.WebGLGraphics.updateGraphics(graphics, gl);
      }
      context.shaderManager.activatePrimitiveShader();
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniformMatrix3fv(program.translationMatrix, false, graphics.worldTransform.toArray(true));
      gl.uniform2f(program.projectionVector, projection.x, -projection.y);
      gl.uniform2f(program.offsetVector, -j.x, -j.y);
      gl.uniform3fv(program.tintColor, PIXI.hex2rgb(graphics.tint));
      gl.uniform1f(program.alpha, graphics.worldAlpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
      gl.vertexAttribPointer(program.aVertexPosition, 2, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 24, 8);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
      gl.drawElements(gl.TRIANGLE_STRIP, obj.indices.length, gl.UNSIGNED_SHORT, 0);
      context.shaderManager.deactivatePrimitiveShader();
    };
    /**
     * @param {?} graphics
     * @param {Object} gl
     * @return {undefined}
     */
    PIXI.WebGLGraphics.updateGraphics = function(graphics, gl) {
      var shape = graphics._webGL[gl.id];
      var i = shape.lastIndex;
      for (;i < graphics.graphicsData.length;i++) {
        var data = graphics.graphicsData[i];
        if (data.type === PIXI.Graphics.POLY) {
          if (data.fill) {
            if (data.points.length > 3) {
              PIXI.WebGLGraphics.buildPoly(data, shape);
            }
          }
          if (data.lineWidth > 0) {
            PIXI.WebGLGraphics.buildLine(data, shape);
          }
        } else {
          if (data.type === PIXI.Graphics.RECT) {
            PIXI.WebGLGraphics.buildRectangle(data, shape);
          } else {
            if (data.type === PIXI.Graphics.CIRC || data.type === PIXI.Graphics.ELIP) {
              PIXI.WebGLGraphics.buildCircle(data, shape);
            }
          }
        }
      }
      shape.lastIndex = graphics.graphicsData.length;
      /** @type {Float32Array} */
      shape.glPoints = new Float32Array(shape.points);
      gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, shape.glPoints, gl.STATIC_DRAW);
      /** @type {Uint16Array} */
      shape.glIndicies = new Uint16Array(shape.indices);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.glIndicies, gl.STATIC_DRAW);
    };
    /**
     * @param {Object} graphicsData
     * @param {Object} webGLData
     * @return {undefined}
     */
    PIXI.WebGLGraphics.buildRectangle = function(graphicsData, webGLData) {
      var rectData = graphicsData.points;
      var x = rectData[0];
      var y = rectData[1];
      var width = rectData[2];
      var height = rectData[3];
      if (graphicsData.fill) {
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;
        /** @type {number} */
        var r = color[0] * alpha;
        /** @type {number} */
        var g = color[1] * alpha;
        /** @type {number} */
        var b = color[2] * alpha;
        var verts = webGLData.points;
        var indices = webGLData.indices;
        /** @type {number} */
        var vertPos = verts.length / 6;
        verts.push(x, y);
        verts.push(r, g, b, alpha);
        verts.push(x + width, y);
        verts.push(r, g, b, alpha);
        verts.push(x, y + height);
        verts.push(r, g, b, alpha);
        verts.push(x + width, y + height);
        verts.push(r, g, b, alpha);
        indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
      }
      if (graphicsData.lineWidth) {
        var points = graphicsData.points;
        /** @type {Array} */
        graphicsData.points = [x, y, x + width, y, x + width, y + height, x, y + height, x, y];
        PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
        graphicsData.points = points;
      }
    };
    /**
     * @param {Object} graphicsData
     * @param {Object} webGLData
     * @return {undefined}
     */
    PIXI.WebGLGraphics.buildCircle = function(graphicsData, webGLData) {
      var rectData = graphicsData.points;
      var x = rectData[0];
      var y = rectData[1];
      var width = rectData[2];
      var height = rectData[3];
      /** @type {number} */
      var Vd = 40;
      /** @type {number} */
      var t = 2 * Math.PI / Vd;
      /** @type {number} */
      var HALF_PI = 0;
      if (graphicsData.fill) {
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;
        /** @type {number} */
        var r = color[0] * alpha;
        /** @type {number} */
        var g = color[1] * alpha;
        /** @type {number} */
        var b = color[2] * alpha;
        var verts = webGLData.points;
        var indices = webGLData.indices;
        /** @type {number} */
        var vecPos = verts.length / 6;
        indices.push(vecPos);
        /** @type {number} */
        HALF_PI = 0;
        for (;Vd + 1 > HALF_PI;HALF_PI++) {
          verts.push(x, y, r, g, b, alpha);
          verts.push(x + Math.sin(t * HALF_PI) * width, y + Math.cos(t * HALF_PI) * height, r, g, b, alpha);
          indices.push(vecPos++, vecPos++);
        }
        indices.push(vecPos - 1);
      }
      if (graphicsData.lineWidth) {
        var points = graphicsData.points;
        /** @type {Array} */
        graphicsData.points = [];
        /** @type {number} */
        HALF_PI = 0;
        for (;Vd + 1 > HALF_PI;HALF_PI++) {
          graphicsData.points.push(x + Math.sin(t * HALF_PI) * width, y + Math.cos(t * HALF_PI) * height);
        }
        PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
        graphicsData.points = points;
      }
    };
    /**
     * @param {Object} graphicsData
     * @param {Object} webGLData
     * @return {undefined}
     */
    PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData) {
      /** @type {number} */
      var i = 0;
      var points = graphicsData.points;
      if (0 !== points.length) {
        if (graphicsData.lineWidth % 2) {
          /** @type {number} */
          i = 0;
          for (;i < points.length;i++) {
            points[i] += 0.5;
          }
        }
        var p1 = new PIXI.Point(points[0], points[1]);
        var p2 = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
        if (p1.x === p2.x && p1.y === p2.y) {
          points.pop();
          points.pop();
          p2 = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
          var k = p2.x + 0.5 * (p1.x - p2.x);
          var midPointY = p2.y + 0.5 * (p1.y - p2.y);
          points.unshift(k, midPointY);
          points.push(k, midPointY);
        }
        var px;
        var py;
        var p1x;
        var p1y;
        var p2x;
        var p2y;
        var p3x;
        var p3y;
        var perpx;
        var perpy;
        var perp2x;
        var perp2y;
        var perp3x;
        var perp3y;
        var a01;
        var a11;
        var a21;
        var a02;
        var a12;
        var a22;
        var denom;
        var F;
        var dist;
        var verts = webGLData.points;
        var indices = webGLData.indices;
        /** @type {number} */
        var phaseX = points.length / 2;
        var len = points.length;
        /** @type {number} */
        var indexStart = verts.length / 6;
        /** @type {number} */
        var width = graphicsData.lineWidth / 2;
        var color = PIXI.hex2rgb(graphicsData.lineColor);
        var alpha = graphicsData.lineAlpha;
        /** @type {number} */
        var r = color[0] * alpha;
        /** @type {number} */
        var g = color[1] * alpha;
        /** @type {number} */
        var b = color[2] * alpha;
        p1x = points[0];
        p1y = points[1];
        p2x = points[2];
        p2y = points[3];
        /** @type {number} */
        perpx = -(p1y - p2y);
        /** @type {number} */
        perpy = p1x - p2x;
        /** @type {number} */
        dist = Math.sqrt(perpx * perpx + perpy * perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;
        verts.push(p1x - perpx, p1y - perpy, r, g, b, alpha);
        verts.push(p1x + perpx, p1y + perpy, r, g, b, alpha);
        /** @type {number} */
        i = 1;
        for (;phaseX - 1 > i;i++) {
          p1x = points[2 * (i - 1)];
          p1y = points[2 * (i - 1) + 1];
          p2x = points[2 * i];
          p2y = points[2 * i + 1];
          p3x = points[2 * (i + 1)];
          p3y = points[2 * (i + 1) + 1];
          /** @type {number} */
          perpx = -(p1y - p2y);
          /** @type {number} */
          perpy = p1x - p2x;
          /** @type {number} */
          dist = Math.sqrt(perpx * perpx + perpy * perpy);
          perpx /= dist;
          perpy /= dist;
          perpx *= width;
          perpy *= width;
          /** @type {number} */
          perp2x = -(p2y - p3y);
          /** @type {number} */
          perp2y = p2x - p3x;
          /** @type {number} */
          dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
          perp2x /= dist;
          perp2y /= dist;
          perp2x *= width;
          perp2y *= width;
          /** @type {number} */
          a01 = -perpy + p1y - (-perpy + p2y);
          /** @type {number} */
          a11 = -perpx + p2x - (-perpx + p1x);
          /** @type {number} */
          a21 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
          /** @type {number} */
          a02 = -perp2y + p3y - (-perp2y + p2y);
          /** @type {number} */
          a12 = -perp2x + p2x - (-perp2x + p3x);
          /** @type {number} */
          a22 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);
          /** @type {number} */
          denom = a01 * a12 - a02 * a11;
          if (Math.abs(denom) < 0.1) {
            denom += 10.1;
            verts.push(p2x - perpx, p2y - perpy, r, g, b, alpha);
            verts.push(p2x + perpx, p2y + perpy, r, g, b, alpha);
          } else {
            /** @type {number} */
            px = (a11 * a22 - a12 * a21) / denom;
            /** @type {number} */
            py = (a02 * a21 - a01 * a22) / denom;
            /** @type {number} */
            F = (px - p2x) * (px - p2x) + (py - p2y) + (py - p2y);
            if (F > 19600) {
              /** @type {number} */
              perp3x = perpx - perp2x;
              /** @type {number} */
              perp3y = perpy - perp2y;
              /** @type {number} */
              dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y);
              perp3x /= dist;
              perp3y /= dist;
              perp3x *= width;
              perp3y *= width;
              verts.push(p2x - perp3x, p2y - perp3y);
              verts.push(r, g, b, alpha);
              verts.push(p2x + perp3x, p2y + perp3y);
              verts.push(r, g, b, alpha);
              verts.push(p2x - perp3x, p2y - perp3y);
              verts.push(r, g, b, alpha);
              len++;
            } else {
              verts.push(px, py);
              verts.push(r, g, b, alpha);
              verts.push(p2x - (px - p2x), p2y - (py - p2y));
              verts.push(r, g, b, alpha);
            }
          }
        }
        p1x = points[2 * (phaseX - 2)];
        p1y = points[2 * (phaseX - 2) + 1];
        p2x = points[2 * (phaseX - 1)];
        p2y = points[2 * (phaseX - 1) + 1];
        /** @type {number} */
        perpx = -(p1y - p2y);
        /** @type {number} */
        perpy = p1x - p2x;
        /** @type {number} */
        dist = Math.sqrt(perpx * perpx + perpy * perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;
        verts.push(p2x - perpx, p2y - perpy);
        verts.push(r, g, b, alpha);
        verts.push(p2x + perpx, p2y + perpy);
        verts.push(r, g, b, alpha);
        indices.push(indexStart);
        /** @type {number} */
        i = 0;
        for (;len > i;i++) {
          indices.push(indexStart++);
        }
        indices.push(indexStart - 1);
      }
    };
    /**
     * @param {Object} graphicsData
     * @param {Object} webGLData
     * @return {undefined}
     */
    PIXI.WebGLGraphics.buildPoly = function(graphicsData, webGLData) {
      var points = graphicsData.points;
      if (!(points.length < 6)) {
        var verts = webGLData.points;
        var assigns = webGLData.indices;
        /** @type {number} */
        var l = points.length / 2;
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;
        /** @type {number} */
        var r = color[0] * alpha;
        /** @type {number} */
        var g = color[1] * alpha;
        /** @type {number} */
        var b = color[2] * alpha;
        var codeSegments = PIXI.PolyK.Triangulate(points);
        /** @type {number} */
        var vvar = verts.length / 6;
        /** @type {number} */
        var i = 0;
        /** @type {number} */
        i = 0;
        for (;i < codeSegments.length;i += 3) {
          assigns.push(codeSegments[i] + vvar);
          assigns.push(codeSegments[i] + vvar);
          assigns.push(codeSegments[i + 1] + vvar);
          assigns.push(codeSegments[i + 2] + vvar);
          assigns.push(codeSegments[i + 2] + vvar);
        }
        /** @type {number} */
        i = 0;
        for (;l > i;i++) {
          verts.push(points[2 * i], points[2 * i + 1], r, g, b, alpha);
        }
      }
    };
    /** @type {Array} */
    PIXI.glContexts = [];
    /**
     * @param {(number|string)} width
     * @param {(number|string)} height
     * @param {(number|string)} view
     * @param {?} antialias
     * @param {?} transparent
     * @return {undefined}
     */
    PIXI.WebGLRenderer = function(width, height, view, antialias, transparent) {
      if (!PIXI.defaultRenderer) {
        PIXI.defaultRenderer = this;
      }
      /** @type {number} */
      this.type = PIXI.WEBGL_RENDERER;
      /** @type {boolean} */
      this.transparent = !!antialias;
      this.width = width || 800;
      this.height = height || 600;
      this.view = view || document.createElement("canvas");
      this.view.width = this.width;
      this.view.height = this.height;
      this.contextLost = this.handleContextLost.bind(this);
      this.contextRestoredLost = this.handleContextRestored.bind(this);
      this.view.addEventListener("webglcontextlost", this.contextLost, false);
      this.view.addEventListener("webglcontextrestored", this.contextRestoredLost, false);
      this.options = {
        alpha : this.transparent,
        antialias : !!transparent,
        premultipliedAlpha : !!antialias,
        stencil : true
      };
      try {
        this.gl = this.view.getContext("experimental-webgl", this.options);
      } catch (r) {
        try {
          this.gl = this.view.getContext("webgl", this.options);
        } catch (o) {
          throw new Error(" This browser does not support webGL. Try using the canvas renderer" + this);
        }
      }
      var gl = this.gl;
      /** @type {number} */
      this.glContextId = gl.id = PIXI.WebGLRenderer.glContextId++;
      PIXI.glContexts[this.glContextId] = gl;
      if (!PIXI.blendModesWebGL) {
        /** @type {Array} */
        PIXI.blendModesWebGL = [];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.ADD] = [gl.SRC_ALPHA, gl.DST_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.SCREEN] = [gl.SRC_ALPHA, gl.ONE];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        /** @type {Array} */
        PIXI.blendModesWebGL[PIXI.blendModes.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      }
      this.projection = new PIXI.Point;
      /** @type {number} */
      this.projection.x = this.width / 2;
      /** @type {number} */
      this.projection.y = -this.height / 2;
      this.offset = new PIXI.Point(0, 0);
      this.resize(this.width, this.height);
      /** @type {boolean} */
      this.contextLost = false;
      this.shaderManager = new PIXI.WebGLShaderManager(gl);
      this.spriteBatch = new PIXI.WebGLSpriteBatch(gl);
      this.maskManager = new PIXI.WebGLMaskManager(gl);
      this.filterManager = new PIXI.WebGLFilterManager(gl, this.transparent);
      this.renderSession = {};
      this.renderSession.gl = this.gl;
      /** @type {number} */
      this.renderSession.drawCount = 0;
      this.renderSession.shaderManager = this.shaderManager;
      this.renderSession.maskManager = this.maskManager;
      this.renderSession.filterManager = this.filterManager;
      this.renderSession.spriteBatch = this.spriteBatch;
      this.renderSession.renderer = this;
      gl.useProgram(this.shaderManager.defaultShader.program);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.colorMask(true, true, true, this.transparent);
    };
    /** @type {function ((number|string), (number|string), (number|string), ?, ?): undefined} */
    PIXI.WebGLRenderer.prototype.constructor = PIXI.WebGLRenderer;
    /**
     * @param {?} stage
     * @return {undefined}
     */
    PIXI.WebGLRenderer.prototype.render = function(stage) {
      if (!this.contextLost) {
        if (this.__stage !== stage) {
          if (stage.interactive) {
            stage.interactionManager.removeEvents();
          }
          this.__stage = stage;
        }
        PIXI.WebGLRenderer.updateTextures();
        stage.updateTransform();
        if (stage._interactive) {
          if (!stage._interactiveEventsAdded) {
            /** @type {boolean} */
            stage._interactiveEventsAdded = true;
            stage.interactionManager.setTarget(this);
          }
        }
        var gl = this.gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (this.transparent) {
          gl.clearColor(0, 0, 0, 0);
        } else {
          gl.clearColor(stage.backgroundColorSplit[0], stage.backgroundColorSplit[1], stage.backgroundColorSplit[2], 1);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.renderDisplayObject(stage, this.projection);
        if (stage.interactive) {
          if (!stage._interactiveEventsAdded) {
            /** @type {boolean} */
            stage._interactiveEventsAdded = true;
            stage.interactionManager.setTarget(this);
          }
        } else {
          if (stage._interactiveEventsAdded) {
            /** @type {boolean} */
            stage._interactiveEventsAdded = false;
            stage.interactionManager.setTarget(this);
          }
        }
      }
    };
    /**
     * @param {?} displayObject
     * @param {Function} a
     * @param {Object} deepDataAndEvents
     * @return {undefined}
     */
    PIXI.WebGLRenderer.prototype.renderDisplayObject = function(displayObject, a, deepDataAndEvents) {
      /** @type {number} */
      this.renderSession.drawCount = 0;
      /** @type {number} */
      this.renderSession.currentBlendMode = 9999;
      /** @type {Function} */
      this.renderSession.projection = a;
      this.renderSession.offset = this.offset;
      this.spriteBatch.begin(this.renderSession);
      this.filterManager.begin(this.renderSession, deepDataAndEvents);
      displayObject._renderWebGL(this.renderSession);
      this.spriteBatch.end();
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLRenderer.updateTextures = function() {
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      i = 0;
      for (;i < PIXI.Texture.frameUpdates.length;i++) {
        PIXI.WebGLRenderer.updateTextureFrame(PIXI.Texture.frameUpdates[i]);
      }
      /** @type {number} */
      i = 0;
      for (;i < PIXI.texturesToDestroy.length;i++) {
        PIXI.WebGLRenderer.destroyTexture(PIXI.texturesToDestroy[i]);
      }
      /** @type {number} */
      PIXI.texturesToUpdate.length = 0;
      /** @type {number} */
      PIXI.texturesToDestroy.length = 0;
      /** @type {number} */
      PIXI.Texture.frameUpdates.length = 0;
    };
    /**
     * @param {?} texture
     * @return {undefined}
     */
    PIXI.WebGLRenderer.destroyTexture = function(texture) {
      /** @type {number} */
      var i = texture._glTextures.length - 1;
      for (;i >= 0;i--) {
        var seg = texture._glTextures[i];
        var path = PIXI.glContexts[i];
        if (path) {
          if (seg) {
            path.deleteTexture(seg);
          }
        }
      }
      /** @type {number} */
      texture._glTextures.length = 0;
    };
    /**
     * @param {?} animation
     * @return {undefined}
     */
    PIXI.WebGLRenderer.updateTextureFrame = function(animation) {
      /** @type {boolean} */
      animation.updateFrame = false;
      animation._updateWebGLuvs();
    };
    /**
     * @param {?} width
     * @param {?} height
     * @return {undefined}
     */
    PIXI.WebGLRenderer.prototype.resize = function(width, height) {
      this.width = width;
      this.height = height;
      this.view.width = width;
      this.view.height = height;
      this.gl.viewport(0, 0, this.width, this.height);
      /** @type {number} */
      this.projection.x = this.width / 2;
      /** @type {number} */
      this.projection.y = -this.height / 2;
    };
    /**
     * @param {?} texture
     * @param {Object} gl
     * @return {?}
     */
    PIXI.createWebGLTexture = function(texture, gl) {
      return texture.hasLoaded && (texture._glTextures[gl.id] = gl.createTexture(), gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]), gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? 
      gl.LINEAR : gl.NEAREST), texture._powerOf2 ? (gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)) : (gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)), gl.bindTexture(gl.TEXTURE_2D, null)), texture._glTextures[gl.id];
    };
    /**
     * @param {?} texture
     * @param {Object} gl
     * @return {undefined}
     */
    PIXI.updateWebGLTexture = function(texture, gl) {
      if (texture._glTextures[gl.id]) {
        gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
        if (texture._powerOf2) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    };
    /**
     * @param {?} event
     * @return {undefined}
     */
    PIXI.WebGLRenderer.prototype.handleContextLost = function(event) {
      event.preventDefault();
      /** @type {boolean} */
      this.contextLost = true;
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLRenderer.prototype.handleContextRestored = function() {
      try {
        this.gl = this.view.getContext("experimental-webgl", this.options);
      } catch (e) {
        try {
          this.gl = this.view.getContext("webgl", this.options);
        } catch (i) {
          throw new Error(" This browser does not support webGL. Try using the canvas renderer" + this);
        }
      }
      var ctx = this.gl;
      /** @type {number} */
      ctx.id = PIXI.WebGLRenderer.glContextId++;
      this.shaderManager.setContext(ctx);
      this.spriteBatch.setContext(ctx);
      this.maskManager.setContext(ctx);
      this.filterManager.setContext(ctx);
      this.renderSession.gl = this.gl;
      ctx.disable(ctx.DEPTH_TEST);
      ctx.disable(ctx.CULL_FACE);
      ctx.enable(ctx.BLEND);
      ctx.colorMask(true, true, true, this.transparent);
      this.gl.viewport(0, 0, this.width, this.height);
      var key;
      for (key in PIXI.TextureCache) {
        var texture = PIXI.TextureCache[key].baseTexture;
        /** @type {Array} */
        texture._glTextures = [];
      }
      /** @type {boolean} */
      this.contextLost = false;
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLRenderer.prototype.destroy = function() {
      this.view.removeEventListener("webglcontextlost", this.contextLost);
      this.view.removeEventListener("webglcontextrestored", this.contextRestoredLost);
      /** @type {null} */
      PIXI.glContexts[this.glContextId] = null;
      /** @type {null} */
      this.projection = null;
      /** @type {null} */
      this.offset = null;
      this.shaderManager.destroy();
      this.spriteBatch.destroy();
      this.maskManager.destroy();
      this.filterManager.destroy();
      /** @type {null} */
      this.shaderManager = null;
      /** @type {null} */
      this.spriteBatch = null;
      /** @type {null} */
      this.maskManager = null;
      /** @type {null} */
      this.filterManager = null;
      /** @type {null} */
      this.gl = null;
      /** @type {null} */
      this.renderSession = null;
    };
    /** @type {number} */
    PIXI.WebGLRenderer.glContextId = 0;
    /**
     * @param {WebGLRenderingContext} tempCtx
     * @return {undefined}
     */
    PIXI.WebGLMaskManager = function(tempCtx) {
      /** @type {Array} */
      this.maskStack = [];
      /** @type {number} */
      this.maskPosition = 0;
      this.setContext(tempCtx);
    };
    /**
     * @param {WebGLRenderingContext} ctx
     * @return {undefined}
     */
    PIXI.WebGLMaskManager.prototype.setContext = function(ctx) {
      /** @type {WebGLRenderingContext} */
      this.gl = ctx;
    };
    /**
     * @param {?} displayObject
     * @param {CanvasRenderingContext2D} env
     * @return {undefined}
     */
    PIXI.WebGLMaskManager.prototype.pushMask = function(displayObject, env) {
      var context = this.gl;
      if (0 === this.maskStack.length) {
        context.enable(context.STENCIL_TEST);
        context.stencilFunc(context.ALWAYS, 1, 1);
      }
      this.maskStack.push(displayObject);
      context.colorMask(false, false, false, false);
      context.stencilOp(context.KEEP, context.KEEP, context.INCR);
      PIXI.WebGLGraphics.renderGraphics(displayObject, env);
      context.colorMask(true, true, true, true);
      context.stencilFunc(context.NOTEQUAL, 0, this.maskStack.length);
      context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
    };
    /**
     * @param {CanvasRenderingContext2D} env
     * @return {undefined}
     */
    PIXI.WebGLMaskManager.prototype.popMask = function(env) {
      var context = this.gl;
      var graphics = this.maskStack.pop();
      if (graphics) {
        context.colorMask(false, false, false, false);
        context.stencilOp(context.KEEP, context.KEEP, context.DECR);
        PIXI.WebGLGraphics.renderGraphics(graphics, env);
        context.colorMask(true, true, true, true);
        context.stencilFunc(context.NOTEQUAL, 0, this.maskStack.length);
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
      }
      if (0 === this.maskStack.length) {
        context.disable(context.STENCIL_TEST);
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLMaskManager.prototype.destroy = function() {
      /** @type {null} */
      this.maskStack = null;
      /** @type {null} */
      this.gl = null;
    };
    /**
     * @param {WebGLRenderingContext} tempCtx
     * @return {undefined}
     */
    PIXI.WebGLShaderManager = function(tempCtx) {
      /** @type {number} */
      this.maxAttibs = 10;
      /** @type {Array} */
      this.attribState = [];
      /** @type {Array} */
      this.tempAttribState = [];
      /** @type {number} */
      var unlock = 0;
      for (;unlock < this.maxAttibs;unlock++) {
        /** @type {boolean} */
        this.attribState[unlock] = false;
      }
      this.setContext(tempCtx);
    };
    /**
     * @param {WebGLRenderingContext} ctx
     * @return {undefined}
     */
    PIXI.WebGLShaderManager.prototype.setContext = function(ctx) {
      /** @type {WebGLRenderingContext} */
      this.gl = ctx;
      this.primitiveShader = new PIXI.PrimitiveShader(ctx);
      this.defaultShader = new PIXI.PixiShader(ctx);
      this.fastShader = new PIXI.PixiFastShader(ctx);
      this.activateShader(this.defaultShader);
    };
    /**
     * @param {Array} ca
     * @return {undefined}
     */
    PIXI.WebGLShaderManager.prototype.setAttribs = function(ca) {
      var i;
      /** @type {number} */
      i = 0;
      for (;i < this.tempAttribState.length;i++) {
        /** @type {boolean} */
        this.tempAttribState[i] = false;
      }
      /** @type {number} */
      i = 0;
      for (;i < ca.length;i++) {
        var c = ca[i];
        /** @type {boolean} */
        this.tempAttribState[c] = true;
      }
      var gl = this.gl;
      /** @type {number} */
      i = 0;
      for (;i < this.attribState.length;i++) {
        if (this.attribState[i] !== this.tempAttribState[i]) {
          this.attribState[i] = this.tempAttribState[i];
          if (this.tempAttribState[i]) {
            gl.enableVertexAttribArray(i);
          } else {
            gl.disableVertexAttribArray(i);
          }
        }
      }
    };
    /**
     * @param {?} shader
     * @return {undefined}
     */
    PIXI.WebGLShaderManager.prototype.activateShader = function(shader) {
      this.currentShader = shader;
      this.gl.useProgram(shader.program);
      this.setAttribs(shader.attributes);
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLShaderManager.prototype.activatePrimitiveShader = function() {
      var gl = this.gl;
      gl.useProgram(this.primitiveShader.program);
      this.setAttribs(this.primitiveShader.attributes);
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLShaderManager.prototype.deactivatePrimitiveShader = function() {
      var gl = this.gl;
      gl.useProgram(this.defaultShader.program);
      this.setAttribs(this.defaultShader.attributes);
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLShaderManager.prototype.destroy = function() {
      /** @type {null} */
      this.attribState = null;
      /** @type {null} */
      this.tempAttribState = null;
      this.primitiveShader.destroy();
      this.defaultShader.destroy();
      this.fastShader.destroy();
      /** @type {null} */
      this.gl = null;
    };
    /**
     * @param {WebGLRenderingContext} tempCtx
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch = function(tempCtx) {
      /** @type {number} */
      this.vertSize = 6;
      /** @type {number} */
      this.size = 2E3;
      /** @type {number} */
      var data = 4 * this.size * this.vertSize;
      /** @type {number} */
      var size = 6 * this.size;
      /** @type {Float32Array} */
      this.vertices = new Float32Array(data);
      /** @type {Uint16Array} */
      this.indices = new Uint16Array(size);
      /** @type {number} */
      this.lastIndexCount = 0;
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      var j = 0;
      for (;size > i;i += 6, j += 4) {
        /** @type {number} */
        this.indices[i + 0] = j + 0;
        /** @type {number} */
        this.indices[i + 1] = j + 1;
        /** @type {number} */
        this.indices[i + 2] = j + 2;
        /** @type {number} */
        this.indices[i + 3] = j + 0;
        /** @type {number} */
        this.indices[i + 4] = j + 2;
        /** @type {number} */
        this.indices[i + 5] = j + 3;
      }
      /** @type {boolean} */
      this.drawing = false;
      /** @type {number} */
      this.currentBatchSize = 0;
      /** @type {null} */
      this.currentBaseTexture = null;
      this.setContext(tempCtx);
    };
    /**
     * @param {WebGLRenderingContext} ctx
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.setContext = function(ctx) {
      /** @type {WebGLRenderingContext} */
      this.gl = ctx;
      this.vertexBuffer = ctx.createBuffer();
      this.indexBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this.indices, ctx.STATIC_DRAW);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, this.vertices, ctx.DYNAMIC_DRAW);
      /** @type {number} */
      this.currentBlendMode = 99999;
    };
    /**
     * @param {string} condition
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.begin = function(condition) {
      /** @type {string} */
      this.renderSession = condition;
      this.shader = this.renderSession.shaderManager.defaultShader;
      this.start();
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.end = function() {
      this.flush();
    };
    /**
     * @param {Object} displayObject
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.render = function(displayObject) {
      var texture = displayObject.texture;
      if (texture.baseTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size) {
        this.flush();
        this.currentBaseTexture = texture.baseTexture;
      }
      if (displayObject.blendMode !== this.currentBlendMode) {
        this.setBlendMode(displayObject.blendMode);
      }
      var other = displayObject._uvs || displayObject.texture._uvs;
      if (other) {
        var b03;
        var b00;
        var b13;
        var b10;
        var children = displayObject.worldAlpha;
        var lastObject = displayObject.tint;
        var pos = this.vertices;
        var scaleX = displayObject.anchor.x;
        var scaleY = displayObject.anchor.y;
        if (displayObject.texture.trim) {
          var img = displayObject.texture.trim;
          /** @type {number} */
          b00 = img.x - scaleX * img.width;
          b03 = b00 + texture.frame.width;
          /** @type {number} */
          b10 = img.y - scaleY * img.height;
          b13 = b10 + texture.frame.height;
        } else {
          /** @type {number} */
          b03 = texture.frame.width * (1 - scaleX);
          /** @type {number} */
          b00 = texture.frame.width * -scaleX;
          /** @type {number} */
          b13 = texture.frame.height * (1 - scaleY);
          /** @type {number} */
          b10 = texture.frame.height * -scaleY;
        }
        /** @type {number} */
        var vertSize = 4 * this.currentBatchSize * this.vertSize;
        var worldTransform = displayObject.worldTransform;
        var a00 = worldTransform.a;
        var a10 = worldTransform.c;
        var a01 = worldTransform.b;
        var a11 = worldTransform.d;
        var a02 = worldTransform.tx;
        var a12 = worldTransform.ty;
        pos[vertSize++] = a00 * b00 + a01 * b10 + a02;
        pos[vertSize++] = a11 * b10 + a10 * b00 + a12;
        pos[vertSize++] = other.x0;
        pos[vertSize++] = other.y0;
        pos[vertSize++] = children;
        pos[vertSize++] = lastObject;
        pos[vertSize++] = a00 * b03 + a01 * b10 + a02;
        pos[vertSize++] = a11 * b10 + a10 * b03 + a12;
        pos[vertSize++] = other.x1;
        pos[vertSize++] = other.y1;
        pos[vertSize++] = children;
        pos[vertSize++] = lastObject;
        pos[vertSize++] = a00 * b03 + a01 * b13 + a02;
        pos[vertSize++] = a11 * b13 + a10 * b03 + a12;
        pos[vertSize++] = other.x2;
        pos[vertSize++] = other.y2;
        pos[vertSize++] = children;
        pos[vertSize++] = lastObject;
        pos[vertSize++] = a00 * b00 + a01 * b13 + a02;
        pos[vertSize++] = a11 * b13 + a10 * b00 + a12;
        pos[vertSize++] = other.x3;
        pos[vertSize++] = other.y3;
        pos[vertSize++] = children;
        pos[vertSize++] = lastObject;
        this.currentBatchSize++;
      }
    };
    /**
     * @param {Object} sprite
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.renderTilingSprite = function(sprite) {
      var texture = sprite.tilingTexture;
      if (texture.baseTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size) {
        this.flush();
        this.currentBaseTexture = texture.baseTexture;
      }
      if (sprite.blendMode !== this.currentBlendMode) {
        this.setBlendMode(sprite.blendMode);
      }
      if (!sprite._uvs) {
        sprite._uvs = new PIXI.TextureUvs;
      }
      var other = sprite._uvs;
      sprite.tilePosition.x %= texture.baseTexture.width * sprite.tileScaleOffset.x;
      sprite.tilePosition.y %= texture.baseTexture.height * sprite.tileScaleOffset.y;
      /** @type {number} */
      var q = sprite.tilePosition.x / (texture.baseTexture.width * sprite.tileScaleOffset.x);
      /** @type {number} */
      var y2 = sprite.tilePosition.y / (texture.baseTexture.height * sprite.tileScaleOffset.y);
      /** @type {number} */
      var l = sprite.width / texture.baseTexture.width / (sprite.tileScale.x * sprite.tileScaleOffset.x);
      /** @type {number} */
      var x2 = sprite.height / texture.baseTexture.height / (sprite.tileScale.y * sprite.tileScaleOffset.y);
      /** @type {number} */
      other.x0 = 0 - q;
      /** @type {number} */
      other.y0 = 0 - y2;
      /** @type {number} */
      other.x1 = 1 * l - q;
      /** @type {number} */
      other.y1 = 0 - y2;
      /** @type {number} */
      other.x2 = 1 * l - q;
      /** @type {number} */
      other.y2 = 1 * x2 - y2;
      /** @type {number} */
      other.x3 = 0 - q;
      /** @type {number} */
      other.y3 = 1 * x2 - y2;
      var attr = sprite.worldAlpha;
      var element = sprite.tint;
      var data = this.vertices;
      var width = sprite.width;
      var height = sprite.height;
      var percentage = sprite.anchor.x;
      var posY = sprite.anchor.y;
      /** @type {number} */
      var b00 = width * (1 - percentage);
      /** @type {number} */
      var b03 = width * -percentage;
      /** @type {number} */
      var b10 = height * (1 - posY);
      /** @type {number} */
      var b13 = height * -posY;
      /** @type {number} */
      var j = 4 * this.currentBatchSize * this.vertSize;
      var worldTransform = sprite.worldTransform;
      var a00 = worldTransform.a;
      var a10 = worldTransform.c;
      var a01 = worldTransform.b;
      var a11 = worldTransform.d;
      var a02 = worldTransform.tx;
      var a12 = worldTransform.ty;
      data[j++] = a00 * b03 + a01 * b13 + a02;
      data[j++] = a11 * b13 + a10 * b03 + a12;
      /** @type {number} */
      data[j++] = other.x0;
      /** @type {number} */
      data[j++] = other.y0;
      data[j++] = attr;
      data[j++] = element;
      data[j++] = a00 * b00 + a01 * b13 + a02;
      data[j++] = a11 * b13 + a10 * b00 + a12;
      /** @type {number} */
      data[j++] = other.x1;
      /** @type {number} */
      data[j++] = other.y1;
      data[j++] = attr;
      data[j++] = element;
      data[j++] = a00 * b00 + a01 * b10 + a02;
      data[j++] = a11 * b10 + a10 * b00 + a12;
      /** @type {number} */
      data[j++] = other.x2;
      /** @type {number} */
      data[j++] = other.y2;
      data[j++] = attr;
      data[j++] = element;
      data[j++] = a00 * b03 + a01 * b10 + a02;
      data[j++] = a11 * b10 + a10 * b03 + a12;
      /** @type {number} */
      data[j++] = other.x3;
      /** @type {number} */
      data[j++] = other.y3;
      data[j++] = attr;
      data[j++] = element;
      this.currentBatchSize++;
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.flush = function() {
      if (0 !== this.currentBatchSize) {
        var gl = this.gl;
        if (gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.currentBaseTexture, gl)), this.currentBatchSize > 0.5 * this.size) {
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        } else {
          var singleParticleArray = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, singleParticleArray);
        }
        gl.drawElements(gl.TRIANGLES, 6 * this.currentBatchSize, gl.UNSIGNED_SHORT, 0);
        /** @type {number} */
        this.currentBatchSize = 0;
        this.renderSession.drawCount++;
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.stop = function() {
      this.flush();
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.start = function() {
      var gl = this.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      var projection = this.renderSession.projection;
      gl.uniform2f(this.shader.projectionVector, projection.x, projection.y);
      /** @type {number} */
      var stride = 4 * this.vertSize;
      gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, false, stride, 8);
      gl.vertexAttribPointer(this.shader.colorAttribute, 2, gl.FLOAT, false, stride, 16);
      if (this.currentBlendMode !== PIXI.blendModes.NORMAL) {
        this.setBlendMode(PIXI.blendModes.NORMAL);
      }
    };
    /**
     * @param {Function} dataAndEvents
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.setBlendMode = function(dataAndEvents) {
      this.flush();
      /** @type {Function} */
      this.currentBlendMode = dataAndEvents;
      var gl = PIXI.blendModesWebGL[this.currentBlendMode];
      this.gl.blendFunc(gl[0], gl[1]);
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLSpriteBatch.prototype.destroy = function() {
      /** @type {null} */
      this.vertices = null;
      /** @type {null} */
      this.indices = null;
      this.gl.deleteBuffer(this.vertexBuffer);
      this.gl.deleteBuffer(this.indexBuffer);
      /** @type {null} */
      this.currentBaseTexture = null;
      /** @type {null} */
      this.gl = null;
    };
    /**
     * @param {WebGLRenderingContext} tempCtx
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch = function(tempCtx) {
      /** @type {number} */
      this.vertSize = 10;
      /** @type {number} */
      this.maxSize = 6E3;
      /** @type {number} */
      this.size = this.maxSize;
      /** @type {number} */
      var data = 4 * this.size * this.vertSize;
      /** @type {number} */
      var val = 6 * this.maxSize;
      /** @type {Float32Array} */
      this.vertices = new Float32Array(data);
      /** @type {Uint16Array} */
      this.indices = new Uint16Array(val);
      /** @type {null} */
      this.vertexBuffer = null;
      /** @type {null} */
      this.indexBuffer = null;
      /** @type {number} */
      this.lastIndexCount = 0;
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      var j = 0;
      for (;val > i;i += 6, j += 4) {
        /** @type {number} */
        this.indices[i + 0] = j + 0;
        /** @type {number} */
        this.indices[i + 1] = j + 1;
        /** @type {number} */
        this.indices[i + 2] = j + 2;
        /** @type {number} */
        this.indices[i + 3] = j + 0;
        /** @type {number} */
        this.indices[i + 4] = j + 2;
        /** @type {number} */
        this.indices[i + 5] = j + 3;
      }
      /** @type {boolean} */
      this.drawing = false;
      /** @type {number} */
      this.currentBatchSize = 0;
      /** @type {null} */
      this.currentBaseTexture = null;
      /** @type {number} */
      this.currentBlendMode = 0;
      /** @type {null} */
      this.renderSession = null;
      /** @type {null} */
      this.shader = null;
      /** @type {null} */
      this.matrix = null;
      this.setContext(tempCtx);
    };
    /**
     * @param {WebGLRenderingContext} ctx
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.setContext = function(ctx) {
      /** @type {WebGLRenderingContext} */
      this.gl = ctx;
      this.vertexBuffer = ctx.createBuffer();
      this.indexBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this.indices, ctx.STATIC_DRAW);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, this.vertexBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, this.vertices, ctx.DYNAMIC_DRAW);
      /** @type {number} */
      this.currentBlendMode = 99999;
    };
    /**
     * @param {?} condition
     * @param {Object} deepDataAndEvents
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.begin = function(condition, deepDataAndEvents) {
      /** @type {Object} */
      this.renderSession = deepDataAndEvents;
      this.shader = this.renderSession.shaderManager.fastShader;
      this.matrix = condition.worldTransform.toArray(true);
      this.start();
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.end = function() {
      this.flush();
    };
    /**
     * @param {?} scene
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.render = function(scene) {
      var objects = scene.children;
      var obj = objects[0];
      if (obj.texture._uvs) {
        this.currentBaseTexture = obj.texture.baseTexture;
        if (obj.blendMode !== this.currentBlendMode) {
          this.setBlendMode(obj.blendMode);
        }
        /** @type {number} */
        var i = 0;
        var l = objects.length;
        for (;l > i;i++) {
          this.renderSprite(objects[i]);
        }
        this.flush();
      }
    };
    /**
     * @param {Object} sprite
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.renderSprite = function(sprite) {
      if (sprite.visible && (sprite.texture.baseTexture === this.currentBaseTexture || (this.flush(), this.currentBaseTexture = sprite.texture.baseTexture, sprite.texture._uvs))) {
        var other;
        var originalWidth;
        var vheight;
        var k;
        var y;
        var j;
        var position;
        var vertSize;
        var vertices = this.vertices;
        if (other = sprite.texture._uvs, originalWidth = sprite.texture.frame.width, vheight = sprite.texture.frame.height, sprite.texture.trim) {
          var size = sprite.texture.trim;
          /** @type {number} */
          y = size.x - sprite.anchor.x * size.width;
          k = y + sprite.texture.frame.width;
          /** @type {number} */
          position = size.y - sprite.anchor.y * size.height;
          j = position + sprite.texture.frame.height;
        } else {
          /** @type {number} */
          k = sprite.texture.frame.width * (1 - sprite.anchor.x);
          /** @type {number} */
          y = sprite.texture.frame.width * -sprite.anchor.x;
          /** @type {number} */
          j = sprite.texture.frame.height * (1 - sprite.anchor.y);
          /** @type {number} */
          position = sprite.texture.frame.height * -sprite.anchor.y;
        }
        /** @type {number} */
        vertSize = 4 * this.currentBatchSize * this.vertSize;
        /** @type {number} */
        vertices[vertSize++] = y;
        /** @type {number} */
        vertices[vertSize++] = position;
        vertices[vertSize++] = sprite.position.x;
        vertices[vertSize++] = sprite.position.y;
        vertices[vertSize++] = sprite.scale.x;
        vertices[vertSize++] = sprite.scale.y;
        vertices[vertSize++] = sprite.rotation;
        vertices[vertSize++] = other.x0;
        vertices[vertSize++] = other.y1;
        vertices[vertSize++] = sprite.alpha;
        vertices[vertSize++] = k;
        /** @type {number} */
        vertices[vertSize++] = position;
        vertices[vertSize++] = sprite.position.x;
        vertices[vertSize++] = sprite.position.y;
        vertices[vertSize++] = sprite.scale.x;
        vertices[vertSize++] = sprite.scale.y;
        vertices[vertSize++] = sprite.rotation;
        vertices[vertSize++] = other.x1;
        vertices[vertSize++] = other.y1;
        vertices[vertSize++] = sprite.alpha;
        vertices[vertSize++] = k;
        vertices[vertSize++] = j;
        vertices[vertSize++] = sprite.position.x;
        vertices[vertSize++] = sprite.position.y;
        vertices[vertSize++] = sprite.scale.x;
        vertices[vertSize++] = sprite.scale.y;
        vertices[vertSize++] = sprite.rotation;
        vertices[vertSize++] = other.x2;
        vertices[vertSize++] = other.y2;
        vertices[vertSize++] = sprite.alpha;
        /** @type {number} */
        vertices[vertSize++] = y;
        vertices[vertSize++] = j;
        vertices[vertSize++] = sprite.position.x;
        vertices[vertSize++] = sprite.position.y;
        vertices[vertSize++] = sprite.scale.x;
        vertices[vertSize++] = sprite.scale.y;
        vertices[vertSize++] = sprite.rotation;
        vertices[vertSize++] = other.x3;
        vertices[vertSize++] = other.y3;
        vertices[vertSize++] = sprite.alpha;
        this.currentBatchSize++;
        if (this.currentBatchSize >= this.size) {
          this.flush();
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.flush = function() {
      if (0 !== this.currentBatchSize) {
        var gl = this.gl;
        if (this.currentBaseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.currentBaseTexture, gl), gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id]), this.currentBatchSize > 0.5 * this.size) {
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        } else {
          var singleParticleArray = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, singleParticleArray);
        }
        gl.drawElements(gl.TRIANGLES, 6 * this.currentBatchSize, gl.UNSIGNED_SHORT, 0);
        /** @type {number} */
        this.currentBatchSize = 0;
        this.renderSession.drawCount++;
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.stop = function() {
      this.flush();
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.start = function() {
      var gl = this.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      var projection = this.renderSession.projection;
      gl.uniform2f(this.shader.projectionVector, projection.x, projection.y);
      gl.uniformMatrix3fv(this.shader.uMatrix, false, this.matrix);
      /** @type {number} */
      var stride = 4 * this.vertSize;
      gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(this.shader.aPositionCoord, 2, gl.FLOAT, false, stride, 8);
      gl.vertexAttribPointer(this.shader.aScale, 2, gl.FLOAT, false, stride, 16);
      gl.vertexAttribPointer(this.shader.aRotation, 1, gl.FLOAT, false, stride, 24);
      gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, false, stride, 28);
      gl.vertexAttribPointer(this.shader.colorAttribute, 1, gl.FLOAT, false, stride, 36);
      if (this.currentBlendMode !== PIXI.blendModes.NORMAL) {
        this.setBlendMode(PIXI.blendModes.NORMAL);
      }
    };
    /**
     * @param {Function} dataAndEvents
     * @return {undefined}
     */
    PIXI.WebGLFastSpriteBatch.prototype.setBlendMode = function(dataAndEvents) {
      this.flush();
      /** @type {Function} */
      this.currentBlendMode = dataAndEvents;
      var gl = PIXI.blendModesWebGL[this.currentBlendMode];
      this.gl.blendFunc(gl[0], gl[1]);
    };
    /**
     * @param {WebGLRenderingContext} tempCtx
     * @param {number} transparent
     * @return {undefined}
     */
    PIXI.WebGLFilterManager = function(tempCtx, transparent) {
      /** @type {number} */
      this.transparent = transparent;
      /** @type {Array} */
      this.filterStack = [];
      /** @type {number} */
      this.offsetX = 0;
      /** @type {number} */
      this.offsetY = 0;
      this.setContext(tempCtx);
    };
    /**
     * @param {WebGLRenderingContext} ctx
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.setContext = function(ctx) {
      /** @type {WebGLRenderingContext} */
      this.gl = ctx;
      /** @type {Array} */
      this.texturePool = [];
      this.initShaderBuffers();
    };
    /**
     * @param {string} condition
     * @param {Object} deepDataAndEvents
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.begin = function(condition, deepDataAndEvents) {
      /** @type {string} */
      this.renderSession = condition;
      this.defaultShader = condition.shaderManager.defaultShader;
      var projection = this.renderSession.projection;
      /** @type {number} */
      this.width = 2 * projection.x;
      /** @type {number} */
      this.height = 2 * -projection.y;
      /** @type {Object} */
      this.buffer = deepDataAndEvents;
    };
    /**
     * @param {?} e
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.pushFilter = function(e) {
      var gl = this.gl;
      var projection = this.renderSession.projection;
      var pos = this.renderSession.offset;
      e._filterArea = e.target.filterArea || e.target.getBounds();
      this.filterStack.push(e);
      var attr = e.filterPasses[0];
      this.offsetX += e._filterArea.x;
      this.offsetY += e._filterArea.y;
      var self = this.texturePool.pop();
      if (self) {
        self.resize(this.width, this.height);
      } else {
        self = new PIXI.FilterTexture(this.gl, this.width, this.height);
      }
      gl.bindTexture(gl.TEXTURE_2D, self.texture);
      var canvas = e._filterArea;
      var x = attr.padding;
      canvas.x -= x;
      canvas.y -= x;
      canvas.width += 2 * x;
      canvas.height += 2 * x;
      if (canvas.x < 0) {
        /** @type {number} */
        canvas.x = 0;
      }
      if (canvas.width > this.width) {
        canvas.width = this.width;
      }
      if (canvas.y < 0) {
        /** @type {number} */
        canvas.y = 0;
      }
      if (canvas.height > this.height) {
        canvas.height = this.height;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, self.frameBuffer);
      gl.viewport(0, 0, canvas.width, canvas.height);
      /** @type {number} */
      projection.x = canvas.width / 2;
      /** @type {number} */
      projection.y = -canvas.height / 2;
      /** @type {number} */
      pos.x = -canvas.x;
      /** @type {number} */
      pos.y = -canvas.y;
      gl.uniform2f(this.defaultShader.projectionVector, canvas.width / 2, -canvas.height / 2);
      gl.uniform2f(this.defaultShader.offsetVector, -canvas.x, -canvas.y);
      gl.colorMask(true, true, true, true);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      e._glFilterTexture = self;
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.popFilter = function() {
      var gl = this.gl;
      var G = this.filterStack.pop();
      var viewport = G._filterArea;
      var target = G._glFilterTexture;
      var projection = this.renderSession.projection;
      var offset = this.renderSession.offset;
      if (G.filterPasses.length > 1) {
        gl.viewport(0, 0, viewport.width, viewport.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        /** @type {number} */
        this.vertexArray[0] = 0;
        this.vertexArray[1] = viewport.height;
        this.vertexArray[2] = viewport.width;
        this.vertexArray[3] = viewport.height;
        /** @type {number} */
        this.vertexArray[4] = 0;
        /** @type {number} */
        this.vertexArray[5] = 0;
        this.vertexArray[6] = viewport.width;
        /** @type {number} */
        this.vertexArray[7] = 0;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        /** @type {number} */
        this.uvArray[2] = viewport.width / this.width;
        /** @type {number} */
        this.uvArray[5] = viewport.height / this.height;
        /** @type {number} */
        this.uvArray[6] = viewport.width / this.width;
        /** @type {number} */
        this.uvArray[7] = viewport.height / this.height;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
        var value = target;
        var tile = this.texturePool.pop();
        if (!tile) {
          tile = new PIXI.FilterTexture(this.gl, this.width, this.height);
        }
        tile.resize(this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, tile.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.BLEND);
        /** @type {number} */
        var typeUri = 0;
        for (;typeUri < G.filterPasses.length - 1;typeUri++) {
          var pdataCur = G.filterPasses[typeUri];
          gl.bindFramebuffer(gl.FRAMEBUFFER, tile.frameBuffer);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, value.texture);
          this.applyFilterPass(pdataCur, viewport, viewport.width, viewport.height);
          var t = value;
          value = tile;
          tile = t;
        }
        gl.enable(gl.BLEND);
        target = value;
        this.texturePool.push(tile);
      }
      var udataCur = G.filterPasses[G.filterPasses.length - 1];
      this.offsetX -= viewport.x;
      this.offsetY -= viewport.y;
      var width = this.width;
      var height = this.height;
      /** @type {number} */
      var offsetX = 0;
      /** @type {number} */
      var offsetY = 0;
      var frameBuffer = this.buffer;
      if (0 === this.filterStack.length) {
        gl.colorMask(true, true, true, true);
      } else {
        var data = this.filterStack[this.filterStack.length - 1];
        viewport = data._filterArea;
        width = viewport.width;
        height = viewport.height;
        offsetX = viewport.x;
        offsetY = viewport.y;
        frameBuffer = data._glFilterTexture.frameBuffer;
      }
      /** @type {number} */
      projection.x = width / 2;
      /** @type {number} */
      projection.y = -height / 2;
      offset.x = offsetX;
      offset.y = offsetY;
      viewport = G._filterArea;
      /** @type {number} */
      var x = viewport.x - offsetX;
      /** @type {number} */
      var y = viewport.y - offsetY;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      /** @type {number} */
      this.vertexArray[0] = x;
      this.vertexArray[1] = y + viewport.height;
      this.vertexArray[2] = x + viewport.width;
      this.vertexArray[3] = y + viewport.height;
      /** @type {number} */
      this.vertexArray[4] = x;
      /** @type {number} */
      this.vertexArray[5] = y;
      this.vertexArray[6] = x + viewport.width;
      /** @type {number} */
      this.vertexArray[7] = y;
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      /** @type {number} */
      this.uvArray[2] = viewport.width / this.width;
      /** @type {number} */
      this.uvArray[5] = viewport.height / this.height;
      /** @type {number} */
      this.uvArray[6] = viewport.width / this.width;
      /** @type {number} */
      this.uvArray[7] = viewport.height / this.height;
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
      gl.viewport(0, 0, width, height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);
      this.applyFilterPass(udataCur, viewport, width, height);
      gl.useProgram(this.defaultShader.program);
      gl.uniform2f(this.defaultShader.projectionVector, width / 2, -height / 2);
      gl.uniform2f(this.defaultShader.offsetVector, -offsetX, -offsetY);
      this.texturePool.push(target);
      /** @type {null} */
      G._glFilterTexture = null;
    };
    /**
     * @param {?} data
     * @param {?} opt_viewport
     * @param {number} a
     * @param {?} val1
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.applyFilterPass = function(data, opt_viewport, a, val1) {
      var gl = this.gl;
      var program = data.shaders[gl.id];
      if (!program) {
        program = new PIXI.PixiShader(gl);
        program.fragmentSrc = data.fragmentSrc;
        program.uniforms = data.uniforms;
        program.init();
        data.shaders[gl.id] = program;
      }
      gl.useProgram(program.program);
      gl.uniform2f(program.projectionVector, a / 2, -val1 / 2);
      gl.uniform2f(program.offsetVector, 0, 0);
      if (data.uniforms.dimensions) {
        data.uniforms.dimensions.value[0] = this.width;
        data.uniforms.dimensions.value[1] = this.height;
        data.uniforms.dimensions.value[2] = this.vertexArray[0];
        data.uniforms.dimensions.value[3] = this.vertexArray[5];
      }
      program.syncUniforms();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(program.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.vertexAttribPointer(program.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.vertexAttribPointer(program.colorAttribute, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      this.renderSession.drawCount++;
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.initShaderBuffers = function() {
      var gl = this.gl;
      this.vertexBuffer = gl.createBuffer();
      this.uvBuffer = gl.createBuffer();
      this.colorBuffer = gl.createBuffer();
      this.indexBuffer = gl.createBuffer();
      /** @type {Float32Array} */
      this.vertexArray = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
      /** @type {Float32Array} */
      this.uvArray = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvArray, gl.STATIC_DRAW);
      /** @type {Float32Array} */
      this.colorArray = new Float32Array([1, 16777215, 1, 16777215, 1, 16777215, 1, 16777215]);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 1, 3, 2]), gl.STATIC_DRAW);
    };
    /**
     * @return {undefined}
     */
    PIXI.WebGLFilterManager.prototype.destroy = function() {
      var gl = this.gl;
      /** @type {null} */
      this.filterStack = null;
      /** @type {number} */
      this.offsetX = 0;
      /** @type {number} */
      this.offsetY = 0;
      /** @type {number} */
      var characterPosition = 0;
      for (;characterPosition < this.texturePool.length;characterPosition++) {
        this.texturePool.destroy();
      }
      /** @type {null} */
      this.texturePool = null;
      gl.deleteBuffer(this.vertexBuffer);
      gl.deleteBuffer(this.uvBuffer);
      gl.deleteBuffer(this.colorBuffer);
      gl.deleteBuffer(this.indexBuffer);
    };
    /**
     * @param {WebGLRenderingContext} gl
     * @param {number} w
     * @param {?} sy
     * @param {number} type
     * @return {undefined}
     */
    PIXI.FilterTexture = function(gl, w, sy, type) {
      /** @type {WebGLRenderingContext} */
      this.gl = gl;
      this.frameBuffer = gl.createFramebuffer();
      this.texture = gl.createTexture();
      type = type || PIXI.scaleModes.DEFAULT;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, type === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, type === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
      this.renderBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
      this.resize(w, sy);
    };
    /**
     * @return {undefined}
     */
    PIXI.FilterTexture.prototype.clear = function() {
      var gl = this.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    /**
     * @param {number} width
     * @param {?} height
     * @return {undefined}
     */
    PIXI.FilterTexture.prototype.resize = function(width, height) {
      if (this.width !== width || this.height !== height) {
        /** @type {number} */
        this.width = width;
        this.height = height;
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.FilterTexture.prototype.destroy = function() {
      var gl = this.gl;
      gl.deleteFramebuffer(this.frameBuffer);
      gl.deleteTexture(this.texture);
      /** @type {null} */
      this.frameBuffer = null;
      /** @type {null} */
      this.texture = null;
    };
    /**
     * @return {undefined}
     */
    PIXI.CanvasMaskManager = function() {
    };
    /**
     * @param {?} graphics
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.CanvasMaskManager.prototype.pushMask = function(graphics, context) {
      context.save();
      var cacheAlpha = graphics.alpha;
      var m = graphics.worldTransform;
      context.setTransform(m.a, m.c, m.b, m.d, m.tx, m.ty);
      PIXI.CanvasGraphics.renderGraphicsMask(graphics, context);
      context.clip();
      graphics.worldAlpha = cacheAlpha;
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.CanvasMaskManager.prototype.popMask = function(context) {
      context.restore();
    };
    /**
     * @return {undefined}
     */
    PIXI.CanvasTinter = function() {
    };
    /**
     * @param {Object} target
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    PIXI.CanvasTinter.getTintedTexture = function(target, deepDataAndEvents) {
      var tex = target.texture;
      deepDataAndEvents = PIXI.CanvasTinter.roundColor(deepDataAndEvents);
      /** @type {string} */
      var key = "#" + ("00000" + (0 | deepDataAndEvents).toString(16)).substr(-6);
      if (tex.tintCache = tex.tintCache || {}, tex.tintCache[key]) {
        return tex.tintCache[key];
      }
      var canvas = PIXI.CanvasTinter.canvas || document.createElement("canvas");
      if (PIXI.CanvasTinter.tintMethod(tex, deepDataAndEvents, canvas), PIXI.CanvasTinter.convertTintToImage) {
        /** @type {Image} */
        var t = new Image;
        t.src = canvas.toDataURL();
        /** @type {Image} */
        tex.tintCache[key] = t;
      } else {
        tex.tintCache[key] = canvas;
        /** @type {null} */
        PIXI.CanvasTinter.canvas = null;
      }
      return canvas;
    };
    /**
     * @param {Object} tex
     * @param {number} deepDataAndEvents
     * @param {HTMLCanvasElement} canvas
     * @return {undefined}
     */
    PIXI.CanvasTinter.tintWithMultiply = function(tex, deepDataAndEvents, canvas) {
      var ctx = canvas.getContext("2d");
      var frame = tex.frame;
      canvas.width = frame.width;
      canvas.height = frame.height;
      /** @type {string} */
      ctx.fillStyle = "#" + ("00000" + (0 | deepDataAndEvents).toString(16)).substr(-6);
      ctx.fillRect(0, 0, frame.width, frame.height);
      /** @type {string} */
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(tex.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
      /** @type {string} */
      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(tex.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    };
    /**
     * @param {Object} tex
     * @param {number} b
     * @param {HTMLCanvasElement} canvas
     * @return {undefined}
     */
    PIXI.CanvasTinter.tintWithOverlay = function(tex, b, canvas) {
      var context = canvas.getContext("2d");
      var frame = tex.frame;
      canvas.width = frame.width;
      canvas.height = frame.height;
      /** @type {string} */
      context.globalCompositeOperation = "copy";
      /** @type {string} */
      context.fillStyle = "#" + ("00000" + (0 | b).toString(16)).substr(-6);
      context.fillRect(0, 0, frame.width, frame.height);
      /** @type {string} */
      context.globalCompositeOperation = "destination-atop";
      context.drawImage(tex.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    };
    /**
     * @param {Object} tex
     * @param {number} deepDataAndEvents
     * @param {HTMLCanvasElement} canvas
     * @return {undefined}
     */
    PIXI.CanvasTinter.tintWithPerPixel = function(tex, deepDataAndEvents, canvas) {
      var context = canvas.getContext("2d");
      var frame = tex.frame;
      canvas.width = frame.width;
      canvas.height = frame.height;
      /** @type {string} */
      context.globalCompositeOperation = "copy";
      context.drawImage(tex.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
      var parts = PIXI.hex2rgb(deepDataAndEvents);
      var x = parts[0];
      var part = parts[1];
      var spaceAfter = parts[2];
      var imageData = context.getImageData(0, 0, frame.width, frame.height);
      var d = imageData.data;
      /** @type {number} */
      var i = 0;
      for (;i < d.length;i += 4) {
        d[i + 0] *= x;
        d[i + 1] *= part;
        d[i + 2] *= spaceAfter;
      }
      context.putImageData(imageData, 0, 0);
    };
    /**
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    PIXI.CanvasTinter.roundColor = function(deepDataAndEvents) {
      /** @type {number} */
      var scale = PIXI.CanvasTinter.cacheStepsPerColorChannel;
      var oldconfig = PIXI.hex2rgb(deepDataAndEvents);
      return oldconfig[0] = Math.min(255, oldconfig[0] / scale * scale), oldconfig[1] = Math.min(255, oldconfig[1] / scale * scale), oldconfig[2] = Math.min(255, oldconfig[2] / scale * scale), PIXI.rgb2hex(oldconfig);
    };
    /** @type {number} */
    PIXI.CanvasTinter.cacheStepsPerColorChannel = 8;
    /** @type {boolean} */
    PIXI.CanvasTinter.convertTintToImage = false;
    PIXI.CanvasTinter.canUseMultiply = PIXI.canUseNewCanvasBlendModes();
    /** @type {function (Object, number, HTMLCanvasElement): undefined} */
    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.canUseMultiply ? PIXI.CanvasTinter.tintWithMultiply : PIXI.CanvasTinter.tintWithPerPixel;
    /**
     * @param {(number|string)} width
     * @param {(number|string)} height
     * @param {(number|string)} view
     * @param {?} el
     * @return {undefined}
     */
    PIXI.CanvasRenderer = function(width, height, view, el) {
      PIXI.defaultRenderer = PIXI.defaultRenderer || this;
      /** @type {number} */
      this.type = PIXI.CANVAS_RENDERER;
      /** @type {boolean} */
      this.clearBeforeRender = true;
      /** @type {boolean} */
      this.roundPixels = false;
      /** @type {boolean} */
      this.transparent = !!el;
      if (!PIXI.blendModesCanvas) {
        /** @type {Array} */
        PIXI.blendModesCanvas = [];
        if (PIXI.canUseNewCanvasBlendModes()) {
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.NORMAL] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.ADD] = "lighter";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "multiply";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.SCREEN] = "screen";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY] = "overlay";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.DARKEN] = "darken";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN] = "lighten";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "color-dodge";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "color-burn";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "hard-light";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "soft-light";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "difference";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "exclusion";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.HUE] = "hue";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "saturation";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.COLOR] = "color";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "luminosity";
        } else {
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.NORMAL] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.ADD] = "lighter";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.SCREEN] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.DARKEN] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.HUE] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.COLOR] = "source-over";
          /** @type {string} */
          PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "source-over";
        }
      }
      this.width = width || 800;
      this.height = height || 600;
      this.view = view || document.createElement("canvas");
      this.context = this.view.getContext("2d", {
        alpha : this.transparent
      });
      /** @type {boolean} */
      this.refresh = true;
      this.view.width = this.width;
      this.view.height = this.height;
      /** @type {number} */
      this.count = 0;
      this.maskManager = new PIXI.CanvasMaskManager;
      this.renderSession = {
        context : this.context,
        maskManager : this.maskManager,
        scaleMode : null,
        smoothProperty : null
      };
      if ("imageSmoothingEnabled" in this.context) {
        /** @type {string} */
        this.renderSession.smoothProperty = "imageSmoothingEnabled";
      } else {
        if ("webkitImageSmoothingEnabled" in this.context) {
          /** @type {string} */
          this.renderSession.smoothProperty = "webkitImageSmoothingEnabled";
        } else {
          if ("mozImageSmoothingEnabled" in this.context) {
            /** @type {string} */
            this.renderSession.smoothProperty = "mozImageSmoothingEnabled";
          } else {
            if ("oImageSmoothingEnabled" in this.context) {
              /** @type {string} */
              this.renderSession.smoothProperty = "oImageSmoothingEnabled";
            }
          }
        }
      }
    };
    /** @type {function ((number|string), (number|string), (number|string), ?): undefined} */
    PIXI.CanvasRenderer.prototype.constructor = PIXI.CanvasRenderer;
    /**
     * @param {?} stage
     * @return {undefined}
     */
    PIXI.CanvasRenderer.prototype.render = function(stage) {
      /** @type {number} */
      PIXI.texturesToUpdate.length = 0;
      /** @type {number} */
      PIXI.texturesToDestroy.length = 0;
      stage.updateTransform();
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      /** @type {number} */
      this.context.globalAlpha = 1;
      if (!this.transparent && this.clearBeforeRender) {
        this.context.fillStyle = stage.backgroundColorString;
        this.context.fillRect(0, 0, this.width, this.height);
      } else {
        if (this.transparent) {
          if (this.clearBeforeRender) {
            this.context.clearRect(0, 0, this.width, this.height);
          }
        }
      }
      this.renderDisplayObject(stage);
      if (stage.interactive) {
        if (!stage._interactiveEventsAdded) {
          /** @type {boolean} */
          stage._interactiveEventsAdded = true;
          stage.interactionManager.setTarget(this);
        }
      }
      if (PIXI.Texture.frameUpdates.length > 0) {
        /** @type {number} */
        PIXI.Texture.frameUpdates.length = 0;
      }
    };
    /**
     * @param {?} width
     * @param {?} height
     * @return {undefined}
     */
    PIXI.CanvasRenderer.prototype.resize = function(width, height) {
      this.width = width;
      this.height = height;
      this.view.width = width;
      this.view.height = height;
    };
    /**
     * @param {?} displayObject
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context) {
      this.renderSession.context = context || this.context;
      displayObject._renderCanvas(this.renderSession);
    };
    /**
     * @param {?} strip
     * @return {undefined}
     */
    PIXI.CanvasRenderer.prototype.renderStripFlat = function(strip) {
      var context = this.context;
      var verticies = strip.verticies;
      /** @type {number} */
      var messageLength = verticies.length / 2;
      this.count++;
      context.beginPath();
      /** @type {number} */
      var blockSize = 1;
      for (;messageLength - 2 > blockSize;blockSize++) {
        /** @type {number} */
        var index = 2 * blockSize;
        var x0 = verticies[index];
        var x1 = verticies[index + 2];
        var x2 = verticies[index + 4];
        var y0 = verticies[index + 1];
        var y1 = verticies[index + 3];
        var y2 = verticies[index + 5];
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
      }
      /** @type {string} */
      context.fillStyle = "#FF0000";
      context.fill();
      context.closePath();
    };
    /**
     * @param {Object} strip
     * @return {undefined}
     */
    PIXI.CanvasRenderer.prototype.renderStrip = function(strip) {
      var context = this.context;
      var verticies = strip.verticies;
      var uvs = strip.uvs;
      /** @type {number} */
      var messageLength = verticies.length / 2;
      this.count++;
      /** @type {number} */
      var blockSize = 1;
      for (;messageLength - 2 > blockSize;blockSize++) {
        /** @type {number} */
        var index = 2 * blockSize;
        var x0 = verticies[index];
        var x1 = verticies[index + 2];
        var x2 = verticies[index + 4];
        var y0 = verticies[index + 1];
        var y1 = verticies[index + 3];
        var y2 = verticies[index + 5];
        /** @type {number} */
        var u0 = uvs[index] * strip.texture.width;
        /** @type {number} */
        var u1 = uvs[index + 2] * strip.texture.width;
        /** @type {number} */
        var u2 = uvs[index + 4] * strip.texture.width;
        /** @type {number} */
        var v0 = uvs[index + 1] * strip.texture.height;
        /** @type {number} */
        var v1 = uvs[index + 3] * strip.texture.height;
        /** @type {number} */
        var v2 = uvs[index + 5] * strip.texture.height;
        context.save();
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.closePath();
        context.clip();
        /** @type {number} */
        var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
        /** @type {number} */
        var delta_a = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
        /** @type {number} */
        var delta_b = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
        /** @type {number} */
        var delta_c = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
        /** @type {number} */
        var delta_d = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
        /** @type {number} */
        var delta_e = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
        /** @type {number} */
        var delta_f = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;
        context.transform(delta_a / delta, delta_d / delta, delta_b / delta, delta_e / delta, delta_c / delta, delta_f / delta);
        context.drawImage(strip.texture.baseTexture.source, 0, 0);
        context.restore();
      }
    };
    /**
     * @param {?} width
     * @param {?} height
     * @return {undefined}
     */
    PIXI.CanvasBuffer = function(width, height) {
      this.width = width;
      this.height = height;
      /** @type {Element} */
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      this.canvas.width = width;
      this.canvas.height = height;
    };
    /**
     * @return {undefined}
     */
    PIXI.CanvasBuffer.prototype.clear = function() {
      this.context.clearRect(0, 0, this.width, this.height);
    };
    /**
     * @param {number} width
     * @param {?} height
     * @return {undefined}
     */
    PIXI.CanvasBuffer.prototype.resize = function(width, height) {
      this.width = this.canvas.width = width;
      this.height = this.canvas.height = height;
    };
    /**
     * @return {undefined}
     */
    PIXI.CanvasGraphics = function() {
    };
    /**
     * @param {?} graphics
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.CanvasGraphics.renderGraphics = function(graphics, context) {
      var pAlpha = graphics.worldAlpha;
      /** @type {string} */
      var ppath = "";
      /** @type {number} */
      var i = 0;
      for (;i < graphics.graphicsData.length;i++) {
        var options = graphics.graphicsData[i];
        var bar = options.points;
        if (context.strokeStyle = ppath = "#" + ("00000" + (0 | options.lineColor).toString(16)).substr(-6), context.lineWidth = options.lineWidth, options.type === PIXI.Graphics.POLY) {
          context.beginPath();
          context.moveTo(bar[0], bar[1]);
          /** @type {number} */
          var h = 1;
          for (;h < bar.length / 2;h++) {
            context.lineTo(bar[2 * h], bar[2 * h + 1]);
          }
          if (bar[0] === bar[bar.length - 2]) {
            if (bar[1] === bar[bar.length - 1]) {
              context.closePath();
            }
          }
          if (options.fill) {
            /** @type {number} */
            context.globalAlpha = options.fillAlpha * pAlpha;
            /** @type {string} */
            context.fillStyle = ppath = "#" + ("00000" + (0 | options.fillColor).toString(16)).substr(-6);
            context.fill();
          }
          if (options.lineWidth) {
            /** @type {number} */
            context.globalAlpha = options.lineAlpha * pAlpha;
            context.stroke();
          }
        } else {
          if (options.type === PIXI.Graphics.RECT) {
            if (options.fillColor || 0 === options.fillColor) {
              /** @type {number} */
              context.globalAlpha = options.fillAlpha * pAlpha;
              /** @type {string} */
              context.fillStyle = ppath = "#" + ("00000" + (0 | options.fillColor).toString(16)).substr(-6);
              context.fillRect(bar[0], bar[1], bar[2], bar[3]);
            }
            if (options.lineWidth) {
              /** @type {number} */
              context.globalAlpha = options.lineAlpha * pAlpha;
              context.strokeRect(bar[0], bar[1], bar[2], bar[3]);
            }
          } else {
            if (options.type === PIXI.Graphics.CIRC) {
              context.beginPath();
              context.arc(bar[0], bar[1], bar[2], 0, 2 * Math.PI);
              context.closePath();
              if (options.fill) {
                /** @type {number} */
                context.globalAlpha = options.fillAlpha * pAlpha;
                /** @type {string} */
                context.fillStyle = ppath = "#" + ("00000" + (0 | options.fillColor).toString(16)).substr(-6);
                context.fill();
              }
              if (options.lineWidth) {
                /** @type {number} */
                context.globalAlpha = options.lineAlpha * pAlpha;
                context.stroke();
              }
            } else {
              if (options.type === PIXI.Graphics.ELIP) {
                var points = options.points;
                /** @type {number} */
                var aWidth = 2 * points[2];
                /** @type {number} */
                var aHeight = 2 * points[3];
                /** @type {number} */
                var aX = points[0] - aWidth / 2;
                /** @type {number} */
                var aY = points[1] - aHeight / 2;
                context.beginPath();
                /** @type {number} */
                var g = 0.5522848;
                /** @type {number} */
                var hB = aWidth / 2 * g;
                /** @type {number} */
                var vB = aHeight / 2 * g;
                /** @type {number} */
                var eX = aX + aWidth;
                /** @type {number} */
                var eY = aY + aHeight;
                /** @type {number} */
                var mX = aX + aWidth / 2;
                /** @type {number} */
                var mY = aY + aHeight / 2;
                context.moveTo(aX, mY);
                context.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
                context.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
                context.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
                context.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
                context.closePath();
                if (options.fill) {
                  /** @type {number} */
                  context.globalAlpha = options.fillAlpha * pAlpha;
                  /** @type {string} */
                  context.fillStyle = ppath = "#" + ("00000" + (0 | options.fillColor).toString(16)).substr(-6);
                  context.fill();
                }
                if (options.lineWidth) {
                  /** @type {number} */
                  context.globalAlpha = options.lineAlpha * pAlpha;
                  context.stroke();
                }
              }
            }
          }
        }
      }
    };
    /**
     * @param {?} graphics
     * @param {CanvasRenderingContext2D} ctx
     * @return {undefined}
     */
    PIXI.CanvasGraphics.renderGraphicsMask = function(graphics, ctx) {
      var cnl = graphics.graphicsData.length;
      if (0 !== cnl) {
        if (cnl > 1) {
          /** @type {number} */
          cnl = 1;
          window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object");
        }
        /** @type {number} */
        var i = 0;
        for (;1 > i;i++) {
          var event = graphics.graphicsData[i];
          var a = event.points;
          if (event.type === PIXI.Graphics.POLY) {
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            /** @type {number} */
            var o = 1;
            for (;o < a.length / 2;o++) {
              ctx.lineTo(a[2 * o], a[2 * o + 1]);
            }
            if (a[0] === a[a.length - 2]) {
              if (a[1] === a[a.length - 1]) {
                ctx.closePath();
              }
            }
          } else {
            if (event.type === PIXI.Graphics.RECT) {
              ctx.beginPath();
              ctx.rect(a[0], a[1], a[2], a[3]);
              ctx.closePath();
            } else {
              if (event.type === PIXI.Graphics.CIRC) {
                ctx.beginPath();
                ctx.arc(a[0], a[1], a[2], 0, 2 * Math.PI);
                ctx.closePath();
              } else {
                if (event.type === PIXI.Graphics.ELIP) {
                  var shape = event.points;
                  /** @type {number} */
                  var w = 2 * shape[2];
                  /** @type {number} */
                  var h = 2 * shape[3];
                  /** @type {number} */
                  var x = shape[0] - w / 2;
                  /** @type {number} */
                  var y = shape[1] - h / 2;
                  ctx.beginPath();
                  /** @type {number} */
                  var kappa = 0.5522848;
                  /** @type {number} */
                  var ox = w / 2 * kappa;
                  /** @type {number} */
                  var oy = h / 2 * kappa;
                  /** @type {number} */
                  var xe = x + w;
                  /** @type {number} */
                  var ye = y + h;
                  /** @type {number} */
                  var xm = x + w / 2;
                  /** @type {number} */
                  var ym = y + h / 2;
                  ctx.moveTo(x, ym);
                  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                  ctx.closePath();
                }
              }
            }
          }
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.Graphics = function() {
      PIXI.DisplayObjectContainer.call(this);
      /** @type {boolean} */
      this.renderable = true;
      /** @type {number} */
      this.fillAlpha = 1;
      /** @type {number} */
      this.lineWidth = 0;
      /** @type {string} */
      this.lineColor = "black";
      /** @type {Array} */
      this.graphicsData = [];
      /** @type {number} */
      this.tint = 16777215;
      /** @type {number} */
      this.blendMode = PIXI.blendModes.NORMAL;
      this.currentPath = {
        points : []
      };
      /** @type {Array} */
      this._webGL = [];
      /** @type {boolean} */
      this.isMask = false;
      /** @type {null} */
      this.bounds = null;
      /** @type {number} */
      this.boundsPadding = 10;
    };
    /** @type {Object} */
    PIXI.Graphics.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    /** @type {function (): undefined} */
    PIXI.Graphics.prototype.constructor = PIXI.Graphics;
    Object.defineProperty(PIXI.Graphics.prototype, "cacheAsBitmap", {
      /**
       * @return {?}
       */
      get : function() {
        return this._cacheAsBitmap;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this._cacheAsBitmap = expectedHashCode;
        if (this._cacheAsBitmap) {
          this._generateCachedSprite();
        } else {
          this.destroyCachedSprite();
          /** @type {boolean} */
          this.dirty = true;
        }
      }
    });
    /**
     * @param {number} thickness
     * @param {string} lineColor
     * @param {number} lineAlpha
     * @return {?}
     */
    PIXI.Graphics.prototype.lineStyle = function(thickness, lineColor, lineAlpha) {
      return this.currentPath.points.length || this.graphicsData.pop(), this.lineWidth = thickness || 0, this.lineColor = lineColor || 0, this.lineAlpha = arguments.length < 3 ? 1 : lineAlpha, this.currentPath = {
        lineWidth : this.lineWidth,
        lineColor : this.lineColor,
        lineAlpha : this.lineAlpha,
        fillColor : this.fillColor,
        fillAlpha : this.fillAlpha,
        fill : this.filling,
        points : [],
        type : PIXI.Graphics.POLY
      }, this.graphicsData.push(this.currentPath), this;
    };
    /**
     * @param {number} x
     * @param {number} y
     * @return {?}
     */
    PIXI.Graphics.prototype.moveTo = function(x, y) {
      return this.currentPath.points.length || this.graphicsData.pop(), this.currentPath = this.currentPath = {
        lineWidth : this.lineWidth,
        lineColor : this.lineColor,
        lineAlpha : this.lineAlpha,
        fillColor : this.fillColor,
        fillAlpha : this.fillAlpha,
        fill : this.filling,
        points : [],
        type : PIXI.Graphics.POLY
      }, this.currentPath.points.push(x, y), this.graphicsData.push(this.currentPath), this;
    };
    /**
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    PIXI.Graphics.prototype.lineTo = function(x, y) {
      return this.currentPath.points.push(x, y), this.dirty = true, this;
    };
    /**
     * @param {number} outstandingDataSize
     * @param {number} fill
     * @return {?}
     */
    PIXI.Graphics.prototype.beginFill = function(outstandingDataSize, fill) {
      return this.filling = true, this.fillColor = outstandingDataSize || 0, this.fillAlpha = arguments.length < 2 ? 1 : fill, this;
    };
    /**
     * @return {?}
     */
    PIXI.Graphics.prototype.endFill = function() {
      return this.filling = false, this.fillColor = null, this.fillAlpha = 1, this;
    };
    /**
     * @param {number} mayParseLabeledStatementInstead
     * @param {number} recurring
     * @param {?} x2
     * @param {?} y
     * @return {?}
     */
    PIXI.Graphics.prototype.drawRect = function(mayParseLabeledStatementInstead, recurring, x2, y) {
      return this.currentPath.points.length || this.graphicsData.pop(), this.currentPath = {
        lineWidth : this.lineWidth,
        lineColor : this.lineColor,
        lineAlpha : this.lineAlpha,
        fillColor : this.fillColor,
        fillAlpha : this.fillAlpha,
        fill : this.filling,
        points : [mayParseLabeledStatementInstead, recurring, x2, y],
        type : PIXI.Graphics.RECT
      }, this.graphicsData.push(this.currentPath), this.dirty = true, this;
    };
    /**
     * @param {number} x
     * @param {number} recurring
     * @param {?} y
     * @return {?}
     */
    PIXI.Graphics.prototype.drawCircle = function(x, recurring, y) {
      return this.currentPath.points.length || this.graphicsData.pop(), this.currentPath = {
        lineWidth : this.lineWidth,
        lineColor : this.lineColor,
        lineAlpha : this.lineAlpha,
        fillColor : this.fillColor,
        fillAlpha : this.fillAlpha,
        fill : this.filling,
        points : [x, recurring, y, y],
        type : PIXI.Graphics.CIRC
      }, this.graphicsData.push(this.currentPath), this.dirty = true, this;
    };
    /**
     * @param {?} x
     * @param {?} y
     * @param {?} w
     * @param {?} h
     * @return {?}
     */
    PIXI.Graphics.prototype.drawEllipse = function(x, y, w, h) {
      return this.currentPath.points.length || this.graphicsData.pop(), this.currentPath = {
        lineWidth : this.lineWidth,
        lineColor : this.lineColor,
        lineAlpha : this.lineAlpha,
        fillColor : this.fillColor,
        fillAlpha : this.fillAlpha,
        fill : this.filling,
        points : [x, y, w, h],
        type : PIXI.Graphics.ELIP
      }, this.graphicsData.push(this.currentPath), this.dirty = true, this;
    };
    /**
     * @return {?}
     */
    PIXI.Graphics.prototype.clear = function() {
      return this.lineWidth = 0, this.filling = false, this.dirty = true, this.clearDirty = true, this.graphicsData = [], this.bounds = null, this;
    };
    /**
     * @return {?}
     */
    PIXI.Graphics.prototype.generateTexture = function() {
      var box = this.getBounds();
      var renderer = new PIXI.CanvasBuffer(box.width, box.height);
      var s = PIXI.Texture.fromCanvas(renderer.canvas);
      return renderer.context.translate(-box.x, -box.y), PIXI.CanvasGraphics.renderGraphics(this, renderer.context), s;
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {?}
     */
    PIXI.Graphics.prototype._renderWebGL = function(context) {
      if (this.visible !== false && (0 !== this.alpha && this.isMask !== true)) {
        if (this._cacheAsBitmap) {
          return this.dirty && (this._generateCachedSprite(), PIXI.updateWebGLTexture(this._cachedSprite.texture.baseTexture, context.gl), this.dirty = false), this._cachedSprite.alpha = this.alpha, void PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, context);
        }
        if (context.spriteBatch.stop(), this._mask && context.maskManager.pushMask(this.mask, context), this._filters && context.filterManager.pushFilter(this._filterBlock), this.blendMode !== context.spriteBatch.currentBlendMode) {
          context.spriteBatch.currentBlendMode = this.blendMode;
          var gl = PIXI.blendModesWebGL[context.spriteBatch.currentBlendMode];
          context.spriteBatch.gl.blendFunc(gl[0], gl[1]);
        }
        if (PIXI.WebGLGraphics.renderGraphics(this, context), this.children.length) {
          context.spriteBatch.start();
          /** @type {number} */
          var l = 0;
          var e = this.children.length;
          for (;e > l;l++) {
            this.children[l]._renderWebGL(context);
          }
          context.spriteBatch.stop();
        }
        if (this._filters) {
          context.filterManager.popFilter();
        }
        if (this._mask) {
          context.maskManager.popMask(context);
        }
        context.drawCount++;
        context.spriteBatch.start();
      }
    };
    /**
     * @param {Object} set
     * @return {undefined}
     */
    PIXI.Graphics.prototype._renderCanvas = function(set) {
      if (this.visible !== false && (0 !== this.alpha && this.isMask !== true)) {
        var context = set.context;
        var m = this.worldTransform;
        if (this.blendMode !== set.currentBlendMode) {
          set.currentBlendMode = this.blendMode;
          context.globalCompositeOperation = PIXI.blendModesCanvas[set.currentBlendMode];
        }
        context.setTransform(m.a, m.c, m.b, m.d, m.tx, m.ty);
        PIXI.CanvasGraphics.renderGraphics(this, context);
        /** @type {number} */
        var l = 0;
        var e = this.children.length;
        for (;e > l;l++) {
          this.children[l]._renderCanvas(set);
        }
      }
    };
    /**
     * @param {?} latLng
     * @return {?}
     */
    PIXI.Graphics.prototype.getBounds = function(latLng) {
      if (!this.bounds) {
        this.updateBounds();
      }
      var b03 = this.bounds.x;
      var b00 = this.bounds.width + this.bounds.x;
      var b13 = this.bounds.y;
      var b10 = this.bounds.height + this.bounds.y;
      var worldTransform = latLng || this.worldTransform;
      var a00 = worldTransform.a;
      var a10 = worldTransform.c;
      var a01 = worldTransform.b;
      var a11 = worldTransform.d;
      var a02 = worldTransform.tx;
      var a12 = worldTransform.ty;
      var ok = a00 * b00 + a01 * b10 + a02;
      var margin = a11 * b10 + a10 * b00 + a12;
      var dcMax = a00 * b03 + a01 * b10 + a02;
      var value = a11 * b10 + a10 * b03 + a12;
      var w = a00 * b03 + a01 * b13 + a02;
      var x = a11 * b13 + a10 * b03 + a12;
      var max = a00 * b00 + a01 * b13 + a02;
      var current_count = a11 * b13 + a10 * b00 + a12;
      var maxw = ok;
      var y = margin;
      var val = ok;
      var min = margin;
      val = val > dcMax ? dcMax : val;
      val = val > w ? w : val;
      val = val > max ? max : val;
      min = min > value ? value : min;
      min = min > x ? x : min;
      min = min > current_count ? current_count : min;
      maxw = dcMax > maxw ? dcMax : maxw;
      maxw = w > maxw ? w : maxw;
      maxw = max > maxw ? max : maxw;
      y = value > y ? value : y;
      y = x > y ? x : y;
      y = current_count > y ? current_count : y;
      var self = this._bounds;
      return self.x = val, self.width = maxw - val, self.y = min, self.height = y - min, self;
    };
    /**
     * @return {undefined}
     */
    PIXI.Graphics.prototype.updateBounds = function() {
      var points;
      var y;
      var a;
      var delta;
      var b;
      /** @type {number} */
      var x = 1 / 0;
      /** @type {number} */
      var x2 = -1 / 0;
      /** @type {number} */
      var min = 1 / 0;
      /** @type {number} */
      var max = -1 / 0;
      /** @type {number} */
      var hi = 0;
      for (;hi < this.graphicsData.length;hi++) {
        var c = this.graphicsData[hi];
        var type = c.type;
        var w = c.lineWidth;
        if (points = c.points, type === PIXI.Graphics.RECT) {
          /** @type {number} */
          y = points[0] - w / 2;
          /** @type {number} */
          a = points[1] - w / 2;
          delta = points[2] + w;
          b = points[3] + w;
          /** @type {number} */
          x = x > y ? y : x;
          x2 = y + delta > x2 ? y + delta : x2;
          /** @type {number} */
          min = min > a ? y : min;
          max = a + b > max ? a + b : max;
        } else {
          if (type === PIXI.Graphics.CIRC || type === PIXI.Graphics.ELIP) {
            y = points[0];
            a = points[1];
            delta = points[2] + w / 2;
            b = points[3] + w / 2;
            /** @type {number} */
            x = x > y - delta ? y - delta : x;
            x2 = y + delta > x2 ? y + delta : x2;
            /** @type {number} */
            min = min > a - b ? a - b : min;
            max = a + b > max ? a + b : max;
          } else {
            /** @type {number} */
            var i = 0;
            for (;i < points.length;i += 2) {
              y = points[i];
              a = points[i + 1];
              /** @type {number} */
              x = x > y - w ? y - w : x;
              x2 = y + w > x2 ? y + w : x2;
              /** @type {number} */
              min = min > a - w ? a - w : min;
              max = a + w > max ? a + w : max;
            }
          }
        }
      }
      var width = this.boundsPadding;
      this.bounds = new PIXI.Rectangle(x - width, min - width, x2 - x + 2 * width, max - min + 2 * width);
    };
    /**
     * @return {undefined}
     */
    PIXI.Graphics.prototype._generateCachedSprite = function() {
      var size = this.getLocalBounds();
      if (this._cachedSprite) {
        this._cachedSprite.buffer.resize(size.width, size.height);
      } else {
        var data = new PIXI.CanvasBuffer(size.width, size.height);
        var texture = PIXI.Texture.fromCanvas(data.canvas);
        this._cachedSprite = new PIXI.Sprite(texture);
        this._cachedSprite.buffer = data;
        this._cachedSprite.worldTransform = this.worldTransform;
      }
      /** @type {number} */
      this._cachedSprite.anchor.x = -(size.x / size.width);
      /** @type {number} */
      this._cachedSprite.anchor.y = -(size.y / size.height);
      this._cachedSprite.buffer.context.translate(-size.x, -size.y);
      PIXI.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context);
      this._cachedSprite.alpha = this.alpha;
    };
    /**
     * @return {undefined}
     */
    PIXI.Graphics.prototype.destroyCachedSprite = function() {
      this._cachedSprite.texture.destroy(true);
      /** @type {null} */
      this._cachedSprite = null;
    };
    /** @type {number} */
    PIXI.Graphics.POLY = 0;
    /** @type {number} */
    PIXI.Graphics.RECT = 1;
    /** @type {number} */
    PIXI.Graphics.CIRC = 2;
    /** @type {number} */
    PIXI.Graphics.ELIP = 3;
    /**
     * @param {?} texture
     * @param {?} width
     * @param {?} height
     * @return {undefined}
     */
    PIXI.Strip = function(texture, width, height) {
      PIXI.Sprite.call(this, texture);
      this.width = width;
      this.height = height;
      this.texture = texture;
      /** @type {number} */
      this.blendMode = PIXI.blendModes.NORMAL;
      try {
        /** @type {Float32Array} */
        this.uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1]);
        /** @type {Float32Array} */
        this.verticies = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        /** @type {Float32Array} */
        this.colors = new Float32Array([1, 1, 1, 1]);
        /** @type {Uint16Array} */
        this.indices = new Uint16Array([0, 1, 2, 3]);
      } catch (a) {
        /** @type {Array} */
        this.uvs = [0, 1, 1, 1, 1, 0, 0, 1];
        /** @type {Array} */
        this.verticies = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        /** @type {Array} */
        this.colors = [1, 1, 1, 1];
        /** @type {Array} */
        this.indices = [0, 1, 2, 3];
      }
      if (texture.baseTexture.hasLoaded) {
        this.width = this.texture.frame.width;
        this.height = this.texture.frame.height;
        /** @type {boolean} */
        this.updateFrame = true;
      } else {
        this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
        this.texture.addEventListener("update", this.onTextureUpdateBind);
      }
      /** @type {boolean} */
      this.renderable = true;
    };
    /** @type {Object} */
    PIXI.Strip.prototype = Object.create(PIXI.Sprite.prototype);
    /** @type {function (?, ?, ?): undefined} */
    PIXI.Strip.prototype.constructor = PIXI.Strip;
    /**
     * @return {undefined}
     */
    PIXI.Strip.prototype.onTextureUpdate = function() {
      /** @type {boolean} */
      this.updateFrame = true;
    };
    /**
     * @param {?} mapper
     * @param {Array} points
     * @return {undefined}
     */
    PIXI.Rope = function(mapper, points) {
      PIXI.Strip.call(this, mapper);
      /** @type {Array} */
      this.points = points;
      try {
        /** @type {Float32Array} */
        this.verticies = new Float32Array(4 * points.length);
        /** @type {Float32Array} */
        this.uvs = new Float32Array(4 * points.length);
        /** @type {Float32Array} */
        this.colors = new Float32Array(2 * points.length);
        /** @type {Uint16Array} */
        this.indices = new Uint16Array(2 * points.length);
      } catch (s) {
        /** @type {Array} */
        this.verticies = new Array(4 * points.length);
        /** @type {Array} */
        this.uvs = new Array(4 * points.length);
        /** @type {Array} */
        this.colors = new Array(2 * points.length);
        /** @type {Array} */
        this.indices = new Array(2 * points.length);
      }
      this.refresh();
    };
    /** @type {Object} */
    PIXI.Rope.prototype = Object.create(PIXI.Strip.prototype);
    /** @type {function (?, Array): undefined} */
    PIXI.Rope.prototype.constructor = PIXI.Rope;
    /**
     * @return {undefined}
     */
    PIXI.Rope.prototype.refresh = function() {
      var points = this.points;
      if (!(points.length < 1)) {
        var mat = this.uvs;
        var lastPoint = points[0];
        var indices = this.indices;
        var spec = this.colors;
        this.count -= 0.2;
        /** @type {number} */
        mat[0] = 0;
        /** @type {number} */
        mat[1] = 1;
        /** @type {number} */
        mat[2] = 0;
        /** @type {number} */
        mat[3] = 1;
        /** @type {number} */
        spec[0] = 1;
        /** @type {number} */
        spec[1] = 1;
        /** @type {number} */
        indices[0] = 0;
        /** @type {number} */
        indices[1] = 1;
        var point;
        var i;
        var v0;
        var length = points.length;
        /** @type {number} */
        var index = 1;
        for (;length > index;index++) {
          point = points[index];
          /** @type {number} */
          i = 4 * index;
          /** @type {number} */
          v0 = index / (length - 1);
          if (index % 2) {
            /** @type {number} */
            mat[i] = v0;
            /** @type {number} */
            mat[i + 1] = 0;
            /** @type {number} */
            mat[i + 2] = v0;
            /** @type {number} */
            mat[i + 3] = 1;
          } else {
            /** @type {number} */
            mat[i] = v0;
            /** @type {number} */
            mat[i + 1] = 0;
            /** @type {number} */
            mat[i + 2] = v0;
            /** @type {number} */
            mat[i + 3] = 1;
          }
          /** @type {number} */
          i = 2 * index;
          /** @type {number} */
          spec[i] = 1;
          /** @type {number} */
          spec[i + 1] = 1;
          /** @type {number} */
          i = 2 * index;
          /** @type {number} */
          indices[i] = i;
          /** @type {number} */
          indices[i + 1] = i + 1;
          lastPoint = point;
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.Rope.prototype.updateTransform = function() {
      var points = this.points;
      if (!(points.length < 1)) {
        var to;
        var point = points[0];
        var perp = {
          x : 0,
          y : 0
        };
        this.count -= 0.2;
        var mat = this.verticies;
        mat[0] = point.x + perp.x;
        mat[1] = point.y + perp.y;
        /** @type {number} */
        mat[2] = point.x - perp.x;
        /** @type {number} */
        mat[3] = point.y - perp.y;
        var p;
        var row;
        var h;
        var perpLength;
        var num;
        var len = points.length;
        /** @type {number} */
        var i = 1;
        for (;len > i;i++) {
          p = points[i];
          /** @type {number} */
          row = 4 * i;
          to = i < points.length - 1 ? points[i + 1] : p;
          /** @type {number} */
          perp.y = -(to.x - point.x);
          /** @type {number} */
          perp.x = to.y - point.y;
          /** @type {number} */
          h = 10 * (1 - i / (len - 1));
          if (h > 1) {
            /** @type {number} */
            h = 1;
          }
          /** @type {number} */
          perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y);
          /** @type {number} */
          num = this.texture.height / 2;
          perp.x /= perpLength;
          perp.y /= perpLength;
          perp.x *= num;
          perp.y *= num;
          mat[row] = p.x + perp.x;
          mat[row + 1] = p.y + perp.y;
          /** @type {number} */
          mat[row + 2] = p.x - perp.x;
          /** @type {number} */
          mat[row + 3] = p.y - perp.y;
          point = p;
        }
        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
      }
    };
    /**
     * @param {boolean} texture
     * @return {undefined}
     */
    PIXI.Rope.prototype.setTexture = function(texture) {
      /** @type {boolean} */
      this.texture = texture;
      /** @type {boolean} */
      this.updateFrame = true;
    };
    /**
     * @param {?} mapper
     * @param {(number|string)} width
     * @param {(number|string)} height
     * @return {undefined}
     */
    PIXI.TilingSprite = function(mapper, width, height) {
      PIXI.Sprite.call(this, mapper);
      this.width = width || 100;
      this.height = height || 100;
      this.tileScale = new PIXI.Point(1, 1);
      this.tileScaleOffset = new PIXI.Point(1, 1);
      this.tilePosition = new PIXI.Point(0, 0);
      /** @type {boolean} */
      this.renderable = true;
      /** @type {number} */
      this.tint = 16777215;
      /** @type {number} */
      this.blendMode = PIXI.blendModes.NORMAL;
    };
    /** @type {Object} */
    PIXI.TilingSprite.prototype = Object.create(PIXI.Sprite.prototype);
    /** @type {function (?, (number|string), (number|string)): undefined} */
    PIXI.TilingSprite.prototype.constructor = PIXI.TilingSprite;
    Object.defineProperty(PIXI.TilingSprite.prototype, "width", {
      /**
       * @return {?}
       */
      get : function() {
        return this._width;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this._width = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.TilingSprite.prototype, "height", {
      /**
       * @return {?}
       */
      get : function() {
        return this._height;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this._height = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.TilingSprite.prototype.onTextureUpdate = function() {
      /** @type {boolean} */
      this.updateFrame = true;
    };
    /**
     * @param {boolean} texture
     * @return {undefined}
     */
    PIXI.TilingSprite.prototype.setTexture = function(texture) {
      if (this.texture !== texture) {
        /** @type {boolean} */
        this.texture = texture;
        /** @type {boolean} */
        this.refreshTexture = true;
        /** @type {number} */
        this.cachedTint = 16777215;
      }
    };
    /**
     * @param {CanvasRenderingContext2D} context
     * @return {undefined}
     */
    PIXI.TilingSprite.prototype._renderWebGL = function(context) {
      if (this.visible !== false && 0 !== this.alpha) {
        var index1;
        var iz;
        if (this.mask) {
          context.spriteBatch.stop();
          context.maskManager.pushMask(this.mask, context);
          context.spriteBatch.start();
        }
        if (this.filters) {
          context.spriteBatch.flush();
          context.filterManager.pushFilter(this._filterBlock);
        }
        if (!this.tilingTexture || this.refreshTexture) {
          this.generateTilingTexture(true);
          if (this.tilingTexture) {
            if (this.tilingTexture.needsUpdate) {
              PIXI.updateWebGLTexture(this.tilingTexture.baseTexture, context.gl);
              /** @type {boolean} */
              this.tilingTexture.needsUpdate = false;
            }
          }
        } else {
          context.spriteBatch.renderTilingSprite(this);
        }
        /** @type {number} */
        index1 = 0;
        iz = this.children.length;
        for (;iz > index1;index1++) {
          this.children[index1]._renderWebGL(context);
        }
        context.spriteBatch.stop();
        if (this.filters) {
          context.filterManager.popFilter();
        }
        if (this.mask) {
          context.maskManager.popMask(context);
        }
        context.spriteBatch.start();
      }
    };
    /**
     * @param {Object} seed
     * @return {undefined}
     */
    PIXI.TilingSprite.prototype._renderCanvas = function(seed) {
      if (this.visible !== false && 0 !== this.alpha) {
        var context = seed.context;
        if (this._mask) {
          seed.maskManager.pushMask(this._mask, context);
        }
        context.globalAlpha = this.worldAlpha;
        var m = this.worldTransform;
        if (context.setTransform(m.a, m.c, m.b, m.d, m.tx, m.ty), !this.__tilePattern || this.refreshTexture) {
          if (this.generateTilingTexture(false), !this.tilingTexture) {
            return;
          }
          this.__tilePattern = context.createPattern(this.tilingTexture.baseTexture.source, "repeat");
        }
        if (this.blendMode !== seed.currentBlendMode) {
          seed.currentBlendMode = this.blendMode;
          context.globalCompositeOperation = PIXI.blendModesCanvas[seed.currentBlendMode];
        }
        context.beginPath();
        var tilePosition = this.tilePosition;
        var tileScale = this.tileScale;
        tilePosition.x %= this.tilingTexture.baseTexture.width;
        tilePosition.y %= this.tilingTexture.baseTexture.height;
        context.scale(tileScale.x, tileScale.y);
        context.translate(tilePosition.x, tilePosition.y);
        context.fillStyle = this.__tilePattern;
        context.fillRect(-tilePosition.x + this.anchor.x * -this._width, -tilePosition.y + this.anchor.y * -this._height, this._width / tileScale.x, this._height / tileScale.y);
        context.scale(1 / tileScale.x, 1 / tileScale.y);
        context.translate(-tilePosition.x, -tilePosition.y);
        context.closePath();
        if (this._mask) {
          seed.maskManager.popMask(seed.context);
        }
      }
    };
    /**
     * @return {?}
     */
    PIXI.TilingSprite.prototype.getBounds = function() {
      var oldWidth = this._width;
      var height = this._height;
      /** @type {number} */
      var b00 = oldWidth * (1 - this.anchor.x);
      /** @type {number} */
      var b03 = oldWidth * -this.anchor.x;
      /** @type {number} */
      var b10 = height * (1 - this.anchor.y);
      /** @type {number} */
      var b13 = height * -this.anchor.y;
      var worldTransform = this.worldTransform;
      var a00 = worldTransform.a;
      var a10 = worldTransform.c;
      var a01 = worldTransform.b;
      var a11 = worldTransform.d;
      var a02 = worldTransform.tx;
      var offset = worldTransform.ty;
      var w = a00 * b03 + a01 * b13 + a02;
      var p = a11 * b13 + a10 * b03 + offset;
      var y = a00 * b00 + a01 * b13 + a02;
      var r = a11 * b13 + a10 * b00 + offset;
      var max = a00 * b00 + a01 * b10 + a02;
      var current_count = a11 * b10 + a10 * b00 + offset;
      var maxX = a00 * b03 + a01 * b10 + a02;
      var value = a11 * b10 + a10 * b03 + offset;
      /** @type {number} */
      var width = -1 / 0;
      /** @type {number} */
      var v = -1 / 0;
      /** @type {number} */
      var x = 1 / 0;
      /** @type {number} */
      var min = 1 / 0;
      x = x > w ? w : x;
      x = x > y ? y : x;
      x = x > max ? max : x;
      x = x > maxX ? maxX : x;
      min = min > p ? p : min;
      min = min > r ? r : min;
      min = min > current_count ? current_count : min;
      min = min > value ? value : min;
      width = w > width ? w : width;
      width = y > width ? y : width;
      width = max > width ? max : width;
      width = maxX > width ? maxX : width;
      v = p > v ? p : v;
      v = r > v ? r : v;
      v = current_count > v ? current_count : v;
      v = value > v ? value : v;
      var wrapper = this._bounds;
      return wrapper.x = x, wrapper.width = width - x, wrapper.y = min, wrapper.height = v - min, this._currentBounds = wrapper, wrapper;
    };
    /**
     * @param {boolean} recurring
     * @return {undefined}
     */
    PIXI.TilingSprite.prototype.generateTilingTexture = function(recurring) {
      var texture = this.texture;
      if (texture.baseTexture.hasLoaded) {
        var width;
        var height;
        var size = texture.baseTexture;
        var frame = texture.frame;
        /** @type {boolean} */
        var o = frame.width !== size.width || frame.height !== size.height;
        /** @type {boolean} */
        var h = false;
        if (recurring ? (width = PIXI.getNextPowerOfTwo(frame.width), height = PIXI.getNextPowerOfTwo(frame.height), frame.width !== width && (frame.height !== height && (h = true))) : o && (width = frame.width, height = frame.height, h = true), h) {
          var canvas;
          if (this.tilingTexture && this.tilingTexture.isTiling) {
            canvas = this.tilingTexture.canvasBuffer;
            canvas.resize(width, height);
            this.tilingTexture.baseTexture.width = width;
            this.tilingTexture.baseTexture.height = height;
            /** @type {boolean} */
            this.tilingTexture.needsUpdate = true;
          } else {
            canvas = new PIXI.CanvasBuffer(width, height);
            this.tilingTexture = PIXI.Texture.fromCanvas(canvas.canvas);
            this.tilingTexture.canvasBuffer = canvas;
            /** @type {boolean} */
            this.tilingTexture.isTiling = true;
          }
          canvas.context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, width, height);
          /** @type {number} */
          this.tileScaleOffset.x = frame.width / width;
          /** @type {number} */
          this.tileScaleOffset.y = frame.height / height;
        } else {
          if (this.tilingTexture) {
            if (this.tilingTexture.isTiling) {
              this.tilingTexture.destroy(true);
            }
          }
          /** @type {number} */
          this.tileScaleOffset.x = 1;
          /** @type {number} */
          this.tileScaleOffset.y = 1;
          this.tilingTexture = texture;
        }
        /** @type {boolean} */
        this.refreshTexture = false;
        /** @type {boolean} */
        this.tilingTexture.baseTexture._powerOf2 = true;
      }
    };
    var spine = {};
    /**
     * @param {string} name
     * @param {?} parent
     * @return {undefined}
     */
    spine.BoneData = function(name, parent) {
      /** @type {string} */
      this.name = name;
      this.parent = parent;
    };
    spine.BoneData.prototype = {
      length : 0,
      x : 0,
      y : 0,
      rotation : 0,
      scaleX : 1,
      scaleY : 1
    };
    /**
     * @param {string} name
     * @param {?} boneData
     * @return {undefined}
     */
    spine.SlotData = function(name, boneData) {
      /** @type {string} */
      this.name = name;
      this.boneData = boneData;
    };
    spine.SlotData.prototype = {
      r : 1,
      g : 1,
      b : 1,
      a : 1,
      attachmentName : null
    };
    /**
     * @param {Object} boneData
     * @param {?} parent
     * @return {undefined}
     */
    spine.Bone = function(boneData, parent) {
      /** @type {Object} */
      this.data = boneData;
      this.parent = parent;
      this.setToSetupPose();
    };
    /** @type {boolean} */
    spine.Bone.yDown = false;
    spine.Bone.prototype = {
      x : 0,
      y : 0,
      rotation : 0,
      scaleX : 1,
      scaleY : 1,
      m00 : 0,
      m01 : 0,
      worldX : 0,
      m10 : 0,
      m11 : 0,
      worldY : 0,
      worldRotation : 0,
      worldScaleX : 1,
      worldScaleY : 1,
      /**
       * @param {?} flipX
       * @param {?} flipY
       * @return {undefined}
       */
      updateWorldTransform : function(flipX, flipY) {
        var parent = this.parent;
        if (null != parent) {
          this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
          this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
          /** @type {number} */
          this.worldScaleX = parent.worldScaleX * this.scaleX;
          /** @type {number} */
          this.worldScaleY = parent.worldScaleY * this.scaleY;
          this.worldRotation = parent.worldRotation + this.rotation;
        } else {
          this.worldX = this.x;
          this.worldY = this.y;
          this.worldScaleX = this.scaleX;
          this.worldScaleY = this.scaleY;
          this.worldRotation = this.rotation;
        }
        /** @type {number} */
        var radians = this.worldRotation * Math.PI / 180;
        /** @type {number} */
        var cos = Math.cos(radians);
        /** @type {number} */
        var sin = Math.sin(radians);
        /** @type {number} */
        this.m00 = cos * this.worldScaleX;
        /** @type {number} */
        this.m10 = sin * this.worldScaleX;
        /** @type {number} */
        this.m01 = -sin * this.worldScaleY;
        /** @type {number} */
        this.m11 = cos * this.worldScaleY;
        if (flipX) {
          /** @type {number} */
          this.m00 = -this.m00;
          /** @type {number} */
          this.m01 = -this.m01;
        }
        if (flipY) {
          /** @type {number} */
          this.m10 = -this.m10;
          /** @type {number} */
          this.m11 = -this.m11;
        }
        if (spine.Bone.yDown) {
          /** @type {number} */
          this.m10 = -this.m10;
          /** @type {number} */
          this.m11 = -this.m11;
        }
      },
      /**
       * @return {undefined}
       */
      setToSetupPose : function() {
        var data = this.data;
        this.x = data.x;
        this.y = data.y;
        this.rotation = data.rotation;
        this.scaleX = data.scaleX;
        this.scaleY = data.scaleY;
      }
    };
    /**
     * @param {Object} slotData
     * @param {?} skeleton
     * @param {string} bone
     * @return {undefined}
     */
    spine.Slot = function(slotData, skeleton, bone) {
      /** @type {Object} */
      this.data = slotData;
      this.skeleton = skeleton;
      /** @type {string} */
      this.bone = bone;
      this.setToSetupPose();
    };
    spine.Slot.prototype = {
      r : 1,
      g : 1,
      b : 1,
      a : 1,
      _attachmentTime : 0,
      attachment : null,
      /**
       * @param {Function} attachment
       * @return {undefined}
       */
      setAttachment : function(attachment) {
        /** @type {Function} */
        this.attachment = attachment;
        this._attachmentTime = this.skeleton.time;
      },
      /**
       * @param {?} time
       * @return {undefined}
       */
      setAttachmentTime : function(time) {
        /** @type {number} */
        this._attachmentTime = this.skeleton.time - time;
      },
      /**
       * @return {?}
       */
      getAttachmentTime : function() {
        return this.skeleton.time - this._attachmentTime;
      },
      /**
       * @return {undefined}
       */
      setToSetupPose : function() {
        var data = this.data;
        this.r = data.r;
        this.g = data.g;
        this.b = data.b;
        this.a = data.a;
        var employees = this.skeleton.data.slots;
        /** @type {number} */
        var i = 0;
        var l = employees.length;
        for (;l > i;i++) {
          if (employees[i] == data) {
            this.setAttachment(data.attachmentName ? this.skeleton.getAttachmentBySlotIndex(i, data.attachmentName) : null);
            break;
          }
        }
      }
    };
    /**
     * @param {string} name
     * @return {undefined}
     */
    spine.Skin = function(name) {
      /** @type {string} */
      this.name = name;
      this.attachments = {};
    };
    spine.Skin.prototype = {
      /**
       * @param {string} slotIndex
       * @param {string} name
       * @param {?} attachment
       * @return {undefined}
       */
      addAttachment : function(slotIndex, name, attachment) {
        this.attachments[slotIndex + ":" + name] = attachment;
      },
      /**
       * @param {number} slotIndex
       * @param {string} name
       * @return {?}
       */
      getAttachment : function(slotIndex, name) {
        return this.attachments[slotIndex + ":" + name];
      },
      /**
       * @param {?} skeleton
       * @param {Object} oldSkin
       * @return {undefined}
       */
      _attachAll : function(skeleton, oldSkin) {
        var key;
        for (key in oldSkin.attachments) {
          /** @type {number} */
          var colon = key.indexOf(":");
          /** @type {number} */
          var slotIndex = parseInt(key.substring(0, colon), 10);
          /** @type {string} */
          var name = key.substring(colon + 1);
          var slot = skeleton.slots[slotIndex];
          if (slot.attachment && slot.attachment.name == name) {
            var attachment = this.getAttachment(slotIndex, name);
            if (attachment) {
              slot.setAttachment(attachment);
            }
          }
        }
      }
    };
    /**
     * @param {string} name
     * @param {?} timelines
     * @param {number} duration
     * @return {undefined}
     */
    spine.Animation = function(name, timelines, duration) {
      /** @type {string} */
      this.name = name;
      this.timelines = timelines;
      /** @type {number} */
      this.duration = duration;
    };
    spine.Animation.prototype = {
      /**
       * @param {?} fn
       * @param {number} time
       * @param {number} alpha
       * @return {undefined}
       */
      apply : function(fn, time, alpha) {
        if (alpha) {
          if (this.duration) {
            time %= this.duration;
          }
        }
        var q = this.timelines;
        /** @type {number} */
        var i = 0;
        var l = q.length;
        for (;l > i;i++) {
          q[i].apply(fn, time, 1);
        }
      },
      /**
       * @param {?} task
       * @param {number} time
       * @param {?} weight
       * @param {number} alpha
       * @return {undefined}
       */
      mix : function(task, time, weight, alpha) {
        if (weight) {
          if (this.duration) {
            time %= this.duration;
          }
        }
        var q = this.timelines;
        /** @type {number} */
        var i = 0;
        var l = q.length;
        for (;l > i;i++) {
          q[i].apply(task, time, alpha);
        }
      }
    };
    /**
     * @param {?} values
     * @param {Object} target
     * @param {number} step
     * @return {?}
     */
    spine.binarySearch = function(values, target, step) {
      /** @type {number} */
      var low = 0;
      /** @type {number} */
      var high = Math.floor(values.length / step) - 2;
      if (!high) {
        return step;
      }
      /** @type {number} */
      var current = high >>> 1;
      for (;;) {
        if (values[(current + 1) * step] <= target ? low = current + 1 : high = current, low == high) {
          return(low + 1) * step;
        }
        /** @type {number} */
        current = low + high >>> 1;
      }
    };
    /**
     * @param {Array} values
     * @param {?} target
     * @param {number} step
     * @return {?}
     */
    spine.linearSearch = function(values, target, step) {
      /** @type {number} */
      var i = 0;
      /** @type {number} */
      var last = values.length - step;
      for (;last >= i;i += step) {
        if (values[i] > target) {
          return i;
        }
      }
      return-1;
    };
    /**
     * @param {number} frameCount
     * @return {undefined}
     */
    spine.Curves = function(frameCount) {
      /** @type {Array} */
      this.curves = [];
      /** @type {number} */
      this.curves.length = 6 * (frameCount - 1);
    };
    spine.Curves.prototype = {
      /**
       * @param {number} frameIndex
       * @return {undefined}
       */
      setLinear : function(frameIndex) {
        /** @type {number} */
        this.curves[6 * frameIndex] = 0;
      },
      /**
       * @param {number} frameIndex
       * @return {undefined}
       */
      setStepped : function(frameIndex) {
        /** @type {number} */
        this.curves[6 * frameIndex] = -1;
      },
      /**
       * @param {number} frameIndex
       * @param {number} m10
       * @param {number} a00
       * @param {number} cp2x
       * @param {number} cp1y
       * @return {undefined}
       */
      setCurve : function(frameIndex, m10, a00, cp2x, cp1y) {
        /** @type {number} */
        var t1 = 0.1;
        /** @type {number} */
        var t2 = t1 * t1;
        /** @type {number} */
        var b21 = t2 * t1;
        /** @type {number} */
        var b00 = 3 * t1;
        /** @type {number} */
        var b10 = 3 * t2;
        /** @type {number} */
        var x = 6 * t2;
        /** @type {number} */
        var y = 6 * b21;
        var m11 = 2 * -m10 + cp2x;
        var a01 = 2 * -a00 + cp1y;
        /** @type {number} */
        var a10 = 3 * (m10 - cp2x) + 1;
        /** @type {number} */
        var a11 = 3 * (a00 - cp1y) + 1;
        /** @type {number} */
        var row = 6 * frameIndex;
        var mat = this.curves;
        /** @type {number} */
        mat[row] = m10 * b00 + m11 * b10 + a10 * b21;
        /** @type {number} */
        mat[row + 1] = a00 * b00 + a01 * b10 + a11 * b21;
        /** @type {number} */
        mat[row + 2] = m11 * x + a10 * y;
        /** @type {number} */
        mat[row + 3] = a01 * x + a11 * y;
        /** @type {number} */
        mat[row + 4] = a10 * y;
        /** @type {number} */
        mat[row + 5] = a11 * y;
      },
      /**
       * @param {number} frameIndex
       * @param {number} percent
       * @return {?}
       */
      getCurvePercent : function(frameIndex, percent) {
        percent = 0 > percent ? 0 : percent > 1 ? 1 : percent;
        /** @type {number} */
        var curveIndex = 6 * frameIndex;
        var curves = this.curves;
        var dfx = curves[curveIndex];
        if (!dfx) {
          return percent;
        }
        if (-1 == dfx) {
          return 0;
        }
        var dfy = curves[curveIndex + 1];
        var ddfx = curves[curveIndex + 2];
        var ddfy = curves[curveIndex + 3];
        var dddfx = curves[curveIndex + 4];
        var dddfy = curves[curveIndex + 5];
        var x = dfx;
        var y = dfy;
        /** @type {number} */
        var c = 8;
        for (;;) {
          if (x >= percent) {
            /** @type {number} */
            var lastX = x - dfx;
            /** @type {number} */
            var lastY = y - dfy;
            return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
          }
          if (!c) {
            break;
          }
          c--;
          dfx += ddfx;
          dfy += ddfy;
          ddfx += dddfx;
          ddfy += dddfy;
          x += dfx;
          y += dfy;
        }
        return y + (1 - y) * (percent - x) / (1 - x);
      }
    };
    /**
     * @param {number} frameCount
     * @return {undefined}
     */
    spine.RotateTimeline = function(frameCount) {
      this.curves = new spine.Curves(frameCount);
      /** @type {Array} */
      this.frames = [];
      /** @type {number} */
      this.frames.length = 2 * frameCount;
    };
    spine.RotateTimeline.prototype = {
      boneIndex : 0,
      /**
       * @return {?}
       */
      getFrameCount : function() {
        return this.frames.length / 2;
      },
      /**
       * @param {number} frameIndex
       * @param {?} time
       * @param {Function} a
       * @return {undefined}
       */
      setFrame : function(frameIndex, time, a) {
        frameIndex *= 2;
        this.frames[frameIndex] = time;
        /** @type {Function} */
        this.frames[frameIndex + 1] = a;
      },
      /**
       * @param {?} fn
       * @param {Object} time
       * @param {number} alpha
       * @return {?}
       */
      apply : function(fn, time, alpha) {
        var amount;
        var frames = this.frames;
        if (!(time < frames[0])) {
          var bone = fn.bones[this.boneIndex];
          if (time >= frames[frames.length - 2]) {
            /** @type {number} */
            amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
            for (;amount > 180;) {
              amount -= 360;
            }
            for (;-180 > amount;) {
              amount += 360;
            }
            return void(bone.rotation += amount * alpha);
          }
          var frameIndex = spine.binarySearch(frames, time, 2);
          var lastFrameValue = frames[frameIndex - 1];
          var frameTime = frames[frameIndex];
          /** @type {number} */
          var percent = 1 - (time - frameTime) / (frames[frameIndex - 2] - frameTime);
          percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);
          /** @type {number} */
          amount = frames[frameIndex + 1] - lastFrameValue;
          for (;amount > 180;) {
            amount -= 360;
          }
          for (;-180 > amount;) {
            amount += 360;
          }
          /** @type {number} */
          amount = bone.data.rotation + (lastFrameValue + amount * percent) - bone.rotation;
          for (;amount > 180;) {
            amount -= 360;
          }
          for (;-180 > amount;) {
            amount += 360;
          }
          bone.rotation += amount * alpha;
        }
      }
    };
    /**
     * @param {number} frameCount
     * @return {undefined}
     */
    spine.TranslateTimeline = function(frameCount) {
      this.curves = new spine.Curves(frameCount);
      /** @type {Array} */
      this.frames = [];
      /** @type {number} */
      this.frames.length = 3 * frameCount;
    };
    spine.TranslateTimeline.prototype = {
      boneIndex : 0,
      /**
       * @return {?}
       */
      getFrameCount : function() {
        return this.frames.length / 3;
      },
      /**
       * @param {number} frameIndex
       * @param {?} time
       * @param {Function} a
       * @param {Function} g
       * @return {undefined}
       */
      setFrame : function(frameIndex, time, a, g) {
        frameIndex *= 3;
        this.frames[frameIndex] = time;
        /** @type {Function} */
        this.frames[frameIndex + 1] = a;
        /** @type {Function} */
        this.frames[frameIndex + 2] = g;
      },
      /**
       * @param {?} fn
       * @param {Object} time
       * @param {number} alpha
       * @return {?}
       */
      apply : function(fn, time, alpha) {
        var frames = this.frames;
        if (!(time < frames[0])) {
          var bone = fn.bones[this.boneIndex];
          if (time >= frames[frames.length - 3]) {
            return bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha, void(bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha);
          }
          var frameIndex = spine.binarySearch(frames, time, 3);
          var lastFrameX = frames[frameIndex - 2];
          var lastFrameY = frames[frameIndex - 1];
          var frameTime = frames[frameIndex];
          /** @type {number} */
          var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
          percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
          bone.x += (bone.data.x + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.x) * alpha;
          bone.y += (bone.data.y + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.y) * alpha;
        }
      }
    };
    /**
     * @param {number} frameCount
     * @return {undefined}
     */
    spine.ScaleTimeline = function(frameCount) {
      this.curves = new spine.Curves(frameCount);
      /** @type {Array} */
      this.frames = [];
      /** @type {number} */
      this.frames.length = 3 * frameCount;
    };
    spine.ScaleTimeline.prototype = {
      boneIndex : 0,
      /**
       * @return {?}
       */
      getFrameCount : function() {
        return this.frames.length / 3;
      },
      /**
       * @param {number} frameIndex
       * @param {?} time
       * @param {Function} a
       * @param {Function} g
       * @return {undefined}
       */
      setFrame : function(frameIndex, time, a, g) {
        frameIndex *= 3;
        this.frames[frameIndex] = time;
        /** @type {Function} */
        this.frames[frameIndex + 1] = a;
        /** @type {Function} */
        this.frames[frameIndex + 2] = g;
      },
      /**
       * @param {?} fn
       * @param {Object} time
       * @param {number} alpha
       * @return {?}
       */
      apply : function(fn, time, alpha) {
        var frames = this.frames;
        if (!(time < frames[0])) {
          var bone = fn.bones[this.boneIndex];
          if (time >= frames[frames.length - 3]) {
            return bone.scaleX += (bone.data.scaleX - 1 + frames[frames.length - 2] - bone.scaleX) * alpha, void(bone.scaleY += (bone.data.scaleY - 1 + frames[frames.length - 1] - bone.scaleY) * alpha);
          }
          var frameIndex = spine.binarySearch(frames, time, 3);
          var lastFrameX = frames[frameIndex - 2];
          var lastFrameY = frames[frameIndex - 1];
          var frameTime = frames[frameIndex];
          /** @type {number} */
          var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
          percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
          bone.scaleX += (bone.data.scaleX - 1 + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.scaleX) * alpha;
          bone.scaleY += (bone.data.scaleY - 1 + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.scaleY) * alpha;
        }
      }
    };
    /**
     * @param {number} frameCount
     * @return {undefined}
     */
    spine.ColorTimeline = function(frameCount) {
      this.curves = new spine.Curves(frameCount);
      /** @type {Array} */
      this.frames = [];
      /** @type {number} */
      this.frames.length = 5 * frameCount;
    };
    spine.ColorTimeline.prototype = {
      slotIndex : 0,
      /**
       * @return {?}
       */
      getFrameCount : function() {
        return this.frames.length / 2;
      },
      /**
       * @param {number} frameIndex
       * @param {?} time
       * @return {undefined}
       */
      setFrame : function(frameIndex, time) {
        frameIndex *= 5;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + 1] = r;
        this.frames[frameIndex + 2] = g;
        this.frames[frameIndex + 3] = b;
        this.frames[frameIndex + 4] = a;
      },
      /**
       * @param {?} fn
       * @param {Object} time
       * @param {number} alpha
       * @return {?}
       */
      apply : function(fn, time, alpha) {
        var frames = this.frames;
        if (!(time < frames[0])) {
          var slot = fn.slots[this.slotIndex];
          if (time >= frames[frames.length - 5]) {
            /** @type {number} */
            var i = frames.length - 1;
            return slot.r = frames[i - 3], slot.g = frames[i - 2], slot.b = frames[i - 1], void(slot.a = frames[i]);
          }
          var frameIndex = spine.binarySearch(frames, time, 5);
          var lastFrameR = frames[frameIndex - 4];
          var lastFrameG = frames[frameIndex - 3];
          var lastFrameB = frames[frameIndex - 2];
          var lastFrameA = frames[frameIndex - 1];
          var frameTime = frames[frameIndex];
          /** @type {number} */
          var percent = 1 - (time - frameTime) / (frames[frameIndex - 5] - frameTime);
          percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);
          var r = lastFrameR + (frames[frameIndex + 1] - lastFrameR) * percent;
          var g = lastFrameG + (frames[frameIndex + 2] - lastFrameG) * percent;
          var b = lastFrameB + (frames[frameIndex + 3] - lastFrameB) * percent;
          var a = lastFrameA + (frames[frameIndex + 4] - lastFrameA) * percent;
          if (1 > alpha) {
            slot.r += (r - slot.r) * alpha;
            slot.g += (g - slot.g) * alpha;
            slot.b += (b - slot.b) * alpha;
            slot.a += (a - slot.a) * alpha;
          } else {
            slot.r = r;
            slot.g = g;
            slot.b = b;
            slot.a = a;
          }
        }
      }
    };
    /**
     * @param {number} frameCount
     * @return {undefined}
     */
    spine.AttachmentTimeline = function(frameCount) {
      this.curves = new spine.Curves(frameCount);
      /** @type {Array} */
      this.frames = [];
      /** @type {number} */
      this.frames.length = frameCount;
      /** @type {Array} */
      this.attachmentNames = [];
      /** @type {number} */
      this.attachmentNames.length = frameCount;
    };
    spine.AttachmentTimeline.prototype = {
      slotIndex : 0,
      /**
       * @return {?}
       */
      getFrameCount : function() {
        return this.frames.length;
      },
      /**
       * @param {number} frameIndex
       * @param {?} time
       * @param {?} attachmentName
       * @return {undefined}
       */
      setFrame : function(frameIndex, time, attachmentName) {
        this.frames[frameIndex] = time;
        this.attachmentNames[frameIndex] = attachmentName;
      },
      /**
       * @param {?} fn
       * @param {Object} time
       * @return {undefined}
       */
      apply : function(fn, time) {
        var frames = this.frames;
        if (!(time < frames[0])) {
          var frameIndex;
          /** @type {number} */
          frameIndex = time >= frames[frames.length - 1] ? frames.length - 1 : spine.binarySearch(frames, time, 1) - 1;
          var attachmentName = this.attachmentNames[frameIndex];
          fn.slots[this.slotIndex].setAttachment(attachmentName ? fn.getAttachmentBySlotIndex(this.slotIndex, attachmentName) : null);
        }
      }
    };
    /**
     * @return {undefined}
     */
    spine.SkeletonData = function() {
      /** @type {Array} */
      this.bones = [];
      /** @type {Array} */
      this.slots = [];
      /** @type {Array} */
      this.skins = [];
      /** @type {Array} */
      this.animations = [];
    };
    spine.SkeletonData.prototype = {
      defaultSkin : null,
      /**
       * @param {?} boneName
       * @return {?}
       */
      findBone : function(boneName) {
        var bones = this.bones;
        /** @type {number} */
        var i = 0;
        var l = bones.length;
        for (;l > i;i++) {
          if (bones[i].name == boneName) {
            return bones[i];
          }
        }
        return null;
      },
      /**
       * @param {string} boneName
       * @return {?}
       */
      findBoneIndex : function(boneName) {
        var bones = this.bones;
        /** @type {number} */
        var i = 0;
        var l = bones.length;
        for (;l > i;i++) {
          if (bones[i].name == boneName) {
            return i;
          }
        }
        return-1;
      },
      /**
       * @param {?} slotName
       * @return {?}
       */
      findSlot : function(slotName) {
        var slots = this.slots;
        /** @type {number} */
        var i = 0;
        var l = slots.length;
        for (;l > i;i++) {
          if (slots[i].name == slotName) {
            return slot[i];
          }
        }
        return null;
      },
      /**
       * @param {string} slotName
       * @return {?}
       */
      findSlotIndex : function(slotName) {
        var slots = this.slots;
        /** @type {number} */
        var i = 0;
        var l = slots.length;
        for (;l > i;i++) {
          if (slots[i].name == slotName) {
            return i;
          }
        }
        return-1;
      },
      /**
       * @param {string} skinName
       * @return {?}
       */
      findSkin : function(skinName) {
        var skins = this.skins;
        /** @type {number} */
        var i = 0;
        var n = skins.length;
        for (;n > i;i++) {
          if (skins[i].name == skinName) {
            return skins[i];
          }
        }
        return null;
      },
      /**
       * @param {string} animationName
       * @return {?}
       */
      findAnimation : function(animationName) {
        var animations = this.animations;
        /** @type {number} */
        var i = 0;
        var l = animations.length;
        for (;l > i;i++) {
          if (animations[i].name == animationName) {
            return animations[i];
          }
        }
        return null;
      }
    };
    /**
     * @param {Object} skeletonData
     * @return {undefined}
     */
    spine.Skeleton = function(skeletonData) {
      /** @type {Object} */
      this.data = skeletonData;
      /** @type {Array} */
      this.bones = [];
      /** @type {number} */
      var i = 0;
      var ilen = skeletonData.bones.length;
      for (;ilen > i;i++) {
        var boneData = skeletonData.bones[i];
        var parent = boneData.parent ? this.bones[skeletonData.bones.indexOf(boneData.parent)] : null;
        this.bones.push(new spine.Bone(boneData, parent));
      }
      /** @type {Array} */
      this.slots = [];
      /** @type {Array} */
      this.drawOrder = [];
      /** @type {number} */
      i = 0;
      ilen = skeletonData.slots.length;
      for (;ilen > i;i++) {
        var slotData = skeletonData.slots[i];
        var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
        var slot = new spine.Slot(slotData, this, bone);
        this.slots.push(slot);
        this.drawOrder.push(slot);
      }
    };
    spine.Skeleton.prototype = {
      x : 0,
      y : 0,
      skin : null,
      r : 1,
      g : 1,
      b : 1,
      a : 1,
      time : 0,
      flipX : false,
      flipY : false,
      /**
       * @return {undefined}
       */
      updateWorldTransform : function() {
        var flipX = this.flipX;
        var flipY = this.flipY;
        var bones = this.bones;
        /** @type {number} */
        var i = 0;
        var l = bones.length;
        for (;l > i;i++) {
          bones[i].updateWorldTransform(flipX, flipY);
        }
      },
      /**
       * @return {undefined}
       */
      setToSetupPose : function() {
        this.setBonesToSetupPose();
        this.setSlotsToSetupPose();
      },
      /**
       * @return {undefined}
       */
      setBonesToSetupPose : function() {
        var bones = this.bones;
        /** @type {number} */
        var i = 0;
        var l = bones.length;
        for (;l > i;i++) {
          bones[i].setToSetupPose();
        }
      },
      /**
       * @return {undefined}
       */
      setSlotsToSetupPose : function() {
        var slots = this.slots;
        /** @type {number} */
        var i = 0;
        var l = slots.length;
        for (;l > i;i++) {
          slots[i].setToSetupPose(i);
        }
      },
      /**
       * @return {?}
       */
      getRootBone : function() {
        return this.bones.length ? this.bones[0] : null;
      },
      /**
       * @param {?} boneName
       * @return {?}
       */
      findBone : function(boneName) {
        var bones = this.bones;
        /** @type {number} */
        var i = 0;
        var l = bones.length;
        for (;l > i;i++) {
          if (bones[i].data.name == boneName) {
            return bones[i];
          }
        }
        return null;
      },
      /**
       * @param {string} boneName
       * @return {?}
       */
      findBoneIndex : function(boneName) {
        var bones = this.bones;
        /** @type {number} */
        var i = 0;
        var l = bones.length;
        for (;l > i;i++) {
          if (bones[i].data.name == boneName) {
            return i;
          }
        }
        return-1;
      },
      /**
       * @param {?} slotName
       * @return {?}
       */
      findSlot : function(slotName) {
        var slots = this.slots;
        /** @type {number} */
        var i = 0;
        var l = slots.length;
        for (;l > i;i++) {
          if (slots[i].data.name == slotName) {
            return slots[i];
          }
        }
        return null;
      },
      /**
       * @param {string} slotName
       * @return {?}
       */
      findSlotIndex : function(slotName) {
        var slots = this.slots;
        /** @type {number} */
        var i = 0;
        var l = slots.length;
        for (;l > i;i++) {
          if (slots[i].data.name == slotName) {
            return i;
          }
        }
        return-1;
      },
      /**
       * @param {string} skinName
       * @return {undefined}
       */
      setSkinByName : function(skinName) {
        var skin = this.data.findSkin(skinName);
        if (!skin) {
          throw "Skin not found: " + skinName;
        }
        this.setSkin(skin);
      },
      /**
       * @param {?} newSkin
       * @return {undefined}
       */
      setSkin : function(newSkin) {
        if (this.skin) {
          if (newSkin) {
            newSkin._attachAll(this, this.skin);
          }
        }
        this.skin = newSkin;
      },
      /**
       * @param {string} slotName
       * @param {string} attachmentName
       * @return {?}
       */
      getAttachmentBySlotName : function(slotName, attachmentName) {
        return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
      },
      /**
       * @param {number} slotIndex
       * @param {string} attachmentName
       * @return {?}
       */
      getAttachmentBySlotIndex : function(slotIndex, attachmentName) {
        if (this.skin) {
          var attachment = this.skin.getAttachment(slotIndex, attachmentName);
          if (attachment) {
            return attachment;
          }
        }
        return this.data.defaultSkin ? this.data.defaultSkin.getAttachment(slotIndex, attachmentName) : null;
      },
      /**
       * @param {string} slotName
       * @param {Object} attachmentName
       * @return {?}
       */
      setAttachment : function(slotName, attachmentName) {
        var options = this.slots;
        /** @type {number} */
        var i = 0;
        var len = options.size;
        for (;len > i;i++) {
          var slot = options[i];
          if (slot.data.name == slotName) {
            /** @type {null} */
            var attachment = null;
            if (attachmentName && (attachment = this.getAttachment(i, attachmentName), null == attachment)) {
              throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
            }
            return void slot.setAttachment(attachment);
          }
        }
        throw "Slot not found: " + slotName;
      },
      /**
       * @param {number} delta
       * @return {undefined}
       */
      update : function(delta) {
        time += delta;
      }
    };
    spine.AttachmentType = {
      region : 0
    };
    /**
     * @return {undefined}
     */
    spine.RegionAttachment = function() {
      /** @type {Array} */
      this.offset = [];
      /** @type {number} */
      this.offset.length = 8;
      /** @type {Array} */
      this.uvs = [];
      /** @type {number} */
      this.uvs.length = 8;
    };
    spine.RegionAttachment.prototype = {
      x : 0,
      y : 0,
      rotation : 0,
      scaleX : 1,
      scaleY : 1,
      width : 0,
      height : 0,
      rendererObject : null,
      regionOffsetX : 0,
      regionOffsetY : 0,
      regionWidth : 0,
      regionHeight : 0,
      regionOriginalWidth : 0,
      regionOriginalHeight : 0,
      /**
       * @param {?} v
       * @param {?} v2
       * @param {?} u2
       * @param {?} u
       * @param {?} rotate
       * @return {undefined}
       */
      setUVs : function(v, v2, u2, u, rotate) {
        var uvs = this.uvs;
        if (rotate) {
          uvs[2] = v;
          uvs[3] = u;
          uvs[4] = v;
          uvs[5] = v2;
          uvs[6] = u2;
          uvs[7] = v2;
          uvs[0] = u2;
          uvs[1] = u;
        } else {
          uvs[0] = v;
          uvs[1] = u;
          uvs[2] = v;
          uvs[3] = v2;
          uvs[4] = u2;
          uvs[5] = v2;
          uvs[6] = u2;
          uvs[7] = u;
        }
      },
      /**
       * @return {undefined}
       */
      updateOffset : function() {
        /** @type {number} */
        var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
        /** @type {number} */
        var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
        /** @type {number} */
        var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
        /** @type {number} */
        var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
        /** @type {number} */
        var localX2 = localX + this.regionWidth * regionScaleX;
        /** @type {number} */
        var localY2 = localY + this.regionHeight * regionScaleY;
        /** @type {number} */
        var radians = this.rotation * Math.PI / 180;
        /** @type {number} */
        var cos = Math.cos(radians);
        /** @type {number} */
        var sin = Math.sin(radians);
        var localX2Cos = localX * cos + this.x;
        /** @type {number} */
        var localXSin = localX * sin;
        var localY2Cos = localY * cos + this.y;
        /** @type {number} */
        var localYSin = localY * sin;
        var localXCos = localX2 * cos + this.x;
        /** @type {number} */
        var localX2Sin = localX2 * sin;
        var localYCos = localY2 * cos + this.y;
        /** @type {number} */
        var localY2Sin = localY2 * sin;
        var offset = this.offset;
        /** @type {number} */
        offset[0] = localX2Cos - localYSin;
        offset[1] = localY2Cos + localXSin;
        /** @type {number} */
        offset[2] = localX2Cos - localY2Sin;
        offset[3] = localYCos + localXSin;
        /** @type {number} */
        offset[4] = localXCos - localY2Sin;
        offset[5] = localYCos + localX2Sin;
        /** @type {number} */
        offset[6] = localXCos - localYSin;
        offset[7] = localY2Cos + localX2Sin;
      },
      /**
       * @param {number} x
       * @param {number} y
       * @param {?} bone
       * @param {Array} resultVec
       * @return {undefined}
       */
      computeVertices : function(x, y, bone, resultVec) {
        x += bone.worldX;
        y += bone.worldY;
        var m00 = bone.m00;
        var m01 = bone.m01;
        var m10 = bone.m10;
        var m11 = bone.m11;
        var offset = this.offset;
        resultVec[0] = offset[0] * m00 + offset[1] * m01 + x;
        resultVec[1] = offset[0] * m10 + offset[1] * m11 + y;
        resultVec[2] = offset[2] * m00 + offset[3] * m01 + x;
        resultVec[3] = offset[2] * m10 + offset[3] * m11 + y;
        resultVec[4] = offset[4] * m00 + offset[5] * m01 + x;
        resultVec[5] = offset[4] * m10 + offset[5] * m11 + y;
        resultVec[6] = offset[6] * m00 + offset[7] * m01 + x;
        resultVec[7] = offset[6] * m10 + offset[7] * m11 + y;
      }
    };
    /**
     * @param {?} skeletonData
     * @return {undefined}
     */
    spine.AnimationStateData = function(skeletonData) {
      this.skeletonData = skeletonData;
      this.animationToMixTime = {};
    };
    spine.AnimationStateData.prototype = {
      defaultMix : 0,
      /**
       * @param {string} fromName
       * @param {string} toName
       * @param {number} duration
       * @return {undefined}
       */
      setMixByName : function(fromName, toName, duration) {
        var from = this.skeletonData.findAnimation(fromName);
        if (!from) {
          throw "Animation not found: " + fromName;
        }
        var to = this.skeletonData.findAnimation(toName);
        if (!to) {
          throw "Animation not found: " + toName;
        }
        this.setMix(from, to, duration);
      },
      /**
       * @param {Function} to
       * @param {Function} from
       * @param {number} duration
       * @return {undefined}
       */
      setMix : function(to, from, duration) {
        /** @type {number} */
        this.animationToMixTime[to.name + ":" + from.name] = duration;
      },
      /**
       * @param {Function} from
       * @param {(Error|string)} to
       * @return {?}
       */
      getMix : function(from, to) {
        var time = this.animationToMixTime[from.name + ":" + to.name];
        return time ? time : this.defaultMix;
      }
    };
    /**
     * @param {Object} node
     * @return {undefined}
     */
    spine.AnimationState = function(node) {
      /** @type {Object} */
      this.data = node;
      /** @type {Array} */
      this.queue = [];
    };
    spine.AnimationState.prototype = {
      current : null,
      previous : null,
      currentTime : 0,
      previousTime : 0,
      currentLoop : false,
      previousLoop : false,
      mixTime : 0,
      mixDuration : 0,
      /**
       * @param {?} delta
       * @return {undefined}
       */
      update : function(delta) {
        if (this.currentTime += delta, this.previousTime += delta, this.mixTime += delta, this.queue.length > 0) {
          var o = this.queue[0];
          if (this.currentTime >= o.delay) {
            this._setAnimation(o.animation, o.loop);
            this.queue.shift();
          }
        }
      },
      /**
       * @param {?} fn
       * @return {undefined}
       */
      apply : function(fn) {
        if (this.current) {
          if (this.previous) {
            this.previous.apply(fn, this.previousTime, this.previousLoop);
            /** @type {number} */
            var newA = this.mixTime / this.mixDuration;
            if (newA >= 1) {
              /** @type {number} */
              newA = 1;
              /** @type {null} */
              this.previous = null;
            }
            this.current.mix(fn, this.currentTime, this.currentLoop, newA);
          } else {
            this.current.apply(fn, this.currentTime, this.currentLoop);
          }
        }
      },
      /**
       * @return {undefined}
       */
      clearAnimation : function() {
        /** @type {null} */
        this.previous = null;
        /** @type {null} */
        this.current = null;
        /** @type {number} */
        this.queue.length = 0;
      },
      /**
       * @param {string} data
       * @param {?} dataAndEvents
       * @return {undefined}
       */
      _setAnimation : function(data, dataAndEvents) {
        /** @type {null} */
        this.previous = null;
        if (data) {
          if (this.current) {
            this.mixDuration = this.data.getMix(this.current, data);
            if (this.mixDuration > 0) {
              /** @type {number} */
              this.mixTime = 0;
              this.previous = this.current;
              this.previousTime = this.currentTime;
              this.previousLoop = this.currentLoop;
            }
          }
        }
        /** @type {string} */
        this.current = data;
        this.currentLoop = dataAndEvents;
        /** @type {number} */
        this.currentTime = 0;
      },
      /**
       * @param {string} animationName
       * @param {boolean} dataAndEvents
       * @return {undefined}
       */
      setAnimationByName : function(animationName, dataAndEvents) {
        var restoreScript = this.data.skeletonData.findAnimation(animationName);
        if (!restoreScript) {
          throw "Animation not found: " + animationName;
        }
        this.setAnimation(restoreScript, dataAndEvents);
      },
      /**
       * @param {string} callback
       * @param {boolean} dataAndEvents
       * @return {undefined}
       */
      setAnimation : function(callback, dataAndEvents) {
        /** @type {number} */
        this.queue.length = 0;
        this._setAnimation(callback, dataAndEvents);
      },
      /**
       * @param {string} animationName
       * @param {boolean} loop
       * @param {number} delay
       * @return {undefined}
       */
      addAnimationByName : function(animationName, loop, delay) {
        var animation = this.data.skeletonData.findAnimation(animationName);
        if (!animation) {
          throw "Animation not found: " + animationName;
        }
        this.addAnimation(animation, loop, delay);
      },
      /**
       * @param {string} animation
       * @param {boolean} loop
       * @param {number} delay
       * @return {undefined}
       */
      addAnimation : function(animation, loop, delay) {
        var entry = {};
        if (entry.animation = animation, entry.loop = loop, !delay || 0 >= delay) {
          var pos = this.queue.length ? this.queue[this.queue.length - 1].animation : this.current;
          delay = null != pos ? pos.duration - this.data.getMix(pos, animation) + (delay || 0) : 0;
        }
        /** @type {number} */
        entry.delay = delay;
        this.queue.push(entry);
      },
      /**
       * @return {?}
       */
      isComplete : function() {
        return!this.current || this.currentTime >= this.current.duration;
      }
    };
    /**
     * @param {?} attachmentLoader
     * @return {undefined}
     */
    spine.SkeletonJson = function(attachmentLoader) {
      this.attachmentLoader = attachmentLoader;
    };
    spine.SkeletonJson.prototype = {
      scale : 1,
      /**
       * @param {?} json
       * @return {?}
       */
      readSkeletonData : function(json) {
        var boneData;
        var skeletonData = new spine.SkeletonData;
        var params = json.bones;
        /** @type {number} */
        var i = 0;
        var len = params.length;
        for (;len > i;i++) {
          var param = params[i];
          /** @type {null} */
          var parent = null;
          if (param.parent && (parent = skeletonData.findBone(param.parent), !parent)) {
            throw "Parent bone not found: " + param.parent;
          }
          boneData = new spine.BoneData(param.name, parent);
          /** @type {number} */
          boneData.length = (param.length || 0) * this.scale;
          /** @type {number} */
          boneData.x = (param.x || 0) * this.scale;
          /** @type {number} */
          boneData.y = (param.y || 0) * this.scale;
          boneData.rotation = param.rotation || 0;
          boneData.scaleX = param.scaleX || 1;
          boneData.scaleY = param.scaleY || 1;
          skeletonData.bones.push(boneData);
        }
        var rawParams = json.slots;
        /** @type {number} */
        i = 0;
        len = rawParams.length;
        for (;len > i;i++) {
          var other = rawParams[i];
          if (boneData = skeletonData.findBone(other.bone), !boneData) {
            throw "Slot bone not found: " + other.bone;
          }
          var slotData = new spine.SlotData(other.name, boneData);
          var color = other.color;
          if (color) {
            slotData.r = spine.SkeletonJson.toColor(color, 0);
            slotData.g = spine.SkeletonJson.toColor(color, 1);
            slotData.b = spine.SkeletonJson.toColor(color, 2);
            slotData.a = spine.SkeletonJson.toColor(color, 3);
          }
          slotData.attachmentName = other.attachment;
          skeletonData.slots.push(slotData);
        }
        var skins = json.skins;
        var skinName;
        for (skinName in skins) {
          if (skins.hasOwnProperty(skinName)) {
            var skinMap = skins[skinName];
            var skin = new spine.Skin(skinName);
            var slotName;
            for (slotName in skinMap) {
              if (skinMap.hasOwnProperty(slotName)) {
                var slotIndex = skeletonData.findSlotIndex(slotName);
                var slotEntry = skinMap[slotName];
                var attachmentName;
                for (attachmentName in slotEntry) {
                  if (slotEntry.hasOwnProperty(attachmentName)) {
                    var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
                    if (null != attachment) {
                      skin.addAttachment(slotIndex, attachmentName, attachment);
                    }
                  }
                }
              }
            }
            skeletonData.skins.push(skin);
            if ("default" == skin.name) {
              skeletonData.defaultSkin = skin;
            }
          }
        }
        var animations = json.animations;
        var animationName;
        for (animationName in animations) {
          if (animations.hasOwnProperty(animationName)) {
            this.readAnimation(animationName, animations[animationName], skeletonData);
          }
        }
        return skeletonData;
      },
      /**
       * @param {?} skin
       * @param {string} name
       * @param {Object} props
       * @return {?}
       */
      readAttachment : function(skin, name, props) {
        name = props.name || name;
        var region = spine.AttachmentType[props.type || "region"];
        if (region == spine.AttachmentType.region) {
          var obj = new spine.RegionAttachment;
          return obj.x = (props.x || 0) * this.scale, obj.y = (props.y || 0) * this.scale, obj.scaleX = props.scaleX || 1, obj.scaleY = props.scaleY || 1, obj.rotation = props.rotation || 0, obj.width = (props.width || 32) * this.scale, obj.height = (props.height || 32) * this.scale, obj.updateOffset(), obj.rendererObject = {}, obj.rendererObject.name = name, obj.rendererObject.scale = {}, obj.rendererObject.scale.x = obj.scaleX, obj.rendererObject.scale.y = obj.scaleY, obj.rendererObject.rotation = 
          -obj.rotation * Math.PI / 180, obj;
        }
        throw "Unknown attachment type: " + region;
      },
      /**
       * @param {string} name
       * @param {?} skeleton
       * @param {?} skeletonData
       * @return {undefined}
       */
      readAnimation : function(name, skeleton, skeletonData) {
        var frameIndex;
        var timeline;
        var key;
        var e;
        var values;
        var i;
        var vlen;
        /** @type {Array} */
        var timelines = [];
        /** @type {number} */
        var duration = 0;
        var bones = skeleton.bones;
        var boneName;
        for (boneName in bones) {
          if (bones.hasOwnProperty(boneName)) {
            var boneIndex = skeletonData.findBoneIndex(boneName);
            if (-1 == boneIndex) {
              throw "Bone not found: " + boneName;
            }
            var attrs = bones[boneName];
            for (key in attrs) {
              if (attrs.hasOwnProperty(key)) {
                if (values = attrs[key], "rotate" == key) {
                  timeline = new spine.RotateTimeline(values.length);
                  timeline.boneIndex = boneIndex;
                  /** @type {number} */
                  frameIndex = 0;
                  /** @type {number} */
                  i = 0;
                  vlen = values.length;
                  for (;vlen > i;i++) {
                    e = values[i];
                    timeline.setFrame(frameIndex, e.time, e.angle);
                    spine.SkeletonJson.readCurve(timeline, frameIndex, e);
                    frameIndex++;
                  }
                  timelines.push(timeline);
                  /** @type {number} */
                  duration = Math.max(duration, timeline.frames[2 * timeline.getFrameCount() - 2]);
                } else {
                  if ("translate" != key && "scale" != key) {
                    throw "Invalid timeline type for a bone: " + key + " (" + boneName + ")";
                  }
                  /** @type {number} */
                  var timelineScale = 1;
                  if ("scale" == key) {
                    timeline = new spine.ScaleTimeline(values.length);
                  } else {
                    timeline = new spine.TranslateTimeline(values.length);
                    timelineScale = this.scale;
                  }
                  timeline.boneIndex = boneIndex;
                  /** @type {number} */
                  frameIndex = 0;
                  /** @type {number} */
                  i = 0;
                  vlen = values.length;
                  for (;vlen > i;i++) {
                    e = values[i];
                    /** @type {number} */
                    var x = (e.x || 0) * timelineScale;
                    /** @type {number} */
                    var y = (e.y || 0) * timelineScale;
                    timeline.setFrame(frameIndex, e.time, x, y);
                    spine.SkeletonJson.readCurve(timeline, frameIndex, e);
                    frameIndex++;
                  }
                  timelines.push(timeline);
                  /** @type {number} */
                  duration = Math.max(duration, timeline.frames[3 * timeline.getFrameCount() - 3]);
                }
              }
            }
          }
        }
        var slots = skeleton.slots;
        var slotName;
        for (slotName in slots) {
          if (slots.hasOwnProperty(slotName)) {
            var context = slots[slotName];
            var slotIndex = skeletonData.findSlotIndex(slotName);
            for (key in context) {
              if (context.hasOwnProperty(key)) {
                if (values = context[key], "color" == key) {
                  timeline = new spine.ColorTimeline(values.length);
                  timeline.slotIndex = slotIndex;
                  /** @type {number} */
                  frameIndex = 0;
                  /** @type {number} */
                  i = 0;
                  vlen = values.length;
                  for (;vlen > i;i++) {
                    e = values[i];
                    var color = e.color;
                    var r = spine.SkeletonJson.toColor(color, 0);
                    var g = spine.SkeletonJson.toColor(color, 1);
                    var b = spine.SkeletonJson.toColor(color, 2);
                    var a = spine.SkeletonJson.toColor(color, 3);
                    timeline.setFrame(frameIndex, e.time, r, g, b, a);
                    spine.SkeletonJson.readCurve(timeline, frameIndex, e);
                    frameIndex++;
                  }
                  timelines.push(timeline);
                  /** @type {number} */
                  duration = Math.max(duration, timeline.frames[5 * timeline.getFrameCount() - 5]);
                } else {
                  if ("attachment" != key) {
                    throw "Invalid timeline type for a slot: " + key + " (" + slotName + ")";
                  }
                  timeline = new spine.AttachmentTimeline(values.length);
                  timeline.slotIndex = slotIndex;
                  /** @type {number} */
                  frameIndex = 0;
                  /** @type {number} */
                  i = 0;
                  vlen = values.length;
                  for (;vlen > i;i++) {
                    e = values[i];
                    timeline.setFrame(frameIndex++, e.time, e.name);
                  }
                  timelines.push(timeline);
                  /** @type {number} */
                  duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                }
              }
            }
          }
        }
        skeletonData.animations.push(new spine.Animation(name, timelines, duration));
      }
    };
    /**
     * @param {?} timeline
     * @param {number} frameIndex
     * @param {?} s
     * @return {undefined}
     */
    spine.SkeletonJson.readCurve = function(timeline, frameIndex, s) {
      var curve = s.curve;
      if (curve) {
        if ("stepped" == curve) {
          timeline.curves.setStepped(frameIndex);
        } else {
          if (curve instanceof Array) {
            timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
          }
        }
      }
    };
    /**
     * @param {string} hexString
     * @param {number} expectedNumberOfNonCommentArgs
     * @return {?}
     */
    spine.SkeletonJson.toColor = function(hexString, expectedNumberOfNonCommentArgs) {
      if (8 != hexString.length) {
        throw "Color hexidecimal length must be 8, recieved: " + hexString;
      }
      return parseInt(hexString.substring(2 * expectedNumberOfNonCommentArgs, 2), 16) / 255;
    };
    /**
     * @param {?} atlasText
     * @param {Object} textureLoader
     * @return {undefined}
     */
    spine.Atlas = function(atlasText, textureLoader) {
      /** @type {Object} */
      this.textureLoader = textureLoader;
      /** @type {Array} */
      this.pages = [];
      /** @type {Array} */
      this.regions = [];
      var reader = new spine.AtlasReader(atlasText);
      /** @type {Array} */
      var tuple = [];
      /** @type {number} */
      tuple.length = 4;
      /** @type {null} */
      var page = null;
      for (;;) {
        var line = reader.readLine();
        if (null == line) {
          break;
        }
        if (line = reader.trim(line), line.length) {
          if (page) {
            var region = new spine.AtlasRegion;
            region.name = line;
            region.page = page;
            /** @type {boolean} */
            region.rotate = "true" == reader.readValue();
            reader.readTuple(tuple);
            /** @type {number} */
            var x = parseInt(tuple[0], 10);
            /** @type {number} */
            var y = parseInt(tuple[1], 10);
            reader.readTuple(tuple);
            /** @type {number} */
            var width = parseInt(tuple[0], 10);
            /** @type {number} */
            var height = parseInt(tuple[1], 10);
            /** @type {number} */
            region.u = x / page.width;
            /** @type {number} */
            region.v = y / page.height;
            if (region.rotate) {
              /** @type {number} */
              region.u2 = (x + height) / page.width;
              /** @type {number} */
              region.v2 = (y + width) / page.height;
            } else {
              /** @type {number} */
              region.u2 = (x + width) / page.width;
              /** @type {number} */
              region.v2 = (y + height) / page.height;
            }
            /** @type {number} */
            region.x = x;
            /** @type {number} */
            region.y = y;
            /** @type {number} */
            region.width = Math.abs(width);
            /** @type {number} */
            region.height = Math.abs(height);
            if (4 == reader.readTuple(tuple)) {
              /** @type {Array} */
              region.splits = [parseInt(tuple[0], 10), parseInt(tuple[1], 10), parseInt(tuple[2], 10), parseInt(tuple[3], 10)];
              if (4 == reader.readTuple(tuple)) {
                /** @type {Array} */
                region.pads = [parseInt(tuple[0], 10), parseInt(tuple[1], 10), parseInt(tuple[2], 10), parseInt(tuple[3], 10)];
                reader.readTuple(tuple);
              }
            }
            /** @type {number} */
            region.originalWidth = parseInt(tuple[0], 10);
            /** @type {number} */
            region.originalHeight = parseInt(tuple[1], 10);
            reader.readTuple(tuple);
            /** @type {number} */
            region.offsetX = parseInt(tuple[0], 10);
            /** @type {number} */
            region.offsetY = parseInt(tuple[1], 10);
            /** @type {number} */
            region.index = parseInt(reader.readValue(), 10);
            this.regions.push(region);
          } else {
            page = new spine.AtlasPage;
            page.name = line;
            page.format = spine.Atlas.Format[reader.readValue()];
            reader.readTuple(tuple);
            page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
            page.magFilter = spine.Atlas.TextureFilter[tuple[1]];
            var center = reader.readValue();
            /** @type {number} */
            page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
            /** @type {number} */
            page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
            if ("x" == center) {
              /** @type {number} */
              page.uWrap = spine.Atlas.TextureWrap.repeat;
            } else {
              if ("y" == center) {
                /** @type {number} */
                page.vWrap = spine.Atlas.TextureWrap.repeat;
              } else {
                if ("xy" == center) {
                  /** @type {number} */
                  page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;
                }
              }
            }
            textureLoader.load(page, line);
            this.pages.push(page);
          }
        } else {
          /** @type {null} */
          page = null;
        }
      }
    };
    spine.Atlas.prototype = {
      /**
       * @param {string} name
       * @return {?}
       */
      findRegion : function(name) {
        var regions = this.regions;
        /** @type {number} */
        var i = 0;
        var n = regions.length;
        for (;n > i;i++) {
          if (regions[i].name == name) {
            return regions[i];
          }
        }
        return null;
      },
      /**
       * @return {undefined}
       */
      dispose : function() {
        var pages = this.pages;
        /** @type {number} */
        var i = 0;
        var l = pages.length;
        for (;l > i;i++) {
          this.textureLoader.unload(pages[i].rendererObject);
        }
      },
      /**
       * @param {?} page
       * @return {undefined}
       */
      updateUVs : function(page) {
        var regions = this.regions;
        /** @type {number} */
        var i = 0;
        var n = regions.length;
        for (;n > i;i++) {
          var region = regions[i];
          if (region.page == page) {
            /** @type {number} */
            region.u = region.x / page.width;
            /** @type {number} */
            region.v = region.y / page.height;
            if (region.rotate) {
              /** @type {number} */
              region.u2 = (region.x + region.height) / page.width;
              /** @type {number} */
              region.v2 = (region.y + region.width) / page.height;
            } else {
              /** @type {number} */
              region.u2 = (region.x + region.width) / page.width;
              /** @type {number} */
              region.v2 = (region.y + region.height) / page.height;
            }
          }
        }
      }
    };
    spine.Atlas.Format = {
      alpha : 0,
      intensity : 1,
      luminanceAlpha : 2,
      rgb565 : 3,
      rgba4444 : 4,
      rgb888 : 5,
      rgba8888 : 6
    };
    spine.Atlas.TextureFilter = {
      nearest : 0,
      linear : 1,
      mipMap : 2,
      mipMapNearestNearest : 3,
      mipMapLinearNearest : 4,
      mipMapNearestLinear : 5,
      mipMapLinearLinear : 6
    };
    spine.Atlas.TextureWrap = {
      mirroredRepeat : 0,
      clampToEdge : 1,
      repeat : 2
    };
    /**
     * @return {undefined}
     */
    spine.AtlasPage = function() {
    };
    spine.AtlasPage.prototype = {
      name : null,
      format : null,
      minFilter : null,
      magFilter : null,
      uWrap : null,
      vWrap : null,
      rendererObject : null,
      width : 0,
      height : 0
    };
    /**
     * @return {undefined}
     */
    spine.AtlasRegion = function() {
    };
    spine.AtlasRegion.prototype = {
      page : null,
      name : null,
      x : 0,
      y : 0,
      width : 0,
      height : 0,
      u : 0,
      v : 0,
      u2 : 0,
      v2 : 0,
      offsetX : 0,
      offsetY : 0,
      originalWidth : 0,
      originalHeight : 0,
      index : 0,
      rotate : false,
      splits : null,
      pads : null
    };
    /**
     * @param {string} text
     * @return {undefined}
     */
    spine.AtlasReader = function(text) {
      this.lines = text.split(/\r\n|\r|\n/);
    };
    spine.AtlasReader.prototype = {
      index : 0,
      /**
       * @param {string} str
       * @return {?}
       */
      trim : function(str) {
        return str.replace(/^\s+|\s+$/g, "");
      },
      /**
       * @return {?}
       */
      readLine : function() {
        return this.index >= this.lines.length ? null : this.lines[this.index++];
      },
      /**
       * @return {?}
       */
      readValue : function() {
        var line = this.readLine();
        var colonIndex = line.indexOf(":");
        if (-1 == colonIndex) {
          throw "Invalid line: " + line;
        }
        return this.trim(line.substring(colonIndex + 1));
      },
      /**
       * @param {Array} tuple
       * @return {?}
       */
      readTuple : function(tuple) {
        var line = this.readLine();
        var colon = line.indexOf(":");
        if (-1 == colon) {
          throw "Invalid line: " + line;
        }
        /** @type {number} */
        var i = 0;
        var lastMatch = colon + 1;
        for (;3 > i;i++) {
          var comma = line.indexOf(",", lastMatch);
          if (-1 == comma) {
            if (!i) {
              throw "Invalid line: " + line;
            }
            break;
          }
          tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
          lastMatch = comma + 1;
        }
        return tuple[i] = this.trim(line.substring(lastMatch)), i + 1;
      }
    };
    /**
     * @param {(RegExp|string)} atlas
     * @return {undefined}
     */
    spine.AtlasAttachmentLoader = function(atlas) {
      /** @type {(RegExp|string)} */
      this.atlas = atlas;
    };
    spine.AtlasAttachmentLoader.prototype = {
      /**
       * @param {?} type
       * @param {string} dataAndEvents
       * @param {string} name
       * @return {?}
       */
      newAttachment : function(type, dataAndEvents, name) {
        switch(dataAndEvents) {
          case spine.AttachmentType.region:
            var region = this.atlas.findRegion(name);
            if (!region) {
              throw "Region not found in atlas: " + name + " (" + dataAndEvents + ")";
            }
            var attachment = new spine.RegionAttachment(name);
            return attachment.rendererObject = region, attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate), attachment.regionOffsetX = region.offsetX, attachment.regionOffsetY = region.offsetY, attachment.regionWidth = region.width, attachment.regionHeight = region.height, attachment.regionOriginalWidth = region.originalWidth, attachment.regionOriginalHeight = region.originalHeight, attachment;
        }
        throw "Unknown attachment type: " + dataAndEvents;
      }
    };
    /** @type {boolean} */
    spine.Bone.yDown = true;
    PIXI.AnimCache = {};
    /**
     * @param {string} cacheKey
     * @return {undefined}
     */
    PIXI.Spine = function(cacheKey) {
      if (PIXI.DisplayObjectContainer.call(this), this.spineData = PIXI.AnimCache[cacheKey], !this.spineData) {
        throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: " + cacheKey);
      }
      this.skeleton = new spine.Skeleton(this.spineData);
      this.skeleton.updateWorldTransform();
      this.stateData = new spine.AnimationStateData(this.spineData);
      this.state = new spine.AnimationState(this.stateData);
      /** @type {Array} */
      this.slotContainers = [];
      /** @type {number} */
      var i = 0;
      var l = this.skeleton.drawOrder.length;
      for (;l > i;i++) {
        var item = this.skeleton.drawOrder[i];
        var attachment = item.attachment;
        var container = new PIXI.DisplayObjectContainer;
        if (this.slotContainers.push(container), this.addChild(container), attachment instanceof spine.RegionAttachment) {
          var n = attachment.rendererObject.name;
          var me = this.createSprite(item, attachment.rendererObject);
          item.currentSprite = me;
          item.currentSpriteName = n;
          container.addChild(me);
        }
      }
    };
    /** @type {Object} */
    PIXI.Spine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    /** @type {function (string): undefined} */
    PIXI.Spine.prototype.constructor = PIXI.Spine;
    /**
     * @return {undefined}
     */
    PIXI.Spine.prototype.updateTransform = function() {
      this.lastTime = this.lastTime || Date.now();
      /** @type {number} */
      var delta = 0.001 * (Date.now() - this.lastTime);
      /** @type {number} */
      this.lastTime = Date.now();
      this.state.update(delta);
      this.state.apply(this.skeleton);
      this.skeleton.updateWorldTransform();
      var employees = this.skeleton.drawOrder;
      /** @type {number} */
      var i = 0;
      var l = employees.length;
      for (;l > i;i++) {
        var self = employees[i];
        var attachment = self.attachment;
        var c = this.slotContainers[i];
        if (attachment instanceof spine.RegionAttachment) {
          if (attachment.rendererObject && (!self.currentSpriteName || self.currentSpriteName != attachment.name)) {
            var name = attachment.rendererObject.name;
            if (void 0 !== self.currentSprite && (self.currentSprite.visible = false), self.sprites = self.sprites || {}, void 0 !== self.sprites[name]) {
              /** @type {boolean} */
              self.sprites[name].visible = true;
            } else {
              var s = this.createSprite(self, attachment.rendererObject);
              c.addChild(s);
            }
            self.currentSprite = self.sprites[name];
            self.currentSpriteName = name;
          }
          /** @type {boolean} */
          c.visible = true;
          var parent = self.bone;
          c.position.x = parent.worldX + attachment.x * parent.m00 + attachment.y * parent.m01;
          c.position.y = parent.worldY + attachment.x * parent.m10 + attachment.y * parent.m11;
          c.scale.x = parent.worldScaleX;
          c.scale.y = parent.worldScaleY;
          /** @type {number} */
          c.rotation = -(self.bone.worldRotation * Math.PI / 180);
        } else {
          /** @type {boolean} */
          c.visible = false;
        }
      }
      PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
    /**
     * @param {?} self
     * @param {Object} options
     * @return {?}
     */
    PIXI.Spine.prototype.createSprite = function(self, options) {
      var modId = PIXI.TextureCache[options.name] ? options.name : options.name + ".png";
      var data = new PIXI.Sprite(PIXI.Texture.fromFrame(modId));
      return data.scale = options.scale, data.rotation = options.rotation, data.anchor.x = data.anchor.y = 0.5, self.sprites = self.sprites || {}, self.sprites[options.name] = data, data;
    };
    PIXI.BaseTextureCache = {};
    /** @type {Array} */
    PIXI.texturesToUpdate = [];
    /** @type {Array} */
    PIXI.texturesToDestroy = [];
    /** @type {number} */
    PIXI.BaseTextureCacheIdGenerator = 0;
    /**
     * @param {?} source
     * @param {(number|string)} opt_behavior
     * @return {undefined}
     */
    PIXI.BaseTexture = function(source, opt_behavior) {
      if (PIXI.EventTarget.call(this), this.width = 100, this.height = 100, this.scaleMode = opt_behavior || PIXI.scaleModes.DEFAULT, this.hasLoaded = false, this.source = source, this.id = PIXI.BaseTextureCacheIdGenerator++, this._glTextures = [], source) {
        if ((this.source.complete || this.source.getContext) && (this.source.width && this.source.height)) {
          /** @type {boolean} */
          this.hasLoaded = true;
          this.width = this.source.width;
          this.height = this.source.height;
          PIXI.texturesToUpdate.push(this);
        } else {
          var scope = this;
          /**
           * @return {undefined}
           */
          this.source.onload = function() {
            /** @type {boolean} */
            scope.hasLoaded = true;
            scope.width = scope.source.width;
            scope.height = scope.source.height;
            PIXI.texturesToUpdate.push(scope);
            scope.dispatchEvent({
              type : "loaded",
              content : scope
            });
          };
        }
        /** @type {null} */
        this.imageUrl = null;
        /** @type {boolean} */
        this._powerOf2 = false;
      }
    };
    /** @type {function (?, (number|string)): undefined} */
    PIXI.BaseTexture.prototype.constructor = PIXI.BaseTexture;
    /**
     * @return {undefined}
     */
    PIXI.BaseTexture.prototype.destroy = function() {
      if (this.imageUrl) {
        delete PIXI.BaseTextureCache[this.imageUrl];
        /** @type {null} */
        this.imageUrl = null;
        /** @type {null} */
        this.source.src = null;
      }
      /** @type {null} */
      this.source = null;
      PIXI.texturesToDestroy.push(this);
    };
    /**
     * @param {string} poster
     * @return {undefined}
     */
    PIXI.BaseTexture.prototype.updateSourceImage = function(poster) {
      /** @type {boolean} */
      this.hasLoaded = false;
      /** @type {null} */
      this.source.src = null;
      /** @type {string} */
      this.source.src = poster;
    };
    /**
     * @param {string} imageUrl
     * @param {boolean} crossorigin
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, deepDataAndEvents) {
      var baseTexture = PIXI.BaseTextureCache[imageUrl];
      if (void 0 === crossorigin && (-1 === imageUrl.indexOf("data:") && (crossorigin = true)), !baseTexture) {
        /** @type {Image} */
        var image = new Image;
        if (crossorigin) {
          /** @type {string} */
          image.crossOrigin = "";
        }
        /** @type {string} */
        image.src = imageUrl;
        baseTexture = new PIXI.BaseTexture(image, deepDataAndEvents);
        /** @type {string} */
        baseTexture.imageUrl = imageUrl;
        PIXI.BaseTextureCache[imageUrl] = baseTexture;
      }
      return baseTexture;
    };
    /**
     * @param {Element} canvas
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    PIXI.BaseTexture.fromCanvas = function(canvas, deepDataAndEvents) {
      if (!canvas._pixiId) {
        /** @type {string} */
        canvas._pixiId = "canvas_" + PIXI.TextureCacheIdGenerator++;
      }
      var game = PIXI.BaseTextureCache[canvas._pixiId];
      return game || (game = new PIXI.BaseTexture(canvas, deepDataAndEvents), PIXI.BaseTextureCache[canvas._pixiId] = game), game;
    };
    PIXI.TextureCache = {};
    PIXI.FrameCache = {};
    /** @type {number} */
    PIXI.TextureCacheIdGenerator = 0;
    /**
     * @param {Object} baseTexture
     * @param {number} frameIndex
     * @return {undefined}
     */
    PIXI.Texture = function(baseTexture, frameIndex) {
      if (PIXI.EventTarget.call(this), frameIndex || (this.noFrame = true, frameIndex = new PIXI.Rectangle(0, 0, 1, 1)), baseTexture instanceof PIXI.Texture && (baseTexture = baseTexture.baseTexture), this.baseTexture = baseTexture, this.frame = frameIndex, this.trim = null, this.scope = this, this._uvs = null, baseTexture.hasLoaded) {
        if (this.noFrame) {
          frameIndex = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
        }
        this.setFrame(frameIndex);
      } else {
        var scope = this;
        baseTexture.addEventListener("loaded", function() {
          scope.onBaseTextureLoaded();
        });
      }
    };
    /** @type {function (Object, number): undefined} */
    PIXI.Texture.prototype.constructor = PIXI.Texture;
    /**
     * @return {undefined}
     */
    PIXI.Texture.prototype.onBaseTextureLoaded = function() {
      var baseTexture = this.baseTexture;
      baseTexture.removeEventListener("loaded", this.onLoaded);
      if (this.noFrame) {
        this.frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
      }
      this.setFrame(this.frame);
      this.scope.dispatchEvent({
        type : "update",
        content : this
      });
    };
    /**
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    PIXI.Texture.prototype.destroy = function(dataAndEvents) {
      if (dataAndEvents) {
        this.baseTexture.destroy();
      }
    };
    /**
     * @param {number} frame
     * @return {undefined}
     */
    PIXI.Texture.prototype.setFrame = function(frame) {
      if (this.frame = frame, this.width = frame.width, this.height = frame.height, frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height) {
        throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
      }
      /** @type {boolean} */
      this.updateFrame = true;
      PIXI.Texture.frameUpdates.push(this);
    };
    /**
     * @return {undefined}
     */
    PIXI.Texture.prototype._updateWebGLuvs = function() {
      if (!this._uvs) {
        this._uvs = new PIXI.TextureUvs;
      }
      var frame = this.frame;
      var tw = this.baseTexture.width;
      var th = this.baseTexture.height;
      /** @type {number} */
      this._uvs.x0 = frame.x / tw;
      /** @type {number} */
      this._uvs.y0 = frame.y / th;
      /** @type {number} */
      this._uvs.x1 = (frame.x + frame.width) / tw;
      /** @type {number} */
      this._uvs.y1 = frame.y / th;
      /** @type {number} */
      this._uvs.x2 = (frame.x + frame.width) / tw;
      /** @type {number} */
      this._uvs.y2 = (frame.y + frame.height) / th;
      /** @type {number} */
      this._uvs.x3 = frame.x / tw;
      /** @type {number} */
      this._uvs.y3 = (frame.y + frame.height) / th;
    };
    /**
     * @param {string} imageUrl
     * @param {boolean} crossorigin
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    PIXI.Texture.fromImage = function(imageUrl, crossorigin, deepDataAndEvents) {
      var texture = PIXI.TextureCache[imageUrl];
      return texture || (texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(imageUrl, crossorigin, deepDataAndEvents)), PIXI.TextureCache[imageUrl] = texture), texture;
    };
    /**
     * @param {string} id
     * @return {?}
     */
    PIXI.Texture.fromFrame = function(id) {
      var texture = PIXI.TextureCache[id];
      if (!texture) {
        throw new Error('The frameId "' + id + '" does not exist in the texture cache ');
      }
      return texture;
    };
    /**
     * @param {Element} canvas
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    PIXI.Texture.fromCanvas = function(canvas, deepDataAndEvents) {
      var texture = PIXI.BaseTexture.fromCanvas(canvas, deepDataAndEvents);
      return new PIXI.Texture(texture);
    };
    /**
     * @param {?} texture
     * @param {?} id
     * @return {undefined}
     */
    PIXI.Texture.addTextureToCache = function(texture, id) {
      PIXI.TextureCache[id] = texture;
    };
    /**
     * @param {?} key
     * @return {?}
     */
    PIXI.Texture.removeTextureFromCache = function(key) {
      var label = PIXI.TextureCache[key];
      return delete PIXI.TextureCache[key], delete PIXI.BaseTextureCache[key], label;
    };
    /** @type {Array} */
    PIXI.Texture.frameUpdates = [];
    /**
     * @return {undefined}
     */
    PIXI.TextureUvs = function() {
      /** @type {number} */
      this.x0 = 0;
      /** @type {number} */
      this.y0 = 0;
      /** @type {number} */
      this.x1 = 0;
      /** @type {number} */
      this.y1 = 0;
      /** @type {number} */
      this.x2 = 0;
      /** @type {number} */
      this.y2 = 0;
      /** @type {number} */
      this.x3 = 0;
      /** @type {number} */
      this.y4 = 0;
    };
    /**
     * @param {(number|string)} width
     * @param {(number|string)} height
     * @param {number} renderer
     * @param {(number|string)} opt_behavior
     * @return {undefined}
     */
    PIXI.RenderTexture = function(width, height, renderer, opt_behavior) {
      if (PIXI.EventTarget.call(this), this.width = width || 100, this.height = height || 100, this.frame = new PIXI.Rectangle(0, 0, this.width, this.height), this.baseTexture = new PIXI.BaseTexture, this.baseTexture.width = this.width, this.baseTexture.height = this.height, this.baseTexture._glTextures = [], this.baseTexture.scaleMode = opt_behavior || PIXI.scaleModes.DEFAULT, this.baseTexture.hasLoaded = true, this.renderer = renderer || PIXI.defaultRenderer, this.renderer.type === PIXI.WEBGL_RENDERER) {
        var gl = this.renderer.gl;
        this.textureBuffer = new PIXI.FilterTexture(gl, this.width, this.height, this.baseTexture.scaleMode);
        this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture;
        this.render = this.renderWebGL;
        this.projection = new PIXI.Point(this.width / 2, -this.height / 2);
      } else {
        this.render = this.renderCanvas;
        this.textureBuffer = new PIXI.CanvasBuffer(this.width, this.height);
        this.baseTexture.source = this.textureBuffer.canvas;
      }
      PIXI.Texture.frameUpdates.push(this);
    };
    /** @type {Object} */
    PIXI.RenderTexture.prototype = Object.create(PIXI.Texture.prototype);
    /** @type {function ((number|string), (number|string), number, (number|string)): undefined} */
    PIXI.RenderTexture.prototype.constructor = PIXI.RenderTexture;
    /**
     * @param {number} w
     * @param {?} height
     * @return {undefined}
     */
    PIXI.RenderTexture.prototype.resize = function(w, height) {
      if (this.width = w, this.height = height, this.frame.width = this.width, this.frame.height = this.height, this.renderer.type === PIXI.WEBGL_RENDERER) {
        /** @type {number} */
        this.projection.x = this.width / 2;
        /** @type {number} */
        this.projection.y = -this.height / 2;
        var gl = this.renderer.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.baseTexture._glTextures[gl.id]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      } else {
        this.textureBuffer.resize(this.width, this.height);
      }
      PIXI.Texture.frameUpdates.push(this);
    };
    /**
     * @param {?} displayObject
     * @param {?} anchorPoint
     * @param {?} renderGroup
     * @return {undefined}
     */
    PIXI.RenderTexture.prototype.renderWebGL = function(displayObject, anchorPoint, renderGroup) {
      var gl = this.renderer.gl;
      gl.colorMask(true, true, true, true);
      gl.viewport(0, 0, this.width, this.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
      if (renderGroup) {
        this.textureBuffer.clear();
      }
      var children = displayObject.children;
      var originalWorldTransform = displayObject.worldTransform;
      displayObject.worldTransform = PIXI.RenderTexture.tempMatrix;
      /** @type {number} */
      displayObject.worldTransform.d = -1;
      /** @type {number} */
      displayObject.worldTransform.ty = -2 * this.projection.y;
      if (anchorPoint) {
        displayObject.worldTransform.tx = anchorPoint.x;
        displayObject.worldTransform.ty -= anchorPoint.y;
      }
      /** @type {number} */
      var i = 0;
      var l = children.length;
      for (;l > i;i++) {
        children[i].updateTransform();
      }
      PIXI.WebGLRenderer.updateTextures();
      this.renderer.renderDisplayObject(displayObject, this.projection, this.textureBuffer.frameBuffer);
      displayObject.worldTransform = originalWorldTransform;
    };
    /**
     * @param {?} displayObject
     * @param {?} anchorPoint
     * @param {?} renderer
     * @return {undefined}
     */
    PIXI.RenderTexture.prototype.renderCanvas = function(displayObject, anchorPoint, renderer) {
      var children = displayObject.children;
      var originalWorldTransform = displayObject.worldTransform;
      displayObject.worldTransform = PIXI.RenderTexture.tempMatrix;
      if (anchorPoint) {
        displayObject.worldTransform.tx = anchorPoint.x;
        displayObject.worldTransform.ty = anchorPoint.y;
      }
      /** @type {number} */
      var i = 0;
      var l = children.length;
      for (;l > i;i++) {
        children[i].updateTransform();
      }
      if (renderer) {
        this.textureBuffer.clear();
      }
      var _context = this.textureBuffer.context;
      this.renderer.renderDisplayObject(displayObject, _context);
      _context.setTransform(1, 0, 0, 1, 0, 0);
      displayObject.worldTransform = originalWorldTransform;
    };
    PIXI.RenderTexture.tempMatrix = new PIXI.Matrix;
    /**
     * @param {?} assetURLs
     * @param {number} crossorigin
     * @return {undefined}
     */
    PIXI.AssetLoader = function(assetURLs, crossorigin) {
      PIXI.EventTarget.call(this);
      this.assetURLs = assetURLs;
      /** @type {number} */
      this.crossorigin = crossorigin;
      this.loadersByType = {
        /** @type {function (string, boolean): undefined} */
        jpg : PIXI.ImageLoader,
        /** @type {function (string, boolean): undefined} */
        jpeg : PIXI.ImageLoader,
        /** @type {function (string, boolean): undefined} */
        png : PIXI.ImageLoader,
        /** @type {function (string, boolean): undefined} */
        gif : PIXI.ImageLoader,
        /** @type {function (string, ?): undefined} */
        json : PIXI.JsonLoader,
        /** @type {function (string, ?): undefined} */
        atlas : PIXI.AtlasLoader,
        /** @type {function (string, number): undefined} */
        anim : PIXI.SpineLoader,
        /** @type {function (string, number): undefined} */
        xml : PIXI.BitmapFontLoader,
        /** @type {function (string, number): undefined} */
        fnt : PIXI.BitmapFontLoader
      };
    };
    /** @type {function (?, number): undefined} */
    PIXI.AssetLoader.prototype.constructor = PIXI.AssetLoader;
    /**
     * @param {Object} input
     * @return {?}
     */
    PIXI.AssetLoader.prototype._getDataType = function(input) {
      /** @type {string} */
      var value = "data:";
      var item = input.slice(0, value.length).toLowerCase();
      if (item === value) {
        var template = input.slice(value.length);
        var end = template.indexOf(",");
        if (-1 === end) {
          return null;
        }
        var part = template.slice(0, end).split(";")[0];
        return part && "text/plain" !== part.toLowerCase() ? part.split("/").pop().toLowerCase() : "txt";
      }
      return null;
    };
    /**
     * @return {undefined}
     */
    PIXI.AssetLoader.prototype.load = function() {
      /**
       * @param {?} data
       * @return {undefined}
       */
      function onLoad(data) {
        scope.onAssetLoaded(data.content);
      }
      var scope = this;
      this.loadCount = this.assetURLs.length;
      /** @type {number} */
      var i = 0;
      for (;i < this.assetURLs.length;i++) {
        var fileName = this.assetURLs[i];
        var fileType = this._getDataType(fileName);
        if (!fileType) {
          fileType = fileName.split("?").shift().split(".").pop().toLowerCase();
        }
        var loaderClass = this.loadersByType[fileType];
        if (!loaderClass) {
          throw new Error(fileType + " is an unsupported file type");
        }
        var loader = new loaderClass(fileName, this.crossorigin);
        loader.addEventListener("loaded", onLoad);
        loader.load();
      }
    };
    /**
     * @param {Object} binding
     * @return {undefined}
     */
    PIXI.AssetLoader.prototype.onAssetLoaded = function(binding) {
      this.loadCount--;
      this.dispatchEvent({
        type : "onProgress",
        content : this,
        loader : binding
      });
      if (this.onProgress) {
        this.onProgress(binding);
      }
      if (!this.loadCount) {
        this.dispatchEvent({
          type : "onComplete",
          content : this
        });
        if (this.onComplete) {
          this.onComplete();
        }
      }
    };
    /**
     * @param {string} url
     * @param {?} crossorigin
     * @return {undefined}
     */
    PIXI.JsonLoader = function(url, crossorigin) {
      PIXI.EventTarget.call(this);
      /** @type {string} */
      this.url = url;
      this.crossorigin = crossorigin;
      this.baseUrl = url.replace(/[^\/]*$/, "");
      /** @type {boolean} */
      this.loaded = false;
    };
    /** @type {function (string, ?): undefined} */
    PIXI.JsonLoader.prototype.constructor = PIXI.JsonLoader;
    /**
     * @return {undefined}
     */
    PIXI.JsonLoader.prototype.load = function() {
      var scope = this;
      /** @type {(ActiveXObject|XMLHttpRequest)} */
      this.ajaxRequest = window.XMLHttpRequest ? new window.XMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP");
      /**
       * @return {undefined}
       */
      this.ajaxRequest.onload = function() {
        scope.onJSONLoaded();
      };
      this.ajaxRequest.open("GET", this.url, true);
      this.ajaxRequest.send();
    };
    /**
     * @return {?}
     */
    PIXI.JsonLoader.prototype.onJSONLoaded = function() {
      if (!this.ajaxRequest.responseText) {
        return void this.onError();
      }
      if (this.json = JSON.parse(this.ajaxRequest.responseText), this.json.frames) {
        var scope = this;
        var textureUrl = this.baseUrl + this.json.meta.image;
        var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
        var frames = this.json.frames;
        this.texture = image.texture.baseTexture;
        image.addEventListener("loaded", function() {
          scope.onLoaded();
        });
        var i;
        for (i in frames) {
          var rect = frames[i].frame;
          if (rect && (PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {
            x : rect.x,
            y : rect.y,
            width : rect.w,
            height : rect.h
          }), frames[i].trimmed)) {
            var buf = PIXI.TextureCache[i];
            var size = frames[i].sourceSize;
            var position = frames[i].spriteSourceSize;
            buf.trim = new PIXI.Rectangle(position.x, position.y, size.w, size.h);
          }
        }
        image.load();
      } else {
        if (this.json.bones) {
          var spineJsonParser = new spine.SkeletonJson;
          var skeletonData = spineJsonParser.readSkeletonData(this.json);
          PIXI.AnimCache[this.url] = skeletonData;
          this.onLoaded();
        } else {
          this.onLoaded();
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.JsonLoader.prototype.onLoaded = function() {
      /** @type {boolean} */
      this.loaded = true;
      this.dispatchEvent({
        type : "loaded",
        content : this
      });
    };
    /**
     * @return {undefined}
     */
    PIXI.JsonLoader.prototype.onError = function() {
      this.dispatchEvent({
        type : "error",
        content : this
      });
    };
    /**
     * @param {string} url
     * @param {?} crossorigin
     * @return {undefined}
     */
    PIXI.AtlasLoader = function(url, crossorigin) {
      PIXI.EventTarget.call(this);
      /** @type {string} */
      this.url = url;
      this.baseUrl = url.replace(/[^\/]*$/, "");
      this.crossorigin = crossorigin;
      /** @type {boolean} */
      this.loaded = false;
    };
    /** @type {function (string, ?): undefined} */
    PIXI.AtlasLoader.constructor = PIXI.AtlasLoader;
    /**
     * @return {undefined}
     */
    PIXI.AtlasLoader.prototype.load = function() {
      this.ajaxRequest = new PIXI.AjaxRequest;
      this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this);
      this.ajaxRequest.open("GET", this.url, true);
      if (this.ajaxRequest.overrideMimeType) {
        this.ajaxRequest.overrideMimeType("application/json");
      }
      this.ajaxRequest.send(null);
    };
    /**
     * @return {undefined}
     */
    PIXI.AtlasLoader.prototype.onAtlasLoaded = function() {
      if (4 === this.ajaxRequest.readyState) {
        if (200 === this.ajaxRequest.status || -1 === window.location.href.indexOf("http")) {
          this.atlas = {
            meta : {
              image : []
            },
            frames : []
          };
          var parts = this.ajaxRequest.responseText.split(/\r?\n/);
          /** @type {number} */
          var i = -3;
          /** @type {number} */
          var key = 0;
          /** @type {null} */
          var info = null;
          /** @type {boolean} */
          var j = false;
          /** @type {number} */
          var k = 0;
          /** @type {number} */
          var index = 0;
          var completed = this.onLoaded.bind(this);
          /** @type {number} */
          k = 0;
          for (;k < parts.length;k++) {
            if (parts[k] = parts[k].replace(/^\s+|\s+$/g, ""), "" === parts[k] && (j = k + 1), parts[k].length > 0) {
              if (j === k) {
                this.atlas.meta.image.push(parts[k]);
                /** @type {number} */
                key = this.atlas.meta.image.length - 1;
                this.atlas.frames.push({});
                /** @type {number} */
                i = -3;
              } else {
                if (i > 0) {
                  if (i % 7 === 1) {
                    if (null != info) {
                      this.atlas.frames[key][info.name] = info;
                    }
                    info = {
                      name : parts[k],
                      frame : {}
                    };
                  } else {
                    var match = parts[k].split(" ");
                    if (i % 7 === 3) {
                      /** @type {number} */
                      info.frame.x = Number(match[1].replace(",", ""));
                      /** @type {number} */
                      info.frame.y = Number(match[2]);
                    } else {
                      if (i % 7 === 4) {
                        /** @type {number} */
                        info.frame.w = Number(match[1].replace(",", ""));
                        /** @type {number} */
                        info.frame.h = Number(match[2]);
                      } else {
                        if (i % 7 === 5) {
                          var h = {
                            x : 0,
                            y : 0,
                            w : Number(match[1].replace(",", "")),
                            h : Number(match[2])
                          };
                          if (h.w > info.frame.w || h.h > info.frame.h) {
                            /** @type {boolean} */
                            info.trimmed = true;
                            info.realSize = h;
                          } else {
                            /** @type {boolean} */
                            info.trimmed = false;
                          }
                        }
                      }
                    }
                  }
                }
              }
              i++;
            }
          }
          if (null != info && (this.atlas.frames[key][info.name] = info), this.atlas.meta.image.length > 0) {
            /** @type {Array} */
            this.images = [];
            /** @type {number} */
            index = 0;
            for (;index < this.atlas.meta.image.length;index++) {
              var image = this.baseUrl + this.atlas.meta.image[index];
              var frames = this.atlas.frames[index];
              this.images.push(new PIXI.ImageLoader(image, this.crossorigin));
              for (k in frames) {
                var rect = frames[k].frame;
                if (rect) {
                  PIXI.TextureCache[k] = new PIXI.Texture(this.images[index].texture.baseTexture, {
                    x : rect.x,
                    y : rect.y,
                    width : rect.w,
                    height : rect.h
                  });
                  if (frames[k].trimmed) {
                    PIXI.TextureCache[k].realSize = frames[k].realSize;
                    /** @type {number} */
                    PIXI.TextureCache[k].trim.x = 0;
                    /** @type {number} */
                    PIXI.TextureCache[k].trim.y = 0;
                  }
                }
              }
            }
            /** @type {number} */
            this.currentImageId = 0;
            /** @type {number} */
            index = 0;
            for (;index < this.images.length;index++) {
              this.images[index].addEventListener("loaded", completed);
            }
            this.images[this.currentImageId].load();
          } else {
            this.onLoaded();
          }
        } else {
          this.onError();
        }
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.AtlasLoader.prototype.onLoaded = function() {
      if (this.images.length - 1 > this.currentImageId) {
        this.currentImageId++;
        this.images[this.currentImageId].load();
      } else {
        /** @type {boolean} */
        this.loaded = true;
        this.dispatchEvent({
          type : "loaded",
          content : this
        });
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.AtlasLoader.prototype.onError = function() {
      this.dispatchEvent({
        type : "error",
        content : this
      });
    };
    /**
     * @param {string} url
     * @param {number} crossorigin
     * @return {undefined}
     */
    PIXI.SpriteSheetLoader = function(url, crossorigin) {
      PIXI.EventTarget.call(this);
      /** @type {string} */
      this.url = url;
      /** @type {number} */
      this.crossorigin = crossorigin;
      this.baseUrl = url.replace(/[^\/]*$/, "");
      /** @type {null} */
      this.texture = null;
      this.frames = {};
    };
    /** @type {function (string, number): undefined} */
    PIXI.SpriteSheetLoader.prototype.constructor = PIXI.SpriteSheetLoader;
    /**
     * @return {undefined}
     */
    PIXI.SpriteSheetLoader.prototype.load = function() {
      var scope = this;
      var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
      jsonLoader.addEventListener("loaded", function(topic) {
        scope.json = topic.content.json;
        scope.onLoaded();
      });
      jsonLoader.load();
    };
    /**
     * @return {undefined}
     */
    PIXI.SpriteSheetLoader.prototype.onLoaded = function() {
      this.dispatchEvent({
        type : "loaded",
        content : this
      });
    };
    /**
     * @param {string} url
     * @param {boolean} crossorigin
     * @return {undefined}
     */
    PIXI.ImageLoader = function(url, crossorigin) {
      PIXI.EventTarget.call(this);
      this.texture = PIXI.Texture.fromImage(url, crossorigin);
      /** @type {Array} */
      this.frames = [];
    };
    /** @type {function (string, boolean): undefined} */
    PIXI.ImageLoader.prototype.constructor = PIXI.ImageLoader;
    /**
     * @return {undefined}
     */
    PIXI.ImageLoader.prototype.load = function() {
      if (this.texture.baseTexture.hasLoaded) {
        this.onLoaded();
      } else {
        var scope = this;
        this.texture.baseTexture.addEventListener("loaded", function() {
          scope.onLoaded();
        });
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.ImageLoader.prototype.onLoaded = function() {
      this.dispatchEvent({
        type : "loaded",
        content : this
      });
    };
    /**
     * @param {number} w
     * @param {number} height
     * @param {string} ns
     * @return {undefined}
     */
    PIXI.ImageLoader.prototype.loadFramedSpriteSheet = function(w, height, ns) {
      /** @type {Array} */
      this.frames = [];
      /** @type {number} */
      var ms = Math.floor(this.texture.width / w);
      /** @type {number} */
      var x = Math.floor(this.texture.height / height);
      /** @type {number} */
      var name = 0;
      /** @type {number} */
      var y = 0;
      for (;x > y;y++) {
        /** @type {number} */
        var s = 0;
        for (;ms > s;s++, name++) {
          var copies = new PIXI.Texture(this.texture, {
            x : s * w,
            y : y * height,
            width : w,
            height : height
          });
          this.frames.push(copies);
          if (ns) {
            PIXI.TextureCache[ns + "-" + name] = copies;
          }
        }
      }
      if (this.texture.baseTexture.hasLoaded) {
        this.onLoaded();
      } else {
        var scope = this;
        this.texture.baseTexture.addEventListener("loaded", function() {
          scope.onLoaded();
        });
      }
    };
    /**
     * @param {string} url
     * @param {number} crossorigin
     * @return {undefined}
     */
    PIXI.BitmapFontLoader = function(url, crossorigin) {
      PIXI.EventTarget.call(this);
      /** @type {string} */
      this.url = url;
      /** @type {number} */
      this.crossorigin = crossorigin;
      this.baseUrl = url.replace(/[^\/]*$/, "");
      /** @type {null} */
      this.texture = null;
    };
    /** @type {function (string, number): undefined} */
    PIXI.BitmapFontLoader.prototype.constructor = PIXI.BitmapFontLoader;
    /**
     * @return {undefined}
     */
    PIXI.BitmapFontLoader.prototype.load = function() {
      this.ajaxRequest = new PIXI.AjaxRequest;
      var scope = this;
      /**
       * @return {undefined}
       */
      this.ajaxRequest.onreadystatechange = function() {
        scope.onXMLLoaded();
      };
      this.ajaxRequest.open("GET", this.url, true);
      if (this.ajaxRequest.overrideMimeType) {
        this.ajaxRequest.overrideMimeType("application/xml");
      }
      this.ajaxRequest.send(null);
    };
    /**
     * @return {undefined}
     */
    PIXI.BitmapFontLoader.prototype.onXMLLoaded = function() {
      if (4 === this.ajaxRequest.readyState && (200 === this.ajaxRequest.status || -1 === window.location.protocol.indexOf("http"))) {
        var xml = this.ajaxRequest.responseXML;
        if (!xml || (/MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS)) {
          if ("function" == typeof window.DOMParser) {
            /** @type {DOMParser} */
            var parser = new DOMParser;
            /** @type {(Document|null)} */
            xml = parser.parseFromString(this.ajaxRequest.responseText, "text/xml");
          } else {
            /** @type {Element} */
            var wrapper = document.createElement("div");
            wrapper.innerHTML = this.ajaxRequest.responseText;
            /** @type {Element} */
            xml = wrapper;
          }
        }
        var textureUrl = this.baseUrl + xml.getElementsByTagName("page")[0].getAttribute("file");
        var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
        this.texture = image.texture.baseTexture;
        var data = {};
        var element = xml.getElementsByTagName("info")[0];
        var el = xml.getElementsByTagName("common")[0];
        data.font = element.getAttribute("face");
        /** @type {number} */
        data.size = parseInt(element.getAttribute("size"), 10);
        /** @type {number} */
        data.lineHeight = parseInt(el.getAttribute("lineHeight"), 10);
        data.chars = {};
        var resultItems = xml.getElementsByTagName("char");
        /** @type {number} */
        var i = 0;
        for (;i < resultItems.length;i++) {
          /** @type {number} */
          var charCode = parseInt(resultItems[i].getAttribute("id"), 10);
          var textureRect = new PIXI.Rectangle(parseInt(resultItems[i].getAttribute("x"), 10), parseInt(resultItems[i].getAttribute("y"), 10), parseInt(resultItems[i].getAttribute("width"), 10), parseInt(resultItems[i].getAttribute("height"), 10));
          data.chars[charCode] = {
            xOffset : parseInt(resultItems[i].getAttribute("xoffset"), 10),
            yOffset : parseInt(resultItems[i].getAttribute("yoffset"), 10),
            xAdvance : parseInt(resultItems[i].getAttribute("xadvance"), 10),
            kerning : {},
            texture : PIXI.TextureCache[charCode] = new PIXI.Texture(this.texture, textureRect)
          };
        }
        var codeSegments = xml.getElementsByTagName("kerning");
        /** @type {number} */
        i = 0;
        for (;i < codeSegments.length;i++) {
          /** @type {number} */
          var first = parseInt(codeSegments[i].getAttribute("first"), 10);
          /** @type {number} */
          var second = parseInt(codeSegments[i].getAttribute("second"), 10);
          /** @type {number} */
          var amount = parseInt(codeSegments[i].getAttribute("amount"), 10);
          /** @type {number} */
          data.chars[second].kerning[first] = amount;
        }
        PIXI.BitmapText.fonts[data.font] = data;
        var scope = this;
        image.addEventListener("loaded", function() {
          scope.onLoaded();
        });
        image.load();
      }
    };
    /**
     * @return {undefined}
     */
    PIXI.BitmapFontLoader.prototype.onLoaded = function() {
      this.dispatchEvent({
        type : "loaded",
        content : this
      });
    };
    /**
     * @param {string} url
     * @param {number} crossorigin
     * @return {undefined}
     */
    PIXI.SpineLoader = function(url, crossorigin) {
      PIXI.EventTarget.call(this);
      /** @type {string} */
      this.url = url;
      /** @type {number} */
      this.crossorigin = crossorigin;
      /** @type {boolean} */
      this.loaded = false;
    };
    /** @type {function (string, number): undefined} */
    PIXI.SpineLoader.prototype.constructor = PIXI.SpineLoader;
    /**
     * @return {undefined}
     */
    PIXI.SpineLoader.prototype.load = function() {
      var scope = this;
      var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
      jsonLoader.addEventListener("loaded", function(topic) {
        scope.json = topic.content.json;
        scope.onLoaded();
      });
      jsonLoader.load();
    };
    /**
     * @return {undefined}
     */
    PIXI.SpineLoader.prototype.onLoaded = function() {
      /** @type {boolean} */
      this.loaded = true;
      this.dispatchEvent({
        type : "loaded",
        content : this
      });
    };
    /**
     * @param {(Array|string)} dataAndEvents
     * @param {Function} uniforms
     * @return {undefined}
     */
    PIXI.AbstractFilter = function(dataAndEvents, uniforms) {
      /** @type {Array} */
      this.passes = [this];
      /** @type {Array} */
      this.shaders = [];
      /** @type {boolean} */
      this.dirty = true;
      /** @type {number} */
      this.padding = 0;
      this.uniforms = uniforms || {};
      this.fragmentSrc = dataAndEvents || [];
    };
    /**
     * @param {Object} options
     * @return {undefined}
     */
    PIXI.AlphaMaskFilter = function(options) {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      /** @type {boolean} */
      options.baseTexture._powerOf2 = true;
      this.uniforms = {
        mask : {
          type : "sampler2D",
          value : options
        },
        mapDimensions : {
          type : "2f",
          value : {
            x : 1,
            y : 5112
          }
        },
        dimensions : {
          type : "4fv",
          value : [0, 0, 0, 0]
        }
      };
      if (options.baseTexture.hasLoaded) {
        this.uniforms.mask.value.x = options.width;
        this.uniforms.mask.value.y = options.height;
      } else {
        this.boundLoadedFunction = this.onTextureLoaded.bind(this);
        options.baseTexture.on("loaded", this.boundLoadedFunction);
      }
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D mask;", "uniform sampler2D uSampler;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   mapCords *= dimensions.xy / mapDimensions;", "   vec4 original =  texture2D(uSampler, vTextureCoord);", 
      "   float maskAlpha =  texture2D(mask, mapCords).r;", "   original *= maskAlpha;", "   gl_FragColor =  original;", "}"];
    };
    /** @type {Object} */
    PIXI.AlphaMaskFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (Object): undefined} */
    PIXI.AlphaMaskFilter.prototype.constructor = PIXI.AlphaMaskFilter;
    /**
     * @return {undefined}
     */
    PIXI.AlphaMaskFilter.prototype.onTextureLoaded = function() {
      this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width;
      this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height;
      this.uniforms.mask.value.baseTexture.off("loaded", this.boundLoadedFunction);
    };
    Object.defineProperty(PIXI.AlphaMaskFilter.prototype, "map", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.mask.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.mask.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.ColorMatrixFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        matrix : {
          type : "mat4",
          value : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform mat4 matrix;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;", "}"];
    };
    /** @type {Object} */
    PIXI.ColorMatrixFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.ColorMatrixFilter.prototype.constructor = PIXI.ColorMatrixFilter;
    Object.defineProperty(PIXI.ColorMatrixFilter.prototype, "matrix", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.matrix.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.matrix.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.GrayFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        gray : {
          type : "1f",
          value : 1
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float gray;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);", "}"];
    };
    /** @type {Object} */
    PIXI.GrayFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.GrayFilter.prototype.constructor = PIXI.GrayFilter;
    Object.defineProperty(PIXI.GrayFilter.prototype, "gray", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.gray.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.gray.value = expectedHashCode;
      }
    });
    /**
     * @param {Object} options
     * @return {undefined}
     */
    PIXI.DisplacementFilter = function(options) {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      /** @type {boolean} */
      options.baseTexture._powerOf2 = true;
      this.uniforms = {
        displacementMap : {
          type : "sampler2D",
          value : options
        },
        scale : {
          type : "2f",
          value : {
            x : 30,
            y : 30
          }
        },
        offset : {
          type : "2f",
          value : {
            x : 0,
            y : 0
          }
        },
        mapDimensions : {
          type : "2f",
          value : {
            x : 1,
            y : 5112
          }
        },
        dimensions : {
          type : "4fv",
          value : [0, 0, 0, 0]
        }
      };
      if (options.baseTexture.hasLoaded) {
        this.uniforms.mapDimensions.value.x = options.width;
        this.uniforms.mapDimensions.value.y = options.height;
      } else {
        this.boundLoadedFunction = this.onTextureLoaded.bind(this);
        options.baseTexture.on("loaded", this.boundLoadedFunction);
      }
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D displacementMap;", "uniform sampler2D uSampler;", "uniform vec2 scale;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   vec2 matSample = texture2D(displacementMap, mapCords).xy;", 
      "   matSample -= 0.5;", "   matSample *= scale;", "   matSample /= mapDimensions;", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);", "   vec2 cord = vTextureCoord;", "}"];
    };
    /** @type {Object} */
    PIXI.DisplacementFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (Object): undefined} */
    PIXI.DisplacementFilter.prototype.constructor = PIXI.DisplacementFilter;
    /**
     * @return {undefined}
     */
    PIXI.DisplacementFilter.prototype.onTextureLoaded = function() {
      this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
      this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
      this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
    };
    Object.defineProperty(PIXI.DisplacementFilter.prototype, "map", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.displacementMap.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.displacementMap.value = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.DisplacementFilter.prototype, "scale", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.scale.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.scale.value = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.DisplacementFilter.prototype, "offset", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.offset.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.offset.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.PixelateFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        invert : {
          type : "1f",
          value : 0
        },
        dimensions : {
          type : "4fv",
          value : new Float32Array([1E4, 100, 10, 10])
        },
        pixelSize : {
          type : "2f",
          value : {
            x : 10,
            y : 10
          }
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 testDim;", "uniform vec4 dimensions;", "uniform vec2 pixelSize;", "uniform sampler2D uSampler;", "void main(void) {", "   vec2 coord = vTextureCoord;", "   vec2 size = dimensions.xy/pixelSize;", "   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;", "   gl_FragColor = texture2D(uSampler, color);", "}"];
    };
    /** @type {Object} */
    PIXI.PixelateFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.PixelateFilter.prototype.constructor = PIXI.PixelateFilter;
    Object.defineProperty(PIXI.PixelateFilter.prototype, "size", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.pixelSize.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.pixelSize.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.BlurXFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        blur : {
          type : "1f",
          value : 1 / 512
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;", 
      "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;", "   gl_FragColor = sum;", "}"];
    };
    /** @type {Object} */
    PIXI.BlurXFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.BlurXFilter.prototype.constructor = PIXI.BlurXFilter;
    Object.defineProperty(PIXI.BlurXFilter.prototype, "blur", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.blur.value / (1 / 7E3);
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.blur.value = 1 / 7E3 * expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.BlurYFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        blur : {
          type : "1f",
          value : 1 / 512
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;", 
      "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;", "   gl_FragColor = sum;", "}"];
    };
    /** @type {Object} */
    PIXI.BlurYFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.BlurYFilter.prototype.constructor = PIXI.BlurYFilter;
    Object.defineProperty(PIXI.BlurYFilter.prototype, "blur", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.blur.value / (1 / 7E3);
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.blur.value = 1 / 7E3 * expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.BlurFilter = function() {
      this.blurXFilter = new PIXI.BlurXFilter;
      this.blurYFilter = new PIXI.BlurYFilter;
      /** @type {Array} */
      this.passes = [this.blurXFilter, this.blurYFilter];
    };
    Object.defineProperty(PIXI.BlurFilter.prototype, "blur", {
      /**
       * @return {?}
       */
      get : function() {
        return this.blurXFilter.blur;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        this.blurXFilter.blur = this.blurYFilter.blur = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.BlurFilter.prototype, "blurX", {
      /**
       * @return {?}
       */
      get : function() {
        return this.blurXFilter.blur;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.blurXFilter.blur = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.BlurFilter.prototype, "blurY", {
      /**
       * @return {?}
       */
      get : function() {
        return this.blurYFilter.blur;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.blurYFilter.blur = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.InvertFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        invert : {
          type : "1f",
          value : 1
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);", "}"];
    };
    /** @type {Object} */
    PIXI.InvertFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.InvertFilter.prototype.constructor = PIXI.InvertFilter;
    Object.defineProperty(PIXI.InvertFilter.prototype, "invert", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.invert.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.invert.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.SepiaFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        sepia : {
          type : "1f",
          value : 1
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float sepia;", "uniform sampler2D uSampler;", "const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);", "}"];
    };
    /** @type {Object} */
    PIXI.SepiaFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.SepiaFilter.prototype.constructor = PIXI.SepiaFilter;
    Object.defineProperty(PIXI.SepiaFilter.prototype, "sepia", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.sepia.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.sepia.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.TwistFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        radius : {
          type : "1f",
          value : 0.5
        },
        angle : {
          type : "1f",
          value : 5
        },
        offset : {
          type : "2f",
          value : {
            x : 0.5,
            y : 0.5
          }
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float radius;", "uniform float angle;", "uniform vec2 offset;", "void main(void) {", "   vec2 coord = vTextureCoord - offset;", "   float distance = length(coord);", "   if (distance < radius) {", "       float ratio = (radius - distance) / radius;", "       float angleMod = ratio * ratio * angle;", "       float s = sin(angleMod);", 
      "       float c = cos(angleMod);", "       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);", "   }", "   gl_FragColor = texture2D(uSampler, coord+offset);", "}"];
    };
    /** @type {Object} */
    PIXI.TwistFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.TwistFilter.prototype.constructor = PIXI.TwistFilter;
    Object.defineProperty(PIXI.TwistFilter.prototype, "offset", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.offset.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.offset.value = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.TwistFilter.prototype, "radius", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.radius.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.radius.value = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.TwistFilter.prototype, "angle", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.angle.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.angle.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.ColorStepFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        step : {
          type : "1f",
          value : 5
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float step;", "void main(void) {", "   vec4 color = texture2D(uSampler, vTextureCoord);", "   color = floor(color * step) / step;", "   gl_FragColor = color;", "}"];
    };
    /** @type {Object} */
    PIXI.ColorStepFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.ColorStepFilter.prototype.constructor = PIXI.ColorStepFilter;
    Object.defineProperty(PIXI.ColorStepFilter.prototype, "step", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.step.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.step.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.DotScreenFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        scale : {
          type : "1f",
          value : 1
        },
        angle : {
          type : "1f",
          value : 5
        },
        dimensions : {
          type : "4fv",
          value : [0, 0, 0, 0]
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float angle;", "uniform float scale;", "float pattern() {", "   float s = sin(angle), c = cos(angle);", "   vec2 tex = vTextureCoord * dimensions.xy;", "   vec2 point = vec2(", "       c * tex.x - s * tex.y,", "       s * tex.x + c * tex.y", "   ) * scale;", "   return (sin(point.x) * sin(point.y)) * 4.0;", "}", "void main() {", 
      "   vec4 color = texture2D(uSampler, vTextureCoord);", "   float average = (color.r + color.g + color.b) / 3.0;", "   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);", "}"];
    };
    /** @type {Object} */
    PIXI.DotScreenFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.DotScreenFilter.prototype.constructor = PIXI.DotScreenFilter;
    Object.defineProperty(PIXI.DotScreenFilter.prototype, "scale", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.scale.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.scale.value = expectedHashCode;
      }
    });
    Object.defineProperty(PIXI.DotScreenFilter.prototype, "angle", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.angle.value;
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {boolean} */
        this.dirty = true;
        /** @type {number} */
        this.uniforms.angle.value = expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.CrossHatchFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        blur : {
          type : "1f",
          value : 1 / 512
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);", "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);", "    if (lum < 1.00) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.75) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {", 
      "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.50) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.3) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "}"];
    };
    /** @type {Object} */
    PIXI.CrossHatchFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.CrossHatchFilter.prototype.constructor = PIXI.BlurYFilter;
    Object.defineProperty(PIXI.CrossHatchFilter.prototype, "blur", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.blur.value / (1 / 7E3);
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.blur.value = 1 / 7E3 * expectedHashCode;
      }
    });
    /**
     * @return {undefined}
     */
    PIXI.RGBSplitFilter = function() {
      PIXI.AbstractFilter.call(this);
      /** @type {Array} */
      this.passes = [this];
      this.uniforms = {
        red : {
          type : "2f",
          value : {
            x : 20,
            y : 20
          }
        },
        green : {
          type : "2f",
          value : {
            x : -20,
            y : 20
          }
        },
        blue : {
          type : "2f",
          value : {
            x : 20,
            y : -20
          }
        },
        dimensions : {
          type : "4fv",
          value : [0, 0, 0, 0]
        }
      };
      /** @type {Array} */
      this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 red;", "uniform vec2 green;", "uniform vec2 blue;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;", "   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;", "   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;", 
      "   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;", "}"];
    };
    /** @type {Object} */
    PIXI.RGBSplitFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    /** @type {function (): undefined} */
    PIXI.RGBSplitFilter.prototype.constructor = PIXI.RGBSplitFilter;
    Object.defineProperty(PIXI.RGBSplitFilter.prototype, "angle", {
      /**
       * @return {?}
       */
      get : function() {
        return this.uniforms.blur.value / (1 / 7E3);
      },
      /**
       * @param {number} expectedHashCode
       * @return {undefined}
       */
      set : function(expectedHashCode) {
        /** @type {number} */
        this.uniforms.blur.value = 1 / 7E3 * expectedHashCode;
      }
    });
    if ("undefined" != typeof exports) {
      if ("undefined" != typeof module) {
        if (module.exports) {
          exports = module.exports = PIXI;
        }
      }
      exports.PIXI = PIXI;
    } else {
      if ("undefined" != typeof define && define.amd) {
        define(PIXI);
      } else {
        oldWin.PIXI = PIXI;
      }
    }
  }).call(this);
  /**
   * @param {Array} chr
   * @return {undefined}
   */
  PIXI.FlashClip = function(chr) {
    /** @type {Array} */
    var buffer = [];
    var key;
    for (key in PIXI.TextureCache) {
      if (-1 !== key.indexOf(chr)) {
        if (key.length === chr.length + 4) {
          buffer.push(PIXI.Texture.fromFrame(key));
        }
      }
    }
    if (0 === buffer.length) {
      throw "FlashClip textures not found";
    }
    PIXI.MovieClip.call(this, buffer);
  };
  /** @type {Object} */
  PIXI.FlashClip.prototype = Object.create(PIXI.MovieClip.prototype);
  /** @type {function (Array): undefined} */
  PIXI.FlashClip.prototype.constructor = PIXI.FlashClip;
  /**
   * @param {?} opt_attributes
   * @return {?}
   */
  PIXI.extend = function(opt_attributes) {
    /**
     * @return {undefined}
     */
    function Class() {
      var i;
      if (this.init) {
        this.init.apply(this, arguments);
      } else {
        this.base.apply(this, arguments);
      }
      for (i in obj) {
        if ("function" != typeof obj[i]) {
          this[i] = game.copy(obj[i]);
        }
      }
      for (i in opt_attributes) {
        if ("function" != typeof opt_attributes[i]) {
          this[i] = game.copy(opt_attributes[i]);
        }
      }
    }
    var key;
    var obj = this.prototype;
    var base = this.prototype.base || this;
    /** @type {Object} */
    Class.prototype = Object.create(base.prototype);
    /**
     * @param {string} key
     * @param {Function} matcherFunction
     * @return {?}
     */
    var fn = function(key, matcherFunction) {
      var temp = obj[key];
      return "init" !== key || (temp || (temp = base)), function() {
        var c = this._super;
        this._super = temp;
        var e = matcherFunction.apply(this, arguments);
        return this._super = c, e;
      };
    };
    for (key in obj) {
      Class.prototype[key] = "function" == typeof obj[key] ? fn(key, obj[key]) : obj[key];
    }
    for (key in opt_attributes) {
      Class.prototype[key] = "function" == typeof opt_attributes[key] ? fn(key, opt_attributes[key]) : opt_attributes[key];
    }
    return Class.prototype.constructor = Class, Class.prototype.base = base, Class.extend = PIXI.extend, Class;
  };
  var subname;
  for (subname in PIXI) {
    if (PIXI[subname].prototype instanceof Object) {
      /** @type {function (?): ?} */
      PIXI[subname].extend = PIXI.extend;
    }
  }
  game.AssetLoader = PIXI.AssetLoader;
  game.Text = PIXI.Text;
  game.MovieClip = PIXI.MovieClip;
  /** @type {function (Array): undefined} */
  game.FlashClip = PIXI.FlashClip;
  game.BitmapText = PIXI.BitmapText;
  game.Graphics = PIXI.Graphics;
  game.HitRectangle = PIXI.Rectangle;
  game.HitCircle = PIXI.Circle;
  game.HitEllipse = PIXI.Ellipse;
  game.HitPolygon = PIXI.Polygon;
  game.TextureCache = PIXI.TextureCache;
  game.RenderTexture = PIXI.RenderTexture;
  game.Point = PIXI.Point;
  game.CanvasRenderer = PIXI.CanvasRenderer;
  game.autoDetectRenderer = PIXI.autoDetectRenderer;
  game.Stage = PIXI.Stage;
  game.blendModes = PIXI.blendModes;
}), game.module("engine.sprite").require("engine.renderer").body(function() {
  game.Sprite = PIXI.Sprite.extend({
    debugDraw : true,
    /**
     * @param {?} attr
     * @param {number} value
     * @param {number} y
     * @param {Object} settings
     * @return {undefined}
     */
    init : function(attr, value, y, settings) {
      if ("string" == typeof attr) {
        attr = game.assets[attr] || attr;
        attr = game.Texture.fromFrame(attr);
      }
      this._super(attr);
      game.merge(this, settings);
      if ("number" == typeof value) {
        /** @type {number} */
        this.position.x = value;
      }
      if ("number" == typeof y) {
        /** @type {number} */
        this.position.y = y;
      }
      if (game.device.mobile) {
        if (!this.tap) {
          if (this.click) {
            this.tap = this.click;
          }
        }
      }
      if (game.device.mobile) {
        if (!this.touchmove) {
          if (this.mousemove) {
            this.touchmove = this.mousemove;
          }
        }
      }
      if (game.device.mobile) {
        if (!this.touchstart) {
          if (this.mousedown) {
            this.touchstart = this.mousedown;
          }
        }
      }
      if (game.device.mobile) {
        if (!this.touchend) {
          if (this.mouseup) {
            this.touchend = this.mouseup;
          }
        }
      }
      if (game.device.mobile) {
        if (!this.touchendoutside) {
          if (this.mouseupoutside) {
            this.touchendoutside = this.mouseupoutside;
          }
        }
      }
    },
    /**
     * @param {?} attr
     * @return {undefined}
     */
    setTexture : function(attr) {
      if ("string" == typeof attr) {
        attr = game.assets[attr] || attr;
        attr = game.Texture.fromFrame(attr);
      }
      this._super(attr);
    },
    /**
     * @return {undefined}
     */
    remove : function() {
      if (this.parent) {
        this.parent.removeChild(this);
      }
    },
    /**
     * @param {?} child
     * @return {undefined}
     */
    addChild : function(child) {
      this._super(child);
      if (game.debugDraw) {
        if (child.interactive) {
          game.debugDraw.addSprite(child);
        }
      }
    }
  });
  game.Spine = PIXI.Spine.extend({
    /**
     * @param {?} id
     * @param {Object} settings
     * @return {undefined}
     */
    init : function(id, settings) {
      this._super(game.assets[id] || id);
      game.merge(this, settings);
    },
    /**
     * @param {string} next
     * @param {number} action
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    play : function(next, action, dataAndEvents) {
      if (dataAndEvents) {
        this.state.addAnimationByName(next, !!action);
      } else {
        this.state.setAnimationByName(next, !!action);
      }
    },
    /**
     * @param {string} receiver
     * @param {string} weight
     * @param {number} supplier
     * @return {undefined}
     */
    mix : function(receiver, weight, supplier) {
      this.stateData.setMixByName(receiver, weight, supplier / 100);
    }
  });
  game.Container = PIXI.DisplayObjectContainer.extend({
    debugDraw : true,
    /**
     * @return {undefined}
     */
    remove : function() {
      if (this.parent) {
        this.parent.removeChild(this);
      }
    },
    /**
     * @param {?} child
     * @return {undefined}
     */
    addChild : function(child) {
      this._super(child);
      if (game.debugDraw) {
        if (child.interactive) {
          if (child.debugDraw) {
            game.debugDraw.addSprite(child);
          }
        }
      }
    },
    /**
     * @param {?} group
     * @return {?}
     */
    addTo : function(group) {
      return group.addChild(this), this;
    }
  });
  game.Texture = PIXI.Texture.extend();
  /**
   * @param {string} url
   * @param {boolean} crossorigin
   * @return {?}
   */
  game.Texture.fromImage = function(url, crossorigin) {
    return url = game.assets[url] || url, PIXI.Texture.fromImage(url, crossorigin);
  };
  game.Texture.fromCanvas = PIXI.Texture.fromCanvas;
  game.Texture.fromFrame = PIXI.Texture.fromFrame;
  game.TilingSprite = PIXI.TilingSprite.extend({
    speed : {
      x : 0,
      y : 0
    },
    /**
     * @param {Object} path
     * @param {(number|string)} width
     * @param {(number|string)} height
     * @param {Object} settings
     * @return {undefined}
     */
    init : function(path, width, height, settings) {
      path = game.assets[path] || path;
      var attr = path instanceof PIXI.Texture ? path : PIXI.Texture.fromFrame(this.path || path);
      this._super(attr, width || attr.width, height || attr.height);
      game.merge(this, settings);
    },
    /**
     * @return {undefined}
     */
    update : function() {
      this.tilePosition.x += this.speed.x * game.system.delta;
      this.tilePosition.y += this.speed.y * game.system.delta;
    }
  });
  game.Animation = PIXI.MovieClip.extend({
    /**
     * @return {undefined}
     */
    init : function() {
      /** @type {Array.<?>} */
      var codeSegments = Array.prototype.slice.call(arguments);
      /** @type {Array} */
      var attr = [];
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        attr.push(game.Texture.fromImage(codeSegments[i]));
      }
      this._super(attr);
    }
  });
}), game.module("engine.debug").body(function() {
  game.DebugDraw = game.Class.extend({
    container : null,
    /**
     * @return {undefined}
     */
    init : function() {
      this.container = new game.Container;
    },
    /**
     * @return {undefined}
     */
    reset : function() {
      /** @type {number} */
      var i = this.container.children.length - 1;
      for (;i >= 0;i--) {
        this.container.removeChild(this.container.children[i]);
      }
      game.system.stage.addChild(this.container);
    },
    /**
     * @param {Object} sprite
     * @return {undefined}
     */
    addSprite : function(sprite) {
      var grap = new game.Graphics;
      grap.beginFill(game.DebugDraw.spriteColor);
      if (sprite.hitArea) {
        if (sprite.hitArea instanceof game.HitRectangle) {
          grap.drawRect(sprite.hitArea.x, sprite.hitArea.y, sprite.hitArea.width, sprite.hitArea.height);
        } else {
          if (sprite.hitArea instanceof game.HitCircle) {
            grap.drawCircle(sprite.hitArea.x, sprite.hitArea.y, sprite.hitArea.radius);
          }
        }
      } else {
        grap.drawRect(-sprite.width * sprite.anchor.x, -sprite.height * sprite.anchor.y, sprite.width, sprite.height);
      }
      /** @type {Object} */
      grap.target = sprite;
      grap.alpha = game.DebugDraw.spriteAlpha;
      this.container.addChild(grap);
    },
    /**
     * @param {Object} body
     * @return {undefined}
     */
    addBody : function(body) {
      var sprite = new game.Graphics;
      this.drawDebugSprite(sprite, body);
      sprite.position.x = body.position.x;
      sprite.position.y = body.position.y;
      /** @type {Object} */
      sprite.target = body;
      sprite.alpha = game.DebugDraw.shapeAlpha;
      this.container.addChild(sprite);
    },
    /**
     * @param {Object} sprite
     * @param {Object} body
     * @return {undefined}
     */
    drawDebugSprite : function(sprite, body) {
      sprite.clear();
      sprite.beginFill(game.DebugDraw.shapeColor);
      if (body.shape instanceof game.Rectangle) {
        sprite.drawRect(-body.shape.width / 2, -body.shape.height / 2, body.shape.width, body.shape.height);
        sprite.width = body.shape.width;
        sprite.height = body.shape.height;
      }
      if (body.shape instanceof game.Circle) {
        sprite.drawCircle(0, 0, body.shape.radius);
        sprite.radius = body.shape.radius;
      }
    },
    /**
     * @return {undefined}
     */
    update : function() {
      /** @type {number} */
      var i = this.container.children.length - 1;
      for (;i >= 0;i--) {
        if (game.modules["plugins.p2"] && this.container.children[i].target instanceof game.Body) {
          this.updateP2(this.container.children[i]);
        } else {
          this.container.children[i].rotation = this.container.children[i].target.rotation;
          if (game.modules["engine.physics"] && this.container.children[i].target instanceof game.Body) {
            if (this.container.children[i].width !== this.container.children[i].target.shape.width || this.container.children[i].height !== this.container.children[i].target.shape.height) {
              this.drawDebugSprite(this.container.children[i], this.container.children[i].target);
            }
            if (this.container.children[i].radius !== this.container.children[i].target.shape.radius) {
              this.drawDebugSprite(this.container.children[i], this.container.children[i].target);
            }
            this.container.children[i].position.x = this.container.children[i].target.position.x + game.scene.stage.position.x;
            this.container.children[i].position.y = this.container.children[i].target.position.y + game.scene.stage.position.y;
            if (!this.container.children[i].target.world) {
              this.container.removeChild(this.container.children[i]);
            }
          } else {
            if (this.container.children[i].target.parent) {
              this.container.children[i].target.updateTransform();
            }
            this.container.children[i].position.x = this.container.children[i].target.worldTransform.tx;
            this.container.children[i].position.y = this.container.children[i].target.worldTransform.ty;
            this.container.children[i].scale.x = this.container.children[i].target.scale.x;
            this.container.children[i].scale.y = this.container.children[i].target.scale.y;
            if (!this.container.children[i].target.parent) {
              this.container.removeChild(this.container.children[i]);
            }
          }
        }
      }
    }
  });
  /** @type {number} */
  game.DebugDraw.spriteColor = 16711680;
  /** @type {number} */
  game.DebugDraw.spriteAlpha = 0.3;
  /** @type {number} */
  game.DebugDraw.shapeColor = 255;
  /** @type {number} */
  game.DebugDraw.shapeAlpha = 0.3;
  /** @type {boolean} */
  game.DebugDraw.enabled = document.location.href.match(/\?debugdraw/) ? true : false;
  game.Debug = game.Class.extend({
    frames : 0,
    last : 0,
    fps : 0,
    fpsText : null,
    /**
     * @return {undefined}
     */
    init : function() {
      this.fpsText = new game.Text("0", {
        fill : game.Debug.color
      });
      this.fpsText.position.set(game.Debug.position.x, game.Debug.position.y);
      game.system.stage.addChild(this.fpsText);
    },
    /**
     * @return {undefined}
     */
    update : function() {
      this.frames++;
      if (game.Timer.last >= this.last + game.Debug.frequency) {
        /** @type {string} */
        this.fps = Math.round(1E3 * this.frames / (game.Timer.last - this.last)).toString();
        if (this.fps !== this.fpsText.text) {
          this.fpsText.setText(this.fps.toString());
        }
        this.last = game.Timer.last;
        /** @type {number} */
        this.frames = 0;
      }
    }
  });
  /** @type {boolean} */
  game.Debug.enabled = !!document.location.href.toLowerCase().match(/\?debug/);
  /** @type {number} */
  game.Debug.frequency = 1E3;
  /** @type {string} */
  game.Debug.color = "white";
  game.Debug.position = {
    x : 10,
    y : 10
  };
}), game.module("engine.storage").body(function() {
  game.Storage = game.Class.extend({
    id : null,
    /**
     * @param {string} id
     * @return {undefined}
     */
    init : function(id) {
      /** @type {string} */
      this.id = id;
    },
    /**
     * @param {number} expectedHashCode
     * @param {number} opt_attributes
     * @return {undefined}
     */
    set : function(expectedHashCode, opt_attributes) {
      localStorage[this.id + "." + expectedHashCode] = this.encode(opt_attributes);
    },
    /**
     * @param {string} key
     * @return {?}
     */
    get : function(key) {
      return this.decode(localStorage[this.id + "." + key]);
    },
    /**
     * @param {string} key
     * @return {undefined}
     */
    remove : function(key) {
      localStorage.removeItem(this.id + "." + key);
    },
    /**
     * @return {undefined}
     */
    reset : function() {
      var key;
      for (key in localStorage) {
        if (-1 !== key.indexOf(this.id + ".")) {
          localStorage.removeItem(key);
        }
      }
    },
    /**
     * @param {?} arg
     * @return {?}
     */
    encode : function(arg) {
      return "object" == typeof arg ? JSON.stringify(arg) : arg;
    },
    /**
     * @param {string} data
     * @return {?}
     */
    decode : function(data) {
      return "undefined" != typeof data ? 0 === data.indexOf("{") ? JSON.parse(data) : data : void 0;
    }
  });
  /** @type {string} */
  game.Storage.id = "";
}), game.module("engine.tween").body(function() {
  game.TweenEngine = game.Class.extend({
    tweens : [],
    /**
     * @return {undefined}
     */
    removeAll : function() {
      /** @type {number} */
      var n = 0;
      for (;n < this.tweens.length;n++) {
        /** @type {boolean} */
        this.tweens[n].shouldRemove = true;
      }
    },
    /**
     * @param {?} object
     * @return {undefined}
     */
    stopTweensForObject : function(object) {
      /** @type {number} */
      var i = this.tweens.length - 1;
      for (;i >= 0;i--) {
        if (this.tweens[i].object === object) {
          this.tweens[i].stop();
        }
      }
    },
    /**
     * @param {?} object
     * @return {?}
     */
    getTweenForObject : function(object) {
      /** @type {number} */
      var i = this.tweens.length - 1;
      for (;i >= 0;i--) {
        if (this.tweens[i].object === object) {
          return this.tweens[i];
        }
      }
      return false;
    },
    /**
     * @param {?} tween
     * @return {undefined}
     */
    add : function(tween) {
      this.tweens.push(tween);
    },
    /**
     * @param {?} tween
     * @return {undefined}
     */
    remove : function(tween) {
      var i = this.tweens.indexOf(tween);
      if (-1 !== i) {
        /** @type {boolean} */
        this.tweens[i].shouldRemove = true;
      }
    },
    /**
     * @return {?}
     */
    update : function() {
      if (0 === this.tweens.length) {
        return false;
      }
      /** @type {number} */
      var i = this.tweens.length - 1;
      for (;i >= 0;i--) {
        if (!this.tweens[i].update()) {
          this.tweens.splice(i, 1);
        }
      }
      return true;
    }
  });
  game.Tween = game.Class.extend({
    isPlaying : false,
    paused : false,
    object : null,
    valuesStart : {},
    valuesEnd : null,
    valuesStartRepeat : {},
    duration : 1E3,
    repeatCount : 0,
    repeats : 0,
    yoyoEnabled : false,
    reversed : false,
    delayTime : 0,
    delayRepeat : false,
    startTime : null,
    originalStartTime : null,
    easingFunction : null,
    interpolationFunction : null,
    chainedTweens : [],
    onStartCallback : null,
    onStartCallbackFired : false,
    onUpdateCallback : null,
    onCompleteCallback : null,
    onRepeatCallback : null,
    currentTime : 0,
    shouldRemove : false,
    /**
     * @param {Object} object
     * @return {undefined}
     */
    init : function(object) {
      if (!object) {
        throw "No object defined for tween";
      }
      if ("object" != typeof object) {
        throw "Tween parameter must be object";
      }
      /** @type {Object} */
      this.object = object;
      this.easingFunction = game.Tween.Easing.Linear.None;
      this.interpolationFunction = game.Tween.Interpolation.Linear;
      var name;
      for (name in object) {
        /** @type {number} */
        this.valuesStart[name] = parseFloat(object[name], 10);
      }
    },
    /**
     * @param {?} opt_attributes
     * @param {number} replacementHash
     * @return {?}
     */
    to : function(opt_attributes, replacementHash) {
      return this.duration = replacementHash || this.duration, this.valuesEnd = opt_attributes, this;
    },
    /**
     * @return {?}
     */
    start : function() {
      game.tweenEngine.add(this);
      /** @type {boolean} */
      this.isPlaying = true;
      /** @type {boolean} */
      this.onStartCallbackFired = false;
      this.startTime = this.delayTime;
      this.originalStartTime = this.startTime;
      var key;
      for (key in this.valuesEnd) {
        if (this.valuesEnd[key] instanceof Array) {
          if (0 === this.valuesEnd[key].length) {
            continue;
          }
          /** @type {Array} */
          this.valuesEnd[key] = [this.object[key]].concat(this.valuesEnd[key]);
        }
        this.valuesStart[key] = this.object[key];
        if (this.valuesStart[key] instanceof Array == false) {
          this.valuesStart[key] *= 1;
        }
        this.valuesStartRepeat[key] = this.valuesStart[key] || 0;
      }
      return this;
    },
    /**
     * @return {?}
     */
    stop : function() {
      return this.isPlaying ? (game.tweenEngine.remove(this), this.isPlaying = false, this.stopChainedTweens(), this) : this;
    },
    /**
     * @return {undefined}
     */
    pause : function() {
      /** @type {boolean} */
      this.paused = true;
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      /** @type {boolean} */
      this.paused = false;
    },
    /**
     * @return {undefined}
     */
    stopChainedTweens : function() {
      /** @type {number} */
      var p = 0;
      var li = this.chainedTweens.length;
      for (;li > p;p++) {
        this.chainedTweens[p].stop();
      }
    },
    /**
     * @param {number} wait
     * @param {?} type
     * @return {?}
     */
    delay : function(wait, type) {
      return this.delayTime = wait, this.delayRepeat = !!type, this;
    },
    /**
     * @param {number} repeatCount
     * @return {?}
     */
    repeat : function(repeatCount) {
      return "undefined" == typeof repeatCount && (repeatCount = 1 / 0), this.repeatCount = repeatCount, this;
    },
    /**
     * @param {boolean} value
     * @return {?}
     */
    yoyo : function(value) {
      return "undefined" == typeof value && (value = true), this.yoyoEnabled = value, this;
    },
    /**
     * @param {?} x
     * @return {?}
     */
    easing : function(x) {
      return this.easingFunction = x, this;
    },
    /**
     * @param {?} interpolation
     * @return {?}
     */
    interpolation : function(interpolation) {
      return this.interpolationFunction = interpolation, this;
    },
    /**
     * @return {?}
     */
    chain : function() {
      return this.chainedTweens = arguments, this;
    },
    /**
     * @param {?} event
     * @return {?}
     */
    onStart : function(event) {
      return this.onStartCallback = event, this;
    },
    /**
     * @param {?} fn
     * @return {?}
     */
    onUpdate : function(fn) {
      return this.onUpdateCallback = fn, this;
    },
    /**
     * @param {Function} event
     * @return {?}
     */
    onComplete : function(event) {
      return this.onCompleteCallback = event, this;
    },
    /**
     * @param {?} dataAndEvents
     * @return {?}
     */
    onRepeat : function(dataAndEvents) {
      return this.onRepeatCallback = dataAndEvents, this;
    },
    /**
     * @return {?}
     */
    update : function() {
      if (this.shouldRemove) {
        return false;
      }
      if (this.paused) {
        return true;
      }
      if (this.currentTime += 1E3 * game.system.delta, this.currentTime < this.startTime) {
        return true;
      }
      if (this.onStartCallbackFired === false) {
        if (null !== this.onStartCallback) {
          this.onStartCallback.call(this.object);
        }
        /** @type {boolean} */
        this.onStartCallbackFired = true;
      }
      /** @type {number} */
      var percent = (this.currentTime - this.startTime) / this.duration;
      /** @type {number} */
      percent = percent > 1 ? 1 : percent;
      var i;
      var progress = this.easingFunction(percent);
      for (i in this.valuesEnd) {
        var start = this.valuesStart[i] || 0;
        var val = this.valuesEnd[i];
        if (val instanceof Array) {
          this.object[i] = this.interpolationFunction(val, progress);
        } else {
          if ("string" == typeof val) {
            val = start + parseFloat(val, 10);
          }
          if ("number" == typeof val) {
            this.object[i] = start + (val - start) * progress;
          }
        }
      }
      if (null !== this.onUpdateCallback && this.onUpdateCallback.call(this.object, progress), 1 === percent) {
        if (this.repeatCount > 0) {
          if (isFinite(this.repeatCount)) {
            this.repeatCount--;
          }
          this.repeats += 1;
          for (i in this.valuesStartRepeat) {
            if ("string" == typeof this.valuesEnd[i] && (this.valuesStartRepeat[i] = this.valuesStartRepeat[i] + parseFloat(this.valuesEnd[i], 10)), this.yoyoEnabled) {
              var v0 = this.valuesStartRepeat[i];
              this.valuesStartRepeat[i] = this.valuesEnd[i];
              this.valuesEnd[i] = v0;
              /** @type {boolean} */
              this.reversed = !this.reversed;
            }
            this.valuesStart[i] = this.valuesStartRepeat[i];
          }
          return this.delayRepeat || (this.delayTime = 0), this.startTime = this.originalStartTime + this.repeats * (this.duration + this.delayTime), null !== this.onRepeatCallback && this.onRepeatCallback.call(this.object), true;
        }
        /** @type {boolean} */
        this.isPlaying = false;
        if (null !== this.onCompleteCallback) {
          this.onCompleteCallback.call(this.object);
        }
        /** @type {number} */
        var p = 0;
        var li = this.chainedTweens.length;
        for (;li > p;p++) {
          this.chainedTweens[p].start();
        }
        return false;
      }
      return true;
    }
  });
  game.Tween.Easing = {
    Linear : {
      /**
       * @param {number} key
       * @return {?}
       */
      None : function(key) {
        return key;
      }
    },
    Quadratic : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        return k * k;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return k * (2 - k);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return(k *= 2) < 1 ? 0.5 * k * k : -0.5 * (--k * (k - 2) - 1);
      }
    },
    Cubic : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        return k * k * k;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return--k * k * k + 1;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return(k *= 2) < 1 ? 0.5 * k * k * k : 0.5 * ((k -= 2) * k * k + 2);
      }
    },
    Quartic : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        return k * k * k * k;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return 1 - --k * k * k * k;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return(k *= 2) < 1 ? 0.5 * k * k * k * k : -0.5 * ((k -= 2) * k * k * k - 2);
      }
    },
    Quintic : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        return k * k * k * k * k;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return--k * k * k * k * k + 1;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return(k *= 2) < 1 ? 0.5 * k * k * k * k * k : 0.5 * ((k -= 2) * k * k * k * k + 2);
      }
    },
    Sinusoidal : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        return 1 - Math.cos(k * Math.PI / 2);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return Math.sin(k * Math.PI / 2);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
      }
    },
    Exponential : {
      /**
       * @param {number} exponentBits
       * @return {?}
       */
      In : function(exponentBits) {
        return 0 === exponentBits ? 0 : Math.pow(1024, exponentBits - 1);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return 1 === k ? 1 : 1 - Math.pow(2, -10 * k);
      },
      /**
       * @param {number} exponentBits
       * @return {?}
       */
      InOut : function(exponentBits) {
        return 0 === exponentBits ? 0 : 1 === exponentBits ? 1 : (exponentBits *= 2) < 1 ? 0.5 * Math.pow(1024, exponentBits - 1) : 0.5 * (-Math.pow(2, -10 * (exponentBits - 1)) + 2);
      }
    },
    Circular : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        return 1 - Math.sqrt(1 - k * k);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return Math.sqrt(1 - --k * k);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return(k *= 2) < 1 ? -0.5 * (Math.sqrt(1 - k * k) - 1) : 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
      }
    },
    Elastic : {
      /**
       * @param {number} object
       * @return {?}
       */
      In : function(object) {
        var p;
        /** @type {number} */
        var a = 0.1;
        /** @type {number} */
        var n = 0.4;
        return 0 === object ? 0 : 1 === object ? 1 : (!a || 1 > a ? (a = 1, p = n / 4) : p = n * Math.asin(1 / a) / (2 * Math.PI), -(a * Math.pow(2, 10 * (object -= 1)) * Math.sin(2 * (object - p) * Math.PI / n)));
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        var s;
        /** @type {number} */
        var a = 0.1;
        /** @type {number} */
        var p = 0.4;
        return 0 === k ? 0 : 1 === k ? 1 : (!a || 1 > a ? (a = 1, s = p / 4) : s = p * Math.asin(1 / a) / (2 * Math.PI), a * Math.pow(2, -10 * k) * Math.sin(2 * (k - s) * Math.PI / p) + 1);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        var s;
        /** @type {number} */
        var a = 0.1;
        /** @type {number} */
        var p = 0.4;
        return 0 === k ? 0 : 1 === k ? 1 : (!a || 1 > a ? (a = 1, s = p / 4) : s = p * Math.asin(1 / a) / (2 * Math.PI), (k *= 2) < 1 ? -0.5 * a * Math.pow(2, 10 * (k -= 1)) * Math.sin(2 * (k - s) * Math.PI / p) : a * Math.pow(2, -10 * (k -= 1)) * Math.sin(2 * (k - s) * Math.PI / p) * 0.5 + 1);
      }
    },
    Back : {
      /**
       * @param {number} k
       * @return {?}
       */
      In : function(k) {
        /** @type {number} */
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        /** @type {number} */
        var b = 1.70158;
        return--k * k * ((b + 1) * k + b) + 1;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        /** @type {number} */
        var s = 2.5949095;
        return(k *= 2) < 1 ? 0.5 * k * k * ((s + 1) * k - s) : 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
      }
    },
    Bounce : {
      /**
       * @param {number} object
       * @return {?}
       */
      In : function(object) {
        return 1 - game.Tween.Easing.Bounce.Out(1 - object);
      },
      /**
       * @param {number} k
       * @return {?}
       */
      Out : function(k) {
        return 1 / 2.75 > k ? 7.5625 * k * k : 2 / 2.75 > k ? 7.5625 * (k -= 1.5 / 2.75) * k + 0.75 : 2.5 / 2.75 > k ? 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375 : 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
      },
      /**
       * @param {number} k
       * @return {?}
       */
      InOut : function(k) {
        return 0.5 > k ? 0.5 * game.Tween.Easing.Bounce.In(2 * k) : 0.5 * game.Tween.Easing.Bounce.Out(2 * k - 1) + 0.5;
      }
    }
  };
  game.Tween.Interpolation = {
    /**
     * @param {Array} arr
     * @param {number} k
     * @return {?}
     */
    Linear : function(arr, k) {
      /** @type {number} */
      var length = arr.length - 1;
      /** @type {number} */
      var start = length * k;
      /** @type {number} */
      var i = Math.floor(start);
      var fn = game.Tween.Interpolation.Utils.Linear;
      return 0 > k ? fn(arr[0], arr[1], start) : k > 1 ? fn(arr[length], arr[length - 1], length - start) : fn(arr[i], arr[i + 1 > length ? length : i + 1], start - i);
    },
    /**
     * @param {Array} worlds
     * @param {number} t
     * @return {?}
     */
    Bezier : function(worlds, t) {
      var i;
      /** @type {number} */
      var Bezier = 0;
      /** @type {number} */
      var last = worlds.length - 1;
      /** @type {function (*, *): number} */
      var pow = Math.pow;
      var process = game.Tween.Interpolation.Utils.Bernstein;
      /** @type {number} */
      i = 0;
      for (;last >= i;i++) {
        Bezier += pow(1 - t, last - i) * pow(t, i) * worlds[i] * process(last, i);
      }
      return Bezier;
    },
    /**
     * @param {Array} args
     * @param {number} spacing
     * @return {?}
     */
    CatmullRom : function(args, spacing) {
      /** @type {number} */
      var i = args.length - 1;
      /** @type {number} */
      var n = i * spacing;
      /** @type {number} */
      var l = Math.floor(n);
      var fn = game.Tween.Interpolation.Utils.CatmullRom;
      return args[0] === args[i] ? (0 > spacing && (l = Math.floor(n = i * (1 + spacing))), fn(args[(l - 1 + i) % i], args[l], args[(l + 1) % i], args[(l + 2) % i], n - l)) : 0 > spacing ? args[0] - (fn(args[0], args[0], args[1], args[1], -n) - args[0]) : spacing > 1 ? args[i] - (fn(args[i], args[i], args[i - 1], args[i - 1], n - i) - args[i]) : fn(args[l ? l - 1 : 0], args[l], args[l + 1 > i ? i : l + 1], args[l + 2 > i ? i : l + 2], n - l);
    },
    Utils : {
      /**
       * @param {number} x
       * @param {number} p
       * @param {number} f
       * @return {?}
       */
      Linear : function(x, p, f) {
        return(p - x) * f + x;
      },
      /**
       * @param {number} a
       * @param {number} b
       * @return {?}
       */
      Bernstein : function(a, b) {
        var aexpr = game.Tween.Interpolation.Utils.Factorial;
        return aexpr(a) / aexpr(b) / aexpr(a - b);
      },
      Factorial : function() {
        /** @type {Array} */
        var params = [1];
        return function(e) {
          var declarationError;
          /** @type {number} */
          var fn = 1;
          if (params[e]) {
            return params[e];
          }
          /** @type {number} */
          declarationError = e;
          for (;declarationError > 1;declarationError--) {
            fn *= declarationError;
          }
          return params[e] = fn;
        };
      }(),
      /**
       * @param {number} value3
       * @param {number} a3
       * @param {number} a1
       * @param {number} value2
       * @param {number} i
       * @return {?}
       */
      CatmullRom : function(value3, a3, a1, value2, i) {
        /** @type {number} */
        var s = 0.5 * (a1 - value3);
        /** @type {number} */
        var inner = 0.5 * (value2 - a3);
        /** @type {number} */
        var n = i * i;
        /** @type {number} */
        var index = i * n;
        return(2 * a3 - 2 * a1 + s + inner) * index + (-3 * a3 + 3 * a1 - 2 * s - inner) * n + s * i + a3;
      }
    }
  };
  game.TweenGroup = game.Class.extend({
    tweens : [],
    onComplete : null,
    complete : false,
    /**
     * @param {Function} id
     * @return {undefined}
     */
    init : function(id) {
      /** @type {Function} */
      this.onComplete = id;
    },
    /**
     * @param {Object} tween
     * @return {?}
     */
    add : function(tween) {
      return tween.onComplete(this.tweenComplete.bind(this)), this.tweens.push(tween), tween;
    },
    /**
     * @return {undefined}
     */
    tweenComplete : function() {
      if (!this.complete) {
        /** @type {number} */
        var i = 0;
        for (;i < this.tweens.length;i++) {
          if (this.tweens[i].isPlaying) {
            return;
          }
        }
        /** @type {boolean} */
        this.complete = true;
        if ("function" == typeof this.onComplete) {
          this.onComplete();
        }
      }
    },
    /**
     * @param {?} tween
     * @return {undefined}
     */
    remove : function(tween) {
      this.tweens.erase(tween);
    },
    /**
     * @return {undefined}
     */
    start : function() {
      /** @type {number} */
      var i = 0;
      for (;i < this.tweens.length;i++) {
        this.tweens[i].start();
      }
    },
    /**
     * @return {undefined}
     */
    pause : function() {
      /** @type {number} */
      var i = 0;
      for (;i < this.tweens.length;i++) {
        this.tweens[i].pause();
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      /** @type {number} */
      var i = 0;
      for (;i < this.tweens.length;i++) {
        this.tweens[i].resume();
      }
    },
    /**
     * @param {boolean} dataAndEvents
     * @param {Object} node
     * @return {undefined}
     */
    stop : function(dataAndEvents, node) {
      if (!this.complete) {
        /** @type {number} */
        var i = 0;
        for (;i < this.tweens.length;i++) {
          this.tweens[i].stop(node);
        }
        if (!this.complete) {
          if (dataAndEvents) {
            this.tweenComplete();
          }
        }
        /** @type {boolean} */
        this.complete = true;
      }
    }
  });
}), game.module("engine.scene").body(function() {
  game.Scene = game.Class.extend({
    backgroundColor : 0,
    objects : [],
    timers : [],
    emitters : [],
    stage : null,
    swipeDist : 100,
    swipeTime : 500,
    /**
     * @return {undefined}
     */
    staticInit : function() {
      game.scene = this;
      /** @type {number} */
      var child = game.system.stage.children.length - 1;
      for (;child >= 0;child--) {
        game.system.stage.removeChild(game.system.stage.children[child]);
      }
      game.system.stage.setBackgroundColor(this.backgroundColor);
      game.system.stage.mousemove = game.system.stage.touchmove = this._mousemove.bind(this);
      game.system.stage.click = game.system.stage.tap = this.click.bind(this);
      game.system.stage.mousedown = game.system.stage.touchstart = this._mousedown.bind(this);
      game.system.stage.mouseup = game.system.stage.mouseupoutside = game.system.stage.touchend = game.system.stage.touchendoutside = this.mouseup.bind(this);
      game.system.stage.mouseout = this.mouseout.bind(this);
      this.stage = new game.Container;
      game.system.stage.addChild(this.stage);
      if (game.debugDraw) {
        game.debugDraw.reset();
      }
    },
    /**
     * @return {undefined}
     */
    update : function() {
      var i;
      if (this.world) {
        this.world.update();
      }
      /** @type {number} */
      i = this.timers.length - 1;
      for (;i >= 0;i--) {
        if (this.timers[i].time() >= 0) {
          if ("function" == typeof this.timers[i].callback) {
            this.timers[i].callback();
          }
          if (this.timers[i].repeat) {
            this.timers[i].reset();
          } else {
            this.timers.splice(i, 1);
          }
        }
      }
      /** @type {number} */
      i = this.emitters.length - 1;
      for (;i >= 0;i--) {
        this.emitters[i].update();
        if (this.emitters[i]._remove) {
          this.emitters.splice(i, 1);
        }
      }
      if (game.tweenEngine) {
        game.tweenEngine.update();
      }
      /** @type {number} */
      i = this.objects.length - 1;
      for (;i >= 0;i--) {
        if ("function" == typeof this.objects[i].update) {
          this.objects[i].update();
        }
        if (this.objects[i]._remove) {
          this.objects.splice(i, 1);
        }
      }
    },
    /**
     * @param {?} object
     * @return {undefined}
     */
    addObject : function(object) {
      if (object._remove) {
        /** @type {boolean} */
        object._remove = false;
      }
      this.objects.push(object);
    },
    /**
     * @param {Object} object
     * @return {undefined}
     */
    removeObject : function(object) {
      /** @type {boolean} */
      object._remove = true;
    },
    /**
     * @param {?} emitter
     * @return {undefined}
     */
    addEmitter : function(emitter) {
      this.emitters.push(emitter);
    },
    /**
     * @param {Object} emitter
     * @return {undefined}
     */
    removeEmitter : function(emitter) {
      /** @type {boolean} */
      emitter._remove = true;
    },
    /**
     * @param {number} time
     * @param {Function} callback
     * @param {boolean} recurring
     * @return {?}
     */
    addTimer : function(time, callback, recurring) {
      var timer = new game.Timer(time);
      return timer.repeat = !!recurring, timer.callback = callback, this.timers.push(timer), timer;
    },
    /**
     * @param {?} obj
     * @param {?} opt_attributes
     * @param {number} replacementHash
     * @param {?} expectedNumberOfNonCommentArgs
     * @return {?}
     */
    addTween : function(obj, opt_attributes, replacementHash, expectedNumberOfNonCommentArgs) {
      var func = new game.Tween(obj);
      func.to(opt_attributes, replacementHash);
      var name;
      for (name in expectedNumberOfNonCommentArgs) {
        func[name](expectedNumberOfNonCommentArgs[name]);
      }
      return func;
    },
    /**
     * @param {Object} timer
     * @param {?} doCallback
     * @return {undefined}
     */
    removeTimer : function(timer, doCallback) {
      if (!doCallback) {
        /** @type {null} */
        timer.callback = null;
      }
      /** @type {boolean} */
      timer.repeat = false;
      timer.set(0);
    },
    /**
     * @return {undefined}
     */
    click : function() {
    },
    /**
     * @return {undefined}
     */
    mousedown : function() {
    },
    /**
     * @return {undefined}
     */
    mouseup : function() {
    },
    /**
     * @return {undefined}
     */
    mousemove : function() {
    },
    /**
     * @return {undefined}
     */
    mouseout : function() {
    },
    /**
     * @return {undefined}
     */
    keydown : function() {
    },
    /**
     * @return {undefined}
     */
    keyup : function() {
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    _mousedown : function(e) {
      /** @type {number} */
      e.startTime = Date.now();
      e.swipeX = e.global.x;
      e.swipeY = e.global.y;
      this.mousedown(e);
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    _mousemove : function(e) {
      this.mousemove(e);
      if (e.startTime) {
        if (e.global.x - e.swipeX >= this.swipeDist) {
          this._swipe(e, "right");
        } else {
          if (e.global.x - e.swipeX <= -this.swipeDist) {
            this._swipe(e, "left");
          } else {
            if (e.global.y - e.swipeY >= this.swipeDist) {
              this._swipe(e, "down");
            } else {
              if (e.global.y - e.swipeY <= -this.swipeDist) {
                this._swipe(e, "up");
              }
            }
          }
        }
      }
    },
    /**
     * @param {Object} e
     * @param {string} button
     * @return {undefined}
     */
    _swipe : function(e, button) {
      /** @type {number} */
      var swipeTime = Date.now() - e.startTime;
      /** @type {null} */
      e.startTime = null;
      if (swipeTime <= this.swipeTime) {
        this.swipe(button);
      }
    },
    /**
     * @return {undefined}
     */
    swipe : function() {
    },
    /**
     * @return {undefined}
     */
    run : function() {
      this.update();
      if (game.debugDraw) {
        game.debugDraw.update();
      }
      this.render();
    },
    /**
     * @return {undefined}
     */
    render : function() {
      game.renderer.render(game.system.stage);
    },
    /**
     * @return {undefined}
     */
    pause : function() {
      if (game.audio) {
        game.audio.pauseAll();
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      if (game.audio) {
        game.audio.resumeAll();
      }
    }
  });
}), game.module("engine.pool").body(function() {
  game.Pool = game.Class.extend({
    /**
     * @param {Object} methodName
     * @return {?}
     */
    create : function(methodName) {
      return this[methodName] ? false : (this[methodName] = [], true);
    },
    /**
     * @param {string} key
     * @return {?}
     */
    get : function(key) {
      return this[key] && 0 !== this[key].length ? this[key].pop() : false;
    },
    /**
     * @param {?} num
     * @param {?} storeName
     * @return {?}
     */
    put : function(num, storeName) {
      return this[num] ? (this[num].push(storeName), true) : false;
    }
  });
}), game.module("engine.analytics").body(function() {
  game.Analytics = game.Class.extend({
    trackId : null,
    userId : null,
    /**
     * @param {?} id
     * @return {undefined}
     */
    init : function(id) {
      if (navigator.onLine && (!game.device.cocoonJS || game.Analytics.cocoonJS)) {
        if (!id) {
          throw "Analytics id not set.";
        }
        if (this.trackId = id, game.device.cocoonJS && game.Analytics.cocoonJS) {
          this.userId = this.guid();
          /** @type {XMLHttpRequest} */
          var client = new XMLHttpRequest;
          /** @type {string} */
          var data = "v=1&tid=" + this.trackId + "&cid=" + this.userId + "&t=pageview&dp=%2F";
          client.open("POST", "http://www.google-analytics.com/collect", true);
          client.send(data);
        } else {
          !function(i, d, tag, path, r, el, s) {
            /** @type {string} */
            i.GoogleAnalyticsObject = r;
            i[r] = i[r] || function() {
              (i[r].q = i[r].q || []).push(arguments);
            };
            /** @type {number} */
            i[r].l = 1 * new Date;
            /** @type {Element} */
            el = d.createElement(tag);
            s = d.getElementsByTagName(tag)[0];
            /** @type {number} */
            el.async = 1;
            /** @type {string} */
            el.src = path;
            s.parentNode.insertBefore(el, s);
          }(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
          // ga("create", id, "auto");
          // ga("send", "pageview");
        }
      }
    },
    /**
     * @return {?}
     */
    guid : function() {
      /**
       * @return {?}
       */
      function S4() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
      }
      return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    },
    /**
     * @param {string} domEvent
     * @param {string} action
     * @param {string} name
     * @param {string} value
     * @return {undefined}
     */
    event : function(domEvent, action, name, value) {
      if (navigator.onLine && (!game.device.cocoonJS || game.Analytics.cocoonJS)) {
        if (game.device.cocoonJS && game.Analytics.cocoonJS) {
          /** @type {XMLHttpRequest} */
          var client = new XMLHttpRequest;
          /** @type {string} */
          var data = "v=1&tid=" + this.trackId + "&cid=" + this.userId + "&t=event&ec=" + domEvent + "&ea=" + action;
          if ("undefined" != typeof name) {
            data += "&el=" + name;
          }
          if ("undefined" != typeof value) {
            data += "&ev=" + value;
          }
          // client.open("POST", "http://www.google-analytics.com/collect", true);
          // client.send(data);
        } else {
          // ga("send", "event", domEvent, action, name, value);
        }
      }
    }
  });
  /** @type {string} */
  game.Analytics.id = "";
  /** @type {boolean} */
  game.Analytics.cocoonJS = false;
}), game.module("game.main").require("engine.physics", "game.assets", "game.levels", "game.title", "game.bee", "game.flower", "game.ui").body(function() {
	// SceneGameBROO
  SceneGame = game.Scene.extend({
    activeBee : null,
    flowers : [],
    bees : [],
    score : 0,
    lives : 3,
    level : null,
    unlockedBees : [],
    /**
     * @return {undefined}
     */
    init : function() {
      if ("undefined" == typeof game.currentLevel) {
        /** @type {number} */
        game.currentLevel = 0;
      }
      this.level = game.Levels[game.currentLevel];
      this.updateUnlockedBees();
      var o = new game.Sprite(this.level.background);
      o.anchor.set(0.5, 0.5);
      o.position.set(game.system.width / 2, game.system.height / 2);
      if (game.system.width > o.width) {
        o.scale.set(game.system.width / o.width, game.system.width / o.width);
      }
      if (game.system.height > o.height) {
        o.scale.set(game.system.height / o.height, game.system.height / o.height);
      }
      this.stage.addChild(o);
      this.world = new game.World(0, 0);
      this.flowerContainer = (new game.Container).addTo(this.stage);
      this.shadowContainer = (new game.Container).addTo(this.stage);
      this.pathContainer = (new game.Container).addTo(this.stage);
      this.beeContainer = (new game.Container).addTo(this.stage);
      this.fgContainer = (new game.Container).addTo(this.stage);
      this.uiContainer = (new game.Container).addTo(this.stage);
      this.pauseContainer = new game.Container;
      this.gameoverContainer = new game.Container;
      /** @type {number} */
      var y = 0;
      for (;y < this.level.flowers.length;y++) {
        var copies = new Flower(this.level.flowers[y][0], this.level.flowers[y][1], this.level.flowers[y][2]);
        this.flowers.push(copies);
      }
      var obj = new game.Sprite("flare_bg.png");
      obj.anchor.set(0.5, 0.5);
      obj.position.set(game.system.width / 2, -100);
      if (game.config.useBlendModes) {
        obj.blendMode = game.blendModes.ADD;
      }
      obj.scale.set(4, 4);
      /** @type {number} */
      obj.alpha = 0;
      this.fgContainer.addChild(obj);
      var t = new game.Tween(obj);
      t.to({
        rotation : 2 * Math.PI
      }, 6E4);
      t.repeat();
      t.start();
      this.addTween(obj, {
        alpha : 0.5
      }, 4E3, {
        easing : game.Tween.Easing.Quadratic.InOut,
        repeat : 1 / 0,
        yoyo : true
      }).start();
      var options = new game.Sprite("flare_fg.png");
      options.anchor.set(0.5, 0.5);
      options.position.set(game.system.width / 2, -100);
      if (game.config.useBlendModes) {
        options.blendMode = game.blendModes.ADD;
      }
      options.scale.set(4, 4);
      /** @type {number} */
      options.alpha = 0.5;
      this.fgContainer.addChild(options);
      t = new game.Tween(options);
      t.to({
        rotation : 2 * -Math.PI
      }, 6E4);
      t.repeat();
      t.start();
      this.addTween(options, {
        alpha : 0
      }, 4E3, {
        easing : game.Tween.Easing.Quadratic.InOut,
        repeat : 1 / 0,
        yoyo : true
      }).start();
      var child = new TilingSprite("clouds_big.png");
      this.fgContainer.addChild(child.container);
      this.addObject(child);
      this.scoreText = new game.BitmapText(this.score.toString(), {
        font : "Fredoka"
      });
      this.scoreText.position.set(180, 20);
      this.uiContainer.addChild(this.scoreText);
      var layer = new game.BitmapText("Score:", {
        font : "Fredoka"
      });
      if (layer.position.set(50, 20), this.uiContainer.addChild(layer), this.level.scoreToUnlock && (game.Levels[game.currentLevel + 1] && game.Levels[game.currentLevel + 1].locked)) {
        var s = new game.BitmapText("Unlock next level: " + game.getScoreText(this.level.scoreToUnlock), {
          font : "FredokaSmall"
        });
        s.position.set(50, 70);
        this.uiContainer.addChild(s);
      }
      var e = ((new UiButton(2, "Pause", game.system.width - 80, 80, this.pauseGame.bind(this))).addTo(this.uiContainer), new game.BitmapText("Lives", {
        font : "Fredoka"
      }));
      e.position.set(game.system.width - 284, 600);
      e.scale.set(0.8, 0.8);
      this.uiContainer.addChild(e);
      var square = new game.Sprite("LivesStart.png");
      square.position.set(game.system.width - 189, 595);
      this.uiContainer.addChild(square);
      var box = new game.Sprite("_TimerGaugeBG.png");
      box.position.set(14, game.system.height - 400 - 5);
      this.uiContainer.addChild(box);
      this.timerBg = new game.Graphics;
      this.timerBg.beginFill(7600014);
      this.timerBg.drawRect(0, -274, 15, 274);
      this.timerBg.position.set(64, 557);
      this.uiContainer.addChild(this.timerBg);
      var g = new game.Sprite("_TimerGaugeFrame.png");
      g.position.set(14, game.system.height - 400 - 5);
      this.uiContainer.addChild(g);
      var sprite = new game.Graphics;
      sprite.beginFill(723753);
      sprite.drawRect(0, 0, game.system.width, game.system.height);
      /** @type {number} */
      sprite.alpha = 0.5;
      sprite.hitArea = new game.HitRectangle(0, 0, game.system.width, game.system.height);
      /** @type {boolean} */
      sprite.interactive = true;
      /** @type {function (): undefined} */
      sprite.click = sprite.tap = function() {
      };
      this.pauseContainer.addChild(sprite);
      var me = new game.Sprite("PanelSmall.png");
      me.anchor.set(0.5, 0.5);
      me.position.set(game.system.width / 2, game.system.height / 2);
      this.pauseContainer.addChild(me);
      var p = new game.BitmapText("Paused", {
        font : "FredokaTitle"
      });
      p.position.set(game.system.width / 2 - p.textWidth / 2, 180);
      this.pauseContainer.addChild(p);
      (new UiButton(3, null, game.system.width / 2 + 230, 170, this.resumeGame.bind(this))).addTo(this.pauseContainer);
      (new UiButton(1, "Restart", game.system.width / 2 - 70, 300, function() {
        game.system.setScene(SceneGame);
      })).addTo(this.pauseContainer);
      (new UiButton(1, "Play", game.system.width / 2 + 70, 300, this.resumeGame.bind(this))).addTo(this.pauseContainer);
      (new UiButton(2, "Mainmenu", game.system.width / 2 - 100, 450, function() {
        game.system.setScene(SceneTitle);
      })).addTo(this.pauseContainer);
      if (game.Audio.enabled) {
        var self = (new UiButton(2, "Soundon", game.system.width / 2, 450)).addTo(this.pauseContainer);
        self.callback = game.toggleSound.bind(this, self.container);
        if (game.audio.musicMuted) {
          /** @type {number} */
          self.container.alpha = 0.5;
        }
      }
      var line = ((new UiButton(2, "Howplay", game.system.width / 2 + 100, 450, this.showHowTo.bind(this))).addTo(this.pauseContainer), new game.Sprite("HorizontalSmall.png"));
      line.position.set(game.system.width / 2 - line.width / 2, 380);
      this.pauseContainer.addChild(line);
      var item = new game.Sprite("PanelLarge.png");
      item.anchor.set(0.5, 0.5);
      item.position.set(game.system.width / 2, game.system.height / 2);
      this.gameoverContainer.addChild(item);
      var c = new game.Graphics;
      c.beginFill(16777215);
      c.drawRect(0, 0, game.system.width, game.system.height);
      this.stage.addChild(c);
      var tween = new game.Tween(c);
      tween.to({
        alpha : 0
      }, 800);
      tween.easing(game.Tween.Easing.Quadratic.Out);
      tween.onComplete(this.startGame.bind(this));
      tween.start();
      this.gameTotalTime = this.level.time;
      this.gameTimeTimer = this.addTimer(1E3, this.updateTimer.bind(this), true);
      this.gameTimeText = new game.BitmapText(this.getTime(this.gameTotalTime), {
        font : "FredokaTime"
      });
      this.gameTimeText.position.set(36, 595);
      this.uiContainer.addChild(this.gameTimeText);
      this.gameTimer = new game.Timer;
    },
    /**
     * @param {number} val
     * @return {?}
     */
    getTime : function(val) {
      /** @type {number} */
      val = Math.round(val);
      /** @type {number} */
      var pos = Math.floor(val / 60);
      /** @type {number} */
      var code = val - 60 * pos;
      return 10 > code && (code = "0" + code), pos + ":" + code;
    },
    /**
     * @param {?} dataAndEvents
     * @return {undefined}
     */
    updateTimer : function(dataAndEvents) {
      if (!this.ended) {
        if (dataAndEvents) {
          this.gameTotalTime += dataAndEvents;
        }
        /** @type {number} */
        var df = this.gameTotalTime - this.gameTimer.time() / 1E3;
        if (0 > df) {
          /** @type {number} */
          df = 0;
        }
        /** @type {number} */
        var functionStub = Math.round(df);
        if (this.gameTimeText.setText(this.getTime(functionStub)), 5 >= functionStub && functionStub > 0) {
          var t = new game.BitmapText(functionStub.toString(), {
            font : "Fredoka"
          });
          t.pivot.set(t.textWidth / 2, t.textHeight / 2);
          t.position.set(game.system.width / 2 - t.textWidth / 2, game.system.height / 2 - t.textHeight / 2);
          this.uiContainer.addChild(t);
          this.addTween(t, {
            alpha : 0
          }, 1E3).start();
          this.addTween(t.scale, {
            x : 2,
            y : 2
          }, 1E3, {
            /**
             * @return {undefined}
             */
            onComplete : function() {
              game.scene.uiContainer.removeChild(t);
            }
          }).start();
        }
        if (!(10 !== functionStub)) {
          if (!this.hurryupText) {
            game.audio.playSound("audio/hurry-up.m4a");
            this.hurryupText = new game.BitmapText("ALMOST THERE!", {
              font : "Fredoka"
            });
            this.hurryupText.position.set(game.system.width / 2 - this.hurryupText.textWidth / 2, game.system.height / 2 - this.hurryupText.textHeight / 2 - 100);
            /** @type {number} */
            this.hurryupText.alpha = 0;
            this.addTween(this.hurryupText, {
              alpha : 1
            }, 500, {
              repeat : 5,
              yoyo : true,
              easing : game.Tween.Easing.Quadratic.InOut,
              /**
               * @return {undefined}
               */
              onComplete : function() {
                game.scene.uiContainer.removeChild(game.scene.hurryupText);
                /** @type {null} */
                game.scene.hurryupText = null;
              }
            }).start();
            this.addTween(this.hurryupText.position, {
              y : "-50"
            }, 3E3).start();
            this.uiContainer.addChild(this.hurryupText);
            this.addTween(this.timerBg, {
              alpha : 0
            }, 500, {
              repeat : 1 / 0,
              yoyo : true
            }).start();
          }
        }
        if (0 >= df) {
          /** @type {boolean} */
          this.gameTimeTimer.repeat = false;
          game.audio.playSound("audio/time-over-panel.m4a");
          this.gameOver(true);
        }
      }
    },
    /**
     * @return {undefined}
     */
    startGame : function() {
      this.beeTimer = this.addTimer(1E3 * this.level.beeSpawnInterval, this.spawnBee.bind(this), true);
      if ("number" == typeof this.level.queenSpawnInterval) {
        this.addTimer(1E3 * this.level.queenSpawnInterval, function() {
          /** @type {boolean} */
          game.scene.shouldSpawnQueen = true;
        }, true);
      }
      this.spawnBee();
      if ("number" == typeof this.level.speedUpInterval) {
        this.addTimer(1E3 * this.level.speedUpInterval, this.speedUp.bind(this), true);
      }
    },
    /**
     * @return {undefined}
     */
    speedUp : function() {
      /** @type {number} */
      this.beeTimer.target = Math.max(1E3, this.beeTimer.target - 1E3 * this.level.speedUpAmount);
    },
    /**
     * @return {undefined}
     */
    pauseGame : function() {
      /** @type {number} */
      i = this.timers.length - 1;
      for (;i >= 0;i--) {
        this.timers[i].pause();
      }
      this.gameTimer.pause();
      /** @type {boolean} */
      this.paused = true;
      /** @type {number} */
      this.pauseContainer.alpha = 0;
      var tween = new game.Tween(this.pauseContainer);
      tween.to({
        alpha : 1
      }, 200);
      tween.start();
      this.stage.addChild(this.pauseContainer);
    },
    /**
     * @return {undefined}
     */
    resumeGame : function() {
      /** @type {number} */
      i = this.timers.length - 1;
      for (;i >= 0;i--) {
        this.timers[i].resume();
      }
      this.gameTimer.resume();
      /** @type {boolean} */
      this.paused = false;
      this.stage.removeChild(this.pauseContainer);
    },
    /**
     * @param {?} score
     * @return {undefined}
     */
    addScore : function(score) {
      if (this.score += score, this.scoreText.setText(game.getScoreText(this.score)), this.score >= this.level.scoreToUnlock && (game.Levels[game.currentLevel + 1] && game.Levels[game.currentLevel + 1].locked)) {
        /** @type {boolean} */
        game.Levels[game.currentLevel + 1].locked = false;
        game.audio.playSound("audio/level-unlocked-panel.m4a");
        var t = new game.BitmapText("LEVEL UNLOCKED", {
          font : "Fredoka"
        });
        t.pivot.set(t.textWidth / 2, t.textHeight / 2);
        t.position.set(game.system.width / 2, game.system.height / 2);
        /** @type {number} */
        t.alpha = 1;
        this.addTween(t, {
          alpha : 0
        }, 3E3, {
          /**
           * @return {undefined}
           */
          onComplete : function() {
            game.scene.uiContainer.removeChild(t);
          }
        }).start();
        this.addTween(t.scale, {
          x : 2,
          y : 2
        }, 3E3).start();
        this.uiContainer.addChild(t);
        this.saveLevelData();
      }
      this.updateUnlockedBees();
    },
    /**
     * @return {undefined}
     */
    updateUnlockedBees : function() {
      var param;
      /** @type {number} */
      var j = 0;
      for (;j < this.level.bees.length;j++) {
        param = this.level.bees[j];
        if ("undefined" == typeof param.scoreToUnlock) {
          /** @type {number} */
          param.scoreToUnlock = 0;
        }
        if (this.score >= param.scoreToUnlock) {
          if (-1 === this.unlockedBees.indexOf(param.name)) {
            this.unlockedBees.push(param.name);
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    saveLevelData : function() {
      /** @type {number} */
      var i = 0;
      for (;i < game.Levels.length;i++) {
        game.storage.set("levelData" + i, game.Levels[i].locked);
      }
    },
    /**
     * @return {?}
     */
    spawnBee : function() {
      if (!(this.ended || (this.spawningQueen || this.bees.length >= this.level.maxBees))) {
        if (this.shouldSpawnQueen) {
          return this.spawnQueen();
        }
        var child = new Bee;
        this.addObject(child);
        this.bees.push(child);
      }
    },
    /**
     * @return {undefined}
     */
    spawnQueen : function() {
      /** @type {boolean} */
      this.shouldSpawnQueen = false;
      /** @type {boolean} */
      this.spawningQueen = true;
      /** @type {number} */
      var script = game.system.width / 2;
      var options = game.system.height + 200;
      /** @type {number} */
      var key = -Math.PI / 2;
      /** @type {number} */
      var x = 3;
      var child = new Bee(script, options, "Queen", key);
      this.addObject(child);
      this.bees.push(child);
      /** @type {number} */
      var maxX = 1;
      for (;x + 1 > maxX;maxX++) {
        this.addTimer(2050 * maxX, function() {
          var child = new Bee(script, options, "TwoBanded", key);
          game.scene.addObject(child);
          game.scene.bees.push(child);
        });
      }
      this.addTimer(2050 * x + 1E3, function() {
        /** @type {boolean} */
        game.scene.spawningQueen = false;
        game.scene.beeTimer.reset();
      });
    },
    /**
     * @param {number} expectedHashCode
     * @param {number} attributes
     * @param {number} value
     * @return {undefined}
     */
    spawnLine : function(expectedHashCode, attributes, value) {
      if (this.activeBee) {
        game.audio.playSound("audio/line-draw-blip.m4a");
        var s = new game.Sprite("LineDrawSegment.png");
        s.position.set(expectedHashCode, attributes);
        s.anchor.set(0.5, 0.5);
        /** @type {number} */
        s.rotation = value;
        s.scale.set(3, 3);
        /** @type {number} */
        s.alpha = 0;
        this.activeBee.pathContainer.addChild(s);
        this.addTween(s, {
          alpha : 1
        }, 300).start();
        this.addTween(s.scale, {
          x : 1,
          y : 1
        }, 300, {
          easing : game.Tween.Easing.Elastic.Out
        }).start();
      }
    },
    /**
     * @param {number} expectedHashCode
     * @param {number} attributes
     * @return {undefined}
     */
    spawnReticle : function(expectedHashCode, attributes) {
      if (this.activeBee) {
        var obj = new game.Sprite("TargetReticle_ADD.png");
        obj.anchor.set(0.5, 0.5);
        obj.position.set(expectedHashCode, attributes);
        if (game.config.useBlendModes) {
          obj.blendMode = game.blendModes.ADD;
        }
        this.activeBee.pathContainer.addChild(obj);
        var t = new game.Tween(obj);
        t.to({
          rotation : 2 * Math.PI
        }, 5E3);
        t.repeat();
        t.start();
        obj = new game.Sprite("TargetReticle.png");
        obj.anchor.set(0.5, 0.5);
        obj.position.set(expectedHashCode, attributes);
        this.activeBee.pathContainer.addChild(obj);
        t = new game.Tween(obj);
        t.to({
          rotation : 2 * Math.PI
        }, 5E3);
        t.repeat();
        t.start();
      }
    },
    /**
     * @return {undefined}
     */
    showLeaderboard : function() {
		// hijack
		return false;
      (new LeaderBoard(function() {
        game.scene.stage.addChild(game.scene.gameoverContainer);
        /** @type {number} */
        game.scene.gameoverContainer.alpha = 0;
        game.scene.addTween(game.scene.gameoverContainer, {
          alpha : 1
        }, 200).start();
      })).addTo(this.stage);
    },
    /**
     * @param {?} done
     * @return {undefined}
     */
    hideGameOver : function(done) {
      this.addTween(this.gameoverContainer, {
        alpha : 0
      }, 200, {
        /**
         * @return {undefined}
         */
        onComplete : function() {
          game.scene.stage.removeChild(game.scene.gameoverContainer);
          done();
        }
      }).start();
    },
    /**
     * @return {undefined}
     */
    showSubmit : function() {
      this.gameoverContainer.removeChild(this.submitButton.textSprite);
      this.gameoverContainer.removeChild(this.submitButton.container);
      this.submitContainer = new game.Container;
      /** @type {number} */
      this.submitContainer.alpha = 0;
      this.stage.addChild(this.submitContainer);
      var me = new game.Sprite("PanelLarge.png");
      me.anchor.set(0.5, 0.5);
      me.position.set(game.system.width / 2, game.system.height / 2);
      this.submitContainer.addChild(me);
      var p = new game.BitmapText("Submit score", {
        font : "FredokaTitle"
      });
      p.position.set(game.system.width / 2 - p.textWidth / 2, 130);
      this.submitContainer.addChild(p);
      var layer = new game.Sprite("HorizontalSmall.png");
      layer.position.set(game.system.width / 2 - layer.width / 2, 190);
      this.submitContainer.addChild(layer);
      var t = new game.Sprite("NameUnderline.png");
      t.anchor.set(0.5, 0.5);
      t.position.set(game.system.width / 2, 258);
      this.submitContainer.addChild(t);
      var child = new game.BitmapText("", {
        font : "FredokaTitle"
      });
      child.position.set(game.system.width / 2, 210);
      this.submitContainer.addChild(child);
      var settings = ((new UiButton(4, "ButtonSubmit.png", game.system.width / 2, 485, function() {
        if (!(settings.input.length < 3)) {
          game.scene.submitScore(settings.input, game.scene.score, this);
        }
      })).addTo(this.submitContainer), (new Keyboard(game.system.width / 2, 300, function() {
        child.setText(settings.input);
        child.updateTransform();
        /** @type {number} */
        child.position.x = game.system.width / 2 - child.textWidth / 2;
      })).addTo(this.submitContainer));
      this.addTween(this.submitContainer, {
        alpha : 1
      }, 200).start();
    },
    /**
     * @param {string} errorName
     * @param {?} score
     * @param {Object} t
     * @return {undefined}
     */
    submitScore : function(errorName, score, t) {
      this.submitContainer.removeChild(t.container);
      var me = new game.BitmapText("Sending...", {
        font : "FredokaText"
      });
      me.position.set(game.system.width / 2 - me.textWidth / 2, 465);
      this.submitContainer.addChild(me);
      game.db.sendScore({
        name : errorName,
        score : score.toString()
      }, function($log) {
        if ($log.error) {
          game.scene.submitContainer.removeChild(t.container);
        } else {
          game.scene.addTween(game.scene.submitContainer, {
            alpha : 0
          }, 200, {
            /**
             * @return {undefined}
             */
            onComplete : function() {
              game.scene.showLeaderboard();
            }
          }).start();
        }
      });
    },
    /**
     * @return {undefined}
     */
    showHowTo : function() {
		return false;
      this.stage.removeChild(this.pauseContainer);
      var sprite = new game.Graphics;
      sprite.beginFill(723753);
      sprite.drawRect(0, 0, game.system.width, game.system.height);
      /** @type {number} */
      sprite.alpha = 0.5;
      sprite.hitArea = new game.HitRectangle(0, 0, game.system.width, game.system.height);
      /** @type {boolean} */
      sprite.interactive = true;
      /** @type {function (): undefined} */
      sprite.click = sprite.tap = function() {
      };
      this.stage.addChild(sprite);
      var el = (new HowToPlay(function() {
        game.scene.stage.removeChild(el.container);
        game.scene.stage.removeChild(sprite);
        game.scene.stage.addChild(game.scene.pauseContainer);
      })).addTo(this.stage);
    },
    /**
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    gameOver : function(dataAndEvents) {
      if (!this.ended) {
        /** @type {boolean} */
        this.ended = true;
        /** @type {number} */
        var i = this.bees.length - 1;
        for (;i >= 0;i--) {
          if (this.bees[i].collecting) {
            this.bees[i].flyOff();
          }
          this.bees[i].kill();
        }
        var sprite = new game.Graphics;
        if (sprite.beginFill(723753), sprite.drawRect(0, 0, game.system.width, game.system.height), sprite.hitArea = new game.HitRectangle(0, 0, game.system.width, game.system.height), sprite.interactive = true, sprite.click = sprite.tap = function() {
        }, sprite.alpha = 0, this.stage.addChild(sprite), this.addTween(sprite, {
          alpha : 0.5
        }, 200).start(), this.score > game.bestScore && (game.bestScore = this.score, game.storage.set("bestScore", game.bestScore)), dataAndEvents) {
          /** @type {string} */
          var post = "Level complete!";
          var me = new game.BitmapText("Your score: " + game.getScoreText(this.score), {
            font : "FredokaText"
          });
          if (me.position.set(game.system.width / 2 - me.textWidth / 2, 210), this.gameoverContainer.addChild(me), this.score > 0) {
            this.submitButton = (new UiButton(0, "AddName", game.system.width / 2 - 80 - 35, 300, this.hideGameOver.bind(this, this.showSubmit.bind(this)))).addTo(this.gameoverContainer);
            me = new game.BitmapText("Submit score", {
              font : "FredokaText"
            });
            me.position.set(game.system.width / 2 - 60, 280);
            this.submitButton.textSprite = me;
            this.gameoverContainer.addChild(me);
          }
          var _this = (new UiButton(4, "buttonleaderboard_big.png", game.system.width / 2 - 120 - 30, 380, this.hideGameOver.bind(this, this.showLeaderboard.bind(this)))).addTo(this.gameoverContainer);
          _this.bgSprite.scale.set(0.55, 0.55);
          _this.container.hitArea = new game.HitRectangle(-_this.bgSprite.width / 2, -_this.bgSprite.height / 2, _this.bgSprite.width, _this.bgSprite.height);
          me = new game.BitmapText("View Leaderboard", {
            font : "FredokaText"
          });
          me.position.set(game.system.width / 2 - 100, 360);
          this.gameoverContainer.addChild(me);
        } else {
          /** @type {string} */
          post = "Game Over";
          me = new game.BitmapText("You ran out of lives", {
            font : "FredokaText"
          });
          me.position.set(game.system.width / 2 - me.textWidth / 2, 220);
          this.gameoverContainer.addChild(me);
          me = new game.BitmapText("Try again!", {
            font : "FredokaText",
            align : "center"
          });
          me.scale.set(0.9, 0.9);
          me.position.set(game.system.width / 2 - me.textWidth / 2, 320);
          this.gameoverContainer.addChild(me);
        }
        if (dataAndEvents && (game.Levels[game.currentLevel + 1] && !game.Levels[game.currentLevel + 1].locked)) {
          (new UiButton(2, "PlayNext", game.system.width / 2 + 100, 490, function() {
            game.currentLevel++;
            game.system.setScene(SceneGame);
          })).addTo(this.gameoverContainer);
          (new UiButton(2, "Mainmenu", game.system.width / 2 - 100, 490, function() {
            game.system.setScene(SceneTitle);
          })).addTo(this.gameoverContainer);
          (new UiButton(2, "Restart", game.system.width / 2, 490, function() {
            game.system.setScene(SceneGame);
          })).addTo(this.gameoverContainer);
        } else {
          if (dataAndEvents && (game.Levels[game.currentLevel + 1] && !this.level.scoreToUnlock)) {
            (new UiButton(2, "Locked", game.system.width / 2 + 100, 490, function() {
              var me = new game.Sprite("Level4Locked_Info.png");
              me.anchor.set(0.5, 0.5);
              me.scale.set(0, 0);
              me.position.set(game.system.width / 2 + 100, 300);
              game.scene.stage.addChild(me);
              game.scene.addTween(me.scale, {
                x : 1,
                y : 1
              }, 800, {
                easing : game.Tween.Easing.Elastic.Out
              }).start();
              /**
               * @return {undefined}
               */
              this.callback = function() {
              };
            })).addTo(this.gameoverContainer);
            (new UiButton(2, "Mainmenu", game.system.width / 2 - 100, 490, function() {
              game.system.setScene(SceneTitle);
            })).addTo(this.gameoverContainer);
            (new UiButton(2, "Restart", game.system.width / 2, 490, function() {
              game.system.setScene(SceneGame);
            })).addTo(this.gameoverContainer);
          } else {
            (new UiButton(2, "Mainmenu", game.system.width / 2 - 50, 490, function() {
              game.system.setScene(SceneTitle);
            })).addTo(this.gameoverContainer);
            (new UiButton(2, "Restart", game.system.width / 2 + 50, 490, function() {
              game.system.setScene(SceneGame);
            })).addTo(this.gameoverContainer);
          }
        }
        var p = new game.BitmapText(post, {
          font : "FredokaTitle"
        });
        p.position.set(game.system.width / 2 - p.textWidth / 2, 138);
        this.gameoverContainer.addChild(p);
        var layer = new game.Sprite("HorizontalSmall.png");
        layer.position.set(game.system.width / 2 - layer.width / 2, 190);
        this.gameoverContainer.addChild(layer);
        layer = new game.Sprite("HorizontalSmall.png");
        layer.position.set(game.system.width / 2 - layer.width / 2, 430);
        this.gameoverContainer.addChild(layer);
        if (this.activeBee) {
          this.activeBee.clearPath();
          /** @type {null} */
          this.activeBee = null;
        }
        /** @type {number} */
        this.gameoverContainer.alpha = 0;
        var tween = new game.Tween(this.gameoverContainer);
        tween.to({
          alpha : 1
        }, 200);
        tween.start();
        this.stage.addChild(this.gameoverContainer);
      }
    },
    /**
     * @param {?} event
     * @return {?}
     */
    mousemove : function(event) {
      if (this.activeBee && (!this.activeBee.touchEvent || event === this.activeBee.touchEvent)) {
        /** @type {number} */
        var delta = ~~event.global.x;
        /** @type {number} */
        var height = ~~event.global.y;
        if (this.activeBee.path.x.length >= 2) {
          var ev;
          /** @type {number} */
          var i = 0;
          for (;i < this.flowers.length;i++) {
            this.flowers[i].container.scale.set(1, 1);
            if (!ev) {
              if (Math.distance(delta, height, this.flowers[i].container.position.x, this.flowers[i].container.position.y) <= this.flowers[i].radius) {
                ev = this.flowers[i];
              }
            }
          }
          if (ev) {
            if (this.targetFlower !== ev) {
              game.audio.playSound("audio/button-rollover.m4a");
            }
            this.targetFlower = ev;
            ev.container.scale.set(1.1, 1.1);
          } else {
            /** @type {null} */
            this.targetFlower = null;
          }
        }
        if (this.activeBee.path.x.length > 0) {
          var x = this.activeBee.path.x[this.activeBee.path.x.length - 1];
          var y = this.activeBee.path.y[this.activeBee.path.y.length - 1];
        } else {
          x = this.activeBee.sprite.position.x;
          y = this.activeBee.sprite.position.y;
        }
        if (!(game.Math.distance(delta, height, x, y) < 30)) {
          if (this.activeBee.pathLength >= 50) {
            return this.endPath(delta, height), void(this.activeBee = null);
          }
          if (this.activeBee.pathLength++, this.activeBee.path.x.push(delta), this.activeBee.path.y.push(height), 1 === this.activeBee.path.x.length) {
            /** @type {number} */
            var a = Math.atan2(this.activeBee.path.y[0] - this.activeBee.sprite.position.y, this.activeBee.path.x[0] - this.activeBee.sprite.position.x);
            /** @type {number} */
            this.activeBee.dirVector.x = Math.cos(a);
            /** @type {number} */
            this.activeBee.dirVector.y = Math.sin(a);
          }
          this.spawnLine((x + delta) / 2, (y + height) / 2, Math.atan2(y - height, x - delta));
        }
      }
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    mouseup : function(e) {
      if (this.activeBee) {
        if (this.activeBee.touchEvent && e !== this.activeBee.touchEvent) {
          return;
        }
        if (this.activeBee.path.x.length >= 1) {
          /** @type {number} */
          var oldconfig = ~~e.global.x;
          /** @type {number} */
          var udataCur = ~~e.global.y;
          this.activeBee.endPath(oldconfig, udataCur);
        } else {
          this.activeBee.clearPath();
        }
        /** @type {null} */
        this.activeBee = null;
      }
    },
    /**
     * @return {?}
     */
    update : function() {
      return this.paused ? void(game.tweenEngine && game.tweenEngine.update()) : (this.ended || (this.timerBg.scale.y = (this.gameTotalTime - this.gameTimer.time() / 1E3) / this.gameTotalTime), void this._super());
    }
  });
  game.Loader.inject({
    backgroundColor : 16777215,
    /**
     * @return {undefined}
     */
    initStage : function() {
      var sprite = new game.Sprite(game.Texture.fromImage("media/paper.jpg"));
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2, game.system.height / 2);
      if (game.system.width > 1024) {
        sprite.scale.set(game.system.width / 1024, game.system.width / 1024);
      }
      if (game.system.height > 672) {
        sprite.scale.set(game.system.height / 672, game.system.height / 672);
      }
      this.stage.addChild(sprite);
      this.barBg = new game.Sprite(game.Texture.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAToAAAAwBAMAAABzgKu9AAAAFVBMVEUAAABgKjdgKjdgKjdgKjdgKjdgKjcs5IgKAAAABnRSTlMAcRLJ9kWKKg8RAAAAd0lEQVRYw+3YOwqAMBAA0fjBWhS8n0b2/kewjAGLlBOcd4Ih22w2Sfo27gGSt1Q5gmVNL0PAnOSnqx5vDJwLPNhqtFPg5FI3B0+pW4LHOusaWAdinXUNrAPppQ64Qd29bJ/szZ3962H/GHmjPfu5VMCvPJIk6XceXKXTdRn0VJkAAAAASUVORK5CYII="));
      this.barBg.anchor.set(0.5, 0.5);
      this.barBg.position.set(game.system.width / 2, game.system.height / 2);
      this.stage.addChild(this.barBg);
      this.barFg = new game.Graphics;
      this.barFg.beginFill(game.Loader.barColor);
      this.barFg.drawRect(0, 0, game.Loader.barWidth, game.Loader.barHeight);
      this.barFg.position.set(game.system.width / 2 - game.Loader.barWidth / 2, game.system.height / 2 - game.Loader.barHeight / 2);
      /** @type {number} */
      this.barFg.scale.x = this.percent / 100;
      this.stage.addChild(this.barFg);
      this.barFrame = new game.Sprite(game.Texture.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAToAAAAwCAMAAAC2cEa8AAADAFBMVEUsR0DTkTctR0FKTTbTkTfz03zz03zz03zTkTcAAAA/QCq4fzIsR0A6KxdVNwwpMkssR0AsR0A5KhacbCw3KRYzPTlUNw01QzZxXzogAGNqWDQsR0AsP0NbNABiUjB6aEAsR0BbNAA9LRi/qnpbNABOQCasmGtURSo3NzW3o3Q4KhgyLEJcTC7y0nuIc0bx0nsuRT1bNABbNADx0XosR0AmJ1IsR0Dz03ygjmWvmGVbNAC8n1rEsH9bNACEXCdbNABaNAGxlVQtIE7z03xZNARbNABDNh9aNAGpiETBqWxdNgRaNABaNQKijV6Id1FaNAFzY0ZILhw4E0cgBWLMrF5EMxiVf07KtYNdTSzTkTfPuH4hEls6HzjEqmPOs2h1YzlSJhtBNybmz5CXgUvu1ZZ3VCTIsnhCOyVoTyY0JxVbNABbNQA0JxUaAGb756n35bHy0Xz646P25KdlPQb214jx2pXUjDnDbBTLdx724KPz2I/ZiDHHbhT857HuzXj13p7225T335lcNQD34azbjzvz4qbNfSXQeR3t1ZDwy2/57MPx25v21YH44Z7y36Lu3J/VfB4+EDn977v36bnAaA/y3p/w0oUzBkxVKwr/67fr1pry363rzoXGchvPiDH778nSgyzKplhDFjDLcRQnAF9HGyc4C0Plzo330neeVS3MgC1pQw0sAlb867ByThrRl0FNIRr624royX/isljVgSbrx2/r2J/vxmXTvX+3oGrKijuRTTepkl/qw2iASwnv3KXbrVPn05WnYBUfAGjmxXWgXBltSBO4nVzXolXjuWDOrmPzz3P8+9aIUQh5RwbZpEjav3EUAHPZtm7+/vzgxoewk1GJdk18WSPKtXmdiV379sbErXfx5LrCpWFQJhLivHbXx4nlvGnFfS3Folbbql2VgFSSbzm7mVLZmUiGYizs26nhwn28eihZNAFxQgOjh01fMSHTwZj7+O2+pm6ucy+tm3dzOTR0Ox62Yw5oWT7o48+RVg2cf0Hq59/QxrFWOhwEUywtAAAAaXRSTlOAEIADKA8nLi8ACzZw4iiYaVPtQfaRMRPW/ttgiTrhznZH1swb9tPum8/9puhlxXIgYYExe6hCPdj+xsrK8k76l866Um2y/ejQylbg1dfj6/rw7+7CxdvGvxvF1tR1NnP9r72d1ULpeO5dv9ZSAAAV+ElEQVRo3nxQQY7kIAxciRMcfHROHJD4AByRouRA1BIg5R/hF7x8C9o7s+pZrbtjsMtlF/6lfxh5RWZelDLGbEwc8ow3ozQ5R0yWnDVwXiv2SmsmbwNppa1DshRN2VNAqTeuACMbrLUcvFGImAuRUWy9t+AW6xwXz2Qc6Y0Nu/mB4zXGgFxciTnnGIsL+bxyiDmiiBx0heIJNJ+ti05DAYHFjtDTcylsLEMZunmoX6a9i1ewmyJrHQAikBhBccxhitYmBybe8HiUwwwpT/qHfa4OjXuvPV0pnjW1Wu/+4HdfZxp7u56OYGaeF86R0nO80jnjp7eWkJq319H3HWfvO5DxJkx/p9UN91frz34/qSI9Udj9PPXo9wSPWb6nd1/xy6QY6F/R0Y6l6rrq1XuTjjtScFI3jv21TAbudbEH3I3UGiIyL3lyrS3VM2IVHRXR+f+tbjvb7CIGvpwz+QaGyEYsb5BdyDmE9UeGrOxN+tzEAD4W96uLsIUjQ2XQCj7qvnf5ja6/fCJMnCRF2Zr+NUZqoUd64ToQTROwndu/V8e/yaae1kaBKP4t9hPsJ+htFxbyeSxM1ImHekjjgGBIsoEWPYRA8eTC4IBCipdShOCCuYhkMTSEFkIFyWEppZfQw/40ssvu/mbem/fHN/Pmx3j2+ctpX9Zs0gIWT6goikoU1bs4ZwkXCNCKJkyUJTJlyRNBJVpUBT3nLGGS4JJIJMaSBA4XlCNLKZeSoqg9GElRUSoELQvGKGMcJbxgvBC84KwWKqioEgkLZ4ydiGPsxAYmZZyjEFfFEUklsP85LcuqFKhCEp5Amhc4V+LsN9fNgqr6Cxgta62gFTSXoK0EJQzdov2W0aYSP8LZh/+p64Dl9jGIqsIdwMt7WX7abra35m3XJz5A1Dg2p+pXEnv+bPqkEt++IIRMbTXexCoh3pPt2VHkTzfqLFp7ikK8aETikbeJvVkcKYSMFM+yIkNRFMvTrPXEsCJvvbYizbOMtWUYuhEeHD08hL1wrs+z+WCu54d8l6a73ff8kOU/3ncpRpgfwjxM92k+HmfLsez2l+5jAPSCwJkvnWX2GMh5Lgdhf5nK6X6/d6Ggc3fvuvs87C3T1K0jUC2QSPMsy6Lt6+t2u9lET9H2ZwkiiqoSrH3kTOr8S12nedX8+e3leLx5uPK79yaIIhDz3gQpRFVNszZagIULpYY9izFsLKPJxL40LicNRhpgaYgCE8MwNA3qDwaaZVm6rg8GgyDA7PWc3unmta7hzMfQkDrgOLABmIi1kOVvLVa19PtyE5T7SLSpNlurxd3dYjFcDRfD2jsB1nAFZ4go1Goly47jeEA8m5rd6+uub953/auHm+Px5e2ZN++08xd1H3+RVf4qbgNBGH+Me4G8y5X3Jt6LyBUyKHIQC4lkryHChosOXKbKFYbYaYJIc5U6tVtc7XQuD2zu90mLdH9+7Ixmd1bG+nZGupSo9+fj8di2x7b5LsqylPOeAIxn/o7SHA5VZUrs9rY0iTGGMMERHMixkPzqIampyKx1brl0nfyLxccFiqdFOiiLogg/uyHSEfykVGeU6UzrCP51Nh3RESD03R1PjQeEfsd6uyVBSSqHae86uC1w4Zj4uZtitXLOWmPKPA+P3LTogjjne+l0+WGQDuWk5sNTow2nU7PZ5Ay/AQJcnnuP00TTt2xewlYR7hkpA973vtKhBqR0llWQAWInSbdGpOShGr3IhOZ9UMnqCqvrXS2yHktobWbj2Ll4gESkbL0TdRzvfqxYThlss65I0zjKDNLxYB5jNKeTtGmeHtSdaBeku7jqPjjnpm3bxqyoA7qTP5FMJgyaExZFEVpRdTAFSkB8ketjCmA68EmEy5qjxa5HPjMEvndjYs7h07hzimD+gnFDb9xDq6nZACd+y2jLfkKHduxH/u6HjepcsX/Nt+v1/z+Pj/92tVvW0SRBBhtFejGZTp5z92W5ugjSPZNUxagRxDDwXXpA+vtMvpEvhK3SpfaAiusMqc/CwiwsLMalC30gI26QmBlJ9egjA/D34ur76zMT/BpuZtJh7lrKgE5TV5mu8PHzKqOXPkq5XgxTUnoOBisCkQQJUZGIDsF0KCEODhUImE9zEYV6BO0UyHx4mGsegCubCDV7pFJwPVV3thFb6xvnyU56C1ZrrdZNWdu5Nx393n/Haqu1te6Dg5uSJl/GWsfzebMPvg+iVnVH9EIydDGzf928/QAYKI2lffOBYfdgHagydYUEHR+I/XLHjf6uWaXAwr976tNMvEBLK3OYAQDXVYzaQBADf5B6UDFbiYEg7hn7HBsXqQ3GVVIEDGnS+Rdx4zdcmdJNivwiIxeBREjalTQsO2KL1Xz8y8/xP/l6e/FX4un9+fXz47tf2sO9dR4fDtfj+bau29Nmt7+koak5FZqZCbAyp1LKVGUsywBax7LY2S9t3rUBnQtwsCKcA0NEsYoKeEEAklKsVgxQaWzOQpYlIkimCGZOUgog5JpkS4sYLKMaGrBiIO7esbPqiMNnFY0qDVdA2g02PBrVd7dZfjmYkUkXgWzS0X24N+Sy321O23W9nY/Xg4eLbt0PO3bM0jwQx3E8RZM+cZZuXUQQhBA0Q0AQhKt7uqVD28Hpn4N2KBxCyRYXx2Q6g6K4ubiISAedCkfpJBk0i4OCMbgU4pDt+RcfSnlew31fwodfcsfVKPUGTGS3kzTt9c5KwLq21elUZVinY9ldwMqzXi9NJ7eZYAOP0pqurB3i/MZD8c6i1OehA9B027ZtVWX/smy77TYBnJD7acTexXCMZIdrSg2vdPSbBcdJGvvhDGDLNAwi6ZbpiGGYWwCz0I/T5Dhg3/Pnj5qy43ne4JLdjaKIc15C0zRNSfc/HaI0oUSgKBrdscsBou0ouzi6x2Fw/TzFayiO7sjEDEm3TGeY2BHODu/q0+frYPiIs9tFOkrHjJ0np3nsvwK0f+k02aJfujbAqx/np8k5Y2NKke4AV1dkwc1TGHPuwLYxj1RV2aIqMeZtg8N5HD7dBFmBqztQGvjZFll2EUe4RgdcdCPE0iuyRbpFCOq54OA/LYovsqxAtIZS38fVCcFO4rzv/4BLiG1X1daqbFFLrdo2IS78+P08PmFC4Or268rmHqXFx2R0H/U5n8E6HhCaurL6R7ZodUXV8LBYhxnn/eh+NPkoKN3bVPQG9Qrx8pmkPuc5QFfTVL0i6ZbpKrqqaV2AnHM/TT5fROHRhq7odY9+XT2It6mPpiVs4OYqLUm3TNeq4O42oOwj3fRNPFx9Ua+OdPpfdq0eNJEgCrcHyzab5bjmGheGjFXSbbKLIATZPbKLhT9gGZJCBS/iWVicCjYHJiwkGHBjb5XmwnkhVQQJCkKCmEYIEiJpEkhlf9/bjTmOu/K6u8/MzHvfeztvZ4jizud6poCT/tmkib3DF7v4yv+t+33rVuJpvF+xRZPZ18dRIbPunZysZjM3U7ffHtYOms05HnSXN3ZCwhsBf6ElQUC3JPydexB+9QQ0epG9JCyhDkD8SxwOTHDoiUUGBgF8iHJhoIHzpkEQJhjY6PyU0Ac0eOD8Kn41CsKAT7TfKLYAVSBmsQs7G8vYlnmzeVAbtvvu9CaTXfW27n02czkaP95PTnKHteN5JE2QRFmWZBhyEF1QlEQRTaIhQIMUCJAlLgbA6xY2SECiNN+TZFGUxQAmgClRgBivTDwgUiUfMui4iATiRFkSqTyuQB5F5WBQfs1Eg0NzSz5JDCZPw/sJeBLiqChjITLm9klcC5DnM0G6TW+h8uJYksqKCAKR+XHtMHcyuX8cjy4z2ff+KfFmJvsw6vZnw3qbTsjXIul/F3Lwj3RkjfSjdn0463dHD9nM5ssBO50APF8Xz6eTVpkEvNZ4W1W5GrVZ1FZV1bZtVeeKris6BlMztXBYC5sxE2BKiisK57qSVBAGuJKEycECjMHUMbw0UBRjjCNNVZOcKSpjWzrnKkMVzizLVHhqK2XqZooznuJ6Esk0Pa5QbW8ezlQ7oaoWg814wkI2bsRK4GVaFgubpqVp4YSdMAz7XcJIGGED92tosZhhGJqhaRjBAFhIOBbTEKEVaTGMXohZmAsLjzI7io1Qt8ct0jDLrcn0vHj9TM/+C0UMv9Qo3J61n6bDXDUPNQofh57YBJPgM59z+eqnvV1Ilbt70Fx2scnVSoN0pEoln8e5PKxSpe4SGiVE8qVSw2k4Hdd1Go085KGS03VLYEuO0yG2A7fRQdBxnHqj7na7X9qQDUmihYJYhzIFDddFiTxh30OFUKzsIwTtseijugD+NY6OfC2WRB0f39EGp4PBHQk+UIMQBHq93l2vVy5/g++lDy4urq6uLk5P92uQszzkPL3tI1YPJ1/NDadP7bPbAn6W8iomvsUj2Q8mzWi1USAMo2+x77FvsO8TaHbbVZqwNVmKwUWiF8VcyGxgr4SWMOBgLoQQA0JjKRhKoFAK1iJEaB9iz1hKezATM5HROf5DCJ9X1/sobR5uz2zit2N7uSSv7oYgvQ5GI0fElkWOZHVwztl4NJqykaAOYIRD5ucz3wCDbAEJHlZC3+cLINv0BtofLfI8e+AvSflgoMGcM0TaEAFjeAvAQ2yNXU5kMKJBn0CZwXGu6wxd551Y/NTWYrL+JMnrerVSmSrYQGmyFVdd/7FwlCS86rpOEvqKVVIrjsneUarOZ0ND3663PPB8jYlzpJzdPjRptL++4k//l48IWz+r1DvsIymjx4sFOT8ZGiEaMdrvMVe0gzyxgF1uF2mwE4auJtQgIvA98L1jAD7T2hrPZke/fLBpuRd6cFqbXdB4vmvAuIuvaQxns2F0fzBwYqwJYYyil3hTNT+mg9xsiu22rURsiLtcxHFUVXn+fVZnd9sWa/OyKNJnWcq2vHyW6ak0J2bcplspGyXnmZy32zYrlTkp28nlXM5BdpSaDOPUI1NEoJ7Ecs3lLy4etZ39oYeqb5/T/x49J/eHp5vXtArt/qLfX3T1NmU6wxmQhOpq2+3E0DECyilwXRYaRUVLjq/VsQzxBCjkneUZLv3uoQtPG/TXHAHemv7O3OLoyPa6TsZw/VAvVOoNJe6GLDQIN/4xVToVRvBShZHmTgSiqpzqectv2pQqNHIh8mFdWzllpZIiSVS5atJ/u6IoVWHOpUqsVopcNpalzGZyaWV/m0K1Sv06VeXcLJUqsWZ+EkcpsqxnM1YB8o766LDDKn29eTrcnyCq95H+w9ee5uQ/mWaMGzkMA8Bn3DvuEXlRAJuAXBp068ItDQLqlFaVywABFvnFGVdcsQ/YIsUNrT1fNhmIFEVRXInwurE+3i9dlnX8T9d1a0rJS9Gg+HrSAeozbcm59LRCNsYIKsAVLawN9u1Ita6JxKWsZSe/l46I0jFS9U51K0WKmjohBLjgLiLsTdRVRNEmgpi4ZJGqHjPVjzkXcx1UrbecxfrB6PPQL70Vsq3ucUiRSBE/SBX5//76/WccV8nd5f2D1xz8/HJdp92fetkuY6p1nmSCGSE39EMOI8M0z2ImdEQRJs1kRXMxFU6Z7xwRzR+RLe6RqXHaRv5miRmt702ETdiU2RBntR4yZ0YPKATvgsLAg8RuD9f9AMcM0DGPLNAvt9syYCCPRJioVlCda03jZXtpl8wer+vAE06uQD2/vfKNJ4H70TQwq/9QnDwcI6BWT3dwn/he9p1xAce8e3aG1+u1FOaK01095nmEzhSopEpfE1K9CFuoJsVdJeqX1Y1atiqZCV4QW0R6ujjxRMtRnKgctuAMYbFE6WzApHyw3AhpgQg6GMgHqqhJa+yELzmvb8/t3uLTt/t1P/6yae0oksNA1Gy+wUSDbzAw+d6je5h8JvXiyDfQDSqS4kIqaFCgvMFBC4cW+AK6gY2jdoOTffIwyTLP1q/k0qt6cljV59yoDvV/aknjOPZ9edOW0tKnrlvGEbMxrUzrfdu2le57n/aF19RvfZ/S2vU3WPpx2fdlua/zer6zd926mjWNHZ9VdutHKUREA5auU6ZjzDcsUoLnMG4JR4F23O4gQQBlvg/DrWAYLrfL9Xq7XS+X63BYSrsMN6wuwwPW6/WrKyjD96zgsNzQH4vhAr9y4vB4PPDdA0ff79diRDLgTeh3EAw7xEgLokY9ZDN/Vs//SQc8VdXLKeTZ5GyaHErNpMkqOGJyhp0xLjCTnzRbzUKWjIQscbLe2ig0kdbOsjJmNipEthPQtjXa5LWvsamjIy8EyZoPCoEckQ4uE6sgHXPusjjRgUj85A3xoTIO7GZ8E7T2FntWxDM7hZvoGmOCc1k5Z4LXtrURHG0b0erW2vaArY+hxnCMZV17H7XWAt+mUQaEB4qJyLmvpIPKpgSQc1M0mXM4vVTV0w8Fsc+/qqp6fWc2WgcE5ZwjYbJAFE3steizaA4Q4k0Q/Un4zIHkHMgiHRd+O4h5+ns6k/XFx/s6eju1sRWRCEz1BIhA7ogEom21JWmRddT2zZKOdoq2PGwyYje4MAVuyMgxSiR9JEay4LfVYoyBhHNWRUILIvjb+K0WpPsRdSz7CAHcoGGopQKzfTsXIEnEbfFiV8CGEBpcm2F+f4VAv55/KsP+849SK9aJGIahVTducZcMJ3lisuTZfEAWBpDQUTG1A3xAf6J/cBPMiDIx9B/6YzynoEgnL/fOfnmxnMTnZGxTkJKqJM2AJiISSe4FrRMjiRMxqEkioIYZwuNpN2Ix5GE1tjCFMiIzETPLakYFls0lE5yx2o0KRN5yHoesqukP5ISw5tv7l/F8ev1cl/U0z0+P88fDaV1+vr6Hfpr66dgf8eZ6aMy3DbwNtXHb/gK3zV/CeYG/98/LOI7ZCFBAtDBm/10QL6MpuIu/YO9abyt+Ffvc7SJYvPAVaOtYBTjcBOFaS3QU4++I4KIYLqX5IAITJAY33iVZZhBZw8bk18g+KJMEB4Sz1rm7iVt36GpitD5uYRSKk1tYlB93t0oXcV0x2viaqr4oJNotPq07hK0DDr/Vm0HKrTAMhaWdlSDpxA46yRI6KN3/0t7XghQlXOHN/mM0TaK56TnCHZnV4Tv8nhAX9jj+yxlu6pbbJczt7nXCdugwxBFc1r53833fijSnH1/rxKGOMj6Ck/oISTxOr/6NsNnkePYKHuH+L24Zf0i2Z9IR/a91Nk7xKcA5U233wWJw53r3fMMn2Nm1M2Bw3tIv5TH/Vjndb8TeaEPNuomtDjJhmImqVs15uprxQoBRzLViZjoyfkwzrd0047tID6y6WA+d1vN6EM3GR7DDpApnVZpgsmDS713IDSYQ0r3vfW6mwivzJs39v3sLbxbEZGKljZHnrhq0ONR5iKmkmBoo8UaKu/xwKd6L5fc9Ja0kLUpZq1RKSlxa4RJToinLxnOP7gs819p5MkGhDMCqFjLnuK48oUjX64WCI4si2WCJvgSZVM0XIpPFVA6UR7Gag1ZR6zMkUcmMel3jai2le8OlgTnymsyl7o9jKoQDW7npk/M6NDRAO56I1CGJMK71/+AfMZvc9s9PyuAAAAAASUVORK5CYII="));
      this.barFrame.anchor.set(0.5, 0.5);
      this.barFrame.position.set(game.system.width / 2, game.system.height / 2);
      this.stage.addChild(this.barFrame);
    },
    /**
     * @return {?}
     */
    ready : function() {
      if (game.Debug.enabled) {
        return this.setScene();
      }
      var tween = new game.Tween(this.barFrame);
      tween.to({
        alpha : 0
      }, 800);
      tween.onComplete(this.showLogo.bind(this));
      tween.start();
      tween = new game.Tween(this.barBg);
      tween.to({
        alpha : 0
      }, 800);
      tween.start();
      tween = new game.Tween(this.barFg);
      tween.to({
        alpha : 0
      }, 800);
      tween.start();
    },
    /**
     * @return {undefined}
     */
    showLogo : function() {
      this.logo = new game.Sprite("edflogo.png");
      /** @type {number} */
      this.logo.alpha = 0;
      this.logo.anchor.set(0.5, 0.5);
      this.logo.position.set(game.system.width / 2, game.system.height / 2);
      this.stage.addChild(this.logo);
      var tween = new game.Tween(this.logo);
      tween.to({
        alpha : 1
      }, 800);
      tween.onComplete(this.hideLogo.bind(this));
      tween.start();
    },
    /**
     * @return {undefined}
     */
    hideLogo : function() {
      this.fader = new game.Graphics;
      this.fader.beginFill(16777215);
      this.fader.drawRect(0, 0, game.system.width, game.system.height);
      /** @type {number} */
      this.fader.alpha = 0;
      this.stage.addChild(this.fader);
      var tween = new game.Tween(this.fader);
      tween.to({
        alpha : 1
      }, 800);
      tween.delay(500);
      tween.onComplete(this.setScene.bind(this));
      tween.start();
    }
  });
  game.db = new GBAPI;
  game.db.setSharedKey("1234");
  if (game.device.android2 || document.location.href.toLowerCase().match(/\?lowmode/)) {
    /** @type {boolean} */
    game.System.webGL = false;
    /** @type {boolean} */
    game.config.useBlendModes = false;
    /** @type {boolean} */
    game.config.useTint = false;
    /** @type {boolean} */
    game.config.useShadows = false;
  }
  game.start();
}), game.module("engine.physics").body(function() {
  game.World = game.Class.extend({
    gravity : null,
    solver : null,
    bodies : [],
    collisionGroups : [],
    /**
     * @param {number} id
     * @param {number} options
     * @return {undefined}
     */
    init : function(id, options) {
      this.gravity = new game.Vector;
      /** @type {number} */
      this.gravity.x = "number" == typeof id ? id : 0;
      /** @type {number} */
      this.gravity.y = "number" == typeof options ? options : 980;
      this.solver = new game.CollisionSolver;
    },
    /**
     * @param {Object} body
     * @return {undefined}
     */
    addBody : function(body) {
      body.world = this;
      this.bodies.push(body);
      if ("number" == typeof body.collisionGroup) {
        this.addBodyCollision(body, body.collisionGroup);
      }
      if (game.debugDraw) {
        if (body.shape) {
          game.debugDraw.addBody(body);
        }
      }
    },
    /**
     * @param {Object} item
     * @return {undefined}
     */
    removeBody : function(item) {
      if (item.world) {
        /** @type {null} */
        item.world = null;
        /** @type {boolean} */
        item._remove = true;
      }
    },
    /**
     * @param {?} fn
     * @return {undefined}
     */
    removeBodyCollision : function(fn) {
      this.collisionGroups[fn.collisionGroup].erase(fn);
    },
    /**
     * @param {Object} a
     * @param {string} deepDataAndEvents
     * @return {undefined}
     */
    addBodyCollision : function(a, deepDataAndEvents) {
      /** @type {string} */
      a.collisionGroup = deepDataAndEvents;
      this.collisionGroups[a.collisionGroup] = this.collisionGroups[a.collisionGroup] || [];
      this.collisionGroups[a.collisionGroup].push(a);
    },
    /**
     * @param {?} rowNum
     * @return {undefined}
     */
    removeCollisionGroup : function(rowNum) {
      this.collisionGroups.erase(this.collisionGroups[rowNum]);
    },
    /**
     * @param {Object} entity
     * @return {undefined}
     */
    collide : function(entity) {
      if (this.collisionGroups[entity.collideAgainst]) {
        var unlock;
        var classNames;
        /** @type {number} */
        unlock = this.collisionGroups[entity.collideAgainst].length - 1;
        for (;unlock >= 0 && this.collisionGroups[entity.collideAgainst];unlock--) {
          classNames = this.collisionGroups[entity.collideAgainst][unlock];
          if (entity !== classNames) {
            this.solver.solve(entity, classNames);
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    update : function() {
      var i;
      var recordName;
      /** @type {number} */
      i = this.bodies.length - 1;
      for (;i >= 0;i--) {
        if (this.bodies[i]._remove) {
          if ("number" == typeof this.bodies[i].collisionGroup) {
            this.removeBodyCollision(this.bodies[i]);
          }
          this.bodies.splice(i, 1);
        } else {
          this.bodies[i].update();
        }
      }
      /** @type {number} */
      i = this.collisionGroups.length - 1;
      for (;i >= 0;i--) {
        if (this.collisionGroups[i]) {
          /** @type {number} */
          recordName = this.collisionGroups[i].length - 1;
          for (;recordName >= 0;recordName--) {
            if (this.collisionGroups[i][recordName]) {
              if ("number" == typeof this.collisionGroups[i][recordName].collideAgainst) {
                this.collide(this.collisionGroups[i][recordName]);
              }
            }
          }
        }
      }
    }
  });
  game.CollisionSolver = game.Class.extend({
    /**
     * @param {Object} str
     * @param {Object} i
     * @return {undefined}
     */
    solve : function(str, i) {
      if (this.hitTest(str, i)) {
        if (this.hitResponse(str, i)) {
          str.afterCollide(i);
        }
      }
    },
    /**
     * @param {Object} data
     * @param {Object} body
     * @return {?}
     */
    hitTest : function(data, body) {
      if (data.shape instanceof game.Rectangle && body.shape instanceof game.Rectangle) {
        return!(data.position.y + data.shape.height / 2 <= body.position.y - body.shape.height / 2 || (data.position.y - data.shape.height / 2 >= body.position.y + body.shape.height / 2 || (data.position.x - data.shape.width / 2 >= body.position.x + body.shape.width / 2 || data.position.x + data.shape.width / 2 <= body.position.x - body.shape.width / 2)));
      }
      if (data.shape instanceof game.Circle && body.shape instanceof game.Circle) {
        return data.shape.radius + body.shape.radius > data.position.distance(body.position);
      }
      if (data.shape instanceof game.Rectangle && body.shape instanceof game.Circle || data.shape instanceof game.Circle && body.shape instanceof game.Rectangle) {
        var d = data.shape instanceof game.Rectangle ? data : body;
        var entity = data.shape instanceof game.Circle ? data : body;
        /** @type {number} */
        var toX = Math.max(d.position.x - d.shape.width / 2, Math.min(d.position.x + d.shape.width / 2, entity.position.x));
        /** @type {number} */
        var by = Math.max(d.position.y - d.shape.height / 2, Math.min(d.position.y + d.shape.height / 2, entity.position.y));
        /** @type {number} */
        var r = Math.pow(entity.position.x - toX, 2) + Math.pow(entity.position.y - by, 2);
        return r < entity.shape.radius * entity.shape.radius;
      }
      if (data.shape instanceof game.Line && body.shape instanceof game.Line) {
        /** @type {number} */
        var y1 = data.position.x - Math.sin(data.shape.rotation) * (data.shape.length / 2);
        /** @type {number} */
        var x1 = data.position.y - Math.cos(data.shape.rotation) * (data.shape.length / 2);
        var y2 = data.position.x + Math.sin(data.shape.rotation) * (data.shape.length / 2);
        var x2 = data.position.y + Math.cos(data.shape.rotation) * (data.shape.length / 2);
        /** @type {number} */
        var y3 = body.position.x - Math.sin(body.shape.rotation) * (body.shape.length / 2);
        /** @type {number} */
        var x3 = body.position.y - Math.cos(body.shape.rotation) * (body.shape.length / 2);
        var y4 = body.position.x + Math.sin(body.shape.rotation) * (body.shape.length / 2);
        var x4 = body.position.y + Math.cos(body.shape.rotation) * (body.shape.length / 2);
        /** @type {number} */
        var sum = (x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1);
        if (0 !== sum) {
          /** @type {number} */
          var partial = (y4 - y3) * (x1 - x3) - (x4 - x3) * (y1 - y3);
          /** @type {number} */
          var totalAngle = (y2 - y1) * (x1 - x3) - (x2 - x1) * (y1 - y3);
          /** @type {number} */
          var x = partial / sum;
          if (sum = totalAngle / sum, x >= 0 && (1 >= x && (sum >= 0 && 1 >= sum))) {
            return true;
          }
        }
        return false;
      }
      if (data.shape instanceof game.Line && body.shape instanceof game.Circle || data.shape instanceof game.Circle && body.shape instanceof game.Line) {
        var sprite = data.shape instanceof game.Line ? data : body;
        entity = data.shape instanceof game.Circle ? data : body;
        /** @type {number} */
        y1 = sprite.position.x - Math.sin(sprite.shape.rotation - sprite.rotation) * (sprite.shape.length / 2);
        /** @type {number} */
        x1 = sprite.position.y - Math.cos(sprite.shape.rotation - sprite.rotation) * (sprite.shape.length / 2);
        y2 = sprite.position.x + Math.sin(sprite.shape.rotation - sprite.rotation) * (sprite.shape.length / 2);
        x2 = sprite.position.y + Math.cos(sprite.shape.rotation - sprite.rotation) * (sprite.shape.length / 2);
        /** @type {number} */
        var m30 = y2 - y1;
        /** @type {number} */
        var m31 = x2 - x1;
        var position = entity.position.x;
        var i = entity.position.y;
        /** @type {number} */
        var z0 = position - y1;
        /** @type {number} */
        var z1 = i - x1;
        /** @type {number} */
        var b1 = (m30 * z0 + m31 * z1) / (sprite.shape.length * sprite.shape.length);
        if (0 > b1) {
          /** @type {number} */
          var val = Math.sqrt(z0 * z0 + z1 * z1);
          if (val < entity.shape.radius) {
            return true;
          }
        } else {
          if (b1 > 1) {
            val = this.distance(position, i, y2, x2);
            if (val < entity.shape.radius) {
              return true;
            }
          } else {
            val = this.distance(z0, z1, m30 * b1, m31 * b1);
            if (val < entity.shape.radius) {
              return true;
            }
          }
        }
        return false;
      }
      return false;
    },
    /**
     * @param {Object} body
     * @param {Object} entity
     * @return {?}
     */
    hitResponse : function(body, entity) {
      if (body.shape instanceof game.Rectangle && entity.shape instanceof game.Rectangle) {
        if (body.last.y + body.shape.height / 2 <= entity.last.y - entity.shape.height / 2) {
          if (body.collide(entity)) {
            return body.position.y = entity.position.y - entity.shape.height / 2 - body.shape.height / 2, true;
          }
        } else {
          if (body.last.y - body.shape.height / 2 >= entity.last.y + entity.shape.height / 2) {
            if (body.collide(entity)) {
              return body.position.y = entity.position.y + entity.shape.height / 2 + body.shape.height / 2, true;
            }
          } else {
            if (body.last.x + body.shape.width / 2 <= entity.last.x - entity.shape.width / 2) {
              if (body.collide(entity)) {
                return body.position.x = entity.position.x - entity.shape.width / 2 - body.shape.width / 2, true;
              }
            } else {
              if (body.last.x - body.shape.width / 2 >= entity.last.x + entity.shape.width / 2 && body.collide(entity)) {
                return body.position.x = entity.position.x + entity.shape.width / 2 + body.shape.width / 2, true;
              }
            }
          }
        }
      } else {
        if (body.shape instanceof game.Circle && entity.shape instanceof game.Circle) {
          if (body.collide(entity)) {
            var bisection = entity.position.angle(body.position);
            var radius = body.shape.radius + entity.shape.radius;
            return body.position.x = entity.position.x + Math.cos(bisection) * radius, body.position.y = entity.position.y + Math.sin(bisection) * radius, true;
          }
        } else {
          if (body.shape instanceof game.Rectangle && entity.shape instanceof game.Circle) {
            if (body.collide(entity)) {
              return;
            }
          } else {
            if (body.shape instanceof game.Circle && entity.shape instanceof game.Rectangle) {
              if (body.collide(entity)) {
                return;
              }
            } else {
              if (body.shape instanceof game.Line && entity.shape instanceof game.Line) {
                if (body.collide(entity)) {
                  return;
                }
              } else {
                if (body.shape instanceof game.Circle && entity.shape instanceof game.Line) {
                  if (body.collide(entity)) {
                    return;
                  }
                } else {
                  if (body.shape instanceof game.Line && (entity.shape instanceof game.Circle && body.collide(entity))) {
                    return;
                  }
                }
              }
            }
          }
        }
      }
      return false;
    }
  });
  game.Body = game.Class.extend({
    world : null,
    shape : null,
    position : null,
    last : null,
    velocity : null,
    velocityLimit : null,
    mass : 0,
    collisionGroup : null,
    collideAgainst : null,
    rotation : 0,
    /**
     * @param {?} id
     * @return {undefined}
     */
    init : function(id) {
      this.position = new game.Vector;
      this.velocity = new game.Vector;
      this.velocityLimit = new game.Vector(500, 500);
      this.last = new game.Vector;
      game.merge(this, id);
    },
    /**
     * @param {?} val
     * @return {undefined}
     */
    addShape : function(val) {
      this.shape = val;
    },
    /**
     * @return {?}
     */
    collide : function() {
      return true;
    },
    /**
     * @return {undefined}
     */
    afterCollide : function() {
    },
    /**
     * @param {string} deepDataAndEvents
     * @return {undefined}
     */
    setCollisionGroup : function(deepDataAndEvents) {
      if (this.world) {
        if ("number" == typeof this.collisionGroup) {
          this.world.removeBodyCollision(this, this.collisionGroup);
        }
        this.world.addBodyCollision(this, deepDataAndEvents);
      }
    },
    /**
     * @param {?} dataAndEvents
     * @return {undefined}
     */
    setCollideAgainst : function(dataAndEvents) {
      this.collideAgainst = dataAndEvents;
    },
    /**
     * @return {undefined}
     */
    update : function() {
      this.last.copy(this.position);
      if (this.mass > 0) {
        this.velocity.x += this.world.gravity.x * this.mass * game.system.delta;
        this.velocity.y += this.world.gravity.y * this.mass * game.system.delta;
        this.velocity.limit(this.velocityLimit);
      }
      this.position.multiplyAdd(this.velocity, game.scale * game.system.delta);
    }
  });
  game.Rectangle = game.Class.extend({
    width : 50,
    height : 50,
    /**
     * @param {number} id
     * @param {(number|string)} height
     * @return {undefined}
     */
    init : function(id, height) {
      this.width = id || this.width * game.scale;
      this.height = height || this.height * game.scale;
    }
  });
  game.Circle = game.Class.extend({
    radius : 50,
    /**
     * @param {?} id
     * @return {undefined}
     */
    init : function(id) {
      this.radius = id || this.radius * game.scale;
    }
  });
  game.Line = game.Class.extend({
    length : 50,
    rotation : 0,
    /**
     * @param {number} id
     * @param {number} rotation
     * @return {undefined}
     */
    init : function(id, rotation) {
      this.length = id || this.length * game.scale;
      this.rotation = rotation || this.rotation;
    }
  });
  game.Vector = game.Class.extend({
    x : 0,
    y : 0,
    /**
     * @param {number} id
     * @param {number} b
     * @return {undefined}
     */
    init : function(id, b) {
      if ("number" == typeof id) {
        /** @type {number} */
        this.x = id;
      }
      if ("number" == typeof b) {
        /** @type {number} */
        this.y = b;
      }
    },
    /**
     * @param {number} expectedHashCode
     * @param {number} opt_attributes
     * @return {?}
     */
    set : function(expectedHashCode, opt_attributes) {
      return this.x = expectedHashCode, this.y = opt_attributes, this;
    },
    /**
     * @return {?}
     */
    clone : function() {
      return new game.Vector(this.x, this.y);
    },
    /**
     * @param {?} from
     * @return {?}
     */
    copy : function(from) {
      return this.x = from.x, this.y = from.y, this;
    },
    /**
     * @param {?} context
     * @param {(number|string)} selector
     * @return {?}
     */
    add : function(context, selector) {
      return this.x += context instanceof game.Vector ? context.x : context, this.y += context instanceof game.Vector ? context.y : selector || context, this;
    },
    /**
     * @param {?} from
     * @param {(number|string)} to
     * @return {?}
     */
    subtract : function(from, to) {
      return this.x -= from instanceof game.Vector ? from.x : from, this.y -= from instanceof game.Vector ? from.y : to || from, this;
    },
    /**
     * @param {?} that
     * @param {(number|string)} quat2
     * @return {?}
     */
    multiply : function(that, quat2) {
      return this.x *= that instanceof game.Vector ? that.x : that, this.y *= that instanceof game.Vector ? that.y : quat2 || that, this;
    },
    /**
     * @param {number} a2
     * @param {number} b3
     * @return {?}
     */
    multiplyAdd : function(a2, b3) {
      return this.x += a2 instanceof game.Vector ? a2.x * b3 : a2 * b3, this.y += a2 instanceof game.Vector ? a2.y * b3 : a2 * b3, this;
    },
    /**
     * @param {?} x
     * @param {(number|string)} y
     * @return {?}
     */
    divide : function(x, y) {
      return this.x /= x instanceof game.Vector ? x.x : x, this.y /= x instanceof game.Vector ? x.y : y || x, this;
    },
    /**
     * @param {number} vector
     * @return {?}
     */
    distance : function(vector) {
      /** @type {number} */
      var x = vector.x - this.x;
      /** @type {number} */
      var y = vector.y - this.y;
      return Math.sqrt(x * x + y * y);
    },
    /**
     * @return {?}
     */
    length : function() {
      return Math.sqrt(this.dot());
    },
    /**
     * @param {?} x
     * @return {?}
     */
    dot : function(x) {
      return x instanceof game.Vector ? this.x * x.x + this.y * x.y : this.x * this.x + this.y * this.y;
    },
    /**
     * @param {?} _d
     * @return {?}
     */
    dotNormalized : function(_d) {
      var n = this.length();
      /** @type {number} */
      var x = this.x / n;
      /** @type {number} */
      var y = this.y / n;
      if (_d instanceof game.Vector) {
        var tol = _d.length();
        /** @type {number} */
        var a00 = _d.x / tol;
        /** @type {number} */
        var a10 = _d.y / tol;
        return x * a00 + y * a10;
      }
      return x * x + y * y;
    },
    /**
     * @param {number} radians
     * @return {?}
     */
    rotate : function(radians) {
      /** @type {number} */
      var cos = Math.cos(radians);
      /** @type {number} */
      var sin = Math.sin(radians);
      /** @type {number} */
      var x = this.x * cos - this.y * sin;
      /** @type {number} */
      var y = this.y * cos + this.x * sin;
      return this.x = x, this.y = y, this;
    },
    /**
     * @return {?}
     */
    normalize : function() {
      var len = this.length();
      return this.x /= len || 1, this.y /= len || 1, this;
    },
    /**
     * @param {number} min
     * @return {?}
     */
    limit : function(min) {
      return this.x = this.x.limit(-min.x, min.x), this.y = this.y.limit(-min.y, min.y), this;
    },
    /**
     * @param {?} vector
     * @return {?}
     */
    angle : function(vector) {
      return Math.atan2(vector.y - this.y, vector.x - this.x);
    },
    /**
     * @param {?} newPos
     * @return {?}
     */
    angleFromOrigin : function(newPos) {
      return Math.atan2(newPos.y, newPos.x) - Math.atan2(this.y, this.x);
    },
    /**
     * @return {?}
     */
    round : function() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
  });
}), game.module("game.assets").body(function() {
  game.addAsset("bg_park.jpg");
  game.addAsset("bg_garden.jpg");
  game.addAsset("bg_woodland.jpg");
  game.addAsset("bg_urban.jpg");
  game.addAsset("bg_coast.jpg");
  game.addAsset("flare_bg.png");
  game.addAsset("flare_fg.png");
  game.addAsset("clouds_big.png");
  game.addAsset("ui.json");
  game.addAsset("sprites.json");
  game.addAsset("levelselect.json");
  game.addAsset("howtoplay.json");
  game.addAsset("keyboard.json");
  game.addAsset("font.fnt");
  game.addAsset("font2.fnt");
  game.addAsset("font3.fnt");
  game.addAsset("font4.fnt");
  game.addAsset("font5.fnt");
  game.addAudio("audio/bee-crash.m4a");
  game.addAudio("audio/bee-flower-land.m4a");
  game.addAudio("audio/bee-landing-approach.m4a");
  game.addAudio("audio/button-press.m4a");
  game.addAudio("audio/button-rollover.m4a");
  game.addAudio("audio/game-over-panel.m4a");
  game.addAudio("audio/hurry-up.m4a");
  game.addAudio("audio/level-unlocked-panel.m4a");
  game.addAudio("audio/line-draw-blip.m4a");
  game.addAudio("audio/Glorious-Morning-2-(online-audio-converter.com)(1).m4a");
  game.addAudio("audio/time-over-panel.m4a");
}), game.module("game.levels").body(function() {
  /** @type {Array} */
  game.Levels = [{
    time : 90,
    maxBees : 4,
    scoreToUnlock : 15E3,
    beeSpawnInterval : 3,
    speedUpInterval : 30,
    speedUpAmount : 1,
    background : "bg_park.jpg",
    flowers : [["flower", -190, -75], ["flower", 25, 115], ["flower", 180, -130]],
    bees : [{
      name : "TwoBanded"
    }]
  }, {
    locked : true,
    time : 120,
    maxBees : 5,
    scoreToUnlock : 25E3,
    beeSpawnInterval : 1.5,
    speedUpInterval : 30,
    speedUpAmount : 2,
    background : "bg_garden.jpg",
    flowers : [["cosmos", 50, -100], ["cosmos", -150, 20], ["cosmos", 140, 120]],
    bees : [{
      name : "TwoBanded",
      scoreToUnlock : 0
    }, {
      name : "WhiteTailed",
      scoreToUnlock : 1E3
    }]
  }, {
    locked : true,
    time : 120,
    maxBees : 6,
    scoreToUnlock : 27E3,
    beeSpawnInterval : 1.5,
    speedUpInterval : 10,
    speedUpAmount : 2,
    queenSpawnInterval : 40,
    background : "bg_woodland.jpg",
    flowers : [["bluebell2", -140, 70], ["bluebell", -220, 150], ["bluebell2", 205, -100], ["bluebell", 160, -10]],
    bees : [{
      name : "TwoBanded",
      scoreToUnlock : 0
    }, {
      name : "WhiteTailed",
      scoreToUnlock : 0
    }, {
      name : "ThreeBanded",
      scoreToUnlock : 1500
    }]
  }, {
    locked : true,
    time : 140,
    maxBees : 6,
    scoreToUnlock : 3E4,
    beeSpawnInterval : 1.3,
    speedUpInterval : 10,
    speedUpAmount : 3,
    queenSpawnInterval : 50,
    background : "bg_urban.jpg",
    flowers : [["cosmos", 265, -125], ["flower", -250, -65], ["bluebell2", 90, 70], ["bluebell", 10, 150]],
    bees : [{
      name : "TwoBanded",
      scoreToUnlock : 0
    }, {
      name : "WhiteTailed",
      scoreToUnlock : 0
    }, {
      name : "ThreeBanded",
      scoreToUnlock : 0
    }]
  }, {
    locked : true,
    time : 180,
    maxBees : 7,
    beeSpawnInterval : 1.2,
    speedUpInterval : 20,
    speedUpAmount : 4,
    queenSpawnInterval : 40,
    background : "bg_coast.jpg",
    flowers : [["bluebell2", -183, -182], ["bluebell", -264, -102], ["flower", -123, 121], ["flower", 80, -136], ["cosmos", 200, 80]],
    bees : [{
      name : "TwoBanded",
      scoreToUnlock : 0
    }, {
      name : "WhiteTailed",
      scoreToUnlock : 0
    }, {
      name : "ThreeBanded",
      scoreToUnlock : 0
    }]
  }];
}), game.module("game.title").require("engine.scene").body(function() {
  TilingSprite = game.Class.extend({
    speed : 50,
    /**
     * @param {?} id
     * @return {undefined}
     */
    init : function(id) {
      this.container = new game.Container;
      /** @type {number} */
      var animFrame = 0;
      for (;2 > animFrame;animFrame++) {
        var sprite = new game.Sprite(id);
        sprite.anchor.set(0.5, 0.5);
        if (game.system.height > sprite.height) {
          sprite.scale.set(game.system.height / sprite.height, game.system.height / sprite.height);
        }
        sprite.position.set(animFrame * sprite.width + game.system.width / 2, game.system.height / 2);
        this.container.addChild(sprite);
      }
    },
    /**
     * @return {undefined}
     */
    update : function() {
      /** @type {number} */
      var i = 0;
      for (;i < this.container.children.length;i++) {
        var child = this.container.children[i];
        if (child.position.x -= this.speed * game.system.delta, child.position.x + child.width / 2 < 0) {
          var vertex = this.container.children[i - 1] || this.container.children[this.container.children.length - 1];
          child.position.x = vertex.position.x + child.width;
        }
      }
    }
  });
  SceneTitle = game.Scene.extend({
    count : 0,
    ratio : 0,
    /**
     * @return {undefined}
     */
    init : function() {
      game.audio.playMusic("audio/Glorious-Morning-2-(online-audio-converter.com)(1).m4a");
      /** @type {number} */
      var j = 0;
      for (;j < game.Levels.length;j++) {
        var value = game.storage.get("levelData" + j);
        if ("undefined" != typeof value) {
          /** @type {boolean} */
          game.Levels[j].locked = "true" === value;
        }
      }
      /** @type {number} */
      game.bestScore = parseInt(game.storage.get("bestScore")) || 0;
      var o = new game.Sprite("bg_park.jpg");
      o.anchor.set(0.5, 0.5);
      o.position.set(game.system.width / 2, game.system.height / 2);
      if (game.system.width > o.width) {
        o.scale.set(game.system.width / o.width, game.system.width / o.width);
      }
      if (game.system.height > o.height) {
        o.scale.set(game.system.height / o.height, game.system.height / o.height);
      }
      this.stage.addChild(o);
      this.shadowContainer = (new game.Container).addTo(this.stage);
      this.beeContainer = (new game.Container).addTo(this.stage);
      var which = new TitleBee;
      this.addObject(which);
      this.addTimer(3E3, function() {
        var which = new TitleBee;
        game.scene.addObject(which);
      }, true);
      var obj = new game.Sprite("flare_bg.png");
      obj.anchor.set(0.5, 0.5);
      obj.position.set(game.system.width / 2, -100);
      if (game.config.useBlendModes) {
        obj.blendMode = game.blendModes.ADD;
      }
      obj.scale.set(4, 4);
      /** @type {number} */
      obj.alpha = 0;
      this.stage.addChild(obj);
      var t = new game.Tween(obj);
      t.to({
        rotation : 2 * Math.PI
      }, 6E4);
      t.repeat();
      t.start();
      this.addTween(obj, {
        alpha : 0.5
      }, 4E3, {
        easing : game.Tween.Easing.Quadratic.InOut,
        repeat : 1 / 0,
        yoyo : true
      }).start();
      var sprite = new game.Sprite("flare_fg.png");
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2, -100);
      if (game.config.useBlendModes) {
        sprite.blendMode = game.blendModes.ADD;
      }
      sprite.scale.set(4, 4);
      /** @type {number} */
      sprite.alpha = 0.5;
      this.stage.addChild(sprite);
      t = new game.Tween(sprite);
      t.to({
        rotation : 2 * -Math.PI
      }, 6E4);
      t.repeat();
      t.start();
      this.addTween(sprite, {
        alpha : 0
      }, 4E3, {
        easing : game.Tween.Easing.Quadratic.InOut,
        repeat : 1 / 0,
        yoyo : true
      }).start();
      var child = new TilingSprite("clouds_big.png");
      this.stage.addChild(child.container);
      this.addObject(child);
      this.titleContainer = (new game.Container).addTo(this.stage);
      var me = new game.Sprite("logo.png");
      me.anchor.set(0.5, 0.7);
      me.scale.set(0, 0);
      me.position.set(game.system.width / 2 - 40, 170);
      /** @type {number} */
      me.rotation = -0.05;
      this.titleContainer.addChild(me);
      this.logo = me;
      this.addTween(this, {
        ratio : 1
      }, 800, {
        easing : game.Tween.Easing.Elastic.Out
      }).start();
      var self = (new UiButton(4, "buttonplay_big.png", game.system.width / 2, 430, this.hideTitle.bind(this, 
		// this.showLevels.bind(this))))
		this.startGame.bind(this)   )))
		.addTo(this.titleContainer);
      self.container.scale.set(0, 0);
      this.addTween(self.container.scale, {
        x : 1,
        y : 1
      }, 400, {
        easing : game.Tween.Easing.Back.Out,
        delay : 200
      }).start();
	  /* disable how to and ranked
      var chart = (new UiButton(4, "buttonhowto_big.png", game.system.width / 2 - 100, 570, this.hideTitle.bind(this, this.showHowto.bind(this)))).addTo(this.titleContainer);
      chart.container.scale.set(0, 0);
      this.addTween(chart.container.scale, {
        x : 1,
        y : 1
      }, 400, {
        easing : game.Tween.Easing.Back.Out,
        delay : 400
      }).start();
      var a = (new UiButton(4, "buttonleaderboard_big.png", game.system.width / 2 + 100, 570, this.hideTitle.bind(this, this.showLeaderboard.bind(this)))).addTo(this.titleContainer);
      a.container.scale.set(0, 0);
      this.addTween(a.container.scale, {
        x : 1,
        y : 1
      }, 400, {
        easing : game.Tween.Easing.Back.Out,
        delay : 400
      }).start();
	  */
      if (game.Audio.enabled) {
        this.soundButton = (new UiButton(0, "Soundon", game.system.width - 80, 80, null)).addTo(this.stage);
        this.soundButton.callback = game.toggleSound.bind(this, this.soundButton.container);
        if (game.audio.musicMuted) {
          /** @type {number} */
          this.soundButton.container.alpha = 0.5;
        }
      }
      this.levelContainer = new game.Container;
      var g = new game.Graphics;
      g.beginFill(16777215);
      g.drawRect(0, 0, game.system.width, game.system.height);
      /** @type {number} */
      g.alpha = 1;
      this.stage.addChild(g);
      this.tween = new game.Tween(g);
      this.tween.to({
        alpha : 0
      }, 400);
      this.tween.onComplete(function() {
        game.scene.stage.removeChild(g);
        /** @type {null} */
        game.scene.tween = null;
      });
      this.tween.start();
    },
    /**
     * @return {undefined}
     */
    showLeaderboard : function() {
      (new LeaderBoard(function() {
        /** @type {null} */
        game.scene.tween = null;
        game.scene.showTitle();
      }, true)).addTo(this.stage);
    },
    /**
     * @return {undefined}
     */
    update : function() {
      this._super();
      this.count += 0.0225 * game.system.delta * 50;
      /** @type {number} */
      this.logo.position.y = 230 + 10 * Math.sin(4 * this.count);
      /** @type {number} */
      this.logo.rotation = 0.2 * Math.sin(2 * this.count) * 0.5;
      /** @type {number} */
      this.logo.scale.x = (1 + 0.02 * Math.sin(4 * this.count)) * this.ratio;
      /** @type {number} */
      this.logo.scale.y = (1 + 0.02 * Math.cos(4 * this.count)) * this.ratio;
    },
    /**
     * @return {undefined}
     */
    showHowto : function() {
      /** @type {null} */
      this.tween = null;
	  // game.scene.showTitle();
      var el = (new HowToPlay(function() {
        if (!game.scene.tween) {
          game.scene.tween = game.scene.addTween(el.container, {
            alpha : 0
          }, 200, {
            /**
             * @return {undefined}
             */
            onComplete : function() {
              game.scene.stage.removeChild(el.container);
              /** @type {null} */
              game.scene.tween = null;
              game.scene.showTitle();
            }
          }).start();
        }
      })).addTo(this.stage);
    },
    /**
     * @return {undefined}
     */
    showTitle : function() {
      if (!this.tween) {
        /** @type {number} */
        this.titleContainer.alpha = 0;
        this.stage.addChild(this.titleContainer);
        this.tween = new game.Tween(this.titleContainer);
        this.tween.to({
          alpha : 1
        }, 200);
        this.tween.onComplete(function() {
          /** @type {null} */
          game.scene.tween = null;
        });
        this.tween.start();
      }
    },
    /**
     * @param {?} $sanitize
     * @return {undefined}
     */
    hideTitle : function($sanitize) {
      if (!this.tween) {
        this.tween = new game.Tween(this.titleContainer);
        this.tween.to({
          alpha : 0
        }, 200);
        this.tween.onComplete(function() {
          game.scene.stage.removeChild(game.scene.titleContainer);
          $sanitize();
        });
        this.tween.start();
      }
    },
    /**
     * @return {undefined}
     */
    showLevels : function() {
	  // alert("ShowLevels");
      /** @type {null} */
      this.tween = null;
      /** @type {number} */
      this.levelContainer.alpha = 1;
	  // this.startGame(this, 0);
      /** @type {number} */
	  /**
      var child = this.levelContainer.children.length - 1;
      for (;child >= 0;child--) {
        this.levelContainer.removeChild(this.levelContainer.children[child]);
      }
      (new UiButton(0, "Mainmenu", 80, 80, this.hideLevels.bind(this))).addTo(this.levelContainer);
      (new LevelButton("LevelSelect_01.png", -260, -100, 0, this.startGame.bind(this, 0), game.Levels[0].locked)).addTo(this.levelContainer);
      (new LevelButton("LevelSelect_02.png", 0, -100, 100, this.startGame.bind(this, 1), game.Levels[1].locked)).addTo(this.levelContainer);
      (new LevelButton("LevelSelect_03.png", 260, -100, 200, this.startGame.bind(this, 2), game.Levels[2].locked)).addTo(this.levelContainer);
      (new LevelButton("LevelSelect_04.png", -130, 130, 300, this.startGame.bind(this, 3), game.Levels[3].locked)).addTo(this.levelContainer);
      (new LevelButton("LevelSelect_05.png", 130, 130, 400, this.startGame.bind(this, 4), game.Levels[4].locked)).addTo(this.levelContainer);
      this.stage.addChild(this.levelContainer);
	  **/
    },
    /**
     * @return {undefined}
     */
    hideLevels : function() {
      this.addTween(this.levelContainer, {
        alpha : 0
      }, 200, {
        onComplete : this.showTitle.bind(this)
      }).start();
    },
    /**
     * @param {number} level
     * @return {undefined}
     */
    startGame : function(level) {
	  // alert("startGame");
	  // console.log("startGame");
	  game.scene.tween = null;
      if (!this.tween) {
        var sprite = new game.Graphics;
        sprite.beginFill(16777215);
        sprite.drawRect(0, 0, game.system.width, game.system.height);
        /** @type {number} */
        sprite.alpha = 0;
        this.stage.addChild(sprite);
        this.tween = new game.Tween(sprite);
        this.tween.to({
          alpha : 1
        }, 400);
        this.tween.onComplete(function() {
          /** @type {number} */
          game.currentLevel = level;
          game.system.setScene(SceneGame);
        });
        this.tween.start();
      }
    }
  });
}), game.module("game.bee").body(function() {
  /** @type {Array} */
  BeeTypes = [{
    name : "TwoBanded",
    lowSpeed : 50,
    highSpeed : 220,
    initMargin : 150,
    landingTweenSpeed : 1100,
    landingAnimSpeed : 0.08,
    pollenTime : 3E3,
    score : 1E3
  }, {
    name : "WhiteTailed",
    lowSpeed : 70,
    highSpeed : 270,
    initMargin : 300,
    landingTweenSpeed : 1E3,
    landingAnimSpeed : 0.09,
    pollenTime : 6E3,
    score : 1E3
  }, {
    name : "ThreeBanded",
    lowSpeed : 100,
    highSpeed : 300,
    initMargin : 300,
    landingTweenSpeed : 900,
    landingAnimSpeed : 0.1,
    pollenTime : 9E3,
    score : 1E3
  }, {
    name : "Queen",
    lowSpeed : 50,
    shapeRadius : 50
  }];
  Bee = game.Class.extend({
    path : {
      x : [],
      y : []
    },
    pathLength : 0,
    angleFound : false,
    pathContainer : null,
    flying : true,
    speed : 100,
    initMargin : 150,
    steerSpeed : 0.8,
    shadowPosition : 125,
    shapeRadius : 35,
    startOffset : 200,
    counter : 0,
    collecting : false,
    wobbleCounter : 0,
    realScale : 1,
    /**
     * @param {Object} id
     * @param {Object} y
     * @param {(Object|boolean|number|string)} opt_options
     * @param {?} a
     * @return {undefined}
     */
    init : function(id, y, opt_options, a) {
      var options = opt_options || game.scene.unlockedBees.random();
      var settings = this.getBeeData(options);
      if (game.merge(this, settings), "ThreeBanded" === this.name && (this.steerDir = Math.random() > 0.5 ? 1 : -1), this._steerSpeed = this.steerSpeed, this.setSpeed(this.lowSpeed), this.dirVector = new game.Vector, this.pathContainer = new game.Container, game.scene.pathContainer.addChild(this.pathContainer), this.sprite = new game.Animation(this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + 
      "Fly01.png", this.name + "Fly01.png"), this.sprite.animationSpeed = 1, this.sprite.play(), this.sprite.anchor.set(0.5, 0.5), this.sprite.interactive = true, this.sprite.mousedown = this.mousedown.bind(this), this.sprite.touchstart = this.touchstart.bind(this), game.config.useShadows && (this.shadow = new game.Animation(this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", 
      this.name + "Fly01.png"), this.shadow.animationSpeed = this.sprite.animationSpeed, this.shadow.play(), this.shadow.anchor.set(0.5, 0.5), this.shadow.scale.set(0.47, 0.47), this.shadow.alpha = 0.2, this.shadow.position.set(0, 250), game.config.useTint && (this.shadow.tint = 928595), game.scene.shadowContainer.addChild(this.shadow)), "Queen" === this.name) {
        var sprite = new game.Sprite("noGrabQueen.png");
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(0, 0);
        this.sprite.addChild(sprite);
      }
      /** @type {number} */
      var i = Math.floor(4 * Math.random());
      if (i === Bee.count) {
        i++;
      }
      /** @type {number} */
      var h = Bee.count % 4;
      /** @type {number} */
      var l = Bee.count % 2;
      if (Bee.count = i, h > 1) {
        var set = l > 0.5 ? -this.startOffset : game.system.width + this.startOffset;
        var cursor = Math.random() * (game.system.height - 2 * this.initMargin) + this.initMargin;
        if (l > 0.5) {
          game.system.width + this.startOffset;
        } else {
          -this.startOffset;
        }
        Math.random() * (game.system.height - 2 * this.initMargin) + this.initMargin;
        /** @type {number} */
        this.dirVector.x = l > 0.5 ? 1 : -1;
        /** @type {string} */
        var obj = l > 0.5 ? "IncomingLeft.png" : "IncomingRight.png";
      } else {
        set = Math.random() * (game.system.width - 2 * this.initMargin) + this.initMargin;
        cursor = l > 0.5 ? -this.startOffset : game.system.height + this.startOffset;
        Math.random() * (game.system.width - 2 * this.initMargin) + this.initMargin;
        if (l > 0.5) {
          game.system.height + this.startOffset;
        } else {
          -this.startOffset;
        }
        /** @type {number} */
        this.dirVector.y = l > 0.5 ? 1 : -1;
        /** @type {string} */
        obj = l > 0.5 ? "IncomingTop.png" : "IncomingBottom.png";
      }
      if ("number" == typeof a) {
        /** @type {number} */
        this.dirVector.x = Math.cos(a);
        /** @type {number} */
        this.dirVector.y = Math.sin(a);
      }
      if ("WhiteTailed" === this.name) {
        this.dirVector.rotate(Math.random() > 0.5 ? 0.2 : -0.2);
      }
      this.sprite.position.set(id || set, y || cursor);
      var res = new game.Circle(this.shapeRadius);
      if (this.body = new game.Body({
        collisionGroup : 0,
        collideAgainst : 0
      }), id && (y && (this.body.position.x = id, this.body.position.y = y)), this.body.collide = this.collide.bind(this), this.body.addShape(res), this.body.parent = this, game.scene.world.addBody(this.body), game.scene.beeContainer.addChild(this.sprite), !opt_options) {
        var t = new game.Sprite(obj);
        t.anchor.set(0.5, 0.5);
        /** @type {number} */
        t.alpha = 0;
        t.position.set(set.limit(30, game.system.width - 30), cursor.limit(30, game.system.height - 30));
        game.scene.stage.addChild(t);
        game.scene.addTimer(2E3, function() {
          game.scene.addTween(t, {
            alpha : 0
          }, 800, {
            /**
             * @return {undefined}
             */
            onComplete : function() {
              game.scene.stage.removeChild(t);
            }
          }).start();
        });
        game.scene.addTween(t, {
          alpha : 1
        }, 800).start();
      }
      this.warning = new game.Sprite("warningarea_add.png");
      this.warning.anchor.set(0.5, 0.5);
      if (game.config.useBlendModes) {
        this.warning.blendMode = game.blendModes.ADD;
      }
      /** @type {number} */
      this.warning.alpha = 0.5;
      game.scene.addTween(this.warning.scale, {
        x : 1.2,
        y : 1.2
      }, 200, {
        repeat : 1 / 0,
        yoyo : true,
        easing : game.Tween.Easing.Quadratic.InOut
      }).start();
    },
    /**
     * @param {?} speed
     * @return {undefined}
     */
    setSpeed : function(speed) {
      this.speed = speed;
      /** @type {number} */
      this.steerSpeed = this._steerSpeed / 100 * speed * 2;
    },
    /**
     * @param {?} namespace
     * @return {?}
     */
    getBeeData : function(namespace) {
      /** @type {number} */
      var i = 0;
      for (;i < BeeTypes.length;i++) {
        if (BeeTypes[i].name === namespace) {
          return BeeTypes[i];
        }
      }
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    touchstart : function(e) {
      /** @type {Object} */
      this.touchEvent = e;
      this.mousedown(e);
    },
    /**
     * @return {undefined}
     */
    mousedown : function() {
      if (!this.landed) {
        if (!game.scene.activeBee) {
          if (!game.scene.ended) {
            if (!("Queen" === this.name)) {
              /** @type {boolean} */
              this.flowerFound = false;
              game.scene.activeBee = this;
              this.clearPath();
              /** @type {number} */
              this.realScale = 0.7;
              game.scene.addTween(this, {
                realScale : 1
              }, 1600, {
                easing : game.Tween.Easing.Elastic.Out
              }).start();
            }
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    clearPath : function() {
      this.setSpeed(this.lowSpeed);
      /** @type {number} */
      this.path.x.length = 0;
      /** @type {number} */
      this.path.y.length = 0;
      /** @type {number} */
      this.pathLength = 0;
      /** @type {boolean} */
      this.angleFound = false;
      /** @type {number} */
      var child = this.pathContainer.children.length - 1;
      for (;child >= 0;child--) {
        this.pathContainer.removeChild(this.pathContainer.children[child]);
      }
    },
    /**
     * @param {Object} entity
     * @return {?}
     */
    collide : function(entity) {
      if (!game.scene.ended && (!this.collided && !(this.sprite.position.x + this.sprite.height < 0 || (this.sprite.position.x - this.sprite.height > game.system.width || (this.sprite.position.y + this.sprite.height < 0 || (this.sprite.position.y - this.sprite.height > game.system.height || (entity.parent.sprite.position.x + entity.parent.sprite.height < 0 || (entity.parent.sprite.position.x - entity.parent.sprite.height > game.system.width || (entity.parent.sprite.position.y + entity.parent.sprite.height < 
      0 || entity.parent.sprite.position.y - entity.parent.sprite.height > game.system.height))))))))) {
        /** @type {boolean} */
        entity.parent.collided = true;
        entity.parent.kill();
        this.kill();
        game.audio.playSound("audio/bee-crash.m4a");
        game.scene.lives--;
        var obj = new game.Sprite("LifeLostStrike.png");
        obj.position.set(game.system.width - 93 - 52 * game.scene.lives, 597);
        /** @type {number} */
        obj.alpha = 0;
        var tween = new game.Tween(obj);
        tween.to({
          alpha : 1
        }, 400);
        tween.start();
        game.scene.uiContainer.addChild(obj);
        var t = new game.Animation("collision_add01.png", "collision_add02.png", "collision_add03.png", "collision_add04.png", "collision_add05.png", "collision_add06.png", "collision_add07.png", "collision_add08.png", "collision_add09.png", "collision_add10.png");
        return t.animationSpeed = 0.3, t.loop = false, t.alpha = 1, t.play(), t.anchor.set(0.5, 0.5), t.position.set((this.sprite.position.x + entity.parent.sprite.position.x) / 2, (this.sprite.position.y + entity.parent.sprite.position.y) / 2), game.config.useBlendModes && (t.blendMode = game.blendModes.ADD), game.scene.beeContainer.addChild(t), game.scene.addTween(t.scale, {
          x : 1,
          y : 1
        }, 500).start(), game.scene.addTween(t, {
          alpha : 1
        }, 1E3, {
          /**
           * @return {undefined}
           */
          onComplete : function() {
            game.scene.beeContainer.removeChild(t);
          }
        }).start(), 0 === game.scene.lives && (game.audio.playSound("audio/game-over-panel.m4a"), game.scene.gameOver()), false;
      }
    },
    /**
     * @param {number} b
     * @param {number} value
     * @return {undefined}
     */
    endPath : function(b, value) {
      if (-1E4 !== b) {
        if (-1E4 !== value) {
          this.path.x.push(b);
          this.path.y.push(value);
        }
      }
      this.setSpeed(this.highSpeed);
      /** @type {boolean} */
      this.flowerFound = false;
      var delta = this.path.x[this.path.x.length - 1];
      var oldY = this.path.y[this.path.y.length - 1];
      /** @type {number} */
      var i = 0;
      for (;i < game.scene.flowers.length;i++) {
        var obj = game.scene.flowers[i];
        var dist = Math.distance(delta, oldY, obj.container.position.x, obj.container.position.y);
        if (dist <= obj.radius) {
          if (this.flowerFound = true, this.flower = obj, this.flower.container.scale.set(1, 1), b = obj.container.position.x, value = obj.container.position.y, this.path.x[this.path.x.length - 1] = this.flower.container.position.x, this.path.y[this.path.x.length - 1] = this.flower.container.position.y, game.config.useTint) {
            /** @type {number} */
            i = 0;
            for (;i < this.pathContainer.children.length;i++) {
              this.pathContainer.children[i].setTexture("LineDrawSegmentRelease.png");
            }
          }
          break;
        }
      }
      game.scene.spawnReticle(b, value);
    },
    /**
     * @return {undefined}
     */
    flyOff : function() {
      if (this.flower && this.collecting) {
        var next = this.pollenTimer.time();
        var score = this.score;
        if (0 > next) {
          /** @type {number} */
          var change = this.score / this.pollenTime;
          /** @type {number} */
          var timeout = Math.abs(next);
          /** @type {number} */
          var profitPercents = this.pollenTime - timeout;
          /** @type {number} */
          score = Math.round(profitPercents * change);
        }
        if (game.scene.addScore(score), this.collecting = false, !game.scene.ended) {
          this.flower.resume();
          game.scene.flowerContainer.removeChild(this.sprite);
          game.scene.beeContainer.addChild(this.sprite);
          /** @type {Array} */
          this.sprite.textures = [game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png")];
          /** @type {boolean} */
          this.sprite.loop = true;
          /** @type {number} */
          this.sprite.animationSpeed = 1;
          this.sprite.gotoAndPlay(0);
          var player = new game.Tween(this.sprite);
          player.to({
            alpha : 0
          }, 1E3);
          player.start();
          if (game.config.useShadows) {
            /** @type {Array} */
            this.shadow.textures = [game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png"), game.Texture.fromFrame(this.name + "Fly01.png")];
            /** @type {boolean} */
            this.shadow.loop = true;
            /** @type {number} */
            this.shadow.animationSpeed = 1;
            this.shadow.gotoAndPlay(0);
            /** @type {boolean} */
            this.shadow.visible = true;
            player = new game.Tween(this.shadow);
            player.to({
              alpha : 0
            }, 1E3);
            player.start();
            player = new game.Tween(this.shadow.position);
            player.to({
              y : this.shadow.position.y + 200
            }, 1E3);
            player.start();
            player = new game.Tween(this);
            player.to({
              shadowPosition : 250
            }, 1E3);
            player.start();
          }
          player = new game.Tween(this.sprite.scale);
          player.to({
            x : 3,
            y : 3
          }, 1E3);
          player.onComplete(this.kill.bind(this));
          player.start();
          var t = new game.BitmapText(score.toString(), {
            font : "Fredoka"
          });
          t.position.set(this.sprite.position.x, this.sprite.position.y);
          game.scene.addTween(t.position, {
            x : 180,
            y : 20
          }, 1E3, {
            /**
             * @return {undefined}
             */
            onComplete : function() {
              game.scene.uiContainer.removeChild(t);
              game.scene.beeContainer.removeChild(s);
            }
          }).start();
          game.scene.addTween(t, {
            alpha : 0
          }, 1E3).start();
          game.scene.uiContainer.addChild(t);
          /** @type {null} */
          this.flower.bee = null;
          /** @type {null} */
          this.flower = null;
          var s = new game.Animation("pollen_burst01.png", "pollen_burst02.png", "pollen_burst03.png", "pollen_burst04.png", "pollen_burst05.png", "pollen_burst06.png", "pollen_burst07.png", "pollen_burst08.png", "pollen_burst09.png", "pollen_burst10.png", "pollen_burst11.png", "pollen_burst12.png", "pollen_burst13.png");
          s.anchor.set(0.5, 0.5);
          s.position.set(this.sprite.position.x, this.sprite.position.y);
          /** @type {number} */
          s.animationSpeed = 0.35;
          /** @type {boolean} */
          s.loop = false;
          s.play();
          game.scene.beeContainer.addChild(s);
        }
      }
    },
    /**
     * @return {undefined}
     */
    kill : function() {
      if (!this.killed) {
        /** @type {boolean} */
        this.killed = true;
        if (game.config.useShadows) {
          game.scene.shadowContainer.removeChild(this.shadow);
        }
        game.scene.pathContainer.removeChild(this.pathContainer);
        this.sprite.parent.removeChild(this.sprite);
        game.scene.world.removeBody(this.body);
        game.scene.removeObject(this);
        game.scene.bees.erase(this);
        if (this.warning.parent) {
          this.warning.parent.removeChild(this.warning);
        }
      }
    },
    /**
     * @return {undefined}
     */
    land : function() {
      /** @type {boolean} */
      this.flowerFound = false;
      /** @type {null} */
      this.targetAngle = null;
      /** @type {boolean} */
      this.flying = false;
      /** @type {boolean} */
      this.landed = true;
      game.audio.playSound("audio/bee-landing-approach.m4a");
      var defaultEasing = game.Tween.Easing.Quadratic.Out;
      var mouseX = this.path.x[this.path.x.length - 1];
      var targetY = this.path.y[this.path.y.length - 1];
      game.scene.addTween(this.sprite.position, {
        x : mouseX,
        y : targetY
      }, this.landingTweenSpeed, {
        easing : defaultEasing
      }).start();
      /** @type {number} */
      var angle = Math.atan2(targetY - this.sprite.position.y, mouseX - this.sprite.position.x);
      game.scene.addTween(this.dirVector, {
        x : Math.cos(angle),
        y : Math.sin(angle)
      }, this.landingTweenSpeed, {
        easing : defaultEasing
      }).start();
      game.scene.addTween(this.sprite.scale, {
        // x : 0.8,
        x : 0.2,
        // y : 0.8
        y : 0.2
      }, this.landingTweenSpeed, {
        easing : defaultEasing,
        onComplete : this.landComplete.bind(this)
      }).start();
	  
      this.clearPath();
      game.scene.world.removeBodyCollision(this.body);
      if (game.config.useShadows) {
        game.scene.addTween(this.shadow.position, {
          x : mouseX,
          y : targetY
        }, this.landingTweenSpeed, {
          easing : defaultEasing
        }).start();
        game.scene.addTween(this, {
          shadowPosition : 0
        }, this.landingTweenSpeed, {
          easing : defaultEasing
        }).start();
        game.scene.addTween(this.shadow.scale, {
          // x : 0.8,
          x : 0.2,
          // y : 0.8
          y : 0.2
        }, this.landingTweenSpeed, {
          easing : defaultEasing
        }).start();
        /** @type {Array} */
        this.shadow.textures = [game.Texture.fromFrame(this.name + "Land01.png"), game.Texture.fromFrame(this.name + "Land02.png"), game.Texture.fromFrame(this.name + "Land03.png"), game.Texture.fromFrame(this.name + "Land04.png"), game.Texture.fromFrame(this.name + "Land05.png"), game.Texture.fromFrame(this.name + "Land06.png"), game.Texture.fromFrame(this.name + "Land07.png")];
        /** @type {boolean} */
        this.shadow.loop = false;
        this.shadow.animationSpeed = this.landingAnimSpeed;
        this.shadow.gotoAndPlay(0);
      }
      /** @type {Array} */
      this.sprite.textures = [game.Texture.fromFrame(this.name + "Land01.png"), game.Texture.fromFrame(this.name + "Land02.png"), game.Texture.fromFrame(this.name + "Land03.png"), game.Texture.fromFrame(this.name + "Land04.png"), game.Texture.fromFrame(this.name + "Land05.png"), game.Texture.fromFrame(this.name + "Land06.png"), game.Texture.fromFrame(this.name + "Land07.png")];
      /** @type {boolean} */
      this.sprite.loop = false;
      this.sprite.animationSpeed = this.landingAnimSpeed;
      this.sprite.gotoAndPlay(0);
    },
    /**
     * @return {undefined}
     */
    landComplete : function() {
      if (!game.scene.ended) {
        game.scene.beeContainer.removeChild(this.sprite);
        game.scene.flowerContainer.addChild(this.sprite);
        /** @type {boolean} */
        this.collecting = true;
        /** @type {number} */
        this.counter = 0;
        if (game.config.useShadows) {
          /** @type {boolean} */
          this.shadow.visible = false;
        }
        this.pollenTimer = game.scene.addTimer(this.pollenTime, this.flyOff.bind(this));
        this.flower.pause();
        game.audio.playSound("audio/bee-flower-land.m4a");
        if (this.flower.bee) {
          this.flower.bee.flyOff();
        }
        this.flower.bee = this;
      }
    },
    /**
     * @return {undefined}
     */
    update : function() {
      if (this.landed) {
        /** @type {number} */
        var rotation = Math.atan2(this.dirVector.y, this.dirVector.x) + Math.PI / 2;
        if (this.collecting) {
          this.counter += 0.3;
          /** @type {number} */
          var r2Y = 0.3 * this.counter;
          if (r2Y > 1) {
            /** @type {number} */
            r2Y = 1;
          }
          /** @type {number} */
          this.sprite.pivot.x = 2 * Math.sin(this.counter) * r2Y;
          /** @type {number} */
          this.sprite.pivot.y = 2 * Math.cos(this.counter / 2) * r2Y;
          /** @type {number} */
          this.sprite.rotation = rotation + 0.05 * this.sprite.pivot.x;
        } else {
          /** @type {number} */
          this.sprite.rotation = rotation;
        }
        if (game.config.useShadows) {
          /** @type {number} */
          this.shadow.rotation = rotation;
        }
      }
      if (this.flying && (!this.killed && !this.landed)) {
        if (this.path.x.length > 0) {
          var i = Math.distance(this.sprite.position.x, this.sprite.position.y, this.path.x[0], this.path.y[0]);
          if (30 >= i && (this.path.x.shift(), this.path.y.shift(), this.pathContainer.removeChild(this.pathContainer.children[0]), this.angleFound = false), this.flowerFound) {
            var s = Math.distance(this.sprite.position.x, this.sprite.position.y, this.path.x[this.path.x.length - 1], this.path.y[this.path.y.length - 1]);
            if (100 >= s) {
              if (this.path.x.length < 4) {
                this.land();
              }
            }
          } else {
            if (0 === this.path.x.length) {
              this.clearPath();
            }
          }
        }
        if (this.path.x.length > 0) {
          if (!this.angleFound) {
            /** @type {number} */
            this.targetAngle = Math.atan2(this.path.y[0] - this.sprite.position.y, this.path.x[0] - this.sprite.position.x);
            /** @type {number} */
            this.targetAngleCos = Math.cos(this.targetAngle);
            /** @type {number} */
            this.targetAngleSin = Math.sin(this.targetAngle);
          }
        }
        if ("number" == typeof this.targetAngle) {
          if (Math.abs(this.dirVector.x - this.targetAngleCos) > 0.05) {
            this.dirVector.x += (this.dirVector.x > this.targetAngleCos ? -this.steerSpeed : this.steerSpeed) * game.system.delta;
          } else {
            this.dirVector.x = this.targetAngleCos;
          }
          if (Math.abs(this.dirVector.y - this.targetAngleSin) > 0.05) {
            this.dirVector.y += (this.dirVector.y > this.targetAngleSin ? -this.steerSpeed : this.steerSpeed) * game.system.delta;
          } else {
            this.dirVector.y = this.targetAngleSin;
          }
          if (this.dirVector.x === this.targetAngleCos) {
            if (this.dirVector.y === this.targetAngleSin) {
              /** @type {boolean} */
              this.angleFound = true;
              /** @type {null} */
              this.targetAngle = null;
            }
          }
        }
        if (0 === this.path.x.length) {
          if (this.flying) {
            if ("ThreeBanded" === this.name) {
              this.dirVector.rotate(0.2 * this.steerDir * game.system.delta);
            }
          }
        }
        /** @type {number} */
        var angle = Math.atan2(this.dirVector.y, this.dirVector.x) + Math.PI / 2;
        /** @type {number} */
        this.sprite.rotation = angle;
        this.sprite.position.x += this.dirVector.x * this.speed * game.system.delta;
        this.sprite.position.y += this.dirVector.y * this.speed * game.system.delta;
        this.body.position.x = this.sprite.position.x;
        this.body.position.y = this.sprite.position.y;
        this.wobbleCounter += 60 * game.system.delta;
        /** @type {number} */
        this.sprite.scale.x = this.sprite.scale.y = 0.975 + 0.025 * Math.sin(0.2 * this.wobbleCounter);
        this.sprite.scale.x *= this.realScale;
        this.sprite.scale.y *= this.realScale;
        /** @type {number} */
        this.sprite.pivot.x = 4 * Math.sin(0.05 * this.wobbleCounter);
        /** @type {number} */
        this.sprite.pivot.y = 3 * Math.cos(0.17 * this.wobbleCounter);
        if (game.config.useShadows) {
          /** @type {number} */
          this.shadow.rotation = angle;
          this.shadow.position.set(this.sprite.position.x, this.sprite.position.y + this.shadowPosition);
        }
        /** @type {boolean} */
        var n = false;
        if (!this.landed) {
          /** @type {number} */
          var sprite = game.scene.bees.length - 1;
          for (;sprite >= 0;sprite--) {
            if (game.scene.bees[sprite] !== this && !game.scene.bees[sprite].landed) {
              var o = Math.distance(this.sprite.position.x, this.sprite.position.y, game.scene.bees[sprite].sprite.position.x, game.scene.bees[sprite].sprite.position.y);
              if (200 >= o) {
                /** @type {boolean} */
                n = true;
                break;
              }
            }
          }
        }
        if (n) {
          game.scene.uiContainer.addChild(this.warning);
        }
        if (this.warning.parent) {
          if (n) {
            this.warning.position.set(this.sprite.position.x, this.sprite.position.y);
          } else {
            game.scene.uiContainer.removeChild(this.warning);
          }
        }
        if (this.sprite.position.x + this.startOffset < 0 || (this.sprite.position.x - this.startOffset > game.system.width || (this.sprite.position.y + this.startOffset < 0 || this.sprite.position.y - this.startOffset > game.system.height))) {
          this.kill();
        }
      }
    }
  });
  TitleBee = game.Class.extend({
    initMargin : 150,
    shadowPosition : 125,
    startOffset : 200,
    /**
     * @return {undefined}
     */
    init : function() {
      /** @type {number} */
      var fullId = Math.round(Math.randomBetween(0, BeeTypes.length - 2));
      var settings = BeeTypes[fullId];
      game.merge(this, settings);
      this.speed = this.lowSpeed;
      if ("ThreeBanded" === this.name) {
        /** @type {number} */
        this.steerDir = Math.random() > 0.5 ? 1 : -1;
      }
      this.dirVector = new game.Vector;
      this.sprite = new game.Animation(this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png");
      /** @type {number} */
      this.sprite.animationSpeed = 1;
      this.sprite.play();
      this.sprite.anchor.set(0.5, 0.5);
      if (game.config.useShadows) {
        this.shadow = new game.Animation(this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png", this.name + "Fly01.png");
        /** @type {number} */
        this.shadow.animationSpeed = this.sprite.animationSpeed;
        this.shadow.play();
        this.shadow.anchor.set(0.5, 0.5);
        this.shadow.scale.set(0.47, 0.47);
        /** @type {number} */
        this.shadow.alpha = 0.2;
        this.shadow.position.set(0, 250);
        if (game.config.useTint) {
          /** @type {number} */
          this.shadow.tint = 928595;
        }
        game.scene.shadowContainer.addChild(this.shadow);
      }
      /** @type {number} */
      var i = Math.random();
      /** @type {number} */
      var s = Math.random();
      if (i > 0.5) {
        var expectedHashCode = s > 0.5 ? -this.startOffset : game.system.width + this.startOffset;
        var attributes = Math.random() * (game.system.height - 2 * this.initMargin) + this.initMargin;
        if (s > 0.5) {
          game.system.width + this.startOffset;
        } else {
          -this.startOffset;
        }
        Math.random() * (game.system.height - 2 * this.initMargin) + this.initMargin;
        /** @type {number} */
        this.dirVector.x = s > 0.5 ? 1 : -1;
      } else {
        expectedHashCode = Math.random() * (game.system.width - 2 * this.initMargin) + this.initMargin;
        attributes = s > 0.5 ? -this.startOffset : game.system.height + this.startOffset;
        Math.random() * (game.system.width - 2 * this.initMargin) + this.initMargin;
        if (s > 0.5) {
          game.system.height + this.startOffset;
        } else {
          -this.startOffset;
        }
        /** @type {number} */
        this.dirVector.y = s > 0.5 ? 1 : -1;
      }
      if ("WhiteTailed" === this.name) {
        this.dirVector.rotate(Math.random() > 0.5 ? 0.2 : -0.2);
      }
      this.sprite.position.set(expectedHashCode, attributes);
      game.scene.beeContainer.addChild(this.sprite);
    },
    /**
     * @return {undefined}
     */
    kill : function() {
      if (this.shadow) {
        game.scene.shadowContainer.removeChild(this.shadow);
      }
      this.sprite.parent.removeChild(this.sprite);
      game.scene.removeObject(this);
    },
    /**
     * @return {undefined}
     */
    update : function() {
      if ("ThreeBanded" === this.name) {
        this.dirVector.rotate(0.2 * this.steerDir * game.system.delta);
      }
      /** @type {number} */
      this.sprite.rotation = Math.atan2(this.dirVector.y, this.dirVector.x) + Math.PI / 2;
      this.sprite.position.x += this.dirVector.x * this.speed * game.system.delta;
      this.sprite.position.y += this.dirVector.y * this.speed * game.system.delta;
      if (this.shadow) {
        /** @type {number} */
        this.shadow.rotation = this.sprite.rotation;
        this.shadow.position.set(this.sprite.position.x, this.sprite.position.y + this.shadowPosition);
      }
      if (this.sprite.position.x + this.startOffset < 0 || (this.sprite.position.x - this.startOffset > game.system.width || (this.sprite.position.y + this.startOffset < 0 || this.sprite.position.y - this.startOffset > game.system.height))) {
        this.kill();
      }
    }
  });
  /** @type {number} */
  Bee.count = 0;
}), game.module("game.flower").body(function() {
  /** @type {Array} */
  FlowerTypes = [{
    name : "flower",
    animSpeed : 1E3,
    radius : 85,
    head : {
      x : 0,
      y : 50
    }
  }, {
    name : "cosmos",
    animSpeed : 800,
    radius : 100,
    head : {
      x : 0,
      y : 45
    }
  }, {
    name : "bluebell",
    animSpeed : 900,
    radius : 60,
    head : {
      x : -5,
      y : 45
    }
  }];
  Flower = game.Class.extend({
    bee : null,
    tweens : [],
    /**
     * @param {Object} id
     * @param {number} width
     * @param {number} src
     * @return {undefined}
     */
    init : function(id, width, src) {
      if ("bluebell2" === id) {
        /** @type {string} */
        id = "bluebell";
        /** @type {boolean} */
        this.blueBellLeaves = true;
      }
      var settings;
      /** @type {number} */
      var i = 0;
      for (;i < FlowerTypes.length;i++) {
        if (FlowerTypes[i].name === id) {
          settings = FlowerTypes[i];
          break;
        }
      }
      if (game.merge(this, settings), this.container = new game.Container, this.container.position.set(game.system.width / 2 + width, game.system.height / 2 + src), "bluebell" !== this.name || this.blueBellLeaves) {
        var item = new game.Sprite(this.name + "_leaves.png");
        item.anchor.set(0.5, 0.5);
        /** @type {number} */
        item.rotation = 0.4 * Math.random();
        if ("bluebell" === this.name) {
          item.position.set(-50, 40);
        } else {
          item.position.set(0, 20);
        }
        this.container.addChild(item);
        var tween = new game.Tween(item.scale);
		/**
        tween.to({
          x : 1.05,
          y : 1.05
        }, this.animSpeed / 2);
        tween.easing(game.Tween.Easing.Quadratic.InOut);
        tween.repeat();
        tween.yoyo();
        tween.start();
		**/
        this.tweens.push(tween);
      }
      var o = new game.Sprite(this.name + "_head.png");
      o.anchor.set(0.5, 0.6);
      o.position.set(this.head.x, this.head.y);
      o.scale.set(1, 1);
      this.container.addChild(o);
      var sprite = new game.Sprite(this.name + "_face.png");
      sprite.anchor.set(0.5, 0.5);
      if ("bluebell" === this.name) {
        sprite.position.set(0, -10);
      }
      this.container.addChild(sprite);
      game.scene.flowerContainer.addChild(this.container);
      tween = new game.Tween(o);
	  /**
      tween.to({
        rotation : 0.15
      }, this.animSpeed);
      tween.easing(game.Tween.Easing.Quadratic.InOut);
      tween.repeat();
      tween.yoyo();
      tween.start();
	  **/
      this.tweens.push(tween);
      tween = new game.Tween(o.scale);
	  /**
      tween.to({
        y : 0.95
      }, this.animSpeed / 2);
      tween.easing(game.Tween.Easing.Quadratic.InOut);
      tween.repeat();
      tween.yoyo();
      tween.start();
	  **/
      this.tweens.push(tween);
      tween = new game.Tween(sprite);
	  /**
      tween.to({
        rotation : 0.15
      }, this.animSpeed);
      tween.easing(game.Tween.Easing.Quadratic.InOut);
      tween.repeat();
      tween.yoyo();
      tween.start();
	  **/
      this.tweens.push(tween);
      tween = new game.Tween(sprite.scale);
	  /**
      tween.to({
        y : 0.95
      }, this.animSpeed / 2);
      tween.easing(game.Tween.Easing.Quadratic.InOut);
      tween.repeat();
      tween.yoyo();
      tween.start();
	  **/
      this.tweens.push(tween);
      tween = new game.Tween(this.container);
      if (tween.to({
        rotation : 0.05
      }, this.animSpeed), tween.easing(game.Tween.Easing.Quadratic.InOut), tween.repeat(), tween.yoyo(), tween.start(), this.tweens.push(tween), game.debugDraw) {
        var p = new game.Graphics;
        p.beginFill(16711680);
        p.drawCircle(0, 0, this.radius);
        p.position.set(game.system.width / 2 + width, game.system.height / 2 + src);
        /** @type {number} */
        p.alpha = 0.5;
        game.scene.stage.addChild(p);
      }
    },
    /**
     * @return {undefined}
     */
    pause : function() {
      /** @type {number} */
      var i = 0;
      for (;i < this.tweens.length;i++) {
        this.tweens[i].pause();
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      /** @type {number} */
      var i = 0;
      for (;i < this.tweens.length;i++) {
        this.tweens[i].resume();
      }
    }
  });
}), game.module("game.ui").body(function() {
  UiButton = game.Class.extend({
    /**
     * @param {number} id
     * @param {Object} options
     * @param {number} expectedHashCode
     * @param {number} attributes
     * @param {Object} callback
     * @return {undefined}
     */
    init : function(id, options, expectedHashCode, attributes, callback) {
      /** @type {string} */
      var MenuSmall = "MenuSmall";
      if (1 === id && (MenuSmall = "UILarge"), 2 === id && (MenuSmall = "UISmall"), this.container = new game.Container, this.container.position.set(expectedHashCode, attributes), 4 === id) {
        var item = new game.Sprite(options);
        item.anchor.set(0.5, 0.5);
        this.container.addChild(item);
      } else {
        if (3 === id) {
          item = new game.Sprite("ButtonClose.png");
          item.anchor.set(0.5, 0.5);
          this.container.addChild(item);
        } else {
          item = new game.Sprite("Button" + MenuSmall + ".png");
          item.anchor.set(0.5, 0.5);
          this.container.addChild(item);
          options = new game.Sprite("ButtonIcon" + options + ".png");
          options.anchor.set(0.5, 0.5);
          this.container.addChild(options);
          if (1 !== id) {
            options.scale.set(0.7, 0.7);
          }
        }
      }
      this.bgSprite = item;
      /** @type {Object} */
      this.callback = callback;
      /** @type {boolean} */
      this.container.interactive = true;
      this.container.hitArea = new game.HitRectangle(-item.width / 2, -item.height / 2, item.width, item.height);
      /** @type {boolean} */
      this.container.buttonMode = true;
      this.container.click = this.container.tap = this.click.bind(this);
      /** @type {function (): undefined} */
      this.container.mousedown = this.container.touchstart = function() {
        /** @type {number} */
        var labelGap = game.device.mobile ? 0.9 : 1;
        game.scene.addTween(this.scale, {
          x : labelGap,
          y : labelGap
        }, 300, {
          easing : game.Tween.Easing.Elastic.Out
        }).start();
        game.scene.addTween(this, {
          rotation : 0
        }, 300, {
          easing : game.Tween.Easing.Elastic.Out
        }).start();
      };
      /** @type {function (): undefined} */
      this.container.mouseup = this.container.touchend = this.container.mouseupoutside = this.container.touchendoutside = function() {
        /** @type {number} */
        var labelGap = game.device.mobile ? 1 : 1.1;
        game.scene.addTween(this.scale, {
          x : labelGap,
          y : labelGap
        }, 300, {
          easing : game.Tween.Easing.Elastic.Out
        }).start();
      };
      /**
       * @return {undefined}
       */
      this.container.mouseover = function() {
        game.scene.addTween(this.scale, {
          x : 1.1,
          y : 1.1
        }, 200, {
          easing : game.Tween.Easing.Back.Out
        }).start();
        game.scene.addTween(this, {
          rotation : 2 * (Math.random() - 0.5) * 0.1
        }, 300, {
          easing : game.Tween.Easing.Back.Out
        }).start();
      };
      /** @type {function (): undefined} */
      this.container.mouseout = this.container.mouseupoutside = function() {
        game.scene.addTween(this.scale, {
          x : 1,
          y : 1
        }, 200, {
          easing : game.Tween.Easing.Back.Out
        }).start();
        game.scene.addTween(this, {
          rotation : 0
        }, 200, {
          easing : game.Tween.Easing.Back.Out
        }).start();
      };
    },
    /**
     * @return {undefined}
     */
    click : function() {
      this.callback();
      game.audio.playSound("audio/button-press.m4a");
    },
    /**
     * @param {?} group
     * @return {?}
     */
    addTo : function(group) {
      return group.addChild(this.container), this;
    }
  });
  LevelButton = game.Class.extend({
    /**
     * @param {?} t
     * @param {number} width
     * @param {number} src
     * @param {number} frameRate
     * @param {?} callback
     * @param {?} allBindingsAccessor
     * @return {undefined}
     */
    init : function(t, width, src, frameRate, callback, allBindingsAccessor) {
      if (this.sprite = new game.Sprite(t), this.sprite.anchor.set(0.5, 0.5), this.sprite.scale.set(0, 0), this.sprite.position.set(game.system.width / 2 + width, game.system.height / 2 + src), allBindingsAccessor) {
        t = new game.Sprite(t.replace("Select", "Unlock"));
        t.anchor.set(0.5, 0.5);
        this.sprite.addChild(t);
      } else {
        (new UiButton(2, "Play", 0, 70, this.click.bind(this))).addTo(this.sprite);
      }
      /** @type {number} */
      this.delay = frameRate;
      this.callback = callback;
    },
    /**
     * @return {undefined}
     */
    click : function() {
      if (!this.tween) {
        this.callback();
        game.audio.playSound("audio/button-press.m4a");
      }
    },
    /**
     * @return {undefined}
     */
    mousedown : function() {
      if (!this.tween) {
        this.sprite.scale.set(0.9, 0.9);
      }
    },
    /**
     * @return {undefined}
     */
    mouseup : function() {
      if (!this.tween) {
        this.sprite.scale.set(1, 1);
      }
    },
    /**
     * @return {undefined}
     */
    ready : function() {
      /** @type {null} */
      this.tween = null;
    },
    /**
     * @param {?} group
     * @return {?}
     */
    addTo : function(group) {
      return this.tween = game.scene.addTween(this.sprite.scale, {
        x : 1,
        y : 1
      }, 200, {
        delay : this.delay,
        easing : game.Tween.Easing.Back.Out,
        onComplete : this.ready.bind(this)
      }).start(), group.addChild(this.sprite), this;
    }
  });
  HowToPlay = game.Class.extend({
    /**
     * @param {Function} id
     * @return {undefined}
     */
    init : function(id) {
      /** @type {Function} */
      this.callback = id;
      this.container = new game.Container;
      var g = new PIXI.Graphics;
      g.beginFill(0);
      g.drawRect(0, 0, game.system.width, game.system.height);
      /** @type {number} */
      g.alpha = 0;
      game.scene.addTween(g, {
        alpha : 0.6
      }, 200).start();
      this.container.addChild(g);
      var options = new game.BitmapText("How to play", {
        font : "Fredoka"
      });
      /** @type {number} */
      options.position.x = game.system.width / 2 - options.textWidth / 2;
      /** @type {number} */
      options.position.y = 70;
      /** @type {number} */
      options.alpha = 0;
      game.scene.addTween(options, {
        alpha : 1
      }, 200).start();
      var sprite = new game.Sprite("HowToPlay_01.png");
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2 - 310, game.system.height / 2 - 110);
      sprite.scale.set(0, 0);
      game.scene.addTween(sprite.scale, {
        x : 0.95,
        y : 0.95
      }, 200, {
        easing : game.Tween.Easing.Back.Out
      }).start();
      this.container.addChild(sprite);
      sprite = new game.Sprite("HowToPlay_02.png");
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2, game.system.height / 2 - 110);
      sprite.scale.set(0, 0);
      game.scene.addTween(sprite.scale, {
        x : 0.95,
        y : 0.95
      }, 200, {
        delay : 200,
        easing : game.Tween.Easing.Back.Out
      }).start();
      this.container.addChild(sprite);
      sprite = new game.Sprite("HowToPlay_03.png");
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2 + 310, game.system.height / 2 - 110);
      sprite.scale.set(0, 0);
      game.scene.addTween(sprite.scale, {
        x : 0.95,
        y : 0.95
      }, 200, {
        delay : 400,
        easing : game.Tween.Easing.Back.Out
      }).start();
      this.container.addChild(sprite);
      sprite = new game.Sprite("HowToPlay_04.png");
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2 - 155, game.system.height / 2 + 160);
      sprite.scale.set(0, 0);
      game.scene.addTween(sprite.scale, {
        x : 0.95,
        y : 0.95
      }, 200, {
        delay : 600,
        easing : game.Tween.Easing.Back.Out
      }).start();
      this.container.addChild(sprite);
      sprite = new game.Sprite("HowToPlay_05.png");
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(game.system.width / 2 + 155, game.system.height / 2 + 160);
      sprite.scale.set(0, 0);
      game.scene.addTween(sprite.scale, {
        x : 0.95,
        y : 0.95
      }, 200, {
        delay : 800,
        easing : game.Tween.Easing.Back.Out
      }).start();
      this.container.addChild(sprite);
      var me = (new UiButton(3, null, 60, 75, this.callback.bind(this))).addTo(this.container);
      me.container.scale.set(0, 0);
      game.scene.addTween(me.container.scale, {
        x : 1,
        y : 1
      }, 400, {
        easing : game.Tween.Easing.Back.Out,
        delay : 400
      }).start();
    },
    /**
     * @param {?} group
     * @return {?}
     */
    addTo : function(group) {
      return group.addChild(this.container), this;
    }
  });
  Keyboard = game.Class.extend({
    keys : [["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], ["A", "S", "D", "F", "G", "H", "J", "K", "L"], ["Z", "X", "C", "V", "B", "N", "M", "del"]],
    input : "",
    /**
     * @param {number} expectedHashCode
     * @param {number} attributes
     * @param {Object} callback
     * @return {undefined}
     */
    init : function(expectedHashCode, attributes, callback) {
      /** @type {Object} */
      this.callback = callback;
      this.container = new game.Container;
      this.container.position.set(expectedHashCode, attributes);
      /** @type {number} */
      var opt_attributes = 0;
      /** @type {number} */
      var offset = 5;
      /** @type {number} */
      var i = 0;
      for (;i < this.keys.length;i++) {
        /** @type {number} */
        var j = 0;
        for (;j < this.keys[i].length;j++) {
          var end = this.keys[i][j];
          var item = new game.Sprite("keyboard_" + end + ".png");
          item.anchor.set(0.5, 0.5);
          /** @type {boolean} */
          item.interactive = true;
          /** @type {boolean} */
          item.buttonMode = true;
          /** @type {function (): undefined} */
          item.mousedown = item.touchstart = function() {
            this.scale.set(0.9, 0.9);
          };
          /** @type {function (): undefined} */
          item.mouseup = item.touchend = item.mouseupoutside = item.touchendoutside = function() {
            this.scale.set(1, 1);
          };
          item.click = item.tap = this.click.bind(this, end);
          item.position.set(j * (item.width + offset) - (this.keys[i].length * item.width + offset) / 2 + offset, opt_attributes);
          this.container.addChild(item);
        }
        opt_attributes += item.height;
      }
    },
    /**
     * @param {string} e
     * @return {undefined}
     */
    click : function(e) {
      game.audio.playSound("audio/button-press.m4a");
      if ("del" === e) {
        this.input = this.input.substr(0, Math.max(0, this.input.length - 1));
      } else {
        if (3 === this.input.length) {
          this.input = this.input.substr(0, 2);
        }
        this.input += e;
      }
      this.callback();
    },
    /**
     * @param {?} group
     * @return {?}
     */
    addTo : function(group) {
      return group.addChild(this.container), this;
    }
  });
  LeaderBoard = game.Class.extend({
    data : null,
    pages : null,
    currentPage : 1,
    perPage : 6,
    maxResults : 100,
    /**
     * @param {?} id
     * @param {?} allBindingsAccessor
     * @return {undefined}
     */
    init : function(id, allBindingsAccessor) {
      if (this.closeCallback = id, this.container = new game.Container, allBindingsAccessor) {
        var sprite = new PIXI.Graphics;
        sprite.beginFill(0);
        sprite.drawRect(0, 0, game.system.width, game.system.height);
        /** @type {number} */
        sprite.alpha = 0;
        game.scene.addTween(sprite, {
          alpha : 0.6
        }, 200).start();
        this.container.addChild(sprite);
      }
      var t = new game.Sprite("PanelLarge.png");
      t.anchor.set(0.5, 0.5);
      t.position.set(game.system.width / 2, game.system.height / 2);
      this.container.addChild(t);
      var layer = new game.BitmapText("Leaderboard", {
        font : "FredokaTitle"
      });
      layer.position.set(game.system.width / 2 - layer.textWidth / 2, 138);
      this.container.addChild(layer);
      var me = new game.Sprite("HorizontalSmall.png");
      me.position.set(game.system.width / 2 - me.width / 2, 190);
      this.container.addChild(me);
      me = new game.Sprite("HorizontalSmall.png");
      me.position.set(game.system.width / 2 - me.width / 2, 480);
      this.container.addChild(me);
      var c = new game.BitmapText("Your best: " + game.getScoreText(game.bestScore), {
        font : "FredokaText"
      });
      c.position.set(game.system.width / 2 - c.textWidth / 2, 495);
      this.container.addChild(c);
      var d = ((new UiButton(3, null, game.system.width / 2 + 303, 130, this.close.bind(this))).addTo(this.container), new game.Sprite("ScrollTrack.png"));
      d.anchor.set(0.5, 0.5);
      d.position.set(game.system.width / 2 + 260, game.system.height / 2);
      this.track = d;
      this.container.addChild(d);
      var item = new game.Sprite("Scroller.png");
      item.anchor.set(0.5, 0.5);
      item.position.set(d.position.x, d.position.y - d.height / 2 + item.height / 2);
      /** @type {boolean} */
      item.interactive = true;
      /** @type {boolean} */
      item.buttonMode = true;
      item.mousedown = item.touchstart = this.mousedown.bind(this);
      item.mouseup = item.touchend = item.mouseupoutside = item.touchendoutside = this.mouseup.bind(this);
      item.mousemove = item.touchmove = this.mousemove.bind(this);
      this.scroller = item;
      this.container.addChild(item);
      this.rowsContainer = new game.Container;
      this.container.addChild(this.rowsContainer);
      this.statusText = new game.BitmapText("Loading...", {
        font : "FredokaText"
      });
      this.statusText.position.set(game.system.width / 2 - this.statusText.textWidth / 2, game.system.height / 2 - this.statusText.textHeight / 2);
      this.container.addChild(this.statusText);
      this.getScores();
    },
    /**
     * @return {undefined}
     */
    getScores : function() {
      var r20 = {
        perPage : 1E3,
        pageNumber : 1
      };
      game.db.getScores(r20, this.dataLoaded.bind(this));
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    dataLoaded : function(data) {
      if (data.error) {
        this.statusText.setText("Error connecting to database");
        this.statusText.updateTransform();
        this.statusText.position.set(game.system.width / 2 - this.statusText.textWidth / 2, game.system.height / 2 - this.statusText.textHeight / 2);
      } else {
        this.container.removeChild(this.statusText);
        /** @type {Object} */
        this.data = data;
        if (this.data.results.length > this.maxResults) {
          this.data.results.length = this.maxResults;
        }
        /** @type {number} */
        this.pages = Math.ceil(this.data.results.length / this.perPage);
        this.changePage(this.currentPage);
      }
    },
    /**
     * @return {undefined}
     */
    close : function() {
      game.scene.addTween(this.container, {
        alpha : 0
      }, 200, {
        onComplete : this.closeComplete.bind(this)
      }).start();
    },
    /**
     * @return {undefined}
     */
    closeComplete : function() {
      this.container.parent.removeChild(this.container);
      if ("function" == typeof this.closeCallback) {
        this.closeCallback();
      }
    },
    /**
     * @return {undefined}
     */
    mousedown : function() {
      /** @type {boolean} */
      this._mousedown = true;
    },
    /**
     * @return {undefined}
     */
    mouseup : function() {
      /** @type {boolean} */
      this._mousedown = false;
    },
    /**
     * @param {Object} event
     * @return {undefined}
     */
    mousemove : function(event) {
      if (this.data && this._mousedown) {
        var ry = event.global.y.limit(this.track.position.y - this.track.height / 2 + this.scroller.height / 2, this.track.position.y + this.track.height / 2 - this.scroller.height / 2);
        this.scroller.position.y = ry;
        /** @type {number} */
        var variation = ry - (this.track.position.y - this.track.height / 2) - this.scroller.height / 2;
        /** @type {number} */
        var userView = Math.max(1, Math.ceil(variation / ((this.track.height - this.scroller.height) / this.pages)));
        if (this.currentPage !== userView) {
          this.changePage(userView);
        }
      }
    },
    /**
     * @param {(boolean|number)} page
     * @return {undefined}
     */
    changePage : function(page) {
      if (this.currentPage !== page) {
        game.audio.playSound("audio/button-rollover.m4a");
      }
      /** @type {(boolean|number)} */
      this.currentPage = page;
      /** @type {number} */
      var child = this.rowsContainer.children.length - 1;
      for (;child >= 0;child--) {
        this.rowsContainer.removeChild(this.rowsContainer.children[child]);
      }
      /** @type {number} */
      child = 0;
      for (;child < this.perPage;child++) {
        var self = this.data.results[(this.currentPage - 1) * this.perPage + child];
        if (!self) {
          break;
        }
        var container = new game.BitmapText(((this.currentPage - 1) * this.perPage + (child + 1)).toString(), {
          font : "FredokaTitle"
        });
        var e = new game.BitmapText(self.name_str, {
          font : "FredokaTitle"
        });
        var me = new game.BitmapText(game.getScoreText(self.score_int), {
          font : "FredokaTitle"
        });
        /** @type {number} */
        container.position.x = game.system.width / 2 - 200;
        /** @type {number} */
        e.position.x = game.system.width / 2 - 100;
        /** @type {number} */
        me.position.x = game.system.width / 2 + 200 - me.textWidth;
        /** @type {number} */
        container.position.y = e.position.y = me.position.y = 200 + 46 * child;
        this.rowsContainer.addChild(container);
        this.rowsContainer.addChild(e);
        this.rowsContainer.addChild(me);
      }
    },
    /**
     * @param {?} group
     * @return {?}
     */
    addTo : function(group) {
      return this.container.alpha = 0, group.addChild(this.container), game.scene.addTween(this.container, {
        alpha : 1
      }, 200).start(), this;
    }
  });
  /**
   * @param {Object} acceleration
   * @return {undefined}
   */
  game.toggleSound = function(acceleration) {
    if (game.audio.musicMuted) {
      /** @type {boolean} */
      game.audio.soundMuted = game.audio.musicMuted = false;
      game.audio.resumeAll();
      /** @type {number} */
      acceleration.alpha = 1;
    } else {
      game.audio.pauseAll();
      /** @type {boolean} */
      game.audio.soundMuted = game.audio.musicMuted = true;
      /** @type {number} */
      acceleration.alpha = 0.5;
    }
  };
  /**
   * @param {?} dstUri
   * @return {?}
   */
  game.getScoreText = function(dstUri) {
    var headBuffer = dstUri.toString();
    return headBuffer.length > 3 && (headBuffer = headBuffer.substr(0, headBuffer.length - 3) + "," + headBuffer.substr(headBuffer.length - 3)), headBuffer;
  };
});
