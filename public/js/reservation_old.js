var Reservation = (function () {
	var minHour;
	var maxHour;
	var currentSelectedDate="28/12/2017";

	var initCalendar = function (){
		$('#calendar').fullCalendar({
				editable: true,
				weekends: true,
				allDaySlot: false,
				disableDragging: true,
				disableResizing: true,
				aspectRatio: 1,
				header: {
					left: 'prev,next today,agendaDay,agendaWeek',
					center: 'title',
					right: ''
				},
				eventColor: '#B3DC6C',
				eventTextColor: '#006600',
				eventRender: function(event, element) {calendarRender(event, element)}
			});
	}

	var getHourDivId = function(hour){
		var id = "#reservation-hour-"+hour.replace(":","-");
		return id;
	}

	var getHourDiv = function (hour, isHalfHour){
		var id = isHalfHour ? hour+":30" : hour+":00";
		var text = isHalfHour ? id : id;
		return "<div class='col reservation-hour-div reservation-hour-available' id='reservation-hour-" + id.replace(":", "-") + "' hourValue=" + id + ">"  +
		"<p class='reservation-hour-label'>" + text + "</p>" +
		"</div>";
	}

	var updatePartialUnavailable = function(){
		var arrElem = $(".reservation-hour-available");
		var nextHour = Utils.getNextHour(maxHour);
		var previousHour = Utils.getPreviousHour(minHour);

		for (var i = 0; i < arrElem.length; i++) {
			var elem = arrElem[i];
			var elemHour = $(elem).attr("hourValue");
			$(elem).removeClass("reservation-hour-partial-unavailable");
			
			if(!$(elem).hasClass("reservation-hour-selected") && elemHour != nextHour && elemHour != previousHour) {
				$(elem).addClass("reservation-hour-partial-unavailable");
			}
		};
	}

	var selectHour = function (hour){
		if(minHour == undefined && maxHour == undefined){
			minHour=hour;
			maxHour=hour;
		}
		else {
			//Activem botó reserva
			$("#reservation-btn").attr("disabled",null);
			if(Utils.compareHours(hour, maxHour) === 1) { //És més gran
				maxHour = hour;
			}
			else{
				minHour = hour;
			}
		}
	}

	var addReservationEvents = function (){
		$(".reservation-hour-div").click(function (ev) {
			if($(this).hasClass("reservation-hour-selected")){
				$(this).removeClass("reservation-hour-selected");
			}
			else if (!$(this).hasClass("reservation-hour-unavailable") && !$(this).hasClass("reservation-hour-partial-unavailable")){
				$(this).addClass("reservation-hour-selected");	
				var hour = $(this).attr("hourValue");
				selectHour(hour);
				updatePartialUnavailable();
			}
		});
	}

	var createReservationDiv = function (){
		var startHour = 6;
		var html = "";
		for (var i = startHour; i < startHour+(24-startHour)/2; i++) {
			html += getHourDiv(i, false);
			html += getHourDiv(i, true);
		};
		$("#reservation-row1").html(html);

		html = "";
		for (var i = startHour+(24-startHour)/2; i < 24; i++) {
			html += getHourDiv(i, false);
			html += getHourDiv(i, true);
		};
		$("#reservation-row2").html(html);

		addReservationEvents();
	}

	var setOneReservation = function (res) {
		console.log(res)
		var hour = res.horaIni;
		while(hour != res.horaFi){
			setAvailable(hour, false);
			hour = Utils.getNextHour(hour);
		}
		setAvailable(hour, false);
	}

	var setAvailable = function (hour, isAvailable){
		var id = getHourDivId(hour);
		
		$(id).removeClass("reservation-hour-available");
		$(id).removeClass("reservation-hour-unavailable");

		if (isAvailable){
			$(id).addClass("reservation-hour-available");
		}
		else {
			$(id).addClass("reservation-hour-unavailable");
		}
	}

	var setReservations = function (arrRes) {
		for (var key in arrRes) {
			var res = arrRes[key];
			setOneReservation(res);
		};
	}

	var initReservations = function (){
		// Get a reference to the database service
	  var database = firebase.database();
	  database.ref('reservations').orderByChild("data").equalTo(currentSelectedDate).once('value').then(function(snapshot) {
		  console.log(snapshot.val());
		  var arrRes = snapshot.val();
		  setReservations(arrRes);
		});
	}

	var init = function(){
		initCalendar();
	    createReservationDiv();
	    initReservations();
	}

	return {
		init: init
	}
})();

$(document).ready(function() {

    // page is now ready, initialize the calendar...
    Reservation.init();
});