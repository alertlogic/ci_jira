/**
 * Global vars
 */
var currentEnvironment;
var remediationsSyncController;
/**
 * Remediations sync page Controller
 */
AJS.$(document).ready(
	function() {
		Bootstrap.start(function(){
			var self = remediationsSyncController = this;

			var filtersTypeList;
			var filtersList;
			var currentRemediations;
			var allRemediationsItems;
			var filterMapByType;
			var currentFilterType;
			var selectedFilters;
			var issueTypeId;
			var isARuleLoaded;
			var ruleId;

			/**
			 * Review if the information is of a rule
			 * @return {Boolean} [description]
			 */
			self.isLoadinARule=function(){
				ruleId = AJS.$( "#rule-id" ).val();

				if(ruleId === ''){
					isARuleLoaded = false;
				}
				else{
					isARuleLoaded = true;
				}
			};
			self.isLoadinARule();
			/**
			 * Loads the list of environments for the user.
			 */
			self.loadEnvironmentList = function() {
				environmentsService.listEnvironments(function(data) {
					AUIUtils.addOptions( "#select-environment", data, "id", "name" );

					if( !isARuleLoaded ){
						AUIUtils.selectFirstRecord( "#select-environment", data, "id" );
					}
					AJS.$( "#select-environment" ).triggerHandler("change");
				},
				function(data) {
					JIRA.Messages.showWarningMsg(
						AJS.I18n.getText("ci.partials.remediationssync.js.msg.environment.error")
					);
				});
			};
			self.loadEnvironmentList();

			/**
			 * It is an open remediation
			 * incomplete: re-open
			 * open: not exist in the remeditionsItems
			 * other state is not open
			 */
			self.isAnOpenRemediation = function( remediationId ) {
				for (var i = 0; i < allRemediationsItems.assets.length; i++) {
					//review if the remediations has items
					if (allRemediationsItems.assets[i][0].remediation_id === remediationId)
					{
						if( allRemediationsItems.assets[i][0].state === "incomplete" )
						{
							//if the remediation is uncomplete this means that it is re-open
							return true;
						}
						else{
							//in other cases is planned or complete
							return false;
						}
					}

				}
				//if the remediation not exist in remediation items is because it is open
				return true;
			};

			/**
			 * Update the total of remediations in the header
			 */
			self.updateTableHeader = function(total) {

				var headerDesc = AJS.$("#header-description");

				headerDesc.html( AJS.I18n.getText("ci.partials.remediationssync.js.header.steps")+" ("+total+")");

				AJS.$( "#allCheck" ).click(function(){
					var checkedStatus = this.checked;
					AJS.$( "#assign-button" ).prop('disabled', true);
					AJS.$('#dataTable tbody tr').find('td:first :checkbox').each(function() {
						AJS.$(this).prop('checked', checkedStatus);
						if (AJS.$(this).prop('checked')) {
							AJS.$( "#assign-button" ).prop('disabled', false);
						}
					});
				});
			};

			/**
			 * Validates if there are selected remediations to assign
			 * to enable the assign button.
			 */
			self.validateSelected = function() {
				AJS.$( "#assign-button" ).prop('disabled', true);
				AJS.$('#dataTable tbody tr').find('td:first :checkbox').each(function() {
					if (AJS.$(this).prop('checked')) {
						AJS.$( "#assign-button" ).prop('disabled', false);
					}
				});
				var project = AJS.$( "#select-project" ).val();
				if (!project) {
					AJS.$( "#assign-button" ).prop('disabled', true);
				}
			};

			/**
			 * Load the items for an environment and filters
			 * @param  {String} environment
			 * @param  {Array} selected filters array
			 * @return {void}
			 */
			self.loadItems = function( currentEnvironment, selectedFiltersArray) {
				remediationsService.getAllRemediationsItemsByEnvironment(currentEnvironment).done(function(remediationsItems){
						allRemediationsItems = remediationsItems;

						remediationsService.getAllRemediations(currentEnvironment,selectedFiltersArray).done(function(data){

							currentRemediations = [];

							if ( data["remediations"] ) {
								if ( data.remediations.assets ) {

									var remediationCount = 0;

									for (var i = 0; i < data.remediations.assets.length; i++) {
										if (self.isAnOpenRemediation(data.remediations.assets[i].remediation_id)) {

											currentRemediations.push(data.remediations.assets[i]);

											self.addRemediationItemToView(data.remediations.assets[i]);

											remediationCount++;

										}
									}

									if( data.remediations.assets.length === 0 && isARuleLoaded===true ){
				                    	JIRA.Messages.showWarningMsg(
											AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.filters.warning")
										);
									}
									self.updateTableHeader( remediationCount );

									if (remediationCount <= 0) {
										AUIUtils.visible("#div-zero-state");
									} else {
										AUIUtils.invisible("#div-zero-state");
									}

									AJS.$("#remediationSyncLoading").hide();
								}
							}

							if (data["filters"]) {
								self.setRemediationsFilters(data["filters"]);
							}

						});
					});
			};

			/**
			 * Load all remediations items for this environment.
			 */
			self.loadAllRemediationsItems = function() {
				AUIUtils.clearTable( "#dataTable" );
				self.updateTableHeader( 0 );
				AUIUtils.invisible("#div-zero-state");
				AJS.$("#remediationSyncLoading").show();

				if (currentEnvironment) {

					var selectedFiltersArray = self.getSelectedFiltersArray();
					self.loadItems(currentEnvironment,selectedFiltersArray);

				}
			};

			/**
			 * Adds a filter to the view.
			 * @param {String} type     The filter type
			 * @param {Int} position The filter position
			 */
			self.addFilter = function(type, position) {
				if (!selectedFilters) {
					selectedFilters = [];
				}

				if (!self.isSelected(filterMapByType[type][position])) {
					selectedFilters.push(filterMapByType[type][position]);

					self.refreshAfterFilterChange();
				}
				self.isReadySaveRuleButton();
			};

			/**
			 * Updates the view after a filter change.
			 */
			self.refreshAfterFilterChange = function() {
				self.updateSelectedFilterList();
				AUIUtils.clearTable("#dataFilters");
				self.loadAllRemediationsItems();
			};

			/**
			 * Set the remediations filters
			 */
			self.setRemediationsFilters = function( filters ) {
				filterMapByType = {};
				filtersTypeList = [];

				var previousVal = AJS.$( "#filter-types" ).val();

				for (var i = 0; i < filters.length; i++) {
					if(!self.isSelected(filters[i])) {

						if (!filterMapByType.hasOwnProperty(filters[i].type)) {
							filterMapByType[filters[i].type] = [];
							filters[i].displayName = assetDictionaryService.getType(filters[i].type).getTypeName(filters[i]);
							filtersTypeList.push(filters[i]);
						}

						filterMapByType[filters[i].type].push(filters[i]);
					}
				}

				for (var i = 0; i < filters.length; i++) {
					if(!self.isSelected(filters[i])) {
						if (filterMapByType.hasOwnProperty(filters[i].type)) {
							filterMapByType[filters[i].type].sort(function(a,b){
								return b.threat_level - a.threat_level;
							});
						}
					}
				}

				AUIUtils.clearSelect("#filter-types");

				AUIUtils.addOptions( "#filter-types", filtersTypeList, "type", "displayName" );

				AJS.$( "#filter-types" ).val(previousVal).trigger("change");
			};

			/**
			 * Return true if the filter is already selected.
			 * @param  {Object}  filter The filter reference
			 * @return {Boolean}        True if is selected
			 */
			self.isSelected = function( filter ) {
				if (selectedFilters) {
					for (var i = 0; i < selectedFilters.length; i++) {
						if (selectedFilters[i].key === filter.key) {
							return true;
						}

					}
				}
				return false;
			};

			/**
			 * Updates the filter list
			 */
			self.updateFilterList = function() {
				AUIUtils.clearTable("#dataFilters");
				currentFilterType = AJS.$( "#filter-types" ).val();

				if (filterMapByType[currentFilterType]) {

					for (var i = 0; i < filterMapByType[currentFilterType].length; i++ ) {
						//Ignore the selected ones.
						if (!self.isSelected(filterMapByType[currentFilterType][i])) {

							var tableBody = AJS.$("#dataFilters tbody");

							var displayName = AUIUtils.getFilterDisplayName(filterMapByType[currentFilterType][i]);

							var rowData = [
								{
									header:"header-filter",
									data: "<div class='filter-row "
										+AUIUtils.getThreatLevelClass(filterMapByType[currentFilterType][i].threat_level)
										+"' >"
										+displayName+"</div>",
									action: 'remediationsSyncController.addFilter(\''+currentFilterType+'\','+i+')'
								}
							];

							AUIUtils.createTableRow(tableBody,rowData);
						}
					}
				}
			};

			/**
			 * Updates the filter list
			 */
			self.updateSelectedFilterList = function() {
				AUIUtils.clearTable("#selectedFilters");

				if (selectedFilters) {

					for (var i = 0; i < selectedFilters.length; i++ ) {

						var tableBody = AJS.$("#selectedFilters tbody");

						var displayName = AUIUtils.getFilterDisplayName(selectedFilters[i]);

						var rowData = [
							{
								data: "<div class='filter-row "
									+AUIUtils.getThreatLevelClass(selectedFilters[i].threat_level)
									+"' >"
									+displayName+"</div>"
							},
							{
								data: "<div class='button-x-delete'>X</div>"
							}
						];

						AUIUtils.createTableRow(tableBody,rowData, "row-filter-selected", 'remediationsSyncController.removeFilter('+i+')' );
					}
				}
			};

			/**
			 * Removes the filter from view.
			 * @param  {Int} filterPosition The filters position
			 */
			self.removeFilter = function(filterPosition) {
				if (selectedFilters) {
					selectedFilters.splice(filterPosition,1);

					refreshAfterFilterChange();
				}
				self.isReadySaveRuleButton();
			};

			/**
			 * Returns the selected remediations
			 */
			self.getSelectedRemediations = function(){
				var selectedRemediationsID = [];
				AJS.$('input[name="remediations"]:checked').each(function() {
					selectedRemediationsID.push(this.value);
				});

				return selectedRemediationsID;
			};

			/**
			 * Return the remediations keys of the selected remediations
			 */
			self.getSelectedRemediationsKeys = function(){
				var selectedRemediationsKeys = [];
				var remediationsKeysMap = {};
				var selectedRemediations = self.getSelectedRemediations();

				if (currentRemediations) {
					for (var i = 0; i < currentRemediations.length; i++) {
						remediationsKeysMap[currentRemediations[i].remediation_id] = currentRemediations[i].key;
					}

					for (var i = 0; i < selectedRemediations.length; i++) {
						selectedRemediationsKeys.push(remediationsKeysMap[selectedRemediations[i]]);
					}
				}

				return selectedRemediationsKeys;
			};

			/**
			 * Populates the project select.
			 * @param  {Array} projects The array of projects names
			 */
			self.populateProjectSelect = function( projects ) {
				AUIUtils.addOptions( "#select-project", projects, "id", "name" );
				AUIUtils.selectFirstRecord( "#select-project", projects, "id" );
				AJS.$( "#select-project" ).triggerHandler("change");
			};

			/**
			 * Gets the available Jira groups.
			 */
			jiraService.Groups().getAll().success(function(data){
				AUIUtils.addOptions( "#select-group", data.groups, "name", "name" );
				AJS.$( "#select-group" ).triggerHandler("change");
			});

			/**
			 * Get all projects that has associated the CI Remediation Issue Type.
			 */
			jiraService.Project().getAll().success(function(data){
				var customsProjectsArray = [];
				var projectsProcessed = 0;

				for (var i = 0; i < data.length; i++) {
					jiraService.Project().getProjectInfo(data[i].self).success(function(projectInfo){

						customsProjectsArray.push( projectInfo );

						projectsProcessed++;
						if (projectsProcessed >= data.length) {
							self.populateProjectSelect(customsProjectsArray);
						}
					}).fail(function(jqXHR, textStatus) {
						JIRA.Messages.showWarningMsg(
							'Error ('+jqXHR.status+'): '+textStatus+", getting project("
								+projectInfo.id+") info.");

						projectsProcessed++;
						if (projectsProcessed >= data.length) {
							self.populateProjectSelect(customsProjectsArray);
						}
					});
				}
			});

			/**
			 * Adds the remediations item to the view.
			 * @param {Object} remediation The refence to the item
			 */
			self.addRemediationItemToView = function( remediation ) {
				var tableBody = AJS.$("#dataTable tbody");

				var rowData = [
					{
						header:"header-select",
						data: "<input type='checkbox' name='remediations' class='check-input' value='"
						+remediation.remediation_id+"' onclick='remediationsSyncController.validateSelected()'/>"
					},
					{
						header:"header-description",
						data: "<div class='remediation-row "+AUIUtils.getThreatLevelClass(remediation.threat_level)+"'>"
						+AUIUtils.htmlLize(remediation.name)+"</div>"
					},
					{
						header:"header-vulnerability",
						data: remediation.vulnerabilities.length
					},
					{
						header:"header-created",
						data: moment( remediation.created_on ).format("MM/DD/YYYY")
					}
				];

				AUIUtils.createTableRow(tableBody,rowData);

			};

			/**
			 * Add Select Events
			 */
			Bootstrap.onView("#select-environment", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#select-environment" ).auiSelect2();
				}
				AJS.$( "#select-environment" ).change(function() {
					currentEnvironment = AJS.$( "#select-environment" ).val();

					selectedFilters = [];
					AUIUtils.clearTable("#selectedFilters");

					if(ruleId === ''){
						self.loadAllRemediationsItems();
					}
					else{
						self.loadRule();
					}

					self.isReadySaveRuleButton();
				});
			});

			Bootstrap.onView("#select-group", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#select-group" ).auiSelect2();
				}
			});

			Bootstrap.onView("#select-project", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#select-project" ).auiSelect2();
				}
				AJS.$( "#select-project" ).change(function() {
					self.isReadySaveRuleButton();
				});
			});

			Bootstrap.onView("#filter-name", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#filter-name" ).auiSelect2();
				}
			});

			Bootstrap.onView("#filter-types", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#filter-types" ).auiSelect2();
				}
				AJS.$( "#filter-types" ).change(function() {
					self.updateFilterList();
				});
			});

			Bootstrap.onView("#rule-name", function(){
				AJS.$( "#rule-name" ).keyup(function() {
					self.isReadySaveRuleButton();
				});
			});

			/**
			 * Plan remediations and create issues.
			 */
			self.planRemediationsAndCreateIssues = function( project, group ) {
				var selectedRemediations = self.getSelectedRemediations();

				if (selectedRemediations.length > 0 ) {

					var remediationsKeys = self.getSelectedRemediationsKeys();

					var selectedFiltersArray = self.getSelectedFiltersArray();

					remediationsService.planRemediations(currentEnvironment,remediationsKeys,selectedFiltersArray).done(
						function(plannedItems){

						JIRA.Messages.showSuccessMsg(
							selectedRemediations.length+" "
							+AJS.I18n.getText("ci.partials.remediationssync.js.msg.planned"));

						self.createJiraIssues(plannedItems,project,group);
						JIRA.Loading.hideLoadingIndicator();

					}).fail(function(jqXHR, textStatus) {

						JIRA.Messages.showWarningMsg(
							'Error ('+jqXHR.status+'): '
							+AJS.I18n.getText("ci.partials.remediationssync.js.msg.planned.error"));
						JIRA.Loading.hideLoadingIndicator();

					});

				}
			};

			/**
			 * Assign button
			 */
			Bootstrap.onView("#assign-button", function(){

				AJS.$( "#assign-button" ).prop('disabled', true);
				AJS.$( "#assign-button" ).click(function() {

					var group = AJS.$( "#select-group" ).val();
					var project = AJS.$( "#select-project" ).val();
					JIRA.Loading.showLoadingIndicator();

					if (project) {

						var projectIsConfigured = jiraService.ConfigureProject(project);
						projectIsConfigured.done(function(){
							jiraService.Field().configurate();

							jiraService.IssueType().getAll().success(function(data){

								for (var i = 0; i < data.length; i++) {
									if (data[i].name === AJS.I18n.getText("ci.constant.issuetype.name")){
										issueTypeId = data[i].id;
										break;
									}
								}
								if (issueTypeId) {
									self.planRemediationsAndCreateIssues(project,group);
								} else {
									JIRA.Messages.showWarningMsg(
										AJS.I18n.getText("ci.partials.remediationssync.js.msg.issuetype.error")
									);
									JIRA.Loading.hideLoadingIndicator();
								}
							});

						});

						projectIsConfigured.fail(function(jqXHR, textStatus) {
							JIRA.Messages.showWarningMsg(
								AJS.I18n.getText("ci.partials.remediationssync.js.msg.planned.error")
							);
							JIRA.Loading.hideLoadingIndicator();
						});
					}

				});
			});

			/**
			 * Return the remediation
			 */
			self.getRemediation = function( remediationId ){
				if (currentRemediations && remediationId) {
					for (var i = 0; i < currentRemediations.length; i++) {

						if(currentRemediations[i].remediation_id === remediationId){
							return currentRemediations[i];
						}
					}
				}
				return null;
			};

			/**
			 * Creates the jira issues, based on the planned items
			 */
			self.createJiraIssues = function( plannedItems, project, group ) {

				var ofMsg = AJS.I18n.getText("ci.partials.remediationssync.js.msg.issues.of");
				var assignMessage = AJS.I18n.getText("ci.partials.remediationssync.js.msg.issues.assign");
				var assignErroMessage = AJS.I18n.getText("ci.partials.remediationssync.js.msg.issues.assign.error");
				var issueCreated = 0;
				var issueNotCreated = 0;
				var remediationItemRemoved = 0;
				var remediationsDetails = plannedItems.map(function(elem){
					return elem.properties.remediation_id;
				}).join(",");

				remediationsService.getRemediationsByIds(remediationsDetails)
				.done( function( descData ){
					var descriptionsArray = remediationSupportService.getDescriptions( descData );

					for (var i = 0; i < plannedItems.length; i++) {

						var remediation = self.getRemediation( plannedItems[i].properties.remediation_id );

						jiraService.Issue().create(
							AUIUtils.formatSummary( remediation.name ),
							descriptionsArray[ remediation.remediation_id ],
							project,
							plannedItems[i].key,
							remediation.key,
							group,
							issueTypeId,
							remediation.threat_level
						).done(function(data){
							issueCreated++;

							JIRA.Messages.showSuccessMsg(
								"(" + issueCreated + " " + ofMsg + " " + plannedItems.length+") "+assignMessage);

							if ( (issueCreated+issueNotCreated)  === plannedItems.length ) {
								self.loadAllRemediationsItems();
							}


						}).fail( function( jqXHR, textStatus, errorThrown){
							issueNotCreated++;
							JIRA.Messages.showErrorMsg(
								"(" + issueNotCreated + " " + ofMsg + " " + plannedItems.length+") "+assignErroMessage);

							var field = jiraService.Field().getFields().remediationItem;
							var remediationItemKey = JSON.parse(this.data).fields[ field ];

							remediationsService.removeFromMyPlan(
								currentEnvironment,
								remediationItemKey);

							if ( (issueCreated+issueNotCreated)  === plannedItems.length ) {
								self.loadAllRemediationsItems();
							}

						}).always(function(){
							JIRA.Loading.hideLoadingIndicator();
						});
					}
				}).fail( function( jqXHR, textStatus) {

					JIRA.Messages.showWarningMsg(
							'Error ('+jqXHR.status+'): '
							+jqXHR.statusText);

					for (var i = 0; i < plannedItems.length; i++) {
						//remove remediations of my plan
						remediationsService.removeFromMyPlan(
							currentEnvironment,
							plannedItems[i].key
						).always(function(){

							remediationItemRemoved++;

							if ( remediationItemRemoved  === plannedItems.length ) {
								self.loadAllRemediationsItems();
							}
						});
					}
					JIRA.Loading.hideLoadingIndicator();
				});

			};

			/**
			 * Return the selected filters in array format
			 */
			self.getSelectedFiltersArray = function() {
				var filtersArray = [];
				if (selectedFilters) {
					for(var i = 0; i< selectedFilters.length; i++) {
						var itemKey = selectedFilters[i].type === 'application' ? selectedFilters[i].name : selectedFilters[i].key;
						filtersArray.push(selectedFilters[i].type+":"+itemKey);
					}
				}
				return filtersArray;
			};

			/**
			 * Validates if there are selected environment and project to enabel store rules button.
			 */
			self.isReadySaveRuleButton = function() {
				var project = AJS.$( "#select-project" ).val();
				var ruleName = AJS.$( "#rule-name" ).val();
				if( currentEnvironment  && project && ruleName){
					AJS.$( "#save-rule-button" ).prop('disabled', false);
				} else {
					AJS.$( "#save-rule-button" ).prop('disabled', true);
				}
			};

			/**
			 * Store a new rule
			 */
			self.storeRules = function(){

				var group = AJS.$( "#select-group" ).val();
				var project = AJS.$( "#select-project" ).val();
				var ruleName = AJS.$( "#rule-name" ).val();
				var filters = self.getSelectedFiltersArray();
				var id = AJS.$( "#rule-id" ).val();

				if( id === ''){
					var projectIsConfigured = jiraService.ConfigureProject(project);
					projectIsConfigured.done( function(){
						var rulePromise = rulesService.createRule( project, group, currentEnvironment, filters, ruleName);

						rulePromise.done( function( data ) {
							JIRA.Messages.showSuccessMsg(
								AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.programed"
							));
							//clean the rule name
							AJS.$( "#rule-name" ).val("");
						});
						rulePromise.fail( function( data ) {
							JIRA.Messages.showWarningMsg(
								AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.programming.error")
							);
						});

					});

					projectIsConfigured.fail( function() {
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.projectnotconfigured.error")
						);
					});
				} else {
					var rulePromise = rulesService.updateRule( id, project, group, currentEnvironment, filters, ruleName);
					rulePromise.done( function( data ) {
						JIRA.Messages.showSuccessMsg(
							AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.updated"
						));
					});
					rulePromise.fail( function( data ) {
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.updated.error")
						);
					});
				}
			};

			/**
			 * Create a object filter with a array of string like ['aplication:Apache','region:aws/east']
			 * @param  {Array} Array of with the filters
			 * @return {Array} Array of objects filter
			 */
			self.reverseRule = function(ruleFilter) {
				var arrayFilter = ruleFilter.split(":");
				var type = arrayFilter[0];
				var value = arrayFilter[1];

				var obj={
					type : type
				};

				if( type === 'application' ){
					obj.name = value;
				}
				else{
					obj.key = value;
				}
				return obj;
			};

			self.loadRule= function() {
				ruleId = AJS.$( "#rule-id" ).val();

				rulesService.getRule(ruleId).done(function(data){
					AJS.$( "#rule-name" ).val(data.name);
					AJS.$( "#select-environment" ).select2().select2('val',data.environment);
					AJS.$( "#select-project" ).select2().select2('val',data.project);
					AJS.$( "#select-group" ).select2().select2('val',data.group);

					//Validations
					if(AJS.$( "#select-environment" ).val() === ''){
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.environment.warning")
						);
					}
					if(AJS.$( "#select-project" ).val() === ''){
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.project.warning")
						);
					}
					if(AJS.$( "#select-group" ).val() == '' && data.group != '' ){
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.remediationssync.js.msg.rule.group.warning")
						);
					}


					var filtersArray = [];
					if (data.hasOwnProperty("filters")) {

						for(var i = 0; i< data.filters.length; i++) {
							filtersArray.push(data.filters[i].key);
							selectedFilters.push(reverseRule(data.filters[i].key));
						}
					}

					if( AJS.$( "#select-environment" ).val() != ''){
						currentEnvironment = AJS.$( "#select-environment" ).val();
						self.refreshAfterFilterChange();
					}
				});
			};

			/**
			 * Save rule button
			 */
			Bootstrap.onView("#save-rule-button", function(){
				AJS.$( "#save-rule-button" ).click(function() {
					self.storeRules();
				});
			});

		});
	}
);
