/**
 * User plugin configuration page Controller
 */
var pluginConfigurationController;

AJS.$( document ).ready( function() {
    var self = pluginConfigurationController = this;
    jiraService.startService();

    var ciResponseTest = '';

    var credentials = {};
    var config = {};
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
    self.testCredential = function( user, password, url){

        var urlBase = url+"/aims/v1/authenticate";

        //validate empty values
        if(user == "" || password == "" || url == ""){
            AUIUtils.showMsgError( '#aui-message-bar', AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.field.empty") );
            return ;
        }
        //validate url
        if( !AUIUtils.validateUrl( url ) ){
            AUIUtils.showMsgError( '#aui-message-bar', AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.format.url") );
            return ;
        }

        //validate email
        if( !AUIUtils.validateEmail( user ) ){
            AUIUtils.showMsgError( '#aui-message-bar', AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.error.format.email") );
            return ;
        }

        var test = self.testCICredentials( user, password, urlBase );

        test.done( function( data ) {
            ciResponseTest = data;
            AUIUtils.showMsgSuccess( '#aui-message-bar', AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.validation.success.connection.body") );

            AJS.$('#btnCredentialSave').prop( "disabled" , false );
            AJS.$("#btnCredentialTest").prop( "disabled", true );
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

            AUIUtils.showMsgError( '#aui-message-bar', msg );
        });
    };

    /**
     * Save a credential
     * @param idCredential  id credential
     * @param user          user of cloud insight
     * @param url           url end point of cloud insight
     */
    self.saveCredential = function( idCredential, user, url){
        var credentialsAll = credentialsService.getCredentials();

        credentialsAll.done( function( dataCredential ){
            var isNewCredential = true;

            //review if exists a credential with the same user
            for(var i = 0 ; i < dataCredential.length; i++)
            {
                if( dataCredential[ i ].ciUser == user ) {
                    isNewCredential = false;
                    AUIUtils.showMsgError(
                        '#aui-message-bar',
                        AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.save.exists.error")
                    );
                }
            }

            if( isNewCredential ){

                //generate keys
                var generateAccessKey = ciAIMSService.createAccessKey( url, ciResponseTest.authentication.user.id , ciResponseTest.authentication.account.id, ciResponseTest.authentication.token);

                generateAccessKey.done(function( data ){
                    AUIUtils.showMsgSuccess(
                        '#aui-message-bar',
                        AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.success")
                    );

                    credentialsService.createCredential( idCredential, user, url, data.access_key_id, btoa( data.secret_key) ).
                        done( function() {
                                AJS.$('#btnCredentialDelete').prop('disabled', false);
                                self.loadCredentials();
                                self.testConectionFromServer();

                                AUIUtils.showMsgSuccess(
                                    '#aui-message-bar',
                                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.save.success")
                                );
                            }).
                        fail( function() {
                            AUIUtils.showMsgError(
                                '#aui-message-bar',
                                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.save.error")
                            );
                    });

                });

                generateAccessKey.fail(function( jqXHR ) {
                    var msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.default");

                    switch( jqXHR.status ) {
                        case 400:
                            msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.error.limit_exceded");
                            self.loadAccessKeys( url, ciResponseTest.authentication.user.id , ciResponseTest.authentication.account.id, ciResponseTest.authentication.token );
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

                    AUIUtils.showMsgError( '#aui-message-bar', msg );
                });
            }
        });
    };

    /**
     * Delete the credential stored
     */
    self.deteleCredential = function() {
        var id = AJS.$('#idCredential').val();

        credentialsService.deleteCredential( id ).
        done( function() {
            self.activeTestButton();

            AUIUtils.showMsgSuccess(
                '#aui-message-bar',
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.delete.success")
            );
            self.loadCredentials();
            self.loadConfig();

        }).fail( function(jqXHR) {
            var msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.delete.request");

            switch( jqXHR.status ) {
                case 400:
                    msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.delete.error.request");
                    break;
                case 412:
                    msg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.credential.delete.error.precondition");
                    break;
            };

            AUIUtils.showMsgError( '#aui-message-bar', msg );
        });
    };

    /**
     * Enable the test button and disable the others
     */
    self.activeTestButton = function(){
        AJS.$('#btnCredentialSave').prop( "disabled" , true );
        AJS.$('#btnCredentialDelete').prop( "disabled" , true );
        self.testEnable( AJS.$('#ciUser').val(), AJS.$('#ciPassword').val(), AJS.$('#ciUrl').val());
    };

    /**
     * Load the credential cliked on the form
     * @param  credential id
     */
    self.loadCredentialInForm = function( id ){
        AJS.$('#idCredential').val( credentials[ id ].id );
        AJS.$('#ciUser').val( credentials[ id ].ciUser );
        AJS.$('#ciPassword').val( '' );
        AJS.$('#ciUrl' ).select2().select2('val', credentials[ id ].ciUrl);
        AJS.$('#ciAccessKeyId').val( credentials[ id ].ciAccessKeyId );
        AJS.$('#btnCredentialDelete').prop( "disabled" , false );
        AJS.$('#btnCredentialCancel').prop( "disabled" , false );
        AJS.$('#configformTitle').html( AJS.I18n.getText("ci.partials.pluginconfiguration.js.form.title.update.credential") );
        AUIUtils.clearTable( "#accessKeyTable", true );
    };

    /**
     * Adds the credential item to the view.
     * @param {Object} credential The refence to the item
     */
    self.addCredentialToView = function( credential ) {
        var tableBody = AJS.$("#credentialsTable tbody");
        var action = "pluginConfigurationController.loadCredentialInForm(" + credential.id + ")" ;

        var rowData = [
            {
                header: "header-ci-user",
                data: credential.ciUser,
                style: 'row_pointer',
                action: action
            },
            {
                header: "header-ci-url",
                data: credential.ciUrl,
                style: 'row_pointer',
                action: action
            }
        ];

        AUIUtils.createTableRow( tableBody, rowData);
    };

    /**
     * Clean the credentials form and set the title in adding
     */
    self.resetCredentialForm = function(){
        AJS.$('#idCredential').val('');
        AJS.$('#ciUser').val('');
        AJS.$('#ciPassword').val('');
        AJS.$('#ciUrl').select2().select2('val', '');
        AJS.$('#ciAccessKeyId').val('');
        AJS.$('#btnCredentialCancel').prop( "disabled" , true );
        AJS.$('#btnCredentialSave').prop( "disabled" , true );
        AJS.$('#btnCredentialDelete').prop( "disabled" , true );
        AJS.$('#configformTitle').html( AJS.I18n.getText("ci.partials.pluginconfiguration.js.form.title.add.credential") );
    };

    /**
     * Load all credentials stored
     */
    self.loadCredentials = function() {
        var credentialsAll = credentialsService.getCredentials();

        AUIUtils.clearTable( "#credentialsTable" );
        AUIUtils.invisible( "#credentialZeroState" );
        AJS.$( "#credentialLoading" ).show();

        self.resetCredentialForm();

        credentialsAll.done(function( data ){

            if (data.length <= 0) {
                AUIUtils.visible( "#credentialZeroState" );
            } else {
                AUIUtils.invisible( "#credentialZeroState" );
            }

            for(var i = 0 ; i < data.length; i++)
            {
                credentials[ data[i].id ] =  data[i];
                self.addCredentialToView( data[i] );
            }
        });
    };

    /**
     * Refresh the credentials list and show a dialog
     */
    self.loadCredentialDialog = function() {
        AJS.dialog2("#credential-crud-dialog").show();
        self.loadCredentials();
    };

    /**
     * Delete access key
     * @param {Object} access key
     */
    self.deleteAccessKey= function( accessKey ) {
        ciAIMSService.deleteAccessKey( AJS.$('#ciUrl').val(), ciResponseTest.authentication.user.id , ciResponseTest.authentication.account.id, ciResponseTest.authentication.token, accessKey )
        .done( function() {

            AUIUtils.showMsgSuccess(
                '#aui-message-bar',
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.delete.success")
            );
            self.loadAccessKeys( AJS.$('#ciUrl').val(), ciResponseTest.authentication.user.id , ciResponseTest.authentication.account.id, ciResponseTest.authentication.token );

        }).fail( function(jqXHR) {
            AUIUtils.showMsgError(
                '#aui-message-bar',
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.accesskey.delete.error")
            );
        });
    };

    /**
     * Adds the key item to the view.
     * @param {Object} access key
     */
    self.addAccessKeyToView = function( accessKey ) {
        var tableBody = AJS.$("#accessKeyTable tbody");
        var action = "pluginConfigurationController.deleteAccessKey('" + accessKey + "')" ;

        var rowData = [
            {
                data: accessKey
            },
            {
                data: "X",
                style: 'row_pointer',
                action: action
            }
        ];

        AUIUtils.createTableRow( tableBody, rowData);
    };

    /**
     * Load the access keys
     * @param {string} url
     * @param {string} user_id
     * @param {string} account_id
     * @param {string} token
     */
    self.loadAccessKeys = function( url, user_id, account_id, token ) {
        var accessKeysAll = ciAIMSService.getAccessKeys( url, user_id, account_id, token );

        AUIUtils.clearTable( "#accessKeyTable" , true);

        accessKeysAll.done(function( data ){
            var headerElement = AJS.$("#accessKeyTable thead tr");
            AUIUtils.addTableHeader( headerElement, '', AJS.I18n.getText("ci.partials.pluginconfiguration.js.table.accesskey.header.accesskey"), '');
            AUIUtils.addTableHeader( headerElement, '', AJS.I18n.getText("ci.partials.pluginconfiguration.js.table.accesskey.header.action"), '');

            for(var i = 0 ; i < data.access_keys.length; i++)
            {
                self.addAccessKeyToView( data.access_keys[i] );
            }
        });
    };

    /**
     * Validate if the btnCredentialTest button is enabled.
     * @param user        user of cloud insight
     * @param password    password of cloud insight
     * @param url         url end point of cloud insight
     */
	self.testEnable = function( user, password, url){
		if (user !== '' &&  password !== '' && url !== '') {
			AJS.$('#btnCredentialTest').prop( "disabled" , false );
		} else {
			AJS.$('#btnCredentialTest').prop( "disabled" , true );
		}
	}

    /* Events on buttons and fields */
    /* Test conection with cloud insight*/
    AJS.$('#btnCredentialTest').click( function() {
        self.testCredential( AJS.$('#ciUser').val(), AJS.$('#ciPassword').val(), AJS.$('#ciUrl').val());
    });
    /* Save the credential */
    AJS.$('#btnCredentialSave').click( function() {
        if(  AJS.$('#ciUser').val() !== '' && AJS.$('#ciUrl').val() !== '' ){
            self.saveCredential( AJS.$('#idCredential').val(), AJS.$('#ciUser').val(), AJS.$('#ciUrl').val());
        }
    });
    /* Delete credentials */
    AJS.$( "#btnCredentialDelete" ).click( function() {
        self.deteleCredential();
    });
    /* Save the credential */
    AJS.$('#btnCredentialCancel').click( function() {
        self.resetCredentialForm();
    });
    /* Active test button if the user is typing */
    AJS.$( "#ciUser" ).keyup(function() {
        self.activeTestButton();
    });

    AJS.$( "#ciPassword" ).keyup(function() {
        self.activeTestButton();
    });

    AJS.$( "#ciUrl" ).click(function() {
        self.activeTestButton();
    });
    /* Open the dialog */
    AJS.$( "#btnCredential" ).click( function() {
        self.loadCredentialDialog();
    });
    /* Reload the credentials list in the configuration*/
    AJS.$( "#btnCredentialClose" ).click( function() {
        AJS.dialog2("#credential-crud-dialog").hide();
        self.loadConfig();
    });

    /** Credential configured for the current user **/

    /**
     * Test to connect using the servlet,
     * in order to test that the server has a way to connect with the CI api.
     */
    self.testConectionFromServer = function() {
        var currentUser = AJS.Meta.get('remote-user');
        var promise = jiraService.AuthProxy( currentUser );
        var element = AJS.$( '#conectionStatus' );

        element.html( AJS.I18n.getText("ci.partials.pluginconfiguration.js.conecction.status.checking") );
        element.removeClass('aui-lozenge-success aui-lozenge-error');

        promise.done( function() {
            element.html('Success');
            element.addClass('aui-lozenge-success');
        });

        promise.fail( function( jqXHR, textStatus, errorThrown ) {

            switch( jqXHR.status ) {
                case 412:
                    element.html( AJS.I18n.getText("ci.partials.pluginconfiguration.js.conecction.status.not.verified") );
                    element.addClass('aui-lozenge');
                    break;
                case 502:
                    element.html( AJS.I18n.getText('ci.partials.pluginconfiguration.js.conecction.status.error.connection') );
                    element.addClass('aui-lozenge-error');
                    break;
                case 401:
                    element.html( AJS.I18n.getText('ci.partials.pluginconfiguration.js.conecction.status.error.authentication') );
                    element.addClass('aui-lozenge-error');
                    break;
            }
        });
    };

    self.testConectionFromServer();
    /**
     * Save a configuration of the user
     */
    self.saveConfig = function( ){

        var idCredential = AJS.$( "#selectCredential" ).val();
        ciAIMSService.destroySessionData();

        var jiraConfig = jiraService.Configuration().save( idCredential );

        jiraConfig.done( function( data ){
            JIRA.Messages.showSuccessMsg(
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.save.success")
            );
            self.testConectionFromServer();
            //force refresh
            location.reload();
        });

        jiraConfig.fail( function( jqXHR ) {
            JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.save.error") );
        });
    };

    /**
     * Delete the configuration for an user
     */
    self.deleteConfig = function( ){
        ciAIMSService.destroySessionData();

        var jiraConfig = jiraService.Configuration().deleteConfig();

        jiraConfig.done( function( data ){
            AJS.$('#selectCredential').auiSelect2().val("");

            JIRA.Messages.showSuccessMsg(
                AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.delete.success")
            );
            self.testConectionFromServer();
            //force refresh
            location.reload();
        });

        jiraConfig.fail( function( jqXHR ) {
            JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.delete.error") );
        });
    };

    /**
     * Load the current configuration of an user logged
     */
    self.loadConfig = function (){

        var credentialsAll = credentialsService.getCredentials();
        AJS.$( "#selectCredential" ).auiSelect2().val("");
        AUIUtils.clearSelect("#selectCredential");

        credentialsAll.done(function( data ){

            if (data.length <= 0) {
                JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.withoutconfig") );
            }else{
                jiraService.Configuration().get().done(function( dataConfig ){
                    //that is for review before to save
                    config = dataConfig;

                    if ( dataConfig.hasOwnProperty('credential_id') ) {
                        AUIUtils.addOptions( "#selectCredential", data, "id", "ciUser" );

                        AJS.$('#selectCredential').select2().select2('val', dataConfig.credential_id);
                        AJS.$('#btnConfigSave').prop( "disabled" , true );
                        AJS.$('#btnConfigSave').html(AJS.I18n.getText("ci.partials.pluginconfiguration.vm.config.button.update") );
                        AJS.$('#btnConfigDelete').prop( "disabled" , false );
                    } else {
                        data.unshift({"ciUser":AJS.I18n.getText("ci.partials.pluginconfiguration.vm.credential.select.credential"), "id":0})
                        AUIUtils.addOptions( "#selectCredential", data, "id", "ciUser" );

                        if( data.length > 0 ){
                            AJS.$( "#selectCredential" ).triggerHandler("change");
                        }
                    }
                });
            }
        });
    };

    /**
     * Shows a confirmation dialog before a deletion of a config
     */
    self.confirmDeleteConfig = function() {
        AUIUtils.confirmDialog(
            "confirmDeleteDialog",
            AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.confirm.remove"),
            self.deleteConfig);
    };

    /**
     * Shows a confirmation dialog before a update of a config
     */
    self.confirmUpdateConfig = function() {
        AUIUtils.confirmDialog(
            "confirmUpdateDialog",
            AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.config.confirm.update"),
            self.saveConfig);
    };

    self.loadConfig();

    if( typeof jQuery.fn.auiSelect2 == 'function') {
        AJS.$( "#selectCredential" ).auiSelect2();
    }
    AJS.$( "#selectCredential" ).change(function() {
        if (AJS.$( "#selectCredential" ).val() != 0) {
            jiraService.Configuration().get().done(function( dataConfig ){
                //that is for review before to save
                config = dataConfig;

                if ( dataConfig.hasOwnProperty('credential_id') ) {
                    if (AJS.$( "#selectCredential" ).val() == dataConfig.credential_id) {
                        AJS.$('#btnConfigSave').prop( "disabled" , true );
                        AJS.$('#btnConfigDelete').prop( "disabled" , false );
                    } else {
                        AJS.$('#btnConfigSave').prop( "disabled" , false );
                        AJS.$('#btnConfigSave').html(AJS.I18n.getText("ci.partials.pluginconfiguration.vm.config.button.update") );
                        AJS.$('#btnConfigDelete').prop( "disabled" , true );
                    }
                } else {
                    AJS.$('#btnConfigSave').prop( "disabled" , false );
                    AJS.$('#btnConfigDelete').prop( "disabled" , true );
                }
            });
        } else {
            AJS.$('#btnConfigSave').prop( "disabled" , true );
            AJS.$('#btnConfigDelete').prop( "disabled" , true );
        }
    });

    /* Enable btnCredentialTest button. */
	AJS.$( "#ciUser" ).change(function() {
        self.testEnable( AJS.$('#ciUser').val(), AJS.$('#ciPassword').val(), AJS.$('#ciUrl').val());
    });

	/* Enable btnCredentialTest button. */
	AJS.$( "#ciPassword" ).change(function() {
        self.testEnable( AJS.$('#ciUser').val(), AJS.$('#ciPassword').val(), AJS.$('#ciUrl').val());
    });

    /* Save the configuration */
    AJS.$( "#btnConfigSave" ).click( function() {
        if ( config.hasOwnProperty('credential_id') ) {
            if( AJS.$( "#selectCredential" ).val() != config.credential_id ){
                self.confirmUpdateConfig();
            }
        }else{
            self.saveConfig();
        }
    });

    /* Confirm before delete */
    AJS.$( "#btnConfigDelete" ).click( function() {
        self.confirmDeleteConfig();
    });

    /** Permissions **/
    if( typeof jQuery.fn.auiSelect2 == 'function') {
        AJS.$( "#selectGroup" ).auiSelect2();
    }

    var availableEndPoints = [
        { "url": "https://api.cloudinsight.alertlogic.com" }
        ,{ "url":"https://api.cloudinsight.alertlogic.co.uk"}
        //,{ "url": "https://api.product.dev.alertlogic.com"}
    ];

    AUIUtils.addOptions( "#ciUrl", availableEndPoints, "url", "url" );

    if( typeof jQuery.fn.auiSelect2 == 'function') {
        AJS.$( "#ciUrl" ).auiSelect2();
    }
    /**
     * Adds the remediations item to the view.
     * @param {Object} rule The refence to the item
     */
    self.addGroupToView = function( rule ) {
        var tableBody = AJS.$("#permissionTable tbody");

        var rowData = [
            {
                header: "header-select",
                data: "<input type='checkbox' name='group' class='check-input' value='"
                +rule.id+"' onclick='pluginConfigurationController.validateSelected()'/>"
            },
            {
                header: "header-group",
                data: rule.group,
                style: 'row_pointer',
            }
        ];

        AUIUtils.createTableRow( tableBody, rowData);
    };

    /**
     * Load the permissions that are already configured
     */
    self.loadPermissions = function() {
        AJS.$( "#btnAddGroup" ).prop('disabled', true);
        AUIUtils.clearSelect("#selectGroup");
        AUIUtils.clearTable("#permissionTable");
        AJS.$( "#selectGroup" ).auiSelect2().val("");
        permissionsService.getPermissions().done( function( data ){

            if ( data.length <= 0) {
                AUIUtils.visible("#permissionZeroState");
            } else {
                AUIUtils.invisible("#permissionZeroState");
            }

            for(var i = 0 ; i < data.length; i++)
            {
                self.addGroupToView( data[i] );
            }

            jiraService.Groups().getAll().done( function( dataGroups ){

                var groups = [];

                for(var i = 0 ; i < dataGroups.groups.length; i++)
                {
                    var push = true;
                    for(var j = 0 ; j < data.length; j++)
                    {
                        if( dataGroups.groups[ i ].name === data[ j ].group ){
                            push = false;
                            break;
                        }
                    }

                    if( push ){
                        groups.push( dataGroups.groups[ i ] );
                    }
                }

                if( groups.length > 0 ){
                    AUIUtils.addOptions( "#selectGroup", groups, "name", "name" );
                    AJS.$( "#selectGroup" ).triggerHandler("change");
                    AJS.$( "#btnAddGroup" ).prop('disabled', false);
                }
            });
        });
    };

    /**
     * Add a group to the list with permissions
     */
    self.addGroup = function(){
        var group = AJS.$( "#selectGroup" ).auiSelect2().val();

        if( group != null){
            var assign = permissionsService.assignPermission(group);

            assign.done( function(){
                JIRA.Messages.showSuccessMsg(
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.group.added"
                ));
                self.loadPermissions();
            });

            assign.fail( function(){
                JIRA.Messages.showErrorMsg(
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.group.adding.error")
                );
            });

            assign.always( function(){
                AJS.$( '#allCheck' ).prop('checked', false);
            });
        }
    };

    /**
     * Shows a confirmation dialog before a deletion of a group
     */
    self.confirmDeleteGroup = function() {
        AUIUtils.confirmDialog(
            "confirmDeleteDialog",
            AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.confirm.remove.group"),
            self.removeGroup );
    };

    /**
     * Validates if there are selected groups to delete
     * to enable the delete button.
     */
    self.validateSelected = function() {

        AJS.$( "#btnRemoveGroup" ).prop('disabled', true);

        AJS.$('#permissionTable tbody tr').find('td:first :checkbox').each(function() {
            if (AJS.$(this).prop('checked')) {
                AJS.$( "#btnRemoveGroup" ).prop('disabled', false);
            }
        });
    };

    /**
     * Remove the group selected of the permissions
     */
    self.removeGroup = function() {
        var selectedGroupsID = [];
        AJS.$('input[name="group"]:checked').each(function() {
            selectedGroupsID.push(this.value);
        });

        var success = 0;
        var error = 0;
        var ofMsg = AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.group.of");

        for( i = 0; i < selectedGroupsID.length ; i++ ){
            JIRA.Loading.showLoadingIndicator();

            var permissionPromise = permissionsService.deletePermission( selectedGroupsID[i] )
            .done( function( data ){
                success++;

                JIRA.Messages.showSuccessMsg(
                    "(" + success + " " + ofMsg + " " + selectedGroupsID.length+") "+
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.group.removed")
                );
            })
            .fail( function( jqXHR, textStatus ){
                error++;

                JIRA.Messages.showErrorMsg(
                    "(" + error + " " + ofMsg + " " + selectedGroupsID.length+") "+
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.group.removing.error")
                );

            })
            .always(function(){
                if( (success+error) === selectedGroupsID.length){
                    self.loadPermissions();
                    JIRA.Loading.hideLoadingIndicator();
                }
                self.validateSelected();
                AJS.$( '#allCheck' ).prop('checked', false);
            });
        }
    };

    //Active the actions in permmisions buttons
    AJS.$( '#btnAddGroup' ).prop('disabled', true);
    AJS.$( '#btnAddGroup' ).click( function() {
        self.addGroup();
    });

    AJS.$( '#btnRemoveGroup' ).prop('disabled', true);
    AJS.$( '#btnRemoveGroup' ).click( function() {
        self.confirmDeleteGroup();
    });

    /* Check all the permissions */
    AJS.$( '#allCheck' ).click(function(){
        var checkedStatus = this.checked;
        AJS.$( '#btnRemoveGroup' ).prop('disabled', true);
        AJS.$( '#permissionTable tbody tr' ).find('td:first :checkbox').each(function() {
            AJS.$(this).prop('checked', checkedStatus);
            if (AJS.$(this).prop('checked')) {
                AJS.$( "#btnRemoveGroup" ).prop('disabled', false);
            }
        });
    });

    self.loadPermissions();
});
