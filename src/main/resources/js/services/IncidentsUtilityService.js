/**
 * Related operation to the remediations service CI API.
 */
var IncidentsUtilityService = function() {
    var self = this;

    self.incidentsFilters = [
        {
            "key": "Critical",
            "name" : "Critical",
            "class_style": "risk-critical"
        },
        {
            "key": "High",
            "name" : "High",
            "class_style": "risk-high"
        },
        {
            "key": "Medium",
            "name" : "Medium",
            "class_style": "risk-medium"
        },
        {
            "key": "Low",
            "name" : "Low",
            "class_style": "risk-low"
        },
        {
            "key": "Info",
            "name" : "Info",
            "class_style": "risk-info"
        }
    ]
};
/**
 * Creates the service instance.
 */
var incidentsUtilityService =  new IncidentsUtilityService();