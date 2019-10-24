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
    self.snoozeIncident = function( accountId, payload ) {
        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/iris/v2"
        +"/"+accountId
        +"/incident/snooze";

    	return jQuery.ajax({
            type: "POST",
            url: urlBase,
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            data: JSON.stringify(payload),
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
