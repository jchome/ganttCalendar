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

TimeLineMonth=function(e,t,s,n,r){return this.init(e,t,s,n,r)},$.extend(TimeLineMonth.prototype,{TimeLineClass:"MONTH",container:"",month:"",year:"",days:{1:[31,31],2:[28,29],3:[31,31],4:[30,30],5:[31,31],6:[30,30],7:[31,31],8:[31,31],9:[30,30],10:[31,31],11:[30,30],12:[31,31]},lang:"fr",months:{fr:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Décembre"],en:["January","February","March","April","May","June","July","Agust","September","October","November","December"]},weekDays:{fr:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},eventsByGroup:{},eventsByResource:{},cellWidth:20,resourcesColumnHeader:"Resources",init:function(e,t,s,n,r){return this.container=e,this.month=t,this.year=s,this.resources=n,this.updateMonthCallback=r||function(){},this},getNbDaysInMonth:function(){var e=this.year%4==0&&this.year%100!=0||this.year%400==0?1:0;return this.days[this.month][e]},drawElements:function(){var e,t,s,n,r,i,a,o,d,h,u,l,c,p,v,m,y;this.eventsByGroup={},this.eventsByResource={},e=$("#"+this.container),e.timeLineMonth=this,t=$(document.createElement("div")).addClass("largeCalendar"),e.html(t),s=$(document.createElement("div")).addClass("month"),t.html(s),s.html('<div class="prevMonth" title="[Page down] Go to Previous month"></div>		<div class="nameMonth">'+this.months[this.lang][this.month-1]+" "+this.year+'</div>		<div class="nextMonth" id="nextMonth" title="[Page up] Go to next month"></div>'),n=$(document.createElement("div")).addClass("leftColumn horizontalCalendarHeaders"),t.append(n),r=$(document.createElement("div")).addClass("eventsContainer container-grid-"+this.cellWidth),t.append(r),i=$(document.createElement("div")).addClass("headerResources"),n.html(i),e.width($("body").outerWidth()-1),this.cellWidth*this.getNbDaysInMonth()+i.width()+3<e.width()&&e.width(this.cellWidth*this.getNbDaysInMonth()+i.width()+3);var g=t.width()-i.width()-1;for(this.cellWidth*this.getNbDaysInMonth()<g&&(g=this.cellWidth*this.getNbDaysInMonth()),r.width(g),a=$(document.createElement("span")).addClass("labelCenter").html(this.resourcesColumnHeader),i.html(a),o=$(document.createElement("div")).addClass("listResources"),n.append(o),d=0;d<this.resources.groups.length;d++)for(h=this.resources.groups[d],o.append('<div id="group_'+h.id+'" class="group_left">					<span class="labelLeft">'+h.name+"</span>				</div>"),u=0;u<h.resources.length;u++)l=h.resources[u],o.append('<div id="resource_'+l.id+'" data-group="group_'+h.id+'" class="resource lineResource">					<span class="labelRight">'+l.name+"</span>					</div>");for(c=$(document.createElement("div")).addClass("horizontalCalendarContent for"+this.getNbDaysInMonth()+"days").attr("tabindex","0"),r.append(c),p=$(document.createElement("div")).addClass("lineOfDays"),c.html(p),v="",m=1;m<=this.getNbDaysInMonth();m++)y=10>m?"0"+m:m,jsDate=new Date(this.year,this.month-1,m),v+='<div class="day weekdayorder_'+jsDate.getDay()+'" id="day_'+y+'">'+y+'<br/><span class="weekDay">'+this.weekDays[this.lang][jsDate.getDay()]+"</span></div>";for(p.html(v),firstDayOfMonth=new Date(this.year,this.month-1,1),d=0;d<this.resources.groups.length;d++)for(h=this.resources.groups[d],c.append('<div id="group_'+h.id+'_right" data-group="group_'+h.id+'" class="group_right">&nbsp;</div>'),u=0;u<h.resources.length;u++)l=h.resources[u],c.append('<div class="lineForResource grid-'+this.cellWidth+"-offset-"+firstDayOfMonth.getDay()+'" data-resource="resource_'+l.id+'" id="events_r_'+l.id+'"></div>');this.defineEvents(this)},goToNextMonth:function(){12==this.month?(this.month=1,this.year++):this.month++,this.drawElements(),this.updateMonthCallback()},goToPrevMonth:function(){1==this.month?(this.month=12,this.year--):this.month--,this.drawElements(),this.updateMonthCallback()},updateWidth:function(){$(".eventsContainer").width($(".largeCalendar").width()-$(".headerResources").width()-1)},defineEvents:function(e){$(".prevMonth").click(function(){e.goToPrevMonth()}),$(".nextMonth").click(function(){e.goToNextMonth()}),$(".horizontalCalendarContent").keydown(function(t){switch(t.keyCode){case 34:e.goToPrevMonth(),$(".horizontalCalendarContent").focus();break;case 33:e.goToNextMonth(),$(".horizontalCalendarContent").focus()}})},findGroupHavingResource:function(e){for(var t=0;t<this.resources.groups.length;t++)for(var s=this.resources.groups[t],n=0;n<s.resources.length;n++){var r=s.resources[n];if(r.id==e)return s}return null},addEvent:function(e){var t=this.findGroupHavingResource(e.resourceId);null==t&&alert("Error: Event id="+e.eventId+" has an error. Please check resourceId."),null==this.eventsByGroup[t.id]&&(this.eventsByGroup[t.id]=Array()),this.eventsByGroup[t.id].push(e),null==this.eventsByResource[e.resourceId]&&(this.eventsByResource[e.resourceId]=Array()),this.eventsByResource[e.resourceId].push(e)},updateOccupation:function(){for(var e,t,s=this,n=0;n<this.resources.groups.length;n++){var r=this.resources.groups[n];if(null!=this.eventsByGroup[r.id]){var i=$("#group_"+r.id+"_right"),a=this.eventsByGroup[r.id],o=$.map(a||[],function(e){return e.asVector(s)});e=Vector.mergeContinuous(o),Vector.flatDisplay(e,i,0,this.getNbDaysInMonth()-1,"occupationLeak");for(var o=Array(),d=0;d<r.resources.length;d++){var h=r.resources[d],u=this.eventsByResource[h.id],l=$.map(u||[],function(e){return e.asVector(s)});o.push(l)}t=Vector.intersectAll(o),Vector.flatDisplay(t,i,0,this.getNbDaysInMonth()-1,"occupationFull")}}}}),EventCal=function(e,t,s,n,r){this.init(e,t,s,n,r)},$.extend(EventCal.prototype,{resourceId:"",eventId:"",startDay:"",endDay:"",label:"",jObject:null,init:function(e,t,s,n,r){this.resourceId=e,this.eventId=t,this.startDay=s,this.endDay=n,this.label=r},drawIn:function(e){var t,s,n=0,r=0;return containerId=e.container,"MONTH"==e.TimeLineClass?(n=e.cellWidth*(this.startDay-1),r=e.cellWidth*(this.endDay-this.startDay)-3):"WEEK"==e.TimeLineClass&&(t=this.startDay-e.mondayOfWeek.getDate(),s=this.endDay-e.mondayOfWeek.getDate(),n=e.cellWidth*t,r=e.cellWidth*(s-t)-3),e.addEvent(this),$("#"+containerId).find("#events_r_"+this.resourceId).append('<div id="'+this.eventId+'" class="event" style="left: '+n+"px;width:"+r+'px;">'+this.label+"</div>"),this.jObject=$("#"+this.eventId),$("#"+containerId).find("#"+this.eventId).draggable({axis:"x",containment:"parent",opacity:.5,snap:!0}),$("#"+containerId).find("#events_r_"+this.resourceId).droppable({drop:function(t,s){var n,r,i;n=$(this).offset().left,r=s.offset.left,i=1+(r-n)/e.cellWidth,$(".debug").html("newDayStart: "+i)}}),this},asVector:function(e){var t;return"MONTH"==e.TimeLineClass?t=new Vector(this.startDay-1,this.endDay-this.startDay):"WEEK"==e.TimeLineClass&&(newStartDay=this.startDay-e.mondayOfWeek.getDate(),newEndDay=this.endDay-e.mondayOfWeek.getDate(),t=new Vector(2*newStartDay,2*(newEndDay-newStartDay))),t}}),TimeLineWeek=function(e,t,s,n,r){var i=this.init(e,t,s,n,r);return $(window).resize(function(){i.drawElements(),i.updateWeekCallback()}),i},$.extend(TimeLineWeek.prototype,{TimeLineClass:"WEEK",groups:[],container:"",weekNumber:"",year:"",lang:"fr",weekDays:{fr:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},eventsByGroup:{},eventsByResource:{},cellWidth:20,mondayOfWeek:null,sundayOfWeek:null,resourcesColumnHeader:"Resources",init:function(e,t,s,n,r){return this.container=e,this.weekNumber=t,this.year=s,this.resources=n,this.updateWeekCallback=r||function(){},this},findGroupHavingResource:function(e){for(var t=0;t<this.resources.groups.length;t++)for(var s=this.resources.groups[t],n=0;n<s.resources.length;n++){var r=s.resources[n];if(r.id==e)return s}return null},dateFormat:function(){var e=this.weekDays[this.lang][1],t=this.weekDays[this.lang][0],s={year:"numeric",month:"2-digit",day:"2-digit"};return e+" "+this.mondayOfWeek.toLocaleDateString(this.lang,s)+" - "+t+" "+this.sundayOfWeek.toLocaleDateString(this.lang,s)},drawElements:function(){var e,t,s,n,r,i,a,o,d,h,u,l,c,p,v,m,y,g=new Date(this.year,0,1),f=6048e5*(this.weekNumber-1),k=g.getTime()+f-864e5;this.mondayOfWeek=new Date(k),this.sundayOfWeek=new Date(k),this.sundayOfWeek.setDate(this.mondayOfWeek.getDate()+6),this.eventsByGroup={},this.eventsByResource={},e=$("#"+this.container),e.timeLineMonth=this,t=$(document.createElement("div")).addClass("largeCalendar"),e.html(t),s=$(document.createElement("div")).addClass("week"),t.html(s),s.html('<div class="prevWeek" title="[Page down] Go to Previous week"></div>		<div class="nameWeek"> '+this.dateFormat()+'</div>		<div class="nextWeek" id="nextWeek" title="[Page up] Go to next week"></div>'),n=$(document.createElement("div")).addClass("leftColumn horizontalCalendarHeaders"),t.append(n),r=$(document.createElement("div")).addClass("eventsContainer container-grid-"+this.cellWidth+" forWeek"),t.append(r),i=$(document.createElement("div")).addClass("headerResources"),n.html(i),e.width($("body").outerWidth()-1),7*this.cellWidth+i.width()+3<e.width()&&e.width(7*this.cellWidth+i.width()+3);var w=t.width()-i.width()-1;for(7*this.cellWidth<w&&(w=7*this.cellWidth),r.width(w),a=$(document.createElement("span")).addClass("labelCenter").html(this.resourcesColumnHeader),i.html(a),o=$(document.createElement("div")).addClass("listResources"),n.append(o),d=0;d<this.resources.groups.length;d++)for(h=this.resources.groups[d],o.append('<div id="group_'+h.id+'_left" class="group_left">					<span class="labelLeft">'+h.name+"</span>				</div>"),u=0;u<h.resources.length;u++)l=h.resources[u],o.append('<div id="resource_'+l.id+'" data-group="group_'+h.id+'" class="resource lineResource">					<span class="labelRight">'+l.name+"</span>					</div>");c=$(document.createElement("div")).addClass("horizontalCalendarContent").attr("tabindex","0").width(7*this.cellWidth),r.append(c),p=$(document.createElement("div")).addClass("lineOfDays"),c.html(p),v="";var D=new Date(this.mondayOfWeek.getTime());for(m=1;7>=m;m++)y=D.getDate()<10?"0"+D.getDate():D.getDate(),v+='<div class="day weekdayorder_'+D.getDay()+'" id="day_'+y+'">'+y+'<br/><span class="weekDay">'+this.weekDays[this.lang][m%7]+"</span></div>",D.setDate(D.getDate()+1);p.html(v),firstDayOfWeek=new Date(this.mondayOfWeek.getTime());var C=$(document.createElement("div")).addClass("eventsAndGroupContainer");for(c.append(C),d=0;d<this.resources.groups.length;d++)for(h=this.resources.groups[d],C.append('<div id="group_'+h.id+'_right"data-group="'+h.id+'" class="group_right">&nbsp;</div>'),u=0;u<h.resources.length;u++)l=h.resources[u],C.append('<div class="lineForResource grid-'+this.cellWidth+'-offset-1" data-resource="resource_'+l.id+'" id="events_r_'+l.id+'"></div>');this.defineEvents(this)},goToNextWeek:function(){52==this.weekNumber?(this.weekNumber=1,this.year++):this.weekNumber++,this.drawElements(),this.updateWeekCallback()},goToPrevWeek:function(){1==this.weekNumber?(this.weekNumber=52,this.year--):this.weekNumber--,this.drawElements(),this.updateWeekCallback()},updateWidth:function(){$(".eventsContainer").width($(".largeCalendar").width()-$(".headerResources").width()-1)},defineEvents:function(e){$(".prevWeek").click(function(){e.goToPrevWeek()}),$(".nextWeek").click(function(){e.goToNextWeek()}),$(".horizontalCalendarContent").keydown(function(t){switch(t.keyCode){case 34:e.goToPrevWeek(),$(".horizontalCalendarContent").focus();break;case 33:e.goToNextWeek(),$(".horizontalCalendarContent").focus()}})},addEvent:function(e){var t=this.findGroupHavingResource(e.resourceId);null==t&&alert("Error: Event id="+e.eventId+" has an error. Please check resourceId."),null==this.eventsByGroup[t.id]&&(this.eventsByGroup[t.id]=Array()),this.eventsByGroup[t.id].push(e),null==this.eventsByResource[e.resourceId]&&(this.eventsByResource[e.resourceId]=Array()),this.eventsByResource[e.resourceId].push(e)},updateOccupation:function(){for(var e,t,s=this,n=13,r=0;r<this.resources.groups.length;r++){var i=this.resources.groups[r];if(null!=this.eventsByGroup[i.id]){var a=$("#group_"+i.id+"_right"),o=this.eventsByGroup[i.id],d=$.map(o||[],function(e){return e.asVector(s)});e=Vector.mergeContinuous(d),Vector.flatDisplay(e,a,0,n,"occupationLeak");for(var d=Array(),h=0;h<i.resources.length;h++){var u=i.resources[h],l=this.eventsByResource[u.id],c=$.map(l||[],function(e){return e.asVector(s)});d.push(c)}t=Vector.intersectAll(d),Vector.flatDisplay(t,a,0,n,"occupationFull")}}for(resource_id in this.eventsByResource){var p=0,o=this.eventsByResource[resource_id],d=$.map(o||[],function(e){return e.asVector(s)});if(p=Vector.countOverlaps(d),$("#resource_"+resource_id).addClass("overlap_"+p),$("#events_r_"+resource_id).addClass("overlap_"+p),p>1)for(var v,m=1,y=d[0],g=1;g<d.length;g++)v=y.intersection(d[g]),0!=v.getLength()&&($("#"+o[g].eventId).css("top",1+24*m+"px"),m++)}}});

