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

/* One Dimension Vector Manager - VERSION 1.0 */

Vector=function(e,t){return this.init(e,t)};$.extend(Vector.prototype,{__begin:0,__length:0,init:function(e,t){this.setBegin(e);this.setLength(t);return this},getBegin:function(){return this.__begin},getEnd:function(){return this.__begin+this.__length},getLength:function(){return this.__length},setBegin:function(e){this.__begin=e;return this},setLength:function(e){this.__length=e;return this},setEnd:function(e){this.__length=e-this.getBegin();return this},isNull:function(){return this.length=0},toString:function(){return"V["+this.getBegin()+","+this.getEnd()+"](L:"+this.getLength()+")"},union:function(e){if(this.isNull()){return e}else if(e.isNull()){return this}else{return(new Vector(Math.min(this.getBegin(),e.getBegin()),0)).setEnd(Math.max(this.getEnd(),e.getEnd()))}},intersection:function(e){if(this.isNull()){return nullVector}else if(e.isNull()){return nullVector}else if(this.isContinuousWith(e)||e.isContinuousWith(this)){return(new Vector(Math.max(this.getBegin(),e.getBegin()),0)).setEnd(Math.min(this.getEnd(),e.getEnd()))}else{return nullVector}},isInto:function(e){return this.getBegin()>=e.getBegin()&&this.getEnd()<=e.getEnd()},isBefore:function(e){return this.getBegin()<=e.getBegin()},isContinuousWith:function(e){return this.isBefore(e)&&this.getEnd()>e.getBegin()},containsValue:function(e){return e>=this.getBegin()&&e<this.getEnd()},allValues:function(){var e=new Array;for(var t=this.getBegin();t<this.getEnd()-1;t++){e.push(t)}return e},niceDisplay:function(e,t,n,r){var i=$(document.createElement("div")).addClass("vectorDisplay");var s=$(document.createElement("div")).addClass("ruler");var o=$(document.createElement("div")).addClass("ticks");var u=$(document.createElement("div")).addClass("vector");e.append(i);if(t==null){t=this.getBegin()}if(n==null){n=this.getEnd()}for(var a=t;a<n+1;a++){var f=$(document.createElement("span")).html("&nbsp;");var l=$(document.createElement("span")).html(a);var c=$(document.createElement("span")).html("&nbsp;");if(this.containsValue(a)){f.addClass("valueIsContained");if(r){f.addClass(r)}}u.append(f);s.append(l);o.append(c)}i.append(u);i.append(o);i.append(s);return e}});var nullVector=new Vector(0,0);Vector.mergeContinuous=function(e){Vector.orderByBegin(e);if(e.length>0){for(var t=0;t<e.length-1;){if(e[t].isContinuousWith(e[t+1])){e.splice(t,2,e[t].union(e[t+1]))}else{t++}}}return e};Vector.intersectContinuous=function(e){Vector.orderByBegin(e);if(e.length>0){for(var t=0;t<e.length-1;){if(e[t].isContinuousWith(e[t+1])){e.splice(t,2,e[t].intersection(e[t+1]))}else{t++}}}return e};Vector.orderByBegin=function(e){return e.sort(function(e,t){return e.isBefore(t)}).reverse()};Vector.unionAll=function(e){if(e.length==0){return new Array}var t=e[0];for(var n=1;n<e.length;n++){t=this.mergeContinuous(t.concat(e[n]))}return t};Vector.oneContainsValue=function(e,t){for(var n=0;n<t.length;n++){if(t[n].containsValue(e)){return true}}return false};Vector.buildVectorsFromValues=function(e){var t=new Array;if(e.length==0){return t}var n=e[0];for(var r=1;r<e.length;r++){if(e[r]-e[r-1]>1){t.push(new Vector(n,e[r-1]-n+1));n=e[r]}}t.push(new Vector(n,e[e.length-1]-n+1));return t};Vector.intersectAll=function(e){if(e.length==0){return new Array}var t=this.unionAll(e);var n=new Array;for(var r=0;r<t.length;r++){for(var i=t[r].getBegin();i<t[r].getEnd();i++){var s=false;e:for(var o=0;o<e.length;o++){if(!this.oneContainsValue(i,e[o])){s=false;break e}else{s=true}}if(s){n.push(i)}}}return this.buildVectorsFromValues(n)};Vector.niceDisplay=function(e,t,n,r,i){var s=$(document.createElement("div")).addClass("vectorDisplay");var o=$(document.createElement("div")).addClass("ruler");var u=$(document.createElement("div")).addClass("ticks");t.append(s);if(n==null){n=this.getBegin()}if(r==null){r=this.getEnd()}for(var a=0;a<e.length;a++){var f=$(document.createElement("div")).addClass("vector");s.append(f);for(var l=n;l<r+1;l++){var c=$(document.createElement("span")).html("&nbsp;");if(e[a].containsValue(l)){c.addClass("valueIsContained");if(i){c.addClass(i)}}f.append(c)}}for(var l=n;l<r+1;l++){var h=$(document.createElement("span")).html(l);var p=$(document.createElement("span")).html("&nbsp;");o.append(h);u.append(p)}s.append(u);s.append(o);return t}