/**
 * Author: MVS
 * Handle credentials configuration
 */
var CredentialsService = function() {
    var self = this;

    /**
     * Inits the url base host variables for the service.
     */
    self.getUrlBaseHost = function() {
        return AJS.params.baseURL + "/plugins/servlet/credentialservlet";
    };

    /**
     * Get Credential
     */
    self.getCredentials = function() {
        var urlProxyServlet = self.getUrlBaseHost();

        return jQuery.ajax({
            type: "GET",
            url: urlProxyServlet,
            dataType: 'json'
        });
    };

    /**
     * Save the credentials to login cloud insight
     * @param user         user of cloud insight
     * @param url          url end point of cloud insight
     * @param AccessKeyId  access key to authenticate cloud insight
     * @param SecretKey    secret access key
    */
    self.createCredential = function( idCredential, ciUser, ciUrl, ciAccessKeyId, ciSecretKey ) {
        var urlProxyServlet = self.getUrlBaseHost();
        var data = {
            "idCredential": idCredential,
            "ciUser": ciUser,
            "ciUrl": ciUrl,
            "ciAccessKeyId": ciAccessKeyId,
            "ciSecretKey": ciSecretKey
        };
        return jQuery.ajax({
            type: "POST",
            url: urlProxyServlet,
            dataType: 'json',
            data: data
        });
    };

    /**
     * Detele Credential
     * @param id       credential id
     */
    self.deleteCredential = function( id ) {
        var urlProxyServlet = self.getUrlBaseHost();

        var data={
            "id" : id
        };

        return jQuery.ajax({
            type: "DELETE",
            url: urlProxyServlet,
            dataType: 'json',
            data: JSON.stringify( data )
        });
    };

};
/**
 * Creates the service instance.
 */
var credentialsService =  new CredentialsService();