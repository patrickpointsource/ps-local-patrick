var SmtpHelper = {

    getOutOfOfficeRequestMessage: function (userName, personName, requestType, startDate, endDate, description) {
        var result = '';

        var requested = ( requestType == "Vacation" || requestType == "Conference/Training" ) ? "requested" : "logged";
        var requestTypeLabel = ( requestType == "Vacation" ) ? requestType + "days" : requestType;
        var actionNeeded = ( requestType == "Customer Travel" ) ? "none" : "Review and approve or deny";

        var result =
            userName + ",<br/>" +
            "<br/>" +
            personName + " has " + requested + " " + requestTypeLabel + "<br/>" +
            "<br/>" +
            "Further action needed: " + actionNeeded + "<br/>" +
            "<br/>" +
            "Type of request : " + requestType + "<br/>" +
            "From : " + startDate + "<br/>" +
            "Until : " + endDate + "<br/>" +
            "Person : " + personName + "<br/>" +
            "Description : " + description + "<br/>" +
            "<br/>" +
            "Please log on to Mastermind for details by visiting the URL below." + "<br/>" +
            "https://mastermind.pointsource.com" + "<br/>";

        return result;
    }

};
