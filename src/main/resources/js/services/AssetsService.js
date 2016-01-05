/**
 * Related operation to the assets service CI API.
 */
var AssetsService = function() {
    var self = this;

    /**
     * Get assets by type and key
     * @param  {String} environment The environment to query
     * @param  {String} assets type
     * @param  {String} asset key
     */
    self.byType =  function( environment, assetType, optionalKeys ) {

        var urlBase = ciAIMSService.getSessionData().endpoint
        +"/assets/"+configService.serviceVersion
        +"/"+ciAIMSService.getSessionData().accountId
        +"/environments/"+environment
        +"/assets";

        var params = {
            'asset_types': assetType,
            'reduce': true
        };

        if(optionalKeys != undefined){
            params[assetType+".key"]=optionalKeys;
        }

        return jQuery.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            data: params,
            headers: {
                "x-aims-auth-token":ciAIMSService.getSessionData().token
            }
        });
    };

};
/**
 * Creates the service instance.
 */
var assetsService =  new AssetsService();
