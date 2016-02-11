/**
 * User plugin configuration page Controller
 */
var pluginConfigurationController;

AJS.$( document ).ready( function() {
    var self = pluginConfigurationController = this;
    jiraService.startService();

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

        jiraService.Configuration().save( user, password, url ).
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
                        JIRA.Messages.showSuccessMsg(
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
            }
        );
    };

    /**
     * Delete the configuration stored
     */
    self.detele = function() {

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
            self.testConectionFromServer();
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

    /**
     * Shows a confirmation dialog before the deletion of credentials
     */
    self.confirmDeleteCredentials = function() {
        AUIUtils.confirmDialog(
            "confirmDeleteDialogCredentials",
            AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.confirm.remove.credentials"),
            self.detele );
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
            self.confirmDeleteCredentials();
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

    /* Permissions */
    Bootstrap.onView("#selectGroup", function(){
        if( typeof jQuery.fn.auiSelect2 == 'function') {
            AJS.$( "#selectGroup" ).auiSelect2();
        }
    });

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
     * @return {[type]} [description]
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
                JIRA.Messages.showWarningMsg(
                    AJS.I18n.getText("ci.partials.pluginconfiguration.js.msg.group.adding.error")
                );
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
            });
        }
    };

    /**
     * Test to connect using the servlet,
     * in order to test that the server has a way to connect with the CI api.
     */
    self.testConectionFromServer = function() {
        var promise = jiraService.AuthProxy();
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

    //active the actions in permmisions buttons
    AJS.$( '#btnAddGroup' ).prop('disabled', true);
    AJS.$( '#btnAddGroup' ).click( function() {
        self.addGroup();
    });

    AJS.$( '#btnRemoveGroup' ).prop('disabled', true);
    AJS.$( '#btnRemoveGroup' ).click( function() {
        self.confirmDeleteGroup();
    });

    AJS.$( "#allCheck" ).click(function(){
        var checkedStatus = this.checked;
        AJS.$( "#btnRemoveGroup" ).prop('disabled', true);
        AJS.$('#permissionTable tbody tr').find('td:first :checkbox').each(function() {
            AJS.$(this).prop('checked', checkedStatus);
            if (AJS.$(this).prop('checked')) {
                AJS.$( "#btnRemoveGroup" ).prop('disabled', false);
            }
        });
    });

    self.loadPermissions();
});
