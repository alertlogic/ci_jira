/**
 * Related operation to the remediations service CI API.
 */
var RemediationsService = function() {
    var self = this;

    /**
     * Get all the remediations for a specific environment.
     * CI return  remediations and the filters
     */
    self.getAllRemediationsByEnvironment =  function( environment ) {

    	var urlBase = ciAIMSService.getSessionData().endpoint
    	+"/assets/"+configService.serviceVersion
    	+"/"+ciAIMSService.getSessionData().accountId
    	+"/environments/"+environment+"remediations?scope=true";

    	return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
            	"x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Get all the remediations for a specific environment.
     * CI return  remediations and the filters
     */
    self.getAllRemediations = function( environment, filters ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment
        +"/remediations";


        if (filters) {
            if (filters.length > 0) {

                //TODO: Could be Improve in a fancy way :)
                var filterStringParams = "?";
                for (var i = 0; i < filters.length; i++){
                    if( i != 0 )
                    {
                        filterStringParams +="&";
                    }
                    filterStringParams += "filter="+filters[i].replace(/\//g,"%2F");
                }

                filterStringParams += "&scope=true";

                urlBase += filterStringParams;
            }
        }

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Gets the data for a remediation ID.
     * @param  {String} remediationId The remediation id.
     */
    self.getRemediationById = function( remediationId ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/remediation/"+configService.serviceVersion
        +"/"+remediationId;

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Gets the data for somes remediation by IDs.
     * @param  {String} remediationIds The remediation id separated by comma (,).
     */
    self.getRemediationsByIds = function( remediationIds ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        + "/remediation/" + configService.serviceVersion
        + "?remediation_ids=" + remediationIds;

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };


    /**
     * Get all the remediations items
     * @param  {String} environment The environment to query
     */
    self.getAllRemediationsItemsByEnvironment =  function( environment ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment
        +"/assets?asset_types=remediation-item&reduce=true&remediation-item.deleted_on=0";

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Dispose a remediation
     * @param  {String} remediation item
     */
    self.disposeRemediation =  function( environment, remediationItem, reason, expires, comment ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment+"/assets";

        var array = [ ];
        array[0]=remediationItem;

        var payload = {
            "operation": "dispose_remediations",
            "remediation_items": array,
            "reason": reason,
            "expires": expires,
            "comment": comment
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlBase,
            dataType: 'json',
            data: JSON.stringify(payload),
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Plan a set of remediations
     */
    self.planRemediations =  function( environment, remediationsKeys, filters ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment+"/assets";

        var payload = {
            "operation": "plan_remediations",
            "remediations": remediationsKeys,
            "filters": filters,
            "user_id": ciAIMSService.getSessionData().userId
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlBase,
            dataType: 'json',
            data: JSON.stringify(payload),
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Remove a remediation of my plan
     */
    self.removeFromMyPlan =  function( environment, remediationItemKey ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment+"/assets";

        var payload = {
            "key": remediationItemKey,
            "operation": "remove_asset",
            "scope": "config",
            "type": "remediation-item"
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlBase,
            dataType: 'json',
            data: JSON.stringify(payload),
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Get a environment from a remedaition item
     * @param  {String} remediation item
     */
    self.getEnvironmentFromRemediationItem = function( remediationItem ){
        if( remediationItem != null && remediationItem.indexOf("/") != -1 && remediationItem.indexOf(":") != -1 ){
            return (remediationItem.split("/")[2].split(":"))[1];
        }
        return null;
    };

    /**
     * Get vulnerabilities and assets the remediation for a specific environment and remediation id.
     * CI return remediation and the filters
     */
    self.getVulnerabilityAndAssetsByRemediationId = function( environment, remediationId ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment
        +"/remediations?key="+remediationId
        +"&scope=true";

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Get the remediations items
     * @param  {String} environment The environment to query
     * @param  {String} remediation_item
     */
    self.getFiltersByRemediationItem =  function( environment , remediation_item) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment
        +"/assets?asset_types=remediation-item&remediation-item.key="+remediation_item+"";

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Get vulnerabilities and assets the remediation for a specific environment and remediation id.
     * CI return remediation and the filters
     */
    self.getVulnerabilityDetailsByRemediationId = function( remediationId ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/vulnerability/"+configService.serviceVersion
        +"?remediation_ids="+remediationId;

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

    /**
     * Get vulnerability details
     */
    self.getVulnerabilityDetails = function( vulnerabilityId ) {
        var urlBase = ciAIMSService.getSessionData().endpoint
            +"/vulnerability/"+configService.serviceVersion
            +"//"+vulnerabilityId;
        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            async: false,
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

};
/**
 * Creates the service instance.
 */
var remediationsService =  new RemediationsService();
