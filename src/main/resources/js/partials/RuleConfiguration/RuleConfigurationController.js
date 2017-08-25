/**
 * Global vars
 */
var ruleConfigurationController;
/**
 * Remediations sync page Controller
 */
AJS.$(document).ready(
	function() {
		var currentUser = AJS.Meta.get('remote-user');

		Bootstrap.start( currentUser, function(){
			var self = ruleConfigurationController = this;
			var environments = [];
			var projects = [];
			var groups = [];
			var rules = [];

			/**
			 * Validates if there are selected rule to delete
			 * to enable the delete button.
			 */
			self.validateSelected = function() {
				AJS.$( "#delete-rule-button" ).prop('disabled', true);
				AJS.$( "#unblock-rule-button" ).prop('disabled', true);

				AJS.$('#dataTable tbody tr').find('td:first :checkbox').each(function() {
					if (AJS.$(this).prop('checked')) {
						AJS.$( "#delete-rule-button" ).prop('disabled', false);
						AJS.$( "#unblock-rule-button" ).prop('disabled', false);
					}
				});
			};

			/**
			 * Returns the selected rules
			 * @return {Array} rulesId
			 */
			self.getSelectedRules = function(){
				var selectedRulesID = [];
				AJS.$('input[name="rules"]:checked').each(function() {
					selectedRulesID.push(this.value);
				});

				return selectedRulesID;
			};

			/**
			 * Retunr a div html with the filter information for a rule
			 * @param  {Array} filter
			 * @return {Srting} html
			 */
			self.getFiltersItems = function( filters ){
				var filterhtml = "<div>";

				for (var i = 0; i < filters.length; i++) {
					var array = filters[i].key.split(":");
					var type = array.shift();
					var key = array.join(":");

					var displayName = AUIUtils.getFilterDisplayName({
	                	"type" : type,
	                	"key" : key
	            	});

					filterhtml += assetDictionaryService.getType( type ).getTypeName( );
					filterhtml += ":";
					filterhtml += displayName ;
					filterhtml += "<br>";
				}
				if( filters.length === 0 ){
					filterhtml += AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.not.filter");
				}

				filterhtml += "</div>";
				return filterhtml;
			};

			/**
			 * Return the project name
			 * @param {int}  projectId the id of the project
			 * @return {String} project name
			 */
			self.getProjectName = function( projectId ){
				if(projects.hasOwnProperty( projectId )){
					return projects[ projectId ];
				}
				return "";
			};

			/**
			 * Return the environment name
			 * @param {envId}  the id of the environment
			 * @return {String} environment name
			 */
			self.getEnvironmentName = function( envId ){
				if(environments.hasOwnProperty( envId )){
					return environments[ envId ];
				}
				return "";
			};

			/**
			 * Adds the remediations item to the view.
			 * @param {Object} rule The refence to the item
			 */
			self.addRuleToView = function( rule ) {
				var tableBody = AJS.$("#dataTable tbody");
				var action = "ruleConfigurationController.showDetails(" + rule.id + ")" ;

				var rowData = [
					{
						header: "header-select",
						data: "<input type='checkbox' name='rules' value='"
						+rule.id+"' onclick='ruleConfigurationController.validateSelected()'/>"
					},
					{
						header: "header-name",
						data: rule.name,
						style: 'row_pointer',
						action: action
					},
					{
						header: "header-project",
						data: self.getProjectName( rule.project ),
						style: 'row_pointer',
						action: action
					},
					{
						header: "header-environment",
						data: self.getEnvironmentName( rule.environment ),
						style: 'row_pointer',
						action: action
					},
					{
						header: "header-group",
						data: rule.group,
						style: 'row_pointer',
						action: action
					},
					{
						header: "header-user",
						data: rule.user,
						style: 'row_pointer',
						action: action
					},
					{
						header: "header-status",
						data: rule.lastStatusName,
						style: 'row_pointer',
						action: action
					},
					{
						header: "header-edit",
						data: "<a class='row_pointer' onclick='ruleConfigurationController.editRule("+rule.id+")'>Edit</a>"
					}
				];

				AUIUtils.createTableRow( tableBody, rowData);
			};

			/**
			 * Return html with the basic information about a rule
			 * @param  {Object} rule
			 * @return {String} html
			 */
			self.getBasicRule = function( rule ){
				var bascihtml = "<div>";

				bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.vm.header.name") + " : " + rule.name + "<br>";
				bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.vm.header.environment") + " : " + rule.environment + "<br>";
				bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.vm.header.group") + " : " + rule.group + "<br>";
				bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.vm.header.user") + " : " + rule.user + "<br>";
				if(rule.hasOwnProperty('lastExecution')){
					bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.vm.header.lastExecution") + " : " + rule.lastExecution + "<br>";
				}
				bascihtml += "</div>";
				return bascihtml;
			};

			/**
			 * Retunr html with the last log
			 * @param  {Object} rule
			 * @return {Strinh} html
			 */
			self.getLastLogRule = function( rule ){
				var bascihtml = "<div>";
				if( rule.hasOwnProperty("lastLog") ){
					bascihtml += AUIUtils.htmlLize( rule.lastLog ) ;
				}
				else{
					bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.log.notfound") + "<br>";
				}
				bascihtml += "</div>";
				return bascihtml;
			};

			/**
			 * Retunr html with the last log
			 * @param  {Object} rule
			 * @return {Strinh} html
			 */
			self.getLastImportantLogRule = function( rule ){
				var bascihtml = "<div>";
				if( rule.hasOwnProperty("lastImportantLog") ){
					bascihtml += AUIUtils.htmlLize( rule.lastImportantLog ) ;
				}
				else{
					bascihtml += AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.log.notfound") + "<br>";
				}
				bascihtml += "</div>";
				return bascihtml;
			};

			/**
			 * Show the rule details in a dialog
			 * @param  {int} rule id
			 */
			self.showDetails = function( ruleId ) {
				var dialog = new AJS.Dialog({
				    width: 800,
				    height: 400,
				    closeOnOutsideClick: true
				});
				var rule = rules[ ruleId ];

				dialog.addHeader(AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.title"));

				dialog.addPanel(
					AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.panel.basic"),
					self.getBasicRule( rule ));

				dialog.addPanel(
					AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.panel.filters"),
					self.getFiltersItems( rule.filters ));

				dialog.addPanel(
					AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.panel.lastlog"),
					self.getLastLogRule( rule ));


				dialog.addPanel(
					AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.panel.lastimportantlog"),
					self.getLastImportantLogRule( rule ));

				dialog.gotoPanel(0);

				dialog.addCancel(
					AJS.I18n.getText("ci.partials.ruleconfiguration.js.details.dialog.btn.close"),
					function(){ dialog.hide() });

				dialog.show();
			};

			/**
			 * Shows a confirmation dialog before a rule deletion
			 */
			self.confirmDelete = function() {
				AUIUtils.confirmDialog(
					"confirm-delete-dialog",
					AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.confirm.delete.rule"),
					self.deleteRules );
			};

			/**
			 * Delete the rules selected
			 */
			self.deleteRules = function() {

				var rulesID = self.getSelectedRules();
				var success = 0;
				var error = 0;
				var ofMsg = AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.rule.of");

				for( i = 0; i < rulesID.length ; i++ ){
					JIRA.Loading.showLoadingIndicator();

					var rulePromise = rulesService.deleteRule( rulesID[i] )
					.done(function(data){
						success++;

						JIRA.Messages.showSuccessMsg(
							"(" + success + " " + ofMsg + " " + rulesID.length+") "+
							AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.rule.deleted")
						);
					})
					.fail(function(jqXHR, textStatus){
						error++;

						JIRA.Messages.showErrorMsg(
							"(" + error + " " + ofMsg + " " + rulesID.length+") "+
							AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.rule.deleted.error")
						);

					})
					.always(function(){
						if( (success+error) === rulesID.length){
							self.loadAllRules();
							JIRA.Loading.hideLoadingIndicator();
						}
						self.validateSelected();
					});
				}
			};

			/**
			 * Check if the rule is ok
			 * @return show a message if something is wrong
			 */
			self.checkRule = function( rule ) {
				//ci.partials.ruleconfiguration.js.msg.check.rule
				if( self.getProjectName( rule.project ) === ""){
					JIRA.Messages.showErrorMsg(
						AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.check.rule")
						+ rule.name
						+ AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.check.rule.project")
					);
				}
				if( self.getEnvironmentName( rule.environment ) === ""){
					JIRA.Messages.showErrorMsg(
						AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.check.rule")
						+ rule.name
						+ AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.check.rule.environment")
					);
				}

				if( self.getEnvironmentName( rule.lastStatusName ) === "Blocked"
					|| self.getEnvironmentName( rule.lastStatusName ) === "Error"){
					JIRA.Messages.showErrorMsg(
						AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.check.rule")
						+ rule.name
						+ AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.check.rule.status")
					);
				}
			};

			/**
			 * Load all rules
			 */
			self.loadAllRules = function() {
				var rulesAll = rulesService.getRules();
				var projectsAll = jiraService.Project().getAll();

				AUIUtils.clearTable( "#dataTable" );

				AUIUtils.invisible("#ruleZeroState");
				AJS.$("#ruleConfigurationLoading").show();

				projectsAll.done(function( data ){
					for(var i=0; i<data.length; i++){
						projects[ data[i].id ] = data[i].name;
					}

					rulesAll.done( function( data ) {
						AJS.$("#ruleConfigurationLoading").hide();

						if (data.length <= 0) {
							AUIUtils.visible("#ruleZeroState");
						} else {
							AUIUtils.invisible("#ruleZeroState");
						}

						for(var i = 0 ; i < data.length; i++)
						{
							self.checkRule( data[i] );
							rules[ data[i].id ]= data[i];
							self.addRuleToView( data[i] );
						}
					});
				});
			};

			/**
			 * Unblock the rules selected
			 */
			self.unblockRules = function(){
				var rulesID = self.getSelectedRules();
				var success = 0;
				var error = 0;
				var ofMsg = AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.rule.of");

				for( i = 0; i < rulesID.length ; i++ ){
					JIRA.Loading.showLoadingIndicator();

					var rulePromise = rulesService.unblockRule( rulesID[i] )
					.done(function(data){
						success++;

						JIRA.Messages.showSuccessMsg(
							"(" + success + " " + ofMsg + " " + rulesID.length+") "+
							AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.rule.unblocked")
						);
					})
					.fail(function(jqXHR, textStatus){
						error++;

						JIRA.Messages.showErrorMsg(
							"(" + error + " " + ofMsg + " " + rulesID.length+") "+
							AJS.I18n.getText("ci.partials.ruleconfiguration.js.msg.rule.unblocked.error")
						);

					})
					.always(function(){
						if( (success+error) === rulesID.length){
							self.loadAllRules();
							JIRA.Loading.hideLoadingIndicator();
						}
						self.validateSelected();
					});
				}
			};

			/**
			 * Redirect to the page of synchronize remediation
			 * @param  {int} rule id
			 * @return {void}
			 */
			self.editRule = function(ruleId) {
				var urlBaseServlets = AJS.params.baseURL +  "/plugins/servlet/remediationssyncservlet";

				var form = AJS.$('#fake_form').html('<form id="fake_form_content" action="'+urlBaseServlets +'" method="post"><input type="hidden" name="ruleId" value="' + ruleId + '" /></form>');

    			AJS.$('#fake_form_content').submit();
			};

			/**
			 * Delete button
			 */
			Bootstrap.onView( "#delete-rule-button", function(){
				AUIUtils.invisible("#ruleZeroState");
				AJS.$( "#delete-rule-button" ).prop('disabled', true);
				AJS.$( "#delete-rule-button" ).click(function() {
					self.confirmDelete();
				});
			});

			/**
			 * Unblock button
			 */
			Bootstrap.onView( "#unblock-rule-button", function(){

				AJS.$( "#unblock-rule-button" ).prop('disabled', true);
				AJS.$( "#unblock-rule-button" ).click(function() {
					self.unblockRules();
				});
			});

			/**
			 * Check all
			 */
			Bootstrap.onView( "#allCheck", function() {
				AJS.$( "#allCheck" ).click( function() {
					var checkedStatus = this.checked;
					AJS.$( "#delete-rule-button" ).prop( 'disabled', true);
					AJS.$( "#unblock-rule-button" ).prop( 'disabled', true);
					AJS.$( '#dataTable tbody tr').find( 'td:first :checkbox' ).each(function() {
						AJS.$(this).prop( 'checked', checkedStatus);
						if (AJS.$(this).prop( 'checked' )) {
							AJS.$( "#delete-rule-button" ).prop( 'disabled', false);
							AJS.$( "#unblock-rule-button" ).prop( 'disabled', false);
						}
					});
				});
			});

			/**
			 * Load the environments and call load rules
			 */
			self.start = function() {
				environments = [];
				projects = [];
				groups = [];
				rules = [];

				environmentsService.listEnvironments( function( data ){
					for (var i = 0; i < data.length; i++) {
						environments[ data[i].id ] = data[i].name;
					}

					self.loadAllRules();
				});
			};

			self.start();

			setInterval(function(){
				ruleConfigurationController.start();
			}, configService.timeRefresh );

		});
	}
);
