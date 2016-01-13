/**
 * User plugin configuration page Controller
 */
AJS.$( document ).ready( function() {
    var self = this;

    /**
     * Test if the credentials are correct
     * @param user        user of cloud insight
     * @param password    password of cloud insight
     * @param url         url end point of cloud insight
     */
    self.testCICredentials = function( user, password, url){
        var authorizationHeader = "Basic " + btoa(user + ":" + password);

        return AJS.$.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", authorizationHeader);
            }
        });
    };

    /**
     * Validate if the credentials are correct and call testCICredentials
     * @param user        user of cloud insight
     * @param password    password of cloud insight
     * @param url         url end point of cloud insight
     */
    self.testConfig = function( user, password, url){

        var urlBase = url+"/aims/v1/authenticate";

        //validate empty values
        if(user == "" || password == "" || url == ""){
            JIRA.Messages.showWarningMsg( AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.field.empty") );
            return ;
        }
        //validate url
        if( !AUIUtils.validateUrl( url ) ){
            JIRA.Messages.showWarningMsg( AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.format.url") );
            return ;
        }

        //validate email
        if( !AUIUtils.validateEmail( user ) ){
            JIRA.Messages.showWarningMsg( AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.format.email") );
            return ;
        }

        var test = self.testCICredentials( user, password, urlBase );

        test.done( function() {
            AJS.messages.success("#aui-message-bar", {
                title: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.success.connection.title") ,
                fadeout: true,
                body: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.success.connection.body")
            });

            AJS.$('#btnSave').prop( "disabled" , false );
            AJS.$("#btnTest").prop( "disabled", true );
        });

        test.fail( function() {
            AJS.messages.error("#aui-message-bar", {
                title: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.connection.title"),
                fadeout: true,
                body: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.connection.body")
            });
        });
    };

    /**
     * Save a configuration
     * @param user        user of cloud insight
     * @param password    password of cloud insight
     * @param url         url end point of cloud insight
     */
    self.saveConfig = function( user, password, url){
        jiraService.startService();
        jiraService.Configuration().save( user, password, url ).
        done( function() {

                JIRA.Messages.showSuccessMsg(
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.save.success")
                );

                jiraService.AuthProxy().done(
                    function(data) {
                        window.location = window.location.href;
                    });

                AJS.$('#btnDelete').prop('disabled', false);

            }).
        fail( function() {
                JIRA.Messages.showSuccessMsg(
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.save.error")
                );
            }
        );
    };

    /**
     * Delete the configuration stored
     */
    self.detele = function() {
        jiraService.startService();
        jiraService.Configuration().deleteConf().
        done( function() {
                ciAIMSService.destroySessionData();
                AJS.$('#ciUser').val('');
                AJS.$('#ciPassword').val('');
                AJS.$('#ciUrl').val('');

                self.activeTestButton();

                JIRA.Messages.showSuccessMsg(
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.delete.success")
                );
        }).fail( function() {
            JIRA.Messages.showSuccessMsg(
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.delete.error")
            );
        });
    };

    /**
     * Enable the test button and disable the others
     */
    self.activeTestButton = function(){
        AJS.$('#btnSave').prop( "disabled" , true );
        AJS.$('#btnDelete').prop( "disabled" , true );
        AJS.$("#btnTest").prop( "disabled", false );
    };

    /* Events on buttons and fields */
    /* Test conection with cloud insight*/
    Bootstrap.onView('#btnTest', function(){
        AJS.$('#btnTest').click( function() {
            self.testConfig( AJS.$('#ciUser').val(), AJS.$('#ciPassword').val(), AJS.$('#ciUrl').val());
        });
    });

    /* Save the credential*/
    Bootstrap.onView('#btnSave', function(){
        AJS.$('#btnSave').click( function() {
            self.saveConfig( AJS.$('#ciUser').val(), btoa( AJS.$('#ciPassword').val() ), AJS.$('#ciUrl').val());
        });
    });

    /* Delete credentials */
    Bootstrap.onView('#btnDelete', function(){
        AJS.$('#btnDelete').click( function() {
            self.detele();
        });
    });

    Bootstrap.onView("#ciUser", function(){
        AJS.$( "#ciUser" ).keyup(function() {
            self.activeTestButton();
        });
    });

    Bootstrap.onView("#ciPassword", function(){
        AJS.$( "#ciPassword" ).keyup(function() {
            self.activeTestButton();
        });
    });

    Bootstrap.onView("#ciUrlEndPoint", function(){
        AJS.$( "#ciUrlEndPoint" ).keyup(function() {
            self.activeTestButton();
        });
    });
});
