/**
 * Boostraping service for plugin pages controllers
 */
var BootstrapService = function() {
    var self = this;

    /**
     * Helps the startup of services, add
     * the function of the service that you want
     * to startup here.
     */
    self.initServices = function () {
        jiraService.startService();
    };

    /**
     * Starts a controller received by parameter,
     * verifiying that the user has already logged in
     * into CI.
     */
    self.start = function( currentUser, controller ) {
        self.initServices();
        if( !ciAIMSService.isSameUser( currentUser ) || !ciAIMSService.isLoggedIn() ) {

            jiraService.AuthProxy( currentUser ).done(function(data) {
                ciAIMSService.saveSessionData( data, currentUser);
                controller();
            }).fail(function(jqXHR, textStatus) {

                /* Hide Content no config present or login failed. */
                self.onView(".content-container",function(){
                    AJS.$(".content-container").hide();
                });

                var msg = '';

                switch( jqXHR.status ) {
                case 412:
                    msg = AJS.I18n.getText("ci.atlassianplugin.boostrap.msg.noconfig");
                    break;
                case 502:
                    msg = 'Error ('+jqXHR.status+'):' + AJS.I18n.getText("ci.atlassianplugin.boostrap.msg.connectionerror");
                    break;
                case 401:
                    msg = 'Error ('+jqXHR.status+'):'+ AJS.I18n.getText("ci.atlassianplugin.boostrap.msg.autherror");
                    break;
                }
                JIRA.Messages.showWarningMsg( msg );
            });

        } else {
            controller();
        }

    };

    /**
     * If the element selector is visible then executes
     * the callback function passed in execute param.
     * @param  {String} selector The selector to verify
     * @param  {Function} execute  The callbackFunction
     */
    self.onView = function(selector, execute) {
        if (AJS.$( selector ).is(':visible')) {
            if (execute) {
                execute();
            }
        }
    }
};
/**
 * Creates the service instance.
 */
var Bootstrap =  new BootstrapService();