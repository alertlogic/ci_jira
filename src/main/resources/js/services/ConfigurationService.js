/**
 * Global setup
 */
//Disable adding the timestamp param for the ajax calls.
AJS.$.ajaxSetup({'cache':true});
/**
 * Store basic information for th
 * e connection to the API
 */
var ConfigurationService = function() {
    var self = this;

    self.serviceVersion = "v1";
    self.timeRefresh = 20000;//millisecond
    self.timeWait = 20000;//millisecond

};
/**
 * Creates the service instance.
 */
var configService =  new ConfigurationService();