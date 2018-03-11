const STATES = {
	AVAILABLE: "available",
	UNAVAILABLE: "unavailable",
	SELECTED: "selected",
	PARTIAL_UNAVAILABLE: "partial-unavailable"
};

const BASE_URL = "https://us-central1-accesscontrol-f2410.cloudfunctions.net/";
const ADD_RESERVATION_URL = BASE_URL + "addReservation";

var minHour;
var maxHour;
var arrReservations = [];

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

var resetAvailableHours = function (fullReset, selectedHoursToo){
	minHour = maxHour = undefined;

	for (var hour in hours) {
		if (fullReset || hours[hour].state == STATES.PARTIAL_UNAVAILABLE || (selectedHoursToo && hours[hour].state == STATES.SELECTED)){
			hours[hour].state = STATES.AVAILABLE;
		}
	}
}

var setAllPartialUnavailableHours = function (){
	for (var hour in hours) {
		if (hours[hour].state == STATES.AVAILABLE){
			hours[hour].state = STATES.PARTIAL_UNAVAILABLE;
		}
	}
}

var updateAvailableHours = function (){
	setAllPartialUnavailableHours();

	var nextHour = Utils.getNextHour(maxHour);
	var nextNextHour = Utils.getNextHour(nextHour);
	var previousHour = Utils.getPreviousHour(minHour);
	
	// No seleccionem l'hora anterior com a disponible
	//if(hours[previousHour] !== undefined && hours[previousHour].state == STATES.PARTIAL_UNAVAILABLE) hours[previousHour].state = STATES.AVAILABLE;
	
	if(hours[nextHour] !== undefined && hours[nextHour].state == STATES.PARTIAL_UNAVAILABLE) hours[nextHour].state = STATES.AVAILABLE;
	//if(hours[nextNextHour] !== undefined && hours[nextNextHour].state == STATES.PARTIAL_UNAVAILABLE) hours[nextHour].state = STATES.AVAILABLE;
}

var updateScrollToHour = function(event){
	var scrollTop = $("html, body").scrollTop();
	var docHeight = $(window).height();
	$("html, body").animate({
	    scrollTop: $(event.currentTarget).offset().top - docHeight/2 + 15 //Posem l'scroll al mig de la pantalla -25
	  }, 500);
}

var selectHour = function (event){
	hour = event.currentTarget.getAttribute("hourvalue")
	console.log(hour);


	var nextHour = Utils.getNextHour(hour);
	var state = hours[hour].state;

	if (state == STATES.UNAVAILABLE || state == STATES.PARTIAL_UNAVAILABLE) {
		return;
	}
	else if (state == STATES.SELECTED){
		if (hour == maxHour) {
			hours[hour].state = STATES.AVAILABLE;
			maxHour = Utils.getPreviousHour(hour);
		}
		else if (hour == minHour) {
			hours[hour].state = STATES.AVAILABLE;
			minHour = Utils.getNextHour(hour);
		}
		
		if(Utils.compareHours(minHour, maxHour) == 1) {
			resetAvailableHours(false);
		}
		else{
			updateAvailableHours();
		}

		return;
	}

	hours[hour].state = STATES.SELECTED;

	if(minHour == undefined && maxHour == undefined){ //Es la primera selecció
		minHour=hour;
		
		if(hours[nextHour] != undefined) {
			maxHour=nextHour;
			hours[nextHour].state = STATES.SELECTED;
		}
		else {
			maxHour = hour;
		}

		updateScrollToHour(event);
	}
	else {
		if(Utils.compareHours(hour, maxHour) === 1) { //És més gran
			maxHour = hour;
		}
		else{
			minHour = hour;
		}
	}

	updateAvailableHours();
}

var setOneReservation = function (res) {
	console.log(res)
	var hour = res.horaIni;
	var horaFi = Utils.getPreviousHour(res.horaFi); //En el client identifiquem les mitjes hores per l'inici
	while(hour != horaFi){
		setAvailable(hour, false);
		hour = Utils.getNextHour(hour);
	}
	setAvailable(hour, false);
}

var setAvailable = function (hour, isAvailable){
	if (hours[hour] !== undefined) {
		hours[hour].state = isAvailable ? STATES.AVAILABLE : STATES.UNAVAILABLE;
	}
}

var setReservations = function (arrRes) {
	for (var key in arrRes) {
		var res = arrRes[key];
		setOneReservation(res);
	};
}

var setUnavailableHousByTime = function () {
	var now = new Date();
	for (var hour in hours) {
		if(Utils.stringToDate(Reservation.currentSelectedDate, hour) < now) {
			setAvailable(hour, false);
		}
	};
}

var startHour = 7;
var hours = {};
var defaultState = STATES.AVAILABLE; 
for (var i = startHour; i < 24; i++) {
	var isMorning = (i < startHour + (24-startHour)/2);
	hours[i + ":00"] = {id: i + ":00", state: defaultState, isMorning: isMorning};
	hours[i + ":30"] = {id: i + ":30", state: defaultState, isMorning: isMorning};
};

var initScrollEvent = function(){
	var banner = $("#mainNav");
	var bannerHgt = banner.height();
	var dateSelectorTop = $(".date-selector").css("top");
	var reservationTop = $("#reservation").css("top");
	var lastScroll = $(window).scrollTop(); 
	var showingHeader = true;

	$(window).scroll(function() { 
		var scroll = $(window).scrollTop(); 
		if (lastScroll < (scroll-2) && showingHeader) { 
		  $(".date-selector").css("top", "0px");
		  //$("#reservation").css("top", "20px");
		  $("#mainNav").css("top", "-" + (bannerHgt-5)+ "px"); //amaguem
		  showingHeader = false;
		} else if ((lastScroll > (scroll+2) || scroll == 0) && !showingHeader) {
		  $(".date-selector").css("top", dateSelectorTop);
		  //$("#reservation").css("top", reservationTop);
		  $("#mainNav").css("top", "0px"); //mostrem
		  showingHeader = true;
		}

		lastScroll = scroll;
	});
};

	
var Reservation = new Vue ({
	el: "#app",
	data: {
		hours: hours,
		currenDate: Utils.getCurrentDate(),
		currentSelectedDate: Utils.getCurrentDate(),
		currentSelectedReservation: function() { 
			return minHour == undefined ? "" : "Reserva dia <b>" + this.currentSelectedDate + "</b> de <b>" + minHour + "</b> a <b>" + Utils.getNextHour(maxHour) + "</b>";
		},
		hourIniLabel: function(){
			return minHour;
		},
		hourFiLabel: function(){
			return Utils.getNextHour(maxHour);
		},
		dateIndex: 0,
		backDateAvailable: false,
		imagesIndex: 0,
		pathSiluetes: "./img/siluetes/",
		menImagesLink: ["man/1.png", "man/2.png", "man/3.png"],
		womenImagesLink: ["woman/1.png", "woman/2.png", "woman/3.png"],
		arrReservations: arrReservations,
		loading: true
	},
	methods: {
		init: function () {
		  initScrollEvent();
		  this.initDatePicker();
		  this.updateReservations();
	    },
	    initDatePicker(){
	    	var datepicker = $('#datepicker').pickadate({
	    		min: Utils.stringToDate(this.currentSelectedDate),
	    		clear: '',
	    		selectYears: false,
  				selectMonths: false,
  				onSet: (event) => {
  					if ( event.select ) {
  						this.currentSelectedDate = Utils.dateToString(new Date(event.select));
  						this.backDateAvailable = !(this.currenDate == this.currentSelectedDate);
  						this.updateReservations();
  					}
  				}
	    	});
	    },
	    updateReservations : function (){
	    	this.loading = true;
	    	resetAvailableHours(true);
			// Get a reference to the database service
		  var database = firebase.database();

		  //Desglossem la data
		  var arrDate = this.currentSelectedDate.split("/");
		  var day = arrDate[0];
		  var month = arrDate[1];
		  var year = arrDate[2];

		  database.ref('reservations/' + year + "/" + month + "/" + day).once('value').then((snapshot) => {
			  console.log(snapshot.val());
			  arrReservations = snapshot.val();
			  if (arrReservations != undefined) {
			  	setReservations(arrReservations, true);
			  }
			  
			  if(this.currenDate == this.currentSelectedDate){
			  	setUnavailableHousByTime();
			  }
			  
			  this.loading = false;
			});
		},
		selectHour: selectHour,
		getToNextDate:function () {
		  this.backDateAvailable = true;
		  ++this.dateIndex;
		  this.imagesIndex = (this.imagesIndex+1)%2;
	      this.currentSelectedDate = Utils.incrDate(this.currentSelectedDate);
		  this.updateReservations();
	    },
		getToPreviousDate: function(){
			--this.dateIndex;
			this.imagesIndex = (this.imagesIndex-1)%2;
			this.currentSelectedDate = Utils.decrDate(this.currentSelectedDate);
			this.updateReservations();
			if(this.currenDate == this.currentSelectedDate) this.backDateAvailable = false;
		},
		getIcon: function(hour) {
			switch (hour.state) {
				case STATES.SELECTED:
					return "done";
				case STATES.AVAILABLE:
					var prevHour = Utils.getPreviousHour(hour["id"]);

					if (this.hours[prevHour] !== undefined && this.hours[prevHour].state === STATES.SELECTED){
						return "add";
					}
					return "";
				default:
					return "";
			}
		},
		showAddReservationPanel: function() {
			return (maxHour !== undefined || minHour !== undefined);
		},
		btnClearReservationState: function(){
			return (minHour != undefined) ? null : "";
		},
		btnAddReservationState: function(){
			return (minHour != undefined && Utils.compareHours(minHour, maxHour) !== 0) ? null : "";
		},
		clearReservation: function() {
			resetAvailableHours(false, true);
		},
		addNewReservation: function(){
			$('#confirmDialog').modal('show');
		},
		confirmNewReservation: function(){
			var self = this;
			firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
			  	// Send token to your backend via HTTPS
			 	$('#confirmDialog').modal('hide');
				$.ajax({
				  type: "POST",
				  url: ADD_RESERVATION_URL,
				  headers: {"Authorization" : "Bearer " + idToken},
				  data: {
	    			"horaIni": minHour,
	    			"horaFi": Utils.getNextHour(maxHour), //En el client identifiquem les mitjes hores per l'inici
	    			"data": self.currentSelectedDate
				  },
				  success: function(res) {
				  	console.log(res)
				  	$('#successDialog').modal('show');
				  },
				  error: function(err) {
				  	console.log(err)
				  	$('#errorDialog').modal('show');
				  },
				  dataType: "application/json"
				});
			}).catch(function(error) {
			  // Handle error
			});
		}
	}
});

$(document).ready(function() {

    // page is now ready, initialize the calendar...
    Reservation.init();
});