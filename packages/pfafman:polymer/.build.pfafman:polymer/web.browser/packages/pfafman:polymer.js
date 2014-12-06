(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/pfafman:polymer/webcomponents.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    // 1
 * @license                                                                                                            // 2
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.                                                // 3
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt                // 4
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt                                    // 5
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt                          // 6
 * Code distributed by Google as part of the polymer project is also                                                   // 7
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt                              // 8
 */                                                                                                                    // 9
// @version 0.5.1                                                                                                      // 10
window.WebComponents = window.WebComponents || {};                                                                     // 11
                                                                                                                       // 12
(function(scope) {                                                                                                     // 13
  var flags = scope.flags || {};                                                                                       // 14
  var file = "webcomponents.js";                                                                                       // 15
  var script = document.querySelector('script[src*="' + file + '"]');                                                  // 16
  var flags = {};                                                                                                      // 17
  if (!flags.noOpts) {                                                                                                 // 18
    location.search.slice(1).split("&").forEach(function(o) {                                                          // 19
      o = o.split("=");                                                                                                // 20
      o[0] && (flags[o[0]] = o[1] || true);                                                                            // 21
    });                                                                                                                // 22
    if (script) {                                                                                                      // 23
      for (var i = 0, a; a = script.attributes[i]; i++) {                                                              // 24
        if (a.name !== "src") {                                                                                        // 25
          flags[a.name] = a.value || true;                                                                             // 26
        }                                                                                                              // 27
      }                                                                                                                // 28
    }                                                                                                                  // 29
    if (flags.log) {                                                                                                   // 30
      var parts = flags.log.split(",");                                                                                // 31
      flags.log = {};                                                                                                  // 32
      parts.forEach(function(f) {                                                                                      // 33
        flags.log[f] = true;                                                                                           // 34
      });                                                                                                              // 35
    } else {                                                                                                           // 36
      flags.log = {};                                                                                                  // 37
    }                                                                                                                  // 38
  }                                                                                                                    // 39
  flags.shadow = flags.shadow || flags.shadowdom || flags.polyfill;                                                    // 40
  if (flags.shadow === "native") {                                                                                     // 41
    flags.shadow = false;                                                                                              // 42
  } else {                                                                                                             // 43
    flags.shadow = flags.shadow || !HTMLElement.prototype.createShadowRoot;                                            // 44
  }                                                                                                                    // 45
  if (flags.register) {                                                                                                // 46
    window.CustomElements = window.CustomElements || {                                                                 // 47
      flags: {}                                                                                                        // 48
    };                                                                                                                 // 49
    window.CustomElements.flags.register = flags.register;                                                             // 50
  }                                                                                                                    // 51
  scope.flags = flags;                                                                                                 // 52
})(WebComponents);                                                                                                     // 53
                                                                                                                       // 54
if (WebComponents.flags.shadow) {                                                                                      // 55
  if (typeof WeakMap === "undefined") {                                                                                // 56
    (function() {                                                                                                      // 57
      var defineProperty = Object.defineProperty;                                                                      // 58
      var counter = Date.now() % 1e9;                                                                                  // 59
      var WeakMap = function() {                                                                                       // 60
        this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");                                         // 61
      };                                                                                                               // 62
      WeakMap.prototype = {                                                                                            // 63
        set: function(key, value) {                                                                                    // 64
          var entry = key[this.name];                                                                                  // 65
          if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {                       // 66
            value: [ key, value ],                                                                                     // 67
            writable: true                                                                                             // 68
          });                                                                                                          // 69
          return this;                                                                                                 // 70
        },                                                                                                             // 71
        get: function(key) {                                                                                           // 72
          var entry;                                                                                                   // 73
          return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;                                  // 74
        },                                                                                                             // 75
        "delete": function(key) {                                                                                      // 76
          var entry = key[this.name];                                                                                  // 77
          if (!entry || entry[0] !== key) return false;                                                                // 78
          entry[0] = entry[1] = undefined;                                                                             // 79
          return true;                                                                                                 // 80
        },                                                                                                             // 81
        has: function(key) {                                                                                           // 82
          var entry = key[this.name];                                                                                  // 83
          if (!entry) return false;                                                                                    // 84
          return entry[0] === key;                                                                                     // 85
        }                                                                                                              // 86
      };                                                                                                               // 87
      window.WeakMap = WeakMap;                                                                                        // 88
    })();                                                                                                              // 89
  }                                                                                                                    // 90
  window.ShadowDOMPolyfill = {};                                                                                       // 91
  (function(scope) {                                                                                                   // 92
    "use strict";                                                                                                      // 93
    var constructorTable = new WeakMap();                                                                              // 94
    var nativePrototypeTable = new WeakMap();                                                                          // 95
    var wrappers = Object.create(null);                                                                                // 96
    function detectEval() {                                                                                            // 97
      if (typeof chrome !== "undefined" && chrome.app && chrome.app.runtime) {                                         // 98
        return false;                                                                                                  // 99
      }                                                                                                                // 100
      if (navigator.getDeviceStorage) {                                                                                // 101
        return false;                                                                                                  // 102
      }                                                                                                                // 103
      try {                                                                                                            // 104
        var f = new Function("return true;");                                                                          // 105
        return f();                                                                                                    // 106
      } catch (ex) {                                                                                                   // 107
        return false;                                                                                                  // 108
      }                                                                                                                // 109
    }                                                                                                                  // 110
    var hasEval = detectEval();                                                                                        // 111
    function assert(b) {                                                                                               // 112
      if (!b) throw new Error("Assertion failed");                                                                     // 113
    }                                                                                                                  // 114
    var defineProperty = Object.defineProperty;                                                                        // 115
    var getOwnPropertyNames = Object.getOwnPropertyNames;                                                              // 116
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;                                                    // 117
    function mixin(to, from) {                                                                                         // 118
      var names = getOwnPropertyNames(from);                                                                           // 119
      for (var i = 0; i < names.length; i++) {                                                                         // 120
        var name = names[i];                                                                                           // 121
        defineProperty(to, name, getOwnPropertyDescriptor(from, name));                                                // 122
      }                                                                                                                // 123
      return to;                                                                                                       // 124
    }                                                                                                                  // 125
    function mixinStatics(to, from) {                                                                                  // 126
      var names = getOwnPropertyNames(from);                                                                           // 127
      for (var i = 0; i < names.length; i++) {                                                                         // 128
        var name = names[i];                                                                                           // 129
        switch (name) {                                                                                                // 130
         case "arguments":                                                                                             // 131
         case "caller":                                                                                                // 132
         case "length":                                                                                                // 133
         case "name":                                                                                                  // 134
         case "prototype":                                                                                             // 135
         case "toString":                                                                                              // 136
          continue;                                                                                                    // 137
        }                                                                                                              // 138
        defineProperty(to, name, getOwnPropertyDescriptor(from, name));                                                // 139
      }                                                                                                                // 140
      return to;                                                                                                       // 141
    }                                                                                                                  // 142
    function oneOf(object, propertyNames) {                                                                            // 143
      for (var i = 0; i < propertyNames.length; i++) {                                                                 // 144
        if (propertyNames[i] in object) return propertyNames[i];                                                       // 145
      }                                                                                                                // 146
    }                                                                                                                  // 147
    var nonEnumerableDataDescriptor = {                                                                                // 148
      value: undefined,                                                                                                // 149
      configurable: true,                                                                                              // 150
      enumerable: false,                                                                                               // 151
      writable: true                                                                                                   // 152
    };                                                                                                                 // 153
    function defineNonEnumerableDataProperty(object, name, value) {                                                    // 154
      nonEnumerableDataDescriptor.value = value;                                                                       // 155
      defineProperty(object, name, nonEnumerableDataDescriptor);                                                       // 156
    }                                                                                                                  // 157
    getOwnPropertyNames(window);                                                                                       // 158
    function getWrapperConstructor(node) {                                                                             // 159
      var nativePrototype = node.__proto__ || Object.getPrototypeOf(node);                                             // 160
      var wrapperConstructor = constructorTable.get(nativePrototype);                                                  // 161
      if (wrapperConstructor) return wrapperConstructor;                                                               // 162
      var parentWrapperConstructor = getWrapperConstructor(nativePrototype);                                           // 163
      var GeneratedWrapper = createWrapperConstructor(parentWrapperConstructor);                                       // 164
      registerInternal(nativePrototype, GeneratedWrapper, node);                                                       // 165
      return GeneratedWrapper;                                                                                         // 166
    }                                                                                                                  // 167
    function addForwardingProperties(nativePrototype, wrapperPrototype) {                                              // 168
      installProperty(nativePrototype, wrapperPrototype, true);                                                        // 169
    }                                                                                                                  // 170
    function registerInstanceProperties(wrapperPrototype, instanceObject) {                                            // 171
      installProperty(instanceObject, wrapperPrototype, false);                                                        // 172
    }                                                                                                                  // 173
    var isFirefox = /Firefox/.test(navigator.userAgent);                                                               // 174
    var dummyDescriptor = {                                                                                            // 175
      get: function() {},                                                                                              // 176
      set: function(v) {},                                                                                             // 177
      configurable: true,                                                                                              // 178
      enumerable: true                                                                                                 // 179
    };                                                                                                                 // 180
    function isEventHandlerName(name) {                                                                                // 181
      return /^on[a-z]+$/.test(name);                                                                                  // 182
    }                                                                                                                  // 183
    function isIdentifierName(name) {                                                                                  // 184
      return /^\w[a-zA-Z_0-9]*$/.test(name);                                                                           // 185
    }                                                                                                                  // 186
    function getGetter(name) {                                                                                         // 187
      return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name) : function() { // 188
        return this.__impl4cf1e782hg__[name];                                                                          // 189
      };                                                                                                               // 190
    }                                                                                                                  // 191
    function getSetter(name) {                                                                                         // 192
      return hasEval && isIdentifierName(name) ? new Function("v", "this.__impl4cf1e782hg__." + name + " = v") : function(v) {
        this.__impl4cf1e782hg__[name] = v;                                                                             // 194
      };                                                                                                               // 195
    }                                                                                                                  // 196
    function getMethod(name) {                                                                                         // 197
      return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name + ".apply(this.__impl4cf1e782hg__, arguments)") : function() {
        return this.__impl4cf1e782hg__[name].apply(this.__impl4cf1e782hg__, arguments);                                // 199
      };                                                                                                               // 200
    }                                                                                                                  // 201
    function getDescriptor(source, name) {                                                                             // 202
      try {                                                                                                            // 203
        return Object.getOwnPropertyDescriptor(source, name);                                                          // 204
      } catch (ex) {                                                                                                   // 205
        return dummyDescriptor;                                                                                        // 206
      }                                                                                                                // 207
    }                                                                                                                  // 208
    var isBrokenSafari = function() {                                                                                  // 209
      var descr = Object.getOwnPropertyDescriptor(Node.prototype, "nodeType");                                         // 210
      return descr && !descr.get && !descr.set;                                                                        // 211
    }();                                                                                                               // 212
    function installProperty(source, target, allowMethod, opt_blacklist) {                                             // 213
      var names = getOwnPropertyNames(source);                                                                         // 214
      for (var i = 0; i < names.length; i++) {                                                                         // 215
        var name = names[i];                                                                                           // 216
        if (name === "polymerBlackList_") continue;                                                                    // 217
        if (name in target) continue;                                                                                  // 218
        if (source.polymerBlackList_ && source.polymerBlackList_[name]) continue;                                      // 219
        if (isFirefox) {                                                                                               // 220
          source.__lookupGetter__(name);                                                                               // 221
        }                                                                                                              // 222
        var descriptor = getDescriptor(source, name);                                                                  // 223
        var getter, setter;                                                                                            // 224
        if (allowMethod && typeof descriptor.value === "function") {                                                   // 225
          target[name] = getMethod(name);                                                                              // 226
          continue;                                                                                                    // 227
        }                                                                                                              // 228
        var isEvent = isEventHandlerName(name);                                                                        // 229
        if (isEvent) getter = scope.getEventHandlerGetter(name); else getter = getGetter(name);                        // 230
        if (descriptor.writable || descriptor.set || isBrokenSafari) {                                                 // 231
          if (isEvent) setter = scope.getEventHandlerSetter(name); else setter = getSetter(name);                      // 232
        }                                                                                                              // 233
        defineProperty(target, name, {                                                                                 // 234
          get: getter,                                                                                                 // 235
          set: setter,                                                                                                 // 236
          configurable: descriptor.configurable,                                                                       // 237
          enumerable: descriptor.enumerable                                                                            // 238
        });                                                                                                            // 239
      }                                                                                                                // 240
    }                                                                                                                  // 241
    function register(nativeConstructor, wrapperConstructor, opt_instance) {                                           // 242
      var nativePrototype = nativeConstructor.prototype;                                                               // 243
      registerInternal(nativePrototype, wrapperConstructor, opt_instance);                                             // 244
      mixinStatics(wrapperConstructor, nativeConstructor);                                                             // 245
    }                                                                                                                  // 246
    function registerInternal(nativePrototype, wrapperConstructor, opt_instance) {                                     // 247
      var wrapperPrototype = wrapperConstructor.prototype;                                                             // 248
      assert(constructorTable.get(nativePrototype) === undefined);                                                     // 249
      constructorTable.set(nativePrototype, wrapperConstructor);                                                       // 250
      nativePrototypeTable.set(wrapperPrototype, nativePrototype);                                                     // 251
      addForwardingProperties(nativePrototype, wrapperPrototype);                                                      // 252
      if (opt_instance) registerInstanceProperties(wrapperPrototype, opt_instance);                                    // 253
      defineNonEnumerableDataProperty(wrapperPrototype, "constructor", wrapperConstructor);                            // 254
      wrapperConstructor.prototype = wrapperPrototype;                                                                 // 255
    }                                                                                                                  // 256
    function isWrapperFor(wrapperConstructor, nativeConstructor) {                                                     // 257
      return constructorTable.get(nativeConstructor.prototype) === wrapperConstructor;                                 // 258
    }                                                                                                                  // 259
    function registerObject(object) {                                                                                  // 260
      var nativePrototype = Object.getPrototypeOf(object);                                                             // 261
      var superWrapperConstructor = getWrapperConstructor(nativePrototype);                                            // 262
      var GeneratedWrapper = createWrapperConstructor(superWrapperConstructor);                                        // 263
      registerInternal(nativePrototype, GeneratedWrapper, object);                                                     // 264
      return GeneratedWrapper;                                                                                         // 265
    }                                                                                                                  // 266
    function createWrapperConstructor(superWrapperConstructor) {                                                       // 267
      function GeneratedWrapper(node) {                                                                                // 268
        superWrapperConstructor.call(this, node);                                                                      // 269
      }                                                                                                                // 270
      var p = Object.create(superWrapperConstructor.prototype);                                                        // 271
      p.constructor = GeneratedWrapper;                                                                                // 272
      GeneratedWrapper.prototype = p;                                                                                  // 273
      return GeneratedWrapper;                                                                                         // 274
    }                                                                                                                  // 275
    function isWrapper(object) {                                                                                       // 276
      return object && object.__impl4cf1e782hg__;                                                                      // 277
    }                                                                                                                  // 278
    function isNative(object) {                                                                                        // 279
      return !isWrapper(object);                                                                                       // 280
    }                                                                                                                  // 281
    function wrap(impl) {                                                                                              // 282
      if (impl === null) return null;                                                                                  // 283
      assert(isNative(impl));                                                                                          // 284
      return impl.__wrapper8e3dd93a60__ || (impl.__wrapper8e3dd93a60__ = new (getWrapperConstructor(impl))(impl));     // 285
    }                                                                                                                  // 286
    function unwrap(wrapper) {                                                                                         // 287
      if (wrapper === null) return null;                                                                               // 288
      assert(isWrapper(wrapper));                                                                                      // 289
      return wrapper.__impl4cf1e782hg__;                                                                               // 290
    }                                                                                                                  // 291
    function unsafeUnwrap(wrapper) {                                                                                   // 292
      return wrapper.__impl4cf1e782hg__;                                                                               // 293
    }                                                                                                                  // 294
    function setWrapper(impl, wrapper) {                                                                               // 295
      wrapper.__impl4cf1e782hg__ = impl;                                                                               // 296
      impl.__wrapper8e3dd93a60__ = wrapper;                                                                            // 297
    }                                                                                                                  // 298
    function unwrapIfNeeded(object) {                                                                                  // 299
      return object && isWrapper(object) ? unwrap(object) : object;                                                    // 300
    }                                                                                                                  // 301
    function wrapIfNeeded(object) {                                                                                    // 302
      return object && !isWrapper(object) ? wrap(object) : object;                                                     // 303
    }                                                                                                                  // 304
    function rewrap(node, wrapper) {                                                                                   // 305
      if (wrapper === null) return;                                                                                    // 306
      assert(isNative(node));                                                                                          // 307
      assert(wrapper === undefined || isWrapper(wrapper));                                                             // 308
      node.__wrapper8e3dd93a60__ = wrapper;                                                                            // 309
    }                                                                                                                  // 310
    var getterDescriptor = {                                                                                           // 311
      get: undefined,                                                                                                  // 312
      configurable: true,                                                                                              // 313
      enumerable: true                                                                                                 // 314
    };                                                                                                                 // 315
    function defineGetter(constructor, name, getter) {                                                                 // 316
      getterDescriptor.get = getter;                                                                                   // 317
      defineProperty(constructor.prototype, name, getterDescriptor);                                                   // 318
    }                                                                                                                  // 319
    function defineWrapGetter(constructor, name) {                                                                     // 320
      defineGetter(constructor, name, function() {                                                                     // 321
        return wrap(this.__impl4cf1e782hg__[name]);                                                                    // 322
      });                                                                                                              // 323
    }                                                                                                                  // 324
    function forwardMethodsToWrapper(constructors, names) {                                                            // 325
      constructors.forEach(function(constructor) {                                                                     // 326
        names.forEach(function(name) {                                                                                 // 327
          constructor.prototype[name] = function() {                                                                   // 328
            var w = wrapIfNeeded(this);                                                                                // 329
            return w[name].apply(w, arguments);                                                                        // 330
          };                                                                                                           // 331
        });                                                                                                            // 332
      });                                                                                                              // 333
    }                                                                                                                  // 334
    scope.assert = assert;                                                                                             // 335
    scope.constructorTable = constructorTable;                                                                         // 336
    scope.defineGetter = defineGetter;                                                                                 // 337
    scope.defineWrapGetter = defineWrapGetter;                                                                         // 338
    scope.forwardMethodsToWrapper = forwardMethodsToWrapper;                                                           // 339
    scope.isWrapper = isWrapper;                                                                                       // 340
    scope.isWrapperFor = isWrapperFor;                                                                                 // 341
    scope.mixin = mixin;                                                                                               // 342
    scope.nativePrototypeTable = nativePrototypeTable;                                                                 // 343
    scope.oneOf = oneOf;                                                                                               // 344
    scope.registerObject = registerObject;                                                                             // 345
    scope.registerWrapper = register;                                                                                  // 346
    scope.rewrap = rewrap;                                                                                             // 347
    scope.setWrapper = setWrapper;                                                                                     // 348
    scope.unsafeUnwrap = unsafeUnwrap;                                                                                 // 349
    scope.unwrap = unwrap;                                                                                             // 350
    scope.unwrapIfNeeded = unwrapIfNeeded;                                                                             // 351
    scope.wrap = wrap;                                                                                                 // 352
    scope.wrapIfNeeded = wrapIfNeeded;                                                                                 // 353
    scope.wrappers = wrappers;                                                                                         // 354
  })(window.ShadowDOMPolyfill);                                                                                        // 355
  (function(scope) {                                                                                                   // 356
    "use strict";                                                                                                      // 357
    function newSplice(index, removed, addedCount) {                                                                   // 358
      return {                                                                                                         // 359
        index: index,                                                                                                  // 360
        removed: removed,                                                                                              // 361
        addedCount: addedCount                                                                                         // 362
      };                                                                                                               // 363
    }                                                                                                                  // 364
    var EDIT_LEAVE = 0;                                                                                                // 365
    var EDIT_UPDATE = 1;                                                                                               // 366
    var EDIT_ADD = 2;                                                                                                  // 367
    var EDIT_DELETE = 3;                                                                                               // 368
    function ArraySplice() {}                                                                                          // 369
    ArraySplice.prototype = {                                                                                          // 370
      calcEditDistances: function(current, currentStart, currentEnd, old, oldStart, oldEnd) {                          // 371
        var rowCount = oldEnd - oldStart + 1;                                                                          // 372
        var columnCount = currentEnd - currentStart + 1;                                                               // 373
        var distances = new Array(rowCount);                                                                           // 374
        for (var i = 0; i < rowCount; i++) {                                                                           // 375
          distances[i] = new Array(columnCount);                                                                       // 376
          distances[i][0] = i;                                                                                         // 377
        }                                                                                                              // 378
        for (var j = 0; j < columnCount; j++) distances[0][j] = j;                                                     // 379
        for (var i = 1; i < rowCount; i++) {                                                                           // 380
          for (var j = 1; j < columnCount; j++) {                                                                      // 381
            if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1])) distances[i][j] = distances[i - 1][j - 1]; else {
              var north = distances[i - 1][j] + 1;                                                                     // 383
              var west = distances[i][j - 1] + 1;                                                                      // 384
              distances[i][j] = north < west ? north : west;                                                           // 385
            }                                                                                                          // 386
          }                                                                                                            // 387
        }                                                                                                              // 388
        return distances;                                                                                              // 389
      },                                                                                                               // 390
      spliceOperationsFromEditDistances: function(distances) {                                                         // 391
        var i = distances.length - 1;                                                                                  // 392
        var j = distances[0].length - 1;                                                                               // 393
        var current = distances[i][j];                                                                                 // 394
        var edits = [];                                                                                                // 395
        while (i > 0 || j > 0) {                                                                                       // 396
          if (i == 0) {                                                                                                // 397
            edits.push(EDIT_ADD);                                                                                      // 398
            j--;                                                                                                       // 399
            continue;                                                                                                  // 400
          }                                                                                                            // 401
          if (j == 0) {                                                                                                // 402
            edits.push(EDIT_DELETE);                                                                                   // 403
            i--;                                                                                                       // 404
            continue;                                                                                                  // 405
          }                                                                                                            // 406
          var northWest = distances[i - 1][j - 1];                                                                     // 407
          var west = distances[i - 1][j];                                                                              // 408
          var north = distances[i][j - 1];                                                                             // 409
          var min;                                                                                                     // 410
          if (west < north) min = west < northWest ? west : northWest; else min = north < northWest ? north : northWest;
          if (min == northWest) {                                                                                      // 412
            if (northWest == current) {                                                                                // 413
              edits.push(EDIT_LEAVE);                                                                                  // 414
            } else {                                                                                                   // 415
              edits.push(EDIT_UPDATE);                                                                                 // 416
              current = northWest;                                                                                     // 417
            }                                                                                                          // 418
            i--;                                                                                                       // 419
            j--;                                                                                                       // 420
          } else if (min == west) {                                                                                    // 421
            edits.push(EDIT_DELETE);                                                                                   // 422
            i--;                                                                                                       // 423
            current = west;                                                                                            // 424
          } else {                                                                                                     // 425
            edits.push(EDIT_ADD);                                                                                      // 426
            j--;                                                                                                       // 427
            current = north;                                                                                           // 428
          }                                                                                                            // 429
        }                                                                                                              // 430
        edits.reverse();                                                                                               // 431
        return edits;                                                                                                  // 432
      },                                                                                                               // 433
      calcSplices: function(current, currentStart, currentEnd, old, oldStart, oldEnd) {                                // 434
        var prefixCount = 0;                                                                                           // 435
        var suffixCount = 0;                                                                                           // 436
        var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);                                        // 437
        if (currentStart == 0 && oldStart == 0) prefixCount = this.sharedPrefix(current, old, minLength);              // 438
        if (currentEnd == current.length && oldEnd == old.length) suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
        currentStart += prefixCount;                                                                                   // 440
        oldStart += prefixCount;                                                                                       // 441
        currentEnd -= suffixCount;                                                                                     // 442
        oldEnd -= suffixCount;                                                                                         // 443
        if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];                                       // 444
        if (currentStart == currentEnd) {                                                                              // 445
          var splice = newSplice(currentStart, [], 0);                                                                 // 446
          while (oldStart < oldEnd) splice.removed.push(old[oldStart++]);                                              // 447
          return [ splice ];                                                                                           // 448
        } else if (oldStart == oldEnd) return [ newSplice(currentStart, [], currentEnd - currentStart) ];              // 449
        var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
        var splice = undefined;                                                                                        // 451
        var splices = [];                                                                                              // 452
        var index = currentStart;                                                                                      // 453
        var oldIndex = oldStart;                                                                                       // 454
        for (var i = 0; i < ops.length; i++) {                                                                         // 455
          switch (ops[i]) {                                                                                            // 456
           case EDIT_LEAVE:                                                                                            // 457
            if (splice) {                                                                                              // 458
              splices.push(splice);                                                                                    // 459
              splice = undefined;                                                                                      // 460
            }                                                                                                          // 461
            index++;                                                                                                   // 462
            oldIndex++;                                                                                                // 463
            break;                                                                                                     // 464
                                                                                                                       // 465
           case EDIT_UPDATE:                                                                                           // 466
            if (!splice) splice = newSplice(index, [], 0);                                                             // 467
            splice.addedCount++;                                                                                       // 468
            index++;                                                                                                   // 469
            splice.removed.push(old[oldIndex]);                                                                        // 470
            oldIndex++;                                                                                                // 471
            break;                                                                                                     // 472
                                                                                                                       // 473
           case EDIT_ADD:                                                                                              // 474
            if (!splice) splice = newSplice(index, [], 0);                                                             // 475
            splice.addedCount++;                                                                                       // 476
            index++;                                                                                                   // 477
            break;                                                                                                     // 478
                                                                                                                       // 479
           case EDIT_DELETE:                                                                                           // 480
            if (!splice) splice = newSplice(index, [], 0);                                                             // 481
            splice.removed.push(old[oldIndex]);                                                                        // 482
            oldIndex++;                                                                                                // 483
            break;                                                                                                     // 484
          }                                                                                                            // 485
        }                                                                                                              // 486
        if (splice) {                                                                                                  // 487
          splices.push(splice);                                                                                        // 488
        }                                                                                                              // 489
        return splices;                                                                                                // 490
      },                                                                                                               // 491
      sharedPrefix: function(current, old, searchLength) {                                                             // 492
        for (var i = 0; i < searchLength; i++) if (!this.equals(current[i], old[i])) return i;                         // 493
        return searchLength;                                                                                           // 494
      },                                                                                                               // 495
      sharedSuffix: function(current, old, searchLength) {                                                             // 496
        var index1 = current.length;                                                                                   // 497
        var index2 = old.length;                                                                                       // 498
        var count = 0;                                                                                                 // 499
        while (count < searchLength && this.equals(current[--index1], old[--index2])) count++;                         // 500
        return count;                                                                                                  // 501
      },                                                                                                               // 502
      calculateSplices: function(current, previous) {                                                                  // 503
        return this.calcSplices(current, 0, current.length, previous, 0, previous.length);                             // 504
      },                                                                                                               // 505
      equals: function(currentValue, previousValue) {                                                                  // 506
        return currentValue === previousValue;                                                                         // 507
      }                                                                                                                // 508
    };                                                                                                                 // 509
    scope.ArraySplice = ArraySplice;                                                                                   // 510
  })(window.ShadowDOMPolyfill);                                                                                        // 511
  (function(context) {                                                                                                 // 512
    "use strict";                                                                                                      // 513
    var OriginalMutationObserver = window.MutationObserver;                                                            // 514
    var callbacks = [];                                                                                                // 515
    var pending = false;                                                                                               // 516
    var timerFunc;                                                                                                     // 517
    function handle() {                                                                                                // 518
      pending = false;                                                                                                 // 519
      var copies = callbacks.slice(0);                                                                                 // 520
      callbacks = [];                                                                                                  // 521
      for (var i = 0; i < copies.length; i++) {                                                                        // 522
        (0, copies[i])();                                                                                              // 523
      }                                                                                                                // 524
    }                                                                                                                  // 525
    if (OriginalMutationObserver) {                                                                                    // 526
      var counter = 1;                                                                                                 // 527
      var observer = new OriginalMutationObserver(handle);                                                             // 528
      var textNode = document.createTextNode(counter);                                                                 // 529
      observer.observe(textNode, {                                                                                     // 530
        characterData: true                                                                                            // 531
      });                                                                                                              // 532
      timerFunc = function() {                                                                                         // 533
        counter = (counter + 1) % 2;                                                                                   // 534
        textNode.data = counter;                                                                                       // 535
      };                                                                                                               // 536
    } else {                                                                                                           // 537
      timerFunc = window.setTimeout;                                                                                   // 538
    }                                                                                                                  // 539
    function setEndOfMicrotask(func) {                                                                                 // 540
      callbacks.push(func);                                                                                            // 541
      if (pending) return;                                                                                             // 542
      pending = true;                                                                                                  // 543
      timerFunc(handle, 0);                                                                                            // 544
    }                                                                                                                  // 545
    context.setEndOfMicrotask = setEndOfMicrotask;                                                                     // 546
  })(window.ShadowDOMPolyfill);                                                                                        // 547
  (function(scope) {                                                                                                   // 548
    "use strict";                                                                                                      // 549
    var setEndOfMicrotask = scope.setEndOfMicrotask;                                                                   // 550
    var wrapIfNeeded = scope.wrapIfNeeded;                                                                             // 551
    var wrappers = scope.wrappers;                                                                                     // 552
    var registrationsTable = new WeakMap();                                                                            // 553
    var globalMutationObservers = [];                                                                                  // 554
    var isScheduled = false;                                                                                           // 555
    function scheduleCallback(observer) {                                                                              // 556
      if (observer.scheduled_) return;                                                                                 // 557
      observer.scheduled_ = true;                                                                                      // 558
      globalMutationObservers.push(observer);                                                                          // 559
      if (isScheduled) return;                                                                                         // 560
      setEndOfMicrotask(notifyObservers);                                                                              // 561
      isScheduled = true;                                                                                              // 562
    }                                                                                                                  // 563
    function notifyObservers() {                                                                                       // 564
      isScheduled = false;                                                                                             // 565
      while (globalMutationObservers.length) {                                                                         // 566
        var notifyList = globalMutationObservers;                                                                      // 567
        globalMutationObservers = [];                                                                                  // 568
        notifyList.sort(function(x, y) {                                                                               // 569
          return x.uid_ - y.uid_;                                                                                      // 570
        });                                                                                                            // 571
        for (var i = 0; i < notifyList.length; i++) {                                                                  // 572
          var mo = notifyList[i];                                                                                      // 573
          mo.scheduled_ = false;                                                                                       // 574
          var queue = mo.takeRecords();                                                                                // 575
          removeTransientObserversFor(mo);                                                                             // 576
          if (queue.length) {                                                                                          // 577
            mo.callback_(queue, mo);                                                                                   // 578
          }                                                                                                            // 579
        }                                                                                                              // 580
      }                                                                                                                // 581
    }                                                                                                                  // 582
    function MutationRecord(type, target) {                                                                            // 583
      this.type = type;                                                                                                // 584
      this.target = target;                                                                                            // 585
      this.addedNodes = new wrappers.NodeList();                                                                       // 586
      this.removedNodes = new wrappers.NodeList();                                                                     // 587
      this.previousSibling = null;                                                                                     // 588
      this.nextSibling = null;                                                                                         // 589
      this.attributeName = null;                                                                                       // 590
      this.attributeNamespace = null;                                                                                  // 591
      this.oldValue = null;                                                                                            // 592
    }                                                                                                                  // 593
    function registerTransientObservers(ancestor, node) {                                                              // 594
      for (;ancestor; ancestor = ancestor.parentNode) {                                                                // 595
        var registrations = registrationsTable.get(ancestor);                                                          // 596
        if (!registrations) continue;                                                                                  // 597
        for (var i = 0; i < registrations.length; i++) {                                                               // 598
          var registration = registrations[i];                                                                         // 599
          if (registration.options.subtree) registration.addTransientObserver(node);                                   // 600
        }                                                                                                              // 601
      }                                                                                                                // 602
    }                                                                                                                  // 603
    function removeTransientObserversFor(observer) {                                                                   // 604
      for (var i = 0; i < observer.nodes_.length; i++) {                                                               // 605
        var node = observer.nodes_[i];                                                                                 // 606
        var registrations = registrationsTable.get(node);                                                              // 607
        if (!registrations) return;                                                                                    // 608
        for (var j = 0; j < registrations.length; j++) {                                                               // 609
          var registration = registrations[j];                                                                         // 610
          if (registration.observer === observer) registration.removeTransientObservers();                             // 611
        }                                                                                                              // 612
      }                                                                                                                // 613
    }                                                                                                                  // 614
    function enqueueMutation(target, type, data) {                                                                     // 615
      var interestedObservers = Object.create(null);                                                                   // 616
      var associatedStrings = Object.create(null);                                                                     // 617
      for (var node = target; node; node = node.parentNode) {                                                          // 618
        var registrations = registrationsTable.get(node);                                                              // 619
        if (!registrations) continue;                                                                                  // 620
        for (var j = 0; j < registrations.length; j++) {                                                               // 621
          var registration = registrations[j];                                                                         // 622
          var options = registration.options;                                                                          // 623
          if (node !== target && !options.subtree) continue;                                                           // 624
          if (type === "attributes" && !options.attributes) continue;                                                  // 625
          if (type === "attributes" && options.attributeFilter && (data.namespace !== null || options.attributeFilter.indexOf(data.name) === -1)) {
            continue;                                                                                                  // 627
          }                                                                                                            // 628
          if (type === "characterData" && !options.characterData) continue;                                            // 629
          if (type === "childList" && !options.childList) continue;                                                    // 630
          var observer = registration.observer;                                                                        // 631
          interestedObservers[observer.uid_] = observer;                                                               // 632
          if (type === "attributes" && options.attributeOldValue || type === "characterData" && options.characterDataOldValue) {
            associatedStrings[observer.uid_] = data.oldValue;                                                          // 634
          }                                                                                                            // 635
        }                                                                                                              // 636
      }                                                                                                                // 637
      for (var uid in interestedObservers) {                                                                           // 638
        var observer = interestedObservers[uid];                                                                       // 639
        var record = new MutationRecord(type, target);                                                                 // 640
        if ("name" in data && "namespace" in data) {                                                                   // 641
          record.attributeName = data.name;                                                                            // 642
          record.attributeNamespace = data.namespace;                                                                  // 643
        }                                                                                                              // 644
        if (data.addedNodes) record.addedNodes = data.addedNodes;                                                      // 645
        if (data.removedNodes) record.removedNodes = data.removedNodes;                                                // 646
        if (data.previousSibling) record.previousSibling = data.previousSibling;                                       // 647
        if (data.nextSibling) record.nextSibling = data.nextSibling;                                                   // 648
        if (associatedStrings[uid] !== undefined) record.oldValue = associatedStrings[uid];                            // 649
        scheduleCallback(observer);                                                                                    // 650
        observer.records_.push(record);                                                                                // 651
      }                                                                                                                // 652
    }                                                                                                                  // 653
    var slice = Array.prototype.slice;                                                                                 // 654
    function MutationObserverOptions(options) {                                                                        // 655
      this.childList = !!options.childList;                                                                            // 656
      this.subtree = !!options.subtree;                                                                                // 657
      if (!("attributes" in options) && ("attributeOldValue" in options || "attributeFilter" in options)) {            // 658
        this.attributes = true;                                                                                        // 659
      } else {                                                                                                         // 660
        this.attributes = !!options.attributes;                                                                        // 661
      }                                                                                                                // 662
      if ("characterDataOldValue" in options && !("characterData" in options)) this.characterData = true; else this.characterData = !!options.characterData;
      if (!this.attributes && (options.attributeOldValue || "attributeFilter" in options) || !this.characterData && options.characterDataOldValue) {
        throw new TypeError();                                                                                         // 665
      }                                                                                                                // 666
      this.characterData = !!options.characterData;                                                                    // 667
      this.attributeOldValue = !!options.attributeOldValue;                                                            // 668
      this.characterDataOldValue = !!options.characterDataOldValue;                                                    // 669
      if ("attributeFilter" in options) {                                                                              // 670
        if (options.attributeFilter == null || typeof options.attributeFilter !== "object") {                          // 671
          throw new TypeError();                                                                                       // 672
        }                                                                                                              // 673
        this.attributeFilter = slice.call(options.attributeFilter);                                                    // 674
      } else {                                                                                                         // 675
        this.attributeFilter = null;                                                                                   // 676
      }                                                                                                                // 677
    }                                                                                                                  // 678
    var uidCounter = 0;                                                                                                // 679
    function MutationObserver(callback) {                                                                              // 680
      this.callback_ = callback;                                                                                       // 681
      this.nodes_ = [];                                                                                                // 682
      this.records_ = [];                                                                                              // 683
      this.uid_ = ++uidCounter;                                                                                        // 684
      this.scheduled_ = false;                                                                                         // 685
    }                                                                                                                  // 686
    MutationObserver.prototype = {                                                                                     // 687
      constructor: MutationObserver,                                                                                   // 688
      observe: function(target, options) {                                                                             // 689
        target = wrapIfNeeded(target);                                                                                 // 690
        var newOptions = new MutationObserverOptions(options);                                                         // 691
        var registration;                                                                                              // 692
        var registrations = registrationsTable.get(target);                                                            // 693
        if (!registrations) registrationsTable.set(target, registrations = []);                                        // 694
        for (var i = 0; i < registrations.length; i++) {                                                               // 695
          if (registrations[i].observer === this) {                                                                    // 696
            registration = registrations[i];                                                                           // 697
            registration.removeTransientObservers();                                                                   // 698
            registration.options = newOptions;                                                                         // 699
          }                                                                                                            // 700
        }                                                                                                              // 701
        if (!registration) {                                                                                           // 702
          registration = new Registration(this, target, newOptions);                                                   // 703
          registrations.push(registration);                                                                            // 704
          this.nodes_.push(target);                                                                                    // 705
        }                                                                                                              // 706
      },                                                                                                               // 707
      disconnect: function() {                                                                                         // 708
        this.nodes_.forEach(function(node) {                                                                           // 709
          var registrations = registrationsTable.get(node);                                                            // 710
          for (var i = 0; i < registrations.length; i++) {                                                             // 711
            var registration = registrations[i];                                                                       // 712
            if (registration.observer === this) {                                                                      // 713
              registrations.splice(i, 1);                                                                              // 714
              break;                                                                                                   // 715
            }                                                                                                          // 716
          }                                                                                                            // 717
        }, this);                                                                                                      // 718
        this.records_ = [];                                                                                            // 719
      },                                                                                                               // 720
      takeRecords: function() {                                                                                        // 721
        var copyOfRecords = this.records_;                                                                             // 722
        this.records_ = [];                                                                                            // 723
        return copyOfRecords;                                                                                          // 724
      }                                                                                                                // 725
    };                                                                                                                 // 726
    function Registration(observer, target, options) {                                                                 // 727
      this.observer = observer;                                                                                        // 728
      this.target = target;                                                                                            // 729
      this.options = options;                                                                                          // 730
      this.transientObservedNodes = [];                                                                                // 731
    }                                                                                                                  // 732
    Registration.prototype = {                                                                                         // 733
      addTransientObserver: function(node) {                                                                           // 734
        if (node === this.target) return;                                                                              // 735
        scheduleCallback(this.observer);                                                                               // 736
        this.transientObservedNodes.push(node);                                                                        // 737
        var registrations = registrationsTable.get(node);                                                              // 738
        if (!registrations) registrationsTable.set(node, registrations = []);                                          // 739
        registrations.push(this);                                                                                      // 740
      },                                                                                                               // 741
      removeTransientObservers: function() {                                                                           // 742
        var transientObservedNodes = this.transientObservedNodes;                                                      // 743
        this.transientObservedNodes = [];                                                                              // 744
        for (var i = 0; i < transientObservedNodes.length; i++) {                                                      // 745
          var node = transientObservedNodes[i];                                                                        // 746
          var registrations = registrationsTable.get(node);                                                            // 747
          for (var j = 0; j < registrations.length; j++) {                                                             // 748
            if (registrations[j] === this) {                                                                           // 749
              registrations.splice(j, 1);                                                                              // 750
              break;                                                                                                   // 751
            }                                                                                                          // 752
          }                                                                                                            // 753
        }                                                                                                              // 754
      }                                                                                                                // 755
    };                                                                                                                 // 756
    scope.enqueueMutation = enqueueMutation;                                                                           // 757
    scope.registerTransientObservers = registerTransientObservers;                                                     // 758
    scope.wrappers.MutationObserver = MutationObserver;                                                                // 759
    scope.wrappers.MutationRecord = MutationRecord;                                                                    // 760
  })(window.ShadowDOMPolyfill);                                                                                        // 761
  (function(scope) {                                                                                                   // 762
    "use strict";                                                                                                      // 763
    function TreeScope(root, parent) {                                                                                 // 764
      this.root = root;                                                                                                // 765
      this.parent = parent;                                                                                            // 766
    }                                                                                                                  // 767
    TreeScope.prototype = {                                                                                            // 768
      get renderer() {                                                                                                 // 769
        if (this.root instanceof scope.wrappers.ShadowRoot) {                                                          // 770
          return scope.getRendererForHost(this.root.host);                                                             // 771
        }                                                                                                              // 772
        return null;                                                                                                   // 773
      },                                                                                                               // 774
      contains: function(treeScope) {                                                                                  // 775
        for (;treeScope; treeScope = treeScope.parent) {                                                               // 776
          if (treeScope === this) return true;                                                                         // 777
        }                                                                                                              // 778
        return false;                                                                                                  // 779
      }                                                                                                                // 780
    };                                                                                                                 // 781
    function setTreeScope(node, treeScope) {                                                                           // 782
      if (node.treeScope_ !== treeScope) {                                                                             // 783
        node.treeScope_ = treeScope;                                                                                   // 784
        for (var sr = node.shadowRoot; sr; sr = sr.olderShadowRoot) {                                                  // 785
          sr.treeScope_.parent = treeScope;                                                                            // 786
        }                                                                                                              // 787
        for (var child = node.firstChild; child; child = child.nextSibling) {                                          // 788
          setTreeScope(child, treeScope);                                                                              // 789
        }                                                                                                              // 790
      }                                                                                                                // 791
    }                                                                                                                  // 792
    function getTreeScope(node) {                                                                                      // 793
      if (node instanceof scope.wrappers.Window) {                                                                     // 794
        debugger;                                                                                                      // 795
      }                                                                                                                // 796
      if (node.treeScope_) return node.treeScope_;                                                                     // 797
      var parent = node.parentNode;                                                                                    // 798
      var treeScope;                                                                                                   // 799
      if (parent) treeScope = getTreeScope(parent); else treeScope = new TreeScope(node, null);                        // 800
      return node.treeScope_ = treeScope;                                                                              // 801
    }                                                                                                                  // 802
    scope.TreeScope = TreeScope;                                                                                       // 803
    scope.getTreeScope = getTreeScope;                                                                                 // 804
    scope.setTreeScope = setTreeScope;                                                                                 // 805
  })(window.ShadowDOMPolyfill);                                                                                        // 806
  (function(scope) {                                                                                                   // 807
    "use strict";                                                                                                      // 808
    var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;                                                       // 809
    var getTreeScope = scope.getTreeScope;                                                                             // 810
    var mixin = scope.mixin;                                                                                           // 811
    var registerWrapper = scope.registerWrapper;                                                                       // 812
    var setWrapper = scope.setWrapper;                                                                                 // 813
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 814
    var unwrap = scope.unwrap;                                                                                         // 815
    var wrap = scope.wrap;                                                                                             // 816
    var wrappers = scope.wrappers;                                                                                     // 817
    var wrappedFuns = new WeakMap();                                                                                   // 818
    var listenersTable = new WeakMap();                                                                                // 819
    var handledEventsTable = new WeakMap();                                                                            // 820
    var currentlyDispatchingEvents = new WeakMap();                                                                    // 821
    var targetTable = new WeakMap();                                                                                   // 822
    var currentTargetTable = new WeakMap();                                                                            // 823
    var relatedTargetTable = new WeakMap();                                                                            // 824
    var eventPhaseTable = new WeakMap();                                                                               // 825
    var stopPropagationTable = new WeakMap();                                                                          // 826
    var stopImmediatePropagationTable = new WeakMap();                                                                 // 827
    var eventHandlersTable = new WeakMap();                                                                            // 828
    var eventPathTable = new WeakMap();                                                                                // 829
    function isShadowRoot(node) {                                                                                      // 830
      return node instanceof wrappers.ShadowRoot;                                                                      // 831
    }                                                                                                                  // 832
    function rootOfNode(node) {                                                                                        // 833
      return getTreeScope(node).root;                                                                                  // 834
    }                                                                                                                  // 835
    function getEventPath(node, event) {                                                                               // 836
      var path = [];                                                                                                   // 837
      var current = node;                                                                                              // 838
      path.push(current);                                                                                              // 839
      while (current) {                                                                                                // 840
        var destinationInsertionPoints = getDestinationInsertionPoints(current);                                       // 841
        if (destinationInsertionPoints && destinationInsertionPoints.length > 0) {                                     // 842
          for (var i = 0; i < destinationInsertionPoints.length; i++) {                                                // 843
            var insertionPoint = destinationInsertionPoints[i];                                                        // 844
            if (isShadowInsertionPoint(insertionPoint)) {                                                              // 845
              var shadowRoot = rootOfNode(insertionPoint);                                                             // 846
              var olderShadowRoot = shadowRoot.olderShadowRoot;                                                        // 847
              if (olderShadowRoot) path.push(olderShadowRoot);                                                         // 848
            }                                                                                                          // 849
            path.push(insertionPoint);                                                                                 // 850
          }                                                                                                            // 851
          current = destinationInsertionPoints[destinationInsertionPoints.length - 1];                                 // 852
        } else {                                                                                                       // 853
          if (isShadowRoot(current)) {                                                                                 // 854
            if (inSameTree(node, current) && eventMustBeStopped(event)) {                                              // 855
              break;                                                                                                   // 856
            }                                                                                                          // 857
            current = current.host;                                                                                    // 858
            path.push(current);                                                                                        // 859
          } else {                                                                                                     // 860
            current = current.parentNode;                                                                              // 861
            if (current) path.push(current);                                                                           // 862
          }                                                                                                            // 863
        }                                                                                                              // 864
      }                                                                                                                // 865
      return path;                                                                                                     // 866
    }                                                                                                                  // 867
    function eventMustBeStopped(event) {                                                                               // 868
      if (!event) return false;                                                                                        // 869
      switch (event.type) {                                                                                            // 870
       case "abort":                                                                                                   // 871
       case "error":                                                                                                   // 872
       case "select":                                                                                                  // 873
       case "change":                                                                                                  // 874
       case "load":                                                                                                    // 875
       case "reset":                                                                                                   // 876
       case "resize":                                                                                                  // 877
       case "scroll":                                                                                                  // 878
       case "selectstart":                                                                                             // 879
        return true;                                                                                                   // 880
      }                                                                                                                // 881
      return false;                                                                                                    // 882
    }                                                                                                                  // 883
    function isShadowInsertionPoint(node) {                                                                            // 884
      return node instanceof HTMLShadowElement;                                                                        // 885
    }                                                                                                                  // 886
    function getDestinationInsertionPoints(node) {                                                                     // 887
      return scope.getDestinationInsertionPoints(node);                                                                // 888
    }                                                                                                                  // 889
    function eventRetargetting(path, currentTarget) {                                                                  // 890
      if (path.length === 0) return currentTarget;                                                                     // 891
      if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;                            // 892
      var currentTargetTree = getTreeScope(currentTarget);                                                             // 893
      var originalTarget = path[0];                                                                                    // 894
      var originalTargetTree = getTreeScope(originalTarget);                                                           // 895
      var relativeTargetTree = lowestCommonInclusiveAncestor(currentTargetTree, originalTargetTree);                   // 896
      for (var i = 0; i < path.length; i++) {                                                                          // 897
        var node = path[i];                                                                                            // 898
        if (getTreeScope(node) === relativeTargetTree) return node;                                                    // 899
      }                                                                                                                // 900
      return path[path.length - 1];                                                                                    // 901
    }                                                                                                                  // 902
    function getTreeScopeAncestors(treeScope) {                                                                        // 903
      var ancestors = [];                                                                                              // 904
      for (;treeScope; treeScope = treeScope.parent) {                                                                 // 905
        ancestors.push(treeScope);                                                                                     // 906
      }                                                                                                                // 907
      return ancestors;                                                                                                // 908
    }                                                                                                                  // 909
    function lowestCommonInclusiveAncestor(tsA, tsB) {                                                                 // 910
      var ancestorsA = getTreeScopeAncestors(tsA);                                                                     // 911
      var ancestorsB = getTreeScopeAncestors(tsB);                                                                     // 912
      var result = null;                                                                                               // 913
      while (ancestorsA.length > 0 && ancestorsB.length > 0) {                                                         // 914
        var a = ancestorsA.pop();                                                                                      // 915
        var b = ancestorsB.pop();                                                                                      // 916
        if (a === b) result = a; else break;                                                                           // 917
      }                                                                                                                // 918
      return result;                                                                                                   // 919
    }                                                                                                                  // 920
    function getTreeScopeRoot(ts) {                                                                                    // 921
      if (!ts.parent) return ts;                                                                                       // 922
      return getTreeScopeRoot(ts.parent);                                                                              // 923
    }                                                                                                                  // 924
    function relatedTargetResolution(event, currentTarget, relatedTarget) {                                            // 925
      if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;                            // 926
      var currentTargetTree = getTreeScope(currentTarget);                                                             // 927
      var relatedTargetTree = getTreeScope(relatedTarget);                                                             // 928
      var relatedTargetEventPath = getEventPath(relatedTarget, event);                                                 // 929
      var lowestCommonAncestorTree;                                                                                    // 930
      var lowestCommonAncestorTree = lowestCommonInclusiveAncestor(currentTargetTree, relatedTargetTree);              // 931
      if (!lowestCommonAncestorTree) lowestCommonAncestorTree = relatedTargetTree.root;                                // 932
      for (var commonAncestorTree = lowestCommonAncestorTree; commonAncestorTree; commonAncestorTree = commonAncestorTree.parent) {
        var adjustedRelatedTarget;                                                                                     // 934
        for (var i = 0; i < relatedTargetEventPath.length; i++) {                                                      // 935
          var node = relatedTargetEventPath[i];                                                                        // 936
          if (getTreeScope(node) === commonAncestorTree) return node;                                                  // 937
        }                                                                                                              // 938
      }                                                                                                                // 939
      return null;                                                                                                     // 940
    }                                                                                                                  // 941
    function inSameTree(a, b) {                                                                                        // 942
      return getTreeScope(a) === getTreeScope(b);                                                                      // 943
    }                                                                                                                  // 944
    var NONE = 0;                                                                                                      // 945
    var CAPTURING_PHASE = 1;                                                                                           // 946
    var AT_TARGET = 2;                                                                                                 // 947
    var BUBBLING_PHASE = 3;                                                                                            // 948
    var pendingError;                                                                                                  // 949
    function dispatchOriginalEvent(originalEvent) {                                                                    // 950
      if (handledEventsTable.get(originalEvent)) return;                                                               // 951
      handledEventsTable.set(originalEvent, true);                                                                     // 952
      dispatchEvent(wrap(originalEvent), wrap(originalEvent.target));                                                  // 953
      if (pendingError) {                                                                                              // 954
        var err = pendingError;                                                                                        // 955
        pendingError = null;                                                                                           // 956
        throw err;                                                                                                     // 957
      }                                                                                                                // 958
    }                                                                                                                  // 959
    function isLoadLikeEvent(event) {                                                                                  // 960
      switch (event.type) {                                                                                            // 961
       case "load":                                                                                                    // 962
       case "beforeunload":                                                                                            // 963
       case "unload":                                                                                                  // 964
        return true;                                                                                                   // 965
      }                                                                                                                // 966
      return false;                                                                                                    // 967
    }                                                                                                                  // 968
    function dispatchEvent(event, originalWrapperTarget) {                                                             // 969
      if (currentlyDispatchingEvents.get(event)) throw new Error("InvalidStateError");                                 // 970
      currentlyDispatchingEvents.set(event, true);                                                                     // 971
      scope.renderAllPending();                                                                                        // 972
      var eventPath;                                                                                                   // 973
      var overrideTarget;                                                                                              // 974
      var win;                                                                                                         // 975
      if (isLoadLikeEvent(event) && !event.bubbles) {                                                                  // 976
        var doc = originalWrapperTarget;                                                                               // 977
        if (doc instanceof wrappers.Document && (win = doc.defaultView)) {                                             // 978
          overrideTarget = doc;                                                                                        // 979
          eventPath = [];                                                                                              // 980
        }                                                                                                              // 981
      }                                                                                                                // 982
      if (!eventPath) {                                                                                                // 983
        if (originalWrapperTarget instanceof wrappers.Window) {                                                        // 984
          win = originalWrapperTarget;                                                                                 // 985
          eventPath = [];                                                                                              // 986
        } else {                                                                                                       // 987
          eventPath = getEventPath(originalWrapperTarget, event);                                                      // 988
          if (!isLoadLikeEvent(event)) {                                                                               // 989
            var doc = eventPath[eventPath.length - 1];                                                                 // 990
            if (doc instanceof wrappers.Document) win = doc.defaultView;                                               // 991
          }                                                                                                            // 992
        }                                                                                                              // 993
      }                                                                                                                // 994
      eventPathTable.set(event, eventPath);                                                                            // 995
      if (dispatchCapturing(event, eventPath, win, overrideTarget)) {                                                  // 996
        if (dispatchAtTarget(event, eventPath, win, overrideTarget)) {                                                 // 997
          dispatchBubbling(event, eventPath, win, overrideTarget);                                                     // 998
        }                                                                                                              // 999
      }                                                                                                                // 1000
      eventPhaseTable.set(event, NONE);                                                                                // 1001
      currentTargetTable.delete(event, null);                                                                          // 1002
      currentlyDispatchingEvents.delete(event);                                                                        // 1003
      return event.defaultPrevented;                                                                                   // 1004
    }                                                                                                                  // 1005
    function dispatchCapturing(event, eventPath, win, overrideTarget) {                                                // 1006
      var phase = CAPTURING_PHASE;                                                                                     // 1007
      if (win) {                                                                                                       // 1008
        if (!invoke(win, event, phase, eventPath, overrideTarget)) return false;                                       // 1009
      }                                                                                                                // 1010
      for (var i = eventPath.length - 1; i > 0; i--) {                                                                 // 1011
        if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return false;                              // 1012
      }                                                                                                                // 1013
      return true;                                                                                                     // 1014
    }                                                                                                                  // 1015
    function dispatchAtTarget(event, eventPath, win, overrideTarget) {                                                 // 1016
      var phase = AT_TARGET;                                                                                           // 1017
      var currentTarget = eventPath[0] || win;                                                                         // 1018
      return invoke(currentTarget, event, phase, eventPath, overrideTarget);                                           // 1019
    }                                                                                                                  // 1020
    function dispatchBubbling(event, eventPath, win, overrideTarget) {                                                 // 1021
      var phase = BUBBLING_PHASE;                                                                                      // 1022
      for (var i = 1; i < eventPath.length; i++) {                                                                     // 1023
        if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return;                                    // 1024
      }                                                                                                                // 1025
      if (win && eventPath.length > 0) {                                                                               // 1026
        invoke(win, event, phase, eventPath, overrideTarget);                                                          // 1027
      }                                                                                                                // 1028
    }                                                                                                                  // 1029
    function invoke(currentTarget, event, phase, eventPath, overrideTarget) {                                          // 1030
      var listeners = listenersTable.get(currentTarget);                                                               // 1031
      if (!listeners) return true;                                                                                     // 1032
      var target = overrideTarget || eventRetargetting(eventPath, currentTarget);                                      // 1033
      if (target === currentTarget) {                                                                                  // 1034
        if (phase === CAPTURING_PHASE) return true;                                                                    // 1035
        if (phase === BUBBLING_PHASE) phase = AT_TARGET;                                                               // 1036
      } else if (phase === BUBBLING_PHASE && !event.bubbles) {                                                         // 1037
        return true;                                                                                                   // 1038
      }                                                                                                                // 1039
      if ("relatedTarget" in event) {                                                                                  // 1040
        var originalEvent = unwrap(event);                                                                             // 1041
        var unwrappedRelatedTarget = originalEvent.relatedTarget;                                                      // 1042
        if (unwrappedRelatedTarget) {                                                                                  // 1043
          if (unwrappedRelatedTarget instanceof Object && unwrappedRelatedTarget.addEventListener) {                   // 1044
            var relatedTarget = wrap(unwrappedRelatedTarget);                                                          // 1045
            var adjusted = relatedTargetResolution(event, currentTarget, relatedTarget);                               // 1046
            if (adjusted === target) return true;                                                                      // 1047
          } else {                                                                                                     // 1048
            adjusted = null;                                                                                           // 1049
          }                                                                                                            // 1050
          relatedTargetTable.set(event, adjusted);                                                                     // 1051
        }                                                                                                              // 1052
      }                                                                                                                // 1053
      eventPhaseTable.set(event, phase);                                                                               // 1054
      var type = event.type;                                                                                           // 1055
      var anyRemoved = false;                                                                                          // 1056
      targetTable.set(event, target);                                                                                  // 1057
      currentTargetTable.set(event, currentTarget);                                                                    // 1058
      listeners.depth++;                                                                                               // 1059
      for (var i = 0, len = listeners.length; i < len; i++) {                                                          // 1060
        var listener = listeners[i];                                                                                   // 1061
        if (listener.removed) {                                                                                        // 1062
          anyRemoved = true;                                                                                           // 1063
          continue;                                                                                                    // 1064
        }                                                                                                              // 1065
        if (listener.type !== type || !listener.capture && phase === CAPTURING_PHASE || listener.capture && phase === BUBBLING_PHASE) {
          continue;                                                                                                    // 1067
        }                                                                                                              // 1068
        try {                                                                                                          // 1069
          if (typeof listener.handler === "function") listener.handler.call(currentTarget, event); else listener.handler.handleEvent(event);
          if (stopImmediatePropagationTable.get(event)) return false;                                                  // 1071
        } catch (ex) {                                                                                                 // 1072
          if (!pendingError) pendingError = ex;                                                                        // 1073
        }                                                                                                              // 1074
      }                                                                                                                // 1075
      listeners.depth--;                                                                                               // 1076
      if (anyRemoved && listeners.depth === 0) {                                                                       // 1077
        var copy = listeners.slice();                                                                                  // 1078
        listeners.length = 0;                                                                                          // 1079
        for (var i = 0; i < copy.length; i++) {                                                                        // 1080
          if (!copy[i].removed) listeners.push(copy[i]);                                                               // 1081
        }                                                                                                              // 1082
      }                                                                                                                // 1083
      return !stopPropagationTable.get(event);                                                                         // 1084
    }                                                                                                                  // 1085
    function Listener(type, handler, capture) {                                                                        // 1086
      this.type = type;                                                                                                // 1087
      this.handler = handler;                                                                                          // 1088
      this.capture = Boolean(capture);                                                                                 // 1089
    }                                                                                                                  // 1090
    Listener.prototype = {                                                                                             // 1091
      equals: function(that) {                                                                                         // 1092
        return this.handler === that.handler && this.type === that.type && this.capture === that.capture;              // 1093
      },                                                                                                               // 1094
      get removed() {                                                                                                  // 1095
        return this.handler === null;                                                                                  // 1096
      },                                                                                                               // 1097
      remove: function() {                                                                                             // 1098
        this.handler = null;                                                                                           // 1099
      }                                                                                                                // 1100
    };                                                                                                                 // 1101
    var OriginalEvent = window.Event;                                                                                  // 1102
    OriginalEvent.prototype.polymerBlackList_ = {                                                                      // 1103
      returnValue: true,                                                                                               // 1104
      keyLocation: true                                                                                                // 1105
    };                                                                                                                 // 1106
    function Event(type, options) {                                                                                    // 1107
      if (type instanceof OriginalEvent) {                                                                             // 1108
        var impl = type;                                                                                               // 1109
        if (!OriginalBeforeUnloadEvent && impl.type === "beforeunload" && !(this instanceof BeforeUnloadEvent)) {      // 1110
          return new BeforeUnloadEvent(impl);                                                                          // 1111
        }                                                                                                              // 1112
        setWrapper(impl, this);                                                                                        // 1113
      } else {                                                                                                         // 1114
        return wrap(constructEvent(OriginalEvent, "Event", type, options));                                            // 1115
      }                                                                                                                // 1116
    }                                                                                                                  // 1117
    Event.prototype = {                                                                                                // 1118
      get target() {                                                                                                   // 1119
        return targetTable.get(this);                                                                                  // 1120
      },                                                                                                               // 1121
      get currentTarget() {                                                                                            // 1122
        return currentTargetTable.get(this);                                                                           // 1123
      },                                                                                                               // 1124
      get eventPhase() {                                                                                               // 1125
        return eventPhaseTable.get(this);                                                                              // 1126
      },                                                                                                               // 1127
      get path() {                                                                                                     // 1128
        var eventPath = eventPathTable.get(this);                                                                      // 1129
        if (!eventPath) return [];                                                                                     // 1130
        return eventPath.slice();                                                                                      // 1131
      },                                                                                                               // 1132
      stopPropagation: function() {                                                                                    // 1133
        stopPropagationTable.set(this, true);                                                                          // 1134
      },                                                                                                               // 1135
      stopImmediatePropagation: function() {                                                                           // 1136
        stopPropagationTable.set(this, true);                                                                          // 1137
        stopImmediatePropagationTable.set(this, true);                                                                 // 1138
      }                                                                                                                // 1139
    };                                                                                                                 // 1140
    registerWrapper(OriginalEvent, Event, document.createEvent("Event"));                                              // 1141
    function unwrapOptions(options) {                                                                                  // 1142
      if (!options || !options.relatedTarget) return options;                                                          // 1143
      return Object.create(options, {                                                                                  // 1144
        relatedTarget: {                                                                                               // 1145
          value: unwrap(options.relatedTarget)                                                                         // 1146
        }                                                                                                              // 1147
      });                                                                                                              // 1148
    }                                                                                                                  // 1149
    function registerGenericEvent(name, SuperEvent, prototype) {                                                       // 1150
      var OriginalEvent = window[name];                                                                                // 1151
      var GenericEvent = function(type, options) {                                                                     // 1152
        if (type instanceof OriginalEvent) setWrapper(type, this); else return wrap(constructEvent(OriginalEvent, name, type, options));
      };                                                                                                               // 1154
      GenericEvent.prototype = Object.create(SuperEvent.prototype);                                                    // 1155
      if (prototype) mixin(GenericEvent.prototype, prototype);                                                         // 1156
      if (OriginalEvent) {                                                                                             // 1157
        try {                                                                                                          // 1158
          registerWrapper(OriginalEvent, GenericEvent, new OriginalEvent("temp"));                                     // 1159
        } catch (ex) {                                                                                                 // 1160
          registerWrapper(OriginalEvent, GenericEvent, document.createEvent(name));                                    // 1161
        }                                                                                                              // 1162
      }                                                                                                                // 1163
      return GenericEvent;                                                                                             // 1164
    }                                                                                                                  // 1165
    var UIEvent = registerGenericEvent("UIEvent", Event);                                                              // 1166
    var CustomEvent = registerGenericEvent("CustomEvent", Event);                                                      // 1167
    var relatedTargetProto = {                                                                                         // 1168
      get relatedTarget() {                                                                                            // 1169
        var relatedTarget = relatedTargetTable.get(this);                                                              // 1170
        if (relatedTarget !== undefined) return relatedTarget;                                                         // 1171
        return wrap(unwrap(this).relatedTarget);                                                                       // 1172
      }                                                                                                                // 1173
    };                                                                                                                 // 1174
    function getInitFunction(name, relatedTargetIndex) {                                                               // 1175
      return function() {                                                                                              // 1176
        arguments[relatedTargetIndex] = unwrap(arguments[relatedTargetIndex]);                                         // 1177
        var impl = unwrap(this);                                                                                       // 1178
        impl[name].apply(impl, arguments);                                                                             // 1179
      };                                                                                                               // 1180
    }                                                                                                                  // 1181
    var mouseEventProto = mixin({                                                                                      // 1182
      initMouseEvent: getInitFunction("initMouseEvent", 14)                                                            // 1183
    }, relatedTargetProto);                                                                                            // 1184
    var focusEventProto = mixin({                                                                                      // 1185
      initFocusEvent: getInitFunction("initFocusEvent", 5)                                                             // 1186
    }, relatedTargetProto);                                                                                            // 1187
    var MouseEvent = registerGenericEvent("MouseEvent", UIEvent, mouseEventProto);                                     // 1188
    var FocusEvent = registerGenericEvent("FocusEvent", UIEvent, focusEventProto);                                     // 1189
    var defaultInitDicts = Object.create(null);                                                                        // 1190
    var supportsEventConstructors = function() {                                                                       // 1191
      try {                                                                                                            // 1192
        new window.FocusEvent("focus");                                                                                // 1193
      } catch (ex) {                                                                                                   // 1194
        return false;                                                                                                  // 1195
      }                                                                                                                // 1196
      return true;                                                                                                     // 1197
    }();                                                                                                               // 1198
    function constructEvent(OriginalEvent, name, type, options) {                                                      // 1199
      if (supportsEventConstructors) return new OriginalEvent(type, unwrapOptions(options));                           // 1200
      var event = unwrap(document.createEvent(name));                                                                  // 1201
      var defaultDict = defaultInitDicts[name];                                                                        // 1202
      var args = [ type ];                                                                                             // 1203
      Object.keys(defaultDict).forEach(function(key) {                                                                 // 1204
        var v = options != null && key in options ? options[key] : defaultDict[key];                                   // 1205
        if (key === "relatedTarget") v = unwrap(v);                                                                    // 1206
        args.push(v);                                                                                                  // 1207
      });                                                                                                              // 1208
      event["init" + name].apply(event, args);                                                                         // 1209
      return event;                                                                                                    // 1210
    }                                                                                                                  // 1211
    if (!supportsEventConstructors) {                                                                                  // 1212
      var configureEventConstructor = function(name, initDict, superName) {                                            // 1213
        if (superName) {                                                                                               // 1214
          var superDict = defaultInitDicts[superName];                                                                 // 1215
          initDict = mixin(mixin({}, superDict), initDict);                                                            // 1216
        }                                                                                                              // 1217
        defaultInitDicts[name] = initDict;                                                                             // 1218
      };                                                                                                               // 1219
      configureEventConstructor("Event", {                                                                             // 1220
        bubbles: false,                                                                                                // 1221
        cancelable: false                                                                                              // 1222
      });                                                                                                              // 1223
      configureEventConstructor("CustomEvent", {                                                                       // 1224
        detail: null                                                                                                   // 1225
      }, "Event");                                                                                                     // 1226
      configureEventConstructor("UIEvent", {                                                                           // 1227
        view: null,                                                                                                    // 1228
        detail: 0                                                                                                      // 1229
      }, "Event");                                                                                                     // 1230
      configureEventConstructor("MouseEvent", {                                                                        // 1231
        screenX: 0,                                                                                                    // 1232
        screenY: 0,                                                                                                    // 1233
        clientX: 0,                                                                                                    // 1234
        clientY: 0,                                                                                                    // 1235
        ctrlKey: false,                                                                                                // 1236
        altKey: false,                                                                                                 // 1237
        shiftKey: false,                                                                                               // 1238
        metaKey: false,                                                                                                // 1239
        button: 0,                                                                                                     // 1240
        relatedTarget: null                                                                                            // 1241
      }, "UIEvent");                                                                                                   // 1242
      configureEventConstructor("FocusEvent", {                                                                        // 1243
        relatedTarget: null                                                                                            // 1244
      }, "UIEvent");                                                                                                   // 1245
    }                                                                                                                  // 1246
    var OriginalBeforeUnloadEvent = window.BeforeUnloadEvent;                                                          // 1247
    function BeforeUnloadEvent(impl) {                                                                                 // 1248
      Event.call(this, impl);                                                                                          // 1249
    }                                                                                                                  // 1250
    BeforeUnloadEvent.prototype = Object.create(Event.prototype);                                                      // 1251
    mixin(BeforeUnloadEvent.prototype, {                                                                               // 1252
      get returnValue() {                                                                                              // 1253
        return unsafeUnwrap(this).returnValue;                                                                         // 1254
      },                                                                                                               // 1255
      set returnValue(v) {                                                                                             // 1256
        unsafeUnwrap(this).returnValue = v;                                                                            // 1257
      }                                                                                                                // 1258
    });                                                                                                                // 1259
    if (OriginalBeforeUnloadEvent) registerWrapper(OriginalBeforeUnloadEvent, BeforeUnloadEvent);                      // 1260
    function isValidListener(fun) {                                                                                    // 1261
      if (typeof fun === "function") return true;                                                                      // 1262
      return fun && fun.handleEvent;                                                                                   // 1263
    }                                                                                                                  // 1264
    function isMutationEvent(type) {                                                                                   // 1265
      switch (type) {                                                                                                  // 1266
       case "DOMAttrModified":                                                                                         // 1267
       case "DOMAttributeNameChanged":                                                                                 // 1268
       case "DOMCharacterDataModified":                                                                                // 1269
       case "DOMElementNameChanged":                                                                                   // 1270
       case "DOMNodeInserted":                                                                                         // 1271
       case "DOMNodeInsertedIntoDocument":                                                                             // 1272
       case "DOMNodeRemoved":                                                                                          // 1273
       case "DOMNodeRemovedFromDocument":                                                                              // 1274
       case "DOMSubtreeModified":                                                                                      // 1275
        return true;                                                                                                   // 1276
      }                                                                                                                // 1277
      return false;                                                                                                    // 1278
    }                                                                                                                  // 1279
    var OriginalEventTarget = window.EventTarget;                                                                      // 1280
    function EventTarget(impl) {                                                                                       // 1281
      setWrapper(impl, this);                                                                                          // 1282
    }                                                                                                                  // 1283
    var methodNames = [ "addEventListener", "removeEventListener", "dispatchEvent" ];                                  // 1284
    [ Node, Window ].forEach(function(constructor) {                                                                   // 1285
      var p = constructor.prototype;                                                                                   // 1286
      methodNames.forEach(function(name) {                                                                             // 1287
        Object.defineProperty(p, name + "_", {                                                                         // 1288
          value: p[name]                                                                                               // 1289
        });                                                                                                            // 1290
      });                                                                                                              // 1291
    });                                                                                                                // 1292
    function getTargetToListenAt(wrapper) {                                                                            // 1293
      if (wrapper instanceof wrappers.ShadowRoot) wrapper = wrapper.host;                                              // 1294
      return unwrap(wrapper);                                                                                          // 1295
    }                                                                                                                  // 1296
    EventTarget.prototype = {                                                                                          // 1297
      addEventListener: function(type, fun, capture) {                                                                 // 1298
        if (!isValidListener(fun) || isMutationEvent(type)) return;                                                    // 1299
        var listener = new Listener(type, fun, capture);                                                               // 1300
        var listeners = listenersTable.get(this);                                                                      // 1301
        if (!listeners) {                                                                                              // 1302
          listeners = [];                                                                                              // 1303
          listeners.depth = 0;                                                                                         // 1304
          listenersTable.set(this, listeners);                                                                         // 1305
        } else {                                                                                                       // 1306
          for (var i = 0; i < listeners.length; i++) {                                                                 // 1307
            if (listener.equals(listeners[i])) return;                                                                 // 1308
          }                                                                                                            // 1309
        }                                                                                                              // 1310
        listeners.push(listener);                                                                                      // 1311
        var target = getTargetToListenAt(this);                                                                        // 1312
        target.addEventListener_(type, dispatchOriginalEvent, true);                                                   // 1313
      },                                                                                                               // 1314
      removeEventListener: function(type, fun, capture) {                                                              // 1315
        capture = Boolean(capture);                                                                                    // 1316
        var listeners = listenersTable.get(this);                                                                      // 1317
        if (!listeners) return;                                                                                        // 1318
        var count = 0, found = false;                                                                                  // 1319
        for (var i = 0; i < listeners.length; i++) {                                                                   // 1320
          if (listeners[i].type === type && listeners[i].capture === capture) {                                        // 1321
            count++;                                                                                                   // 1322
            if (listeners[i].handler === fun) {                                                                        // 1323
              found = true;                                                                                            // 1324
              listeners[i].remove();                                                                                   // 1325
            }                                                                                                          // 1326
          }                                                                                                            // 1327
        }                                                                                                              // 1328
        if (found && count === 1) {                                                                                    // 1329
          var target = getTargetToListenAt(this);                                                                      // 1330
          target.removeEventListener_(type, dispatchOriginalEvent, true);                                              // 1331
        }                                                                                                              // 1332
      },                                                                                                               // 1333
      dispatchEvent: function(event) {                                                                                 // 1334
        var nativeEvent = unwrap(event);                                                                               // 1335
        var eventType = nativeEvent.type;                                                                              // 1336
        handledEventsTable.set(nativeEvent, false);                                                                    // 1337
        scope.renderAllPending();                                                                                      // 1338
        var tempListener;                                                                                              // 1339
        if (!hasListenerInAncestors(this, eventType)) {                                                                // 1340
          tempListener = function() {};                                                                                // 1341
          this.addEventListener(eventType, tempListener, true);                                                        // 1342
        }                                                                                                              // 1343
        try {                                                                                                          // 1344
          return unwrap(this).dispatchEvent_(nativeEvent);                                                             // 1345
        } finally {                                                                                                    // 1346
          if (tempListener) this.removeEventListener(eventType, tempListener, true);                                   // 1347
        }                                                                                                              // 1348
      }                                                                                                                // 1349
    };                                                                                                                 // 1350
    function hasListener(node, type) {                                                                                 // 1351
      var listeners = listenersTable.get(node);                                                                        // 1352
      if (listeners) {                                                                                                 // 1353
        for (var i = 0; i < listeners.length; i++) {                                                                   // 1354
          if (!listeners[i].removed && listeners[i].type === type) return true;                                        // 1355
        }                                                                                                              // 1356
      }                                                                                                                // 1357
      return false;                                                                                                    // 1358
    }                                                                                                                  // 1359
    function hasListenerInAncestors(target, type) {                                                                    // 1360
      for (var node = unwrap(target); node; node = node.parentNode) {                                                  // 1361
        if (hasListener(wrap(node), type)) return true;                                                                // 1362
      }                                                                                                                // 1363
      return false;                                                                                                    // 1364
    }                                                                                                                  // 1365
    if (OriginalEventTarget) registerWrapper(OriginalEventTarget, EventTarget);                                        // 1366
    function wrapEventTargetMethods(constructors) {                                                                    // 1367
      forwardMethodsToWrapper(constructors, methodNames);                                                              // 1368
    }                                                                                                                  // 1369
    var originalElementFromPoint = document.elementFromPoint;                                                          // 1370
    function elementFromPoint(self, document, x, y) {                                                                  // 1371
      scope.renderAllPending();                                                                                        // 1372
      var element = wrap(originalElementFromPoint.call(unsafeUnwrap(document), x, y));                                 // 1373
      if (!element) return null;                                                                                       // 1374
      var path = getEventPath(element, null);                                                                          // 1375
      var idx = path.lastIndexOf(self);                                                                                // 1376
      if (idx == -1) return null; else path = path.slice(0, idx);                                                      // 1377
      return eventRetargetting(path, self);                                                                            // 1378
    }                                                                                                                  // 1379
    function getEventHandlerGetter(name) {                                                                             // 1380
      return function() {                                                                                              // 1381
        var inlineEventHandlers = eventHandlersTable.get(this);                                                        // 1382
        return inlineEventHandlers && inlineEventHandlers[name] && inlineEventHandlers[name].value || null;            // 1383
      };                                                                                                               // 1384
    }                                                                                                                  // 1385
    function getEventHandlerSetter(name) {                                                                             // 1386
      var eventType = name.slice(2);                                                                                   // 1387
      return function(value) {                                                                                         // 1388
        var inlineEventHandlers = eventHandlersTable.get(this);                                                        // 1389
        if (!inlineEventHandlers) {                                                                                    // 1390
          inlineEventHandlers = Object.create(null);                                                                   // 1391
          eventHandlersTable.set(this, inlineEventHandlers);                                                           // 1392
        }                                                                                                              // 1393
        var old = inlineEventHandlers[name];                                                                           // 1394
        if (old) this.removeEventListener(eventType, old.wrapped, false);                                              // 1395
        if (typeof value === "function") {                                                                             // 1396
          var wrapped = function(e) {                                                                                  // 1397
            var rv = value.call(this, e);                                                                              // 1398
            if (rv === false) e.preventDefault(); else if (name === "onbeforeunload" && typeof rv === "string") e.returnValue = rv;
          };                                                                                                           // 1400
          this.addEventListener(eventType, wrapped, false);                                                            // 1401
          inlineEventHandlers[name] = {                                                                                // 1402
            value: value,                                                                                              // 1403
            wrapped: wrapped                                                                                           // 1404
          };                                                                                                           // 1405
        }                                                                                                              // 1406
      };                                                                                                               // 1407
    }                                                                                                                  // 1408
    scope.elementFromPoint = elementFromPoint;                                                                         // 1409
    scope.getEventHandlerGetter = getEventHandlerGetter;                                                               // 1410
    scope.getEventHandlerSetter = getEventHandlerSetter;                                                               // 1411
    scope.wrapEventTargetMethods = wrapEventTargetMethods;                                                             // 1412
    scope.wrappers.BeforeUnloadEvent = BeforeUnloadEvent;                                                              // 1413
    scope.wrappers.CustomEvent = CustomEvent;                                                                          // 1414
    scope.wrappers.Event = Event;                                                                                      // 1415
    scope.wrappers.EventTarget = EventTarget;                                                                          // 1416
    scope.wrappers.FocusEvent = FocusEvent;                                                                            // 1417
    scope.wrappers.MouseEvent = MouseEvent;                                                                            // 1418
    scope.wrappers.UIEvent = UIEvent;                                                                                  // 1419
  })(window.ShadowDOMPolyfill);                                                                                        // 1420
  (function(scope) {                                                                                                   // 1421
    "use strict";                                                                                                      // 1422
    var UIEvent = scope.wrappers.UIEvent;                                                                              // 1423
    var mixin = scope.mixin;                                                                                           // 1424
    var registerWrapper = scope.registerWrapper;                                                                       // 1425
    var setWrapper = scope.setWrapper;                                                                                 // 1426
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 1427
    var wrap = scope.wrap;                                                                                             // 1428
    var OriginalTouchEvent = window.TouchEvent;                                                                        // 1429
    if (!OriginalTouchEvent) return;                                                                                   // 1430
    var nativeEvent;                                                                                                   // 1431
    try {                                                                                                              // 1432
      nativeEvent = document.createEvent("TouchEvent");                                                                // 1433
    } catch (ex) {                                                                                                     // 1434
      return;                                                                                                          // 1435
    }                                                                                                                  // 1436
    var nonEnumDescriptor = {                                                                                          // 1437
      enumerable: false                                                                                                // 1438
    };                                                                                                                 // 1439
    function nonEnum(obj, prop) {                                                                                      // 1440
      Object.defineProperty(obj, prop, nonEnumDescriptor);                                                             // 1441
    }                                                                                                                  // 1442
    function Touch(impl) {                                                                                             // 1443
      setWrapper(impl, this);                                                                                          // 1444
    }                                                                                                                  // 1445
    Touch.prototype = {                                                                                                // 1446
      get target() {                                                                                                   // 1447
        return wrap(unsafeUnwrap(this).target);                                                                        // 1448
      }                                                                                                                // 1449
    };                                                                                                                 // 1450
    var descr = {                                                                                                      // 1451
      configurable: true,                                                                                              // 1452
      enumerable: true,                                                                                                // 1453
      get: null                                                                                                        // 1454
    };                                                                                                                 // 1455
    [ "clientX", "clientY", "screenX", "screenY", "pageX", "pageY", "identifier", "webkitRadiusX", "webkitRadiusY", "webkitRotationAngle", "webkitForce" ].forEach(function(name) {
      descr.get = function() {                                                                                         // 1457
        return unsafeUnwrap(this)[name];                                                                               // 1458
      };                                                                                                               // 1459
      Object.defineProperty(Touch.prototype, name, descr);                                                             // 1460
    });                                                                                                                // 1461
    function TouchList() {                                                                                             // 1462
      this.length = 0;                                                                                                 // 1463
      nonEnum(this, "length");                                                                                         // 1464
    }                                                                                                                  // 1465
    TouchList.prototype = {                                                                                            // 1466
      item: function(index) {                                                                                          // 1467
        return this[index];                                                                                            // 1468
      }                                                                                                                // 1469
    };                                                                                                                 // 1470
    function wrapTouchList(nativeTouchList) {                                                                          // 1471
      var list = new TouchList();                                                                                      // 1472
      for (var i = 0; i < nativeTouchList.length; i++) {                                                               // 1473
        list[i] = new Touch(nativeTouchList[i]);                                                                       // 1474
      }                                                                                                                // 1475
      list.length = i;                                                                                                 // 1476
      return list;                                                                                                     // 1477
    }                                                                                                                  // 1478
    function TouchEvent(impl) {                                                                                        // 1479
      UIEvent.call(this, impl);                                                                                        // 1480
    }                                                                                                                  // 1481
    TouchEvent.prototype = Object.create(UIEvent.prototype);                                                           // 1482
    mixin(TouchEvent.prototype, {                                                                                      // 1483
      get touches() {                                                                                                  // 1484
        return wrapTouchList(unsafeUnwrap(this).touches);                                                              // 1485
      },                                                                                                               // 1486
      get targetTouches() {                                                                                            // 1487
        return wrapTouchList(unsafeUnwrap(this).targetTouches);                                                        // 1488
      },                                                                                                               // 1489
      get changedTouches() {                                                                                           // 1490
        return wrapTouchList(unsafeUnwrap(this).changedTouches);                                                       // 1491
      },                                                                                                               // 1492
      initTouchEvent: function() {                                                                                     // 1493
        throw new Error("Not implemented");                                                                            // 1494
      }                                                                                                                // 1495
    });                                                                                                                // 1496
    registerWrapper(OriginalTouchEvent, TouchEvent, nativeEvent);                                                      // 1497
    scope.wrappers.Touch = Touch;                                                                                      // 1498
    scope.wrappers.TouchEvent = TouchEvent;                                                                            // 1499
    scope.wrappers.TouchList = TouchList;                                                                              // 1500
  })(window.ShadowDOMPolyfill);                                                                                        // 1501
  (function(scope) {                                                                                                   // 1502
    "use strict";                                                                                                      // 1503
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 1504
    var wrap = scope.wrap;                                                                                             // 1505
    var nonEnumDescriptor = {                                                                                          // 1506
      enumerable: false                                                                                                // 1507
    };                                                                                                                 // 1508
    function nonEnum(obj, prop) {                                                                                      // 1509
      Object.defineProperty(obj, prop, nonEnumDescriptor);                                                             // 1510
    }                                                                                                                  // 1511
    function NodeList() {                                                                                              // 1512
      this.length = 0;                                                                                                 // 1513
      nonEnum(this, "length");                                                                                         // 1514
    }                                                                                                                  // 1515
    NodeList.prototype = {                                                                                             // 1516
      item: function(index) {                                                                                          // 1517
        return this[index];                                                                                            // 1518
      }                                                                                                                // 1519
    };                                                                                                                 // 1520
    nonEnum(NodeList.prototype, "item");                                                                               // 1521
    function wrapNodeList(list) {                                                                                      // 1522
      if (list == null) return list;                                                                                   // 1523
      var wrapperList = new NodeList();                                                                                // 1524
      for (var i = 0, length = list.length; i < length; i++) {                                                         // 1525
        wrapperList[i] = wrap(list[i]);                                                                                // 1526
      }                                                                                                                // 1527
      wrapperList.length = length;                                                                                     // 1528
      return wrapperList;                                                                                              // 1529
    }                                                                                                                  // 1530
    function addWrapNodeListMethod(wrapperConstructor, name) {                                                         // 1531
      wrapperConstructor.prototype[name] = function() {                                                                // 1532
        return wrapNodeList(unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments));                            // 1533
      };                                                                                                               // 1534
    }                                                                                                                  // 1535
    scope.wrappers.NodeList = NodeList;                                                                                // 1536
    scope.addWrapNodeListMethod = addWrapNodeListMethod;                                                               // 1537
    scope.wrapNodeList = wrapNodeList;                                                                                 // 1538
  })(window.ShadowDOMPolyfill);                                                                                        // 1539
  (function(scope) {                                                                                                   // 1540
    "use strict";                                                                                                      // 1541
    scope.wrapHTMLCollection = scope.wrapNodeList;                                                                     // 1542
    scope.wrappers.HTMLCollection = scope.wrappers.NodeList;                                                           // 1543
  })(window.ShadowDOMPolyfill);                                                                                        // 1544
  (function(scope) {                                                                                                   // 1545
    "use strict";                                                                                                      // 1546
    var EventTarget = scope.wrappers.EventTarget;                                                                      // 1547
    var NodeList = scope.wrappers.NodeList;                                                                            // 1548
    var TreeScope = scope.TreeScope;                                                                                   // 1549
    var assert = scope.assert;                                                                                         // 1550
    var defineWrapGetter = scope.defineWrapGetter;                                                                     // 1551
    var enqueueMutation = scope.enqueueMutation;                                                                       // 1552
    var getTreeScope = scope.getTreeScope;                                                                             // 1553
    var isWrapper = scope.isWrapper;                                                                                   // 1554
    var mixin = scope.mixin;                                                                                           // 1555
    var registerTransientObservers = scope.registerTransientObservers;                                                 // 1556
    var registerWrapper = scope.registerWrapper;                                                                       // 1557
    var setTreeScope = scope.setTreeScope;                                                                             // 1558
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 1559
    var unwrap = scope.unwrap;                                                                                         // 1560
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 1561
    var wrap = scope.wrap;                                                                                             // 1562
    var wrapIfNeeded = scope.wrapIfNeeded;                                                                             // 1563
    var wrappers = scope.wrappers;                                                                                     // 1564
    function assertIsNodeWrapper(node) {                                                                               // 1565
      assert(node instanceof Node);                                                                                    // 1566
    }                                                                                                                  // 1567
    function createOneElementNodeList(node) {                                                                          // 1568
      var nodes = new NodeList();                                                                                      // 1569
      nodes[0] = node;                                                                                                 // 1570
      nodes.length = 1;                                                                                                // 1571
      return nodes;                                                                                                    // 1572
    }                                                                                                                  // 1573
    var surpressMutations = false;                                                                                     // 1574
    function enqueueRemovalForInsertedNodes(node, parent, nodes) {                                                     // 1575
      enqueueMutation(parent, "childList", {                                                                           // 1576
        removedNodes: nodes,                                                                                           // 1577
        previousSibling: node.previousSibling,                                                                         // 1578
        nextSibling: node.nextSibling                                                                                  // 1579
      });                                                                                                              // 1580
    }                                                                                                                  // 1581
    function enqueueRemovalForInsertedDocumentFragment(df, nodes) {                                                    // 1582
      enqueueMutation(df, "childList", {                                                                               // 1583
        removedNodes: nodes                                                                                            // 1584
      });                                                                                                              // 1585
    }                                                                                                                  // 1586
    function collectNodes(node, parentNode, previousNode, nextNode) {                                                  // 1587
      if (node instanceof DocumentFragment) {                                                                          // 1588
        var nodes = collectNodesForDocumentFragment(node);                                                             // 1589
        surpressMutations = true;                                                                                      // 1590
        for (var i = nodes.length - 1; i >= 0; i--) {                                                                  // 1591
          node.removeChild(nodes[i]);                                                                                  // 1592
          nodes[i].parentNode_ = parentNode;                                                                           // 1593
        }                                                                                                              // 1594
        surpressMutations = false;                                                                                     // 1595
        for (var i = 0; i < nodes.length; i++) {                                                                       // 1596
          nodes[i].previousSibling_ = nodes[i - 1] || previousNode;                                                    // 1597
          nodes[i].nextSibling_ = nodes[i + 1] || nextNode;                                                            // 1598
        }                                                                                                              // 1599
        if (previousNode) previousNode.nextSibling_ = nodes[0];                                                        // 1600
        if (nextNode) nextNode.previousSibling_ = nodes[nodes.length - 1];                                             // 1601
        return nodes;                                                                                                  // 1602
      }                                                                                                                // 1603
      var nodes = createOneElementNodeList(node);                                                                      // 1604
      var oldParent = node.parentNode;                                                                                 // 1605
      if (oldParent) {                                                                                                 // 1606
        oldParent.removeChild(node);                                                                                   // 1607
      }                                                                                                                // 1608
      node.parentNode_ = parentNode;                                                                                   // 1609
      node.previousSibling_ = previousNode;                                                                            // 1610
      node.nextSibling_ = nextNode;                                                                                    // 1611
      if (previousNode) previousNode.nextSibling_ = node;                                                              // 1612
      if (nextNode) nextNode.previousSibling_ = node;                                                                  // 1613
      return nodes;                                                                                                    // 1614
    }                                                                                                                  // 1615
    function collectNodesNative(node) {                                                                                // 1616
      if (node instanceof DocumentFragment) return collectNodesForDocumentFragment(node);                              // 1617
      var nodes = createOneElementNodeList(node);                                                                      // 1618
      var oldParent = node.parentNode;                                                                                 // 1619
      if (oldParent) enqueueRemovalForInsertedNodes(node, oldParent, nodes);                                           // 1620
      return nodes;                                                                                                    // 1621
    }                                                                                                                  // 1622
    function collectNodesForDocumentFragment(node) {                                                                   // 1623
      var nodes = new NodeList();                                                                                      // 1624
      var i = 0;                                                                                                       // 1625
      for (var child = node.firstChild; child; child = child.nextSibling) {                                            // 1626
        nodes[i++] = child;                                                                                            // 1627
      }                                                                                                                // 1628
      nodes.length = i;                                                                                                // 1629
      enqueueRemovalForInsertedDocumentFragment(node, nodes);                                                          // 1630
      return nodes;                                                                                                    // 1631
    }                                                                                                                  // 1632
    function snapshotNodeList(nodeList) {                                                                              // 1633
      return nodeList;                                                                                                 // 1634
    }                                                                                                                  // 1635
    function nodeWasAdded(node, treeScope) {                                                                           // 1636
      setTreeScope(node, treeScope);                                                                                   // 1637
      node.nodeIsInserted_();                                                                                          // 1638
    }                                                                                                                  // 1639
    function nodesWereAdded(nodes, parent) {                                                                           // 1640
      var treeScope = getTreeScope(parent);                                                                            // 1641
      for (var i = 0; i < nodes.length; i++) {                                                                         // 1642
        nodeWasAdded(nodes[i], treeScope);                                                                             // 1643
      }                                                                                                                // 1644
    }                                                                                                                  // 1645
    function nodeWasRemoved(node) {                                                                                    // 1646
      setTreeScope(node, new TreeScope(node, null));                                                                   // 1647
    }                                                                                                                  // 1648
    function nodesWereRemoved(nodes) {                                                                                 // 1649
      for (var i = 0; i < nodes.length; i++) {                                                                         // 1650
        nodeWasRemoved(nodes[i]);                                                                                      // 1651
      }                                                                                                                // 1652
    }                                                                                                                  // 1653
    function ensureSameOwnerDocument(parent, child) {                                                                  // 1654
      var ownerDoc = parent.nodeType === Node.DOCUMENT_NODE ? parent : parent.ownerDocument;                           // 1655
      if (ownerDoc !== child.ownerDocument) ownerDoc.adoptNode(child);                                                 // 1656
    }                                                                                                                  // 1657
    function adoptNodesIfNeeded(owner, nodes) {                                                                        // 1658
      if (!nodes.length) return;                                                                                       // 1659
      var ownerDoc = owner.ownerDocument;                                                                              // 1660
      if (ownerDoc === nodes[0].ownerDocument) return;                                                                 // 1661
      for (var i = 0; i < nodes.length; i++) {                                                                         // 1662
        scope.adoptNodeNoRemove(nodes[i], ownerDoc);                                                                   // 1663
      }                                                                                                                // 1664
    }                                                                                                                  // 1665
    function unwrapNodesForInsertion(owner, nodes) {                                                                   // 1666
      adoptNodesIfNeeded(owner, nodes);                                                                                // 1667
      var length = nodes.length;                                                                                       // 1668
      if (length === 1) return unwrap(nodes[0]);                                                                       // 1669
      var df = unwrap(owner.ownerDocument.createDocumentFragment());                                                   // 1670
      for (var i = 0; i < length; i++) {                                                                               // 1671
        df.appendChild(unwrap(nodes[i]));                                                                              // 1672
      }                                                                                                                // 1673
      return df;                                                                                                       // 1674
    }                                                                                                                  // 1675
    function clearChildNodes(wrapper) {                                                                                // 1676
      if (wrapper.firstChild_ !== undefined) {                                                                         // 1677
        var child = wrapper.firstChild_;                                                                               // 1678
        while (child) {                                                                                                // 1679
          var tmp = child;                                                                                             // 1680
          child = child.nextSibling_;                                                                                  // 1681
          tmp.parentNode_ = tmp.previousSibling_ = tmp.nextSibling_ = undefined;                                       // 1682
        }                                                                                                              // 1683
      }                                                                                                                // 1684
      wrapper.firstChild_ = wrapper.lastChild_ = undefined;                                                            // 1685
    }                                                                                                                  // 1686
    function removeAllChildNodes(wrapper) {                                                                            // 1687
      if (wrapper.invalidateShadowRenderer()) {                                                                        // 1688
        var childWrapper = wrapper.firstChild;                                                                         // 1689
        while (childWrapper) {                                                                                         // 1690
          assert(childWrapper.parentNode === wrapper);                                                                 // 1691
          var nextSibling = childWrapper.nextSibling;                                                                  // 1692
          var childNode = unwrap(childWrapper);                                                                        // 1693
          var parentNode = childNode.parentNode;                                                                       // 1694
          if (parentNode) originalRemoveChild.call(parentNode, childNode);                                             // 1695
          childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = null;                 // 1696
          childWrapper = nextSibling;                                                                                  // 1697
        }                                                                                                              // 1698
        wrapper.firstChild_ = wrapper.lastChild_ = null;                                                               // 1699
      } else {                                                                                                         // 1700
        var node = unwrap(wrapper);                                                                                    // 1701
        var child = node.firstChild;                                                                                   // 1702
        var nextSibling;                                                                                               // 1703
        while (child) {                                                                                                // 1704
          nextSibling = child.nextSibling;                                                                             // 1705
          originalRemoveChild.call(node, child);                                                                       // 1706
          child = nextSibling;                                                                                         // 1707
        }                                                                                                              // 1708
      }                                                                                                                // 1709
    }                                                                                                                  // 1710
    function invalidateParent(node) {                                                                                  // 1711
      var p = node.parentNode;                                                                                         // 1712
      return p && p.invalidateShadowRenderer();                                                                        // 1713
    }                                                                                                                  // 1714
    function cleanupNodes(nodes) {                                                                                     // 1715
      for (var i = 0, n; i < nodes.length; i++) {                                                                      // 1716
        n = nodes[i];                                                                                                  // 1717
        n.parentNode.removeChild(n);                                                                                   // 1718
      }                                                                                                                // 1719
    }                                                                                                                  // 1720
    var originalImportNode = document.importNode;                                                                      // 1721
    var originalCloneNode = window.Node.prototype.cloneNode;                                                           // 1722
    function cloneNode(node, deep, opt_doc) {                                                                          // 1723
      var clone;                                                                                                       // 1724
      if (opt_doc) clone = wrap(originalImportNode.call(opt_doc, unsafeUnwrap(node), false)); else clone = wrap(originalCloneNode.call(unsafeUnwrap(node), false));
      if (deep) {                                                                                                      // 1726
        for (var child = node.firstChild; child; child = child.nextSibling) {                                          // 1727
          clone.appendChild(cloneNode(child, true, opt_doc));                                                          // 1728
        }                                                                                                              // 1729
        if (node instanceof wrappers.HTMLTemplateElement) {                                                            // 1730
          var cloneContent = clone.content;                                                                            // 1731
          for (var child = node.content.firstChild; child; child = child.nextSibling) {                                // 1732
            cloneContent.appendChild(cloneNode(child, true, opt_doc));                                                 // 1733
          }                                                                                                            // 1734
        }                                                                                                              // 1735
      }                                                                                                                // 1736
      return clone;                                                                                                    // 1737
    }                                                                                                                  // 1738
    function contains(self, child) {                                                                                   // 1739
      if (!child || getTreeScope(self) !== getTreeScope(child)) return false;                                          // 1740
      for (var node = child; node; node = node.parentNode) {                                                           // 1741
        if (node === self) return true;                                                                                // 1742
      }                                                                                                                // 1743
      return false;                                                                                                    // 1744
    }                                                                                                                  // 1745
    var OriginalNode = window.Node;                                                                                    // 1746
    function Node(original) {                                                                                          // 1747
      assert(original instanceof OriginalNode);                                                                        // 1748
      EventTarget.call(this, original);                                                                                // 1749
      this.parentNode_ = undefined;                                                                                    // 1750
      this.firstChild_ = undefined;                                                                                    // 1751
      this.lastChild_ = undefined;                                                                                     // 1752
      this.nextSibling_ = undefined;                                                                                   // 1753
      this.previousSibling_ = undefined;                                                                               // 1754
      this.treeScope_ = undefined;                                                                                     // 1755
    }                                                                                                                  // 1756
    var OriginalDocumentFragment = window.DocumentFragment;                                                            // 1757
    var originalAppendChild = OriginalNode.prototype.appendChild;                                                      // 1758
    var originalCompareDocumentPosition = OriginalNode.prototype.compareDocumentPosition;                              // 1759
    var originalInsertBefore = OriginalNode.prototype.insertBefore;                                                    // 1760
    var originalRemoveChild = OriginalNode.prototype.removeChild;                                                      // 1761
    var originalReplaceChild = OriginalNode.prototype.replaceChild;                                                    // 1762
    var isIe = /Trident/.test(navigator.userAgent);                                                                    // 1763
    var removeChildOriginalHelper = isIe ? function(parent, child) {                                                   // 1764
      try {                                                                                                            // 1765
        originalRemoveChild.call(parent, child);                                                                       // 1766
      } catch (ex) {                                                                                                   // 1767
        if (!(parent instanceof OriginalDocumentFragment)) throw ex;                                                   // 1768
      }                                                                                                                // 1769
    } : function(parent, child) {                                                                                      // 1770
      originalRemoveChild.call(parent, child);                                                                         // 1771
    };                                                                                                                 // 1772
    Node.prototype = Object.create(EventTarget.prototype);                                                             // 1773
    mixin(Node.prototype, {                                                                                            // 1774
      appendChild: function(childWrapper) {                                                                            // 1775
        return this.insertBefore(childWrapper, null);                                                                  // 1776
      },                                                                                                               // 1777
      insertBefore: function(childWrapper, refWrapper) {                                                               // 1778
        assertIsNodeWrapper(childWrapper);                                                                             // 1779
        var refNode;                                                                                                   // 1780
        if (refWrapper) {                                                                                              // 1781
          if (isWrapper(refWrapper)) {                                                                                 // 1782
            refNode = unwrap(refWrapper);                                                                              // 1783
          } else {                                                                                                     // 1784
            refNode = refWrapper;                                                                                      // 1785
            refWrapper = wrap(refNode);                                                                                // 1786
          }                                                                                                            // 1787
        } else {                                                                                                       // 1788
          refWrapper = null;                                                                                           // 1789
          refNode = null;                                                                                              // 1790
        }                                                                                                              // 1791
        refWrapper && assert(refWrapper.parentNode === this);                                                          // 1792
        var nodes;                                                                                                     // 1793
        var previousNode = refWrapper ? refWrapper.previousSibling : this.lastChild;                                   // 1794
        var useNative = !this.invalidateShadowRenderer() && !invalidateParent(childWrapper);                           // 1795
        if (useNative) nodes = collectNodesNative(childWrapper); else nodes = collectNodes(childWrapper, this, previousNode, refWrapper);
        if (useNative) {                                                                                               // 1797
          ensureSameOwnerDocument(this, childWrapper);                                                                 // 1798
          clearChildNodes(this);                                                                                       // 1799
          originalInsertBefore.call(unsafeUnwrap(this), unwrap(childWrapper), refNode);                                // 1800
        } else {                                                                                                       // 1801
          if (!previousNode) this.firstChild_ = nodes[0];                                                              // 1802
          if (!refWrapper) {                                                                                           // 1803
            this.lastChild_ = nodes[nodes.length - 1];                                                                 // 1804
            if (this.firstChild_ === undefined) this.firstChild_ = this.firstChild;                                    // 1805
          }                                                                                                            // 1806
          var parentNode = refNode ? refNode.parentNode : unsafeUnwrap(this);                                          // 1807
          if (parentNode) {                                                                                            // 1808
            originalInsertBefore.call(parentNode, unwrapNodesForInsertion(this, nodes), refNode);                      // 1809
          } else {                                                                                                     // 1810
            adoptNodesIfNeeded(this, nodes);                                                                           // 1811
          }                                                                                                            // 1812
        }                                                                                                              // 1813
        enqueueMutation(this, "childList", {                                                                           // 1814
          addedNodes: nodes,                                                                                           // 1815
          nextSibling: refWrapper,                                                                                     // 1816
          previousSibling: previousNode                                                                                // 1817
        });                                                                                                            // 1818
        nodesWereAdded(nodes, this);                                                                                   // 1819
        return childWrapper;                                                                                           // 1820
      },                                                                                                               // 1821
      removeChild: function(childWrapper) {                                                                            // 1822
        assertIsNodeWrapper(childWrapper);                                                                             // 1823
        if (childWrapper.parentNode !== this) {                                                                        // 1824
          var found = false;                                                                                           // 1825
          var childNodes = this.childNodes;                                                                            // 1826
          for (var ieChild = this.firstChild; ieChild; ieChild = ieChild.nextSibling) {                                // 1827
            if (ieChild === childWrapper) {                                                                            // 1828
              found = true;                                                                                            // 1829
              break;                                                                                                   // 1830
            }                                                                                                          // 1831
          }                                                                                                            // 1832
          if (!found) {                                                                                                // 1833
            throw new Error("NotFoundError");                                                                          // 1834
          }                                                                                                            // 1835
        }                                                                                                              // 1836
        var childNode = unwrap(childWrapper);                                                                          // 1837
        var childWrapperNextSibling = childWrapper.nextSibling;                                                        // 1838
        var childWrapperPreviousSibling = childWrapper.previousSibling;                                                // 1839
        if (this.invalidateShadowRenderer()) {                                                                         // 1840
          var thisFirstChild = this.firstChild;                                                                        // 1841
          var thisLastChild = this.lastChild;                                                                          // 1842
          var parentNode = childNode.parentNode;                                                                       // 1843
          if (parentNode) removeChildOriginalHelper(parentNode, childNode);                                            // 1844
          if (thisFirstChild === childWrapper) this.firstChild_ = childWrapperNextSibling;                             // 1845
          if (thisLastChild === childWrapper) this.lastChild_ = childWrapperPreviousSibling;                           // 1846
          if (childWrapperPreviousSibling) childWrapperPreviousSibling.nextSibling_ = childWrapperNextSibling;         // 1847
          if (childWrapperNextSibling) {                                                                               // 1848
            childWrapperNextSibling.previousSibling_ = childWrapperPreviousSibling;                                    // 1849
          }                                                                                                            // 1850
          childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = undefined;            // 1851
        } else {                                                                                                       // 1852
          clearChildNodes(this);                                                                                       // 1853
          removeChildOriginalHelper(unsafeUnwrap(this), childNode);                                                    // 1854
        }                                                                                                              // 1855
        if (!surpressMutations) {                                                                                      // 1856
          enqueueMutation(this, "childList", {                                                                         // 1857
            removedNodes: createOneElementNodeList(childWrapper),                                                      // 1858
            nextSibling: childWrapperNextSibling,                                                                      // 1859
            previousSibling: childWrapperPreviousSibling                                                               // 1860
          });                                                                                                          // 1861
        }                                                                                                              // 1862
        registerTransientObservers(this, childWrapper);                                                                // 1863
        return childWrapper;                                                                                           // 1864
      },                                                                                                               // 1865
      replaceChild: function(newChildWrapper, oldChildWrapper) {                                                       // 1866
        assertIsNodeWrapper(newChildWrapper);                                                                          // 1867
        var oldChildNode;                                                                                              // 1868
        if (isWrapper(oldChildWrapper)) {                                                                              // 1869
          oldChildNode = unwrap(oldChildWrapper);                                                                      // 1870
        } else {                                                                                                       // 1871
          oldChildNode = oldChildWrapper;                                                                              // 1872
          oldChildWrapper = wrap(oldChildNode);                                                                        // 1873
        }                                                                                                              // 1874
        if (oldChildWrapper.parentNode !== this) {                                                                     // 1875
          throw new Error("NotFoundError");                                                                            // 1876
        }                                                                                                              // 1877
        var nextNode = oldChildWrapper.nextSibling;                                                                    // 1878
        var previousNode = oldChildWrapper.previousSibling;                                                            // 1879
        var nodes;                                                                                                     // 1880
        var useNative = !this.invalidateShadowRenderer() && !invalidateParent(newChildWrapper);                        // 1881
        if (useNative) {                                                                                               // 1882
          nodes = collectNodesNative(newChildWrapper);                                                                 // 1883
        } else {                                                                                                       // 1884
          if (nextNode === newChildWrapper) nextNode = newChildWrapper.nextSibling;                                    // 1885
          nodes = collectNodes(newChildWrapper, this, previousNode, nextNode);                                         // 1886
        }                                                                                                              // 1887
        if (!useNative) {                                                                                              // 1888
          if (this.firstChild === oldChildWrapper) this.firstChild_ = nodes[0];                                        // 1889
          if (this.lastChild === oldChildWrapper) this.lastChild_ = nodes[nodes.length - 1];                           // 1890
          oldChildWrapper.previousSibling_ = oldChildWrapper.nextSibling_ = oldChildWrapper.parentNode_ = undefined;   // 1891
          if (oldChildNode.parentNode) {                                                                               // 1892
            originalReplaceChild.call(oldChildNode.parentNode, unwrapNodesForInsertion(this, nodes), oldChildNode);    // 1893
          }                                                                                                            // 1894
        } else {                                                                                                       // 1895
          ensureSameOwnerDocument(this, newChildWrapper);                                                              // 1896
          clearChildNodes(this);                                                                                       // 1897
          originalReplaceChild.call(unsafeUnwrap(this), unwrap(newChildWrapper), oldChildNode);                        // 1898
        }                                                                                                              // 1899
        enqueueMutation(this, "childList", {                                                                           // 1900
          addedNodes: nodes,                                                                                           // 1901
          removedNodes: createOneElementNodeList(oldChildWrapper),                                                     // 1902
          nextSibling: nextNode,                                                                                       // 1903
          previousSibling: previousNode                                                                                // 1904
        });                                                                                                            // 1905
        nodeWasRemoved(oldChildWrapper);                                                                               // 1906
        nodesWereAdded(nodes, this);                                                                                   // 1907
        return oldChildWrapper;                                                                                        // 1908
      },                                                                                                               // 1909
      nodeIsInserted_: function() {                                                                                    // 1910
        for (var child = this.firstChild; child; child = child.nextSibling) {                                          // 1911
          child.nodeIsInserted_();                                                                                     // 1912
        }                                                                                                              // 1913
      },                                                                                                               // 1914
      hasChildNodes: function() {                                                                                      // 1915
        return this.firstChild !== null;                                                                               // 1916
      },                                                                                                               // 1917
      get parentNode() {                                                                                               // 1918
        return this.parentNode_ !== undefined ? this.parentNode_ : wrap(unsafeUnwrap(this).parentNode);                // 1919
      },                                                                                                               // 1920
      get firstChild() {                                                                                               // 1921
        return this.firstChild_ !== undefined ? this.firstChild_ : wrap(unsafeUnwrap(this).firstChild);                // 1922
      },                                                                                                               // 1923
      get lastChild() {                                                                                                // 1924
        return this.lastChild_ !== undefined ? this.lastChild_ : wrap(unsafeUnwrap(this).lastChild);                   // 1925
      },                                                                                                               // 1926
      get nextSibling() {                                                                                              // 1927
        return this.nextSibling_ !== undefined ? this.nextSibling_ : wrap(unsafeUnwrap(this).nextSibling);             // 1928
      },                                                                                                               // 1929
      get previousSibling() {                                                                                          // 1930
        return this.previousSibling_ !== undefined ? this.previousSibling_ : wrap(unsafeUnwrap(this).previousSibling); // 1931
      },                                                                                                               // 1932
      get parentElement() {                                                                                            // 1933
        var p = this.parentNode;                                                                                       // 1934
        while (p && p.nodeType !== Node.ELEMENT_NODE) {                                                                // 1935
          p = p.parentNode;                                                                                            // 1936
        }                                                                                                              // 1937
        return p;                                                                                                      // 1938
      },                                                                                                               // 1939
      get textContent() {                                                                                              // 1940
        var s = "";                                                                                                    // 1941
        for (var child = this.firstChild; child; child = child.nextSibling) {                                          // 1942
          if (child.nodeType != Node.COMMENT_NODE) {                                                                   // 1943
            s += child.textContent;                                                                                    // 1944
          }                                                                                                            // 1945
        }                                                                                                              // 1946
        return s;                                                                                                      // 1947
      },                                                                                                               // 1948
      set textContent(textContent) {                                                                                   // 1949
        if (textContent == null) textContent = "";                                                                     // 1950
        var removedNodes = snapshotNodeList(this.childNodes);                                                          // 1951
        if (this.invalidateShadowRenderer()) {                                                                         // 1952
          removeAllChildNodes(this);                                                                                   // 1953
          if (textContent !== "") {                                                                                    // 1954
            var textNode = unsafeUnwrap(this).ownerDocument.createTextNode(textContent);                               // 1955
            this.appendChild(textNode);                                                                                // 1956
          }                                                                                                            // 1957
        } else {                                                                                                       // 1958
          clearChildNodes(this);                                                                                       // 1959
          unsafeUnwrap(this).textContent = textContent;                                                                // 1960
        }                                                                                                              // 1961
        var addedNodes = snapshotNodeList(this.childNodes);                                                            // 1962
        enqueueMutation(this, "childList", {                                                                           // 1963
          addedNodes: addedNodes,                                                                                      // 1964
          removedNodes: removedNodes                                                                                   // 1965
        });                                                                                                            // 1966
        nodesWereRemoved(removedNodes);                                                                                // 1967
        nodesWereAdded(addedNodes, this);                                                                              // 1968
      },                                                                                                               // 1969
      get childNodes() {                                                                                               // 1970
        var wrapperList = new NodeList();                                                                              // 1971
        var i = 0;                                                                                                     // 1972
        for (var child = this.firstChild; child; child = child.nextSibling) {                                          // 1973
          wrapperList[i++] = child;                                                                                    // 1974
        }                                                                                                              // 1975
        wrapperList.length = i;                                                                                        // 1976
        return wrapperList;                                                                                            // 1977
      },                                                                                                               // 1978
      cloneNode: function(deep) {                                                                                      // 1979
        return cloneNode(this, deep);                                                                                  // 1980
      },                                                                                                               // 1981
      contains: function(child) {                                                                                      // 1982
        return contains(this, wrapIfNeeded(child));                                                                    // 1983
      },                                                                                                               // 1984
      compareDocumentPosition: function(otherNode) {                                                                   // 1985
        return originalCompareDocumentPosition.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));                    // 1986
      },                                                                                                               // 1987
      normalize: function() {                                                                                          // 1988
        var nodes = snapshotNodeList(this.childNodes);                                                                 // 1989
        var remNodes = [];                                                                                             // 1990
        var s = "";                                                                                                    // 1991
        var modNode;                                                                                                   // 1992
        for (var i = 0, n; i < nodes.length; i++) {                                                                    // 1993
          n = nodes[i];                                                                                                // 1994
          if (n.nodeType === Node.TEXT_NODE) {                                                                         // 1995
            if (!modNode && !n.data.length) this.removeNode(n); else if (!modNode) modNode = n; else {                 // 1996
              s += n.data;                                                                                             // 1997
              remNodes.push(n);                                                                                        // 1998
            }                                                                                                          // 1999
          } else {                                                                                                     // 2000
            if (modNode && remNodes.length) {                                                                          // 2001
              modNode.data += s;                                                                                       // 2002
              cleanupNodes(remNodes);                                                                                  // 2003
            }                                                                                                          // 2004
            remNodes = [];                                                                                             // 2005
            s = "";                                                                                                    // 2006
            modNode = null;                                                                                            // 2007
            if (n.childNodes.length) n.normalize();                                                                    // 2008
          }                                                                                                            // 2009
        }                                                                                                              // 2010
        if (modNode && remNodes.length) {                                                                              // 2011
          modNode.data += s;                                                                                           // 2012
          cleanupNodes(remNodes);                                                                                      // 2013
        }                                                                                                              // 2014
      }                                                                                                                // 2015
    });                                                                                                                // 2016
    defineWrapGetter(Node, "ownerDocument");                                                                           // 2017
    registerWrapper(OriginalNode, Node, document.createDocumentFragment());                                            // 2018
    delete Node.prototype.querySelector;                                                                               // 2019
    delete Node.prototype.querySelectorAll;                                                                            // 2020
    Node.prototype = mixin(Object.create(EventTarget.prototype), Node.prototype);                                      // 2021
    scope.cloneNode = cloneNode;                                                                                       // 2022
    scope.nodeWasAdded = nodeWasAdded;                                                                                 // 2023
    scope.nodeWasRemoved = nodeWasRemoved;                                                                             // 2024
    scope.nodesWereAdded = nodesWereAdded;                                                                             // 2025
    scope.nodesWereRemoved = nodesWereRemoved;                                                                         // 2026
    scope.originalInsertBefore = originalInsertBefore;                                                                 // 2027
    scope.originalRemoveChild = originalRemoveChild;                                                                   // 2028
    scope.snapshotNodeList = snapshotNodeList;                                                                         // 2029
    scope.wrappers.Node = Node;                                                                                        // 2030
  })(window.ShadowDOMPolyfill);                                                                                        // 2031
  (function(scope) {                                                                                                   // 2032
    "use strict";                                                                                                      // 2033
    var HTMLCollection = scope.wrappers.HTMLCollection;                                                                // 2034
    var NodeList = scope.wrappers.NodeList;                                                                            // 2035
    var getTreeScope = scope.getTreeScope;                                                                             // 2036
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2037
    var wrap = scope.wrap;                                                                                             // 2038
    var originalDocumentQuerySelector = document.querySelector;                                                        // 2039
    var originalElementQuerySelector = document.documentElement.querySelector;                                         // 2040
    var originalDocumentQuerySelectorAll = document.querySelectorAll;                                                  // 2041
    var originalElementQuerySelectorAll = document.documentElement.querySelectorAll;                                   // 2042
    var originalDocumentGetElementsByTagName = document.getElementsByTagName;                                          // 2043
    var originalElementGetElementsByTagName = document.documentElement.getElementsByTagName;                           // 2044
    var originalDocumentGetElementsByTagNameNS = document.getElementsByTagNameNS;                                      // 2045
    var originalElementGetElementsByTagNameNS = document.documentElement.getElementsByTagNameNS;                       // 2046
    var OriginalElement = window.Element;                                                                              // 2047
    var OriginalDocument = window.HTMLDocument || window.Document;                                                     // 2048
    function filterNodeList(list, index, result, deep) {                                                               // 2049
      var wrappedItem = null;                                                                                          // 2050
      var root = null;                                                                                                 // 2051
      for (var i = 0, length = list.length; i < length; i++) {                                                         // 2052
        wrappedItem = wrap(list[i]);                                                                                   // 2053
        if (!deep && (root = getTreeScope(wrappedItem).root)) {                                                        // 2054
          if (root instanceof scope.wrappers.ShadowRoot) {                                                             // 2055
            continue;                                                                                                  // 2056
          }                                                                                                            // 2057
        }                                                                                                              // 2058
        result[index++] = wrappedItem;                                                                                 // 2059
      }                                                                                                                // 2060
      return index;                                                                                                    // 2061
    }                                                                                                                  // 2062
    function shimSelector(selector) {                                                                                  // 2063
      return String(selector).replace(/\/deep\//g, " ");                                                               // 2064
    }                                                                                                                  // 2065
    function findOne(node, selector) {                                                                                 // 2066
      var m, el = node.firstElementChild;                                                                              // 2067
      while (el) {                                                                                                     // 2068
        if (el.matches(selector)) return el;                                                                           // 2069
        m = findOne(el, selector);                                                                                     // 2070
        if (m) return m;                                                                                               // 2071
        el = el.nextElementSibling;                                                                                    // 2072
      }                                                                                                                // 2073
      return null;                                                                                                     // 2074
    }                                                                                                                  // 2075
    function matchesSelector(el, selector) {                                                                           // 2076
      return el.matches(selector);                                                                                     // 2077
    }                                                                                                                  // 2078
    var XHTML_NS = "http://www.w3.org/1999/xhtml";                                                                     // 2079
    function matchesTagName(el, localName, localNameLowerCase) {                                                       // 2080
      var ln = el.localName;                                                                                           // 2081
      return ln === localName || ln === localNameLowerCase && el.namespaceURI === XHTML_NS;                            // 2082
    }                                                                                                                  // 2083
    function matchesEveryThing() {                                                                                     // 2084
      return true;                                                                                                     // 2085
    }                                                                                                                  // 2086
    function matchesLocalNameOnly(el, ns, localName) {                                                                 // 2087
      return el.localName === localName;                                                                               // 2088
    }                                                                                                                  // 2089
    function matchesNameSpace(el, ns) {                                                                                // 2090
      return el.namespaceURI === ns;                                                                                   // 2091
    }                                                                                                                  // 2092
    function matchesLocalNameNS(el, ns, localName) {                                                                   // 2093
      return el.namespaceURI === ns && el.localName === localName;                                                     // 2094
    }                                                                                                                  // 2095
    function findElements(node, index, result, p, arg0, arg1) {                                                        // 2096
      var el = node.firstElementChild;                                                                                 // 2097
      while (el) {                                                                                                     // 2098
        if (p(el, arg0, arg1)) result[index++] = el;                                                                   // 2099
        index = findElements(el, index, result, p, arg0, arg1);                                                        // 2100
        el = el.nextElementSibling;                                                                                    // 2101
      }                                                                                                                // 2102
      return index;                                                                                                    // 2103
    }                                                                                                                  // 2104
    function querySelectorAllFiltered(p, index, result, selector, deep) {                                              // 2105
      var target = unsafeUnwrap(this);                                                                                 // 2106
      var list;                                                                                                        // 2107
      var root = getTreeScope(this).root;                                                                              // 2108
      if (root instanceof scope.wrappers.ShadowRoot) {                                                                 // 2109
        return findElements(this, index, result, p, selector, null);                                                   // 2110
      } else if (target instanceof OriginalElement) {                                                                  // 2111
        list = originalElementQuerySelectorAll.call(target, selector);                                                 // 2112
      } else if (target instanceof OriginalDocument) {                                                                 // 2113
        list = originalDocumentQuerySelectorAll.call(target, selector);                                                // 2114
      } else {                                                                                                         // 2115
        return findElements(this, index, result, p, selector, null);                                                   // 2116
      }                                                                                                                // 2117
      return filterNodeList(list, index, result, deep);                                                                // 2118
    }                                                                                                                  // 2119
    var SelectorsInterface = {                                                                                         // 2120
      querySelector: function(selector) {                                                                              // 2121
        var shimmed = shimSelector(selector);                                                                          // 2122
        var deep = shimmed !== selector;                                                                               // 2123
        selector = shimmed;                                                                                            // 2124
        var target = unsafeUnwrap(this);                                                                               // 2125
        var wrappedItem;                                                                                               // 2126
        var root = getTreeScope(this).root;                                                                            // 2127
        if (root instanceof scope.wrappers.ShadowRoot) {                                                               // 2128
          return findOne(this, selector);                                                                              // 2129
        } else if (target instanceof OriginalElement) {                                                                // 2130
          wrappedItem = wrap(originalElementQuerySelector.call(target, selector));                                     // 2131
        } else if (target instanceof OriginalDocument) {                                                               // 2132
          wrappedItem = wrap(originalDocumentQuerySelector.call(target, selector));                                    // 2133
        } else {                                                                                                       // 2134
          return findOne(this, selector);                                                                              // 2135
        }                                                                                                              // 2136
        if (!wrappedItem) {                                                                                            // 2137
          return wrappedItem;                                                                                          // 2138
        } else if (!deep && (root = getTreeScope(wrappedItem).root)) {                                                 // 2139
          if (root instanceof scope.wrappers.ShadowRoot) {                                                             // 2140
            return findOne(this, selector);                                                                            // 2141
          }                                                                                                            // 2142
        }                                                                                                              // 2143
        return wrappedItem;                                                                                            // 2144
      },                                                                                                               // 2145
      querySelectorAll: function(selector) {                                                                           // 2146
        var shimmed = shimSelector(selector);                                                                          // 2147
        var deep = shimmed !== selector;                                                                               // 2148
        selector = shimmed;                                                                                            // 2149
        var result = new NodeList();                                                                                   // 2150
        result.length = querySelectorAllFiltered.call(this, matchesSelector, 0, result, selector, deep);               // 2151
        return result;                                                                                                 // 2152
      }                                                                                                                // 2153
    };                                                                                                                 // 2154
    function getElementsByTagNameFiltered(p, index, result, localName, lowercase) {                                    // 2155
      var target = unsafeUnwrap(this);                                                                                 // 2156
      var list;                                                                                                        // 2157
      var root = getTreeScope(this).root;                                                                              // 2158
      if (root instanceof scope.wrappers.ShadowRoot) {                                                                 // 2159
        return findElements(this, index, result, p, localName, lowercase);                                             // 2160
      } else if (target instanceof OriginalElement) {                                                                  // 2161
        list = originalElementGetElementsByTagName.call(target, localName, lowercase);                                 // 2162
      } else if (target instanceof OriginalDocument) {                                                                 // 2163
        list = originalDocumentGetElementsByTagName.call(target, localName, lowercase);                                // 2164
      } else {                                                                                                         // 2165
        return findElements(this, index, result, p, localName, lowercase);                                             // 2166
      }                                                                                                                // 2167
      return filterNodeList(list, index, result, false);                                                               // 2168
    }                                                                                                                  // 2169
    function getElementsByTagNameNSFiltered(p, index, result, ns, localName) {                                         // 2170
      var target = unsafeUnwrap(this);                                                                                 // 2171
      var list;                                                                                                        // 2172
      var root = getTreeScope(this).root;                                                                              // 2173
      if (root instanceof scope.wrappers.ShadowRoot) {                                                                 // 2174
        return findElements(this, index, result, p, ns, localName);                                                    // 2175
      } else if (target instanceof OriginalElement) {                                                                  // 2176
        list = originalElementGetElementsByTagNameNS.call(target, ns, localName);                                      // 2177
      } else if (target instanceof OriginalDocument) {                                                                 // 2178
        list = originalDocumentGetElementsByTagNameNS.call(target, ns, localName);                                     // 2179
      } else {                                                                                                         // 2180
        return findElements(this, index, result, p, ns, localName);                                                    // 2181
      }                                                                                                                // 2182
      return filterNodeList(list, index, result, false);                                                               // 2183
    }                                                                                                                  // 2184
    var GetElementsByInterface = {                                                                                     // 2185
      getElementsByTagName: function(localName) {                                                                      // 2186
        var result = new HTMLCollection();                                                                             // 2187
        var match = localName === "*" ? matchesEveryThing : matchesTagName;                                            // 2188
        result.length = getElementsByTagNameFiltered.call(this, match, 0, result, localName, localName.toLowerCase()); // 2189
        return result;                                                                                                 // 2190
      },                                                                                                               // 2191
      getElementsByClassName: function(className) {                                                                    // 2192
        return this.querySelectorAll("." + className);                                                                 // 2193
      },                                                                                                               // 2194
      getElementsByTagNameNS: function(ns, localName) {                                                                // 2195
        var result = new HTMLCollection();                                                                             // 2196
        var match = null;                                                                                              // 2197
        if (ns === "*") {                                                                                              // 2198
          match = localName === "*" ? matchesEveryThing : matchesLocalNameOnly;                                        // 2199
        } else {                                                                                                       // 2200
          match = localName === "*" ? matchesNameSpace : matchesLocalNameNS;                                           // 2201
        }                                                                                                              // 2202
        result.length = getElementsByTagNameNSFiltered.call(this, match, 0, result, ns || null, localName);            // 2203
        return result;                                                                                                 // 2204
      }                                                                                                                // 2205
    };                                                                                                                 // 2206
    scope.GetElementsByInterface = GetElementsByInterface;                                                             // 2207
    scope.SelectorsInterface = SelectorsInterface;                                                                     // 2208
  })(window.ShadowDOMPolyfill);                                                                                        // 2209
  (function(scope) {                                                                                                   // 2210
    "use strict";                                                                                                      // 2211
    var NodeList = scope.wrappers.NodeList;                                                                            // 2212
    function forwardElement(node) {                                                                                    // 2213
      while (node && node.nodeType !== Node.ELEMENT_NODE) {                                                            // 2214
        node = node.nextSibling;                                                                                       // 2215
      }                                                                                                                // 2216
      return node;                                                                                                     // 2217
    }                                                                                                                  // 2218
    function backwardsElement(node) {                                                                                  // 2219
      while (node && node.nodeType !== Node.ELEMENT_NODE) {                                                            // 2220
        node = node.previousSibling;                                                                                   // 2221
      }                                                                                                                // 2222
      return node;                                                                                                     // 2223
    }                                                                                                                  // 2224
    var ParentNodeInterface = {                                                                                        // 2225
      get firstElementChild() {                                                                                        // 2226
        return forwardElement(this.firstChild);                                                                        // 2227
      },                                                                                                               // 2228
      get lastElementChild() {                                                                                         // 2229
        return backwardsElement(this.lastChild);                                                                       // 2230
      },                                                                                                               // 2231
      get childElementCount() {                                                                                        // 2232
        var count = 0;                                                                                                 // 2233
        for (var child = this.firstElementChild; child; child = child.nextElementSibling) {                            // 2234
          count++;                                                                                                     // 2235
        }                                                                                                              // 2236
        return count;                                                                                                  // 2237
      },                                                                                                               // 2238
      get children() {                                                                                                 // 2239
        var wrapperList = new NodeList();                                                                              // 2240
        var i = 0;                                                                                                     // 2241
        for (var child = this.firstElementChild; child; child = child.nextElementSibling) {                            // 2242
          wrapperList[i++] = child;                                                                                    // 2243
        }                                                                                                              // 2244
        wrapperList.length = i;                                                                                        // 2245
        return wrapperList;                                                                                            // 2246
      },                                                                                                               // 2247
      remove: function() {                                                                                             // 2248
        var p = this.parentNode;                                                                                       // 2249
        if (p) p.removeChild(this);                                                                                    // 2250
      }                                                                                                                // 2251
    };                                                                                                                 // 2252
    var ChildNodeInterface = {                                                                                         // 2253
      get nextElementSibling() {                                                                                       // 2254
        return forwardElement(this.nextSibling);                                                                       // 2255
      },                                                                                                               // 2256
      get previousElementSibling() {                                                                                   // 2257
        return backwardsElement(this.previousSibling);                                                                 // 2258
      }                                                                                                                // 2259
    };                                                                                                                 // 2260
    scope.ChildNodeInterface = ChildNodeInterface;                                                                     // 2261
    scope.ParentNodeInterface = ParentNodeInterface;                                                                   // 2262
  })(window.ShadowDOMPolyfill);                                                                                        // 2263
  (function(scope) {                                                                                                   // 2264
    "use strict";                                                                                                      // 2265
    var ChildNodeInterface = scope.ChildNodeInterface;                                                                 // 2266
    var Node = scope.wrappers.Node;                                                                                    // 2267
    var enqueueMutation = scope.enqueueMutation;                                                                       // 2268
    var mixin = scope.mixin;                                                                                           // 2269
    var registerWrapper = scope.registerWrapper;                                                                       // 2270
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2271
    var OriginalCharacterData = window.CharacterData;                                                                  // 2272
    function CharacterData(node) {                                                                                     // 2273
      Node.call(this, node);                                                                                           // 2274
    }                                                                                                                  // 2275
    CharacterData.prototype = Object.create(Node.prototype);                                                           // 2276
    mixin(CharacterData.prototype, {                                                                                   // 2277
      get textContent() {                                                                                              // 2278
        return this.data;                                                                                              // 2279
      },                                                                                                               // 2280
      set textContent(value) {                                                                                         // 2281
        this.data = value;                                                                                             // 2282
      },                                                                                                               // 2283
      get data() {                                                                                                     // 2284
        return unsafeUnwrap(this).data;                                                                                // 2285
      },                                                                                                               // 2286
      set data(value) {                                                                                                // 2287
        var oldValue = unsafeUnwrap(this).data;                                                                        // 2288
        enqueueMutation(this, "characterData", {                                                                       // 2289
          oldValue: oldValue                                                                                           // 2290
        });                                                                                                            // 2291
        unsafeUnwrap(this).data = value;                                                                               // 2292
      }                                                                                                                // 2293
    });                                                                                                                // 2294
    mixin(CharacterData.prototype, ChildNodeInterface);                                                                // 2295
    registerWrapper(OriginalCharacterData, CharacterData, document.createTextNode(""));                                // 2296
    scope.wrappers.CharacterData = CharacterData;                                                                      // 2297
  })(window.ShadowDOMPolyfill);                                                                                        // 2298
  (function(scope) {                                                                                                   // 2299
    "use strict";                                                                                                      // 2300
    var CharacterData = scope.wrappers.CharacterData;                                                                  // 2301
    var enqueueMutation = scope.enqueueMutation;                                                                       // 2302
    var mixin = scope.mixin;                                                                                           // 2303
    var registerWrapper = scope.registerWrapper;                                                                       // 2304
    function toUInt32(x) {                                                                                             // 2305
      return x >>> 0;                                                                                                  // 2306
    }                                                                                                                  // 2307
    var OriginalText = window.Text;                                                                                    // 2308
    function Text(node) {                                                                                              // 2309
      CharacterData.call(this, node);                                                                                  // 2310
    }                                                                                                                  // 2311
    Text.prototype = Object.create(CharacterData.prototype);                                                           // 2312
    mixin(Text.prototype, {                                                                                            // 2313
      splitText: function(offset) {                                                                                    // 2314
        offset = toUInt32(offset);                                                                                     // 2315
        var s = this.data;                                                                                             // 2316
        if (offset > s.length) throw new Error("IndexSizeError");                                                      // 2317
        var head = s.slice(0, offset);                                                                                 // 2318
        var tail = s.slice(offset);                                                                                    // 2319
        this.data = head;                                                                                              // 2320
        var newTextNode = this.ownerDocument.createTextNode(tail);                                                     // 2321
        if (this.parentNode) this.parentNode.insertBefore(newTextNode, this.nextSibling);                              // 2322
        return newTextNode;                                                                                            // 2323
      }                                                                                                                // 2324
    });                                                                                                                // 2325
    registerWrapper(OriginalText, Text, document.createTextNode(""));                                                  // 2326
    scope.wrappers.Text = Text;                                                                                        // 2327
  })(window.ShadowDOMPolyfill);                                                                                        // 2328
  (function(scope) {                                                                                                   // 2329
    "use strict";                                                                                                      // 2330
    var setWrapper = scope.setWrapper;                                                                                 // 2331
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2332
    function invalidateClass(el) {                                                                                     // 2333
      scope.invalidateRendererBasedOnAttribute(el, "class");                                                           // 2334
    }                                                                                                                  // 2335
    function DOMTokenList(impl, ownerElement) {                                                                        // 2336
      setWrapper(impl, this);                                                                                          // 2337
      this.ownerElement_ = ownerElement;                                                                               // 2338
    }                                                                                                                  // 2339
    DOMTokenList.prototype = {                                                                                         // 2340
      constructor: DOMTokenList,                                                                                       // 2341
      get length() {                                                                                                   // 2342
        return unsafeUnwrap(this).length;                                                                              // 2343
      },                                                                                                               // 2344
      item: function(index) {                                                                                          // 2345
        return unsafeUnwrap(this).item(index);                                                                         // 2346
      },                                                                                                               // 2347
      contains: function(token) {                                                                                      // 2348
        return unsafeUnwrap(this).contains(token);                                                                     // 2349
      },                                                                                                               // 2350
      add: function() {                                                                                                // 2351
        unsafeUnwrap(this).add.apply(unsafeUnwrap(this), arguments);                                                   // 2352
        invalidateClass(this.ownerElement_);                                                                           // 2353
      },                                                                                                               // 2354
      remove: function() {                                                                                             // 2355
        unsafeUnwrap(this).remove.apply(unsafeUnwrap(this), arguments);                                                // 2356
        invalidateClass(this.ownerElement_);                                                                           // 2357
      },                                                                                                               // 2358
      toggle: function(token) {                                                                                        // 2359
        var rv = unsafeUnwrap(this).toggle.apply(unsafeUnwrap(this), arguments);                                       // 2360
        invalidateClass(this.ownerElement_);                                                                           // 2361
        return rv;                                                                                                     // 2362
      },                                                                                                               // 2363
      toString: function() {                                                                                           // 2364
        return unsafeUnwrap(this).toString();                                                                          // 2365
      }                                                                                                                // 2366
    };                                                                                                                 // 2367
    scope.wrappers.DOMTokenList = DOMTokenList;                                                                        // 2368
  })(window.ShadowDOMPolyfill);                                                                                        // 2369
  (function(scope) {                                                                                                   // 2370
    "use strict";                                                                                                      // 2371
    var ChildNodeInterface = scope.ChildNodeInterface;                                                                 // 2372
    var GetElementsByInterface = scope.GetElementsByInterface;                                                         // 2373
    var Node = scope.wrappers.Node;                                                                                    // 2374
    var DOMTokenList = scope.wrappers.DOMTokenList;                                                                    // 2375
    var ParentNodeInterface = scope.ParentNodeInterface;                                                               // 2376
    var SelectorsInterface = scope.SelectorsInterface;                                                                 // 2377
    var addWrapNodeListMethod = scope.addWrapNodeListMethod;                                                           // 2378
    var enqueueMutation = scope.enqueueMutation;                                                                       // 2379
    var mixin = scope.mixin;                                                                                           // 2380
    var oneOf = scope.oneOf;                                                                                           // 2381
    var registerWrapper = scope.registerWrapper;                                                                       // 2382
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2383
    var wrappers = scope.wrappers;                                                                                     // 2384
    var OriginalElement = window.Element;                                                                              // 2385
    var matchesNames = [ "matches", "mozMatchesSelector", "msMatchesSelector", "webkitMatchesSelector" ].filter(function(name) {
      return OriginalElement.prototype[name];                                                                          // 2387
    });                                                                                                                // 2388
    var matchesName = matchesNames[0];                                                                                 // 2389
    var originalMatches = OriginalElement.prototype[matchesName];                                                      // 2390
    function invalidateRendererBasedOnAttribute(element, name) {                                                       // 2391
      var p = element.parentNode;                                                                                      // 2392
      if (!p || !p.shadowRoot) return;                                                                                 // 2393
      var renderer = scope.getRendererForHost(p);                                                                      // 2394
      if (renderer.dependsOnAttribute(name)) renderer.invalidate();                                                    // 2395
    }                                                                                                                  // 2396
    function enqueAttributeChange(element, name, oldValue) {                                                           // 2397
      enqueueMutation(element, "attributes", {                                                                         // 2398
        name: name,                                                                                                    // 2399
        namespace: null,                                                                                               // 2400
        oldValue: oldValue                                                                                             // 2401
      });                                                                                                              // 2402
    }                                                                                                                  // 2403
    var classListTable = new WeakMap();                                                                                // 2404
    function Element(node) {                                                                                           // 2405
      Node.call(this, node);                                                                                           // 2406
    }                                                                                                                  // 2407
    Element.prototype = Object.create(Node.prototype);                                                                 // 2408
    mixin(Element.prototype, {                                                                                         // 2409
      createShadowRoot: function() {                                                                                   // 2410
        var newShadowRoot = new wrappers.ShadowRoot(this);                                                             // 2411
        unsafeUnwrap(this).polymerShadowRoot_ = newShadowRoot;                                                         // 2412
        var renderer = scope.getRendererForHost(this);                                                                 // 2413
        renderer.invalidate();                                                                                         // 2414
        return newShadowRoot;                                                                                          // 2415
      },                                                                                                               // 2416
      get shadowRoot() {                                                                                               // 2417
        return unsafeUnwrap(this).polymerShadowRoot_ || null;                                                          // 2418
      },                                                                                                               // 2419
      setAttribute: function(name, value) {                                                                            // 2420
        var oldValue = unsafeUnwrap(this).getAttribute(name);                                                          // 2421
        unsafeUnwrap(this).setAttribute(name, value);                                                                  // 2422
        enqueAttributeChange(this, name, oldValue);                                                                    // 2423
        invalidateRendererBasedOnAttribute(this, name);                                                                // 2424
      },                                                                                                               // 2425
      removeAttribute: function(name) {                                                                                // 2426
        var oldValue = unsafeUnwrap(this).getAttribute(name);                                                          // 2427
        unsafeUnwrap(this).removeAttribute(name);                                                                      // 2428
        enqueAttributeChange(this, name, oldValue);                                                                    // 2429
        invalidateRendererBasedOnAttribute(this, name);                                                                // 2430
      },                                                                                                               // 2431
      matches: function(selector) {                                                                                    // 2432
        return originalMatches.call(unsafeUnwrap(this), selector);                                                     // 2433
      },                                                                                                               // 2434
      get classList() {                                                                                                // 2435
        var list = classListTable.get(this);                                                                           // 2436
        if (!list) {                                                                                                   // 2437
          classListTable.set(this, list = new DOMTokenList(unsafeUnwrap(this).classList, this));                       // 2438
        }                                                                                                              // 2439
        return list;                                                                                                   // 2440
      },                                                                                                               // 2441
      get className() {                                                                                                // 2442
        return unsafeUnwrap(this).className;                                                                           // 2443
      },                                                                                                               // 2444
      set className(v) {                                                                                               // 2445
        this.setAttribute("class", v);                                                                                 // 2446
      },                                                                                                               // 2447
      get id() {                                                                                                       // 2448
        return unsafeUnwrap(this).id;                                                                                  // 2449
      },                                                                                                               // 2450
      set id(v) {                                                                                                      // 2451
        this.setAttribute("id", v);                                                                                    // 2452
      }                                                                                                                // 2453
    });                                                                                                                // 2454
    matchesNames.forEach(function(name) {                                                                              // 2455
      if (name !== "matches") {                                                                                        // 2456
        Element.prototype[name] = function(selector) {                                                                 // 2457
          return this.matches(selector);                                                                               // 2458
        };                                                                                                             // 2459
      }                                                                                                                // 2460
    });                                                                                                                // 2461
    if (OriginalElement.prototype.webkitCreateShadowRoot) {                                                            // 2462
      Element.prototype.webkitCreateShadowRoot = Element.prototype.createShadowRoot;                                   // 2463
    }                                                                                                                  // 2464
    mixin(Element.prototype, ChildNodeInterface);                                                                      // 2465
    mixin(Element.prototype, GetElementsByInterface);                                                                  // 2466
    mixin(Element.prototype, ParentNodeInterface);                                                                     // 2467
    mixin(Element.prototype, SelectorsInterface);                                                                      // 2468
    registerWrapper(OriginalElement, Element, document.createElementNS(null, "x"));                                    // 2469
    scope.invalidateRendererBasedOnAttribute = invalidateRendererBasedOnAttribute;                                     // 2470
    scope.matchesNames = matchesNames;                                                                                 // 2471
    scope.wrappers.Element = Element;                                                                                  // 2472
  })(window.ShadowDOMPolyfill);                                                                                        // 2473
  (function(scope) {                                                                                                   // 2474
    "use strict";                                                                                                      // 2475
    var Element = scope.wrappers.Element;                                                                              // 2476
    var defineGetter = scope.defineGetter;                                                                             // 2477
    var enqueueMutation = scope.enqueueMutation;                                                                       // 2478
    var mixin = scope.mixin;                                                                                           // 2479
    var nodesWereAdded = scope.nodesWereAdded;                                                                         // 2480
    var nodesWereRemoved = scope.nodesWereRemoved;                                                                     // 2481
    var registerWrapper = scope.registerWrapper;                                                                       // 2482
    var snapshotNodeList = scope.snapshotNodeList;                                                                     // 2483
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2484
    var unwrap = scope.unwrap;                                                                                         // 2485
    var wrap = scope.wrap;                                                                                             // 2486
    var wrappers = scope.wrappers;                                                                                     // 2487
    var escapeAttrRegExp = /[&\u00A0"]/g;                                                                              // 2488
    var escapeDataRegExp = /[&\u00A0<>]/g;                                                                             // 2489
    function escapeReplace(c) {                                                                                        // 2490
      switch (c) {                                                                                                     // 2491
       case "&":                                                                                                       // 2492
        return "&amp;";                                                                                                // 2493
                                                                                                                       // 2494
       case "<":                                                                                                       // 2495
        return "&lt;";                                                                                                 // 2496
                                                                                                                       // 2497
       case ">":                                                                                                       // 2498
        return "&gt;";                                                                                                 // 2499
                                                                                                                       // 2500
       case '"':                                                                                                       // 2501
        return "&quot;";                                                                                               // 2502
                                                                                                                       // 2503
       case " ":                                                                                                       // 2504
        return "&nbsp;";                                                                                               // 2505
      }                                                                                                                // 2506
    }                                                                                                                  // 2507
    function escapeAttr(s) {                                                                                           // 2508
      return s.replace(escapeAttrRegExp, escapeReplace);                                                               // 2509
    }                                                                                                                  // 2510
    function escapeData(s) {                                                                                           // 2511
      return s.replace(escapeDataRegExp, escapeReplace);                                                               // 2512
    }                                                                                                                  // 2513
    function makeSet(arr) {                                                                                            // 2514
      var set = {};                                                                                                    // 2515
      for (var i = 0; i < arr.length; i++) {                                                                           // 2516
        set[arr[i]] = true;                                                                                            // 2517
      }                                                                                                                // 2518
      return set;                                                                                                      // 2519
    }                                                                                                                  // 2520
    var voidElements = makeSet([ "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr" ]);
    var plaintextParents = makeSet([ "style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript" ]);
    function getOuterHTML(node, parentNode) {                                                                          // 2523
      switch (node.nodeType) {                                                                                         // 2524
       case Node.ELEMENT_NODE:                                                                                         // 2525
        var tagName = node.tagName.toLowerCase();                                                                      // 2526
        var s = "<" + tagName;                                                                                         // 2527
        var attrs = node.attributes;                                                                                   // 2528
        for (var i = 0, attr; attr = attrs[i]; i++) {                                                                  // 2529
          s += " " + attr.name + '="' + escapeAttr(attr.value) + '"';                                                  // 2530
        }                                                                                                              // 2531
        s += ">";                                                                                                      // 2532
        if (voidElements[tagName]) return s;                                                                           // 2533
        return s + getInnerHTML(node) + "</" + tagName + ">";                                                          // 2534
                                                                                                                       // 2535
       case Node.TEXT_NODE:                                                                                            // 2536
        var data = node.data;                                                                                          // 2537
        if (parentNode && plaintextParents[parentNode.localName]) return data;                                         // 2538
        return escapeData(data);                                                                                       // 2539
                                                                                                                       // 2540
       case Node.COMMENT_NODE:                                                                                         // 2541
        return "<!--" + node.data + "-->";                                                                             // 2542
                                                                                                                       // 2543
       default:                                                                                                        // 2544
        console.error(node);                                                                                           // 2545
        throw new Error("not implemented");                                                                            // 2546
      }                                                                                                                // 2547
    }                                                                                                                  // 2548
    function getInnerHTML(node) {                                                                                      // 2549
      if (node instanceof wrappers.HTMLTemplateElement) node = node.content;                                           // 2550
      var s = "";                                                                                                      // 2551
      for (var child = node.firstChild; child; child = child.nextSibling) {                                            // 2552
        s += getOuterHTML(child, node);                                                                                // 2553
      }                                                                                                                // 2554
      return s;                                                                                                        // 2555
    }                                                                                                                  // 2556
    function setInnerHTML(node, value, opt_tagName) {                                                                  // 2557
      var tagName = opt_tagName || "div";                                                                              // 2558
      node.textContent = "";                                                                                           // 2559
      var tempElement = unwrap(node.ownerDocument.createElement(tagName));                                             // 2560
      tempElement.innerHTML = value;                                                                                   // 2561
      var firstChild;                                                                                                  // 2562
      while (firstChild = tempElement.firstChild) {                                                                    // 2563
        node.appendChild(wrap(firstChild));                                                                            // 2564
      }                                                                                                                // 2565
    }                                                                                                                  // 2566
    var oldIe = /MSIE/.test(navigator.userAgent);                                                                      // 2567
    var OriginalHTMLElement = window.HTMLElement;                                                                      // 2568
    var OriginalHTMLTemplateElement = window.HTMLTemplateElement;                                                      // 2569
    function HTMLElement(node) {                                                                                       // 2570
      Element.call(this, node);                                                                                        // 2571
    }                                                                                                                  // 2572
    HTMLElement.prototype = Object.create(Element.prototype);                                                          // 2573
    mixin(HTMLElement.prototype, {                                                                                     // 2574
      get innerHTML() {                                                                                                // 2575
        return getInnerHTML(this);                                                                                     // 2576
      },                                                                                                               // 2577
      set innerHTML(value) {                                                                                           // 2578
        if (oldIe && plaintextParents[this.localName]) {                                                               // 2579
          this.textContent = value;                                                                                    // 2580
          return;                                                                                                      // 2581
        }                                                                                                              // 2582
        var removedNodes = snapshotNodeList(this.childNodes);                                                          // 2583
        if (this.invalidateShadowRenderer()) {                                                                         // 2584
          if (this instanceof wrappers.HTMLTemplateElement) setInnerHTML(this.content, value); else setInnerHTML(this, value, this.tagName);
        } else if (!OriginalHTMLTemplateElement && this instanceof wrappers.HTMLTemplateElement) {                     // 2586
          setInnerHTML(this.content, value);                                                                           // 2587
        } else {                                                                                                       // 2588
          unsafeUnwrap(this).innerHTML = value;                                                                        // 2589
        }                                                                                                              // 2590
        var addedNodes = snapshotNodeList(this.childNodes);                                                            // 2591
        enqueueMutation(this, "childList", {                                                                           // 2592
          addedNodes: addedNodes,                                                                                      // 2593
          removedNodes: removedNodes                                                                                   // 2594
        });                                                                                                            // 2595
        nodesWereRemoved(removedNodes);                                                                                // 2596
        nodesWereAdded(addedNodes, this);                                                                              // 2597
      },                                                                                                               // 2598
      get outerHTML() {                                                                                                // 2599
        return getOuterHTML(this, this.parentNode);                                                                    // 2600
      },                                                                                                               // 2601
      set outerHTML(value) {                                                                                           // 2602
        var p = this.parentNode;                                                                                       // 2603
        if (p) {                                                                                                       // 2604
          p.invalidateShadowRenderer();                                                                                // 2605
          var df = frag(p, value);                                                                                     // 2606
          p.replaceChild(df, this);                                                                                    // 2607
        }                                                                                                              // 2608
      },                                                                                                               // 2609
      insertAdjacentHTML: function(position, text) {                                                                   // 2610
        var contextElement, refNode;                                                                                   // 2611
        switch (String(position).toLowerCase()) {                                                                      // 2612
         case "beforebegin":                                                                                           // 2613
          contextElement = this.parentNode;                                                                            // 2614
          refNode = this;                                                                                              // 2615
          break;                                                                                                       // 2616
                                                                                                                       // 2617
         case "afterend":                                                                                              // 2618
          contextElement = this.parentNode;                                                                            // 2619
          refNode = this.nextSibling;                                                                                  // 2620
          break;                                                                                                       // 2621
                                                                                                                       // 2622
         case "afterbegin":                                                                                            // 2623
          contextElement = this;                                                                                       // 2624
          refNode = this.firstChild;                                                                                   // 2625
          break;                                                                                                       // 2626
                                                                                                                       // 2627
         case "beforeend":                                                                                             // 2628
          contextElement = this;                                                                                       // 2629
          refNode = null;                                                                                              // 2630
          break;                                                                                                       // 2631
                                                                                                                       // 2632
         default:                                                                                                      // 2633
          return;                                                                                                      // 2634
        }                                                                                                              // 2635
        var df = frag(contextElement, text);                                                                           // 2636
        contextElement.insertBefore(df, refNode);                                                                      // 2637
      },                                                                                                               // 2638
      get hidden() {                                                                                                   // 2639
        return this.hasAttribute("hidden");                                                                            // 2640
      },                                                                                                               // 2641
      set hidden(v) {                                                                                                  // 2642
        if (v) {                                                                                                       // 2643
          this.setAttribute("hidden", "");                                                                             // 2644
        } else {                                                                                                       // 2645
          this.removeAttribute("hidden");                                                                              // 2646
        }                                                                                                              // 2647
      }                                                                                                                // 2648
    });                                                                                                                // 2649
    function frag(contextElement, html) {                                                                              // 2650
      var p = unwrap(contextElement.cloneNode(false));                                                                 // 2651
      p.innerHTML = html;                                                                                              // 2652
      var df = unwrap(document.createDocumentFragment());                                                              // 2653
      var c;                                                                                                           // 2654
      while (c = p.firstChild) {                                                                                       // 2655
        df.appendChild(c);                                                                                             // 2656
      }                                                                                                                // 2657
      return wrap(df);                                                                                                 // 2658
    }                                                                                                                  // 2659
    function getter(name) {                                                                                            // 2660
      return function() {                                                                                              // 2661
        scope.renderAllPending();                                                                                      // 2662
        return unsafeUnwrap(this)[name];                                                                               // 2663
      };                                                                                                               // 2664
    }                                                                                                                  // 2665
    function getterRequiresRendering(name) {                                                                           // 2666
      defineGetter(HTMLElement, name, getter(name));                                                                   // 2667
    }                                                                                                                  // 2668
    [ "clientHeight", "clientLeft", "clientTop", "clientWidth", "offsetHeight", "offsetLeft", "offsetTop", "offsetWidth", "scrollHeight", "scrollWidth" ].forEach(getterRequiresRendering);
    function getterAndSetterRequiresRendering(name) {                                                                  // 2670
      Object.defineProperty(HTMLElement.prototype, name, {                                                             // 2671
        get: getter(name),                                                                                             // 2672
        set: function(v) {                                                                                             // 2673
          scope.renderAllPending();                                                                                    // 2674
          unsafeUnwrap(this)[name] = v;                                                                                // 2675
        },                                                                                                             // 2676
        configurable: true,                                                                                            // 2677
        enumerable: true                                                                                               // 2678
      });                                                                                                              // 2679
    }                                                                                                                  // 2680
    [ "scrollLeft", "scrollTop" ].forEach(getterAndSetterRequiresRendering);                                           // 2681
    function methodRequiresRendering(name) {                                                                           // 2682
      Object.defineProperty(HTMLElement.prototype, name, {                                                             // 2683
        value: function() {                                                                                            // 2684
          scope.renderAllPending();                                                                                    // 2685
          return unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments);                                        // 2686
        },                                                                                                             // 2687
        configurable: true,                                                                                            // 2688
        enumerable: true                                                                                               // 2689
      });                                                                                                              // 2690
    }                                                                                                                  // 2691
    [ "getBoundingClientRect", "getClientRects", "scrollIntoView" ].forEach(methodRequiresRendering);                  // 2692
    registerWrapper(OriginalHTMLElement, HTMLElement, document.createElement("b"));                                    // 2693
    scope.wrappers.HTMLElement = HTMLElement;                                                                          // 2694
    scope.getInnerHTML = getInnerHTML;                                                                                 // 2695
    scope.setInnerHTML = setInnerHTML;                                                                                 // 2696
  })(window.ShadowDOMPolyfill);                                                                                        // 2697
  (function(scope) {                                                                                                   // 2698
    "use strict";                                                                                                      // 2699
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2700
    var mixin = scope.mixin;                                                                                           // 2701
    var registerWrapper = scope.registerWrapper;                                                                       // 2702
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2703
    var wrap = scope.wrap;                                                                                             // 2704
    var OriginalHTMLCanvasElement = window.HTMLCanvasElement;                                                          // 2705
    function HTMLCanvasElement(node) {                                                                                 // 2706
      HTMLElement.call(this, node);                                                                                    // 2707
    }                                                                                                                  // 2708
    HTMLCanvasElement.prototype = Object.create(HTMLElement.prototype);                                                // 2709
    mixin(HTMLCanvasElement.prototype, {                                                                               // 2710
      getContext: function() {                                                                                         // 2711
        var context = unsafeUnwrap(this).getContext.apply(unsafeUnwrap(this), arguments);                              // 2712
        return context && wrap(context);                                                                               // 2713
      }                                                                                                                // 2714
    });                                                                                                                // 2715
    registerWrapper(OriginalHTMLCanvasElement, HTMLCanvasElement, document.createElement("canvas"));                   // 2716
    scope.wrappers.HTMLCanvasElement = HTMLCanvasElement;                                                              // 2717
  })(window.ShadowDOMPolyfill);                                                                                        // 2718
  (function(scope) {                                                                                                   // 2719
    "use strict";                                                                                                      // 2720
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2721
    var mixin = scope.mixin;                                                                                           // 2722
    var registerWrapper = scope.registerWrapper;                                                                       // 2723
    var OriginalHTMLContentElement = window.HTMLContentElement;                                                        // 2724
    function HTMLContentElement(node) {                                                                                // 2725
      HTMLElement.call(this, node);                                                                                    // 2726
    }                                                                                                                  // 2727
    HTMLContentElement.prototype = Object.create(HTMLElement.prototype);                                               // 2728
    mixin(HTMLContentElement.prototype, {                                                                              // 2729
      constructor: HTMLContentElement,                                                                                 // 2730
      get select() {                                                                                                   // 2731
        return this.getAttribute("select");                                                                            // 2732
      },                                                                                                               // 2733
      set select(value) {                                                                                              // 2734
        this.setAttribute("select", value);                                                                            // 2735
      },                                                                                                               // 2736
      setAttribute: function(n, v) {                                                                                   // 2737
        HTMLElement.prototype.setAttribute.call(this, n, v);                                                           // 2738
        if (String(n).toLowerCase() === "select") this.invalidateShadowRenderer(true);                                 // 2739
      }                                                                                                                // 2740
    });                                                                                                                // 2741
    if (OriginalHTMLContentElement) registerWrapper(OriginalHTMLContentElement, HTMLContentElement);                   // 2742
    scope.wrappers.HTMLContentElement = HTMLContentElement;                                                            // 2743
  })(window.ShadowDOMPolyfill);                                                                                        // 2744
  (function(scope) {                                                                                                   // 2745
    "use strict";                                                                                                      // 2746
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2747
    var mixin = scope.mixin;                                                                                           // 2748
    var registerWrapper = scope.registerWrapper;                                                                       // 2749
    var wrapHTMLCollection = scope.wrapHTMLCollection;                                                                 // 2750
    var unwrap = scope.unwrap;                                                                                         // 2751
    var OriginalHTMLFormElement = window.HTMLFormElement;                                                              // 2752
    function HTMLFormElement(node) {                                                                                   // 2753
      HTMLElement.call(this, node);                                                                                    // 2754
    }                                                                                                                  // 2755
    HTMLFormElement.prototype = Object.create(HTMLElement.prototype);                                                  // 2756
    mixin(HTMLFormElement.prototype, {                                                                                 // 2757
      get elements() {                                                                                                 // 2758
        return wrapHTMLCollection(unwrap(this).elements);                                                              // 2759
      }                                                                                                                // 2760
    });                                                                                                                // 2761
    registerWrapper(OriginalHTMLFormElement, HTMLFormElement, document.createElement("form"));                         // 2762
    scope.wrappers.HTMLFormElement = HTMLFormElement;                                                                  // 2763
  })(window.ShadowDOMPolyfill);                                                                                        // 2764
  (function(scope) {                                                                                                   // 2765
    "use strict";                                                                                                      // 2766
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2767
    var registerWrapper = scope.registerWrapper;                                                                       // 2768
    var unwrap = scope.unwrap;                                                                                         // 2769
    var rewrap = scope.rewrap;                                                                                         // 2770
    var OriginalHTMLImageElement = window.HTMLImageElement;                                                            // 2771
    function HTMLImageElement(node) {                                                                                  // 2772
      HTMLElement.call(this, node);                                                                                    // 2773
    }                                                                                                                  // 2774
    HTMLImageElement.prototype = Object.create(HTMLElement.prototype);                                                 // 2775
    registerWrapper(OriginalHTMLImageElement, HTMLImageElement, document.createElement("img"));                        // 2776
    function Image(width, height) {                                                                                    // 2777
      if (!(this instanceof Image)) {                                                                                  // 2778
        throw new TypeError("DOM object constructor cannot be called as a function.");                                 // 2779
      }                                                                                                                // 2780
      var node = unwrap(document.createElement("img"));                                                                // 2781
      HTMLElement.call(this, node);                                                                                    // 2782
      rewrap(node, this);                                                                                              // 2783
      if (width !== undefined) node.width = width;                                                                     // 2784
      if (height !== undefined) node.height = height;                                                                  // 2785
    }                                                                                                                  // 2786
    Image.prototype = HTMLImageElement.prototype;                                                                      // 2787
    scope.wrappers.HTMLImageElement = HTMLImageElement;                                                                // 2788
    scope.wrappers.Image = Image;                                                                                      // 2789
  })(window.ShadowDOMPolyfill);                                                                                        // 2790
  (function(scope) {                                                                                                   // 2791
    "use strict";                                                                                                      // 2792
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2793
    var mixin = scope.mixin;                                                                                           // 2794
    var NodeList = scope.wrappers.NodeList;                                                                            // 2795
    var registerWrapper = scope.registerWrapper;                                                                       // 2796
    var OriginalHTMLShadowElement = window.HTMLShadowElement;                                                          // 2797
    function HTMLShadowElement(node) {                                                                                 // 2798
      HTMLElement.call(this, node);                                                                                    // 2799
    }                                                                                                                  // 2800
    HTMLShadowElement.prototype = Object.create(HTMLElement.prototype);                                                // 2801
    HTMLShadowElement.prototype.constructor = HTMLShadowElement;                                                       // 2802
    if (OriginalHTMLShadowElement) registerWrapper(OriginalHTMLShadowElement, HTMLShadowElement);                      // 2803
    scope.wrappers.HTMLShadowElement = HTMLShadowElement;                                                              // 2804
  })(window.ShadowDOMPolyfill);                                                                                        // 2805
  (function(scope) {                                                                                                   // 2806
    "use strict";                                                                                                      // 2807
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2808
    var mixin = scope.mixin;                                                                                           // 2809
    var registerWrapper = scope.registerWrapper;                                                                       // 2810
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 2811
    var unwrap = scope.unwrap;                                                                                         // 2812
    var wrap = scope.wrap;                                                                                             // 2813
    var contentTable = new WeakMap();                                                                                  // 2814
    var templateContentsOwnerTable = new WeakMap();                                                                    // 2815
    function getTemplateContentsOwner(doc) {                                                                           // 2816
      if (!doc.defaultView) return doc;                                                                                // 2817
      var d = templateContentsOwnerTable.get(doc);                                                                     // 2818
      if (!d) {                                                                                                        // 2819
        d = doc.implementation.createHTMLDocument("");                                                                 // 2820
        while (d.lastChild) {                                                                                          // 2821
          d.removeChild(d.lastChild);                                                                                  // 2822
        }                                                                                                              // 2823
        templateContentsOwnerTable.set(doc, d);                                                                        // 2824
      }                                                                                                                // 2825
      return d;                                                                                                        // 2826
    }                                                                                                                  // 2827
    function extractContent(templateElement) {                                                                         // 2828
      var doc = getTemplateContentsOwner(templateElement.ownerDocument);                                               // 2829
      var df = unwrap(doc.createDocumentFragment());                                                                   // 2830
      var child;                                                                                                       // 2831
      while (child = templateElement.firstChild) {                                                                     // 2832
        df.appendChild(child);                                                                                         // 2833
      }                                                                                                                // 2834
      return df;                                                                                                       // 2835
    }                                                                                                                  // 2836
    var OriginalHTMLTemplateElement = window.HTMLTemplateElement;                                                      // 2837
    function HTMLTemplateElement(node) {                                                                               // 2838
      HTMLElement.call(this, node);                                                                                    // 2839
      if (!OriginalHTMLTemplateElement) {                                                                              // 2840
        var content = extractContent(node);                                                                            // 2841
        contentTable.set(this, wrap(content));                                                                         // 2842
      }                                                                                                                // 2843
    }                                                                                                                  // 2844
    HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);                                              // 2845
    mixin(HTMLTemplateElement.prototype, {                                                                             // 2846
      constructor: HTMLTemplateElement,                                                                                // 2847
      get content() {                                                                                                  // 2848
        if (OriginalHTMLTemplateElement) return wrap(unsafeUnwrap(this).content);                                      // 2849
        return contentTable.get(this);                                                                                 // 2850
      }                                                                                                                // 2851
    });                                                                                                                // 2852
    if (OriginalHTMLTemplateElement) registerWrapper(OriginalHTMLTemplateElement, HTMLTemplateElement);                // 2853
    scope.wrappers.HTMLTemplateElement = HTMLTemplateElement;                                                          // 2854
  })(window.ShadowDOMPolyfill);                                                                                        // 2855
  (function(scope) {                                                                                                   // 2856
    "use strict";                                                                                                      // 2857
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2858
    var registerWrapper = scope.registerWrapper;                                                                       // 2859
    var OriginalHTMLMediaElement = window.HTMLMediaElement;                                                            // 2860
    if (!OriginalHTMLMediaElement) return;                                                                             // 2861
    function HTMLMediaElement(node) {                                                                                  // 2862
      HTMLElement.call(this, node);                                                                                    // 2863
    }                                                                                                                  // 2864
    HTMLMediaElement.prototype = Object.create(HTMLElement.prototype);                                                 // 2865
    registerWrapper(OriginalHTMLMediaElement, HTMLMediaElement, document.createElement("audio"));                      // 2866
    scope.wrappers.HTMLMediaElement = HTMLMediaElement;                                                                // 2867
  })(window.ShadowDOMPolyfill);                                                                                        // 2868
  (function(scope) {                                                                                                   // 2869
    "use strict";                                                                                                      // 2870
    var HTMLMediaElement = scope.wrappers.HTMLMediaElement;                                                            // 2871
    var registerWrapper = scope.registerWrapper;                                                                       // 2872
    var unwrap = scope.unwrap;                                                                                         // 2873
    var rewrap = scope.rewrap;                                                                                         // 2874
    var OriginalHTMLAudioElement = window.HTMLAudioElement;                                                            // 2875
    if (!OriginalHTMLAudioElement) return;                                                                             // 2876
    function HTMLAudioElement(node) {                                                                                  // 2877
      HTMLMediaElement.call(this, node);                                                                               // 2878
    }                                                                                                                  // 2879
    HTMLAudioElement.prototype = Object.create(HTMLMediaElement.prototype);                                            // 2880
    registerWrapper(OriginalHTMLAudioElement, HTMLAudioElement, document.createElement("audio"));                      // 2881
    function Audio(src) {                                                                                              // 2882
      if (!(this instanceof Audio)) {                                                                                  // 2883
        throw new TypeError("DOM object constructor cannot be called as a function.");                                 // 2884
      }                                                                                                                // 2885
      var node = unwrap(document.createElement("audio"));                                                              // 2886
      HTMLMediaElement.call(this, node);                                                                               // 2887
      rewrap(node, this);                                                                                              // 2888
      node.setAttribute("preload", "auto");                                                                            // 2889
      if (src !== undefined) node.setAttribute("src", src);                                                            // 2890
    }                                                                                                                  // 2891
    Audio.prototype = HTMLAudioElement.prototype;                                                                      // 2892
    scope.wrappers.HTMLAudioElement = HTMLAudioElement;                                                                // 2893
    scope.wrappers.Audio = Audio;                                                                                      // 2894
  })(window.ShadowDOMPolyfill);                                                                                        // 2895
  (function(scope) {                                                                                                   // 2896
    "use strict";                                                                                                      // 2897
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2898
    var mixin = scope.mixin;                                                                                           // 2899
    var registerWrapper = scope.registerWrapper;                                                                       // 2900
    var rewrap = scope.rewrap;                                                                                         // 2901
    var unwrap = scope.unwrap;                                                                                         // 2902
    var wrap = scope.wrap;                                                                                             // 2903
    var OriginalHTMLOptionElement = window.HTMLOptionElement;                                                          // 2904
    function trimText(s) {                                                                                             // 2905
      return s.replace(/\s+/g, " ").trim();                                                                            // 2906
    }                                                                                                                  // 2907
    function HTMLOptionElement(node) {                                                                                 // 2908
      HTMLElement.call(this, node);                                                                                    // 2909
    }                                                                                                                  // 2910
    HTMLOptionElement.prototype = Object.create(HTMLElement.prototype);                                                // 2911
    mixin(HTMLOptionElement.prototype, {                                                                               // 2912
      get text() {                                                                                                     // 2913
        return trimText(this.textContent);                                                                             // 2914
      },                                                                                                               // 2915
      set text(value) {                                                                                                // 2916
        this.textContent = trimText(String(value));                                                                    // 2917
      },                                                                                                               // 2918
      get form() {                                                                                                     // 2919
        return wrap(unwrap(this).form);                                                                                // 2920
      }                                                                                                                // 2921
    });                                                                                                                // 2922
    registerWrapper(OriginalHTMLOptionElement, HTMLOptionElement, document.createElement("option"));                   // 2923
    function Option(text, value, defaultSelected, selected) {                                                          // 2924
      if (!(this instanceof Option)) {                                                                                 // 2925
        throw new TypeError("DOM object constructor cannot be called as a function.");                                 // 2926
      }                                                                                                                // 2927
      var node = unwrap(document.createElement("option"));                                                             // 2928
      HTMLElement.call(this, node);                                                                                    // 2929
      rewrap(node, this);                                                                                              // 2930
      if (text !== undefined) node.text = text;                                                                        // 2931
      if (value !== undefined) node.setAttribute("value", value);                                                      // 2932
      if (defaultSelected === true) node.setAttribute("selected", "");                                                 // 2933
      node.selected = selected === true;                                                                               // 2934
    }                                                                                                                  // 2935
    Option.prototype = HTMLOptionElement.prototype;                                                                    // 2936
    scope.wrappers.HTMLOptionElement = HTMLOptionElement;                                                              // 2937
    scope.wrappers.Option = Option;                                                                                    // 2938
  })(window.ShadowDOMPolyfill);                                                                                        // 2939
  (function(scope) {                                                                                                   // 2940
    "use strict";                                                                                                      // 2941
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2942
    var mixin = scope.mixin;                                                                                           // 2943
    var registerWrapper = scope.registerWrapper;                                                                       // 2944
    var unwrap = scope.unwrap;                                                                                         // 2945
    var wrap = scope.wrap;                                                                                             // 2946
    var OriginalHTMLSelectElement = window.HTMLSelectElement;                                                          // 2947
    function HTMLSelectElement(node) {                                                                                 // 2948
      HTMLElement.call(this, node);                                                                                    // 2949
    }                                                                                                                  // 2950
    HTMLSelectElement.prototype = Object.create(HTMLElement.prototype);                                                // 2951
    mixin(HTMLSelectElement.prototype, {                                                                               // 2952
      add: function(element, before) {                                                                                 // 2953
        if (typeof before === "object") before = unwrap(before);                                                       // 2954
        unwrap(this).add(unwrap(element), before);                                                                     // 2955
      },                                                                                                               // 2956
      remove: function(indexOrNode) {                                                                                  // 2957
        if (indexOrNode === undefined) {                                                                               // 2958
          HTMLElement.prototype.remove.call(this);                                                                     // 2959
          return;                                                                                                      // 2960
        }                                                                                                              // 2961
        if (typeof indexOrNode === "object") indexOrNode = unwrap(indexOrNode);                                        // 2962
        unwrap(this).remove(indexOrNode);                                                                              // 2963
      },                                                                                                               // 2964
      get form() {                                                                                                     // 2965
        return wrap(unwrap(this).form);                                                                                // 2966
      }                                                                                                                // 2967
    });                                                                                                                // 2968
    registerWrapper(OriginalHTMLSelectElement, HTMLSelectElement, document.createElement("select"));                   // 2969
    scope.wrappers.HTMLSelectElement = HTMLSelectElement;                                                              // 2970
  })(window.ShadowDOMPolyfill);                                                                                        // 2971
  (function(scope) {                                                                                                   // 2972
    "use strict";                                                                                                      // 2973
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 2974
    var mixin = scope.mixin;                                                                                           // 2975
    var registerWrapper = scope.registerWrapper;                                                                       // 2976
    var unwrap = scope.unwrap;                                                                                         // 2977
    var wrap = scope.wrap;                                                                                             // 2978
    var wrapHTMLCollection = scope.wrapHTMLCollection;                                                                 // 2979
    var OriginalHTMLTableElement = window.HTMLTableElement;                                                            // 2980
    function HTMLTableElement(node) {                                                                                  // 2981
      HTMLElement.call(this, node);                                                                                    // 2982
    }                                                                                                                  // 2983
    HTMLTableElement.prototype = Object.create(HTMLElement.prototype);                                                 // 2984
    mixin(HTMLTableElement.prototype, {                                                                                // 2985
      get caption() {                                                                                                  // 2986
        return wrap(unwrap(this).caption);                                                                             // 2987
      },                                                                                                               // 2988
      createCaption: function() {                                                                                      // 2989
        return wrap(unwrap(this).createCaption());                                                                     // 2990
      },                                                                                                               // 2991
      get tHead() {                                                                                                    // 2992
        return wrap(unwrap(this).tHead);                                                                               // 2993
      },                                                                                                               // 2994
      createTHead: function() {                                                                                        // 2995
        return wrap(unwrap(this).createTHead());                                                                       // 2996
      },                                                                                                               // 2997
      createTFoot: function() {                                                                                        // 2998
        return wrap(unwrap(this).createTFoot());                                                                       // 2999
      },                                                                                                               // 3000
      get tFoot() {                                                                                                    // 3001
        return wrap(unwrap(this).tFoot);                                                                               // 3002
      },                                                                                                               // 3003
      get tBodies() {                                                                                                  // 3004
        return wrapHTMLCollection(unwrap(this).tBodies);                                                               // 3005
      },                                                                                                               // 3006
      createTBody: function() {                                                                                        // 3007
        return wrap(unwrap(this).createTBody());                                                                       // 3008
      },                                                                                                               // 3009
      get rows() {                                                                                                     // 3010
        return wrapHTMLCollection(unwrap(this).rows);                                                                  // 3011
      },                                                                                                               // 3012
      insertRow: function(index) {                                                                                     // 3013
        return wrap(unwrap(this).insertRow(index));                                                                    // 3014
      }                                                                                                                // 3015
    });                                                                                                                // 3016
    registerWrapper(OriginalHTMLTableElement, HTMLTableElement, document.createElement("table"));                      // 3017
    scope.wrappers.HTMLTableElement = HTMLTableElement;                                                                // 3018
  })(window.ShadowDOMPolyfill);                                                                                        // 3019
  (function(scope) {                                                                                                   // 3020
    "use strict";                                                                                                      // 3021
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 3022
    var mixin = scope.mixin;                                                                                           // 3023
    var registerWrapper = scope.registerWrapper;                                                                       // 3024
    var wrapHTMLCollection = scope.wrapHTMLCollection;                                                                 // 3025
    var unwrap = scope.unwrap;                                                                                         // 3026
    var wrap = scope.wrap;                                                                                             // 3027
    var OriginalHTMLTableSectionElement = window.HTMLTableSectionElement;                                              // 3028
    function HTMLTableSectionElement(node) {                                                                           // 3029
      HTMLElement.call(this, node);                                                                                    // 3030
    }                                                                                                                  // 3031
    HTMLTableSectionElement.prototype = Object.create(HTMLElement.prototype);                                          // 3032
    mixin(HTMLTableSectionElement.prototype, {                                                                         // 3033
      constructor: HTMLTableSectionElement,                                                                            // 3034
      get rows() {                                                                                                     // 3035
        return wrapHTMLCollection(unwrap(this).rows);                                                                  // 3036
      },                                                                                                               // 3037
      insertRow: function(index) {                                                                                     // 3038
        return wrap(unwrap(this).insertRow(index));                                                                    // 3039
      }                                                                                                                // 3040
    });                                                                                                                // 3041
    registerWrapper(OriginalHTMLTableSectionElement, HTMLTableSectionElement, document.createElement("thead"));        // 3042
    scope.wrappers.HTMLTableSectionElement = HTMLTableSectionElement;                                                  // 3043
  })(window.ShadowDOMPolyfill);                                                                                        // 3044
  (function(scope) {                                                                                                   // 3045
    "use strict";                                                                                                      // 3046
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 3047
    var mixin = scope.mixin;                                                                                           // 3048
    var registerWrapper = scope.registerWrapper;                                                                       // 3049
    var wrapHTMLCollection = scope.wrapHTMLCollection;                                                                 // 3050
    var unwrap = scope.unwrap;                                                                                         // 3051
    var wrap = scope.wrap;                                                                                             // 3052
    var OriginalHTMLTableRowElement = window.HTMLTableRowElement;                                                      // 3053
    function HTMLTableRowElement(node) {                                                                               // 3054
      HTMLElement.call(this, node);                                                                                    // 3055
    }                                                                                                                  // 3056
    HTMLTableRowElement.prototype = Object.create(HTMLElement.prototype);                                              // 3057
    mixin(HTMLTableRowElement.prototype, {                                                                             // 3058
      get cells() {                                                                                                    // 3059
        return wrapHTMLCollection(unwrap(this).cells);                                                                 // 3060
      },                                                                                                               // 3061
      insertCell: function(index) {                                                                                    // 3062
        return wrap(unwrap(this).insertCell(index));                                                                   // 3063
      }                                                                                                                // 3064
    });                                                                                                                // 3065
    registerWrapper(OriginalHTMLTableRowElement, HTMLTableRowElement, document.createElement("tr"));                   // 3066
    scope.wrappers.HTMLTableRowElement = HTMLTableRowElement;                                                          // 3067
  })(window.ShadowDOMPolyfill);                                                                                        // 3068
  (function(scope) {                                                                                                   // 3069
    "use strict";                                                                                                      // 3070
    var HTMLContentElement = scope.wrappers.HTMLContentElement;                                                        // 3071
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 3072
    var HTMLShadowElement = scope.wrappers.HTMLShadowElement;                                                          // 3073
    var HTMLTemplateElement = scope.wrappers.HTMLTemplateElement;                                                      // 3074
    var mixin = scope.mixin;                                                                                           // 3075
    var registerWrapper = scope.registerWrapper;                                                                       // 3076
    var OriginalHTMLUnknownElement = window.HTMLUnknownElement;                                                        // 3077
    function HTMLUnknownElement(node) {                                                                                // 3078
      switch (node.localName) {                                                                                        // 3079
       case "content":                                                                                                 // 3080
        return new HTMLContentElement(node);                                                                           // 3081
                                                                                                                       // 3082
       case "shadow":                                                                                                  // 3083
        return new HTMLShadowElement(node);                                                                            // 3084
                                                                                                                       // 3085
       case "template":                                                                                                // 3086
        return new HTMLTemplateElement(node);                                                                          // 3087
      }                                                                                                                // 3088
      HTMLElement.call(this, node);                                                                                    // 3089
    }                                                                                                                  // 3090
    HTMLUnknownElement.prototype = Object.create(HTMLElement.prototype);                                               // 3091
    registerWrapper(OriginalHTMLUnknownElement, HTMLUnknownElement);                                                   // 3092
    scope.wrappers.HTMLUnknownElement = HTMLUnknownElement;                                                            // 3093
  })(window.ShadowDOMPolyfill);                                                                                        // 3094
  (function(scope) {                                                                                                   // 3095
    "use strict";                                                                                                      // 3096
    var Element = scope.wrappers.Element;                                                                              // 3097
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 3098
    var registerObject = scope.registerObject;                                                                         // 3099
    var SVG_NS = "http://www.w3.org/2000/svg";                                                                         // 3100
    var svgTitleElement = document.createElementNS(SVG_NS, "title");                                                   // 3101
    var SVGTitleElement = registerObject(svgTitleElement);                                                             // 3102
    var SVGElement = Object.getPrototypeOf(SVGTitleElement.prototype).constructor;                                     // 3103
    if (!("classList" in svgTitleElement)) {                                                                           // 3104
      var descr = Object.getOwnPropertyDescriptor(Element.prototype, "classList");                                     // 3105
      Object.defineProperty(HTMLElement.prototype, "classList", descr);                                                // 3106
      delete Element.prototype.classList;                                                                              // 3107
    }                                                                                                                  // 3108
    scope.wrappers.SVGElement = SVGElement;                                                                            // 3109
  })(window.ShadowDOMPolyfill);                                                                                        // 3110
  (function(scope) {                                                                                                   // 3111
    "use strict";                                                                                                      // 3112
    var mixin = scope.mixin;                                                                                           // 3113
    var registerWrapper = scope.registerWrapper;                                                                       // 3114
    var unwrap = scope.unwrap;                                                                                         // 3115
    var wrap = scope.wrap;                                                                                             // 3116
    var OriginalSVGUseElement = window.SVGUseElement;                                                                  // 3117
    var SVG_NS = "http://www.w3.org/2000/svg";                                                                         // 3118
    var gWrapper = wrap(document.createElementNS(SVG_NS, "g"));                                                        // 3119
    var useElement = document.createElementNS(SVG_NS, "use");                                                          // 3120
    var SVGGElement = gWrapper.constructor;                                                                            // 3121
    var parentInterfacePrototype = Object.getPrototypeOf(SVGGElement.prototype);                                       // 3122
    var parentInterface = parentInterfacePrototype.constructor;                                                        // 3123
    function SVGUseElement(impl) {                                                                                     // 3124
      parentInterface.call(this, impl);                                                                                // 3125
    }                                                                                                                  // 3126
    SVGUseElement.prototype = Object.create(parentInterfacePrototype);                                                 // 3127
    if ("instanceRoot" in useElement) {                                                                                // 3128
      mixin(SVGUseElement.prototype, {                                                                                 // 3129
        get instanceRoot() {                                                                                           // 3130
          return wrap(unwrap(this).instanceRoot);                                                                      // 3131
        },                                                                                                             // 3132
        get animatedInstanceRoot() {                                                                                   // 3133
          return wrap(unwrap(this).animatedInstanceRoot);                                                              // 3134
        }                                                                                                              // 3135
      });                                                                                                              // 3136
    }                                                                                                                  // 3137
    registerWrapper(OriginalSVGUseElement, SVGUseElement, useElement);                                                 // 3138
    scope.wrappers.SVGUseElement = SVGUseElement;                                                                      // 3139
  })(window.ShadowDOMPolyfill);                                                                                        // 3140
  (function(scope) {                                                                                                   // 3141
    "use strict";                                                                                                      // 3142
    var EventTarget = scope.wrappers.EventTarget;                                                                      // 3143
    var mixin = scope.mixin;                                                                                           // 3144
    var registerWrapper = scope.registerWrapper;                                                                       // 3145
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3146
    var wrap = scope.wrap;                                                                                             // 3147
    var OriginalSVGElementInstance = window.SVGElementInstance;                                                        // 3148
    if (!OriginalSVGElementInstance) return;                                                                           // 3149
    function SVGElementInstance(impl) {                                                                                // 3150
      EventTarget.call(this, impl);                                                                                    // 3151
    }                                                                                                                  // 3152
    SVGElementInstance.prototype = Object.create(EventTarget.prototype);                                               // 3153
    mixin(SVGElementInstance.prototype, {                                                                              // 3154
      get correspondingElement() {                                                                                     // 3155
        return wrap(unsafeUnwrap(this).correspondingElement);                                                          // 3156
      },                                                                                                               // 3157
      get correspondingUseElement() {                                                                                  // 3158
        return wrap(unsafeUnwrap(this).correspondingUseElement);                                                       // 3159
      },                                                                                                               // 3160
      get parentNode() {                                                                                               // 3161
        return wrap(unsafeUnwrap(this).parentNode);                                                                    // 3162
      },                                                                                                               // 3163
      get childNodes() {                                                                                               // 3164
        throw new Error("Not implemented");                                                                            // 3165
      },                                                                                                               // 3166
      get firstChild() {                                                                                               // 3167
        return wrap(unsafeUnwrap(this).firstChild);                                                                    // 3168
      },                                                                                                               // 3169
      get lastChild() {                                                                                                // 3170
        return wrap(unsafeUnwrap(this).lastChild);                                                                     // 3171
      },                                                                                                               // 3172
      get previousSibling() {                                                                                          // 3173
        return wrap(unsafeUnwrap(this).previousSibling);                                                               // 3174
      },                                                                                                               // 3175
      get nextSibling() {                                                                                              // 3176
        return wrap(unsafeUnwrap(this).nextSibling);                                                                   // 3177
      }                                                                                                                // 3178
    });                                                                                                                // 3179
    registerWrapper(OriginalSVGElementInstance, SVGElementInstance);                                                   // 3180
    scope.wrappers.SVGElementInstance = SVGElementInstance;                                                            // 3181
  })(window.ShadowDOMPolyfill);                                                                                        // 3182
  (function(scope) {                                                                                                   // 3183
    "use strict";                                                                                                      // 3184
    var mixin = scope.mixin;                                                                                           // 3185
    var registerWrapper = scope.registerWrapper;                                                                       // 3186
    var setWrapper = scope.setWrapper;                                                                                 // 3187
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3188
    var unwrap = scope.unwrap;                                                                                         // 3189
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 3190
    var wrap = scope.wrap;                                                                                             // 3191
    var OriginalCanvasRenderingContext2D = window.CanvasRenderingContext2D;                                            // 3192
    function CanvasRenderingContext2D(impl) {                                                                          // 3193
      setWrapper(impl, this);                                                                                          // 3194
    }                                                                                                                  // 3195
    mixin(CanvasRenderingContext2D.prototype, {                                                                        // 3196
      get canvas() {                                                                                                   // 3197
        return wrap(unsafeUnwrap(this).canvas);                                                                        // 3198
      },                                                                                                               // 3199
      drawImage: function() {                                                                                          // 3200
        arguments[0] = unwrapIfNeeded(arguments[0]);                                                                   // 3201
        unsafeUnwrap(this).drawImage.apply(unsafeUnwrap(this), arguments);                                             // 3202
      },                                                                                                               // 3203
      createPattern: function() {                                                                                      // 3204
        arguments[0] = unwrap(arguments[0]);                                                                           // 3205
        return unsafeUnwrap(this).createPattern.apply(unsafeUnwrap(this), arguments);                                  // 3206
      }                                                                                                                // 3207
    });                                                                                                                // 3208
    registerWrapper(OriginalCanvasRenderingContext2D, CanvasRenderingContext2D, document.createElement("canvas").getContext("2d"));
    scope.wrappers.CanvasRenderingContext2D = CanvasRenderingContext2D;                                                // 3210
  })(window.ShadowDOMPolyfill);                                                                                        // 3211
  (function(scope) {                                                                                                   // 3212
    "use strict";                                                                                                      // 3213
    var mixin = scope.mixin;                                                                                           // 3214
    var registerWrapper = scope.registerWrapper;                                                                       // 3215
    var setWrapper = scope.setWrapper;                                                                                 // 3216
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3217
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 3218
    var wrap = scope.wrap;                                                                                             // 3219
    var OriginalWebGLRenderingContext = window.WebGLRenderingContext;                                                  // 3220
    if (!OriginalWebGLRenderingContext) return;                                                                        // 3221
    function WebGLRenderingContext(impl) {                                                                             // 3222
      setWrapper(impl, this);                                                                                          // 3223
    }                                                                                                                  // 3224
    mixin(WebGLRenderingContext.prototype, {                                                                           // 3225
      get canvas() {                                                                                                   // 3226
        return wrap(unsafeUnwrap(this).canvas);                                                                        // 3227
      },                                                                                                               // 3228
      texImage2D: function() {                                                                                         // 3229
        arguments[5] = unwrapIfNeeded(arguments[5]);                                                                   // 3230
        unsafeUnwrap(this).texImage2D.apply(unsafeUnwrap(this), arguments);                                            // 3231
      },                                                                                                               // 3232
      texSubImage2D: function() {                                                                                      // 3233
        arguments[6] = unwrapIfNeeded(arguments[6]);                                                                   // 3234
        unsafeUnwrap(this).texSubImage2D.apply(unsafeUnwrap(this), arguments);                                         // 3235
      }                                                                                                                // 3236
    });                                                                                                                // 3237
    var instanceProperties = /WebKit/.test(navigator.userAgent) ? {                                                    // 3238
      drawingBufferHeight: null,                                                                                       // 3239
      drawingBufferWidth: null                                                                                         // 3240
    } : {};                                                                                                            // 3241
    registerWrapper(OriginalWebGLRenderingContext, WebGLRenderingContext, instanceProperties);                         // 3242
    scope.wrappers.WebGLRenderingContext = WebGLRenderingContext;                                                      // 3243
  })(window.ShadowDOMPolyfill);                                                                                        // 3244
  (function(scope) {                                                                                                   // 3245
    "use strict";                                                                                                      // 3246
    var registerWrapper = scope.registerWrapper;                                                                       // 3247
    var setWrapper = scope.setWrapper;                                                                                 // 3248
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3249
    var unwrap = scope.unwrap;                                                                                         // 3250
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 3251
    var wrap = scope.wrap;                                                                                             // 3252
    var OriginalRange = window.Range;                                                                                  // 3253
    function Range(impl) {                                                                                             // 3254
      setWrapper(impl, this);                                                                                          // 3255
    }                                                                                                                  // 3256
    Range.prototype = {                                                                                                // 3257
      get startContainer() {                                                                                           // 3258
        return wrap(unsafeUnwrap(this).startContainer);                                                                // 3259
      },                                                                                                               // 3260
      get endContainer() {                                                                                             // 3261
        return wrap(unsafeUnwrap(this).endContainer);                                                                  // 3262
      },                                                                                                               // 3263
      get commonAncestorContainer() {                                                                                  // 3264
        return wrap(unsafeUnwrap(this).commonAncestorContainer);                                                       // 3265
      },                                                                                                               // 3266
      setStart: function(refNode, offset) {                                                                            // 3267
        unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);                                                  // 3268
      },                                                                                                               // 3269
      setEnd: function(refNode, offset) {                                                                              // 3270
        unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);                                                    // 3271
      },                                                                                                               // 3272
      setStartBefore: function(refNode) {                                                                              // 3273
        unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));                                                    // 3274
      },                                                                                                               // 3275
      setStartAfter: function(refNode) {                                                                               // 3276
        unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));                                                     // 3277
      },                                                                                                               // 3278
      setEndBefore: function(refNode) {                                                                                // 3279
        unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));                                                      // 3280
      },                                                                                                               // 3281
      setEndAfter: function(refNode) {                                                                                 // 3282
        unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));                                                       // 3283
      },                                                                                                               // 3284
      selectNode: function(refNode) {                                                                                  // 3285
        unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));                                                        // 3286
      },                                                                                                               // 3287
      selectNodeContents: function(refNode) {                                                                          // 3288
        unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));                                                // 3289
      },                                                                                                               // 3290
      compareBoundaryPoints: function(how, sourceRange) {                                                              // 3291
        return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));                                     // 3292
      },                                                                                                               // 3293
      extractContents: function() {                                                                                    // 3294
        return wrap(unsafeUnwrap(this).extractContents());                                                             // 3295
      },                                                                                                               // 3296
      cloneContents: function() {                                                                                      // 3297
        return wrap(unsafeUnwrap(this).cloneContents());                                                               // 3298
      },                                                                                                               // 3299
      insertNode: function(node) {                                                                                     // 3300
        unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));                                                           // 3301
      },                                                                                                               // 3302
      surroundContents: function(newParent) {                                                                          // 3303
        unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));                                                // 3304
      },                                                                                                               // 3305
      cloneRange: function() {                                                                                         // 3306
        return wrap(unsafeUnwrap(this).cloneRange());                                                                  // 3307
      },                                                                                                               // 3308
      isPointInRange: function(node, offset) {                                                                         // 3309
        return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);                                        // 3310
      },                                                                                                               // 3311
      comparePoint: function(node, offset) {                                                                           // 3312
        return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);                                          // 3313
      },                                                                                                               // 3314
      intersectsNode: function(node) {                                                                                 // 3315
        return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));                                                // 3316
      },                                                                                                               // 3317
      toString: function() {                                                                                           // 3318
        return unsafeUnwrap(this).toString();                                                                          // 3319
      }                                                                                                                // 3320
    };                                                                                                                 // 3321
    if (OriginalRange.prototype.createContextualFragment) {                                                            // 3322
      Range.prototype.createContextualFragment = function(html) {                                                      // 3323
        return wrap(unsafeUnwrap(this).createContextualFragment(html));                                                // 3324
      };                                                                                                               // 3325
    }                                                                                                                  // 3326
    registerWrapper(window.Range, Range, document.createRange());                                                      // 3327
    scope.wrappers.Range = Range;                                                                                      // 3328
  })(window.ShadowDOMPolyfill);                                                                                        // 3329
  (function(scope) {                                                                                                   // 3330
    "use strict";                                                                                                      // 3331
    var GetElementsByInterface = scope.GetElementsByInterface;                                                         // 3332
    var ParentNodeInterface = scope.ParentNodeInterface;                                                               // 3333
    var SelectorsInterface = scope.SelectorsInterface;                                                                 // 3334
    var mixin = scope.mixin;                                                                                           // 3335
    var registerObject = scope.registerObject;                                                                         // 3336
    var DocumentFragment = registerObject(document.createDocumentFragment());                                          // 3337
    mixin(DocumentFragment.prototype, ParentNodeInterface);                                                            // 3338
    mixin(DocumentFragment.prototype, SelectorsInterface);                                                             // 3339
    mixin(DocumentFragment.prototype, GetElementsByInterface);                                                         // 3340
    var Comment = registerObject(document.createComment(""));                                                          // 3341
    scope.wrappers.Comment = Comment;                                                                                  // 3342
    scope.wrappers.DocumentFragment = DocumentFragment;                                                                // 3343
  })(window.ShadowDOMPolyfill);                                                                                        // 3344
  (function(scope) {                                                                                                   // 3345
    "use strict";                                                                                                      // 3346
    var DocumentFragment = scope.wrappers.DocumentFragment;                                                            // 3347
    var TreeScope = scope.TreeScope;                                                                                   // 3348
    var elementFromPoint = scope.elementFromPoint;                                                                     // 3349
    var getInnerHTML = scope.getInnerHTML;                                                                             // 3350
    var getTreeScope = scope.getTreeScope;                                                                             // 3351
    var mixin = scope.mixin;                                                                                           // 3352
    var rewrap = scope.rewrap;                                                                                         // 3353
    var setInnerHTML = scope.setInnerHTML;                                                                             // 3354
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3355
    var unwrap = scope.unwrap;                                                                                         // 3356
    var shadowHostTable = new WeakMap();                                                                               // 3357
    var nextOlderShadowTreeTable = new WeakMap();                                                                      // 3358
    var spaceCharRe = /[ \t\n\r\f]/;                                                                                   // 3359
    function ShadowRoot(hostWrapper) {                                                                                 // 3360
      var node = unwrap(unsafeUnwrap(hostWrapper).ownerDocument.createDocumentFragment());                             // 3361
      DocumentFragment.call(this, node);                                                                               // 3362
      rewrap(node, this);                                                                                              // 3363
      var oldShadowRoot = hostWrapper.shadowRoot;                                                                      // 3364
      nextOlderShadowTreeTable.set(this, oldShadowRoot);                                                               // 3365
      this.treeScope_ = new TreeScope(this, getTreeScope(oldShadowRoot || hostWrapper));                               // 3366
      shadowHostTable.set(this, hostWrapper);                                                                          // 3367
    }                                                                                                                  // 3368
    ShadowRoot.prototype = Object.create(DocumentFragment.prototype);                                                  // 3369
    mixin(ShadowRoot.prototype, {                                                                                      // 3370
      constructor: ShadowRoot,                                                                                         // 3371
      get innerHTML() {                                                                                                // 3372
        return getInnerHTML(this);                                                                                     // 3373
      },                                                                                                               // 3374
      set innerHTML(value) {                                                                                           // 3375
        setInnerHTML(this, value);                                                                                     // 3376
        this.invalidateShadowRenderer();                                                                               // 3377
      },                                                                                                               // 3378
      get olderShadowRoot() {                                                                                          // 3379
        return nextOlderShadowTreeTable.get(this) || null;                                                             // 3380
      },                                                                                                               // 3381
      get host() {                                                                                                     // 3382
        return shadowHostTable.get(this) || null;                                                                      // 3383
      },                                                                                                               // 3384
      invalidateShadowRenderer: function() {                                                                           // 3385
        return shadowHostTable.get(this).invalidateShadowRenderer();                                                   // 3386
      },                                                                                                               // 3387
      elementFromPoint: function(x, y) {                                                                               // 3388
        return elementFromPoint(this, this.ownerDocument, x, y);                                                       // 3389
      },                                                                                                               // 3390
      getElementById: function(id) {                                                                                   // 3391
        if (spaceCharRe.test(id)) return null;                                                                         // 3392
        return this.querySelector('[id="' + id + '"]');                                                                // 3393
      }                                                                                                                // 3394
    });                                                                                                                // 3395
    scope.wrappers.ShadowRoot = ShadowRoot;                                                                            // 3396
  })(window.ShadowDOMPolyfill);                                                                                        // 3397
  (function(scope) {                                                                                                   // 3398
    "use strict";                                                                                                      // 3399
    var Element = scope.wrappers.Element;                                                                              // 3400
    var HTMLContentElement = scope.wrappers.HTMLContentElement;                                                        // 3401
    var HTMLShadowElement = scope.wrappers.HTMLShadowElement;                                                          // 3402
    var Node = scope.wrappers.Node;                                                                                    // 3403
    var ShadowRoot = scope.wrappers.ShadowRoot;                                                                        // 3404
    var assert = scope.assert;                                                                                         // 3405
    var getTreeScope = scope.getTreeScope;                                                                             // 3406
    var mixin = scope.mixin;                                                                                           // 3407
    var oneOf = scope.oneOf;                                                                                           // 3408
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3409
    var unwrap = scope.unwrap;                                                                                         // 3410
    var wrap = scope.wrap;                                                                                             // 3411
    var ArraySplice = scope.ArraySplice;                                                                               // 3412
    function updateWrapperUpAndSideways(wrapper) {                                                                     // 3413
      wrapper.previousSibling_ = wrapper.previousSibling;                                                              // 3414
      wrapper.nextSibling_ = wrapper.nextSibling;                                                                      // 3415
      wrapper.parentNode_ = wrapper.parentNode;                                                                        // 3416
    }                                                                                                                  // 3417
    function updateWrapperDown(wrapper) {                                                                              // 3418
      wrapper.firstChild_ = wrapper.firstChild;                                                                        // 3419
      wrapper.lastChild_ = wrapper.lastChild;                                                                          // 3420
    }                                                                                                                  // 3421
    function updateAllChildNodes(parentNodeWrapper) {                                                                  // 3422
      assert(parentNodeWrapper instanceof Node);                                                                       // 3423
      for (var childWrapper = parentNodeWrapper.firstChild; childWrapper; childWrapper = childWrapper.nextSibling) {   // 3424
        updateWrapperUpAndSideways(childWrapper);                                                                      // 3425
      }                                                                                                                // 3426
      updateWrapperDown(parentNodeWrapper);                                                                            // 3427
    }                                                                                                                  // 3428
    function insertBefore(parentNodeWrapper, newChildWrapper, refChildWrapper) {                                       // 3429
      var parentNode = unwrap(parentNodeWrapper);                                                                      // 3430
      var newChild = unwrap(newChildWrapper);                                                                          // 3431
      var refChild = refChildWrapper ? unwrap(refChildWrapper) : null;                                                 // 3432
      remove(newChildWrapper);                                                                                         // 3433
      updateWrapperUpAndSideways(newChildWrapper);                                                                     // 3434
      if (!refChildWrapper) {                                                                                          // 3435
        parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;                                                    // 3436
        if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild) parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;
        var lastChildWrapper = wrap(parentNode.lastChild);                                                             // 3438
        if (lastChildWrapper) lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;                            // 3439
      } else {                                                                                                         // 3440
        if (parentNodeWrapper.firstChild === refChildWrapper) parentNodeWrapper.firstChild_ = refChildWrapper;         // 3441
        refChildWrapper.previousSibling_ = refChildWrapper.previousSibling;                                            // 3442
      }                                                                                                                // 3443
      scope.originalInsertBefore.call(parentNode, newChild, refChild);                                                 // 3444
    }                                                                                                                  // 3445
    function remove(nodeWrapper) {                                                                                     // 3446
      var node = unwrap(nodeWrapper);                                                                                  // 3447
      var parentNode = node.parentNode;                                                                                // 3448
      if (!parentNode) return;                                                                                         // 3449
      var parentNodeWrapper = wrap(parentNode);                                                                        // 3450
      updateWrapperUpAndSideways(nodeWrapper);                                                                         // 3451
      if (nodeWrapper.previousSibling) nodeWrapper.previousSibling.nextSibling_ = nodeWrapper;                         // 3452
      if (nodeWrapper.nextSibling) nodeWrapper.nextSibling.previousSibling_ = nodeWrapper;                             // 3453
      if (parentNodeWrapper.lastChild === nodeWrapper) parentNodeWrapper.lastChild_ = nodeWrapper;                     // 3454
      if (parentNodeWrapper.firstChild === nodeWrapper) parentNodeWrapper.firstChild_ = nodeWrapper;                   // 3455
      scope.originalRemoveChild.call(parentNode, node);                                                                // 3456
    }                                                                                                                  // 3457
    var distributedNodesTable = new WeakMap();                                                                         // 3458
    var destinationInsertionPointsTable = new WeakMap();                                                               // 3459
    var rendererForHostTable = new WeakMap();                                                                          // 3460
    function resetDistributedNodes(insertionPoint) {                                                                   // 3461
      distributedNodesTable.set(insertionPoint, []);                                                                   // 3462
    }                                                                                                                  // 3463
    function getDistributedNodes(insertionPoint) {                                                                     // 3464
      var rv = distributedNodesTable.get(insertionPoint);                                                              // 3465
      if (!rv) distributedNodesTable.set(insertionPoint, rv = []);                                                     // 3466
      return rv;                                                                                                       // 3467
    }                                                                                                                  // 3468
    function getChildNodesSnapshot(node) {                                                                             // 3469
      var result = [], i = 0;                                                                                          // 3470
      for (var child = node.firstChild; child; child = child.nextSibling) {                                            // 3471
        result[i++] = child;                                                                                           // 3472
      }                                                                                                                // 3473
      return result;                                                                                                   // 3474
    }                                                                                                                  // 3475
    var request = oneOf(window, [ "requestAnimationFrame", "mozRequestAnimationFrame", "webkitRequestAnimationFrame", "setTimeout" ]);
    var pendingDirtyRenderers = [];                                                                                    // 3477
    var renderTimer;                                                                                                   // 3478
    function renderAllPending() {                                                                                      // 3479
      for (var i = 0; i < pendingDirtyRenderers.length; i++) {                                                         // 3480
        var renderer = pendingDirtyRenderers[i];                                                                       // 3481
        var parentRenderer = renderer.parentRenderer;                                                                  // 3482
        if (parentRenderer && parentRenderer.dirty) continue;                                                          // 3483
        renderer.render();                                                                                             // 3484
      }                                                                                                                // 3485
      pendingDirtyRenderers = [];                                                                                      // 3486
    }                                                                                                                  // 3487
    function handleRequestAnimationFrame() {                                                                           // 3488
      renderTimer = null;                                                                                              // 3489
      renderAllPending();                                                                                              // 3490
    }                                                                                                                  // 3491
    function getRendererForHost(host) {                                                                                // 3492
      var renderer = rendererForHostTable.get(host);                                                                   // 3493
      if (!renderer) {                                                                                                 // 3494
        renderer = new ShadowRenderer(host);                                                                           // 3495
        rendererForHostTable.set(host, renderer);                                                                      // 3496
      }                                                                                                                // 3497
      return renderer;                                                                                                 // 3498
    }                                                                                                                  // 3499
    function getShadowRootAncestor(node) {                                                                             // 3500
      var root = getTreeScope(node).root;                                                                              // 3501
      if (root instanceof ShadowRoot) return root;                                                                     // 3502
      return null;                                                                                                     // 3503
    }                                                                                                                  // 3504
    function getRendererForShadowRoot(shadowRoot) {                                                                    // 3505
      return getRendererForHost(shadowRoot.host);                                                                      // 3506
    }                                                                                                                  // 3507
    var spliceDiff = new ArraySplice();                                                                                // 3508
    spliceDiff.equals = function(renderNode, rawNode) {                                                                // 3509
      return unwrap(renderNode.node) === rawNode;                                                                      // 3510
    };                                                                                                                 // 3511
    function RenderNode(node) {                                                                                        // 3512
      this.skip = false;                                                                                               // 3513
      this.node = node;                                                                                                // 3514
      this.childNodes = [];                                                                                            // 3515
    }                                                                                                                  // 3516
    RenderNode.prototype = {                                                                                           // 3517
      append: function(node) {                                                                                         // 3518
        var rv = new RenderNode(node);                                                                                 // 3519
        this.childNodes.push(rv);                                                                                      // 3520
        return rv;                                                                                                     // 3521
      },                                                                                                               // 3522
      sync: function(opt_added) {                                                                                      // 3523
        if (this.skip) return;                                                                                         // 3524
        var nodeWrapper = this.node;                                                                                   // 3525
        var newChildren = this.childNodes;                                                                             // 3526
        var oldChildren = getChildNodesSnapshot(unwrap(nodeWrapper));                                                  // 3527
        var added = opt_added || new WeakMap();                                                                        // 3528
        var splices = spliceDiff.calculateSplices(newChildren, oldChildren);                                           // 3529
        var newIndex = 0, oldIndex = 0;                                                                                // 3530
        var lastIndex = 0;                                                                                             // 3531
        for (var i = 0; i < splices.length; i++) {                                                                     // 3532
          var splice = splices[i];                                                                                     // 3533
          for (;lastIndex < splice.index; lastIndex++) {                                                               // 3534
            oldIndex++;                                                                                                // 3535
            newChildren[newIndex++].sync(added);                                                                       // 3536
          }                                                                                                            // 3537
          var removedCount = splice.removed.length;                                                                    // 3538
          for (var j = 0; j < removedCount; j++) {                                                                     // 3539
            var wrapper = wrap(oldChildren[oldIndex++]);                                                               // 3540
            if (!added.get(wrapper)) remove(wrapper);                                                                  // 3541
          }                                                                                                            // 3542
          var addedCount = splice.addedCount;                                                                          // 3543
          var refNode = oldChildren[oldIndex] && wrap(oldChildren[oldIndex]);                                          // 3544
          for (var j = 0; j < addedCount; j++) {                                                                       // 3545
            var newChildRenderNode = newChildren[newIndex++];                                                          // 3546
            var newChildWrapper = newChildRenderNode.node;                                                             // 3547
            insertBefore(nodeWrapper, newChildWrapper, refNode);                                                       // 3548
            added.set(newChildWrapper, true);                                                                          // 3549
            newChildRenderNode.sync(added);                                                                            // 3550
          }                                                                                                            // 3551
          lastIndex += addedCount;                                                                                     // 3552
        }                                                                                                              // 3553
        for (var i = lastIndex; i < newChildren.length; i++) {                                                         // 3554
          newChildren[i].sync(added);                                                                                  // 3555
        }                                                                                                              // 3556
      }                                                                                                                // 3557
    };                                                                                                                 // 3558
    function ShadowRenderer(host) {                                                                                    // 3559
      this.host = host;                                                                                                // 3560
      this.dirty = false;                                                                                              // 3561
      this.invalidateAttributes();                                                                                     // 3562
      this.associateNode(host);                                                                                        // 3563
    }                                                                                                                  // 3564
    ShadowRenderer.prototype = {                                                                                       // 3565
      render: function(opt_renderNode) {                                                                               // 3566
        if (!this.dirty) return;                                                                                       // 3567
        this.invalidateAttributes();                                                                                   // 3568
        var host = this.host;                                                                                          // 3569
        this.distribution(host);                                                                                       // 3570
        var renderNode = opt_renderNode || new RenderNode(host);                                                       // 3571
        this.buildRenderTree(renderNode, host);                                                                        // 3572
        var topMostRenderer = !opt_renderNode;                                                                         // 3573
        if (topMostRenderer) renderNode.sync();                                                                        // 3574
        this.dirty = false;                                                                                            // 3575
      },                                                                                                               // 3576
      get parentRenderer() {                                                                                           // 3577
        return getTreeScope(this.host).renderer;                                                                       // 3578
      },                                                                                                               // 3579
      invalidate: function() {                                                                                         // 3580
        if (!this.dirty) {                                                                                             // 3581
          this.dirty = true;                                                                                           // 3582
          var parentRenderer = this.parentRenderer;                                                                    // 3583
          if (parentRenderer) parentRenderer.invalidate();                                                             // 3584
          pendingDirtyRenderers.push(this);                                                                            // 3585
          if (renderTimer) return;                                                                                     // 3586
          renderTimer = window[request](handleRequestAnimationFrame, 0);                                               // 3587
        }                                                                                                              // 3588
      },                                                                                                               // 3589
      distribution: function(root) {                                                                                   // 3590
        this.resetAllSubtrees(root);                                                                                   // 3591
        this.distributionResolution(root);                                                                             // 3592
      },                                                                                                               // 3593
      resetAll: function(node) {                                                                                       // 3594
        if (isInsertionPoint(node)) resetDistributedNodes(node); else resetDestinationInsertionPoints(node);           // 3595
        this.resetAllSubtrees(node);                                                                                   // 3596
      },                                                                                                               // 3597
      resetAllSubtrees: function(node) {                                                                               // 3598
        for (var child = node.firstChild; child; child = child.nextSibling) {                                          // 3599
          this.resetAll(child);                                                                                        // 3600
        }                                                                                                              // 3601
        if (node.shadowRoot) this.resetAll(node.shadowRoot);                                                           // 3602
        if (node.olderShadowRoot) this.resetAll(node.olderShadowRoot);                                                 // 3603
      },                                                                                                               // 3604
      distributionResolution: function(node) {                                                                         // 3605
        if (isShadowHost(node)) {                                                                                      // 3606
          var shadowHost = node;                                                                                       // 3607
          var pool = poolPopulation(shadowHost);                                                                       // 3608
          var shadowTrees = getShadowTrees(shadowHost);                                                                // 3609
          for (var i = 0; i < shadowTrees.length; i++) {                                                               // 3610
            this.poolDistribution(shadowTrees[i], pool);                                                               // 3611
          }                                                                                                            // 3612
          for (var i = shadowTrees.length - 1; i >= 0; i--) {                                                          // 3613
            var shadowTree = shadowTrees[i];                                                                           // 3614
            var shadow = getShadowInsertionPoint(shadowTree);                                                          // 3615
            if (shadow) {                                                                                              // 3616
              var olderShadowRoot = shadowTree.olderShadowRoot;                                                        // 3617
              if (olderShadowRoot) {                                                                                   // 3618
                pool = poolPopulation(olderShadowRoot);                                                                // 3619
              }                                                                                                        // 3620
              for (var j = 0; j < pool.length; j++) {                                                                  // 3621
                destributeNodeInto(pool[j], shadow);                                                                   // 3622
              }                                                                                                        // 3623
            }                                                                                                          // 3624
            this.distributionResolution(shadowTree);                                                                   // 3625
          }                                                                                                            // 3626
        }                                                                                                              // 3627
        for (var child = node.firstChild; child; child = child.nextSibling) {                                          // 3628
          this.distributionResolution(child);                                                                          // 3629
        }                                                                                                              // 3630
      },                                                                                                               // 3631
      poolDistribution: function(node, pool) {                                                                         // 3632
        if (node instanceof HTMLShadowElement) return;                                                                 // 3633
        if (node instanceof HTMLContentElement) {                                                                      // 3634
          var content = node;                                                                                          // 3635
          this.updateDependentAttributes(content.getAttribute("select"));                                              // 3636
          var anyDistributed = false;                                                                                  // 3637
          for (var i = 0; i < pool.length; i++) {                                                                      // 3638
            var node = pool[i];                                                                                        // 3639
            if (!node) continue;                                                                                       // 3640
            if (matches(node, content)) {                                                                              // 3641
              destributeNodeInto(node, content);                                                                       // 3642
              pool[i] = undefined;                                                                                     // 3643
              anyDistributed = true;                                                                                   // 3644
            }                                                                                                          // 3645
          }                                                                                                            // 3646
          if (!anyDistributed) {                                                                                       // 3647
            for (var child = content.firstChild; child; child = child.nextSibling) {                                   // 3648
              destributeNodeInto(child, content);                                                                      // 3649
            }                                                                                                          // 3650
          }                                                                                                            // 3651
          return;                                                                                                      // 3652
        }                                                                                                              // 3653
        for (var child = node.firstChild; child; child = child.nextSibling) {                                          // 3654
          this.poolDistribution(child, pool);                                                                          // 3655
        }                                                                                                              // 3656
      },                                                                                                               // 3657
      buildRenderTree: function(renderNode, node) {                                                                    // 3658
        var children = this.compose(node);                                                                             // 3659
        for (var i = 0; i < children.length; i++) {                                                                    // 3660
          var child = children[i];                                                                                     // 3661
          var childRenderNode = renderNode.append(child);                                                              // 3662
          this.buildRenderTree(childRenderNode, child);                                                                // 3663
        }                                                                                                              // 3664
        if (isShadowHost(node)) {                                                                                      // 3665
          var renderer = getRendererForHost(node);                                                                     // 3666
          renderer.dirty = false;                                                                                      // 3667
        }                                                                                                              // 3668
      },                                                                                                               // 3669
      compose: function(node) {                                                                                        // 3670
        var children = [];                                                                                             // 3671
        var p = node.shadowRoot || node;                                                                               // 3672
        for (var child = p.firstChild; child; child = child.nextSibling) {                                             // 3673
          if (isInsertionPoint(child)) {                                                                               // 3674
            this.associateNode(p);                                                                                     // 3675
            var distributedNodes = getDistributedNodes(child);                                                         // 3676
            for (var j = 0; j < distributedNodes.length; j++) {                                                        // 3677
              var distributedNode = distributedNodes[j];                                                               // 3678
              if (isFinalDestination(child, distributedNode)) children.push(distributedNode);                          // 3679
            }                                                                                                          // 3680
          } else {                                                                                                     // 3681
            children.push(child);                                                                                      // 3682
          }                                                                                                            // 3683
        }                                                                                                              // 3684
        return children;                                                                                               // 3685
      },                                                                                                               // 3686
      invalidateAttributes: function() {                                                                               // 3687
        this.attributes = Object.create(null);                                                                         // 3688
      },                                                                                                               // 3689
      updateDependentAttributes: function(selector) {                                                                  // 3690
        if (!selector) return;                                                                                         // 3691
        var attributes = this.attributes;                                                                              // 3692
        if (/\.\w+/.test(selector)) attributes["class"] = true;                                                        // 3693
        if (/#\w+/.test(selector)) attributes["id"] = true;                                                            // 3694
        selector.replace(/\[\s*([^\s=\|~\]]+)/g, function(_, name) {                                                   // 3695
          attributes[name] = true;                                                                                     // 3696
        });                                                                                                            // 3697
      },                                                                                                               // 3698
      dependsOnAttribute: function(name) {                                                                             // 3699
        return this.attributes[name];                                                                                  // 3700
      },                                                                                                               // 3701
      associateNode: function(node) {                                                                                  // 3702
        unsafeUnwrap(node).polymerShadowRenderer_ = this;                                                              // 3703
      }                                                                                                                // 3704
    };                                                                                                                 // 3705
    function poolPopulation(node) {                                                                                    // 3706
      var pool = [];                                                                                                   // 3707
      for (var child = node.firstChild; child; child = child.nextSibling) {                                            // 3708
        if (isInsertionPoint(child)) {                                                                                 // 3709
          pool.push.apply(pool, getDistributedNodes(child));                                                           // 3710
        } else {                                                                                                       // 3711
          pool.push(child);                                                                                            // 3712
        }                                                                                                              // 3713
      }                                                                                                                // 3714
      return pool;                                                                                                     // 3715
    }                                                                                                                  // 3716
    function getShadowInsertionPoint(node) {                                                                           // 3717
      if (node instanceof HTMLShadowElement) return node;                                                              // 3718
      if (node instanceof HTMLContentElement) return null;                                                             // 3719
      for (var child = node.firstChild; child; child = child.nextSibling) {                                            // 3720
        var res = getShadowInsertionPoint(child);                                                                      // 3721
        if (res) return res;                                                                                           // 3722
      }                                                                                                                // 3723
      return null;                                                                                                     // 3724
    }                                                                                                                  // 3725
    function destributeNodeInto(child, insertionPoint) {                                                               // 3726
      getDistributedNodes(insertionPoint).push(child);                                                                 // 3727
      var points = destinationInsertionPointsTable.get(child);                                                         // 3728
      if (!points) destinationInsertionPointsTable.set(child, [ insertionPoint ]); else points.push(insertionPoint);   // 3729
    }                                                                                                                  // 3730
    function getDestinationInsertionPoints(node) {                                                                     // 3731
      return destinationInsertionPointsTable.get(node);                                                                // 3732
    }                                                                                                                  // 3733
    function resetDestinationInsertionPoints(node) {                                                                   // 3734
      destinationInsertionPointsTable.set(node, undefined);                                                            // 3735
    }                                                                                                                  // 3736
    var selectorStartCharRe = /^(:not\()?[*.#[a-zA-Z_|]/;                                                              // 3737
    function matches(node, contentElement) {                                                                           // 3738
      var select = contentElement.getAttribute("select");                                                              // 3739
      if (!select) return true;                                                                                        // 3740
      select = select.trim();                                                                                          // 3741
      if (!select) return true;                                                                                        // 3742
      if (!(node instanceof Element)) return false;                                                                    // 3743
      if (!selectorStartCharRe.test(select)) return false;                                                             // 3744
      try {                                                                                                            // 3745
        return node.matches(select);                                                                                   // 3746
      } catch (ex) {                                                                                                   // 3747
        return false;                                                                                                  // 3748
      }                                                                                                                // 3749
    }                                                                                                                  // 3750
    function isFinalDestination(insertionPoint, node) {                                                                // 3751
      var points = getDestinationInsertionPoints(node);                                                                // 3752
      return points && points[points.length - 1] === insertionPoint;                                                   // 3753
    }                                                                                                                  // 3754
    function isInsertionPoint(node) {                                                                                  // 3755
      return node instanceof HTMLContentElement || node instanceof HTMLShadowElement;                                  // 3756
    }                                                                                                                  // 3757
    function isShadowHost(shadowHost) {                                                                                // 3758
      return shadowHost.shadowRoot;                                                                                    // 3759
    }                                                                                                                  // 3760
    function getShadowTrees(host) {                                                                                    // 3761
      var trees = [];                                                                                                  // 3762
      for (var tree = host.shadowRoot; tree; tree = tree.olderShadowRoot) {                                            // 3763
        trees.push(tree);                                                                                              // 3764
      }                                                                                                                // 3765
      return trees;                                                                                                    // 3766
    }                                                                                                                  // 3767
    function render(host) {                                                                                            // 3768
      new ShadowRenderer(host).render();                                                                               // 3769
    }                                                                                                                  // 3770
    Node.prototype.invalidateShadowRenderer = function(force) {                                                        // 3771
      var renderer = unsafeUnwrap(this).polymerShadowRenderer_;                                                        // 3772
      if (renderer) {                                                                                                  // 3773
        renderer.invalidate();                                                                                         // 3774
        return true;                                                                                                   // 3775
      }                                                                                                                // 3776
      return false;                                                                                                    // 3777
    };                                                                                                                 // 3778
    HTMLContentElement.prototype.getDistributedNodes = HTMLShadowElement.prototype.getDistributedNodes = function() {  // 3779
      renderAllPending();                                                                                              // 3780
      return getDistributedNodes(this);                                                                                // 3781
    };                                                                                                                 // 3782
    Element.prototype.getDestinationInsertionPoints = function() {                                                     // 3783
      renderAllPending();                                                                                              // 3784
      return getDestinationInsertionPoints(this) || [];                                                                // 3785
    };                                                                                                                 // 3786
    HTMLContentElement.prototype.nodeIsInserted_ = HTMLShadowElement.prototype.nodeIsInserted_ = function() {          // 3787
      this.invalidateShadowRenderer();                                                                                 // 3788
      var shadowRoot = getShadowRootAncestor(this);                                                                    // 3789
      var renderer;                                                                                                    // 3790
      if (shadowRoot) renderer = getRendererForShadowRoot(shadowRoot);                                                 // 3791
      unsafeUnwrap(this).polymerShadowRenderer_ = renderer;                                                            // 3792
      if (renderer) renderer.invalidate();                                                                             // 3793
    };                                                                                                                 // 3794
    scope.getRendererForHost = getRendererForHost;                                                                     // 3795
    scope.getShadowTrees = getShadowTrees;                                                                             // 3796
    scope.renderAllPending = renderAllPending;                                                                         // 3797
    scope.getDestinationInsertionPoints = getDestinationInsertionPoints;                                               // 3798
    scope.visual = {                                                                                                   // 3799
      insertBefore: insertBefore,                                                                                      // 3800
      remove: remove                                                                                                   // 3801
    };                                                                                                                 // 3802
  })(window.ShadowDOMPolyfill);                                                                                        // 3803
  (function(scope) {                                                                                                   // 3804
    "use strict";                                                                                                      // 3805
    var HTMLElement = scope.wrappers.HTMLElement;                                                                      // 3806
    var assert = scope.assert;                                                                                         // 3807
    var mixin = scope.mixin;                                                                                           // 3808
    var registerWrapper = scope.registerWrapper;                                                                       // 3809
    var unwrap = scope.unwrap;                                                                                         // 3810
    var wrap = scope.wrap;                                                                                             // 3811
    var elementsWithFormProperty = [ "HTMLButtonElement", "HTMLFieldSetElement", "HTMLInputElement", "HTMLKeygenElement", "HTMLLabelElement", "HTMLLegendElement", "HTMLObjectElement", "HTMLOutputElement", "HTMLTextAreaElement" ];
    function createWrapperConstructor(name) {                                                                          // 3813
      if (!window[name]) return;                                                                                       // 3814
      assert(!scope.wrappers[name]);                                                                                   // 3815
      var GeneratedWrapper = function(node) {                                                                          // 3816
        HTMLElement.call(this, node);                                                                                  // 3817
      };                                                                                                               // 3818
      GeneratedWrapper.prototype = Object.create(HTMLElement.prototype);                                               // 3819
      mixin(GeneratedWrapper.prototype, {                                                                              // 3820
        get form() {                                                                                                   // 3821
          return wrap(unwrap(this).form);                                                                              // 3822
        }                                                                                                              // 3823
      });                                                                                                              // 3824
      registerWrapper(window[name], GeneratedWrapper, document.createElement(name.slice(4, -7)));                      // 3825
      scope.wrappers[name] = GeneratedWrapper;                                                                         // 3826
    }                                                                                                                  // 3827
    elementsWithFormProperty.forEach(createWrapperConstructor);                                                        // 3828
  })(window.ShadowDOMPolyfill);                                                                                        // 3829
  (function(scope) {                                                                                                   // 3830
    "use strict";                                                                                                      // 3831
    var registerWrapper = scope.registerWrapper;                                                                       // 3832
    var setWrapper = scope.setWrapper;                                                                                 // 3833
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3834
    var unwrap = scope.unwrap;                                                                                         // 3835
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 3836
    var wrap = scope.wrap;                                                                                             // 3837
    var OriginalSelection = window.Selection;                                                                          // 3838
    function Selection(impl) {                                                                                         // 3839
      setWrapper(impl, this);                                                                                          // 3840
    }                                                                                                                  // 3841
    Selection.prototype = {                                                                                            // 3842
      get anchorNode() {                                                                                               // 3843
        return wrap(unsafeUnwrap(this).anchorNode);                                                                    // 3844
      },                                                                                                               // 3845
      get focusNode() {                                                                                                // 3846
        return wrap(unsafeUnwrap(this).focusNode);                                                                     // 3847
      },                                                                                                               // 3848
      addRange: function(range) {                                                                                      // 3849
        unsafeUnwrap(this).addRange(unwrap(range));                                                                    // 3850
      },                                                                                                               // 3851
      collapse: function(node, index) {                                                                                // 3852
        unsafeUnwrap(this).collapse(unwrapIfNeeded(node), index);                                                      // 3853
      },                                                                                                               // 3854
      containsNode: function(node, allowPartial) {                                                                     // 3855
        return unsafeUnwrap(this).containsNode(unwrapIfNeeded(node), allowPartial);                                    // 3856
      },                                                                                                               // 3857
      extend: function(node, offset) {                                                                                 // 3858
        unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);                                                       // 3859
      },                                                                                                               // 3860
      getRangeAt: function(index) {                                                                                    // 3861
        return wrap(unsafeUnwrap(this).getRangeAt(index));                                                             // 3862
      },                                                                                                               // 3863
      removeRange: function(range) {                                                                                   // 3864
        unsafeUnwrap(this).removeRange(unwrap(range));                                                                 // 3865
      },                                                                                                               // 3866
      selectAllChildren: function(node) {                                                                              // 3867
        unsafeUnwrap(this).selectAllChildren(unwrapIfNeeded(node));                                                    // 3868
      },                                                                                                               // 3869
      toString: function() {                                                                                           // 3870
        return unsafeUnwrap(this).toString();                                                                          // 3871
      }                                                                                                                // 3872
    };                                                                                                                 // 3873
    registerWrapper(window.Selection, Selection, window.getSelection());                                               // 3874
    scope.wrappers.Selection = Selection;                                                                              // 3875
  })(window.ShadowDOMPolyfill);                                                                                        // 3876
  (function(scope) {                                                                                                   // 3877
    "use strict";                                                                                                      // 3878
    var GetElementsByInterface = scope.GetElementsByInterface;                                                         // 3879
    var Node = scope.wrappers.Node;                                                                                    // 3880
    var ParentNodeInterface = scope.ParentNodeInterface;                                                               // 3881
    var Selection = scope.wrappers.Selection;                                                                          // 3882
    var SelectorsInterface = scope.SelectorsInterface;                                                                 // 3883
    var ShadowRoot = scope.wrappers.ShadowRoot;                                                                        // 3884
    var TreeScope = scope.TreeScope;                                                                                   // 3885
    var cloneNode = scope.cloneNode;                                                                                   // 3886
    var defineWrapGetter = scope.defineWrapGetter;                                                                     // 3887
    var elementFromPoint = scope.elementFromPoint;                                                                     // 3888
    var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;                                                       // 3889
    var matchesNames = scope.matchesNames;                                                                             // 3890
    var mixin = scope.mixin;                                                                                           // 3891
    var registerWrapper = scope.registerWrapper;                                                                       // 3892
    var renderAllPending = scope.renderAllPending;                                                                     // 3893
    var rewrap = scope.rewrap;                                                                                         // 3894
    var setWrapper = scope.setWrapper;                                                                                 // 3895
    var unsafeUnwrap = scope.unsafeUnwrap;                                                                             // 3896
    var unwrap = scope.unwrap;                                                                                         // 3897
    var wrap = scope.wrap;                                                                                             // 3898
    var wrapEventTargetMethods = scope.wrapEventTargetMethods;                                                         // 3899
    var wrapNodeList = scope.wrapNodeList;                                                                             // 3900
    var implementationTable = new WeakMap();                                                                           // 3901
    function Document(node) {                                                                                          // 3902
      Node.call(this, node);                                                                                           // 3903
      this.treeScope_ = new TreeScope(this, null);                                                                     // 3904
    }                                                                                                                  // 3905
    Document.prototype = Object.create(Node.prototype);                                                                // 3906
    defineWrapGetter(Document, "documentElement");                                                                     // 3907
    defineWrapGetter(Document, "body");                                                                                // 3908
    defineWrapGetter(Document, "head");                                                                                // 3909
    function wrapMethod(name) {                                                                                        // 3910
      var original = document[name];                                                                                   // 3911
      Document.prototype[name] = function() {                                                                          // 3912
        return wrap(original.apply(unsafeUnwrap(this), arguments));                                                    // 3913
      };                                                                                                               // 3914
    }                                                                                                                  // 3915
    [ "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "getElementById" ].forEach(wrapMethod);
    var originalAdoptNode = document.adoptNode;                                                                        // 3917
    function adoptNodeNoRemove(node, doc) {                                                                            // 3918
      originalAdoptNode.call(unsafeUnwrap(doc), unwrap(node));                                                         // 3919
      adoptSubtree(node, doc);                                                                                         // 3920
    }                                                                                                                  // 3921
    function adoptSubtree(node, doc) {                                                                                 // 3922
      if (node.shadowRoot) doc.adoptNode(node.shadowRoot);                                                             // 3923
      if (node instanceof ShadowRoot) adoptOlderShadowRoots(node, doc);                                                // 3924
      for (var child = node.firstChild; child; child = child.nextSibling) {                                            // 3925
        adoptSubtree(child, doc);                                                                                      // 3926
      }                                                                                                                // 3927
    }                                                                                                                  // 3928
    function adoptOlderShadowRoots(shadowRoot, doc) {                                                                  // 3929
      var oldShadowRoot = shadowRoot.olderShadowRoot;                                                                  // 3930
      if (oldShadowRoot) doc.adoptNode(oldShadowRoot);                                                                 // 3931
    }                                                                                                                  // 3932
    var originalGetSelection = document.getSelection;                                                                  // 3933
    mixin(Document.prototype, {                                                                                        // 3934
      adoptNode: function(node) {                                                                                      // 3935
        if (node.parentNode) node.parentNode.removeChild(node);                                                        // 3936
        adoptNodeNoRemove(node, this);                                                                                 // 3937
        return node;                                                                                                   // 3938
      },                                                                                                               // 3939
      elementFromPoint: function(x, y) {                                                                               // 3940
        return elementFromPoint(this, this, x, y);                                                                     // 3941
      },                                                                                                               // 3942
      importNode: function(node, deep) {                                                                               // 3943
        return cloneNode(node, deep, unsafeUnwrap(this));                                                              // 3944
      },                                                                                                               // 3945
      getSelection: function() {                                                                                       // 3946
        renderAllPending();                                                                                            // 3947
        return new Selection(originalGetSelection.call(unwrap(this)));                                                 // 3948
      },                                                                                                               // 3949
      getElementsByName: function(name) {                                                                              // 3950
        return SelectorsInterface.querySelectorAll.call(this, "[name=" + JSON.stringify(String(name)) + "]");          // 3951
      }                                                                                                                // 3952
    });                                                                                                                // 3953
    if (document.registerElement) {                                                                                    // 3954
      var originalRegisterElement = document.registerElement;                                                          // 3955
      Document.prototype.registerElement = function(tagName, object) {                                                 // 3956
        var prototype, extendsOption;                                                                                  // 3957
        if (object !== undefined) {                                                                                    // 3958
          prototype = object.prototype;                                                                                // 3959
          extendsOption = object.extends;                                                                              // 3960
        }                                                                                                              // 3961
        if (!prototype) prototype = Object.create(HTMLElement.prototype);                                              // 3962
        if (scope.nativePrototypeTable.get(prototype)) {                                                               // 3963
          throw new Error("NotSupportedError");                                                                        // 3964
        }                                                                                                              // 3965
        var proto = Object.getPrototypeOf(prototype);                                                                  // 3966
        var nativePrototype;                                                                                           // 3967
        var prototypes = [];                                                                                           // 3968
        while (proto) {                                                                                                // 3969
          nativePrototype = scope.nativePrototypeTable.get(proto);                                                     // 3970
          if (nativePrototype) break;                                                                                  // 3971
          prototypes.push(proto);                                                                                      // 3972
          proto = Object.getPrototypeOf(proto);                                                                        // 3973
        }                                                                                                              // 3974
        if (!nativePrototype) {                                                                                        // 3975
          throw new Error("NotSupportedError");                                                                        // 3976
        }                                                                                                              // 3977
        var newPrototype = Object.create(nativePrototype);                                                             // 3978
        for (var i = prototypes.length - 1; i >= 0; i--) {                                                             // 3979
          newPrototype = Object.create(newPrototype);                                                                  // 3980
        }                                                                                                              // 3981
        [ "createdCallback", "attachedCallback", "detachedCallback", "attributeChangedCallback" ].forEach(function(name) {
          var f = prototype[name];                                                                                     // 3983
          if (!f) return;                                                                                              // 3984
          newPrototype[name] = function() {                                                                            // 3985
            if (!(wrap(this) instanceof CustomElementConstructor)) {                                                   // 3986
              rewrap(this);                                                                                            // 3987
            }                                                                                                          // 3988
            f.apply(wrap(this), arguments);                                                                            // 3989
          };                                                                                                           // 3990
        });                                                                                                            // 3991
        var p = {                                                                                                      // 3992
          prototype: newPrototype                                                                                      // 3993
        };                                                                                                             // 3994
        if (extendsOption) p.extends = extendsOption;                                                                  // 3995
        function CustomElementConstructor(node) {                                                                      // 3996
          if (!node) {                                                                                                 // 3997
            if (extendsOption) {                                                                                       // 3998
              return document.createElement(extendsOption, tagName);                                                   // 3999
            } else {                                                                                                   // 4000
              return document.createElement(tagName);                                                                  // 4001
            }                                                                                                          // 4002
          }                                                                                                            // 4003
          setWrapper(node, this);                                                                                      // 4004
        }                                                                                                              // 4005
        CustomElementConstructor.prototype = prototype;                                                                // 4006
        CustomElementConstructor.prototype.constructor = CustomElementConstructor;                                     // 4007
        scope.constructorTable.set(newPrototype, CustomElementConstructor);                                            // 4008
        scope.nativePrototypeTable.set(prototype, newPrototype);                                                       // 4009
        var nativeConstructor = originalRegisterElement.call(unwrap(this), tagName, p);                                // 4010
        return CustomElementConstructor;                                                                               // 4011
      };                                                                                                               // 4012
      forwardMethodsToWrapper([ window.HTMLDocument || window.Document ], [ "registerElement" ]);                      // 4013
    }                                                                                                                  // 4014
    forwardMethodsToWrapper([ window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement, window.HTMLHtmlElement ], [ "appendChild", "compareDocumentPosition", "contains", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "insertBefore", "querySelector", "querySelectorAll", "removeChild", "replaceChild" ].concat(matchesNames));
    forwardMethodsToWrapper([ window.HTMLDocument || window.Document ], [ "adoptNode", "importNode", "contains", "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "elementFromPoint", "getElementById", "getElementsByName", "getSelection" ]);
    mixin(Document.prototype, GetElementsByInterface);                                                                 // 4017
    mixin(Document.prototype, ParentNodeInterface);                                                                    // 4018
    mixin(Document.prototype, SelectorsInterface);                                                                     // 4019
    mixin(Document.prototype, {                                                                                        // 4020
      get implementation() {                                                                                           // 4021
        var implementation = implementationTable.get(this);                                                            // 4022
        if (implementation) return implementation;                                                                     // 4023
        implementation = new DOMImplementation(unwrap(this).implementation);                                           // 4024
        implementationTable.set(this, implementation);                                                                 // 4025
        return implementation;                                                                                         // 4026
      },                                                                                                               // 4027
      get defaultView() {                                                                                              // 4028
        return wrap(unwrap(this).defaultView);                                                                         // 4029
      }                                                                                                                // 4030
    });                                                                                                                // 4031
    registerWrapper(window.Document, Document, document.implementation.createHTMLDocument(""));                        // 4032
    if (window.HTMLDocument) registerWrapper(window.HTMLDocument, Document);                                           // 4033
    wrapEventTargetMethods([ window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement ]);
    function DOMImplementation(impl) {                                                                                 // 4035
      setWrapper(impl, this);                                                                                          // 4036
    }                                                                                                                  // 4037
    function wrapImplMethod(constructor, name) {                                                                       // 4038
      var original = document.implementation[name];                                                                    // 4039
      constructor.prototype[name] = function() {                                                                       // 4040
        return wrap(original.apply(unsafeUnwrap(this), arguments));                                                    // 4041
      };                                                                                                               // 4042
    }                                                                                                                  // 4043
    function forwardImplMethod(constructor, name) {                                                                    // 4044
      var original = document.implementation[name];                                                                    // 4045
      constructor.prototype[name] = function() {                                                                       // 4046
        return original.apply(unsafeUnwrap(this), arguments);                                                          // 4047
      };                                                                                                               // 4048
    }                                                                                                                  // 4049
    wrapImplMethod(DOMImplementation, "createDocumentType");                                                           // 4050
    wrapImplMethod(DOMImplementation, "createDocument");                                                               // 4051
    wrapImplMethod(DOMImplementation, "createHTMLDocument");                                                           // 4052
    forwardImplMethod(DOMImplementation, "hasFeature");                                                                // 4053
    registerWrapper(window.DOMImplementation, DOMImplementation);                                                      // 4054
    forwardMethodsToWrapper([ window.DOMImplementation ], [ "createDocumentType", "createDocument", "createHTMLDocument", "hasFeature" ]);
    scope.adoptNodeNoRemove = adoptNodeNoRemove;                                                                       // 4056
    scope.wrappers.DOMImplementation = DOMImplementation;                                                              // 4057
    scope.wrappers.Document = Document;                                                                                // 4058
  })(window.ShadowDOMPolyfill);                                                                                        // 4059
  (function(scope) {                                                                                                   // 4060
    "use strict";                                                                                                      // 4061
    var EventTarget = scope.wrappers.EventTarget;                                                                      // 4062
    var Selection = scope.wrappers.Selection;                                                                          // 4063
    var mixin = scope.mixin;                                                                                           // 4064
    var registerWrapper = scope.registerWrapper;                                                                       // 4065
    var renderAllPending = scope.renderAllPending;                                                                     // 4066
    var unwrap = scope.unwrap;                                                                                         // 4067
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 4068
    var wrap = scope.wrap;                                                                                             // 4069
    var OriginalWindow = window.Window;                                                                                // 4070
    var originalGetComputedStyle = window.getComputedStyle;                                                            // 4071
    var originalGetDefaultComputedStyle = window.getDefaultComputedStyle;                                              // 4072
    var originalGetSelection = window.getSelection;                                                                    // 4073
    function Window(impl) {                                                                                            // 4074
      EventTarget.call(this, impl);                                                                                    // 4075
    }                                                                                                                  // 4076
    Window.prototype = Object.create(EventTarget.prototype);                                                           // 4077
    OriginalWindow.prototype.getComputedStyle = function(el, pseudo) {                                                 // 4078
      return wrap(this || window).getComputedStyle(unwrapIfNeeded(el), pseudo);                                        // 4079
    };                                                                                                                 // 4080
    if (originalGetDefaultComputedStyle) {                                                                             // 4081
      OriginalWindow.prototype.getDefaultComputedStyle = function(el, pseudo) {                                        // 4082
        return wrap(this || window).getDefaultComputedStyle(unwrapIfNeeded(el), pseudo);                               // 4083
      };                                                                                                               // 4084
    }                                                                                                                  // 4085
    OriginalWindow.prototype.getSelection = function() {                                                               // 4086
      return wrap(this || window).getSelection();                                                                      // 4087
    };                                                                                                                 // 4088
    delete window.getComputedStyle;                                                                                    // 4089
    delete window.getDefaultComputedStyle;                                                                             // 4090
    delete window.getSelection;                                                                                        // 4091
    [ "addEventListener", "removeEventListener", "dispatchEvent" ].forEach(function(name) {                            // 4092
      OriginalWindow.prototype[name] = function() {                                                                    // 4093
        var w = wrap(this || window);                                                                                  // 4094
        return w[name].apply(w, arguments);                                                                            // 4095
      };                                                                                                               // 4096
      delete window[name];                                                                                             // 4097
    });                                                                                                                // 4098
    mixin(Window.prototype, {                                                                                          // 4099
      getComputedStyle: function(el, pseudo) {                                                                         // 4100
        renderAllPending();                                                                                            // 4101
        return originalGetComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);                                // 4102
      },                                                                                                               // 4103
      getSelection: function() {                                                                                       // 4104
        renderAllPending();                                                                                            // 4105
        return new Selection(originalGetSelection.call(unwrap(this)));                                                 // 4106
      },                                                                                                               // 4107
      get document() {                                                                                                 // 4108
        return wrap(unwrap(this).document);                                                                            // 4109
      }                                                                                                                // 4110
    });                                                                                                                // 4111
    if (originalGetDefaultComputedStyle) {                                                                             // 4112
      Window.prototype.getDefaultComputedStyle = function(el, pseudo) {                                                // 4113
        renderAllPending();                                                                                            // 4114
        return originalGetDefaultComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);                         // 4115
      };                                                                                                               // 4116
    }                                                                                                                  // 4117
    registerWrapper(OriginalWindow, Window, window);                                                                   // 4118
    scope.wrappers.Window = Window;                                                                                    // 4119
  })(window.ShadowDOMPolyfill);                                                                                        // 4120
  (function(scope) {                                                                                                   // 4121
    "use strict";                                                                                                      // 4122
    var unwrap = scope.unwrap;                                                                                         // 4123
    var OriginalDataTransfer = window.DataTransfer || window.Clipboard;                                                // 4124
    var OriginalDataTransferSetDragImage = OriginalDataTransfer.prototype.setDragImage;                                // 4125
    if (OriginalDataTransferSetDragImage) {                                                                            // 4126
      OriginalDataTransfer.prototype.setDragImage = function(image, x, y) {                                            // 4127
        OriginalDataTransferSetDragImage.call(this, unwrap(image), x, y);                                              // 4128
      };                                                                                                               // 4129
    }                                                                                                                  // 4130
  })(window.ShadowDOMPolyfill);                                                                                        // 4131
  (function(scope) {                                                                                                   // 4132
    "use strict";                                                                                                      // 4133
    var registerWrapper = scope.registerWrapper;                                                                       // 4134
    var setWrapper = scope.setWrapper;                                                                                 // 4135
    var unwrap = scope.unwrap;                                                                                         // 4136
    var OriginalFormData = window.FormData;                                                                            // 4137
    if (!OriginalFormData) return;                                                                                     // 4138
    function FormData(formElement) {                                                                                   // 4139
      var impl;                                                                                                        // 4140
      if (formElement instanceof OriginalFormData) {                                                                   // 4141
        impl = formElement;                                                                                            // 4142
      } else {                                                                                                         // 4143
        impl = new OriginalFormData(formElement && unwrap(formElement));                                               // 4144
      }                                                                                                                // 4145
      setWrapper(impl, this);                                                                                          // 4146
    }                                                                                                                  // 4147
    registerWrapper(OriginalFormData, FormData, new OriginalFormData());                                               // 4148
    scope.wrappers.FormData = FormData;                                                                                // 4149
  })(window.ShadowDOMPolyfill);                                                                                        // 4150
  (function(scope) {                                                                                                   // 4151
    "use strict";                                                                                                      // 4152
    var unwrapIfNeeded = scope.unwrapIfNeeded;                                                                         // 4153
    var originalSend = XMLHttpRequest.prototype.send;                                                                  // 4154
    XMLHttpRequest.prototype.send = function(obj) {                                                                    // 4155
      return originalSend.call(this, unwrapIfNeeded(obj));                                                             // 4156
    };                                                                                                                 // 4157
  })(window.ShadowDOMPolyfill);                                                                                        // 4158
  (function(scope) {                                                                                                   // 4159
    "use strict";                                                                                                      // 4160
    var isWrapperFor = scope.isWrapperFor;                                                                             // 4161
    var elements = {                                                                                                   // 4162
      a: "HTMLAnchorElement",                                                                                          // 4163
      area: "HTMLAreaElement",                                                                                         // 4164
      audio: "HTMLAudioElement",                                                                                       // 4165
      base: "HTMLBaseElement",                                                                                         // 4166
      body: "HTMLBodyElement",                                                                                         // 4167
      br: "HTMLBRElement",                                                                                             // 4168
      button: "HTMLButtonElement",                                                                                     // 4169
      canvas: "HTMLCanvasElement",                                                                                     // 4170
      caption: "HTMLTableCaptionElement",                                                                              // 4171
      col: "HTMLTableColElement",                                                                                      // 4172
      content: "HTMLContentElement",                                                                                   // 4173
      data: "HTMLDataElement",                                                                                         // 4174
      datalist: "HTMLDataListElement",                                                                                 // 4175
      del: "HTMLModElement",                                                                                           // 4176
      dir: "HTMLDirectoryElement",                                                                                     // 4177
      div: "HTMLDivElement",                                                                                           // 4178
      dl: "HTMLDListElement",                                                                                          // 4179
      embed: "HTMLEmbedElement",                                                                                       // 4180
      fieldset: "HTMLFieldSetElement",                                                                                 // 4181
      font: "HTMLFontElement",                                                                                         // 4182
      form: "HTMLFormElement",                                                                                         // 4183
      frame: "HTMLFrameElement",                                                                                       // 4184
      frameset: "HTMLFrameSetElement",                                                                                 // 4185
      h1: "HTMLHeadingElement",                                                                                        // 4186
      head: "HTMLHeadElement",                                                                                         // 4187
      hr: "HTMLHRElement",                                                                                             // 4188
      html: "HTMLHtmlElement",                                                                                         // 4189
      iframe: "HTMLIFrameElement",                                                                                     // 4190
      img: "HTMLImageElement",                                                                                         // 4191
      input: "HTMLInputElement",                                                                                       // 4192
      keygen: "HTMLKeygenElement",                                                                                     // 4193
      label: "HTMLLabelElement",                                                                                       // 4194
      legend: "HTMLLegendElement",                                                                                     // 4195
      li: "HTMLLIElement",                                                                                             // 4196
      link: "HTMLLinkElement",                                                                                         // 4197
      map: "HTMLMapElement",                                                                                           // 4198
      marquee: "HTMLMarqueeElement",                                                                                   // 4199
      menu: "HTMLMenuElement",                                                                                         // 4200
      menuitem: "HTMLMenuItemElement",                                                                                 // 4201
      meta: "HTMLMetaElement",                                                                                         // 4202
      meter: "HTMLMeterElement",                                                                                       // 4203
      object: "HTMLObjectElement",                                                                                     // 4204
      ol: "HTMLOListElement",                                                                                          // 4205
      optgroup: "HTMLOptGroupElement",                                                                                 // 4206
      option: "HTMLOptionElement",                                                                                     // 4207
      output: "HTMLOutputElement",                                                                                     // 4208
      p: "HTMLParagraphElement",                                                                                       // 4209
      param: "HTMLParamElement",                                                                                       // 4210
      pre: "HTMLPreElement",                                                                                           // 4211
      progress: "HTMLProgressElement",                                                                                 // 4212
      q: "HTMLQuoteElement",                                                                                           // 4213
      script: "HTMLScriptElement",                                                                                     // 4214
      select: "HTMLSelectElement",                                                                                     // 4215
      shadow: "HTMLShadowElement",                                                                                     // 4216
      source: "HTMLSourceElement",                                                                                     // 4217
      span: "HTMLSpanElement",                                                                                         // 4218
      style: "HTMLStyleElement",                                                                                       // 4219
      table: "HTMLTableElement",                                                                                       // 4220
      tbody: "HTMLTableSectionElement",                                                                                // 4221
      template: "HTMLTemplateElement",                                                                                 // 4222
      textarea: "HTMLTextAreaElement",                                                                                 // 4223
      thead: "HTMLTableSectionElement",                                                                                // 4224
      time: "HTMLTimeElement",                                                                                         // 4225
      title: "HTMLTitleElement",                                                                                       // 4226
      tr: "HTMLTableRowElement",                                                                                       // 4227
      track: "HTMLTrackElement",                                                                                       // 4228
      ul: "HTMLUListElement",                                                                                          // 4229
      video: "HTMLVideoElement"                                                                                        // 4230
    };                                                                                                                 // 4231
    function overrideConstructor(tagName) {                                                                            // 4232
      var nativeConstructorName = elements[tagName];                                                                   // 4233
      var nativeConstructor = window[nativeConstructorName];                                                           // 4234
      if (!nativeConstructor) return;                                                                                  // 4235
      var element = document.createElement(tagName);                                                                   // 4236
      var wrapperConstructor = element.constructor;                                                                    // 4237
      window[nativeConstructorName] = wrapperConstructor;                                                              // 4238
    }                                                                                                                  // 4239
    Object.keys(elements).forEach(overrideConstructor);                                                                // 4240
    Object.getOwnPropertyNames(scope.wrappers).forEach(function(name) {                                                // 4241
      window[name] = scope.wrappers[name];                                                                             // 4242
    });                                                                                                                // 4243
  })(window.ShadowDOMPolyfill);                                                                                        // 4244
  (function(scope) {                                                                                                   // 4245
    var ShadowCSS = {                                                                                                  // 4246
      strictStyling: false,                                                                                            // 4247
      registry: {},                                                                                                    // 4248
      shimStyling: function(root, name, extendsName) {                                                                 // 4249
        var scopeStyles = this.prepareRoot(root, name, extendsName);                                                   // 4250
        var typeExtension = this.isTypeExtension(extendsName);                                                         // 4251
        var scopeSelector = this.makeScopeSelector(name, typeExtension);                                               // 4252
        var cssText = stylesToCssText(scopeStyles, true);                                                              // 4253
        cssText = this.scopeCssText(cssText, scopeSelector);                                                           // 4254
        if (root) {                                                                                                    // 4255
          root.shimmedStyle = cssText;                                                                                 // 4256
        }                                                                                                              // 4257
        this.addCssToDocument(cssText, name);                                                                          // 4258
      },                                                                                                               // 4259
      shimStyle: function(style, selector) {                                                                           // 4260
        return this.shimCssText(style.textContent, selector);                                                          // 4261
      },                                                                                                               // 4262
      shimCssText: function(cssText, selector) {                                                                       // 4263
        cssText = this.insertDirectives(cssText);                                                                      // 4264
        return this.scopeCssText(cssText, selector);                                                                   // 4265
      },                                                                                                               // 4266
      makeScopeSelector: function(name, typeExtension) {                                                               // 4267
        if (name) {                                                                                                    // 4268
          return typeExtension ? "[is=" + name + "]" : name;                                                           // 4269
        }                                                                                                              // 4270
        return "";                                                                                                     // 4271
      },                                                                                                               // 4272
      isTypeExtension: function(extendsName) {                                                                         // 4273
        return extendsName && extendsName.indexOf("-") < 0;                                                            // 4274
      },                                                                                                               // 4275
      prepareRoot: function(root, name, extendsName) {                                                                 // 4276
        var def = this.registerRoot(root, name, extendsName);                                                          // 4277
        this.replaceTextInStyles(def.rootStyles, this.insertDirectives);                                               // 4278
        this.removeStyles(root, def.rootStyles);                                                                       // 4279
        if (this.strictStyling) {                                                                                      // 4280
          this.applyScopeToContent(root, name);                                                                        // 4281
        }                                                                                                              // 4282
        return def.scopeStyles;                                                                                        // 4283
      },                                                                                                               // 4284
      removeStyles: function(root, styles) {                                                                           // 4285
        for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {                                         // 4286
          s.parentNode.removeChild(s);                                                                                 // 4287
        }                                                                                                              // 4288
      },                                                                                                               // 4289
      registerRoot: function(root, name, extendsName) {                                                                // 4290
        var def = this.registry[name] = {                                                                              // 4291
          root: root,                                                                                                  // 4292
          name: name,                                                                                                  // 4293
          extendsName: extendsName                                                                                     // 4294
        };                                                                                                             // 4295
        var styles = this.findStyles(root);                                                                            // 4296
        def.rootStyles = styles;                                                                                       // 4297
        def.scopeStyles = def.rootStyles;                                                                              // 4298
        var extendee = this.registry[def.extendsName];                                                                 // 4299
        if (extendee) {                                                                                                // 4300
          def.scopeStyles = extendee.scopeStyles.concat(def.scopeStyles);                                              // 4301
        }                                                                                                              // 4302
        return def;                                                                                                    // 4303
      },                                                                                                               // 4304
      findStyles: function(root) {                                                                                     // 4305
        if (!root) {                                                                                                   // 4306
          return [];                                                                                                   // 4307
        }                                                                                                              // 4308
        var styles = root.querySelectorAll("style");                                                                   // 4309
        return Array.prototype.filter.call(styles, function(s) {                                                       // 4310
          return !s.hasAttribute(NO_SHIM_ATTRIBUTE);                                                                   // 4311
        });                                                                                                            // 4312
      },                                                                                                               // 4313
      applyScopeToContent: function(root, name) {                                                                      // 4314
        if (root) {                                                                                                    // 4315
          Array.prototype.forEach.call(root.querySelectorAll("*"), function(node) {                                    // 4316
            node.setAttribute(name, "");                                                                               // 4317
          });                                                                                                          // 4318
          Array.prototype.forEach.call(root.querySelectorAll("template"), function(template) {                         // 4319
            this.applyScopeToContent(template.content, name);                                                          // 4320
          }, this);                                                                                                    // 4321
        }                                                                                                              // 4322
      },                                                                                                               // 4323
      insertDirectives: function(cssText) {                                                                            // 4324
        cssText = this.insertPolyfillDirectivesInCssText(cssText);                                                     // 4325
        return this.insertPolyfillRulesInCssText(cssText);                                                             // 4326
      },                                                                                                               // 4327
      insertPolyfillDirectivesInCssText: function(cssText) {                                                           // 4328
        cssText = cssText.replace(cssCommentNextSelectorRe, function(match, p1) {                                      // 4329
          return p1.slice(0, -2) + "{";                                                                                // 4330
        });                                                                                                            // 4331
        return cssText.replace(cssContentNextSelectorRe, function(match, p1) {                                         // 4332
          return p1 + " {";                                                                                            // 4333
        });                                                                                                            // 4334
      },                                                                                                               // 4335
      insertPolyfillRulesInCssText: function(cssText) {                                                                // 4336
        cssText = cssText.replace(cssCommentRuleRe, function(match, p1) {                                              // 4337
          return p1.slice(0, -1);                                                                                      // 4338
        });                                                                                                            // 4339
        return cssText.replace(cssContentRuleRe, function(match, p1, p2, p3) {                                         // 4340
          var rule = match.replace(p1, "").replace(p2, "");                                                            // 4341
          return p3 + rule;                                                                                            // 4342
        });                                                                                                            // 4343
      },                                                                                                               // 4344
      scopeCssText: function(cssText, scopeSelector) {                                                                 // 4345
        var unscoped = this.extractUnscopedRulesFromCssText(cssText);                                                  // 4346
        cssText = this.insertPolyfillHostInCssText(cssText);                                                           // 4347
        cssText = this.convertColonHost(cssText);                                                                      // 4348
        cssText = this.convertColonHostContext(cssText);                                                               // 4349
        cssText = this.convertShadowDOMSelectors(cssText);                                                             // 4350
        if (scopeSelector) {                                                                                           // 4351
          var self = this, cssText;                                                                                    // 4352
          withCssRules(cssText, function(rules) {                                                                      // 4353
            cssText = self.scopeRules(rules, scopeSelector);                                                           // 4354
          });                                                                                                          // 4355
        }                                                                                                              // 4356
        cssText = cssText + "\n" + unscoped;                                                                           // 4357
        return cssText.trim();                                                                                         // 4358
      },                                                                                                               // 4359
      extractUnscopedRulesFromCssText: function(cssText) {                                                             // 4360
        var r = "", m;                                                                                                 // 4361
        while (m = cssCommentUnscopedRuleRe.exec(cssText)) {                                                           // 4362
          r += m[1].slice(0, -1) + "\n\n";                                                                             // 4363
        }                                                                                                              // 4364
        while (m = cssContentUnscopedRuleRe.exec(cssText)) {                                                           // 4365
          r += m[0].replace(m[2], "").replace(m[1], m[3]) + "\n\n";                                                    // 4366
        }                                                                                                              // 4367
        return r;                                                                                                      // 4368
      },                                                                                                               // 4369
      convertColonHost: function(cssText) {                                                                            // 4370
        return this.convertColonRule(cssText, cssColonHostRe, this.colonHostPartReplacer);                             // 4371
      },                                                                                                               // 4372
      convertColonHostContext: function(cssText) {                                                                     // 4373
        return this.convertColonRule(cssText, cssColonHostContextRe, this.colonHostContextPartReplacer);               // 4374
      },                                                                                                               // 4375
      convertColonRule: function(cssText, regExp, partReplacer) {                                                      // 4376
        return cssText.replace(regExp, function(m, p1, p2, p3) {                                                       // 4377
          p1 = polyfillHostNoCombinator;                                                                               // 4378
          if (p2) {                                                                                                    // 4379
            var parts = p2.split(","), r = [];                                                                         // 4380
            for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {                                       // 4381
              p = p.trim();                                                                                            // 4382
              r.push(partReplacer(p1, p, p3));                                                                         // 4383
            }                                                                                                          // 4384
            return r.join(",");                                                                                        // 4385
          } else {                                                                                                     // 4386
            return p1 + p3;                                                                                            // 4387
          }                                                                                                            // 4388
        });                                                                                                            // 4389
      },                                                                                                               // 4390
      colonHostContextPartReplacer: function(host, part, suffix) {                                                     // 4391
        if (part.match(polyfillHost)) {                                                                                // 4392
          return this.colonHostPartReplacer(host, part, suffix);                                                       // 4393
        } else {                                                                                                       // 4394
          return host + part + suffix + ", " + part + " " + host + suffix;                                             // 4395
        }                                                                                                              // 4396
      },                                                                                                               // 4397
      colonHostPartReplacer: function(host, part, suffix) {                                                            // 4398
        return host + part.replace(polyfillHost, "") + suffix;                                                         // 4399
      },                                                                                                               // 4400
      convertShadowDOMSelectors: function(cssText) {                                                                   // 4401
        for (var i = 0; i < shadowDOMSelectorsRe.length; i++) {                                                        // 4402
          cssText = cssText.replace(shadowDOMSelectorsRe[i], " ");                                                     // 4403
        }                                                                                                              // 4404
        return cssText;                                                                                                // 4405
      },                                                                                                               // 4406
      scopeRules: function(cssRules, scopeSelector) {                                                                  // 4407
        var cssText = "";                                                                                              // 4408
        if (cssRules) {                                                                                                // 4409
          Array.prototype.forEach.call(cssRules, function(rule) {                                                      // 4410
            if (rule.selectorText && (rule.style && rule.style.cssText !== undefined)) {                               // 4411
              cssText += this.scopeSelector(rule.selectorText, scopeSelector, this.strictStyling) + " {\n	";           // 4412
              cssText += this.propertiesFromRule(rule) + "\n}\n\n";                                                    // 4413
            } else if (rule.type === CSSRule.MEDIA_RULE) {                                                             // 4414
              cssText += "@media " + rule.media.mediaText + " {\n";                                                    // 4415
              cssText += this.scopeRules(rule.cssRules, scopeSelector);                                                // 4416
              cssText += "\n}\n\n";                                                                                    // 4417
            } else {                                                                                                   // 4418
              try {                                                                                                    // 4419
                if (rule.cssText) {                                                                                    // 4420
                  cssText += rule.cssText + "\n\n";                                                                    // 4421
                }                                                                                                      // 4422
              } catch (x) {                                                                                            // 4423
                if (rule.type === CSSRule.KEYFRAMES_RULE && rule.cssRules) {                                           // 4424
                  cssText += this.ieSafeCssTextFromKeyFrameRule(rule);                                                 // 4425
                }                                                                                                      // 4426
              }                                                                                                        // 4427
            }                                                                                                          // 4428
          }, this);                                                                                                    // 4429
        }                                                                                                              // 4430
        return cssText;                                                                                                // 4431
      },                                                                                                               // 4432
      ieSafeCssTextFromKeyFrameRule: function(rule) {                                                                  // 4433
        var cssText = "@keyframes " + rule.name + " {";                                                                // 4434
        Array.prototype.forEach.call(rule.cssRules, function(rule) {                                                   // 4435
          cssText += " " + rule.keyText + " {" + rule.style.cssText + "}";                                             // 4436
        });                                                                                                            // 4437
        cssText += " }";                                                                                               // 4438
        return cssText;                                                                                                // 4439
      },                                                                                                               // 4440
      scopeSelector: function(selector, scopeSelector, strict) {                                                       // 4441
        var r = [], parts = selector.split(",");                                                                       // 4442
        parts.forEach(function(p) {                                                                                    // 4443
          p = p.trim();                                                                                                // 4444
          if (this.selectorNeedsScoping(p, scopeSelector)) {                                                           // 4445
            p = strict && !p.match(polyfillHostNoCombinator) ? this.applyStrictSelectorScope(p, scopeSelector) : this.applySelectorScope(p, scopeSelector);
          }                                                                                                            // 4447
          r.push(p);                                                                                                   // 4448
        }, this);                                                                                                      // 4449
        return r.join(", ");                                                                                           // 4450
      },                                                                                                               // 4451
      selectorNeedsScoping: function(selector, scopeSelector) {                                                        // 4452
        if (Array.isArray(scopeSelector)) {                                                                            // 4453
          return true;                                                                                                 // 4454
        }                                                                                                              // 4455
        var re = this.makeScopeMatcher(scopeSelector);                                                                 // 4456
        return !selector.match(re);                                                                                    // 4457
      },                                                                                                               // 4458
      makeScopeMatcher: function(scopeSelector) {                                                                      // 4459
        scopeSelector = scopeSelector.replace(/\[/g, "\\[").replace(/\[/g, "\\]");                                     // 4460
        return new RegExp("^(" + scopeSelector + ")" + selectorReSuffix, "m");                                         // 4461
      },                                                                                                               // 4462
      applySelectorScope: function(selector, selectorScope) {                                                          // 4463
        return Array.isArray(selectorScope) ? this.applySelectorScopeList(selector, selectorScope) : this.applySimpleSelectorScope(selector, selectorScope);
      },                                                                                                               // 4465
      applySelectorScopeList: function(selector, scopeSelectorList) {                                                  // 4466
        var r = [];                                                                                                    // 4467
        for (var i = 0, s; s = scopeSelectorList[i]; i++) {                                                            // 4468
          r.push(this.applySimpleSelectorScope(selector, s));                                                          // 4469
        }                                                                                                              // 4470
        return r.join(", ");                                                                                           // 4471
      },                                                                                                               // 4472
      applySimpleSelectorScope: function(selector, scopeSelector) {                                                    // 4473
        if (selector.match(polyfillHostRe)) {                                                                          // 4474
          selector = selector.replace(polyfillHostNoCombinator, scopeSelector);                                        // 4475
          return selector.replace(polyfillHostRe, scopeSelector + " ");                                                // 4476
        } else {                                                                                                       // 4477
          return scopeSelector + " " + selector;                                                                       // 4478
        }                                                                                                              // 4479
      },                                                                                                               // 4480
      applyStrictSelectorScope: function(selector, scopeSelector) {                                                    // 4481
        scopeSelector = scopeSelector.replace(/\[is=([^\]]*)\]/g, "$1");                                               // 4482
        var splits = [ " ", ">", "+", "~" ], scoped = selector, attrName = "[" + scopeSelector + "]";                  // 4483
        splits.forEach(function(sep) {                                                                                 // 4484
          var parts = scoped.split(sep);                                                                               // 4485
          scoped = parts.map(function(p) {                                                                             // 4486
            var t = p.trim().replace(polyfillHostRe, "");                                                              // 4487
            if (t && splits.indexOf(t) < 0 && t.indexOf(attrName) < 0) {                                               // 4488
              p = t.replace(/([^:]*)(:*)(.*)/, "$1" + attrName + "$2$3");                                              // 4489
            }                                                                                                          // 4490
            return p;                                                                                                  // 4491
          }).join(sep);                                                                                                // 4492
        });                                                                                                            // 4493
        return scoped;                                                                                                 // 4494
      },                                                                                                               // 4495
      insertPolyfillHostInCssText: function(selector) {                                                                // 4496
        return selector.replace(colonHostContextRe, polyfillHostContext).replace(colonHostRe, polyfillHost);           // 4497
      },                                                                                                               // 4498
      propertiesFromRule: function(rule) {                                                                             // 4499
        var cssText = rule.style.cssText;                                                                              // 4500
        if (rule.style.content && !rule.style.content.match(/['"]+|attr/)) {                                           // 4501
          cssText = cssText.replace(/content:[^;]*;/g, "content: '" + rule.style.content + "';");                      // 4502
        }                                                                                                              // 4503
        var style = rule.style;                                                                                        // 4504
        for (var i in style) {                                                                                         // 4505
          if (style[i] === "initial") {                                                                                // 4506
            cssText += i + ": initial; ";                                                                              // 4507
          }                                                                                                            // 4508
        }                                                                                                              // 4509
        return cssText;                                                                                                // 4510
      },                                                                                                               // 4511
      replaceTextInStyles: function(styles, action) {                                                                  // 4512
        if (styles && action) {                                                                                        // 4513
          if (!(styles instanceof Array)) {                                                                            // 4514
            styles = [ styles ];                                                                                       // 4515
          }                                                                                                            // 4516
          Array.prototype.forEach.call(styles, function(s) {                                                           // 4517
            s.textContent = action.call(this, s.textContent);                                                          // 4518
          }, this);                                                                                                    // 4519
        }                                                                                                              // 4520
      },                                                                                                               // 4521
      addCssToDocument: function(cssText, name) {                                                                      // 4522
        if (cssText.match("@import")) {                                                                                // 4523
          addOwnSheet(cssText, name);                                                                                  // 4524
        } else {                                                                                                       // 4525
          addCssToDocument(cssText);                                                                                   // 4526
        }                                                                                                              // 4527
      }                                                                                                                // 4528
    };                                                                                                                 // 4529
    var selectorRe = /([^{]*)({[\s\S]*?})/gim, cssCommentRe = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim, cssCommentNextSelectorRe = /\/\*\s*@polyfill ([^*]*\*+([^/*][^*]*\*+)*\/)([^{]*?){/gim, cssContentNextSelectorRe = /polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim, cssCommentRuleRe = /\/\*\s@polyfill-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim, cssContentRuleRe = /(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssCommentUnscopedRuleRe = /\/\*\s@polyfill-unscoped-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim, cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssPseudoRe = /::(x-[^\s{,(]*)/gim, cssPartRe = /::part\(([^)]*)\)/gim, polyfillHost = "-shadowcsshost", polyfillHostContext = "-shadowcsscontext", parenSuffix = ")(?:\\((" + "(?:\\([^)(]*\\)|[^)(]*)+?" + ")\\))?([^,{]*)";
    var cssColonHostRe = new RegExp("(" + polyfillHost + parenSuffix, "gim"), cssColonHostContextRe = new RegExp("(" + polyfillHostContext + parenSuffix, "gim"), selectorReSuffix = "([>\\s~+[.,{:][\\s\\S]*)?$", colonHostRe = /\:host/gim, colonHostContextRe = /\:host-context/gim, polyfillHostNoCombinator = polyfillHost + "-no-combinator", polyfillHostRe = new RegExp(polyfillHost, "gim"), polyfillHostContextRe = new RegExp(polyfillHostContext, "gim"), shadowDOMSelectorsRe = [ /\^\^/g, /\^/g, /\/shadow\//g, /\/shadow-deep\//g, /::shadow/g, /\/deep\//g, /::content/g ];
    function stylesToCssText(styles, preserveComments) {                                                               // 4532
      var cssText = "";                                                                                                // 4533
      Array.prototype.forEach.call(styles, function(s) {                                                               // 4534
        cssText += s.textContent + "\n\n";                                                                             // 4535
      });                                                                                                              // 4536
      if (!preserveComments) {                                                                                         // 4537
        cssText = cssText.replace(cssCommentRe, "");                                                                   // 4538
      }                                                                                                                // 4539
      return cssText;                                                                                                  // 4540
    }                                                                                                                  // 4541
    function cssTextToStyle(cssText) {                                                                                 // 4542
      var style = document.createElement("style");                                                                     // 4543
      style.textContent = cssText;                                                                                     // 4544
      return style;                                                                                                    // 4545
    }                                                                                                                  // 4546
    function cssToRules(cssText) {                                                                                     // 4547
      var style = cssTextToStyle(cssText);                                                                             // 4548
      document.head.appendChild(style);                                                                                // 4549
      var rules = [];                                                                                                  // 4550
      if (style.sheet) {                                                                                               // 4551
        try {                                                                                                          // 4552
          rules = style.sheet.cssRules;                                                                                // 4553
        } catch (e) {}                                                                                                 // 4554
      } else {                                                                                                         // 4555
        console.warn("sheet not found", style);                                                                        // 4556
      }                                                                                                                // 4557
      style.parentNode.removeChild(style);                                                                             // 4558
      return rules;                                                                                                    // 4559
    }                                                                                                                  // 4560
    var frame = document.createElement("iframe");                                                                      // 4561
    frame.style.display = "none";                                                                                      // 4562
    function initFrame() {                                                                                             // 4563
      frame.initialized = true;                                                                                        // 4564
      document.body.appendChild(frame);                                                                                // 4565
      var doc = frame.contentDocument;                                                                                 // 4566
      var base = doc.createElement("base");                                                                            // 4567
      base.href = document.baseURI;                                                                                    // 4568
      doc.head.appendChild(base);                                                                                      // 4569
    }                                                                                                                  // 4570
    function inFrame(fn) {                                                                                             // 4571
      if (!frame.initialized) {                                                                                        // 4572
        initFrame();                                                                                                   // 4573
      }                                                                                                                // 4574
      document.body.appendChild(frame);                                                                                // 4575
      fn(frame.contentDocument);                                                                                       // 4576
      document.body.removeChild(frame);                                                                                // 4577
    }                                                                                                                  // 4578
    var isChrome = navigator.userAgent.match("Chrome");                                                                // 4579
    function withCssRules(cssText, callback) {                                                                         // 4580
      if (!callback) {                                                                                                 // 4581
        return;                                                                                                        // 4582
      }                                                                                                                // 4583
      var rules;                                                                                                       // 4584
      if (cssText.match("@import") && isChrome) {                                                                      // 4585
        var style = cssTextToStyle(cssText);                                                                           // 4586
        inFrame(function(doc) {                                                                                        // 4587
          doc.head.appendChild(style.impl);                                                                            // 4588
          rules = Array.prototype.slice.call(style.sheet.cssRules, 0);                                                 // 4589
          callback(rules);                                                                                             // 4590
        });                                                                                                            // 4591
      } else {                                                                                                         // 4592
        rules = cssToRules(cssText);                                                                                   // 4593
        callback(rules);                                                                                               // 4594
      }                                                                                                                // 4595
    }                                                                                                                  // 4596
    function rulesToCss(cssRules) {                                                                                    // 4597
      for (var i = 0, css = []; i < cssRules.length; i++) {                                                            // 4598
        css.push(cssRules[i].cssText);                                                                                 // 4599
      }                                                                                                                // 4600
      return css.join("\n\n");                                                                                         // 4601
    }                                                                                                                  // 4602
    function addCssToDocument(cssText) {                                                                               // 4603
      if (cssText) {                                                                                                   // 4604
        getSheet().appendChild(document.createTextNode(cssText));                                                      // 4605
      }                                                                                                                // 4606
    }                                                                                                                  // 4607
    function addOwnSheet(cssText, name) {                                                                              // 4608
      var style = cssTextToStyle(cssText);                                                                             // 4609
      style.setAttribute(name, "");                                                                                    // 4610
      style.setAttribute(SHIMMED_ATTRIBUTE, "");                                                                       // 4611
      document.head.appendChild(style);                                                                                // 4612
    }                                                                                                                  // 4613
    var SHIM_ATTRIBUTE = "shim-shadowdom";                                                                             // 4614
    var SHIMMED_ATTRIBUTE = "shim-shadowdom-css";                                                                      // 4615
    var NO_SHIM_ATTRIBUTE = "no-shim";                                                                                 // 4616
    var sheet;                                                                                                         // 4617
    function getSheet() {                                                                                              // 4618
      if (!sheet) {                                                                                                    // 4619
        sheet = document.createElement("style");                                                                       // 4620
        sheet.setAttribute(SHIMMED_ATTRIBUTE, "");                                                                     // 4621
        sheet[SHIMMED_ATTRIBUTE] = true;                                                                               // 4622
      }                                                                                                                // 4623
      return sheet;                                                                                                    // 4624
    }                                                                                                                  // 4625
    if (window.ShadowDOMPolyfill) {                                                                                    // 4626
      addCssToDocument("style { display: none !important; }\n");                                                       // 4627
      var doc = ShadowDOMPolyfill.wrap(document);                                                                      // 4628
      var head = doc.querySelector("head");                                                                            // 4629
      head.insertBefore(getSheet(), head.childNodes[0]);                                                               // 4630
      document.addEventListener("DOMContentLoaded", function() {                                                       // 4631
        var urlResolver = scope.urlResolver;                                                                           // 4632
        if (window.HTMLImports && !HTMLImports.useNative) {                                                            // 4633
          var SHIM_SHEET_SELECTOR = "link[rel=stylesheet]" + "[" + SHIM_ATTRIBUTE + "]";                               // 4634
          var SHIM_STYLE_SELECTOR = "style[" + SHIM_ATTRIBUTE + "]";                                                   // 4635
          HTMLImports.importer.documentPreloadSelectors += "," + SHIM_SHEET_SELECTOR;                                  // 4636
          HTMLImports.importer.importsPreloadSelectors += "," + SHIM_SHEET_SELECTOR;                                   // 4637
          HTMLImports.parser.documentSelectors = [ HTMLImports.parser.documentSelectors, SHIM_SHEET_SELECTOR, SHIM_STYLE_SELECTOR ].join(",");
          var originalParseGeneric = HTMLImports.parser.parseGeneric;                                                  // 4639
          HTMLImports.parser.parseGeneric = function(elt) {                                                            // 4640
            if (elt[SHIMMED_ATTRIBUTE]) {                                                                              // 4641
              return;                                                                                                  // 4642
            }                                                                                                          // 4643
            var style = elt.__importElement || elt;                                                                    // 4644
            if (!style.hasAttribute(SHIM_ATTRIBUTE)) {                                                                 // 4645
              originalParseGeneric.call(this, elt);                                                                    // 4646
              return;                                                                                                  // 4647
            }                                                                                                          // 4648
            if (elt.__resource) {                                                                                      // 4649
              style = elt.ownerDocument.createElement("style");                                                        // 4650
              style.textContent = elt.__resource;                                                                      // 4651
            }                                                                                                          // 4652
            HTMLImports.path.resolveUrlsInStyle(style);                                                                // 4653
            style.textContent = ShadowCSS.shimStyle(style);                                                            // 4654
            style.removeAttribute(SHIM_ATTRIBUTE, "");                                                                 // 4655
            style.setAttribute(SHIMMED_ATTRIBUTE, "");                                                                 // 4656
            style[SHIMMED_ATTRIBUTE] = true;                                                                           // 4657
            if (style.parentNode !== head) {                                                                           // 4658
              if (elt.parentNode === head) {                                                                           // 4659
                head.replaceChild(style, elt);                                                                         // 4660
              } else {                                                                                                 // 4661
                this.addElementToDocument(style);                                                                      // 4662
              }                                                                                                        // 4663
            }                                                                                                          // 4664
            style.__importParsed = true;                                                                               // 4665
            this.markParsingComplete(elt);                                                                             // 4666
            this.parseNext();                                                                                          // 4667
          };                                                                                                           // 4668
          var hasResource = HTMLImports.parser.hasResource;                                                            // 4669
          HTMLImports.parser.hasResource = function(node) {                                                            // 4670
            if (node.localName === "link" && node.rel === "stylesheet" && node.hasAttribute(SHIM_ATTRIBUTE)) {         // 4671
              return node.__resource;                                                                                  // 4672
            } else {                                                                                                   // 4673
              return hasResource.call(this, node);                                                                     // 4674
            }                                                                                                          // 4675
          };                                                                                                           // 4676
        }                                                                                                              // 4677
      });                                                                                                              // 4678
    }                                                                                                                  // 4679
    scope.ShadowCSS = ShadowCSS;                                                                                       // 4680
  })(window.WebComponents);                                                                                            // 4681
}                                                                                                                      // 4682
                                                                                                                       // 4683
(function(scope) {                                                                                                     // 4684
  if (window.ShadowDOMPolyfill) {                                                                                      // 4685
    window.wrap = ShadowDOMPolyfill.wrapIfNeeded;                                                                      // 4686
    window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;                                                                  // 4687
  } else {                                                                                                             // 4688
    window.wrap = window.unwrap = function(n) {                                                                        // 4689
      return n;                                                                                                        // 4690
    };                                                                                                                 // 4691
  }                                                                                                                    // 4692
})(window.WebComponents);                                                                                              // 4693
                                                                                                                       // 4694
(function(global) {                                                                                                    // 4695
  var registrationsTable = new WeakMap();                                                                              // 4696
  var setImmediate;                                                                                                    // 4697
  if (/Trident/.test(navigator.userAgent)) {                                                                           // 4698
    setImmediate = setTimeout;                                                                                         // 4699
  } else if (window.setImmediate) {                                                                                    // 4700
    setImmediate = window.setImmediate;                                                                                // 4701
  } else {                                                                                                             // 4702
    var setImmediateQueue = [];                                                                                        // 4703
    var sentinel = String(Math.random());                                                                              // 4704
    window.addEventListener("message", function(e) {                                                                   // 4705
      if (e.data === sentinel) {                                                                                       // 4706
        var queue = setImmediateQueue;                                                                                 // 4707
        setImmediateQueue = [];                                                                                        // 4708
        queue.forEach(function(func) {                                                                                 // 4709
          func();                                                                                                      // 4710
        });                                                                                                            // 4711
      }                                                                                                                // 4712
    });                                                                                                                // 4713
    setImmediate = function(func) {                                                                                    // 4714
      setImmediateQueue.push(func);                                                                                    // 4715
      window.postMessage(sentinel, "*");                                                                               // 4716
    };                                                                                                                 // 4717
  }                                                                                                                    // 4718
  var isScheduled = false;                                                                                             // 4719
  var scheduledObservers = [];                                                                                         // 4720
  function scheduleCallback(observer) {                                                                                // 4721
    scheduledObservers.push(observer);                                                                                 // 4722
    if (!isScheduled) {                                                                                                // 4723
      isScheduled = true;                                                                                              // 4724
      setImmediate(dispatchCallbacks);                                                                                 // 4725
    }                                                                                                                  // 4726
  }                                                                                                                    // 4727
  function wrapIfNeeded(node) {                                                                                        // 4728
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;                            // 4729
  }                                                                                                                    // 4730
  function dispatchCallbacks() {                                                                                       // 4731
    isScheduled = false;                                                                                               // 4732
    var observers = scheduledObservers;                                                                                // 4733
    scheduledObservers = [];                                                                                           // 4734
    observers.sort(function(o1, o2) {                                                                                  // 4735
      return o1.uid_ - o2.uid_;                                                                                        // 4736
    });                                                                                                                // 4737
    var anyNonEmpty = false;                                                                                           // 4738
    observers.forEach(function(observer) {                                                                             // 4739
      var queue = observer.takeRecords();                                                                              // 4740
      removeTransientObserversFor(observer);                                                                           // 4741
      if (queue.length) {                                                                                              // 4742
        observer.callback_(queue, observer);                                                                           // 4743
        anyNonEmpty = true;                                                                                            // 4744
      }                                                                                                                // 4745
    });                                                                                                                // 4746
    if (anyNonEmpty) dispatchCallbacks();                                                                              // 4747
  }                                                                                                                    // 4748
  function removeTransientObserversFor(observer) {                                                                     // 4749
    observer.nodes_.forEach(function(node) {                                                                           // 4750
      var registrations = registrationsTable.get(node);                                                                // 4751
      if (!registrations) return;                                                                                      // 4752
      registrations.forEach(function(registration) {                                                                   // 4753
        if (registration.observer === observer) registration.removeTransientObservers();                               // 4754
      });                                                                                                              // 4755
    });                                                                                                                // 4756
  }                                                                                                                    // 4757
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {                                                 // 4758
    for (var node = target; node; node = node.parentNode) {                                                            // 4759
      var registrations = registrationsTable.get(node);                                                                // 4760
      if (registrations) {                                                                                             // 4761
        for (var j = 0; j < registrations.length; j++) {                                                               // 4762
          var registration = registrations[j];                                                                         // 4763
          var options = registration.options;                                                                          // 4764
          if (node !== target && !options.subtree) continue;                                                           // 4765
          var record = callback(options);                                                                              // 4766
          if (record) registration.enqueue(record);                                                                    // 4767
        }                                                                                                              // 4768
      }                                                                                                                // 4769
    }                                                                                                                  // 4770
  }                                                                                                                    // 4771
  var uidCounter = 0;                                                                                                  // 4772
  function JsMutationObserver(callback) {                                                                              // 4773
    this.callback_ = callback;                                                                                         // 4774
    this.nodes_ = [];                                                                                                  // 4775
    this.records_ = [];                                                                                                // 4776
    this.uid_ = ++uidCounter;                                                                                          // 4777
  }                                                                                                                    // 4778
  JsMutationObserver.prototype = {                                                                                     // 4779
    observe: function(target, options) {                                                                               // 4780
      target = wrapIfNeeded(target);                                                                                   // 4781
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();                                                                                       // 4783
      }                                                                                                                // 4784
      var registrations = registrationsTable.get(target);                                                              // 4785
      if (!registrations) registrationsTable.set(target, registrations = []);                                          // 4786
      var registration;                                                                                                // 4787
      for (var i = 0; i < registrations.length; i++) {                                                                 // 4788
        if (registrations[i].observer === this) {                                                                      // 4789
          registration = registrations[i];                                                                             // 4790
          registration.removeListeners();                                                                              // 4791
          registration.options = options;                                                                              // 4792
          break;                                                                                                       // 4793
        }                                                                                                              // 4794
      }                                                                                                                // 4795
      if (!registration) {                                                                                             // 4796
        registration = new Registration(this, target, options);                                                        // 4797
        registrations.push(registration);                                                                              // 4798
        this.nodes_.push(target);                                                                                      // 4799
      }                                                                                                                // 4800
      registration.addListeners();                                                                                     // 4801
    },                                                                                                                 // 4802
    disconnect: function() {                                                                                           // 4803
      this.nodes_.forEach(function(node) {                                                                             // 4804
        var registrations = registrationsTable.get(node);                                                              // 4805
        for (var i = 0; i < registrations.length; i++) {                                                               // 4806
          var registration = registrations[i];                                                                         // 4807
          if (registration.observer === this) {                                                                        // 4808
            registration.removeListeners();                                                                            // 4809
            registrations.splice(i, 1);                                                                                // 4810
            break;                                                                                                     // 4811
          }                                                                                                            // 4812
        }                                                                                                              // 4813
      }, this);                                                                                                        // 4814
      this.records_ = [];                                                                                              // 4815
    },                                                                                                                 // 4816
    takeRecords: function() {                                                                                          // 4817
      var copyOfRecords = this.records_;                                                                               // 4818
      this.records_ = [];                                                                                              // 4819
      return copyOfRecords;                                                                                            // 4820
    }                                                                                                                  // 4821
  };                                                                                                                   // 4822
  function MutationRecord(type, target) {                                                                              // 4823
    this.type = type;                                                                                                  // 4824
    this.target = target;                                                                                              // 4825
    this.addedNodes = [];                                                                                              // 4826
    this.removedNodes = [];                                                                                            // 4827
    this.previousSibling = null;                                                                                       // 4828
    this.nextSibling = null;                                                                                           // 4829
    this.attributeName = null;                                                                                         // 4830
    this.attributeNamespace = null;                                                                                    // 4831
    this.oldValue = null;                                                                                              // 4832
  }                                                                                                                    // 4833
  function copyMutationRecord(original) {                                                                              // 4834
    var record = new MutationRecord(original.type, original.target);                                                   // 4835
    record.addedNodes = original.addedNodes.slice();                                                                   // 4836
    record.removedNodes = original.removedNodes.slice();                                                               // 4837
    record.previousSibling = original.previousSibling;                                                                 // 4838
    record.nextSibling = original.nextSibling;                                                                         // 4839
    record.attributeName = original.attributeName;                                                                     // 4840
    record.attributeNamespace = original.attributeNamespace;                                                           // 4841
    record.oldValue = original.oldValue;                                                                               // 4842
    return record;                                                                                                     // 4843
  }                                                                                                                    // 4844
  var currentRecord, recordWithOldValue;                                                                               // 4845
  function getRecord(type, target) {                                                                                   // 4846
    return currentRecord = new MutationRecord(type, target);                                                           // 4847
  }                                                                                                                    // 4848
  function getRecordWithOldValue(oldValue) {                                                                           // 4849
    if (recordWithOldValue) return recordWithOldValue;                                                                 // 4850
    recordWithOldValue = copyMutationRecord(currentRecord);                                                            // 4851
    recordWithOldValue.oldValue = oldValue;                                                                            // 4852
    return recordWithOldValue;                                                                                         // 4853
  }                                                                                                                    // 4854
  function clearRecords() {                                                                                            // 4855
    currentRecord = recordWithOldValue = undefined;                                                                    // 4856
  }                                                                                                                    // 4857
  function recordRepresentsCurrentMutation(record) {                                                                   // 4858
    return record === recordWithOldValue || record === currentRecord;                                                  // 4859
  }                                                                                                                    // 4860
  function selectRecord(lastRecord, newRecord) {                                                                       // 4861
    if (lastRecord === newRecord) return lastRecord;                                                                   // 4862
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;                  // 4863
    return null;                                                                                                       // 4864
  }                                                                                                                    // 4865
  function Registration(observer, target, options) {                                                                   // 4866
    this.observer = observer;                                                                                          // 4867
    this.target = target;                                                                                              // 4868
    this.options = options;                                                                                            // 4869
    this.transientObservedNodes = [];                                                                                  // 4870
  }                                                                                                                    // 4871
  Registration.prototype = {                                                                                           // 4872
    enqueue: function(record) {                                                                                        // 4873
      var records = this.observer.records_;                                                                            // 4874
      var length = records.length;                                                                                     // 4875
      if (records.length > 0) {                                                                                        // 4876
        var lastRecord = records[length - 1];                                                                          // 4877
        var recordToReplaceLast = selectRecord(lastRecord, record);                                                    // 4878
        if (recordToReplaceLast) {                                                                                     // 4879
          records[length - 1] = recordToReplaceLast;                                                                   // 4880
          return;                                                                                                      // 4881
        }                                                                                                              // 4882
      } else {                                                                                                         // 4883
        scheduleCallback(this.observer);                                                                               // 4884
      }                                                                                                                // 4885
      records[length] = record;                                                                                        // 4886
    },                                                                                                                 // 4887
    addListeners: function() {                                                                                         // 4888
      this.addListeners_(this.target);                                                                                 // 4889
    },                                                                                                                 // 4890
    addListeners_: function(node) {                                                                                    // 4891
      var options = this.options;                                                                                      // 4892
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);                                    // 4893
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);                        // 4894
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);                                     // 4895
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);                   // 4896
    },                                                                                                                 // 4897
    removeListeners: function() {                                                                                      // 4898
      this.removeListeners_(this.target);                                                                              // 4899
    },                                                                                                                 // 4900
    removeListeners_: function(node) {                                                                                 // 4901
      var options = this.options;                                                                                      // 4902
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);                                 // 4903
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);                     // 4904
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);                                  // 4905
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);                // 4906
    },                                                                                                                 // 4907
    addTransientObserver: function(node) {                                                                             // 4908
      if (node === this.target) return;                                                                                // 4909
      this.addListeners_(node);                                                                                        // 4910
      this.transientObservedNodes.push(node);                                                                          // 4911
      var registrations = registrationsTable.get(node);                                                                // 4912
      if (!registrations) registrationsTable.set(node, registrations = []);                                            // 4913
      registrations.push(this);                                                                                        // 4914
    },                                                                                                                 // 4915
    removeTransientObservers: function() {                                                                             // 4916
      var transientObservedNodes = this.transientObservedNodes;                                                        // 4917
      this.transientObservedNodes = [];                                                                                // 4918
      transientObservedNodes.forEach(function(node) {                                                                  // 4919
        this.removeListeners_(node);                                                                                   // 4920
        var registrations = registrationsTable.get(node);                                                              // 4921
        for (var i = 0; i < registrations.length; i++) {                                                               // 4922
          if (registrations[i] === this) {                                                                             // 4923
            registrations.splice(i, 1);                                                                                // 4924
            break;                                                                                                     // 4925
          }                                                                                                            // 4926
        }                                                                                                              // 4927
      }, this);                                                                                                        // 4928
    },                                                                                                                 // 4929
    handleEvent: function(e) {                                                                                         // 4930
      e.stopImmediatePropagation();                                                                                    // 4931
      switch (e.type) {                                                                                                // 4932
       case "DOMAttrModified":                                                                                         // 4933
        var name = e.attrName;                                                                                         // 4934
        var namespace = e.relatedNode.namespaceURI;                                                                    // 4935
        var target = e.target;                                                                                         // 4936
        var record = new getRecord("attributes", target);                                                              // 4937
        record.attributeName = name;                                                                                   // 4938
        record.attributeNamespace = namespace;                                                                         // 4939
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;                                   // 4940
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {                                            // 4941
          if (!options.attributes) return;                                                                             // 4942
          if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;                                                                                                    // 4944
          }                                                                                                            // 4945
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);                                       // 4946
          return record;                                                                                               // 4947
        });                                                                                                            // 4948
        break;                                                                                                         // 4949
                                                                                                                       // 4950
       case "DOMCharacterDataModified":                                                                                // 4951
        var target = e.target;                                                                                         // 4952
        var record = getRecord("characterData", target);                                                               // 4953
        var oldValue = e.prevValue;                                                                                    // 4954
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {                                            // 4955
          if (!options.characterData) return;                                                                          // 4956
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);                                   // 4957
          return record;                                                                                               // 4958
        });                                                                                                            // 4959
        break;                                                                                                         // 4960
                                                                                                                       // 4961
       case "DOMNodeRemoved":                                                                                          // 4962
        this.addTransientObserver(e.target);                                                                           // 4963
                                                                                                                       // 4964
       case "DOMNodeInserted":                                                                                         // 4965
        var target = e.relatedNode;                                                                                    // 4966
        var changedNode = e.target;                                                                                    // 4967
        var addedNodes, removedNodes;                                                                                  // 4968
        if (e.type === "DOMNodeInserted") {                                                                            // 4969
          addedNodes = [ changedNode ];                                                                                // 4970
          removedNodes = [];                                                                                           // 4971
        } else {                                                                                                       // 4972
          addedNodes = [];                                                                                             // 4973
          removedNodes = [ changedNode ];                                                                              // 4974
        }                                                                                                              // 4975
        var previousSibling = changedNode.previousSibling;                                                             // 4976
        var nextSibling = changedNode.nextSibling;                                                                     // 4977
        var record = getRecord("childList", target);                                                                   // 4978
        record.addedNodes = addedNodes;                                                                                // 4979
        record.removedNodes = removedNodes;                                                                            // 4980
        record.previousSibling = previousSibling;                                                                      // 4981
        record.nextSibling = nextSibling;                                                                              // 4982
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {                                            // 4983
          if (!options.childList) return;                                                                              // 4984
          return record;                                                                                               // 4985
        });                                                                                                            // 4986
      }                                                                                                                // 4987
      clearRecords();                                                                                                  // 4988
    }                                                                                                                  // 4989
  };                                                                                                                   // 4990
  global.JsMutationObserver = JsMutationObserver;                                                                      // 4991
  if (!global.MutationObserver) global.MutationObserver = JsMutationObserver;                                          // 4992
})(this);                                                                                                              // 4993
                                                                                                                       // 4994
window.HTMLImports = window.HTMLImports || {                                                                           // 4995
  flags: {}                                                                                                            // 4996
};                                                                                                                     // 4997
                                                                                                                       // 4998
(function(scope) {                                                                                                     // 4999
  var IMPORT_LINK_TYPE = "import";                                                                                     // 5000
  var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement("link"));                                         // 5001
  var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);                                                        // 5002
  var wrap = function(node) {                                                                                          // 5003
    return hasShadowDOMPolyfill ? ShadowDOMPolyfill.wrapIfNeeded(node) : node;                                         // 5004
  };                                                                                                                   // 5005
  var rootDocument = wrap(document);                                                                                   // 5006
  var currentScriptDescriptor = {                                                                                      // 5007
    get: function() {                                                                                                  // 5008
      var script = HTMLImports.currentScript || document.currentScript || (document.readyState !== "complete" ? document.scripts[document.scripts.length - 1] : null);
      return wrap(script);                                                                                             // 5010
    },                                                                                                                 // 5011
    configurable: true                                                                                                 // 5012
  };                                                                                                                   // 5013
  Object.defineProperty(document, "_currentScript", currentScriptDescriptor);                                          // 5014
  Object.defineProperty(rootDocument, "_currentScript", currentScriptDescriptor);                                      // 5015
  var isIE = /Trident/.test(navigator.userAgent);                                                                      // 5016
  function whenReady(callback, doc) {                                                                                  // 5017
    doc = doc || rootDocument;                                                                                         // 5018
    whenDocumentReady(function() {                                                                                     // 5019
      watchImportsLoad(callback, doc);                                                                                 // 5020
    }, doc);                                                                                                           // 5021
  }                                                                                                                    // 5022
  var requiredReadyState = isIE ? "complete" : "interactive";                                                          // 5023
  var READY_EVENT = "readystatechange";                                                                                // 5024
  function isDocumentReady(doc) {                                                                                      // 5025
    return doc.readyState === "complete" || doc.readyState === requiredReadyState;                                     // 5026
  }                                                                                                                    // 5027
  function whenDocumentReady(callback, doc) {                                                                          // 5028
    if (!isDocumentReady(doc)) {                                                                                       // 5029
      var checkReady = function() {                                                                                    // 5030
        if (doc.readyState === "complete" || doc.readyState === requiredReadyState) {                                  // 5031
          doc.removeEventListener(READY_EVENT, checkReady);                                                            // 5032
          whenDocumentReady(callback, doc);                                                                            // 5033
        }                                                                                                              // 5034
      };                                                                                                               // 5035
      doc.addEventListener(READY_EVENT, checkReady);                                                                   // 5036
    } else if (callback) {                                                                                             // 5037
      callback();                                                                                                      // 5038
    }                                                                                                                  // 5039
  }                                                                                                                    // 5040
  function markTargetLoaded(event) {                                                                                   // 5041
    event.target.__loaded = true;                                                                                      // 5042
  }                                                                                                                    // 5043
  function watchImportsLoad(callback, doc) {                                                                           // 5044
    var imports = doc.querySelectorAll("link[rel=import]");                                                            // 5045
    var loaded = 0, l = imports.length;                                                                                // 5046
    function checkDone(d) {                                                                                            // 5047
      if (loaded == l && callback) {                                                                                   // 5048
        callback();                                                                                                    // 5049
      }                                                                                                                // 5050
    }                                                                                                                  // 5051
    function loadedImport(e) {                                                                                         // 5052
      markTargetLoaded(e);                                                                                             // 5053
      loaded++;                                                                                                        // 5054
      checkDone();                                                                                                     // 5055
    }                                                                                                                  // 5056
    if (l) {                                                                                                           // 5057
      for (var i = 0, imp; i < l && (imp = imports[i]); i++) {                                                         // 5058
        if (isImportLoaded(imp)) {                                                                                     // 5059
          loadedImport.call(imp, {                                                                                     // 5060
            target: imp                                                                                                // 5061
          });                                                                                                          // 5062
        } else {                                                                                                       // 5063
          imp.addEventListener("load", loadedImport);                                                                  // 5064
          imp.addEventListener("error", loadedImport);                                                                 // 5065
        }                                                                                                              // 5066
      }                                                                                                                // 5067
    } else {                                                                                                           // 5068
      checkDone();                                                                                                     // 5069
    }                                                                                                                  // 5070
  }                                                                                                                    // 5071
  function isImportLoaded(link) {                                                                                      // 5072
    return useNative ? link.__loaded || link.import && link.import.readyState !== "loading" : link.__importParsed;     // 5073
  }                                                                                                                    // 5074
  if (useNative) {                                                                                                     // 5075
    new MutationObserver(function(mxns) {                                                                              // 5076
      for (var i = 0, l = mxns.length, m; i < l && (m = mxns[i]); i++) {                                               // 5077
        if (m.addedNodes) {                                                                                            // 5078
          handleImports(m.addedNodes);                                                                                 // 5079
        }                                                                                                              // 5080
      }                                                                                                                // 5081
    }).observe(document.head, {                                                                                        // 5082
      childList: true                                                                                                  // 5083
    });                                                                                                                // 5084
    function handleImports(nodes) {                                                                                    // 5085
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {                                             // 5086
        if (isImport(n)) {                                                                                             // 5087
          handleImport(n);                                                                                             // 5088
        }                                                                                                              // 5089
      }                                                                                                                // 5090
    }                                                                                                                  // 5091
    function isImport(element) {                                                                                       // 5092
      return element.localName === "link" && element.rel === "import";                                                 // 5093
    }                                                                                                                  // 5094
    function handleImport(element) {                                                                                   // 5095
      var loaded = element.import;                                                                                     // 5096
      if (loaded) {                                                                                                    // 5097
        markTargetLoaded({                                                                                             // 5098
          target: element                                                                                              // 5099
        });                                                                                                            // 5100
      } else {                                                                                                         // 5101
        element.addEventListener("load", markTargetLoaded);                                                            // 5102
        element.addEventListener("error", markTargetLoaded);                                                           // 5103
      }                                                                                                                // 5104
    }                                                                                                                  // 5105
    (function() {                                                                                                      // 5106
      if (document.readyState === "loading") {                                                                         // 5107
        var imports = document.querySelectorAll("link[rel=import]");                                                   // 5108
        for (var i = 0, l = imports.length, imp; i < l && (imp = imports[i]); i++) {                                   // 5109
          handleImport(imp);                                                                                           // 5110
        }                                                                                                              // 5111
      }                                                                                                                // 5112
    })();                                                                                                              // 5113
  }                                                                                                                    // 5114
  whenReady(function() {                                                                                               // 5115
    HTMLImports.ready = true;                                                                                          // 5116
    HTMLImports.readyTime = new Date().getTime();                                                                      // 5117
    rootDocument.dispatchEvent(new CustomEvent("HTMLImportsLoaded", {                                                  // 5118
      bubbles: true                                                                                                    // 5119
    }));                                                                                                               // 5120
  });                                                                                                                  // 5121
  scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;                                                                           // 5122
  scope.useNative = useNative;                                                                                         // 5123
  scope.rootDocument = rootDocument;                                                                                   // 5124
  scope.whenReady = whenReady;                                                                                         // 5125
  scope.isIE = isIE;                                                                                                   // 5126
})(HTMLImports);                                                                                                       // 5127
                                                                                                                       // 5128
(function(scope) {                                                                                                     // 5129
  var modules = [];                                                                                                    // 5130
  var addModule = function(module) {                                                                                   // 5131
    modules.push(module);                                                                                              // 5132
  };                                                                                                                   // 5133
  var initializeModules = function() {                                                                                 // 5134
    modules.forEach(function(module) {                                                                                 // 5135
      module(scope);                                                                                                   // 5136
    });                                                                                                                // 5137
  };                                                                                                                   // 5138
  scope.addModule = addModule;                                                                                         // 5139
  scope.initializeModules = initializeModules;                                                                         // 5140
})(HTMLImports);                                                                                                       // 5141
                                                                                                                       // 5142
HTMLImports.addModule(function(scope) {                                                                                // 5143
  var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;                                                                          // 5144
  var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;                                                        // 5145
  var path = {                                                                                                         // 5146
    resolveUrlsInStyle: function(style) {                                                                              // 5147
      var doc = style.ownerDocument;                                                                                   // 5148
      var resolver = doc.createElement("a");                                                                           // 5149
      style.textContent = this.resolveUrlsInCssText(style.textContent, resolver);                                      // 5150
      return style;                                                                                                    // 5151
    },                                                                                                                 // 5152
    resolveUrlsInCssText: function(cssText, urlObj) {                                                                  // 5153
      var r = this.replaceUrls(cssText, urlObj, CSS_URL_REGEXP);                                                       // 5154
      r = this.replaceUrls(r, urlObj, CSS_IMPORT_REGEXP);                                                              // 5155
      return r;                                                                                                        // 5156
    },                                                                                                                 // 5157
    replaceUrls: function(text, urlObj, regexp) {                                                                      // 5158
      return text.replace(regexp, function(m, pre, url, post) {                                                        // 5159
        var urlPath = url.replace(/["']/g, "");                                                                        // 5160
        urlObj.href = urlPath;                                                                                         // 5161
        urlPath = urlObj.href;                                                                                         // 5162
        return pre + "'" + urlPath + "'" + post;                                                                       // 5163
      });                                                                                                              // 5164
    }                                                                                                                  // 5165
  };                                                                                                                   // 5166
  scope.path = path;                                                                                                   // 5167
});                                                                                                                    // 5168
                                                                                                                       // 5169
HTMLImports.addModule(function(scope) {                                                                                // 5170
  xhr = {                                                                                                              // 5171
    async: true,                                                                                                       // 5172
    ok: function(request) {                                                                                            // 5173
      return request.status >= 200 && request.status < 300 || request.status === 304 || request.status === 0;          // 5174
    },                                                                                                                 // 5175
    load: function(url, next, nextContext) {                                                                           // 5176
      var request = new XMLHttpRequest();                                                                              // 5177
      if (scope.flags.debug || scope.flags.bust) {                                                                     // 5178
        url += "?" + Math.random();                                                                                    // 5179
      }                                                                                                                // 5180
      request.open("GET", url, xhr.async);                                                                             // 5181
      request.addEventListener("readystatechange", function(e) {                                                       // 5182
        if (request.readyState === 4) {                                                                                // 5183
          var locationHeader = request.getResponseHeader("Location");                                                  // 5184
          var redirectedUrl = null;                                                                                    // 5185
          if (locationHeader) {                                                                                        // 5186
            var redirectedUrl = locationHeader.substr(0, 1) === "/" ? location.origin + locationHeader : locationHeader;
          }                                                                                                            // 5188
          next.call(nextContext, !xhr.ok(request) && request, request.response || request.responseText, redirectedUrl);
        }                                                                                                              // 5190
      });                                                                                                              // 5191
      request.send();                                                                                                  // 5192
      return request;                                                                                                  // 5193
    },                                                                                                                 // 5194
    loadDocument: function(url, next, nextContext) {                                                                   // 5195
      this.load(url, next, nextContext).responseType = "document";                                                     // 5196
    }                                                                                                                  // 5197
  };                                                                                                                   // 5198
  scope.xhr = xhr;                                                                                                     // 5199
});                                                                                                                    // 5200
                                                                                                                       // 5201
HTMLImports.addModule(function(scope) {                                                                                // 5202
  var xhr = scope.xhr;                                                                                                 // 5203
  var flags = scope.flags;                                                                                             // 5204
  var Loader = function(onLoad, onComplete) {                                                                          // 5205
    this.cache = {};                                                                                                   // 5206
    this.onload = onLoad;                                                                                              // 5207
    this.oncomplete = onComplete;                                                                                      // 5208
    this.inflight = 0;                                                                                                 // 5209
    this.pending = {};                                                                                                 // 5210
  };                                                                                                                   // 5211
  Loader.prototype = {                                                                                                 // 5212
    addNodes: function(nodes) {                                                                                        // 5213
      this.inflight += nodes.length;                                                                                   // 5214
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {                                             // 5215
        this.require(n);                                                                                               // 5216
      }                                                                                                                // 5217
      this.checkDone();                                                                                                // 5218
    },                                                                                                                 // 5219
    addNode: function(node) {                                                                                          // 5220
      this.inflight++;                                                                                                 // 5221
      this.require(node);                                                                                              // 5222
      this.checkDone();                                                                                                // 5223
    },                                                                                                                 // 5224
    require: function(elt) {                                                                                           // 5225
      var url = elt.src || elt.href;                                                                                   // 5226
      elt.__nodeUrl = url;                                                                                             // 5227
      if (!this.dedupe(url, elt)) {                                                                                    // 5228
        this.fetch(url, elt);                                                                                          // 5229
      }                                                                                                                // 5230
    },                                                                                                                 // 5231
    dedupe: function(url, elt) {                                                                                       // 5232
      if (this.pending[url]) {                                                                                         // 5233
        this.pending[url].push(elt);                                                                                   // 5234
        return true;                                                                                                   // 5235
      }                                                                                                                // 5236
      var resource;                                                                                                    // 5237
      if (this.cache[url]) {                                                                                           // 5238
        this.onload(url, elt, this.cache[url]);                                                                        // 5239
        this.tail();                                                                                                   // 5240
        return true;                                                                                                   // 5241
      }                                                                                                                // 5242
      this.pending[url] = [ elt ];                                                                                     // 5243
      return false;                                                                                                    // 5244
    },                                                                                                                 // 5245
    fetch: function(url, elt) {                                                                                        // 5246
      flags.load && console.log("fetch", url, elt);                                                                    // 5247
      if (url.match(/^data:/)) {                                                                                       // 5248
        var pieces = url.split(",");                                                                                   // 5249
        var header = pieces[0];                                                                                        // 5250
        var body = pieces[1];                                                                                          // 5251
        if (header.indexOf(";base64") > -1) {                                                                          // 5252
          body = atob(body);                                                                                           // 5253
        } else {                                                                                                       // 5254
          body = decodeURIComponent(body);                                                                             // 5255
        }                                                                                                              // 5256
        setTimeout(function() {                                                                                        // 5257
          this.receive(url, elt, null, body);                                                                          // 5258
        }.bind(this), 0);                                                                                              // 5259
      } else {                                                                                                         // 5260
        var receiveXhr = function(err, resource, redirectedUrl) {                                                      // 5261
          this.receive(url, elt, err, resource, redirectedUrl);                                                        // 5262
        }.bind(this);                                                                                                  // 5263
        xhr.load(url, receiveXhr);                                                                                     // 5264
      }                                                                                                                // 5265
    },                                                                                                                 // 5266
    receive: function(url, elt, err, resource, redirectedUrl) {                                                        // 5267
      this.cache[url] = resource;                                                                                      // 5268
      var $p = this.pending[url];                                                                                      // 5269
      for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {                                                   // 5270
        this.onload(url, p, resource, err, redirectedUrl);                                                             // 5271
        this.tail();                                                                                                   // 5272
      }                                                                                                                // 5273
      this.pending[url] = null;                                                                                        // 5274
    },                                                                                                                 // 5275
    tail: function() {                                                                                                 // 5276
      --this.inflight;                                                                                                 // 5277
      this.checkDone();                                                                                                // 5278
    },                                                                                                                 // 5279
    checkDone: function() {                                                                                            // 5280
      if (!this.inflight) {                                                                                            // 5281
        this.oncomplete();                                                                                             // 5282
      }                                                                                                                // 5283
    }                                                                                                                  // 5284
  };                                                                                                                   // 5285
  scope.Loader = Loader;                                                                                               // 5286
});                                                                                                                    // 5287
                                                                                                                       // 5288
HTMLImports.addModule(function(scope) {                                                                                // 5289
  var Observer = function(addCallback) {                                                                               // 5290
    this.addCallback = addCallback;                                                                                    // 5291
    this.mo = new MutationObserver(this.handler.bind(this));                                                           // 5292
  };                                                                                                                   // 5293
  Observer.prototype = {                                                                                               // 5294
    handler: function(mutations) {                                                                                     // 5295
      for (var i = 0, l = mutations.length, m; i < l && (m = mutations[i]); i++) {                                     // 5296
        if (m.type === "childList" && m.addedNodes.length) {                                                           // 5297
          this.addedNodes(m.addedNodes);                                                                               // 5298
        }                                                                                                              // 5299
      }                                                                                                                // 5300
    },                                                                                                                 // 5301
    addedNodes: function(nodes) {                                                                                      // 5302
      if (this.addCallback) {                                                                                          // 5303
        this.addCallback(nodes);                                                                                       // 5304
      }                                                                                                                // 5305
      for (var i = 0, l = nodes.length, n, loading; i < l && (n = nodes[i]); i++) {                                    // 5306
        if (n.children && n.children.length) {                                                                         // 5307
          this.addedNodes(n.children);                                                                                 // 5308
        }                                                                                                              // 5309
      }                                                                                                                // 5310
    },                                                                                                                 // 5311
    observe: function(root) {                                                                                          // 5312
      this.mo.observe(root, {                                                                                          // 5313
        childList: true,                                                                                               // 5314
        subtree: true                                                                                                  // 5315
      });                                                                                                              // 5316
    }                                                                                                                  // 5317
  };                                                                                                                   // 5318
  scope.Observer = Observer;                                                                                           // 5319
});                                                                                                                    // 5320
                                                                                                                       // 5321
HTMLImports.addModule(function(scope) {                                                                                // 5322
  var path = scope.path;                                                                                               // 5323
  var rootDocument = scope.rootDocument;                                                                               // 5324
  var flags = scope.flags;                                                                                             // 5325
  var isIE = scope.isIE;                                                                                               // 5326
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;                                                                       // 5327
  var IMPORT_SELECTOR = "link[rel=" + IMPORT_LINK_TYPE + "]";                                                          // 5328
  var importParser = {                                                                                                 // 5329
    documentSelectors: IMPORT_SELECTOR,                                                                                // 5330
    importsSelectors: [ IMPORT_SELECTOR, "link[rel=stylesheet]", "style", "script:not([type])", 'script[type="text/javascript"]' ].join(","),
    map: {                                                                                                             // 5332
      link: "parseLink",                                                                                               // 5333
      script: "parseScript",                                                                                           // 5334
      style: "parseStyle"                                                                                              // 5335
    },                                                                                                                 // 5336
    dynamicElements: [],                                                                                               // 5337
    parseNext: function() {                                                                                            // 5338
      var next = this.nextToParse();                                                                                   // 5339
      if (next) {                                                                                                      // 5340
        this.parse(next);                                                                                              // 5341
      }                                                                                                                // 5342
    },                                                                                                                 // 5343
    parse: function(elt) {                                                                                             // 5344
      if (this.isParsed(elt)) {                                                                                        // 5345
        flags.parse && console.log("[%s] is already parsed", elt.localName);                                           // 5346
        return;                                                                                                        // 5347
      }                                                                                                                // 5348
      var fn = this[this.map[elt.localName]];                                                                          // 5349
      if (fn) {                                                                                                        // 5350
        this.markParsing(elt);                                                                                         // 5351
        fn.call(this, elt);                                                                                            // 5352
      }                                                                                                                // 5353
    },                                                                                                                 // 5354
    parseDynamic: function(elt, quiet) {                                                                               // 5355
      this.dynamicElements.push(elt);                                                                                  // 5356
      if (!quiet) {                                                                                                    // 5357
        this.parseNext();                                                                                              // 5358
      }                                                                                                                // 5359
    },                                                                                                                 // 5360
    markParsing: function(elt) {                                                                                       // 5361
      flags.parse && console.log("parsing", elt);                                                                      // 5362
      this.parsingElement = elt;                                                                                       // 5363
    },                                                                                                                 // 5364
    markParsingComplete: function(elt) {                                                                               // 5365
      elt.__importParsed = true;                                                                                       // 5366
      this.markDynamicParsingComplete(elt);                                                                            // 5367
      if (elt.__importElement) {                                                                                       // 5368
        elt.__importElement.__importParsed = true;                                                                     // 5369
        this.markDynamicParsingComplete(elt.__importElement);                                                          // 5370
      }                                                                                                                // 5371
      this.parsingElement = null;                                                                                      // 5372
      flags.parse && console.log("completed", elt);                                                                    // 5373
    },                                                                                                                 // 5374
    markDynamicParsingComplete: function(elt) {                                                                        // 5375
      var i = this.dynamicElements.indexOf(elt);                                                                       // 5376
      if (i >= 0) {                                                                                                    // 5377
        this.dynamicElements.splice(i, 1);                                                                             // 5378
      }                                                                                                                // 5379
    },                                                                                                                 // 5380
    parseImport: function(elt) {                                                                                       // 5381
      if (HTMLImports.__importsParsingHook) {                                                                          // 5382
        HTMLImports.__importsParsingHook(elt);                                                                         // 5383
      }                                                                                                                // 5384
      if (elt.import) {                                                                                                // 5385
        elt.import.__importParsed = true;                                                                              // 5386
      }                                                                                                                // 5387
      this.markParsingComplete(elt);                                                                                   // 5388
      if (elt.__resource && !elt.__error) {                                                                            // 5389
        elt.dispatchEvent(new CustomEvent("load", {                                                                    // 5390
          bubbles: false                                                                                               // 5391
        }));                                                                                                           // 5392
      } else {                                                                                                         // 5393
        elt.dispatchEvent(new CustomEvent("error", {                                                                   // 5394
          bubbles: false                                                                                               // 5395
        }));                                                                                                           // 5396
      }                                                                                                                // 5397
      if (elt.__pending) {                                                                                             // 5398
        var fn;                                                                                                        // 5399
        while (elt.__pending.length) {                                                                                 // 5400
          fn = elt.__pending.shift();                                                                                  // 5401
          if (fn) {                                                                                                    // 5402
            fn({                                                                                                       // 5403
              target: elt                                                                                              // 5404
            });                                                                                                        // 5405
          }                                                                                                            // 5406
        }                                                                                                              // 5407
      }                                                                                                                // 5408
      this.parseNext();                                                                                                // 5409
    },                                                                                                                 // 5410
    parseLink: function(linkElt) {                                                                                     // 5411
      if (nodeIsImport(linkElt)) {                                                                                     // 5412
        this.parseImport(linkElt);                                                                                     // 5413
      } else {                                                                                                         // 5414
        linkElt.href = linkElt.href;                                                                                   // 5415
        this.parseGeneric(linkElt);                                                                                    // 5416
      }                                                                                                                // 5417
    },                                                                                                                 // 5418
    parseStyle: function(elt) {                                                                                        // 5419
      var src = elt;                                                                                                   // 5420
      elt = cloneStyle(elt);                                                                                           // 5421
      elt.__importElement = src;                                                                                       // 5422
      this.parseGeneric(elt);                                                                                          // 5423
    },                                                                                                                 // 5424
    parseGeneric: function(elt) {                                                                                      // 5425
      this.trackElement(elt);                                                                                          // 5426
      this.addElementToDocument(elt);                                                                                  // 5427
    },                                                                                                                 // 5428
    rootImportForElement: function(elt) {                                                                              // 5429
      var n = elt;                                                                                                     // 5430
      while (n.ownerDocument.__importLink) {                                                                           // 5431
        n = n.ownerDocument.__importLink;                                                                              // 5432
      }                                                                                                                // 5433
      return n;                                                                                                        // 5434
    },                                                                                                                 // 5435
    addElementToDocument: function(elt) {                                                                              // 5436
      var port = this.rootImportForElement(elt.__importElement || elt);                                                // 5437
      var l = port.__insertedElements = port.__insertedElements || 0;                                                  // 5438
      var refNode = port.nextElementSibling;                                                                           // 5439
      for (var i = 0; i < l; i++) {                                                                                    // 5440
        refNode = refNode && refNode.nextElementSibling;                                                               // 5441
      }                                                                                                                // 5442
      port.parentNode.insertBefore(elt, refNode);                                                                      // 5443
    },                                                                                                                 // 5444
    trackElement: function(elt, callback) {                                                                            // 5445
      var self = this;                                                                                                 // 5446
      var done = function(e) {                                                                                         // 5447
        if (callback) {                                                                                                // 5448
          callback(e);                                                                                                 // 5449
        }                                                                                                              // 5450
        self.markParsingComplete(elt);                                                                                 // 5451
        self.parseNext();                                                                                              // 5452
      };                                                                                                               // 5453
      elt.addEventListener("load", done);                                                                              // 5454
      elt.addEventListener("error", done);                                                                             // 5455
      if (isIE && elt.localName === "style") {                                                                         // 5456
        var fakeLoad = false;                                                                                          // 5457
        if (elt.textContent.indexOf("@import") == -1) {                                                                // 5458
          fakeLoad = true;                                                                                             // 5459
        } else if (elt.sheet) {                                                                                        // 5460
          fakeLoad = true;                                                                                             // 5461
          var csr = elt.sheet.cssRules;                                                                                // 5462
          var len = csr ? csr.length : 0;                                                                              // 5463
          for (var i = 0, r; i < len && (r = csr[i]); i++) {                                                           // 5464
            if (r.type === CSSRule.IMPORT_RULE) {                                                                      // 5465
              fakeLoad = fakeLoad && Boolean(r.styleSheet);                                                            // 5466
            }                                                                                                          // 5467
          }                                                                                                            // 5468
        }                                                                                                              // 5469
        if (fakeLoad) {                                                                                                // 5470
          elt.dispatchEvent(new CustomEvent("load", {                                                                  // 5471
            bubbles: false                                                                                             // 5472
          }));                                                                                                         // 5473
        }                                                                                                              // 5474
      }                                                                                                                // 5475
    },                                                                                                                 // 5476
    parseScript: function(scriptElt) {                                                                                 // 5477
      var script = document.createElement("script");                                                                   // 5478
      script.__importElement = scriptElt;                                                                              // 5479
      script.src = scriptElt.src ? scriptElt.src : generateScriptDataUrl(scriptElt);                                   // 5480
      scope.currentScript = scriptElt;                                                                                 // 5481
      this.trackElement(script, function(e) {                                                                          // 5482
        script.parentNode.removeChild(script);                                                                         // 5483
        scope.currentScript = null;                                                                                    // 5484
      });                                                                                                              // 5485
      this.addElementToDocument(script);                                                                               // 5486
    },                                                                                                                 // 5487
    nextToParse: function() {                                                                                          // 5488
      this._mayParse = [];                                                                                             // 5489
      return !this.parsingElement && (this.nextToParseInDoc(rootDocument) || this.nextToParseDynamic());               // 5490
    },                                                                                                                 // 5491
    nextToParseInDoc: function(doc, link) {                                                                            // 5492
      if (doc && this._mayParse.indexOf(doc) < 0) {                                                                    // 5493
        this._mayParse.push(doc);                                                                                      // 5494
        var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));                                             // 5495
        for (var i = 0, l = nodes.length, p = 0, n; i < l && (n = nodes[i]); i++) {                                    // 5496
          if (!this.isParsed(n)) {                                                                                     // 5497
            if (this.hasResource(n)) {                                                                                 // 5498
              return nodeIsImport(n) ? this.nextToParseInDoc(n.import, n) : n;                                         // 5499
            } else {                                                                                                   // 5500
              return;                                                                                                  // 5501
            }                                                                                                          // 5502
          }                                                                                                            // 5503
        }                                                                                                              // 5504
      }                                                                                                                // 5505
      return link;                                                                                                     // 5506
    },                                                                                                                 // 5507
    nextToParseDynamic: function() {                                                                                   // 5508
      return this.dynamicElements[0];                                                                                  // 5509
    },                                                                                                                 // 5510
    parseSelectorsForNode: function(node) {                                                                            // 5511
      var doc = node.ownerDocument || node;                                                                            // 5512
      return doc === rootDocument ? this.documentSelectors : this.importsSelectors;                                    // 5513
    },                                                                                                                 // 5514
    isParsed: function(node) {                                                                                         // 5515
      return node.__importParsed;                                                                                      // 5516
    },                                                                                                                 // 5517
    needsDynamicParsing: function(elt) {                                                                               // 5518
      return this.dynamicElements.indexOf(elt) >= 0;                                                                   // 5519
    },                                                                                                                 // 5520
    hasResource: function(node) {                                                                                      // 5521
      if (nodeIsImport(node) && node.import === undefined) {                                                           // 5522
        return false;                                                                                                  // 5523
      }                                                                                                                // 5524
      return true;                                                                                                     // 5525
    }                                                                                                                  // 5526
  };                                                                                                                   // 5527
  function nodeIsImport(elt) {                                                                                         // 5528
    return elt.localName === "link" && elt.rel === IMPORT_LINK_TYPE;                                                   // 5529
  }                                                                                                                    // 5530
  function generateScriptDataUrl(script) {                                                                             // 5531
    var scriptContent = generateScriptContent(script);                                                                 // 5532
    return "data:text/javascript;charset=utf-8," + encodeURIComponent(scriptContent);                                  // 5533
  }                                                                                                                    // 5534
  function generateScriptContent(script) {                                                                             // 5535
    return script.textContent + generateSourceMapHint(script);                                                         // 5536
  }                                                                                                                    // 5537
  function generateSourceMapHint(script) {                                                                             // 5538
    var owner = script.ownerDocument;                                                                                  // 5539
    owner.__importedScripts = owner.__importedScripts || 0;                                                            // 5540
    var moniker = script.ownerDocument.baseURI;                                                                        // 5541
    var num = owner.__importedScripts ? "-" + owner.__importedScripts : "";                                            // 5542
    owner.__importedScripts++;                                                                                         // 5543
    return "\n//# sourceURL=" + moniker + num + ".js\n";                                                               // 5544
  }                                                                                                                    // 5545
  function cloneStyle(style) {                                                                                         // 5546
    var clone = style.ownerDocument.createElement("style");                                                            // 5547
    clone.textContent = style.textContent;                                                                             // 5548
    path.resolveUrlsInStyle(clone);                                                                                    // 5549
    return clone;                                                                                                      // 5550
  }                                                                                                                    // 5551
  scope.parser = importParser;                                                                                         // 5552
  scope.IMPORT_SELECTOR = IMPORT_SELECTOR;                                                                             // 5553
});                                                                                                                    // 5554
                                                                                                                       // 5555
HTMLImports.addModule(function(scope) {                                                                                // 5556
  var flags = scope.flags;                                                                                             // 5557
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;                                                                       // 5558
  var IMPORT_SELECTOR = scope.IMPORT_SELECTOR;                                                                         // 5559
  var rootDocument = scope.rootDocument;                                                                               // 5560
  var Loader = scope.Loader;                                                                                           // 5561
  var Observer = scope.Observer;                                                                                       // 5562
  var parser = scope.parser;                                                                                           // 5563
  var importer = {                                                                                                     // 5564
    documents: {},                                                                                                     // 5565
    documentPreloadSelectors: IMPORT_SELECTOR,                                                                         // 5566
    importsPreloadSelectors: [ IMPORT_SELECTOR ].join(","),                                                            // 5567
    loadNode: function(node) {                                                                                         // 5568
      importLoader.addNode(node);                                                                                      // 5569
    },                                                                                                                 // 5570
    loadSubtree: function(parent) {                                                                                    // 5571
      var nodes = this.marshalNodes(parent);                                                                           // 5572
      importLoader.addNodes(nodes);                                                                                    // 5573
    },                                                                                                                 // 5574
    marshalNodes: function(parent) {                                                                                   // 5575
      return parent.querySelectorAll(this.loadSelectorsForNode(parent));                                               // 5576
    },                                                                                                                 // 5577
    loadSelectorsForNode: function(node) {                                                                             // 5578
      var doc = node.ownerDocument || node;                                                                            // 5579
      return doc === rootDocument ? this.documentPreloadSelectors : this.importsPreloadSelectors;                      // 5580
    },                                                                                                                 // 5581
    loaded: function(url, elt, resource, err, redirectedUrl) {                                                         // 5582
      flags.load && console.log("loaded", url, elt);                                                                   // 5583
      elt.__resource = resource;                                                                                       // 5584
      elt.__error = err;                                                                                               // 5585
      if (isImportLink(elt)) {                                                                                         // 5586
        var doc = this.documents[url];                                                                                 // 5587
        if (doc === undefined) {                                                                                       // 5588
          doc = err ? null : makeDocument(resource, redirectedUrl || url);                                             // 5589
          if (doc) {                                                                                                   // 5590
            doc.__importLink = elt;                                                                                    // 5591
            this.bootDocument(doc);                                                                                    // 5592
          }                                                                                                            // 5593
          this.documents[url] = doc;                                                                                   // 5594
        }                                                                                                              // 5595
        elt.import = doc;                                                                                              // 5596
      }                                                                                                                // 5597
      parser.parseNext();                                                                                              // 5598
    },                                                                                                                 // 5599
    bootDocument: function(doc) {                                                                                      // 5600
      this.loadSubtree(doc);                                                                                           // 5601
      this.observer.observe(doc);                                                                                      // 5602
      parser.parseNext();                                                                                              // 5603
    },                                                                                                                 // 5604
    loadedAll: function() {                                                                                            // 5605
      parser.parseNext();                                                                                              // 5606
    }                                                                                                                  // 5607
  };                                                                                                                   // 5608
  var importLoader = new Loader(importer.loaded.bind(importer), importer.loadedAll.bind(importer));                    // 5609
  importer.observer = new Observer();                                                                                  // 5610
  function isImportLink(elt) {                                                                                         // 5611
    return isLinkRel(elt, IMPORT_LINK_TYPE);                                                                           // 5612
  }                                                                                                                    // 5613
  function isLinkRel(elt, rel) {                                                                                       // 5614
    return elt.localName === "link" && elt.getAttribute("rel") === rel;                                                // 5615
  }                                                                                                                    // 5616
  function makeDocument(resource, url) {                                                                               // 5617
    var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);                                            // 5618
    doc._URL = url;                                                                                                    // 5619
    var base = doc.createElement("base");                                                                              // 5620
    base.setAttribute("href", url);                                                                                    // 5621
    if (!doc.baseURI) {                                                                                                // 5622
      doc.baseURI = url;                                                                                               // 5623
    }                                                                                                                  // 5624
    var meta = doc.createElement("meta");                                                                              // 5625
    meta.setAttribute("charset", "utf-8");                                                                             // 5626
    doc.head.appendChild(meta);                                                                                        // 5627
    doc.head.appendChild(base);                                                                                        // 5628
    doc.body.innerHTML = resource;                                                                                     // 5629
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {                                                 // 5630
      HTMLTemplateElement.bootstrap(doc);                                                                              // 5631
    }                                                                                                                  // 5632
    return doc;                                                                                                        // 5633
  }                                                                                                                    // 5634
  if (!document.baseURI) {                                                                                             // 5635
    var baseURIDescriptor = {                                                                                          // 5636
      get: function() {                                                                                                // 5637
        var base = document.querySelector("base");                                                                     // 5638
        return base ? base.href : window.location.href;                                                                // 5639
      },                                                                                                               // 5640
      configurable: true                                                                                               // 5641
    };                                                                                                                 // 5642
    Object.defineProperty(document, "baseURI", baseURIDescriptor);                                                     // 5643
    Object.defineProperty(rootDocument, "baseURI", baseURIDescriptor);                                                 // 5644
  }                                                                                                                    // 5645
  scope.importer = importer;                                                                                           // 5646
  scope.importLoader = importLoader;                                                                                   // 5647
});                                                                                                                    // 5648
                                                                                                                       // 5649
HTMLImports.addModule(function(scope) {                                                                                // 5650
  var parser = scope.parser;                                                                                           // 5651
  var importer = scope.importer;                                                                                       // 5652
  var dynamic = {                                                                                                      // 5653
    added: function(nodes) {                                                                                           // 5654
      var owner, parsed;                                                                                               // 5655
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {                                             // 5656
        if (!owner) {                                                                                                  // 5657
          owner = n.ownerDocument;                                                                                     // 5658
          parsed = parser.isParsed(owner);                                                                             // 5659
        }                                                                                                              // 5660
        loading = this.shouldLoadNode(n);                                                                              // 5661
        if (loading) {                                                                                                 // 5662
          importer.loadNode(n);                                                                                        // 5663
        }                                                                                                              // 5664
        if (this.shouldParseNode(n) && parsed) {                                                                       // 5665
          parser.parseDynamic(n, loading);                                                                             // 5666
        }                                                                                                              // 5667
      }                                                                                                                // 5668
    },                                                                                                                 // 5669
    shouldLoadNode: function(node) {                                                                                   // 5670
      return node.nodeType === 1 && matches.call(node, importer.loadSelectorsForNode(node));                           // 5671
    },                                                                                                                 // 5672
    shouldParseNode: function(node) {                                                                                  // 5673
      return node.nodeType === 1 && matches.call(node, parser.parseSelectorsForNode(node));                            // 5674
    }                                                                                                                  // 5675
  };                                                                                                                   // 5676
  importer.observer.addCallback = dynamic.added.bind(dynamic);                                                         // 5677
  var matches = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector;
});                                                                                                                    // 5679
                                                                                                                       // 5680
(function(scope) {                                                                                                     // 5681
  initializeModules = scope.initializeModules;                                                                         // 5682
  if (scope.useNative) {                                                                                               // 5683
    return;                                                                                                            // 5684
  }                                                                                                                    // 5685
  if (typeof window.CustomEvent !== "function") {                                                                      // 5686
    window.CustomEvent = function(inType, dictionary) {                                                                // 5687
      var e = document.createEvent("HTMLEvents");                                                                      // 5688
      e.initEvent(inType, dictionary.bubbles === false ? false : true, dictionary.cancelable === false ? false : true, dictionary.detail);
      return e;                                                                                                        // 5690
    };                                                                                                                 // 5691
  }                                                                                                                    // 5692
  initializeModules();                                                                                                 // 5693
  var rootDocument = scope.rootDocument;                                                                               // 5694
  function bootstrap() {                                                                                               // 5695
    HTMLImports.importer.bootDocument(rootDocument);                                                                   // 5696
  }                                                                                                                    // 5697
  if (document.readyState === "complete" || document.readyState === "interactive" && !window.attachEvent) {            // 5698
    bootstrap();                                                                                                       // 5699
  } else {                                                                                                             // 5700
    document.addEventListener("DOMContentLoaded", bootstrap);                                                          // 5701
  }                                                                                                                    // 5702
})(HTMLImports);                                                                                                       // 5703
                                                                                                                       // 5704
window.CustomElements = window.CustomElements || {                                                                     // 5705
  flags: {}                                                                                                            // 5706
};                                                                                                                     // 5707
                                                                                                                       // 5708
(function(scope) {                                                                                                     // 5709
  var flags = scope.flags;                                                                                             // 5710
  var modules = [];                                                                                                    // 5711
  var addModule = function(module) {                                                                                   // 5712
    modules.push(module);                                                                                              // 5713
  };                                                                                                                   // 5714
  var initializeModules = function() {                                                                                 // 5715
    modules.forEach(function(module) {                                                                                 // 5716
      module(scope);                                                                                                   // 5717
    });                                                                                                                // 5718
  };                                                                                                                   // 5719
  scope.addModule = addModule;                                                                                         // 5720
  scope.initializeModules = initializeModules;                                                                         // 5721
  scope.hasNative = Boolean(document.registerElement);                                                                 // 5722
  scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || HTMLImports.useNative);
})(CustomElements);                                                                                                    // 5724
                                                                                                                       // 5725
CustomElements.addModule(function(scope) {                                                                             // 5726
  var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : "none";                                   // 5727
  function forSubtree(node, cb) {                                                                                      // 5728
    findAllElements(node, function(e) {                                                                                // 5729
      if (cb(e)) {                                                                                                     // 5730
        return true;                                                                                                   // 5731
      }                                                                                                                // 5732
      forRoots(e, cb);                                                                                                 // 5733
    });                                                                                                                // 5734
    forRoots(node, cb);                                                                                                // 5735
  }                                                                                                                    // 5736
  function findAllElements(node, find, data) {                                                                         // 5737
    var e = node.firstElementChild;                                                                                    // 5738
    if (!e) {                                                                                                          // 5739
      e = node.firstChild;                                                                                             // 5740
      while (e && e.nodeType !== Node.ELEMENT_NODE) {                                                                  // 5741
        e = e.nextSibling;                                                                                             // 5742
      }                                                                                                                // 5743
    }                                                                                                                  // 5744
    while (e) {                                                                                                        // 5745
      if (find(e, data) !== true) {                                                                                    // 5746
        findAllElements(e, find, data);                                                                                // 5747
      }                                                                                                                // 5748
      e = e.nextElementSibling;                                                                                        // 5749
    }                                                                                                                  // 5750
    return null;                                                                                                       // 5751
  }                                                                                                                    // 5752
  function forRoots(node, cb) {                                                                                        // 5753
    var root = node.shadowRoot;                                                                                        // 5754
    while (root) {                                                                                                     // 5755
      forSubtree(root, cb);                                                                                            // 5756
      root = root.olderShadowRoot;                                                                                     // 5757
    }                                                                                                                  // 5758
  }                                                                                                                    // 5759
  var processingDocuments;                                                                                             // 5760
  function forDocumentTree(doc, cb) {                                                                                  // 5761
    processingDocuments = [];                                                                                          // 5762
    _forDocumentTree(doc, cb);                                                                                         // 5763
    processingDocuments = null;                                                                                        // 5764
  }                                                                                                                    // 5765
  function _forDocumentTree(doc, cb) {                                                                                 // 5766
    doc = wrap(doc);                                                                                                   // 5767
    if (processingDocuments.indexOf(doc) >= 0) {                                                                       // 5768
      return;                                                                                                          // 5769
    }                                                                                                                  // 5770
    processingDocuments.push(doc);                                                                                     // 5771
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");                                          // 5772
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {                                           // 5773
      if (n.import) {                                                                                                  // 5774
        _forDocumentTree(n.import, cb);                                                                                // 5775
      }                                                                                                                // 5776
    }                                                                                                                  // 5777
    cb(doc);                                                                                                           // 5778
  }                                                                                                                    // 5779
  scope.forDocumentTree = forDocumentTree;                                                                             // 5780
  scope.forSubtree = forSubtree;                                                                                       // 5781
});                                                                                                                    // 5782
                                                                                                                       // 5783
CustomElements.addModule(function(scope) {                                                                             // 5784
  var flags = scope.flags;                                                                                             // 5785
  var forSubtree = scope.forSubtree;                                                                                   // 5786
  var forDocumentTree = scope.forDocumentTree;                                                                         // 5787
  function addedNode(node) {                                                                                           // 5788
    return added(node) || addedSubtree(node);                                                                          // 5789
  }                                                                                                                    // 5790
  function added(node) {                                                                                               // 5791
    if (scope.upgrade(node)) {                                                                                         // 5792
      return true;                                                                                                     // 5793
    }                                                                                                                  // 5794
    attached(node);                                                                                                    // 5795
  }                                                                                                                    // 5796
  function addedSubtree(node) {                                                                                        // 5797
    forSubtree(node, function(e) {                                                                                     // 5798
      if (added(e)) {                                                                                                  // 5799
        return true;                                                                                                   // 5800
      }                                                                                                                // 5801
    });                                                                                                                // 5802
  }                                                                                                                    // 5803
  function attachedNode(node) {                                                                                        // 5804
    attached(node);                                                                                                    // 5805
    if (inDocument(node)) {                                                                                            // 5806
      forSubtree(node, function(e) {                                                                                   // 5807
        attached(e);                                                                                                   // 5808
      });                                                                                                              // 5809
    }                                                                                                                  // 5810
  }                                                                                                                    // 5811
  var hasPolyfillMutations = !window.MutationObserver || window.MutationObserver === window.JsMutationObserver;        // 5812
  scope.hasPolyfillMutations = hasPolyfillMutations;                                                                   // 5813
  var isPendingMutations = false;                                                                                      // 5814
  var pendingMutations = [];                                                                                           // 5815
  function deferMutation(fn) {                                                                                         // 5816
    pendingMutations.push(fn);                                                                                         // 5817
    if (!isPendingMutations) {                                                                                         // 5818
      isPendingMutations = true;                                                                                       // 5819
      setTimeout(takeMutations);                                                                                       // 5820
    }                                                                                                                  // 5821
  }                                                                                                                    // 5822
  function takeMutations() {                                                                                           // 5823
    isPendingMutations = false;                                                                                        // 5824
    var $p = pendingMutations;                                                                                         // 5825
    for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {                                                     // 5826
      p();                                                                                                             // 5827
    }                                                                                                                  // 5828
    pendingMutations = [];                                                                                             // 5829
  }                                                                                                                    // 5830
  function attached(element) {                                                                                         // 5831
    if (hasPolyfillMutations) {                                                                                        // 5832
      deferMutation(function() {                                                                                       // 5833
        _attached(element);                                                                                            // 5834
      });                                                                                                              // 5835
    } else {                                                                                                           // 5836
      _attached(element);                                                                                              // 5837
    }                                                                                                                  // 5838
  }                                                                                                                    // 5839
  function _attached(element) {                                                                                        // 5840
    if (element.__upgraded__ && (element.attachedCallback || element.detachedCallback)) {                              // 5841
      if (!element.__attached && inDocument(element)) {                                                                // 5842
        element.__attached = true;                                                                                     // 5843
        if (element.attachedCallback) {                                                                                // 5844
          element.attachedCallback();                                                                                  // 5845
        }                                                                                                              // 5846
      }                                                                                                                // 5847
    }                                                                                                                  // 5848
  }                                                                                                                    // 5849
  function detachedNode(node) {                                                                                        // 5850
    detached(node);                                                                                                    // 5851
    forSubtree(node, function(e) {                                                                                     // 5852
      detached(e);                                                                                                     // 5853
    });                                                                                                                // 5854
  }                                                                                                                    // 5855
  function detached(element) {                                                                                         // 5856
    if (hasPolyfillMutations) {                                                                                        // 5857
      deferMutation(function() {                                                                                       // 5858
        _detached(element);                                                                                            // 5859
      });                                                                                                              // 5860
    } else {                                                                                                           // 5861
      _detached(element);                                                                                              // 5862
    }                                                                                                                  // 5863
  }                                                                                                                    // 5864
  function _detached(element) {                                                                                        // 5865
    if (element.__upgraded__ && (element.attachedCallback || element.detachedCallback)) {                              // 5866
      if (element.__attached && !inDocument(element)) {                                                                // 5867
        element.__attached = false;                                                                                    // 5868
        if (element.detachedCallback) {                                                                                // 5869
          element.detachedCallback();                                                                                  // 5870
        }                                                                                                              // 5871
      }                                                                                                                // 5872
    }                                                                                                                  // 5873
  }                                                                                                                    // 5874
  function inDocument(element) {                                                                                       // 5875
    var p = element;                                                                                                   // 5876
    var doc = wrap(document);                                                                                          // 5877
    while (p) {                                                                                                        // 5878
      if (p == doc) {                                                                                                  // 5879
        return true;                                                                                                   // 5880
      }                                                                                                                // 5881
      p = p.parentNode || p.host;                                                                                      // 5882
    }                                                                                                                  // 5883
  }                                                                                                                    // 5884
  function watchShadow(node) {                                                                                         // 5885
    if (node.shadowRoot && !node.shadowRoot.__watched) {                                                               // 5886
      flags.dom && console.log("watching shadow-root for: ", node.localName);                                          // 5887
      var root = node.shadowRoot;                                                                                      // 5888
      while (root) {                                                                                                   // 5889
        observe(root);                                                                                                 // 5890
        root = root.olderShadowRoot;                                                                                   // 5891
      }                                                                                                                // 5892
    }                                                                                                                  // 5893
  }                                                                                                                    // 5894
  function handler(mutations) {                                                                                        // 5895
    if (flags.dom) {                                                                                                   // 5896
      var mx = mutations[0];                                                                                           // 5897
      if (mx && mx.type === "childList" && mx.addedNodes) {                                                            // 5898
        if (mx.addedNodes) {                                                                                           // 5899
          var d = mx.addedNodes[0];                                                                                    // 5900
          while (d && d !== document && !d.host) {                                                                     // 5901
            d = d.parentNode;                                                                                          // 5902
          }                                                                                                            // 5903
          var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";                                          // 5904
          u = u.split("/?").shift().split("/").pop();                                                                  // 5905
        }                                                                                                              // 5906
      }                                                                                                                // 5907
      console.group("mutations (%d) [%s]", mutations.length, u || "");                                                 // 5908
    }                                                                                                                  // 5909
    mutations.forEach(function(mx) {                                                                                   // 5910
      if (mx.type === "childList") {                                                                                   // 5911
        forEach(mx.addedNodes, function(n) {                                                                           // 5912
          if (!n.localName) {                                                                                          // 5913
            return;                                                                                                    // 5914
          }                                                                                                            // 5915
          addedNode(n);                                                                                                // 5916
        });                                                                                                            // 5917
        forEach(mx.removedNodes, function(n) {                                                                         // 5918
          if (!n.localName) {                                                                                          // 5919
            return;                                                                                                    // 5920
          }                                                                                                            // 5921
          detachedNode(n);                                                                                             // 5922
        });                                                                                                            // 5923
      }                                                                                                                // 5924
    });                                                                                                                // 5925
    flags.dom && console.groupEnd();                                                                                   // 5926
  }                                                                                                                    // 5927
  function takeRecords(node) {                                                                                         // 5928
    node = wrap(node);                                                                                                 // 5929
    if (!node) {                                                                                                       // 5930
      node = wrap(document);                                                                                           // 5931
    }                                                                                                                  // 5932
    while (node.parentNode) {                                                                                          // 5933
      node = node.parentNode;                                                                                          // 5934
    }                                                                                                                  // 5935
    var observer = node.__observer;                                                                                    // 5936
    if (observer) {                                                                                                    // 5937
      handler(observer.takeRecords());                                                                                 // 5938
      takeMutations();                                                                                                 // 5939
    }                                                                                                                  // 5940
  }                                                                                                                    // 5941
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);                                            // 5942
  function observe(inRoot) {                                                                                           // 5943
    if (inRoot.__observer) {                                                                                           // 5944
      return;                                                                                                          // 5945
    }                                                                                                                  // 5946
    var observer = new MutationObserver(handler);                                                                      // 5947
    observer.observe(inRoot, {                                                                                         // 5948
      childList: true,                                                                                                 // 5949
      subtree: true                                                                                                    // 5950
    });                                                                                                                // 5951
    inRoot.__observer = observer;                                                                                      // 5952
  }                                                                                                                    // 5953
  function upgradeDocument(doc) {                                                                                      // 5954
    doc = wrap(doc);                                                                                                   // 5955
    flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());                                     // 5956
    addedNode(doc);                                                                                                    // 5957
    observe(doc);                                                                                                      // 5958
    flags.dom && console.groupEnd();                                                                                   // 5959
  }                                                                                                                    // 5960
  function upgradeDocumentTree(doc) {                                                                                  // 5961
    forDocumentTree(doc, upgradeDocument);                                                                             // 5962
  }                                                                                                                    // 5963
  var originalCreateShadowRoot = Element.prototype.createShadowRoot;                                                   // 5964
  Element.prototype.createShadowRoot = function() {                                                                    // 5965
    var root = originalCreateShadowRoot.call(this);                                                                    // 5966
    CustomElements.watchShadow(this);                                                                                  // 5967
    return root;                                                                                                       // 5968
  };                                                                                                                   // 5969
  scope.watchShadow = watchShadow;                                                                                     // 5970
  scope.upgradeDocumentTree = upgradeDocumentTree;                                                                     // 5971
  scope.upgradeSubtree = addedSubtree;                                                                                 // 5972
  scope.upgradeAll = addedNode;                                                                                        // 5973
  scope.attachedNode = attachedNode;                                                                                   // 5974
  scope.takeRecords = takeRecords;                                                                                     // 5975
});                                                                                                                    // 5976
                                                                                                                       // 5977
CustomElements.addModule(function(scope) {                                                                             // 5978
  var flags = scope.flags;                                                                                             // 5979
  function upgrade(node) {                                                                                             // 5980
    if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {                                                   // 5981
      var is = node.getAttribute("is");                                                                                // 5982
      var definition = scope.getRegisteredDefinition(is || node.localName);                                            // 5983
      if (definition) {                                                                                                // 5984
        if (is && definition.tag == node.localName) {                                                                  // 5985
          return upgradeWithDefinition(node, definition);                                                              // 5986
        } else if (!is && !definition.extends) {                                                                       // 5987
          return upgradeWithDefinition(node, definition);                                                              // 5988
        }                                                                                                              // 5989
      }                                                                                                                // 5990
    }                                                                                                                  // 5991
  }                                                                                                                    // 5992
  function upgradeWithDefinition(element, definition) {                                                                // 5993
    flags.upgrade && console.group("upgrade:", element.localName);                                                     // 5994
    if (definition.is) {                                                                                               // 5995
      element.setAttribute("is", definition.is);                                                                       // 5996
    }                                                                                                                  // 5997
    implementPrototype(element, definition);                                                                           // 5998
    element.__upgraded__ = true;                                                                                       // 5999
    created(element);                                                                                                  // 6000
    scope.attachedNode(element);                                                                                       // 6001
    scope.upgradeSubtree(element);                                                                                     // 6002
    flags.upgrade && console.groupEnd();                                                                               // 6003
    return element;                                                                                                    // 6004
  }                                                                                                                    // 6005
  function implementPrototype(element, definition) {                                                                   // 6006
    if (Object.__proto__) {                                                                                            // 6007
      element.__proto__ = definition.prototype;                                                                        // 6008
    } else {                                                                                                           // 6009
      customMixin(element, definition.prototype, definition.native);                                                   // 6010
      element.__proto__ = definition.prototype;                                                                        // 6011
    }                                                                                                                  // 6012
  }                                                                                                                    // 6013
  function customMixin(inTarget, inSrc, inNative) {                                                                    // 6014
    var used = {};                                                                                                     // 6015
    var p = inSrc;                                                                                                     // 6016
    while (p !== inNative && p !== HTMLElement.prototype) {                                                            // 6017
      var keys = Object.getOwnPropertyNames(p);                                                                        // 6018
      for (var i = 0, k; k = keys[i]; i++) {                                                                           // 6019
        if (!used[k]) {                                                                                                // 6020
          Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));                                   // 6021
          used[k] = 1;                                                                                                 // 6022
        }                                                                                                              // 6023
      }                                                                                                                // 6024
      p = Object.getPrototypeOf(p);                                                                                    // 6025
    }                                                                                                                  // 6026
  }                                                                                                                    // 6027
  function created(element) {                                                                                          // 6028
    if (element.createdCallback) {                                                                                     // 6029
      element.createdCallback();                                                                                       // 6030
    }                                                                                                                  // 6031
  }                                                                                                                    // 6032
  scope.upgrade = upgrade;                                                                                             // 6033
  scope.upgradeWithDefinition = upgradeWithDefinition;                                                                 // 6034
  scope.implementPrototype = implementPrototype;                                                                       // 6035
});                                                                                                                    // 6036
                                                                                                                       // 6037
CustomElements.addModule(function(scope) {                                                                             // 6038
  var upgradeDocumentTree = scope.upgradeDocumentTree;                                                                 // 6039
  var upgrade = scope.upgrade;                                                                                         // 6040
  var upgradeWithDefinition = scope.upgradeWithDefinition;                                                             // 6041
  var implementPrototype = scope.implementPrototype;                                                                   // 6042
  var useNative = scope.useNative;                                                                                     // 6043
  function register(name, options) {                                                                                   // 6044
    var definition = options || {};                                                                                    // 6045
    if (!name) {                                                                                                       // 6046
      throw new Error("document.registerElement: first argument `name` must not be empty");                            // 6047
    }                                                                                                                  // 6048
    if (name.indexOf("-") < 0) {                                                                                       // 6049
      throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
    }                                                                                                                  // 6051
    if (isReservedTag(name)) {                                                                                         // 6052
      throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
    }                                                                                                                  // 6054
    if (getRegisteredDefinition(name)) {                                                                               // 6055
      throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");      // 6056
    }                                                                                                                  // 6057
    if (!definition.prototype) {                                                                                       // 6058
      definition.prototype = Object.create(HTMLElement.prototype);                                                     // 6059
    }                                                                                                                  // 6060
    definition.__name = name.toLowerCase();                                                                            // 6061
    definition.lifecycle = definition.lifecycle || {};                                                                 // 6062
    definition.ancestry = ancestry(definition.extends);                                                                // 6063
    resolveTagName(definition);                                                                                        // 6064
    resolvePrototypeChain(definition);                                                                                 // 6065
    overrideAttributeApi(definition.prototype);                                                                        // 6066
    registerDefinition(definition.__name, definition);                                                                 // 6067
    definition.ctor = generateConstructor(definition);                                                                 // 6068
    definition.ctor.prototype = definition.prototype;                                                                  // 6069
    definition.prototype.constructor = definition.ctor;                                                                // 6070
    if (scope.ready) {                                                                                                 // 6071
      upgradeDocumentTree(document);                                                                                   // 6072
    }                                                                                                                  // 6073
    return definition.ctor;                                                                                            // 6074
  }                                                                                                                    // 6075
  function overrideAttributeApi(prototype) {                                                                           // 6076
    if (prototype.setAttribute._polyfilled) {                                                                          // 6077
      return;                                                                                                          // 6078
    }                                                                                                                  // 6079
    var setAttribute = prototype.setAttribute;                                                                         // 6080
    prototype.setAttribute = function(name, value) {                                                                   // 6081
      changeAttribute.call(this, name, value, setAttribute);                                                           // 6082
    };                                                                                                                 // 6083
    var removeAttribute = prototype.removeAttribute;                                                                   // 6084
    prototype.removeAttribute = function(name) {                                                                       // 6085
      changeAttribute.call(this, name, null, removeAttribute);                                                         // 6086
    };                                                                                                                 // 6087
    prototype.setAttribute._polyfilled = true;                                                                         // 6088
  }                                                                                                                    // 6089
  function changeAttribute(name, value, operation) {                                                                   // 6090
    name = name.toLowerCase();                                                                                         // 6091
    var oldValue = this.getAttribute(name);                                                                            // 6092
    operation.apply(this, arguments);                                                                                  // 6093
    var newValue = this.getAttribute(name);                                                                            // 6094
    if (this.attributeChangedCallback && newValue !== oldValue) {                                                      // 6095
      this.attributeChangedCallback(name, oldValue, newValue);                                                         // 6096
    }                                                                                                                  // 6097
  }                                                                                                                    // 6098
  function isReservedTag(name) {                                                                                       // 6099
    for (var i = 0; i < reservedTagList.length; i++) {                                                                 // 6100
      if (name === reservedTagList[i]) {                                                                               // 6101
        return true;                                                                                                   // 6102
      }                                                                                                                // 6103
    }                                                                                                                  // 6104
  }                                                                                                                    // 6105
  var reservedTagList = [ "annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph" ];
  function ancestry(extnds) {                                                                                          // 6107
    var extendee = getRegisteredDefinition(extnds);                                                                    // 6108
    if (extendee) {                                                                                                    // 6109
      return ancestry(extendee.extends).concat([ extendee ]);                                                          // 6110
    }                                                                                                                  // 6111
    return [];                                                                                                         // 6112
  }                                                                                                                    // 6113
  function resolveTagName(definition) {                                                                                // 6114
    var baseTag = definition.extends;                                                                                  // 6115
    for (var i = 0, a; a = definition.ancestry[i]; i++) {                                                              // 6116
      baseTag = a.is && a.tag;                                                                                         // 6117
    }                                                                                                                  // 6118
    definition.tag = baseTag || definition.__name;                                                                     // 6119
    if (baseTag) {                                                                                                     // 6120
      definition.is = definition.__name;                                                                               // 6121
    }                                                                                                                  // 6122
  }                                                                                                                    // 6123
  function resolvePrototypeChain(definition) {                                                                         // 6124
    if (!Object.__proto__) {                                                                                           // 6125
      var nativePrototype = HTMLElement.prototype;                                                                     // 6126
      if (definition.is) {                                                                                             // 6127
        var inst = document.createElement(definition.tag);                                                             // 6128
        var expectedPrototype = Object.getPrototypeOf(inst);                                                           // 6129
        if (expectedPrototype === definition.prototype) {                                                              // 6130
          nativePrototype = expectedPrototype;                                                                         // 6131
        }                                                                                                              // 6132
      }                                                                                                                // 6133
      var proto = definition.prototype, ancestor;                                                                      // 6134
      while (proto && proto !== nativePrototype) {                                                                     // 6135
        ancestor = Object.getPrototypeOf(proto);                                                                       // 6136
        proto.__proto__ = ancestor;                                                                                    // 6137
        proto = ancestor;                                                                                              // 6138
      }                                                                                                                // 6139
      definition.native = nativePrototype;                                                                             // 6140
    }                                                                                                                  // 6141
  }                                                                                                                    // 6142
  function instantiate(definition) {                                                                                   // 6143
    return upgradeWithDefinition(domCreateElement(definition.tag), definition);                                        // 6144
  }                                                                                                                    // 6145
  var registry = {};                                                                                                   // 6146
  function getRegisteredDefinition(name) {                                                                             // 6147
    if (name) {                                                                                                        // 6148
      return registry[name.toLowerCase()];                                                                             // 6149
    }                                                                                                                  // 6150
  }                                                                                                                    // 6151
  function registerDefinition(name, definition) {                                                                      // 6152
    registry[name] = definition;                                                                                       // 6153
  }                                                                                                                    // 6154
  function generateConstructor(definition) {                                                                           // 6155
    return function() {                                                                                                // 6156
      return instantiate(definition);                                                                                  // 6157
    };                                                                                                                 // 6158
  }                                                                                                                    // 6159
  var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";                                                                 // 6160
  function createElementNS(namespace, tag, typeExtension) {                                                            // 6161
    if (namespace === HTML_NAMESPACE) {                                                                                // 6162
      return createElement(tag, typeExtension);                                                                        // 6163
    } else {                                                                                                           // 6164
      return domCreateElementNS(namespace, tag);                                                                       // 6165
    }                                                                                                                  // 6166
  }                                                                                                                    // 6167
  function createElement(tag, typeExtension) {                                                                         // 6168
    var definition = getRegisteredDefinition(typeExtension || tag);                                                    // 6169
    if (definition) {                                                                                                  // 6170
      if (tag == definition.tag && typeExtension == definition.is) {                                                   // 6171
        return new definition.ctor();                                                                                  // 6172
      }                                                                                                                // 6173
      if (!typeExtension && !definition.is) {                                                                          // 6174
        return new definition.ctor();                                                                                  // 6175
      }                                                                                                                // 6176
    }                                                                                                                  // 6177
    var element;                                                                                                       // 6178
    if (typeExtension) {                                                                                               // 6179
      element = createElement(tag);                                                                                    // 6180
      element.setAttribute("is", typeExtension);                                                                       // 6181
      return element;                                                                                                  // 6182
    }                                                                                                                  // 6183
    element = domCreateElement(tag);                                                                                   // 6184
    if (tag.indexOf("-") >= 0) {                                                                                       // 6185
      implementPrototype(element, HTMLElement);                                                                        // 6186
    }                                                                                                                  // 6187
    return element;                                                                                                    // 6188
  }                                                                                                                    // 6189
  function cloneNode(deep) {                                                                                           // 6190
    var n = domCloneNode.call(this, deep);                                                                             // 6191
    upgrade(n);                                                                                                        // 6192
    return n;                                                                                                          // 6193
  }                                                                                                                    // 6194
  var domCreateElement = document.createElement.bind(document);                                                        // 6195
  var domCreateElementNS = document.createElementNS.bind(document);                                                    // 6196
  var domCloneNode = Node.prototype.cloneNode;                                                                         // 6197
  var isInstance;                                                                                                      // 6198
  if (!Object.__proto__ && !useNative) {                                                                               // 6199
    isInstance = function(obj, ctor) {                                                                                 // 6200
      var p = obj;                                                                                                     // 6201
      while (p) {                                                                                                      // 6202
        if (p === ctor.prototype) {                                                                                    // 6203
          return true;                                                                                                 // 6204
        }                                                                                                              // 6205
        p = p.__proto__;                                                                                               // 6206
      }                                                                                                                // 6207
      return false;                                                                                                    // 6208
    };                                                                                                                 // 6209
  } else {                                                                                                             // 6210
    isInstance = function(obj, base) {                                                                                 // 6211
      return obj instanceof base;                                                                                      // 6212
    };                                                                                                                 // 6213
  }                                                                                                                    // 6214
  document.registerElement = register;                                                                                 // 6215
  document.createElement = createElement;                                                                              // 6216
  document.createElementNS = createElementNS;                                                                          // 6217
  Node.prototype.cloneNode = cloneNode;                                                                                // 6218
  scope.registry = registry;                                                                                           // 6219
  scope.instanceof = isInstance;                                                                                       // 6220
  scope.reservedTagList = reservedTagList;                                                                             // 6221
  scope.getRegisteredDefinition = getRegisteredDefinition;                                                             // 6222
  document.register = document.registerElement;                                                                        // 6223
});                                                                                                                    // 6224
                                                                                                                       // 6225
(function(scope) {                                                                                                     // 6226
  var useNative = scope.useNative;                                                                                     // 6227
  var initializeModules = scope.initializeModules;                                                                     // 6228
  if (useNative) {                                                                                                     // 6229
    var nop = function() {};                                                                                           // 6230
    scope.watchShadow = nop;                                                                                           // 6231
    scope.upgrade = nop;                                                                                               // 6232
    scope.upgradeAll = nop;                                                                                            // 6233
    scope.upgradeDocumentTree = nop;                                                                                   // 6234
    scope.upgradeSubtree = nop;                                                                                        // 6235
    scope.takeRecords = nop;                                                                                           // 6236
    scope.instanceof = function(obj, base) {                                                                           // 6237
      return obj instanceof base;                                                                                      // 6238
    };                                                                                                                 // 6239
  } else {                                                                                                             // 6240
    initializeModules();                                                                                               // 6241
  }                                                                                                                    // 6242
  var upgradeDocumentTree = scope.upgradeDocumentTree;                                                                 // 6243
  if (!window.wrap) {                                                                                                  // 6244
    if (window.ShadowDOMPolyfill) {                                                                                    // 6245
      window.wrap = ShadowDOMPolyfill.wrapIfNeeded;                                                                    // 6246
      window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;                                                                // 6247
    } else {                                                                                                           // 6248
      window.wrap = window.unwrap = function(node) {                                                                   // 6249
        return node;                                                                                                   // 6250
      };                                                                                                               // 6251
    }                                                                                                                  // 6252
  }                                                                                                                    // 6253
  function bootstrap() {                                                                                               // 6254
    upgradeDocumentTree(wrap(document));                                                                               // 6255
    if (window.HTMLImports) {                                                                                          // 6256
      HTMLImports.__importsParsingHook = function(elt) {                                                               // 6257
        upgradeDocumentTree(wrap(elt.import));                                                                         // 6258
      };                                                                                                               // 6259
    }                                                                                                                  // 6260
    CustomElements.ready = true;                                                                                       // 6261
    setTimeout(function() {                                                                                            // 6262
      CustomElements.readyTime = Date.now();                                                                           // 6263
      if (window.HTMLImports) {                                                                                        // 6264
        CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;                                     // 6265
      }                                                                                                                // 6266
      document.dispatchEvent(new CustomEvent("WebComponentsReady", {                                                   // 6267
        bubbles: true                                                                                                  // 6268
      }));                                                                                                             // 6269
    });                                                                                                                // 6270
  }                                                                                                                    // 6271
  if (typeof window.CustomEvent !== "function") {                                                                      // 6272
    window.CustomEvent = function(inType, params) {                                                                    // 6273
      params = params || {};                                                                                           // 6274
      var e = document.createEvent("CustomEvent");                                                                     // 6275
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);                   // 6276
      return e;                                                                                                        // 6277
    };                                                                                                                 // 6278
    window.CustomEvent.prototype = window.Event.prototype;                                                             // 6279
  }                                                                                                                    // 6280
  if (document.readyState === "complete" || scope.flags.eager) {                                                       // 6281
    bootstrap();                                                                                                       // 6282
  } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
    bootstrap();                                                                                                       // 6284
  } else {                                                                                                             // 6285
    var loadEvent = window.HTMLImports && !HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";               // 6286
    window.addEventListener(loadEvent, bootstrap);                                                                     // 6287
  }                                                                                                                    // 6288
})(window.CustomElements);                                                                                             // 6289
                                                                                                                       // 6290
(function(scope) {                                                                                                     // 6291
  if (!Function.prototype.bind) {                                                                                      // 6292
    Function.prototype.bind = function(scope) {                                                                        // 6293
      var self = this;                                                                                                 // 6294
      var args = Array.prototype.slice.call(arguments, 1);                                                             // 6295
      return function() {                                                                                              // 6296
        var args2 = args.slice();                                                                                      // 6297
        args2.push.apply(args2, arguments);                                                                            // 6298
        return self.apply(scope, args2);                                                                               // 6299
      };                                                                                                               // 6300
    };                                                                                                                 // 6301
  }                                                                                                                    // 6302
})(window.WebComponents);                                                                                              // 6303
                                                                                                                       // 6304
(function(scope) {                                                                                                     // 6305
  "use strict";                                                                                                        // 6306
  if (!window.performance) {                                                                                           // 6307
    var start = Date.now();                                                                                            // 6308
    window.performance = {                                                                                             // 6309
      now: function() {                                                                                                // 6310
        return Date.now() - start;                                                                                     // 6311
      }                                                                                                                // 6312
    };                                                                                                                 // 6313
  }                                                                                                                    // 6314
  if (!window.requestAnimationFrame) {                                                                                 // 6315
    window.requestAnimationFrame = function() {                                                                        // 6316
      var nativeRaf = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;                           // 6317
      return nativeRaf ? function(callback) {                                                                          // 6318
        return nativeRaf(function() {                                                                                  // 6319
          callback(performance.now());                                                                                 // 6320
        });                                                                                                            // 6321
      } : function(callback) {                                                                                         // 6322
        return window.setTimeout(callback, 1e3 / 60);                                                                  // 6323
      };                                                                                                               // 6324
    }();                                                                                                               // 6325
  }                                                                                                                    // 6326
  if (!window.cancelAnimationFrame) {                                                                                  // 6327
    window.cancelAnimationFrame = function() {                                                                         // 6328
      return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(id) {                     // 6329
        clearTimeout(id);                                                                                              // 6330
      };                                                                                                               // 6331
    }();                                                                                                               // 6332
  }                                                                                                                    // 6333
  var elementDeclarations = [];                                                                                        // 6334
  var polymerStub = function(name, dictionary) {                                                                       // 6335
    if (typeof name !== "string" && arguments.length === 1) {                                                          // 6336
      Array.prototype.push.call(arguments, document._currentScript);                                                   // 6337
    }                                                                                                                  // 6338
    elementDeclarations.push(arguments);                                                                               // 6339
  };                                                                                                                   // 6340
  window.Polymer = polymerStub;                                                                                        // 6341
  scope.consumeDeclarations = function(callback) {                                                                     // 6342
    scope.consumeDeclarations = function() {                                                                           // 6343
      throw "Possible attempt to load Polymer twice";                                                                  // 6344
    };                                                                                                                 // 6345
    if (callback) {                                                                                                    // 6346
      callback(elementDeclarations);                                                                                   // 6347
    }                                                                                                                  // 6348
    elementDeclarations = null;                                                                                        // 6349
  };                                                                                                                   // 6350
  function installPolymerWarning() {                                                                                   // 6351
    if (window.Polymer === polymerStub) {                                                                              // 6352
      window.Polymer = function() {                                                                                    // 6353
        throw new Error("You tried to use polymer without loading it first. To " + 'load polymer, <link rel="import" href="' + 'components/polymer/polymer.html">');
      };                                                                                                               // 6355
    }                                                                                                                  // 6356
  }                                                                                                                    // 6357
  if (HTMLImports.useNative) {                                                                                         // 6358
    installPolymerWarning();                                                                                           // 6359
  } else {                                                                                                             // 6360
    addEventListener("DOMContentLoaded", installPolymerWarning);                                                       // 6361
  }                                                                                                                    // 6362
})(window.WebComponents);                                                                                              // 6363
                                                                                                                       // 6364
(function(scope) {                                                                                                     // 6365
  var style = document.createElement("style");                                                                         // 6366
  style.textContent = "" + "body {" + "transition: opacity ease-in 0.2s;" + " } \n" + "body[unresolved] {" + "opacity: 0; display: block; overflow: hidden; position: relative;" + " } \n";
  var head = document.querySelector("head");                                                                           // 6368
  head.insertBefore(style, head.firstChild);                                                                           // 6369
})(window.WebComponents);                                                                                              // 6370
                                                                                                                       // 6371
(function(scope) {                                                                                                     // 6372
  window.Platform = scope;                                                                                             // 6373
})(window.WebComponents);                                                                                              // 6374
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
