/**
 * Related operation to the incidents service CI API.
 */
var IrisService = function() {
    var self = this;

    /**
     * Snooze an incidents
     *  @param incidentID
     *  @param payload
     */
    self.snoozeIncident = function(
                           payload
                           ) {
        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/iris/v2"
        +"/"+ciAIMSService.getSessionData().accountId
        +"/incident/snooze";

    	return jQuery.ajax({
            type: "POST",
            url: urlBase,
            dataType: 'json',
            data: payload,
            headers: {
            	"x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    }

};
/**
 * Creates the service instance.
 */
var irisService =  new IrisService();
