var Utils = (function () {

	var getNextHour = function (hour) {
		if(hour === undefined) return "";
		var arrHour = hour.split(":");
		if (arrHour[1] == "30"){
			return (parseInt(arrHour[0])+1) + ":00";
		}
		else {
			return arrHour[0] + ":30";
		}
	}

	var getPreviousHour = function (hour) {
		if(hour === undefined) return "";
		var arrHour = hour.split(":");
		if (arrHour[1] == "00"){
			return (parseInt(arrHour[0])-1) + ":30";
		}
		else {
			return arrHour[0] + ":00";
		}
	}

	var compareHours = function(hourA, hourB){
		if (hourA === hourB) return 0;
		var arrHourA = hourA.split(":");
		var arrHourB = hourB.split(":");
		if (parseInt(arrHourA[0]) > parseInt(arrHourB[0]) ||
			(parseInt(arrHourA[0]) == parseInt(arrHourB[0]) && parseInt(arrHourA[1]) > parseInt(arrHourB[0]) ) ){
			return 1;
		}
		else{
			return -1;
		}
	}

	var dateToString = function(date) {
		var hour = date.getHours();
		hour = (hour < 10 ? "0" : "") + hour;

		var min = date.getMinutes();
		min = (min < 10 ? "0" : "") + min;

		var sec = date.getSeconds();
		sec = (sec < 10 ? "0" : "") + sec;

		var year = date.getFullYear();

		var month = date.getMonth() + 1;
		month = (month < 10 ? "0" : "") + month;

		var day = date.getDate();
		day = (day < 10 ? "0" : "") + day;

		return day + "/" + month + "/" + year;
	}

	var stringToDate = function(strDate, hourMin){
		var arrDate = strDate.split("/");

		var hours = 0;
		var min = 0;

		if(hourMin !== undefined){
			var arrHour = hourMin.split(":");
			hours = parseInt(arrHour[0]);
			min = parseInt(arrHour[1]);
		}

		return new Date(parseInt(arrDate[2]), parseInt(arrDate[1])-1, parseInt(arrDate[0]), hours, min, 0, 0);
	}

	var getCurrentDate = function() {
		var date = new Date();

		return dateToString(date);
	}

	var incrDate = function (strDate) {
		var date = stringToDate(strDate);
		date.setDate(date.getDate()+1);
		return dateToString(date);
	}

	var decrDate = function (strDate) {
		var date = stringToDate(strDate);
		date.setDate(date.getDate()-1);
		return dateToString(date);
	}

	var copyJson = function(json){
		var jsonRet = {};
		for (key in json) {
			jsonRet[key] = json[key];
		}

		return jsonRet;
	}

	var isExpiredDate = function(strDate){
		if (typeof strDate !== "string") return false; //Utilitzem -1 per definir l'infinit

		var date = stringToDate(strDate);

		return new Date() > date;
	}

	return {
		getNextHour: getNextHour,
		getPreviousHour: getPreviousHour,
		compareHours: compareHours,
		getCurrentDate: getCurrentDate,
		stringToDate: stringToDate,
		dateToString: dateToString,
		incrDate: incrDate,
		decrDate: decrDate,
		isExpiredDate: isExpiredDate,
		copyJson: copyJson
	}
})();