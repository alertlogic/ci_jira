/**
 * Global vars
 */
var currentEnvironment = null;
var actingAccountId = null;
var incidentsSyncController;
/**
 * Incidents sync page Controller
 */
AJS.$(document).ready(
	function() {
		var currentUser = AJS.Meta.get('remote-user');
		var ruleType = 'incident';

		Bootstrap.start( currentUser, function(){
			var self = incidentsSyncController = this;

			var selectedFilters;
			var incidentsFilter;
			var ruleId;

			Bootstrap.onView("#select-project", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#select-project" ).auiSelect2();
				}
				AJS.$( "#select-project" ).change(function() {
					self.isReadySaveRuleButton();
				});
			});

			Bootstrap.onView("#select-group", function(){
				if( typeof jQuery.fn.auiSelect2 == 'function') {
					AJS.$( "#select-group" ).auiSelect2();
				}
			});

			Bootstrap.onView("#rule-name", function(){
				AJS.$( "#rule-name" ).keyup(function() {
					self.isReadySaveRuleButton();
				});
			});

			/**
			 * Save rule button
			 */
			Bootstrap.onView("#save-rule-button", function(){
				AJS.$( "#save-rule-button" ).click(function() {
					self.storeRules();
				});
			});

			/**
			 * Gets the available Jira groups.
			 */
			jiraService.Groups().getAll().success(function(data){
				AUIUtils.addOptions( "#select-group", data.groups, "name", "name" );
				AJS.$( "#select-group" ).triggerHandler("change");
			});

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
			 * Get all projects that has associated the CI Incident Issue Type.
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
			 * Return true if the filter is already selected.
			 * @param  {Object}  filter The filter reference
			 * @return {Boolean}        True if is selected
			 */
			self.isSelected = function( filter ) {
				if (selectedFilters) {
					for (var i = 0; i < selectedFilters.length; i++) {
						if (selectedFilters[i].key === filter.key) {
							// add class_style information in filter selected.
							selectedFilters[i].class_style = filter.class_style;

							return true;
						}

					}
				}
				return false;
			};

			/**
			 * Adds a filter to the view.
			 * @param {String} type     The filter type
			 * @param {Int} position The filter position
			 */
			self.addFilter = function(position) {
				if (!selectedFilters) {
					selectedFilters = [];
				}

				if (!self.isSelected(incidentsFilter[position])) {
					selectedFilters.push(incidentsFilter[position]);

					self.refreshAfterFilterChange();
				}
				self.isReadySaveRuleButton();
			};

			/**
			 * Updates the filter list
			 */
			self.updateFilterList = function() {
				AUIUtils.clearTable("#dataFilters");

				incidentsFilter = incidentsUtilityService.incidentsFilters;

				for (var i = 0; i < incidentsFilter.length; i++ ) {
					//Ignore the selected ones.
					if (!self.isSelected(incidentsFilter[i])) {

						var tableBody = AJS.$("#dataFilters tbody");

						var displayName = AUIUtils.getFilterDisplayName(incidentsFilter[i]);

						var rowData = [
							{
								header:"header-filter",
								data: "<div class='filter-row "
									+incidentsFilter[i].class_style
									+"' >"
									+displayName+"</div>",
								action: 'incidentsSyncController.addFilter('+i+')'
							}
						];

						AUIUtils.createTableRow(tableBody,rowData);
					}
				}
			};

			self.updateFilterList();

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
									+selectedFilters[i].class_style
									+"' >"
									+displayName+"</div>"
							},
							{
								data: "<div class='button-x-delete'>X</div>"
							}
						];

						AUIUtils.createTableRow(tableBody,rowData, "row-filter-selected", 'incidentsSyncController.removeFilter('+i+')' );
					}
				}
			};

			/**
			 * Updates the view after a filter change.
			 */
			self.refreshAfterFilterChange = function() {
				self.updateSelectedFilterList();
				self.updateFilterList();
			};

			/**
			 * Validates if there are selected environment and project to enabel store rules button.
			 */
			self.isReadySaveRuleButton = function() {
				var project = AJS.$( "#select-project" ).val();
				var ruleName = AJS.$( "#rule-name" ).val();
				if( project && ruleName){
					AJS.$( "#save-rule-button" ).prop('disabled', false);
				} else {
					AJS.$( "#save-rule-button" ).prop('disabled', true);
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

			self.loadRule= function() {
				ruleId = AJS.$( "#rule-id" ).val();

				rulesService.getRule(ruleId).done(function(data){
					AJS.$( "#rule-name" ).val(data.name);
					AJS.$( "#select-project" ).select2().select2('val',data.project);
					AJS.$( "#select-group" ).select2().select2('val',data.group);

					if(AJS.$( "#select-project" ).val() === ''){
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.project.warning")
						);
					}
					if(AJS.$( "#select-group" ).val() == '' && data.group != '' ){
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.group.warning")
						);
					}


					var filtersArray = [];
					if (data.hasOwnProperty("filters")) {

						for(var i = 0; i< data.filters.length; i++) {
							filtersArray.push(data.filters[i].key);
							selectedFilters.push(reverseRule(data.filters[i].key));
						}
					}
				});
			};

			/**
             * Return the selected filters in array format
             */
            self.getSelectedFiltersArray = function() {
                var filtersArray = [];
                if (selectedFilters) {
                    for(var i = 0; i< selectedFilters.length; i++) {
                        var itemKey = selectedFilters[i].key;
                        filtersArray.push(selectedFilters[i].type+":"+itemKey);
                    }
                }
                return filtersArray;
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
						var rulePromise = rulesService.createRule( actingAccountId, project, group, currentEnvironment, filters, ruleName, ruleType);

						rulePromise.done( function( data ) {
							JIRA.Messages.showSuccessMsg(
								AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.programed"
							));
							//clean the rule name
							AJS.$( "#rule-name" ).val("");
						});
						rulePromise.fail( function( data ) {
							JIRA.Messages.showWarningMsg(
								AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.programming.error")
							);
						});

					});

					projectIsConfigured.fail( function() {
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.projectnotconfigured.error")
						);
					});
				} else {
					var rulePromise = rulesService.updateRule( actingAccountId, id, project, group, currentEnvironment, filters, ruleName, ruleType);
					rulePromise.done( function( data ) {
						JIRA.Messages.showSuccessMsg(
							AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.updated"
						));
					});
					rulePromise.fail( function( data ) {
						JIRA.Messages.showWarningMsg(
							AJS.I18n.getText("ci.partials.incidentssync.js.msg.rule.updated.error")
						);
					});
				}
			};

		});
	}
);
