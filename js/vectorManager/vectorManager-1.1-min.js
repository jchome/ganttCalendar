/*
 * One Dimension Vector Manager by Julien CORON - 2013
 * Copyright 2013 Julien CORON
 * 
 * Licence :
   Ce programme est un logiciel libre ; vous pouvez le redistribuer ou le 
   modifier suivant les termes de la GNU General Public License telle que 
   publiée par la Free Software Foundation ; soit la version 3 de la licence, 
   soit (à votre gré) toute version ultérieure.

   Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE 
   GARANTIE ; pas même la garantie implicite de COMMERCIABILISABILITÉ ni 
   d'ADÉQUATION à UN OBJECTIF PARTICULIER. Consultez la GNU General Public 
   License pour plus de détails.
 * 
 * 
   This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* One Dimension Vector Manager - VERSION 1.1 */

Vector=function(e,t){return this.init(e,t)},$.extend(Vector.prototype,{__begin:0,__length:0,init:function(e,t){return this.setBegin(e),this.setLength(t),this},getBegin:function(){return this.__begin},getEnd:function(){return this.__begin+this.__length},getLength:function(){return this.__length},setBegin:function(e){return this.__begin=e,this},setLength:function(e){return this.__length=e,this},setEnd:function(e){return this.__length=e-this.getBegin(),this},isNull:function(){return this.length=0},toString:function(){return"V["+this.getBegin()+","+this.getEnd()+"](L:"+this.getLength()+")"},union:function(e){return this.isNull()?e:e.isNull()?this:new Vector(Math.min(this.getBegin(),e.getBegin()),0).setEnd(Math.max(this.getEnd(),e.getEnd()))},intersection:function(e){return this.isNull()?nullVector:e.isNull()?nullVector:this.isContinuousWith(e)||e.isContinuousWith(this)?new Vector(Math.max(this.getBegin(),e.getBegin()),0).setEnd(Math.min(this.getEnd(),e.getEnd())):nullVector},isInto:function(e){return this.getBegin()>=e.getBegin()&&this.getEnd()<=e.getEnd()},isBefore:function(e){return this.getBegin()<=e.getBegin()},isContinuousWith:function(e){return this.isBefore(e)&&this.getEnd()>e.getBegin()},containsValue:function(e){return e>=this.getBegin()&&e<this.getEnd()},allValues:function(){for(var e=new Array,t=this.getBegin();t<this.getEnd()-1;t++)e.push(t);return e},niceDisplay:function(e,t,n,r){var i=$(document.createElement("div")).addClass("vectorDisplay"),s=$(document.createElement("div")).addClass("ruler"),a=$(document.createElement("div")).addClass("ticks"),o=$(document.createElement("div")).addClass("vector");e.append(i),null==t&&(t=this.getBegin()),null==n&&(n=this.getEnd());for(var u=t;n+1>u;u++){var l=$(document.createElement("span")).html("&nbsp;"),c=$(document.createElement("span")).html(u),d=$(document.createElement("span")).html("&nbsp;");this.containsValue(u)&&(l.addClass("valueIsContained"),r&&l.addClass(r)),o.append(l),s.append(c),a.append(d)}return i.append(o),i.append(a),i.append(s),e}});var nullVector=new Vector(0,0);Vector.mergeContinuous=function(e){if(Vector.orderByBegin(e),e.length>0)for(var t=0;t<e.length-1;)e[t].isContinuousWith(e[t+1])?e.splice(t,2,e[t].union(e[t+1])):t++;return e},Vector.intersectContinuous=function(e){if(Vector.orderByBegin(e),e.length>0)for(var t=0;t<e.length-1;)e[t].isContinuousWith(e[t+1])?e.splice(t,2,e[t].intersection(e[t+1])):t++;return e},Vector.orderByBegin=function(e){return e.sort(function(e,t){return e.isBefore(t)?-1:1})},Vector.unionAll=function(e){if(0==e.length)return new Array;for(var t=e[0],n=1;n<e.length;n++)t=this.mergeContinuous(t.concat(e[n]));return t},Vector.oneContainsValue=function(e,t){for(var n=0;n<t.length;n++)if(t[n].containsValue(e))return!0;return!1},Vector.buildVectorsFromValues=function(e){var t=new Array;if(0==e.length)return t;for(var n=e[0],r=1;r<e.length;r++)e[r]-e[r-1]>1&&(t.push(new Vector(n,e[r-1]-n+1)),n=e[r]);return t.push(new Vector(n,e[e.length-1]-n+1)),t},Vector.intersectAll=function(e){if(0==e.length)return new Array;for(var t=this.unionAll(e),n=new Array,r=0;r<t.length;r++)for(var i=t[r].getBegin();i<t[r].getEnd();i++){var s=!1;e:for(var a=0;a<e.length;a++){if(!this.oneContainsValue(i,e[a])){s=!1;break e}s=!0}s&&n.push(i)}return this.buildVectorsFromValues(n)},Vector.niceDisplay=function(e,t,n,r,i){var s=$(document.createElement("div")).addClass("vectorDisplay"),a=$(document.createElement("div")).addClass("ruler"),o=$(document.createElement("div")).addClass("ticks");t.append(s),null==n&&(n=this.getBegin()),null==r&&(r=this.getEnd());for(var u=0;u<e.length;u++){var l=$(document.createElement("div")).addClass("vector");s.append(l);for(var c=n;r+1>c;c++){var d=$(document.createElement("span")).html("&nbsp;");e[u].containsValue(c)&&(d.addClass("valueIsContained"),i&&d.addClass(i)),l.append(d)}}for(var c=n;r+1>c;c++){var h=$(document.createElement("span")).html(c),g=$(document.createElement("span")).html("&nbsp;");a.append(h),o.append(g)}return s.append(o),s.append(a),t},Vector.flatDisplay=function(e,t,n,r,i){var s=$(document.createElement("div")).addClass("vectorDisplay");i&&s.addClass(i),t.append(s);var a=t.width();null==n&&(n=this.getBegin()),null==r&&(r=this.getEnd());var o=$(document.createElement("div")).addClass("vector");s.append(o);for(var u=n;r+1>u;u++){var l=$(document.createElement("span")).attr("data-rulerValue",u).html("&nbsp;");l.width(a/(r-n+1)),Vector.oneContainsValue(u,e)&&l.addClass("valueIsContained"),o.append(l)}return t};
