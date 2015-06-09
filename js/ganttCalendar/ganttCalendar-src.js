/*
 * Gantt Calendar by Julien CORON - 2013
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


TimeLine = function(container, param_1, year, resources, updateCallback) {
	var timeline = this.init(container, param_1, year, resources, updateCallback);
	$(window).resize(function() {
		timeline.drawElements();
		timeline.updateCallback();
		this.updateOccupation();
	});
	return timeline;
};

$.extend(TimeLine.prototype, {
	// object variables
	TimeLineClass: null,
	container:'',
	year: '',
	weekDays: {'fr':["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],
		'en':["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
	},
	days: {1:[31,31],2:[28,29],3:[31,31],4:[30,30],5:[31,31],6:[30,30],
		7:[31,31],8:[31,31],9:[30,30],10:[31,31],11:[30,30],12:[31,31]
	},
	months: {'fr':["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"],
		'en':["January", "February", "March", "April", "May", "June", "July", "Agust", "September", "October", "November", "December"]
	},
	eventsByGroup: {},
	eventsByResource: {},
	cellWidth: 20,
	lang: 'fr',
	resourcesColumnHeader : {'fr' : 'Ressources', 'en': 'Resources'},
	_superInit: function(container, year, resources, updateCallback){
		this.container = container;
		this.year = year;
		this.resources = resources;
		this.updateCallback = updateCallback || function(){};
	},
	init: function(container, param_1, year, resources, updateCallback) {
		this._superInit(container, year, resources, updateCallback)
		this.sub_init(param_1);
		return this;
	},
	sub_init: function(param_1){
		// to override
	},
	nbDays: function(){
		// to override
		return 0;
	},
	nbSteps: function(){
		// to override
		return 0;
	},
	firstDay: function(){
		// to override
		return 0;
	},
	findGroupHavingResource: function(resourceId){
		for(var i=0;i<this.resources.groups.length;i++){
			var group = this.resources.groups[i];
			for(var j=0;j<group.resources.length;j++){
				var resource = group.resources[j];
				if(resource.id == resourceId){
					return group;
				}
			}
		}
		return null;
	},
	_drawResourcesIn : function(largeCalendar, onlyHeader){
		if(onlyHeader == null){
			onlyHeader = false;
		}
		calendarHeaders = $( document.createElement('div') ).addClass("leftColumn horizontalCalendarHeaders");
		largeCalendar.append(calendarHeaders);
		headerResources = $( document.createElement('div') ).addClass("headerResources");
		calendarHeaders.html(headerResources);
		
		listResources = $( document.createElement('div') ).addClass("listResources");
		calendarHeaders.append(listResources);
		
		
		// All groups and resources, prepare left side
		for(indexGroup=0;indexGroup<this.resources.groups.length;indexGroup++){
			group = this.resources.groups[indexGroup];
			listResources.append("<div id=\"group_"+group.id+"_left\" class=\"group_left\" data-group=\""+group.id+"\">\
					<span class=\"toggleImg\">&#9660;</span><span class=\"labelLeft\">"+group.name+"</span>\
				</div>");
			groupResources = $( document.createElement('div') ).addClass("resourcesForGroup")
				.attr("id","resourcesForGroup_"+group.id)
				.data("group",group.id);
			listResources.append(groupResources);
			
			for(indexResource=0;indexResource<group.resources.length;indexResource++){
				resource = group.resources[indexResource];
				groupResources.append("<div id=\"resource_"+resource.id+"\" data-group=\"group_"+group.id+"\" class=\"resource lineResource\">\
					<span class=\"labelRight\">"+resource.name+"</span>\
					</div>");
			}
		}
		return headerResources;
	},
	_prepareDrawings: function(){
		// restart new drawings : reinit dictionnaries
		this.eventsByGroup = {};
		this.eventsByResource = {};

		this.containerObj = $("#"+this.container);
		this.containerObj.timeLineMonth = this;
		
		largeCalendar = $( document.createElement('div') ).addClass("largeCalendar");
		this.containerObj.html(largeCalendar);
		
		return largeCalendar;
	},
	_setZoomFeatures: function(largeCalendar, headerResources, eventsContainer){
		// //
		// ZOOM FEATURES -- BEGIN
		// //
		// update the size of eventsContainer to match with borders
		// set the default size for calculations
		this.containerObj.width( $("body").outerWidth() - 1);
		var nbDaysInMonth = this.nbDays();
		if(this.cellWidth*nbDaysInMonth+ headerResources.width() + 3 < this.containerObj.width()){
			this.containerObj.width(this.cellWidth*nbDaysInMonth + headerResources.width() + 3);
		}

		var widthForcontainer = largeCalendar.width() - headerResources.width() - 1;
		if( this.cellWidth*nbDaysInMonth < widthForcontainer){
			widthForcontainer = this.cellWidth*nbDaysInMonth;
		}
		
		eventsContainer.width(widthForcontainer);
		// //
		// ZOOM FEATURES -- END
		// //
		
	},
	_drawGridEvents: function(horizontalCalendarContent){
		// All groups and resources, prepare content
		var eventsAndGroupContainer = $( document.createElement('div') ).addClass("eventsAndGroupContainer")
		horizontalCalendarContent.append(eventsAndGroupContainer);

		for(indexGroup=0;indexGroup<this.resources.groups.length;indexGroup++){
			group = this.resources.groups[indexGroup];
			eventsAndGroupContainer.append("<div id=\"group_"+group.id+"_right"+"\"data-group=\""+group.id+"\" class=\"group_right\">&nbsp;</div>");
			
			groupResources = $( document.createElement('div') ).addClass("eventsForGroup")
				.attr("id","eventsForGroup_"+group.id)
				.data("group",group.id);
			eventsAndGroupContainer.append(groupResources);
			
			for(indexResource=0;indexResource<group.resources.length;indexResource++){
				resource = group.resources[indexResource];
				groupResources.append("<div class=\"lineForResource grid-"+this.cellWidth+" offset-"+ this.offset() +"\" data-resource=\"resource_"+resource.id+"\" id=\"events_r_"+resource.id+"\"></div>");
				
			}
		}
	},
	addEvent: function(anEvent){
		var groupForEvent = this.findGroupHavingResource(anEvent.resourceId);
		if(groupForEvent == null){
			alert("Error: Event id="+anEvent.eventId + " has an error. Please check resourceId.");
		}
		if( this.eventsByGroup[groupForEvent.id] == null){
			this.eventsByGroup[groupForEvent.id] = Array();
		}
		this.eventsByGroup[groupForEvent.id].push(anEvent);
		
		if( this.eventsByResource[anEvent.resourceId] == null){
			this.eventsByResource[anEvent.resourceId] = Array();
		}
		this.eventsByResource[anEvent.resourceId].push(anEvent);
	},
	updateOccupation: function(){
		var container = this;
		var resArrayMini, resArrayMaxi;
		var nb_steps = this.nbSteps();
		
		// Barre des occupations mini
		for(var i=0;i<this.resources.groups.length;i++){
			var group = this.resources.groups[i];
			if(this.eventsByGroup[group.id] == null){
				continue;
			}
			var divDisplay = $("#group_"+group.id+"_right");
			
			// Barre des occupations mini
			var allEvents = this.eventsByGroup[group.id];
			var allVectors = $.map((allEvents || []),function(evt){
				return evt.asVector(container);
			});
			
			resArrayMini = Vector.mergeContinuous(allVectors);
			Vector.flatDisplay(resArrayMini, divDisplay,0,nb_steps, "occupationLeak");

			// Barre des occupations maxi
			var allVectors = Array();
			for(var j=0;j<group.resources.length;j++){
				var resource = group.resources[j];
				var allEventsOfResource = this.eventsByResource[resource.id];
				var allVectorsOfResource = $.map((allEventsOfResource || []),function(evt){
					return evt.asVector(container);
				});
				allVectors.push(allVectorsOfResource);
			}
			
			resArrayMaxi = Vector.intersectAll(allVectors);
			Vector.flatDisplay(resArrayMaxi, divDisplay,0,nb_steps, "occupationFull");
		}
		
		// update height of events
		for(resource_id in this.eventsByResource){
			var nb_overlaps_maxi = 0;
			var allEvents = this.eventsByResource[resource_id];
			var allVectors = $.map((allEvents || []),function(evt){
				return evt.asVector(container);
			});
			nb_overlaps_maxi = Vector.countOverlaps(allVectors);
			// change height of resource's row - left and right side
			$("#resource_"+resource_id).addClass("overlap_"+nb_overlaps_maxi);
			$("#events_r_"+resource_id).addClass("overlap_"+nb_overlaps_maxi);
			//console.log( "ressource "+resource_id);
			if(nb_overlaps_maxi > 1){
				var currentLine = 1;
				var union = allVectors[0];
				var intersect;
				for(var v=1;v<allVectors.length;v++){
					intersect = union.intersection(allVectors[v]);
					if(intersect.getLength() == 0){
						continue;
					}else{
						// intersection detected
						$("#"+allEvents[v].eventId).css('top', (1+(currentLine * 24))+'px');
						//console.log( (1+(currentLine * 24)) );
						currentLine++;
					}
				}
			}
		}
		
		
	},
	closeGroup: function(group_id){
		$("#resourcesForGroup_"+group_id).animate({height: 'toggle'});
		$("#eventsForGroup_"+group_id).animate({height: 'toggle'});
		var toggleImg = $("#group_"+group_id+"_left > .toggleImg");
		if( $("#resourcesForGroup_"+group_id).css('height') == '1px' ){
			toggleImg.html("&#9660;");
		}else{
			toggleImg.html("&#9654;");
		}
	},
	/**
	 * Build the header object
	 */
	defineHeader : function(){
		this.header = this.containerObj.clone().attr("id","headerCalendar");
		this.header.find(".listResources").remove();
		this.header.find(".eventsAndGroupContainer").remove();
		this.header.hide();
		this.containerObj.append(this.header);
	},
	updateScrollWindow: function(){
		var offset = this.containerObj.offset();
		var scrollTop = $(window).scrollTop();
		var headerHeight = this.header.height();
		// check if floating header should be displayed
		if( scrollTop > offset.top && (scrollTop < offset.top + this.containerObj.height() - headerHeight)) {
			this.header.show();
			this.header.css("top", $(window).scrollTop())
		}
		else {
			this.header.hide();
		}
	}
});


/* TimeLineMonth - VERSION 1.2 */

TimeLineMonth = function(container, month, year, resources, updateCallback) {
	return this.init(container, month, year, resources, updateCallback);
};
TimeLineMonth.prototype = Object.create(TimeLine.prototype);

$.extend(TimeLineMonth.prototype, {
	// object variables
	TimeLineClass: 'MONTH',
	month: '',
	sub_init: function(month){
		this.month = month;
	},
	nbDays : function(){
		var bisextile = ( (this.year%4==0 && this.year%100!=0) || this.year%400==0 )?(1):(0);
		return this.days[this.month][bisextile];
	},
	nbSteps: function(){
		// 1 step par jour
		return this.nbDays()-1;
	},
	offset: function(){
		// décalage pour l'image de fond
		return new Date(this.year, this.month -1, 1).getDay();
	},
	drawElements: function() {
		var largeCalendar, monthLine, calendarHeaders, eventsContainer, headerResources, 
			spanLabelCenter, listResources, indexGroup, group, indexResource,
			resource, horizontalCalendarContent, lineOfDays, htmlDays, 
			indexDay, day2digits;

		var largeCalendar = this._prepareDrawings();
		
		monthLine = $( document.createElement('div') ).addClass("month");
		largeCalendar.html(monthLine);
		monthLine.html("<div class=\"prevMonth\" title=\"[Page down] Go to Previous month\"></div>\
		<div class=\"nameMonth\">"+this.months[this.lang][this.month-1]+" "+this.year+"</div>\
		<div class=\"nextMonth\" id=\"nextMonth\" title=\"[Page up] Go to next month\"></div>");
		
		var headerResources = this._drawResourcesIn(largeCalendar);

		eventsContainer = $( document.createElement('div') ).addClass("eventsContainer container-grid-"+this.cellWidth);
		largeCalendar.append(eventsContainer);
		
		this._setZoomFeatures(largeCalendar, headerResources, eventsContainer);
		
		spanLabelCenter = $( document.createElement('span') ).addClass("labelCenter").html(this.resourcesColumnHeader[this.lang]);
		headerResources.html(spanLabelCenter);
		
		horizontalCalendarContent = $( document.createElement('div') )
			.addClass("horizontalCalendarContent for"+this.nbDays()+"days")
			.attr("tabindex", "0");
		eventsContainer.append(horizontalCalendarContent);
		
		lineOfDays = $( document.createElement('div') ).addClass("lineOfDays");
		horizontalCalendarContent.html(lineOfDays);
		
		htmlDays = "";
		for(indexDay=1;indexDay<=this.nbDays();indexDay++){
			day2digits = (indexDay<10)?("0"+indexDay):(indexDay);
			jsDate = new Date(this.year, this.month -1, indexDay);
			htmlDays += "<div class=\"day weekdayorder_"+jsDate.getDay()+"\" id=\"day_"+day2digits+"\">"+
				day2digits+"<br/><span class=\"weekDay\">"+this.weekDays[this.lang][jsDate.getDay()]+"</span></div>";
		}
		lineOfDays.html(htmlDays);
		
		this._drawGridEvents(horizontalCalendarContent);
		this.defineEvents();
		this.updateCallback();
		this.updateOccupation();
		this.defineHeader();
		
	},
	goToNextMonth: function(){
		if(this.month == 12){
			this.month = 1;
			this.year++;
		} else{
			this.month++;
		}
		this.drawElements();
	},
	
	goToPrevMonth: function(){
		if(this.month == 1){
			this.month = 12;
			this.year--;
		} else{
			this.month--;
		}
		this.drawElements();
	},
	
	updateWidth: function() {
		$(".eventsContainer").width($(".largeCalendar").width() - $(".headerResources").width() - 1);
	},
	
	defineEvents: function(){
		var calendarObject = this;
		$(".prevMonth").click(function () {
			calendarObject.goToPrevMonth();
		});

		$(".nextMonth").click(function () {
			calendarObject.goToNextMonth();
		});
		
		$(".horizontalCalendarContent").keydown(function(event) {
			switch(event.keyCode) {
				case 34: // PAGE_DOWN
					calendarObject.goToPrevMonth();
					$(".horizontalCalendarContent").focus();
					break;
				case 33: //PAGE_UP
					calendarObject.goToNextMonth();
					$(".horizontalCalendarContent").focus();
					break;
				default:
					break;
			};
		});

		$(".group_left").click(function(){
			calendarObject.closeGroup( $(this).attr("data-group") );
		});
		$(window).scroll(function(){
			calendarObject.updateScrollWindow();
		});
	}
	
});



/* TimeLineWeek - VERSION 1.2 */
TimeLineWeek = function(container, weekNumber, year, resources, updateCallback) {
	return this.init(container, weekNumber, year, resources, updateCallback);
};
TimeLineWeek.prototype = Object.create(TimeLine.prototype);


$.extend(TimeLineWeek.prototype, {
	// object variables
	TimeLineClass: 'WEEK',
	weekNumber: '',
	mondayOfWeek: null,
	sundayOfWeek: null,
	sub_init: function(weekNumber) {
		this.weekNumber = weekNumber;
	},
	dateFormat : function(){
		var weekDay1 = this.weekDays[this.lang][1];
		var weekDay2 = this.weekDays[this.lang][0];
		var dateFormatOptions = {year: "numeric", month: "2-digit", day: "2-digit"};
		return weekDay1+" "+this.mondayOfWeek.toLocaleDateString(this.lang, dateFormatOptions)+" - "
		+weekDay2+" "+ this.sundayOfWeek.toLocaleDateString(this.lang, dateFormatOptions)
	},
	nbDays : function(){
		return 7;
	},
	nbSteps: function(){
		// 7 jours, 2 demies-journée par jour: de 0 à 13
		return 13;
	},
	offset: function(){
		// décalage pour l'image de fond
		// démarre le lundi
		return new Date(this.mondayOfWeek.getTime()).getDay();
	},
	drawElements: function() {
		var largeCalendar, weekLine, calendarHeaders, eventsContainer, headerResources, 
			spanLabelCenter, listResources, indexGroup, group, indexResource,
			resource, horizontalCalendarContent, lineOfDays, htmlDays, 
			indexDay, day2digits;
		var firstDayOfYear = new Date(this.year, 0, 1);
		var milisecondsOffset = 1000 * 60 * 60 * 24 * 7 * (this.weekNumber - 1);
		var targetTime = firstDayOfYear.getTime() + milisecondsOffset - 86400000;
		this.mondayOfWeek = new Date(targetTime);
		this.sundayOfWeek = new Date(targetTime); 
		this.sundayOfWeek.setDate(this.mondayOfWeek.getDate() + 6);

		var largeCalendar = this._prepareDrawings();
		
		
		weekLine = $( document.createElement('div') ).addClass("week");
		largeCalendar.html(weekLine);
		weekLine.html("<div class=\"prevWeek\" title=\"[Page down] Go to Previous week\"></div>\
		<div class=\"nameWeek\"> "+this.dateFormat() +"</div>\
		<div class=\"nextWeek\" id=\"nextWeek\" title=\"[Page up] Go to next week\"></div>");
		
		var headerResources = this._drawResourcesIn(largeCalendar);
		
		eventsContainer = $( document.createElement('div') ).addClass("eventsContainer container-grid-"+this.cellWidth+" forWeek");
		largeCalendar.append(eventsContainer);

		this._setZoomFeatures(largeCalendar, headerResources, eventsContainer);
		
		spanLabelCenter = $( document.createElement('span') ).addClass("labelCenter").html(this.resourcesColumnHeader[this.lang]);
		headerResources.html(spanLabelCenter);
		
		horizontalCalendarContent = $( document.createElement('div') )
			.addClass("horizontalCalendarContent")
			.attr("tabindex", "0")
			.width(this.cellWidth*7);
		eventsContainer.append(horizontalCalendarContent);
		
		lineOfDays = $( document.createElement('div') ).addClass("lineOfDays");
		horizontalCalendarContent.html(lineOfDays);
		
		htmlDays = "";
		var currentDay = new Date(this.mondayOfWeek.getTime());
		// loop on 7 days
		for(indexDay=1;indexDay<=7;indexDay++){
			day2digits = (currentDay.getDate()<10)?("0"+currentDay.getDate()):(currentDay.getDate());
			htmlDays += "<div class=\"day weekdayorder_"+currentDay.getDay()+"\" id=\"day_"+day2digits+"\">"+
				day2digits+"<br/><span class=\"weekDay\">"+this.weekDays[this.lang][indexDay%7]+"</span></div>";
			currentDay.setDate(currentDay.getDate() + 1);
		}
		lineOfDays.html(htmlDays);
		
		this._drawGridEvents(horizontalCalendarContent);
		this.defineEvents();
		this.updateCallback();
		this.updateOccupation();
		
		this.defineHeader();

	},
	
	goToNextWeek: function(){
		if(this.weekNumber == 52){
			this.weekNumber = 1;
			this.year++;
		} else{
			this.weekNumber++;
		}
		this.drawElements();
	},
	
	goToPrevWeek: function(){
		if(this.weekNumber == 1){
			this.weekNumber = 52;
			this.year--;
		} else{
			this.weekNumber--;
		}
		this.drawElements();
	},
	
	updateWidth: function() {
		$(".eventsContainer").width($(".largeCalendar").width() - $(".headerResources").width() - 1);
	},
	
	defineEvents: function(){
		calendarObject = this;
		$(".prevWeek").click(function () {
			calendarObject.goToPrevWeek();
		});

		$(".nextWeek").click(function () {
			calendarObject.goToNextWeek();
		});
		
		$(".horizontalCalendarContent").keydown(function(event) {	   
			switch(event.keyCode) {
				case 34: // PAGE_DOWN
					calendarObject.goToPrevWeek();
					$(".horizontalCalendarContent").focus();
					break;
				case 33: //PAGE_UP
					calendarObject.goToNextWeek();
					$(".horizontalCalendarContent").focus();
					break;
				default:
					break;
			};
		});

		$(".group_left").click(function(){
			calendarObject.closeGroup($(this).attr("data-group"));
		});
		$(window).scroll(function(){
			calendarObject.updateScrollWindow();
		});
	}
});


/* TimeLineDay - VERSION 1.0 */

TimeLineDay = function(container, day, month, year, resources, updateCallback) {
	return this.init(container, day, month, year, resources, updateCallback);
};
TimeLineDay.prototype = Object.create(TimeLineMonth.prototype);

$.extend(TimeLineDay.prototype, {
	// object variables
	TimeLineClass: 'DAY',
	
	init: function(container, day, month, year, resources, updateCallback) {
		this._superInit(container, year, resources, updateCallback)
		this.sub_init(day, month);
		return this;
	},
	sub_init: function(day, month){
		this.day = day;
		this.month = month;
	},
	nbHours : function(){
		return 12;
	},
	startHour: function(){
		return 8;
	},
	nbSteps: function(){
		return this.nbHours()-1;
	},
	offset: function(){
		// décalage pour l'image de fond
		return this.startHour();
	},
	_setZoomFeatures: function(largeCalendar, headerResources, eventsContainer){
		// //
		// ZOOM FEATURES -- BEGIN
		// //
		// update the size of eventsContainer to match with borders
		// set the default size for calculations
		this.containerObj.width( $("body").outerWidth() - 1);
		var nbHours = this.nbHours();
		if(this.cellWidth*nbHours+ headerResources.width() + 3 < this.containerObj.width()){
			this.containerObj.width(this.cellWidth*nbHours + headerResources.width() + 3);
		}

		var widthForcontainer = largeCalendar.width() - headerResources.width() - 1;
		if( this.cellWidth*nbHours < widthForcontainer){
			widthForcontainer = this.cellWidth*nbHours;
		}
		
		eventsContainer.width(widthForcontainer);
		// //
		// ZOOM FEATURES -- END
		// //
		
	},
	drawElements: function() {
		
		var largeCalendar, dayLine, calendarHeaders, eventsContainer, headerResources, 
			spanLabelCenter, listResources, indexGroup, group, indexResource,
			resource, horizontalCalendarContent, lineOfDays, htmlDays, 
			indexDay, day2digits;

		var largeCalendar = this._prepareDrawings();
		
		dayLine = $( document.createElement('div') ).addClass("day");
		largeCalendar.html(dayLine);
		jsDate = new Date(this.year, this.month -1, this.day);
		dayLine.html("<div class=\"prevDay\" title=\"[Page down] Go to Previous day\"></div>\
			<div class=\"nameDay\">"+this.weekDays[this.lang][jsDate.getDay()]+
			" "+this.day + " " + this.months[this.lang][this.month-1]+" "+this.year+"</div>\
			<div class=\"nextDay\" id=\"nextDay\" title=\"[Page up] Go to next day\"></div>");
		
		var headerResources = this._drawResourcesIn(largeCalendar);

		eventsContainer = $( document.createElement('div') ).addClass("eventsContainer hourContainer container-grid-"+this.cellWidth);
		largeCalendar.append(eventsContainer);
		
		this._setZoomFeatures(largeCalendar, headerResources, eventsContainer);
		
		spanLabelCenter = $( document.createElement('span') ).addClass("labelCenter").html(this.resourcesColumnHeader[this.lang]);
		headerResources.html(spanLabelCenter);
		
		horizontalCalendarContent = $( document.createElement('div') )
			.addClass("horizontalCalendarContent for"+ this.nbHours() +"hours")
			.attr("tabindex", "0");
		eventsContainer.append(horizontalCalendarContent);
		
		lineOfHours = $( document.createElement('div') ).addClass("lineOfHours");
		horizontalCalendarContent.html(lineOfHours);
		
		htmlHours = "";
		for(indexHour=this.startHour();indexHour<this.nbHours()+this.startHour();indexHour++){
			hour2digits = (indexHour<10)?("0"+indexHour):(indexHour);
			htmlHours += "<div class=\"hour hourOrder_"+hour2digits+"\" id=\"hour_"+hour2digits+"\">"+
				hour2digits+"h</div>";
		}
		lineOfHours.html(htmlHours);
		
		this._drawGridEvents(horizontalCalendarContent);
		this.defineEvents();
		this.updateCallback();
		this.updateOccupation();
		this.defineHeader();
	},
	
	defineEvents: function(){
		var calendarObject = this;
		$(".prevDay").click(function () {
			calendarObject.goToPrevDay();
		});

		$(".nextDay").click(function () {
			calendarObject.goToNextDay();
		});
		
		$(".horizontalCalendarContent").keydown(function(event) {
			switch(event.keyCode) {
				case 34: // PAGE_DOWN
					calendarObject.goToPrevDay();
					$(".horizontalCalendarContent").focus();
					break;
				case 33: //PAGE_UP
					calendarObject.goToNextDay();
					$(".horizontalCalendarContent").focus();
					break;
				default:
					break;
			};
		});

		$(".group_left").click(function(){
			calendarObject.closeGroup( $(this).attr("data-group") );
		});
		$(window).scroll(function(){
			calendarObject.updateScrollWindow();
		});
	},
	goToNextDay: function(){
		this.day++;
		var bisextile = ( (this.year%4==0 && this.year%100!=0) || this.year%400==0 )?(1):(0);
		if(this.day > this.days[this.month][bisextile]){
			this.day = 1
			if(this.month == 12){
				this.month = 1;
				this.year++;
			} else{
				this.month++;
			}
		}
		this.drawElements();
	},
	
	goToPrevDay: function(){
		this.day--;
		var bisextile = ( (this.year%4==0 && this.year%100!=0) || this.year%400==0 )?(1):(0);
		if(this.day == 0){
			if(this.month == 1){
				this.month = 12;
				this.year--;
			} else{
				this.month--;
			}
			this.day = this.days[this.month][bisextile];
		}
		
		this.drawElements();
	}

});





EventCal = function(resourceId, eventId, startDay, endDay, label) {
	this.init(resourceId, eventId, startDay, endDay, label);
};

$.extend(EventCal.prototype, {
	// object variables
	resourceId: '',
	eventId: '',
	startDay: '',
	endDay: '',
	label: '',
	jObject: null,
	
	init: function(resourceId, eventId, startDay, endDay, label) {
		this.resourceId = resourceId;
		this.eventId = eventId;
		this.startDay = startDay;
		this.endDay = endDay;
		this.label = label;
	},

	drawIn: function(containerObject) {
		var margin=0, width=0, newStartDay, newEndDay;
		containerId = containerObject.container;
		if(containerObject.TimeLineClass ==  'MONTH'){
			margin = containerObject.cellWidth * (this.startDay - 1);
			width = containerObject.cellWidth * (this.endDay - this.startDay) - 3;
		}else if(containerObject.TimeLineClass == 'WEEK'){
			newStartDay = this.startDay - containerObject.mondayOfWeek.getDate();
			newEndDay = this.endDay - containerObject.mondayOfWeek.getDate();
			margin = containerObject.cellWidth * (newStartDay);
			width = containerObject.cellWidth * (newEndDay - newStartDay) - 3;
		}else if(containerObject.TimeLineClass == 'DAY'){
			var newStartHour = this.startDay - containerObject.startHour();
			var newEndHour = this.endDay - containerObject.startHour();
			margin = containerObject.cellWidth * (newStartHour);
			width = containerObject.cellWidth * (newEndHour - newStartHour) - 3;
		}
		containerObject.addEvent(this);
		
		$("#"+containerId).find("#events_r_"+this.resourceId).append('<div id="'+this.eventId+'" class="event" style="left: '+margin+'px;width:'+width+'px;">'+this.label+'</div>');
		this.jObject = $("#"+this.eventId);
		$("#"+containerId).find("#"+this.eventId).draggable({ axis: "x", containment: "parent", opacity: 0.5, snap: true });
		$("#"+containerId).find("#events_r_"+this.resourceId).droppable({
			drop: function(event, ui){
				var containerLeft, eventLeft, newDayStart;
				containerLeft = $(this).offset().left;
				eventLeft = ui.offset.left;
				newDayStart = 1 + ((eventLeft - containerLeft) / containerObject.cellWidth); // px
				$(".debug").html("newDayStart: "+  newDayStart );
			}
		});
		return this;
	},
	
	asVector: function(containerObject){
		var period;
		if(containerObject.TimeLineClass ==  'MONTH'){
			period = new Vector(this.startDay - 1,this.endDay - this.startDay);
		}else if(containerObject.TimeLineClass == 'WEEK'){
			newStartDay = this.startDay - containerObject.mondayOfWeek.getDate();
			newEndDay = this.endDay - containerObject.mondayOfWeek.getDate();
			period = new Vector(newStartDay*2,(newEndDay-newStartDay)*2);
		}else if(containerObject.TimeLineClass == 'DAY'){
			newStartDay = this.startDay - containerObject.startHour();
			newEndDay = this.endDay - containerObject.startHour();
			period = new Vector(newStartDay,(newEndDay-newStartDay));
		}
		return period;
	}
});

