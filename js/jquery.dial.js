/*!jQuery Knob*/
/**
 * Downward compatible, touchable dial
 *
 * Version: 1.2.5 (23/01/2014)
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2012 Anthony Terrien
 * Under MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Thanks to vor, eskimoblood, spiffistan, FabrizioC
 *
 *
 *    *******************************************************************************
 *    *   Feb 21 2014, Zhonghai Zuo                                                 *
 *    *                                                                             *
 *    *   Quick and dirty hack to fit what I need: an iPod click wheel              *
 *    *                                                                             *
 *    *   Here is what I need, I want to design a metronome which will be working   *
 *    *   with my pet project A-STRING.US                                           *
 *    *******************************************************************************
 */
(function($) {

    /**
     * Kontrol library
     */
    "use strict";

    /**
     * Definition of globals and core
     */
    var k = {}; // kontrol
    k.c = {};
    k.c.d = $(document);
    k.c.t = function (e) { return e.originalEvent.touches.length - 1; };

    /**
     * Kontrol Object
     *
     * Definition of an abstract UI control
     * Each concrete component must call this one.
     * <code>
     * k.obj.call(this);
     * </code>
     */
    k.obj = function () {
        var self = this;

        this.options = null;
        this.$ = null; // jQuery wrapped element
        this.span = null; // HTML Element
        this.cv = null; // change value ; not commited value
        this.x = 0; // canvas x position
        this.y = 0; // canvas y position
        this.w = 0; // canvas width
        this.h = 0; // canvas height
        this.canvas = null; // jQuery canvas element
        this.ctx = null; // rendered canvas context
        this.$div = null; // component div

        this.t = 0; // touches index

        this.run = function () {
            if(this.$.data('kontroled')) return;
            this.$.data('kontroled', true);

            this.options = $.extend({
                    // Config
                    min : this.$.data('min') !== undefined ? this.$.data('min') : 30,
                    max : this.$.data('max') !== undefined ? this.$.data('max') : 300,

                    lineWidth : (this.$.data('lineWidth') && Math.max(Math.min(this.$.data('lineWidth'), 1), 0.01)) || 2,
                    width : this.$.data('width') || 150,
                    height : this.$.data('height') || 150,
                    font: this.$.data('font') || 'Arial',
                    fontWeight: this.$.data('font-weight') || 'bold',
                    inline : false,
                    step : this.$.data('step') || 1,

                    dialColor : this.$.data('dialcolor') || '#1184D3',
                    fgColor : this.$.data('fgcolor') || '#13917F'
                }, this.options );

            this.span = this.$;

            // adds needed DOM elements (canvas, div)
            this.canvas = $(document.createElement('canvas')).attr({
                width: this.options.width,
                height: this.options.height
            });

            // wraps all elements in a div add to DOM before Canvas init is triggered
            this.$div = $('<div style="'
                + (this.options.inline ? 'display:inline;' : '')
                + 'width:' + this.options.width + 'px;height:' + this.options.height + 'px;'
                + '"></div>');

            this.$.wrap(this.$div).before(this.canvas);
            this.$div = this.$.parent();

            this.ctx = this.canvas[0].getContext ? this.canvas[0].getContext('2d') : null;

            // computes size and carves the component
            this.w = this.options.width;
            this.h = this.options.height;

            // finalize init
            this._listen()
                ._xy()
                .init()
                .draw();

            return this;
        };

        this._touch = function (e) {
            var touchMove = function (e) {
                // if(self.ctx.isPointInPath(e.offsetX, e.offsetY)){
                  var v = self.xy2val( e.originalEvent.touches[self.t].pageX, e.originalEvent.touches[self.t].pageY);
                  if (v == self.cv) return;
                  self.dialTempo(self._validate(v));
                // }
            };

            var touchEnd = function(e){
              k.c.d.unbind('touchmove.k touchend.k');
              // clear the color
              self.draw();
              // call hook
              if (self.options.change) self.options.change(self.val);
            };

            // get touches index
            this.t = k.c.t(e);
            self.draw(self.options.dialColor);

            // Touch events listeners
            // but for the touch move and up has to listen to the $document
            k.c.d
                .bind("touchmove.k", touchMove)
                .bind("touchend.k", touchEnd);

            return this;
        };

        this._xy = function () {
            var o = this.canvas.offset();
            this.x = o.left;
            this.y = o.top;
            return this;
        };

        this._mouse = function (e) {
            var mouseMove = function (e) {
                if(self.ctx.isPointInPath(e.offsetX, e.offsetY)){
                  var v = self.xy2val(e.pageX, e.pageY);
                  if (v == self.cv) return;
                  self.dialTempo(self._validate(v));
                }
            };
            var mouseUp = function (e) {
                k.c.d.unbind('mousemove.k mouseup.k');
                // clear the highlight color
                self.draw();
                // call hook
                if (self.options.change) self.options.change(self.val);
            };

            self.draw(self.options.dialColor);

            // but for the mouse move and up has to listen to the $document
            k.c.d
                .bind("mousemove.k", mouseMove)
                .bind("mouseup.k",   mouseUp);

            return this;
        };

        this.taps = [];
        this.calculateTempo = function(){
          var len = self.taps.length;
          var current = (new Date()).getTime();

          if(len == 0 || len == 1){
            self.taps.push(current);
            return false;
          }

          var lastTap = self.taps[len - 1];
          // 6 sec
          if((current - lastTap) > 6000 ){
            self.taps = [];
            self.taps.push(current);
            return false;
          }

          // we don't want to crew too many taps, trim them off
          if(len > 16){
            var diff = len - 8;
            self.taps.splice(0, diff);
          }
          self.taps.push(current);
          len = self.taps.length;

          var _tap = self.taps[0];
          var interval = 0;
          for(var i = 1; i < len; i++){
            var tap = self.taps[i];
            interval += (tap - _tap);
            _tap = tap;
          }
          interval = Math.ceil(60 * 1000 / (interval / len));

          interval = interval > self.options.max ? self.options.max : interval;
          interval = interval < self.options.min ? self.options.min : interval;

          // notify
          self.val = interval;
          self.$.text(interval);
          // call back hook
          if (self.options.change) self.options.change(self.val);
        };

        this._listen = function () {
            // canvas listen to mouse down event on canvas only
            this.canvas
                  .bind(
                      "mousedown"
                      , function (e) {
                          e.preventDefault();
                          self._xy()._mouse(e);
                       }
                  )
                  .bind(
                      "touchstart"
                      , function (e) {
                          e.preventDefault();
                          self._xy()._touch(e);
                       }
                  );

            // calculate by taps
            this.span.bind("click", this.calculateTempo);

            return this;
        };

        this._validate = function(v) {
            return (~~ (((v < 0) ? -0.5 : 0.5) + (v/this.options.step))) * this.options.step;
        };

        this.copy = function (f, t) {
            for (var i in f) { t[i] = f[i]; }
        };
    };


    /**
     * k.Dial
     */
    k.Dial = function (options) {
        k.obj.call(this);
        this.options = options;

        this.val = 0;
        this.xy = null;
        this.radius = null;
        this.lineWidth = null;
        this.w2 = null;
        this.PI2 = 2*Math.PI;

        // public api setter/getter
        this.tempo = function(val){
          if(null != val){
            if ( val < this.options.min || val > this.options.max) val = this.options.min;
          }else{
            return this.val;
          }
          this.val = val;
          this.$.text(val);
        }

        this.xy2val = function (x, y) {
            var a, ret;
            a = Math.atan2( x - (this.x + this.w2) , - (y - this.y - this.w2));
            if (a < 0) { a += this.PI2; }
            // ret = ~~ (0.5 + (a * (this.options.max - this.options.min) / this.PI2)) + this.options.min;
            ret = ~~ (0.5 + (a * (60 - 20) / this.PI2)) + 20;
            return ret;
        };

        this.init = function () {
            this.w2 = this.w / 2;
            this.xy = this.w2;
            this.lineWidth = this.options.lineWidth;
            this.radius = this.xy - this.lineWidth / 2;

            var len = Math.max(String(Math.abs(this.options.max)).length, String(Math.abs(this.options.min)).length, 2) + 2;
            this.span.css({
                        'width' : ((this.w / 2 + 4) >> 0) + 'px'
                        ,'height' : ((this.w / 3) >> 0) + 'px'
                        ,'position' : 'absolute'
                        ,'vertical-align' : 'middle'
                        ,'margin-top' : ((this.w / 2 - this.w / len / 2 - 2) >> 0) + 'px'
                        ,'margin-left' : '-' + ((this.w * 3 / 4 + 2) >> 0) + 'px'
                        ,'border' : 0
                        ,'background' : 'none'
                        ,'font' : this.options.fontWeight + ' ' + ((this.w / len) >> 0) + 'px ' + this.options.font
                        ,'text-align' : 'center'
                        ,'color' : this.options.fgColor
                        ,'padding' : '0px'
                        ,'-webkit-appearance': 'none'
                        ,'-webkit-user-select': 'none' // do not select when double click/tap
            });

            this.tempo(80);

            return this;
        };

        this.dialTempo = function (v) {
            if(v > this.cv){
                this.val++;
                this.val = this.val > this.options.max ? this.options.max : this.val;
            } else {
                this.val--;
                this.val = this.val < this.options.min ? this.options.min : this.val;
            }
            this.cv = v;
            this.$.text(this.val);
        };

        this.draw = function (fillColor) {
            var c = this.ctx; // context
            var r2 = this.radius / 2;

            c.lineWidth = this.lineWidth;
            c.fillStyle = fillColor || this.options.fgColor;

            c.beginPath();
              c.arc(this.xy, this.xy, this.radius, 0, this.PI2, false);
              c.moveTo(this.xy + r2, this.xy);
              c.arc(this.xy, this.xy, r2, this.PI2, 0, true);
            c.stroke();
            c.fill();
        };
    };

    $.fn.dial = function (options) {
        var dial = new k.Dial(options);
        dial.$ = $(this);
        dial.run();
        return dial;
    };

})(jQuery);
