
var credentialsController = function () {
	self = this;
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

        test.done( function( data ) {
            ciResponseTest = data;

            AJS.messages.success("#aui-message-bar", {
                title: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.success.connection.title") ,
                fadeout: true,
                body: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.success.connection.body")
            });

            AJS.$('#btnSave').prop( "disabled" , false );
            AJS.$("#btnTest").prop( "disabled", true );
        });

        test.fail( function( jqXHR ) {
            ciResponseTest = '';
            var msg = '';

            switch( jqXHR.status ) {
                case 401:
                    msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.connection.unauthorized.body")
                    break;
                case 400:
                    msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.connection.password_expired.body")
                    msg +="<a href="+AUIUtils.getResetPasswordUrl(url)+">"+AUIUtils.getResetPasswordUrl(url)+"</a>";
                    break;
            };

            AJS.messages.error("#aui-message-bar", {
                title: AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.connection.title"),
                fadeout: true,
                body: msg
            });
        });
    };

    /**
     * Save a configuration
     * @param user        user of cloud insight
     * @param url         url end point of cloud insight
     */
    self.saveConfig = function( user, url){

        ciAIMSService.destroySessionData();

        //generate keys
        var generateAccessKey = ciAIMSService.createAccessKey( url, ciResponseTest.authentication.user.id , ciResponseTest.authentication.account.id, ciResponseTest.authentication.token);

        generateAccessKey.done(function( data ){
            JIRA.Messages.showSuccessMsg(
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.success")
            );

            jiraService.Configuration().save( user, url, data.access_key_id, btoa( data.secret_key) ).
                done( function() {

                        jiraService.AuthProxy()
                        .done(
                            function() {
                                JIRA.Messages.showSuccessMsg(
                                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.save.success")
                                );
                                window.location = window.location.href;
                        })
                        .fail(
                            function( jqXHR ) {
                                JIRA.Messages.showErrorMsg(
                                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.save.errorserver")
                                );
                        });

                        AJS.$('#btnDelete').prop('disabled', false);

                        self.testConectionFromServer();
                    }).
                fail( function() {
                    JIRA.Messages.showSuccessMsg(
                        AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.save.error")
                    );
            });

        });

        generateAccessKey.fail(
            function( jqXHR ) {
                var msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.default");

                switch( jqXHR.status ) {
                    case 400:
                        msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.limit_exceded");
                        break;
                    case 401:
                        msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.unauthorized");
                        break;
                    case 403:
                        msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.forbidden");
                        break;
                    case 404:
                        msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.not_found");
                        break;
                    case 410:
                        msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.gone");
                        break;
                };

                JIRA.Messages.showErrorMsg( msg );
        });
    };

    /**
     * Delete the credential stored
     */
    self.deteleCredential = function() {

        jiraService.Configuration().deleteConf().
        done( function() {
            ciAIMSService.destroySessionData();
            AJS.$('#ciUser').val('');
            AJS.$('#ciPassword').val('');
            AJS.$('#ciUrl').val('');
            AJS.$('#ciAccessKeyId').val('');

            self.activeTestButton();

            JIRA.Messages.showSuccessMsg(
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.delete.success")
            );
            self.testConectionFromServer();

        }).fail( function() {
            JIRA.Messages.showErrorMsg(
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

    /**
     * Shows a confirmation dialog before the deletion of credentials
     */
    self.confirmDeleteCredentials = function() {
        AUIUtils.confirmDialog(
            "confirmDeleteDialogCredentials",
            AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.confirm.remove.credentials"),
            self.deteleCredential );
    };

    /**
     * Adds the credential item to the view.
     * @param {Object} credential The refence to the item
     */
    self.addCredentialToView = function( credential ) {
        var tableBody = AJS.$("#dataTable tbody");
        var action = "pluginConfigurationController.showDetails(" + rule.id + ")" ;

        var rowData = [
            {
                header: "header-select",
                data: "<input type='checkbox' name='rules' class='check-input' value='"
                +credential.id+"' onclick='pluginConfigurationController.validateSelected()'/>"
            },
            {
                header: "header-name",
                data: credential.ciUser,
                style: 'row_pointer',
                action: action
            },
            {
                header: "header-environment",
                data: credential.ciUrl,
                style: 'row_pointer',
                action: action
            },
            {
                header: "header-project",
                data: credential.ciAccessKeyId,
                style: 'row_pointer',
                action: action
            },
            {
                header: "header-edit",
                data: "<a onclick='ruleConfigurationController.editRule("+credential.id+")'>Edit</a>"
            }
        ];

        AUIUtils.createTableRow( tableBody, rowData);
    };

    /**
     * Load all credentials stored
     */
    self.loadCredentials = function() {
        var credentialsAll = credentialsService.getCredentials();

        AUIUtils.clearTable( "#credentialsTable" );

        AUIUtils.invisible("#credentialZeroState");
        AJS.$("#credentialLoading").show();

        credentialsAll.done(function( data ){

            if (data.length <= 0) {
                AUIUtils.visible("#credentialZeroState");
            } else {
                AUIUtils.invisible("#credentialZeroState");
            }

            for(var i = 0 ; i < data.length; i++)
            {
                self.checkRule( data[i] );
                credentials[ data[i].id ]= data[i];
                self.addCredentialToView( data[i] );
            }
        });
    };

    self.loadDialog = function() {
    	AJS.$("#credential-crud-dialog").show();
    	self.loadCredentials();
    }

    /* Events on buttons and fields */
    /* Test conection with cloud insight*/
    AJS.$('#btnTest').click( function() {
        self.testConfig( AJS.$('#ciUser').val(), AJS.$('#ciPassword').val(), AJS.$('#ciUrl').val());
    });
    /* Save the credential */
    AJS.$('#btnSave').click( function() {
        self.saveConfig( AJS.$('#ciUser').val(), AJS.$('#ciUrl').val());
    });
    /* Delete credentials */
    AJS.$( "#btnDelete" ).click( function() {
    	self.confirmDeleteCredentials();
    });
    /* Active test button if the user is typing */
    AJS.$( "#ciUser" ).keyup(function() {
    	self.activeTestButton();
    });

    AJS.$( "#ciPassword" ).keyup(function() {
    	self.activeTestButton();
    });

    AJS.$( "#ciUrlEndPoint" ).keyup(function() {
        self.activeTestButton();
    });

    self.loadDialog();
};
