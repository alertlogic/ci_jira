/**
 * Related operation to the environment service CI API.
 */
var EnvironmentsService = function() {
    var self = this;

    /**
     * Get´s all the environments for the user.
     * @param  {Function} callback The callback function
     * 
     */
    self.listEnvironments =  function(callback,callbackError) {

    	var urlBase = ciAIMSService.getSessionData().endpoint
    	+"/sources/"+configService.serviceVersion
    	+"/"+ciAIMSService.getSessionData().accountId
    	+"/sources?source.config.aws.defender_support=!true&source.config.azure.defender_support=!true&source.config.datacenter.defender_support=!true&source.type=environment&source.config.collection_type=aws,azure,datacenter&source.config.collection_method=api";

        AJS.$.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
            	"x-aims-auth-token":ciAIMSService.getSessionData().token
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("x-aims-auth-token",ciAIMSService.getSessionData().token);
            }
        }).done(function(response) {
            var activeEnvironmentsArray = [];
            for ( var i = 0; i < response.sources.length; i++ ) {
                var source = response.sources[i].source;
                if ( source.enabled && source.product_type === 'outcomes' && source.type === 'environment' ) {
                    activeEnvironmentsArray.push(source);
                }
            }
            callback(activeEnvironmentsArray);

        }).fail(function(jqXHR, textStatus) {

            if(callbackError){
                callbackError(jqXHR, textStatus);
            }
        });

    };
};
/**
 * Creates the service instance.
 */
var environmentsService =  new EnvironmentsService();
