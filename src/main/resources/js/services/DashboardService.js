/**
 * Related operation to the dashboard service CI API.
 */
var DashboardService = function() {
    var self = this;

    self.getItemList =  function( environmentID ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/dashboards/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environmentID
        +"/dashboard_items?type=remeditation_filters";

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("x-aims-auth-token",ciAIMSService.getSessionData().token);
            }
        });

    };
};
/**
 * Creates the service instance.
 */
var dashboardService =  new DashboardService();