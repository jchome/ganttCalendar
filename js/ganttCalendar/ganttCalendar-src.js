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
	TimeLineClass: null,
	container:'',
	year: '',
	lang: 'fr', // langue par défaut
	weekDays: {'fr':["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],
		'en':["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
	},
	months: {'fr':["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"],
		'en':["January", "February", "March", "April", "May", "June", "July", "Agust", "September", "October", "November", "December"]
	},
	resourcesColumnHeader : {'fr' : 'Ressources', 'en': 'Resources'},
	days: {1:[31,31],2:[28,29],3:[31,31],4:[30,30],5:[31,31],6:[30,30],
		7:[31,31],8:[31,31],9:[30,30],10:[31,31],11:[30,30],12:[31,31]
	},
	eventsByGroup: {},
	eventsByResource: {},
	cellWidth: 20,
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
	firstStep: function(){
		// to override
		return 1;
	},
	clickResource: function(resource_id, startEvent){
		console.log("click dans le vide sur la ressource id=" +resource_id + " / début de l'evt:" + startEvent);
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
	_prepareDrawings: function(emptyEvents){
		if(emptyEvents){
			// restart new drawings : reinit dictionnaries
			this.eventsByGroup = {};
			this.eventsByResource = {};
		}

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
		var containerObject = this;
		
		for(indexGroup=0;indexGroup<this.resources.groups.length;indexGroup++){
			group = this.resources.groups[indexGroup];
			eventsAndGroupContainer.append("<div id=\"group_"+group.id+"_right"+"\"data-group=\""+group.id+"\" class=\"group_right\">&nbsp;</div>");
			
			groupResources = $( document.createElement('div') ).addClass("eventsForGroup")
				.attr("id","eventsForGroup_"+group.id)
				.data("group",group.id);
			eventsAndGroupContainer.append(groupResources);
			
			for(indexResource=0;indexResource<group.resources.length;indexResource++){
				resource = group.resources[indexResource];
				groupResources.append("<div class=\"lineForResource grid-"+this.cellWidth+" offset-"+ this.offset() +"\" data-resource=\""+resource.id+"\" id=\"events_r_"+resource.id+"\"></div>");
				
				groupResources.find("#events_r_"+resource.id).droppable({
					drop: function(event, ui){
						var grid_x = containerObject.cellWidth;
						if(containerObject.TimeLineClass == 'DAY' || containerObject.TimeLineClass == 'WEEK'){
							grid_x = containerObject.cellWidth/2;
						}
						var newResource = $(event.target).attr("data-resource");
						var eventCalDropped = window["GANTTCALENDAR_DRAG"];
						delete(window["GANTTCALENDAR_DRAG"]);
						
						old_resource_id = eventCalDropped.resourceId;
						new_resource_id = parseInt(newResource);
						
						// calcule la nouvelle position
						var containerLeft, eventLeft, newDayStart;
						containerLeft = $(this).offset().left;
						eventLeft = ui.offset.left;
						newDayStart = (1 + ((Math.round((eventLeft - containerLeft)/grid_x)*grid_x) / containerObject.cellWidth) ); // px
						if(containerObject.TimeLineClass == 'DAY' || containerObject.TimeLineClass == 'WEEK'){
							newDayStart = newDayStart - 1 + containerObject.firstStep();
						}
						eventLength = eventCalDropped.endDay - eventCalDropped.startDay
						
						
						if(event.ctrlKey){
							// copie d'un nouvel évènement
							// deep clone
							var newEventCal = jQuery.extend(true, {}, eventCalDropped);
							newEventCal.resourceId = new_resource_id
							eventCalDropped.startDay = newDayStart;
							eventCalDropped.endDay = newDayStart + eventLength;
							var result = eventCalDropped.copyHandler(newEventCal, eventCalDropped);
							if(result != false){
								newEventCal.drawIn(containerObject);
							}
						} else {
							// changement de ressource ou de position
							var result = eventCalDropped.moveHandler(eventCalDropped, new_resource_id, newDayStart);
							if(result != false){
								eventCalDropped.startDay = newDayStart;
								eventCalDropped.endDay = newDayStart + eventLength;
								eventCalDropped.resourceId = new_resource_id;
								// mettre à jour le container
								containerObject.updateEvent(old_resource_id, eventCalDropped);
							}
						}
						
						containerObject.drawElements(false); // without callback
						
					}
				});
				
				groupResources.find("#events_r_"+resource.id).click(function(event){
					var resourceId = $(event.target).attr("data-resource");
					var clickPosition = event.pageX - $(this).offset().left;
					var grid_x = containerObject.cellWidth;
					if(containerObject.TimeLineClass == 'DAY' || containerObject.TimeLineClass == 'WEEK'){
						grid_x = containerObject.cellWidth/2;
					}
					var clickStart = ((Math.round(clickPosition/grid_x)*grid_x) / containerObject.cellWidth);
					clickStart = clickStart + 
					containerObject.clickResource(parseInt(resourceId), clickStart);
				});
				
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
	updateEvent: function(old_resource_id, anEvent){
		// suppression dans this.eventsByResource
		for(var i=0;i<this.eventsByResource[old_resource_id].length;i++){
			if(this.eventsByResource[old_resource_id][i].eventId == anEvent.eventId){
				this.eventsByResource[old_resource_id].splice(i, 1);
				break;
			}
		}
		// suppression dans this.eventsByGroup
		var groupForEvent = this.findGroupHavingResource(old_resource_id);
		for(var i=0;i<this.eventsByGroup[groupForEvent.id].length;i++){
			if(this.eventsByGroup[groupForEvent.id][i].eventId == anEvent.eventId){
				this.eventsByGroup[groupForEvent.id].splice(i, 1);
				break;
			}
		}
		
		this.addEvent(anEvent);
		
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
			
			// suppression de l'ancienne base
			if( divDisplay.find(".vectorDisplay.occupationLeak") ){
				divDisplay.find(".vectorDisplay.occupationLeak").remove();
			}
			
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
			
			// suppression de l'ancienne base
			if( divDisplay.find(".vectorDisplay.occupationFull") ){
				divDisplay.find(".vectorDisplay.occupationFull").remove();
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
			$("#resource_"+resource_id).removeClass("overlap_1 overlap_2 overlap_3 overlap_4 overlap_5 overlap_6");
			$("#events_r_"+resource_id).removeClass("overlap_1 overlap_2 overlap_3 overlap_4 overlap_5 overlap_6");
			// change height of resource's row - left and right side
			$("#resource_"+resource_id).addClass("overlap_"+nb_overlaps_maxi);
			$("#events_r_"+resource_id).addClass("overlap_"+nb_overlaps_maxi);
			var union = allVectors[0];
			var intersect;
			var currentLine = 0;
			for(var v=1;v<allVectors.length;v++){
				intersect = union.intersection(allVectors[v]);
				if(intersect.getLength() != 0){
					// intersection detected
					currentLine++;
				}
				$("#"+allEvents[v].eventId).css('top', (1+(currentLine * 24))+'px');
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
		this.header.find(".eventsContainer").removeClass("y-scroll").addClass("no-scroll");
		this.header.hide();
		this.containerObj.append(this.header);
	},
	updateScrollWindow: function(){
		var offset = this.containerObj.offset();
		var scrollTop = $(window).scrollTop();
		var scrollLeft = $(".y-scroll").scrollLeft();
		var headerHeight = this.header.height();
		// check if floating header should be displayed
		if( scrollTop > offset.top && (scrollTop < offset.top + this.containerObj.height() - headerHeight)) {
			this.header.show();
			this.header.css("top", $(window).scrollTop())
			$(".no-scroll").scrollLeft( scrollLeft );
		}
		else {
			this.header.hide();
		}
	},
	sub_defineEvents: function(){
		// TO OVERRIDE
	},
	defineEvents: function(){
		var calendarObject = this;
		$(".prev").click(function () {
			calendarObject.goToPrev();
			calendarObject.updateScrollWindow();
		});

		$(".next").click(function () {
			calendarObject.goToNext();
			calendarObject.updateScrollWindow();
		});
		
		$(".horizontalCalendarContent").keydown(function(event) {
			switch(event.keyCode) {
				case 34: // PAGE_DOWN
					calendarObject.goToPrev();
					$(".horizontalCalendarContent").focus();
					break;
				case 33: //PAGE_UP
					calendarObject.goToNext();
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
		$(".y-scroll").scroll(function(){
			$(".no-scroll").scrollLeft( $(this).scrollLeft() );
		});
		this.sub_defineEvents();
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
	firstStep: function(){
		// commence le 1er du mois
		return 1;
	},
	offset: function(){
		// décalage pour l'image de fond
		return new Date(this.year, this.month -1, 1).getDay();
	},
	drawElements: function(withCallback) {
		var largeCalendar, monthLine, calendarHeaders, eventsContainer, headerResources, 
			spanLabelCenter, listResources, indexGroup, group, indexResource,
			resource, horizontalCalendarContent, lineOfDays, htmlDays, 
			indexDay, day2digits;

		var largeCalendar = this._prepareDrawings(withCallback);
		
		monthLine = $( document.createElement('div') ).addClass("month");
		largeCalendar.html(monthLine);
		monthLine.html("<div class=\"prev\" title=\"[Page down] Go to Previous month\"></div>\
		<div class=\"nameMonth\">"+this.months[this.lang][this.month-1]+" "+this.year+"</div>\
		<div class=\"next\" title=\"[Page up] Go to next month\"></div>");
		
		var headerResources = this._drawResourcesIn(largeCalendar);

		eventsContainer = $( document.createElement('div') ).addClass("eventsContainer y-scroll container-grid-"+this.cellWidth);
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
		this.defineHeader();
		this.defineEvents();
		if(withCallback == null || withCallback == true){
			// utiliser le callback pour définir les évènements
			this.updateCallback();
		}else{
			// utiliser les définitions des évènements déjà enregistrées
			for(var i=0;i<this.resources.groups.length;i++){
				var group = this.resources.groups[i];
				if(this.eventsByGroup[group.id] == null){
					continue;
				}
				for(var j=0;j<this.eventsByGroup[group.id].length;j++){
					var eventCal = this.eventsByGroup[group.id][j];
					eventCal.defineHTMLCompontentsAndJSEvents(this);
				}
			}
		}
		this.updateOccupation();
		
	},
	goToNext: function(){
		if(this.month == 12){
			this.month = 1;
			this.year++;
		} else{
			this.month++;
		}
		this.drawElements();
	},
	
	goToPrev: function(){
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
	
	sub_defineEvents: function(){
		// ne rien faire de plus
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
	firstStep: function(){
		// jour du lundi dans le mois
		return new Date(this.mondayOfWeek.getTime()).getDate();
	},
	offset: function(){
		// décalage pour l'image de fond
		// démarre le 1 jour de la semaine : le lundi
		return new Date(this.mondayOfWeek.getTime()).getDay();
	},
	drawElements: function(withCallback) {
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

		var largeCalendar = this._prepareDrawings(withCallback);
		
		
		weekLine = $( document.createElement('div') ).addClass("week");
		largeCalendar.html(weekLine);
		weekLine.html("<div class=\"prev\" title=\"[Page down] Go to Previous week\"></div>\
		<div class=\"nameWeek\"> "+this.dateFormat() +"</div>\
		<div class=\"next\" title=\"[Page up] Go to next week\"></div>");
		
		var headerResources = this._drawResourcesIn(largeCalendar);
		
		eventsContainer = $( document.createElement('div') ).addClass("eventsContainer y-scroll container-grid-"+this.cellWidth+" forWeek");
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
		this.defineHeader();
		this.defineEvents();
		if(withCallback == null || withCallback == true){
			// utiliser le callback pour définir les évènements
			this.updateCallback();
		}else{
			// utiliser les définitions des évènements déjà enregistrées
			for(var i=0;i<this.resources.groups.length;i++){
				var group = this.resources.groups[i];
				if(this.eventsByGroup[group.id] == null){
					continue;
				}
				for(var j=0;j<this.eventsByGroup[group.id].length;j++){
					var eventCal = this.eventsByGroup[group.id][j];
					eventCal.defineHTMLCompontentsAndJSEvents(this);
				}
			}
		}
		this.updateOccupation();
	},
	
	goToNext: function(){
		if(this.weekNumber == 52){
			this.weekNumber = 1;
			this.year++;
		} else{
			this.weekNumber++;
		}
		this.drawElements();
	},
	
	goToPrev: function(){
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
	
	sub_defineEvents: function(){
		// ne rien faire de plus
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
	firstStep: function(){
		// commence à 08h00
		return 8;
	},
	nbSteps: function(){
		return this.nbHours()-1;
	},
	offset: function(){
		// décalage pour l'image de fond
		// décalage en fonction de la première heure
		return this.firstStep();
	},
	_setZoomFeatures: function(largeCalendar, headerResources, eventsContainer){
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
	},
	drawElements: function(withCallback) {
		
		var largeCalendar, dayLine, calendarHeaders, eventsContainer, headerResources, 
			spanLabelCenter, listResources, indexGroup, group, indexResource,
			resource, horizontalCalendarContent, lineOfDays, htmlDays, 
			indexDay, day2digits;

		var largeCalendar = this._prepareDrawings(withCallback);
		
		dayLine = $( document.createElement('div') ).addClass("day");
		largeCalendar.html(dayLine);
		jsDate = new Date(this.year, this.month -1, this.day);
		dayLine.html("<div class=\"prev\" title=\"[Page down] Go to Previous day\"></div>\
			<div class=\"nameDay\">"+this.weekDays[this.lang][jsDate.getDay()]+
			" "+this.day + " " + this.months[this.lang][this.month-1]+" "+this.year+"</div>\
			<div class=\"next\" title=\"[Page up] Go to next day\"></div>");
		
		var headerResources = this._drawResourcesIn(largeCalendar);

		eventsContainer = $( document.createElement('div') ).addClass("eventsContainer y-scroll hourContainer container-grid-"+this.cellWidth);
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
		for(indexHour=this.firstStep();indexHour<this.nbHours()+this.firstStep();indexHour++){
			hour2digits = (indexHour<10)?("0"+indexHour):(indexHour);
			htmlHours += "<div class=\"hour hourOrder_"+hour2digits+"\" id=\"hour_"+hour2digits+"\">"+
				hour2digits+"h</div>";
		}
		lineOfHours.html(htmlHours);
		
		this._drawGridEvents(horizontalCalendarContent);
		this.defineHeader();
		this.defineEvents();
		if(withCallback == null || withCallback == true){
			// utiliser le callback pour définir les évènements
			this.updateCallback();
		}else{
			// utiliser les définitions des évènements déjà enregistrées
			for(var i=0;i<this.resources.groups.length;i++){
				var group = this.resources.groups[i];
				if(this.eventsByGroup[group.id] == null){
					continue;
				}
				for(var j=0;j<this.eventsByGroup[group.id].length;j++){
					var eventCal = this.eventsByGroup[group.id][j];
					eventCal.defineHTMLCompontentsAndJSEvents(this);
				}
			}
		}
		this.updateOccupation();
	},

	sub_defineEvents: function(){
		// ne rien faire de plus
	},
	goToNext: function(){
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
	
	goToPrev: function(){
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
	moveHandler: function(eventCal, newResourceId, newStart){ 
		//alert("Moved to resource id="+ newResourceId+ ", start = " + newStart );
		return true;
	},
	copyHandler: function(newEventCal, oldEventCal){
		if(console){
			console.log("Copie de l'evt="+oldEventCal.resourceId);
		}
		newEventCal.eventId = oldEventCal.eventId+1;
		newEventCal.label = oldEventCal.label + " - Copie";
		return true;
	},
	clickHandler: function(event,eventCal){
		if(console){
			console.log("click sur la ressource id="+eventCal.resourceId);
		}
	},
	resizeHandler: function(eventCal, start, length){
		if(console){
			console.log("Resize de l'evt \""+eventCal.label+"\"");
		}
		return true;
	},
	init: function(resourceId, eventId, startDay, endDay, label) {
		this.resourceId = resourceId;
		this.eventId = eventId;
		this.startDay = startDay;
		this.endDay = endDay;
		this.label = label;
	},
	defineHTMLCompontentsAndJSEvents: function(containerObject){
		var margin=0, width=0, newStartDay, newEndDay;
		var $this = this;
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
			var newStartHour = this.startDay - containerObject.firstStep();
			var newEndHour = this.endDay - containerObject.firstStep();
			margin = containerObject.cellWidth * (newStartHour);
			width = containerObject.cellWidth * (newEndHour - newStartHour) - 3;
		}
		$("#"+containerId).find("#events_r_"+this.resourceId).append('<div id="'+this.eventId+'" class="event" style="left: '+margin+'px;width:'+width+'px;">'+this.label+'</div>');
		this.jObject = $("#"+this.eventId);
		$("#"+containerId).find("#"+this.eventId).draggable({ 
			containment: 'DOM',
			revert: 'invalid',
			zIndex: 999,
			opacity: 0.5, 
			snap: true,
			start: function(event, ui) {
				window["GANTTCALENDAR_DRAG"] = $this;
			}
		});
		$("#"+containerId).find("#"+this.eventId).click(function(event){
			event.preventDefault();
			$this.clickHandler(event, $this);
			return false;
		});
		
		var grid_x = containerObject.cellWidth;
		if(containerObject.TimeLineClass == 'DAY' || containerObject.TimeLineClass == 'WEEK'){
			grid_x = containerObject.cellWidth/2;
		}
		$("#"+containerId).find("#"+this.eventId).resizable({
			handles: "e, w",
			grid: [grid_x, 9999],
			stop: function( event, ui ) {
				var length = (Math.round(ui.size.width/grid_x)*grid_x) / containerObject.cellWidth;
				var start = (Math.round(ui.position.left/grid_x)*grid_x) / containerObject.cellWidth;
				var result = $this.resizeHandler($this, start, length);
				if(result) {
					$this.startDay = start + containerObject.firstStep();
					$this.endDay = $this.startDay + length;
				}
				containerObject.drawElements(false);
			}
		});
		return this;
		
	},
	drawIn: function(containerObject, onClickHandler, onMoveHandler, onCopyHandler, onResizeHandler) {
		containerObject.addEvent(this);
		
		this.moveHandler = onMoveHandler || this.moveHandler;
		this.copyHandler = onCopyHandler || this.copyHandler;
		this.clickHandler = onClickHandler || this.clickHandler;
		this.resizeHandler = onResizeHandler || this.resizeHandler;
		this.defineHTMLCompontentsAndJSEvents(containerObject);
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
			newStartDay = this.startDay - containerObject.firstStep();
			newEndDay = this.endDay - containerObject.firstStep();
			period = new Vector(newStartDay,(newEndDay-newStartDay));
		}
		return period;
	}
});

