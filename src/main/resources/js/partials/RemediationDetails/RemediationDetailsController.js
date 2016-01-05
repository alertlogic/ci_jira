/**
 * Fire the form dialog before it´s rendered by JIRA.
 */
AJS.$(function () {
    JIRA.Dialogs.remediationDetails = new JIRA.FormDialog({
        id: "schedule-dialog",
        trigger: "a.issueaction-showdetail",
        ajaxOptions: JIRA.Dialogs.getDefaultAjaxOptions,
        onSuccessfulSubmit : JIRA.Dialogs.storeCurrentIssueIdOnSucessfulSubmit,
        issueMsg : 'thanks_issue_updated',
        width: window.innerWidth*0.8
    });
});
/**
 * Explicit load of the controller, to be used
 * into a JIRA Dialog.
 */
function remediationDetailsController( issueId ) {
    AJS.$(document).ready(
        function() {
            Bootstrap.start(function(){
                var self = this;

                var remediationDetails = {
                    basic: {},
                    assets: {},
                    assetsDetails: {
                        titles: {},
                        values: {}
                    },
                    vulnerabilities: {},
                    filters: {},
                    environment: null,
                    remediationId: null
                };
                /**
                *Print a csv with the information of a remediation
                */
                self.printCsv = function(){
                    JIRA.Loading.showLoadingIndicator();

                    var csv = AUIUtils.csvTitleFormat( AJS.I18n.getText("ci.partials.remediationdetails.js.csv.description.title") );
                    csv += AUIUtils.csvHeaderFormat( remediationDetails.basic.titles );
                    csv += AUIUtils.arrayToCsv( remediationDetails.basic.values, 'horizontal' );
                    csv += AUIUtils.csvNewLine();

                    csv += AUIUtils.csvTitleFormat( AJS.I18n.getText("ci.partials.remediationdetails.js.csv.vulnerabilities.title") );
                    csv += AUIUtils.csvHeaderFormat( remediationDetails.vulnerabilities.titles );
                    csv += AUIUtils.arrayToCsv( remediationDetails.vulnerabilities.values , 'none' );
                    csv += AUIUtils.csvNewLine();

                    csv += AUIUtils.csvTitleFormat( AJS.I18n.getText("ci.partials.remediationdetails.js.csv.filters.title") );
                    csv += AUIUtils.csvHeaderFormat( remediationDetails.filters.titles );
                    csv += AUIUtils.arrayToCsv( remediationDetails.filters.values , 'vertical');
                    csv += AUIUtils.csvNewLine();

                    csv += AUIUtils.csvTitleFormat( AJS.I18n.getText("ci.partials.remediationdetails.js.csv.assets.title") );

                    //go for the details
                    var countResolve = 0;
                    var assets = [];
                    var assetsLength = Object.keys( remediationDetails.assets.values ).length ;

                    for( assetKey in remediationDetails.assets.values ){
                        assetsService.byType(
                            remediationDetails.environment,
                            AUIUtils.getTypeFromKey( assetKey ) ,
                            assetKey
                        ).always(function( data ){
                            countResolve++;

                            if( data.assets.length > 0){
                                assets.push( data.assets[0][0] );
                            }
                            if (countResolve >= assetsLength ) {

                                if( assets ){
                                    remediationDetails.assetsDetails = remediationSupportService.getAssetsDetailsByType( assets, remediationDetails.assets.values );
                                }

                                csv += AUIUtils.csvHeaderFormat( remediationDetails.assetsDetails.titles );
                                csv += AUIUtils.arrayToCsv( remediationDetails.assetsDetails.values , 'none');
                                window.open("data:text/csv;charset=utf-8," + escape( csv ));
                                JIRA.Loading.hideLoadingIndicator();
                            }
                        });
                    }
                };

                /**
                *Insert table of vulnerabilities
                */
                self.buildVulnerabilityTable = function(){
                    if( remediationDetails.vulnerabilities.hasOwnProperty("titles") ){
                        var headerName = remediationDetails.vulnerabilities.titles.description;
                        var headerElement = AJS.$("#vulnerabilitiesTable thead tr");
                        AUIUtils.addTableHeader( headerElement, headerName, AJS.I18n.getText("ci.partials.remediationdetails.js.html.exposures.title")+" ( " + remediationDetails.vulnerabilities.values.length + " )");

                        for (idx in remediationDetails.vulnerabilities.values)
                        {
                            var tableBody = AJS.$("#vulnerabilitiesTable tbody");
                            var vul = remediationDetails.vulnerabilities.values[idx];
                            var html = "";

                            var classCss = AUIUtils.getThreatLevelClass( vul.severity );

                            html += "<div class='" + classCss + " vulnerabilities-row'>" + vul.description;
                            html +=     "<div id='"+vul.id+"' class='aui-expander-content'>";
                            html +=         "<p><strong>"+AJS.I18n.getText("ci.partials.remediationdetails.js.html.vulnerabilities.expander.impact");
                            html +=            "</strong></p><span><small>" + vul.impact + "</small></span>";
                            html +=         "<p><strong>"+AJS.I18n.getText("ci.partials.remediationdetails.js.html.vulnerabilities.expander.resolution");
                            html +=         "</strong></p><span><small>" + vul.resolution + "</small></span>";
                            html +=     "</div>";
                            html +=     "<a data-replace-text='" + AJS.I18n.getText("ci.partials.remediationdetails.js.html.vulnerabilities.expander.less") + "' class='aui-expander-trigger' aria-controls='" + vul.id + "'> "
                            html +=      AJS.I18n.getText("ci.partials.remediationdetails.js.html.vulnerabilities.expander.more");
                            html +=      "</a>";
                            html += "</div>";

                            var rowData = [
                                {
                                    header: headerName,
                                    data: html
                                }
                            ];

                            AUIUtils.createTableRow( tableBody, rowData );
                        }
                    }
                };

                /**
                *Show the details of an asset
                */
                self.showAssetDetailHtml = function( assetKey ){

                    assetsService.byType(
                        remediationDetails.environment ,
                        AUIUtils.getTypeFromKey( assetKey ) ,
                        assetKey
                    )
                    .done( function( data ){

                        if( data.assets.length > 0 ){
                            var tableBody = AJS.$("#assetsTableDetails tbody");

                            AUIUtils.clearTable( "#assetsTableDetails" );
                            var asset = remediationSupportService.getAssetsDetailsByType( data.assets[0], remediationDetails.assets.values ).values[0];

                            for (property in asset)
                            {
                                var rowData = [
                                    {
                                        data: "<div class='table-div'>" + assetDictionaryService.getCaption(property) +"</div>"
                                    },
                                    {
                                        data: "<div class='table-div'>" + asset[ property ] + "</div>"
                                    }
                                ];
                                AUIUtils.createTableRow( tableBody, rowData, "table-simple" );
                            }
                        }
                    });
                };

                /**
                *Insert table of assets
                */
                self.buildAssetsTable = function(){
                    if( remediationDetails.assets.hasOwnProperty("titles") ){
                        var headerNameType = remediationDetails.assets.titles.type;
                        var headerNameAsset = remediationDetails.assets.titles.asset;
                        var headerElementAsset = AJS.$("#assetsTable thead tr");
                        AUIUtils.addTableHeader( headerElementAsset, headerNameType, AJS.I18n.getText("ci.partials.remediationdetails.js.assets.column.type"));
                        AUIUtils.addTableHeader( headerElementAsset, headerNameAsset, AJS.I18n.getText("ci.partials.remediationdetails.js.assets.column.assets"));

                        for (idxAsset in remediationDetails.assets.values)
                        {
                            var tableBody = AJS.$("#assetsTable tbody");
                            var rowData = [
                                {
                                    header: headerNameType,
                                    style: 'row_pointer',
                                    action: 'showAssetDetailHtml(\'' + idxAsset + '\')',
                                    data: remediationDetails.assets.values[ idxAsset ].type
                                },
                                {
                                    header: headerNameAsset,
                                    style: 'row_pointer',
                                    action: 'showAssetDetailHtml(\'' + idxAsset + '\')',
                                    data: remediationDetails.assets.values[ idxAsset ].asset
                                }
                            ];
                            AUIUtils.createTableRow( tableBody, rowData);
                        }
                    }
                };

                /**
                *Insert table of filters
                */
                self.buildFiltersTable = function(){
                    if( remediationDetails.filters.hasOwnProperty("titles") ){
                        var headerNameFilter = remediationDetails.filters.titles.filter;
                        var headerElementFilter = AJS.$("#filtersTable thead tr");
                        AUIUtils.addTableHeader( headerElementFilter, headerNameFilter, AJS.I18n.getText("ci.partials.remediationdetails.js.html.filters.title") );

                        for (idx in remediationDetails.filters.values)
                        {
                            var tableBody = AJS.$("#filtersTable tbody");
                            var rowData = [
                                {
                                    header: headerNameFilter,
                                    data: "<div>" + remediationDetails.filters.values[ idx ].type + " : " + remediationDetails.filters.values[ idx ].filter + "</div>"
                                }
                            ];

                            AUIUtils.createTableRow( tableBody, rowData);
                        }
                    }
                };
                /**
                *Insert table of details
                */
                self.buildDetails = function(){
                    var basicElement = AJS.$("#detailsPanel");
                    if( remediationDetails.basic.hasOwnProperty("titles") ){

                        basicElement.append("<h1>" + AUIUtils.htmlLize( remediationDetails.basic.values.name ) + '</h1>');

                        if( remediationDetails.basic.titles.hasOwnProperty("description") ){
                            basicElement.append('<p><small>' + AUIUtils.htmlLize( remediationDetails.basic.values.description ) + '</small></p>');
                        }
                    }
                };
                /**
                *Print a html with the information of a remediation
                */
                self.printHtmlDetails = function(){

                    var loading = AJS.$("#details-loading").addClass("hidden");
                    var content = AJS.$("#details-content").removeClass("assistive");

                    //Details
                    self.buildDetails();

                    //vulnerabilities
                    self.buildVulnerabilityTable();

                    //assets
                    self.buildAssetsTable();

                    //filters
                    self.buildFiltersTable();
                };

                /**
                * Load the details of a remediations on Cloud Insight
                */
                self.loadDetailsFromCI = function(  remediationKey, remediationItemKey ){
                    var environment = remediationsService.getEnvironmentFromRemediationItem( remediationItemKey );
                    var remediationId =  AUIUtils.getLastDetailFromKey( remediationKey );
                    var arrayVulnsFromAssets = [];
                    remediationDetails.environment = environment;
                    remediationDetails.remediationId = remediationId;

                    //get information of remediations
                    var filters = remediationsService.getFiltersByRemediationItem( environment, remediationItemKey );
                    var description = remediationsService.getRemediationById( remediationId );
                    var vulnerabilitiesDetails = remediationsService.getVulnerabilityDetailsByRemediationId( remediationId );
                    var assetsAffected = remediationsService.getVulnerabilityAndAssetsByRemediationId( environment, remediationKey );

                    description.done( function( descriptionData ) {
                        remediationDetails.basic = remediationSupportService.getDescription ( descriptionData );
                    });
                    description.fail( function() {
                        assetsAffected.done( function( data ){
                            remediationDetails.basic = remediationSupportService.getDescriptionFromAssets ( data , remediationKey );
                        })
                        assetsAffected.fail( function(){
                            self.showError( '#detailsPanel', AJS.I18n.getText("ci.partials.remediationdetails.js.error.description.notfound") );
                        });
                    });

                    filters.done( function( filtersData ) {
                        remediationDetails.filters = remediationSupportService.getFiltersUsed ( filtersData );
                    });
                    filters.fail( function() {
                        self.showError( '#filtersTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.filters.notfound") );
                    });

                    assetsAffected.done( function( assetsData ) {
                        remediationDetails.assets = remediationSupportService.getAssets ( assetsData , remediationKey );
                        arrayVulnsFromAssets = remediationSupportService.getVulnerabilitiesIdFromAssets( assetsData, remediationKey );
                    });
                    assetsAffected.fail( function() {
                        self.showError( '#assetsTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.assets.notfound") );
                        self.showError( '#vulnerabilitiesTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.vulnerabilities.notfound") );
                    });

                    //whatever
                    filters.always(function(){
                        description.always(function(){
                            assetsAffected.always(function(){
                                vulnerabilitiesDetails.done( function( vulnsData ) {
                                    remediationDetails.vulnerabilities = remediationSupportService.getVulnerabilitiesDetails ( vulnsData , arrayVulnsFromAssets );
                                });
                                vulnerabilitiesDetails.fail( function() {
                                    self.showError( '#vulnerabilitiesTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.vulnerabilities.notfound") );
                                });
                                vulnerabilitiesDetails.always(function(){
                                    self.printHtmlDetails();
                                });
                            });
                        });
                    });
                };

                /**
                * Load information of a remediation
                */
                self.loadData = function( jiraIssueId ){

                    var fields = jiraService.Field().getFields();

                    var remediationItemCustomName = fields.remediationItem ;
                    var remediationIdCustomName = fields.remediationId ;
                    var jiraGroupCustomName = fields.group ;

                    if( remediationItemCustomName != null  && remediationIdCustomName != null && jiraGroupCustomName != null)
                    {
                        var issue = jiraService.Issue().getById( jiraIssueId );

                        issue.done( function( issueData ) {
                            //get and transform data
                            var remediationItemKey =  issueData.fields[ remediationItemCustomName ];
                            var remediationKey =  issueData.fields[ remediationIdCustomName ];
                            self.loadDetailsFromCI( remediationKey, remediationItemKey );
                        });

                        issue.fail( function() {
                            self.showError( '#details-error',AJS.I18n.getText("ci.partials.remediationdetails.js.error.issue.notfound") );
                        });
                    }
                };

                /*
                *show a error message
                */
                self.showError = function ( selector , error ){
                    var loading = AJS.$("#details-loading").addClass("hidden");
                    var content = AJS.$( selector ).removeClass("assistive");
                    content.append( error );
                }
                /**
                *Hide the dialog
                */
                Bootstrap.onView('#detailsRemediationCancelButton', function(){
                    AJS.$("#detailsRemediationCancelButton").click(function(){
                        JIRA.Dialogs.remediationDetails.hide();
                    });
                });
                /**
                *Send to print a csv
                */
                Bootstrap.onView('#detailsRemediationCsvButton', function(){
                    AJS.$("#detailsRemediationCsvButton").click(function(){
                        self.printCsv();
                    });
                });

                //call the function
                self.loadData( issueId );
            });
        }
    );
}