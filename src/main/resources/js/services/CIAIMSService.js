/**
 * Perform the conections to the CI API.
 */
var CIAIMSService = function() {
    var self = this;

    /**
     * Saves the session data into the local storage.
     * @param  {Object} data The session data
     */
    self.saveSessionData = function( data , user ) {
        storageService.storeKey("ci-session-token",data.authentication.token);
        storageService.storeKey("ci-session-expiration",data.authentication.token_expiration);
        storageService.storeKey("ci-account-id",data.authentication.account.id);
        storageService.storeKey("ci-user-id",data.authentication.user.id);
        storageService.storeKey("ci-endpoint",data.endpoint);
        storageService.storeKey("jira-user",user);
    };

    /**
     * Destroys the saved session data.
     */
    self.destroySessionData = function() {
        storageService.removeKey("ci-session-token");
        storageService.removeKey("ci-session-expiration");
        storageService.removeKey("ci-account-id");
        storageService.removeKey("ci-user-id");
        storageService.removeKey("ci-endpoint");
        storageService.removeKey("jira-user");
        storageService.removeKey("field-remediation-item");
        storageService.removeKey("field-remediation-id");
        storageService.removeKey("field-group");
    };

    /**
     * Checks if the user is already logged in CI,
     * and destroy the current token if has expired.
     * @return {Boolean} Return true if the user has a valid CI token.
     */
    self.isLoggedIn = function() {

        if (self.getSessionData().expiration) {
            var currentDate = new Date();
            var expirationTime = new Date(self.getSessionData().expiration * 1000);
            if (expirationTime < currentDate) {
                self.destroySessionData();
                return false;
            }
            return true;
        }
        return false;
    };

    /**
     * Retrieves the current session data.
     */
    self.getSessionData = function() {
        return {
            token :     storageService.getKey("ci-session-token"),
            accountId:  storageService.getKey("ci-account-id"),
            userId:     storageService.getKey("ci-user-id"),
            expiration: storageService.getKey("ci-session-expiration"),
            endpoint:   storageService.getKey("ci-endpoint"),
            jiraUser:      storageService.getKey("ci-email")
        };
    };

    /**
     * Create an access key
     */
    self.createAccessKey = function( urlEndPoint, userId, accountId, token){

        var urlBase = urlEndPoint
        +"/aims/" + configService.serviceVersion
        +"/" + accountId
        +"/users/" + userId
        +"/access_keys";

        return AJS.$.ajax({
            type: "POST",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token":token
            }
        });
    };

    /**
     * Delete an access key
     */
    self.deleteAccessKey = function( urlEndPoint, userId, accountId, token, accessKeyId ){

        var urlBase = urlEndPoint
        +"/aims/" + configService.serviceVersion
        +"/" + accountId
        +"/users/" + userId
        +"/access_keys/" + accessKeyId;

        return AJS.$.ajax({
            type: "DELETE",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token": token
            }
        });
    };

    /**
     * Get access keys
     */
    self.getAccessKeys = function( urlEndPoint, userId, accountId, token ){

        var urlBase =  urlEndPoint
        +"/aims/" + configService.serviceVersion
        +"/" + accountId
        +"/users/" + userId
        +"/access_keys";

        return AJS.$.ajax({
            type: "GET",
            url: urlBase,
            dataType: 'json',
            headers: {
                "x-aims-auth-token": token
            }
        });
    };

    /**
     * Checks if the user that we have in the localstorage
     * is the same user that is login
     * @return {Boolean} Return true if the user is valid.
     */
    self.isSameUser = function( user ) {

        if (self.getSessionData().jiraUser == user) {
            return true;
        }
        return false;
    };

};
/**
 * Creates the service instance.
 */
var ciAIMSService =  new CIAIMSService();
