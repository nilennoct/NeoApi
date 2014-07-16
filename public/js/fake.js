/**
 * Created by neo on 15/7/14.
 */

(function($) {
  var routes = [];

  var MAX_VALUE = 9007199254740991;
  var MIN_VALUE = -MAX_VALUE;
  var NUMBERS = '0123456789';
  var SYMBOLS = '!@#$%^&*_=';
  var LOWER_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  var UPPER_LETTERS = LOWER_LETTERS.toUpperCase();

  var CANVAS = document.createElement('canvas');
  var CONTEXT = CANVAS.getContext('2d');

  function Fake() {}

  function type(o) {
    return o === undefined ? 'undefined' : o === null ? 'null' : toString.call(o).match(/^\[.+\s(.+)\]$/)[1].toLowerCase();
  }

  Fake.mock = function(route, template) {
    if (typeof template !== 'undefined') {
      routes[route] = template;
    }
    else {
      delete routes[route];
    }
  };

  Fake.generate = function(template) {
    var mockData = {};
    if (type(template) === 'array') {
      return Fake.generate(template[0]);
    }

    for (var key in template) {
      if (template.hasOwnProperty(key)) {
        /*
         'name': value
         'name;count': value
         'name;min;max': value
         */
        var argv = key.split(';'), argc = argv.length;
        var value = template[key];
        var numberArgs;
        var count, buf, i;

        if (argc == 0) {
          continue;
        }

        var name = argv[0];
        switch (type(value)) {
          case 'number': {
            if (argc == 1) {
              mockData[name] = value;
            }
            else if (argc == 2) {
              numberArgs = argv[1].split('-');
              if (numberArgs.length == 2) {
                mockData[name] = Fake.Random.integer({min: +numberArgs[0], max: +numberArgs[1]});
              }
              else if (numberArgs.length == 3) {
                mockData[name] = Fake.Random.floating({min: +numberArgs[0], max: +numberArgs[1], fixed: +numberArgs[2]});
              }
            }
            break;
          }
          case 'boolean': {
            mockData[name] = argc == 2 ? Fake.Random.bool({rate: +argv[1]}) : Fake.Random.bool();
            break;
          }
          case 'string': {
            count = argc == 1 ? 1 : argc == 2 ? +argv[1] : Fake.Random.integer({min: +argv[1], max: +argv[2]});
            buf = new Array(count);
            for (i = 0; i < count; i++) {
              buf[i] = generateByValue(value);
            }
            mockData[name] = buf.join('');
            break;
          }
          case 'object': {
            mockData[name] = Fake.generate(value);
            break;
          }
          case 'array': {
            var arrayTemplate = value[0];

            switch (type(arrayTemplate)) {
              case 'object': {
                count = argc == 2 ? +argv[1] : Fake.Random.integer({min: +argv[1], max: +argv[2]});
                buf = new Array(count);
                for (i = 0; i < count; i++) {
                  buf[i] = Fake.generate(arrayTemplate);
                }
                mockData[name] = buf;
                break;
              }
              case 'number': {
                count = argc == 3 ? +argv[1] : Fake.Random.integer({min: +argv[1], max: +argv[2]});
                numberArgs = argv[argv.length - 1];
                buf = new Array(count);

                if (numberArgs[0] === '+' || numberArgs[0] === '-') {
                  var step = +numberArgs;
                  for (i = 0; i < count; i++) {
                    buf[i] = arrayTemplate;
                    arrayTemplate += step;
                  }
                }
                else {
                  numberArgs = numberArgs.split('-');
                  if (numberArgs.length == 2) {
                    for (i = 0; i < count; i++) {
                      buf[i] = Fake.Random.integer({min: +numberArgs[0], max: +numberArgs[1]});
                    }
                  }
                  else if (numberArgs.length == 3) {
                    for (i = 0; i < count; i++) {
                      buf[i] = Fake.Random.floating({min: +numberArgs[0], max: +numberArgs[1], fixed: +numberArgs[2]});
                    }
                  }
                }

                mockData[name] = buf;
                break;
              }
              case 'string': {
                count = argc == 2 ? +argv[1] : Fake.Random.integer({min: +argv[1], max: +argv[2]});
                buf = new Array(count);
                for (i = 0; i < count; i++) {
                  buf[i] = generateByValue(arrayTemplate);
                }
                mockData[name] = buf;
                break;
              }
              default: {
                console.error('[A]Type not match');
              }
            }
            break;
          }
          default: {
            console.error('[T]Type not match')
          }
        }
      }
    }

    return mockData;

    function generateByValue(value) {
      var keys = value.match(/#[a-z]+/g);
      for (var i = 0, len = keys.length; i < len; i++) {
        var funcName = keys[i].substr(1);
        if (funcName in Fake.Random) {
          value = value.replace(keys[i], Fake.Random[funcName]());
        }
      }

      return value;
    }
  };

  Fake.Util = {
    extend: function (dst, src) {
      if (typeof src === 'undefined') {
        src = dst;
        dst = {};
      }

      if (typeof $ !== 'undefined') {
        dst = $.extend(dst, src);
      }
      else {
        for (var i in src) {
          if (src.hasOwnProperty(i)) {
            dst[i] = source[i];
          }
        }
      }

      return dst;
    },
    pick: function(array) {
      return array[Math.floor(Math.random() * array.length)];
    },
    capitalize: function(str) {
      return str[0].toUpperCase() + str.substr(1);
    }
  };

  Fake.Random = {
    // Number
    integer: function(option) {
      option = Fake.Util.extend({
        max: MAX_VALUE,
        min: MIN_VALUE
      }, option);

      if (option.min > option.max) {
        option.max = [+option.min, option.min = +option.max][0];
      }

      return Math.floor(Math.random() * (option.max - option.min + 1) + option.min);
    },
    nature: function(option) {
      option = Fake.Util.extend({
        max: MAX_VALUE,
        min: 0
      }, option);

      option.min = Math.abs(option.min);
      option.max = Math.abs(option.max);

      return Fake.Random.integer(option);
    },
    floating: function(option) {
      option = Fake.Util.extend({
        fixed: 2
      }, option);

      var ret = Fake.Random.integer(option);
      if (ret == option.max) {
        ret--;
      }
      var pow = Math.pow(10, option.fixed);

      return parseFloat((ret + Fake.Random.integer({min: 0, max: pow}) / pow).toFixed(option.fixed));
    },

    // String
    char: function(option) {
      option = Fake.Util.extend({
        casing: 'lower',
        alpha: true,
        number: false,
        symbol: false
      }, option);

      var pool;
      if (typeof option.pool !== 'undefined') {
        pool = option.pool;
      }
      else {
        pool = [];
        if (option.alpha) {
          option.casing === 'all' ? pool.push(LOWER_LETTERS, UPPER_LETTERS) : option.casing === 'lower' ? pool.push(LOWER_LETTERS) : pool.push(UPPER_LETTERS);
        }
        if (option.number) {
          pool.push(NUMBERS);
        }
        if (option.symbol) {
          pool.push(SYMBOLS);
        }
        pool = pool.join('');
      }

      return Fake.Util.pick(pool.split(''));
    },
    word: function(option) {
      option = Fake.Util.extend({
        length: 6
      }, option);

      var buf = [];
      for (var i = 0; i < option.length; i++) {
        buf.push(Fake.Random.char());
      }

      return buf.join('');
    },
    sentence: function(option) {
      option = Fake.Util.extend({
        length: 8
      }, option);

      var buf = [];
      for (var i = 0; i < option.length; i++) {
        buf.push(Fake.Random.word({length: Fake.Random.integer({min: 1, max: 6})}));
      }

      return Fake.Util.capitalize(buf.join(' ') + '.');
    },
    color: function() {
      var colorHex = '#';
      for (var i = 0; i < 3; i++) {
        colorHex += Fake.Random.integer({min: 0, max: 255}).toString(16);
      }

      return colorHex;
    },

    // Boolean
    bool: function(option) {
      option = Fake.Util.extend({
        rate: 0.5
      }, option);

      return Math.random() < option.rate;
    },

    // Personal
    name: function() {
      return Fake.Util.capitalize(Fake.Random.word({length: Fake.Random.integer({min: 3, max: 6})}));
    },
    fullname: function() {
      return Fake.Random.name() + ' ' + Fake.Random.name();
    },

    // Network
    ip: function() {
      var ipSegment = [];
      for (var i = 0; i < 4; i++) {
        ipSegment[i] = Fake.Random.integer({min: 0, max: 255});
      }

      return ipSegment.join('.');
    },

    // Image
    image: function(option) {
      option = Fake.Util.extend({
        width: 400,
        height: 300,
        bgColor: '#000000',
        fgColor: '#ffffff'
      }, option);

      CANVAS.setAttribute('width', '' + option.width);
      CANVAS.setAttribute('height', '' + option.height);
      CONTEXT.rect(0, 0, option.width, option.height);
      CONTEXT.fillStyle = option.bgColor;
      CONTEXT.fill();

      var fontSizeWidth = Math.floor(option.width / 5);
      var fontSizeHeight = Math.floor(option.height / 2);
      var fontSize = fontSizeWidth < fontSizeHeight ? fontSizeWidth : fontSizeHeight;
      CONTEXT.font = fontSize + 'px Arial';
      CONTEXT.textAlign = 'center';
      CONTEXT.textBaseline = 'middle';
      CONTEXT.fillStyle = option.fgColor;
      CONTEXT.fillText(option.width + 'x' + option.height, option.width / 2, fontSizeHeight);

      return CANVAS.toDataURL();
    }
  };

  window.Fake = {
    extend: function(src) {
      Fake.Util.extend(Fake.Random, src);
    },
    Random: Fake.Random,
    generate: Fake.generate
  };
  window.Random = Fake.Random;
})(jQuery);


