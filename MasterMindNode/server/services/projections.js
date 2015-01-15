/**
 *  Projections calculations
 */

var moment = require('moment');
var reportCalculations = require( '../services/reportCalculations.js' );

var PREVIOUS_MONTH = 'previousMonth';
var CURRENT_MONTH = 'currentMonth';
var PROJECTION_MONTHS = 3;
var PROJECTION_MONTH_LABELS = [CURRENT_MONTH, 'secondMonth', 'thirdMonth', 'fourthMonth', 
                               'fifthMonth', 'sixthMonth', 'seventhMonth', 'eighthMonth', 'ninthMonth'];

var getProjectionUtilization = function (data, capacity, hoursStatistics, assignmentsStatistics, dateRange) {
	var utilization = {};
	utilization[PROJECTION_MONTH_LABELS[0]] = {
		name : getMonthByDateRange(dateRange).format('MMMM'),
		actual : Math.round( ( (hoursStatistics.allHours + hoursStatistics.outOfOffice + hoursStatistics.overhead) / capacity) * 100 ),
		projected : Math.round( ( (assignmentsStatistics.allHours + hoursStatistics.outOfOffice + hoursStatistics.overhead) / capacity) * 100 )
	}
	var futureProjectionUtilizations = getFutureProjectionUtilizations(data, capacity, hoursStatistics, dateRange);
	for ( var i in futureProjectionUtilizations ) {
		utilization[PROJECTION_MONTH_LABELS[parseInt(i) + 1]] = futureProjectionUtilizations[i];
	}
	return utilization;
}

var getFutureProjectionUtilizations = function (data, capacity, hoursStatistics, dateRange) {
	var startDate = getMonthByDateRange(dateRange).startOf('month');
	var endDate = getMonthByDateRange(dateRange).endOf('month');
	var utilizations = [];
	var  i = 1; // first month is current
	while (i < PROJECTION_MONTHS) {
		startDate = startDate.add(1, 'months');
		endDate = endDate.add(1, 'months');
		utilizations.push(getFutureProjectionUtilizationByDate(data, capacity, hoursStatistics, startDate, endDate));
	    i++;
	}
	return utilizations;
}

var getFutureProjectionUtilizationByDate = function (data, capacity, hoursStatistics, startDate, endDate) {
	var assignmentsStatistics = reportCalculations.getAssignmentsStatistics(data, startDate, endDate);
	var projected = Math.round( ( (assignmentsStatistics.allHours + hoursStatistics.outOfOffice + hoursStatistics.overhead) / capacity) * 100 );
	var utilization = {
		name : startDate.format('MMMM'),
		projected : projected
	}
	return utilization;
}

var getProjectionHoursByType = function (data, type, hoursStatistics, assignmentsStatistics, dateRange ) {
	var actual = 0;
	var projected = 0;
	switch (type) {
		case 'client' :
			actual = hoursStatistics.actualClientHours;
			projected = assignmentsStatistics.projectedClientHours;
			break;
		case 'invest' :
			actual = hoursStatistics.actualInvestHours;
			projected = assignmentsStatistics.projectedInvestHours;
			break;
		case 'total' :
			actual = hoursStatistics.actualClientHours + hoursStatistics.actualInvestHours;
			projected = assignmentsStatistics.projectedClientHours + assignmentsStatistics.projectedInvestHours;
			break;
	}
	var hours = {};
	hours[PROJECTION_MONTH_LABELS[0]] = {
		name : getMonthByDateRange(dateRange).format('MMMM'),
		actual : actual,
		projected : projected
	}

	var futureProjectionHours = getFutureProjectionHours(data, type, dateRange);
	for ( var i in futureProjectionHours ) {
		hours[PROJECTION_MONTH_LABELS[parseInt(i) + 1]] = futureProjectionHours[i];
	}
	return hours;
}

var getMonthByDateRange = function(dateRange) {
	var reportMonth;
	switch(dateRange) {
		case PREVIOUS_MONTH :
		// should be current month even when data range "previous month" is used
		reportMonth = moment();
		break;
		case CURRENT_MONTH :
		reportMonth = moment();
		break;
	}
	return reportMonth;
}

var getFutureProjectionHours = function (data, type, dateRange) {
	var startDate = getMonthByDateRange(dateRange).startOf('month');
	var endDate = getMonthByDateRange(dateRange).endOf('month');
	var projections = [];
	var  i = 1; // first month is current 
	while (i < PROJECTION_MONTHS) {
		startDate = startDate.add(1, 'months');
		endDate = endDate.add(1, 'months');
		projections.push(getFutureProjectionHoursByTypeAndDate(data, type, startDate, endDate));
	    i++;
	}
	return projections;
}

var getFutureProjectionHoursByTypeAndDate = function (data, type, startDate, endDate) {
	var projected = 0;
	var assignmentsStatistics = reportCalculations.getAssignmentsStatistics(data, startDate, endDate);
	switch (type) {
		case 'client' :
			projected = assignmentsStatistics.projectedClientHours;
			break;
		case 'invest' :
			projected = assignmentsStatistics.projectedInvestHours;
			break;
		case 'total' :
			projected = assignmentsStatistics.projectedClientHours + assignmentsStatistics.projectedInvestHours;
			break;
	}
	var projection = {
		name : startDate.format('MMMM'),
		projected : projected
	}
	return projection;
}

var getProjections = function(data, params) {
	var startDate = getMonthByDateRange(params.dateRange).startOf('month');
	var endDate = getMonthByDateRange(params.dateRange).endOf('month');

	var capacity = reportCalculations.calculateCapacity(data, startDate, endDate);
	var hoursStatistics = reportCalculations.getHoursStatistics(data);
	var assignmentsStatistics = reportCalculations.getAssignmentsStatistics(data, startDate, endDate);

	var projections = {
		capacity : capacity,
		totalHours :  getProjectionHoursByType(data, 'total', hoursStatistics, assignmentsStatistics, params.dateRange),
		utilization :  getProjectionUtilization(data, capacity, hoursStatistics, assignmentsStatistics, params.dateRange)
	}

	var fields = params.fields;
	
	if (fields.all || (fields.projections && fields.projections.clientHrs)) {
		projections.clientHours = getProjectionHoursByType(data, 'client', hoursStatistics, assignmentsStatistics, params.dateRange);
	}
	if (fields.all || (fields.projections && fields.projections.investHrs)) {
		projections.investHours = getProjectionHoursByType(data, 'invest', hoursStatistics, assignmentsStatistics, params.dateRange);
	}
	if (fields.all || (fields.projections && fields.projections.outOfOffice)) {
		projections.outOfOffice = hoursStatistics.outOfOffice;
	}
	if (fields.all || (fields.projections && fields.projections.overhead)) {
		projections.overhead = hoursStatistics.overhead;
	}

	return projections;
};

module.exports.PREVIOUS_MONTH = PREVIOUS_MONTH;
module.exports.CURRENT_MONTH = CURRENT_MONTH;
module.exports.getProjections = getProjections;


