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
    k.c.m = function () { // mobile devices check
              var check = false;
              (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
              return check;
            };

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
        this.v = 0; // the value, committed value
        this.cv = null; // change value ; not commited value
        this.x = 0; // canvas x position
        this.y = 0; // canvas y position
        this.w = 0; // canvas width
        this.h = 0; // canvas height
        this.canvas = null; // jQuery canvas element
        this.ctx = null; // rendered canvas context

        this.t = 0; // touches index

        this.run = function () {
            if(this.$.data('kontroled')) return;
            this.$.data('kontroled', true);

            this.options = $.extend({
                    // type
                    type: this.$.data('type') !== undefined ? (this.$.data('type') === 'guage' ? 'guage' : 'dial') : 'dial',

                    // Config
                    min : this.$.data('min') !== undefined ? this.$.data('min') : 30,
                    max : this.$.data('max') !== undefined ? this.$.data('max') : 300,
                    val: this.$.data('value') != undefined ? this.$.data('value') : 0,
                    step : this.$.data('step') || 1,
                    precision : this.$.data('precision') || 0,

                    lineWidth : (this.$.data('lineWidth') && Math.max(Math.min(this.$.data('lineWidth'), 1), 0.01)) || 2,
                    width : this.$.data('width') || 150,
                    height : this.$.data('height') || 150,
                    font: this.$.data('font') || 'Arial',
                    fontWeight: this.$.data('font-weight') || 'bold',
                    inline : false,

                    dialColor : this.$.data('dialcolor') || '#CC0073',
                    fgColor : this.$.data('fgcolor') || '#1184D3',

                }, this.options );

            this.span = this.$;

            // adds needed DOM elements (canvas, div)
            this.canvas = $(document.createElement('canvas')).attr({
                width: this.options.width,
                height: this.options.height
            });

            // wraps all elements in a div add to DOM before Canvas init is triggered
            // shamelessly stealed the *css* from http://www.htmlfivewow.com/demos/hal/index.html
            // modified a bit to suit my needs.
            // <!--
            // Copyright 2011 Google Inc.
            //
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            //      http://www.apache.org/licenses/LICENSE-2.0
            //
            //      Unless required by applicable law or agreed to in writing, software
            //      distributed under the License is distributed on an "AS IS" BASIS,
            //      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            //      See the License for the specific language governing permissions and
            //      limitations under the License.
            //
            //      Author: Eric Bidelman (ericbidelman@chromium.org)
            // -->
            if(this.options.type === 'dial'){
              var hal = $('<div style="'
                  + (this.options.inline ? 'display:inline;' : 'display:block;')
                  + 'width:' +(this.options.width + 30)+ 'px;height:' +(this.options.height + 30) + 'px;'
                  + 'background: -webkit-linear-gradient(left, transparent, #fff 40%, #fff 45%, #fff 55%, #fff 60%, transparent), -webkit-linear-gradient(-45deg, transparent, transparent 35%, white 50%, transparent 65%, transparent), -webkit-linear-gradient(45deg, transparent, transparent 35%, white 50%, transparent 65%, transparent), #3c3734;'
                  + 'background-size: 75% 50%, 50% 100%, 50% 100%, 100% 100%;'
                  + 'background-position: 50% top, right -50px, left -50px, 50% 50%;'
                  + 'background-repeat: no-repeat, no-repeat, no-repeat, repeat;'
                  + 'display: -webkit-box;'
                  + '-webkit-box-align: center;'
                  + '-webkit-box-pack: center;'
                  + 'box-shadow: 0 5px 20px black;'
                  + 'border-radius: 50%;">'
                  + '</div>');

              var inner1 = $('<div id="inner1" style="'
                  + 'background: -webkit-linear-gradient(left, transparent, transparent 32%, white 45%, white 50%, white 55%, transparent 68%, transparent), -webkit-linear-gradient(-45deg, transparent, transparent 40%, white 50%, transparent 60%, transparent), -webkit-linear-gradient(45deg, transparent, transparent 40%, white 50%, transparent 60%, transparent), -webkit-linear-gradient(top, #b5a5a8, #92807e);'
                  + 'background-size: 100% 50%, 50% 100%, 50% 100%, 100% 100%;'
                  + 'background-position: 50% bottom, left 50px, right 50px, center center;'
                  + 'background-repeat: no-repeat, no-repeat, no-repeat, repeat;'
                  + 'width: 95%;'
                  + 'height: 95%;'
                  + '-webkit-box-pack: center;'
                  + '-webkit-box-align: center;'
                  + 'display: -webkit-box;'
                  + 'border-radius: 50%;">'
                  + '</div>');

              var inner2 = $('<div id="inner2" style="'
                  + 'width: 90%;'
                  + 'height: 91%;'
                  + 'background: -webkit-radial-gradient(50% 50%, circle, #2795f6, #0072fd 5%, #413bd4 20%,  #440003 45%, black 63%);'
                  + 'background-repeat: no-repeat, no-repeat, no-repeat;'
                  + 'background-size: 76% 100%, 55% 100%, 100%, 100%;'
                  + 'background-position: 50% 12%, 27% 8px, center center;'
                  + 'overflow: hidden;'
                  + 'background-color: black;'
                  + '-webkit-box-pack: center;'
                  + '-webkit-box-align: center;'
                  + 'display: -webkit-box;'
                  + 'border-radius: 50%;">'
                  + '</div>');

              this.$.wrap(inner2).before(this.canvas);
              $("#inner2").wrap(inner1);
              $("#inner1").wrap(hal);
            }else{
              this.$div = $('<div style="'
                  + (this.options.inline ? 'display:inline;' : '')
                  + 'width:' + this.options.width + 'px;height:' + this.options.height + 'px;'
                  + '"></div>');

              this.$.wrap(this.$div).before(this.canvas);
            }

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
                  self.doDial(v);
                // }
            };

            var touchEnd = function(e){
              k.c.d.unbind('touchmove.k touchend.k');
              // clear the color
              if(self.options.type === 'dial'){
                self.draw();
              }
              // call hook
              if (self.options.change) self.options.change(self.val());
            };

            // get touches index
            this.t = k.c.t(e);
            if(self.options.type === 'dial'){
              self.draw(self.options.dialColor);
            }else{
              // first click
              touchMove(e);
            }

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
                  self.doDial(v);
                }
            };
            var mouseUp = function (e) {
                k.c.d.unbind('mousemove.k mouseup.k');
                // clear the highlight color
                if(self.options.type === 'dial'){
                  self.draw();
                }
                // call hook
                if (self.options.change) self.options.change(self.val());
            };

            if(self.options.type === 'dial'){
              self.draw(self.options.dialColor);
            }else{
              // first click
              mouseMove(e);
            }

            // but for the mouse move and up has to listen to the $document
            k.c.d
                .bind("mousemove.k", mouseMove)
                .bind("mouseup.k",   mouseUp);

            return this;
        };

        this.taps = [];
        this.calculateTempo = function(){
          var current = (new Date()).getTime();

          var len = self.taps.length;
          var lastTap = self.taps[len - 1] || 0;
          if((current - lastTap) > 3000 ){ // 3 sec
            self.taps = [];
            len = 0;
          }
          self.taps.push(current);
          len += 1;

          var mod = len % 4;
          if(mod > 0){
            self.$.text('...'.slice(0, mod));
            self.drawText("keep tapping", Math.PI * 0.8);
            return false;
          }

          var _tap = self.taps[0];
          var interval = 0;
          for(var i = 1; i < len; i++){
            var tap = self.taps[i];
            interval += (tap - _tap);
            _tap = tap;
          }
          interval = Math.round(60 * 1000 / (interval / (len - 1)));

          interval = interval > self.options.max ? self.options.max : interval;
          interval = interval < self.options.min ? self.options.min : interval;

          // set the new temp every 4 taps
          // lot of consideration, e.g. the performace when combined with several timer on the same page
          if(mod == 0){
            self.val(interval);
            self.$.text(interval);
            // clear the text
            self.draw();
            if (self.options.change) self.options.change(self.val()); // call back hook
          }

          // we don't want to crew too many taps, trim them off
          // otherwise potential mem leak
          if(len > 16){
            self.taps.splice(0, 4);
          }
        };

        this._listen = function () {
            var mobile = k.c.m();
            // canvas listen to mouse down event on canvas only
            if(mobile){
              this.canvas.bind("touchstart", function (e) { e.preventDefault(); self._xy()._touch(e); });
              if(this.options.type === 'dial')
                this.span.bind("touchend", this.calculateTempo); // calculate by taps
            }else{
              this.canvas.bind("mousedown", function (e) {e.preventDefault();self._xy()._mouse(e);});
              if(this.options.type === 'dial')
                this.span.bind("click", this.calculateTempo); // calculate by clicks
            }

            return this;
        };
    };

    /**
     * k.Dial - UI
     */
    k.Dial = function (options) {
        k.obj.call(this);
        this.options = options;

        this.xy = null;
        this.radius = null;
        this.lineWidth = null;
        this.w2 = null;
        this.PI2 = 2*Math.PI;

        this.xy2val = function (x, y) {
            var a, ret;
            if(this.options.type === 'dial'){
              a = Math.atan2( x - (this.x + this.w2) , - (y - this.y - this.w2));
              if (a < 0) { a += this.PI2; }
              ret = ~~ (0.5 + (a * (60 - 20) / this.PI2)) + 20;
            }else{
              a = Math.atan2( x - (this.x + this.w2) , - (y - this.y - this.w2)) + Math.PI;
              ret = (a * (this.options.max - this.options.min) / Math.PI) + this.options.min - 0.5;
              ret = Math.max(Math.min(ret, this.options.max), this.options.min);
            }

            return ret;
        };

        this.init = function () {
            this.val(this.options.val);
            this.w2 = this.w / 2;
            this.xy = this.w2;
            this.lineWidth = this.options.lineWidth;
            this.radius = this.xy - this.lineWidth / 2;

            var len = Math.max(String(Math.abs(this.options.max)).length, String(Math.abs(this.options.min)).length, 2) + 3;
            var mtop = (this.w / 2 - this.w / len / 2 + 1) >> 0;
            this.span.css({
                        'width' : ((this.w / 2 + 4) >> 0) + 'px'
                        // ,'height' : ((this.w / 3) >> 0) + 'px'
                        ,'position' : 'absolute'
                        ,'vertical-align' : 'middle'
                        ,'margin-top' :  this.options.type === 'dial' ? mtop + 'px' : (mtop - 8) + 'px'
                        ,'margin-left' : '-' + ((this.w * 3 / 4 + 2) >> 0) + 'px'
                        ,'border' : 0
                        ,'background' : 'none'
                        ,'font' : this.options.fontWeight + ' ' + ((this.w / len) >> 0) + 'px ' + this.options.font
                        ,'text-align' : 'center'
                        ,'color' : "#fd0d00"//this.options.fgColor
                        ,'padding' : '0px'
                        ,'-webkit-appearance': 'none'
                        ,'-webkit-user-select': 'none' // do not select when double click/tap
            });

            return this;
        };

        this.val = function(v){
          if(v === undefined){
            return this.v;
          }else{
            v = parseFloat(v.toFixed(this.options.precision));
            this.v = Math.min(Math.max(v, this.options.min), this.options.max)
          }
        };

        this.doDial = function (v) {
            if(this.options.type == 'dial'){
              v = (~~ (((v < 0) ? -0.5 : 0.5) + (v/this.options.step))) * this.options.step;
              var tmp = this.val();
              if(v > this.cv){
                  tmp += this.options.step;
                  tmp = tmp > this.options.max ? this.options.max : tmp;
              } else {
                  tmp -= this.options.step;
                  tmp = tmp < this.options.min ? this.options.min : tmp;
              }

              this.cv = v;
              v = parseFloat(tmp.toFixed(this.options.precision));
              this.val(v);
            }else{
              this.val(v);
              this.draw()
            }
            this.$.text(this.val());
        };

        this.draw = function (color) {
            var c = this.ctx; // context
            var r2 = ( this.radius / 2 ) >> 0;

            c.clearRect(0, 0, this.w, this.h);

            if(this.options.type == 'dial'){
              c.lineWidth = this.lineWidth;
              c.fillStyle = color || this.options.fgColor;

              c.beginPath();
                c.arc(this.xy, this.xy + 1, this.radius, 0, this.PI2, false);
                c.moveTo(this.xy + r2, this.xy + 1);
                c.arc(this.xy, this.xy + 1, r2, this.PI2, 0, true);
              c.stroke();
              c.fill();
            }else{
              c.lineWidth = this.radius / 2;

              // half arc
              c.strokeStyle = "#cdcdcd";
              c.beginPath();
                c.arc(this.xy, this.xy, this.radius / 4 * 3, Math.PI, 0, false);
              c.stroke();

              // amount
              c.strokeStyle = "#00aa00";
              var ang = (this.val() - this.options.min) / (this.options.max - this.options.min) * Math.PI;
              c.beginPath();
                c.arc(this.xy, this.xy, this.radius / 4 * 3, Math.PI, Math.PI + ang, false);
              c.stroke();

              // touch or mouse control area
              c.lineWidth = 1;
              c.strokeStyle = "#1184d3";
              c.beginPath();
                c.arc(this.xy, this.xy, this.radius, Math.PI, 0, false);
                c.lineTo(this.xy + r2, this.xy);
                c.arc(this.xy, this.xy, r2, 0, Math.PI, true);
              c.closePath();
              c.stroke();
            }
            this.$.text(this.val());
        };

        this.drawText = function(str, angle) {
          var context = this.ctx;
          var radius = this.radius / 2 + 8;
          var len = str.length, s;

          context.font = this.options.fontWeight + ' ' + ((this.w / len) >> 0) + ' ' + this.options.font
          context.textAlign = 'center';
          context.fillStyle = '#cdcdcd';

          context.save();
          context.translate(this.xy, this.xy);
          context.rotate(-1 * angle / 2);
          context.rotate(-1 * (angle / len) / 2);
          for(var n = 0; n < len; n++) {
            context.rotate(angle / len);
            context.save();
            context.translate(0, -1 * radius);
            s = str[n];
            context.fillText(s, 0, 0);
            context.restore();
          }
          context.restore();
        }
    };

    $.fn.dial = function (options) {
        var dial = new k.Dial(options);
        dial.$ = $(this);
        dial.run();
        return dial;
    };

})(jQuery);
