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

/* One Dimension Vector Manager - VERSION 1.2 */

// REQUIRE JQUERY

/**
 * Defines a One dimension vector, with a origin and a length
 */
Vector = function(origin,length) {
	return this.init(origin,length);
};

$.extend(Vector.prototype, {
	__begin : 0,
	__length : 0,
	
	init: function(origin,length){
		this.setBegin(origin);
		this.setLength(length);
		return this;
	},
	
	getBegin : function(){
		return this.__begin;
	},
	
	getEnd : function(){
		return this.__begin + this.__length;
	},
	
	getLength : function(){
		return this.__length;
	},
	
	setBegin : function(a){
		this.__begin = a;
		return this;
	},
	setLength : function(a){
		this.__length = a;
		return this;
	},
	setEnd : function(a){
		this.__length = a - this.getBegin();
		return this;
	},
	
	
	
	isNull : function(){
		return this.length = 0;
	},
	
	toString: function(){
		return 'V['+this.getBegin()+','+this.getEnd()+'](L:'+this.getLength()+')';
	},
	union : function(anotherVerctor){
		if(this.isNull()) {
			return anotherVerctor;
		} else if(anotherVerctor.isNull() ){
			return this;
		} else{
			return (new Vector(Math.min(this.getBegin(), anotherVerctor.getBegin()), 0)).setEnd(Math.max(this.getEnd(), anotherVerctor.getEnd()) );
		}
	},
	intersection : function(anotherVerctor){
		if(this.isNull()) {
			return nullVector;
		} else if(anotherVerctor.isNull() ){
			return nullVector;
		} else if(this.isContinuousWith(anotherVerctor) || anotherVerctor.isContinuousWith(this)) {
			return (new Vector(Math.max(this.getBegin(), anotherVerctor.getBegin()), 0)).setEnd(Math.min(this.getEnd(), anotherVerctor.getEnd()) );
		} else {
			return nullVector;
		} 
	},
	isInto : function(anotherVerctor){
		return (this.getBegin() >= anotherVerctor.getBegin()) && (this.getEnd() <= anotherVerctor.getEnd());
	},
	isBefore: function(anotherVerctor){
		return this.getBegin() <= anotherVerctor.getBegin();
	},
	isContinuousWith: function(anotherVerctor){
		return this.isBefore(anotherVerctor) && this.getEnd() > anotherVerctor.getBegin();
	},
	containsValue: function(a){
		return (a >= this.getBegin()) && (a<this.getEnd());
	},
	/**
	 * Get all values from this.getBegin() to this.getEnd()-1
	 */
	allValues: function(){
		var arr = new Array();
		for(var i = this.getBegin();i<this.getEnd()-1;i++){
			arr.push(i);
		}
		return arr;
	},
	niceDisplay : function(containerObj, startRulerValue, endRulerValue, cssClass){
		var vectorDisplay = $( document.createElement('div') ).addClass("vectorDisplay");
		var lineOfRuler = $( document.createElement('div') ).addClass("ruler");
		var lineOfTicks = $( document.createElement('div') ).addClass("ticks");
		var lineOfVector = $( document.createElement('div') ).addClass("vector");
		
		containerObj.append(vectorDisplay);

		if(startRulerValue == null){
			startRulerValue = this.getBegin();
		}
		if(endRulerValue == null){
			endRulerValue = this.getEnd();
		}
		for(var i=startRulerValue;i<endRulerValue+1;i++){
			var spanVector = $( document.createElement('span') ).html("&nbsp;");
			var spanRuler = $( document.createElement('span') ).html(i);
			var spanTicks = $( document.createElement('span') ).html("&nbsp;");
			if(this.containsValue(i)) {
				spanVector.addClass("valueIsContained");
				if(cssClass){
					spanVector.addClass(cssClass);
				}
			}
			lineOfVector.append(spanVector);
			lineOfRuler.append(spanRuler);
			lineOfTicks.append(spanTicks);
		}
		vectorDisplay.append(lineOfVector);
		vectorDisplay.append(lineOfTicks);
		vectorDisplay.append(lineOfRuler);

		return containerObj;
	}
	
});
/**
 * Single point at origin
 */ 
var nullVector = new Vector(0,0);


/**
 * Merge all possible vectors that are continuous one to another
 * @param arrayOfVector
 * @returns arrayOfVector
 */
Vector.mergeContinuous = function(arrayOfVector){
	Vector.orderByBegin(arrayOfVector);
	if( arrayOfVector.length > 0 ){
		for(var i=0;i<arrayOfVector.length-1;){
			if( arrayOfVector[i].isContinuousWith(arrayOfVector[i+1]) ){
				arrayOfVector.splice(i,2, arrayOfVector[i].union(arrayOfVector[i+1]) );
			}else{
				i++;
			}
		}
	}
	return arrayOfVector;
};

/**
 * 
 * @param arrayOfVector
 * @returns arrayOfVector
 */
Vector.intersectContinuous = function(arrayOfVector){
	Vector.orderByBegin(arrayOfVector);
	if( arrayOfVector.length > 0 ){
		for(var i=0;i<arrayOfVector.length-1;){
			if( arrayOfVector[i].isContinuousWith(arrayOfVector[i+1]) ){
				arrayOfVector.splice(i,2, arrayOfVector[i].intersection(arrayOfVector[i+1]) );
			}else{
				i++;
			}
		}
	}
	return arrayOfVector;
};

Vector.orderByBegin = function(arrayOfVector){
	return arrayOfVector.sort(function(a,b){return (a.isBefore(b))?(-1):(1);});
};


/**
 * Build the UNION of all vectors of arrayOfVector
 * @param arrayOfArrayOfVector
 * @returns arrayOfVector
 */
Vector.unionAll = function(arrayOfArrayOfVector){
	if( arrayOfArrayOfVector.length == 0 ){
		return new Array();
	}
	var resultArray = arrayOfArrayOfVector[0];
	// loop for each line of Vectors, and mergeContinuous
	for(var i=1;i<arrayOfArrayOfVector.length;i++){
		resultArray = this.mergeContinuous(resultArray.concat(arrayOfArrayOfVector[i]));
	}
	return resultArray;
};

/**
 * Returns TRUE is one of Vectors contains the value
 * @param value
 * @param arrayOfVector
 * @returns {Boolean}
 */
Vector.oneContainsValue = function(value, arrayOfVector){
	for(var i=0;i<arrayOfVector.length;i++){
		if(arrayOfVector[i].containsValue(value)){
			return true;
		}
	}
	return false;
};

/**
 * Build an array of vectorss from values, that may be continuous or not
 * @param arrayOfValues
 * @returns {Array}
 */
Vector.buildVectorsFromValues = function(arrayOfValues){
	var resultVectorsArr = new Array();
	if(arrayOfValues.length == 0){
		return resultVectorsArr;
	}
	var begin = arrayOfValues[0];
	for(var i=1;i<arrayOfValues.length;i++){
		if(arrayOfValues[i] - arrayOfValues[i-1] > 1){
			resultVectorsArr.push(new Vector(begin, arrayOfValues[i-1] - begin+1));
			begin = arrayOfValues[i];
		}
	}
	resultVectorsArr.push(new Vector(begin, arrayOfValues[arrayOfValues.length-1] - begin+1));
	return resultVectorsArr;
};

/**
 * Return the intersection vectors from all arrays of vectors
 * @param arrayOfArrayOfVector
 * @returns arrayOfVector
 */
Vector.intersectAll = function(arrayOfArrayOfVector){
	if( arrayOfArrayOfVector.length == 0 ){
		return new Array();
	}
	var allChecksVectors = this.unionAll(arrayOfArrayOfVector);
	var resultOfValuesArray = new Array();
	// loop for each line of Vectors, and mergeContinuous
	for(var i=0;i<allChecksVectors.length;i++){
		for(var value = allChecksVectors[i].getBegin();value<allChecksVectors[i].getEnd();value++){
			var valueFound = false;
			loop_eachArrays: for(var j=0; j<arrayOfArrayOfVector.length;j++){
				if(!this.oneContainsValue(value,arrayOfArrayOfVector[j])){
					valueFound = false;
					break loop_eachArrays;
				}else{
					valueFound = true;
				}
			}
			if(valueFound){
				resultOfValuesArray.push(value);
			}
		}
	}
	return this.buildVectorsFromValues(resultOfValuesArray);
};


/**
 * Nice display all vectors with a ruler
 * @param arrayOfVector
 * @param containerObj
 * @param startRulerValue
 * @param endRulerValue
 * @param cssClass
 * @return containerObj
 */
Vector.niceDisplay = function(arrayOfVector, containerObj, startRulerValue, endRulerValue, cssClass){
	var vectorDisplay = $( document.createElement('div') ).addClass("vectorDisplay");
	var lineOfRuler = $( document.createElement('div') ).addClass("ruler");
	var lineOfTicks = $( document.createElement('div') ).addClass("ticks");
	
	containerObj.append(vectorDisplay);

	if(startRulerValue == null){
		startRulerValue = this.getBegin();
	}
	if(endRulerValue == null){
		endRulerValue = this.getEnd();
	}
	for(var v=0;v<arrayOfVector.length;v++){
		//arrayOfVector
		var lineOfVector = $( document.createElement('div') ).addClass("vector");
		vectorDisplay.append(lineOfVector);
		for(var i=startRulerValue;i<endRulerValue+1;i++){
			var spanVector = $( document.createElement('span') ).html("&nbsp;");
			if(arrayOfVector[v].containsValue(i)) {
				spanVector.addClass("valueIsContained");
				if(cssClass){
					spanVector.addClass(cssClass);
				}
			}
			lineOfVector.append(spanVector);
		}
		
	}
	for(var i=startRulerValue;i<endRulerValue+1;i++){
		var spanRuler = $( document.createElement('span') ).html(i);
		var spanTicks = $( document.createElement('span') ).html("&nbsp;");
		lineOfRuler.append(spanRuler);
		lineOfTicks.append(spanTicks);
	}
	
	vectorDisplay.append(lineOfTicks);
	vectorDisplay.append(lineOfRuler);

	return containerObj;
};

/**
 * 
 */
Vector.flatDisplay = function(arrayOfVector, containerObj, startRulerValue, endRulerValue, cssClass){
	var vectorDisplay = $( document.createElement('div') ).addClass("vectorDisplay");
	if(cssClass){
		vectorDisplay.addClass(cssClass);
	}
	containerObj.append(vectorDisplay);
	var fullWidth = containerObj.width();

	if(startRulerValue == null){
		startRulerValue = this.getBegin();
	}
	if(endRulerValue == null){
		endRulerValue = this.getEnd();
	}
	//arrayOfVector
	var lineOfVector = $( document.createElement('div') ).addClass("vector");
	vectorDisplay.append(lineOfVector);
	for(var i=startRulerValue;i<endRulerValue+1;i++){
		var spanVector = $( document.createElement('span') ).attr("data-rulerValue",i).html("&nbsp;");
		spanVector.width( (fullWidth / (endRulerValue-startRulerValue+1)) );
		if(Vector.oneContainsValue(i, arrayOfVector)) {
			spanVector.addClass("valueIsContained");
			
		}
		lineOfVector.append(spanVector);
		
	}
	return containerObj;

}
