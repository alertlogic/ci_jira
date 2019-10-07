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
        width: window.innerWidth*0.95
    });
});
/**
 * Explicit load of the controller, to be used
 * into a JIRA Dialog.
 */
function remediationDetailsController( issueId ) {
    AJS.$(document).ready(
        function() {
            var issue = jiraService.Issue().getById( issueId );

            issue.done( function( issueData ){
                var user = issueData.fields.reporter.name;

                Bootstrap.start( user, function(){
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
                        evidences: {},
                        environment: null,
                        remediationId: null
                    };

                    var remediationComplements = {
                        assets: {},
                        vulnerabilities: {},
                        evidences: {}
                    };

                    var lastElementSelected = {
                        vulnerability:'',
                        asset:'',
                        evidence:''
                    };

                    /**
                    * Print a csv with the information of a remediation
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

                        csv += AUIUtils.csvTitleFormat( AJS.I18n.getText("ci.partials.remediationdetails.js.csv.evidences.title") );
                        csv += AUIUtils.csvHeaderFormat( remediationDetails.evidences.titles );
                        csv += AUIUtils.arrayToCsv( remediationDetails.evidences.values , 'none');
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
                                [{
                                    key: AUIUtils.getTypeFromKey( assetKey )+'.key',
                                    value: assetKey
                                }]
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
                     * Review if the key is already selected
                     */
                    self.isUnSelected = function( key , value){

                        if( lastElementSelected[ key ] === value){
                            lastElementSelected[ key ]= '';
                            return true;
                        }
                        else{
                            lastElementSelected[ key ] = value;
                            return false;
                        }
                    };

                    /**
                     * Review if a row should be shown or hide
                     * @param  {string} key   element key
                     * @param  {string} item filtered it can be  (vulnerabilities,evidences,assets)
                     */
                    self.shoulBeFiltered = function( key, filter){
                        if( lastElementSelected.vulnerability && filter != 'vulnerabilities'){
                            if( remediationComplements.vulnerabilities.hasOwnProperty( lastElementSelected.vulnerability ) ){
                                if( remediationComplements.vulnerabilities[ lastElementSelected.vulnerability ][ filter ].indexOf( key ) == -1){
                                    return true;
                                }
                            }
                        }
                        if( lastElementSelected.evidence && filter != 'evidences'){
                            if( remediationComplements.evidences.hasOwnProperty( lastElementSelected.evidence ) ){
                                if( remediationComplements.evidences[ lastElementSelected.evidence ][ filter ].indexOf( key ) == -1){
                                    return true;
                                }
                            }
                        }
                        if( lastElementSelected.asset && filter != 'assets'){
                            if( remediationComplements.assets.hasOwnProperty( lastElementSelected.asset ) ){
                                if( remediationComplements.assets[ lastElementSelected.asset ][ filter ].indexOf( key ) == -1){
                                    return true;
                                }
                            }
                        }
                        return false;
                    };

                    /**
                     * Filter the visual content
                     */
                    self.filterVisualContent = function(){
                        //filter by asset
                        for( i in  remediationDetails.assets.values ){
                            var elementBody = AJS.$( "#"+ AUIUtils.escapeSelector ( i ));
                            if( self.shoulBeFiltered( i ,'assets' ) ){
                                elementBody.addClass('table-simple-invisible');
                            }else{
                                elementBody.removeClass('table-simple-invisible');
                            }
                        }
                        //filter by evidence
                        for( i = 0; i< remediationDetails.evidences.values.length; i++ ){
                            var elementBody = AJS.$( "#"+ AUIUtils.escapeSelector ( remediationDetails.evidences.values[ i ].key ));
                            if( self.shoulBeFiltered(  remediationDetails.evidences.values[i].key ,'evidences' ) ){
                                elementBody.addClass('table-simple-invisible');
                            }else{
                                elementBody.removeClass('table-simple-invisible');
                            }
                        }
                        //filter by vulnerabilities
                        for( i = 0; i< remediationDetails.vulnerabilities.values.length; i++ ){
                            var elementBody = AJS.$( "#"+ AUIUtils.escapeSelector ( remediationDetails.vulnerabilities.values[ i ].id ));
                            if( self.shoulBeFiltered(  remediationDetails.vulnerabilities.values[i].id ,'vulnerabilities' ) ){
                                elementBody.addClass('table-simple-invisible');
                            }else{
                                elementBody.removeClass('table-simple-invisible');
                            }
                        }
                    };

                    /**
                    * Show the details of a vulnerability id
                    */
                    self.showVulnerabilityDetailHtml = function( vulnId ){
                        AJS.$( '.detailsVulnerability').addClass('hidden');
                        AJS.$( '#vulnerabilitiesTable .table-simple-visible > td').removeClass('table-simple-row-selected');

                        if( !self.isUnSelected( 'vulnerability', vulnId ) )
                        {

                            AJS.$( "#"+ AUIUtils.escapeSelector ( vulnId ) + " > td .detailsVulnerability " ).removeClass('hidden');
                            AJS.$( "#"+ AUIUtils.escapeSelector ( vulnId ) + " > td ").addClass("table-simple-row-selected");
                        }
                        self.filterVisualContent();
                    };

                    /**
                    * Insert table of vulnerabilities
                    */
                    self.buildVulnerabilityTable = function(){

                        if( remediationDetails.vulnerabilities.hasOwnProperty("titles") ){
                            var labelImpact = AJS.I18n.getText("ci.partials.remediationdetails.js.html.vulnerabilities.expander.impact");
                            var labelResolution = AJS.I18n.getText("ci.partials.remediationdetails.js.html.vulnerabilities.expander.resolution");

                            var headerName = remediationDetails.vulnerabilities.titles.description;
                            var headerElement = AJS.$("#vulnerabilitiesTable thead tr");
                            AUIUtils.addTableHeader( headerElement, headerName, AJS.I18n.getText("ci.partials.remediationdetails.js.html.exposures.title")+" ( " + remediationDetails.vulnerabilities.values.length + " )", 'table-simple-head');

                            for (idx in remediationDetails.vulnerabilities.values)
                            {
                                var tableBody = AJS.$("#vulnerabilitiesTable tbody");
                                var vul = remediationDetails.vulnerabilities.values[idx];
                                var html = "";

                                var classCss = AUIUtils.getThreatLevelClass( vul.severity );

                                html += "<div>" ;
                                html +=     "<div class='" + classCss + " vulnerabilities-row'>"+ vul.description + "</div>";
                                html +=     "<div class='detailsVulnerability hidden'>";
                                html +=         "<p><strong>"+ labelImpact +"</strong></p>";
                                html +=            "<span><small>" + AUIUtils.htmlLize(vul.impact) + "</small></span>";
                                html +=         "<p><strong>"+ labelResolution + "</strong></p>";
                                html +=         "<span><small>" + AUIUtils.htmlLize(vul.resolution) + "</small></span>";
                                html +=     "</div>";
                                html += "</div>";

                                var rowData = [
                                    {
                                        data: html,
                                        style: 'table-simple-row',
                                        action: 'showVulnerabilityDetailHtml(\'' + vul.id + '\')'
                                    }
                                ];

                                AUIUtils.createTableRow( tableBody, rowData, 'table-simple-visible', null, vul.id );
                            }
                        }

                    };

                    /**
                    * Show the details of an asset
                    */
                    self.showAssetDetailHtml = function( assetKey ){
                        AJS.$( '#assetsTable .table-simple-visible > td').removeClass('table-simple-row-selected');
                        AJS.$( '.detailsAsset > ul > li').remove();
                        AJS.$( '.detailsAsset > ul').remove();

                        if( !self.isUnSelected( 'asset', assetKey ) )
                        {
                            AJS.$( "#"+ AUIUtils.escapeSelector ( assetKey ) + " > td ").addClass("table-simple-row-selected");

                            assetsService.byType(
                                remediationDetails.environment ,
                                AUIUtils.getTypeFromKey( assetKey ),
                                [{
                                    key: AUIUtils.getTypeFromKey( assetKey )+'.key',
                                    value: assetKey
                                }]
                            )
                            .done( function( data ){

                                if( data.assets.length > 0 ){
                                    var elementBody = AJS.$( "#"+ AUIUtils.escapeSelector ( assetKey ) + " > td .detailsAsset" );
                                    var asset = remediationSupportService.getAssetsDetailsByType(
                                        data.assets[0],
                                        remediationDetails.assets.values ).values[0];

                                    var html  = "<ul>";
                                    for (property in asset)
                                    {
                                        html +=  "<li><strong>"+ assetDictionaryService.getCaption(property) +"</strong> : "+ asset[ property ] + "</li>";
                                    }
                                    html  += "</ul>";
                                    elementBody.append( html );
                                }
                            });
                        }
                        self.filterVisualContent();
                    };

                    /**
                    * Show the details of a vulnerability id
                    */
                    self.showEvidenceDetailHtml = function( evidenceId ){
                        AJS.$( '.detailsEvidenceBody').addClass('hidden');
                        AJS.$( '.detailsEvidenceHead').removeClass('hidden');
                        AJS.$( '#evidencesTable > .table-simple-visible').removeClass('table-simple-invisible');
                        AJS.$( '#evidencesTable .table-simple-visible > td').removeClass('table-simple-row-selected');

                        if( !self.isUnSelected( 'evidence', evidenceId ) )
                        {
                            AJS.$( "#"+ AUIUtils.escapeSelector ( evidenceId ) + " > td .detailsEvidenceBody " ).removeClass('hidden');
                            AJS.$( "#"+ AUIUtils.escapeSelector ( evidenceId ) + " > td .detailsEvidenceHead " ).addClass('hidden');
                            AJS.$( "#"+ AUIUtils.escapeSelector ( evidenceId ) + " > td ").addClass("table-simple-row-selected");
                        }
                        self.filterVisualContent();
                    };

                    /**
                    * Insert table of assets
                    */
                    self.buildAssetsTable = function(){
                        if( remediationDetails.assets.hasOwnProperty("titles") ){
                            var headerNameAsset = remediationDetails.assets.titles.asset;
                            var headerElementAsset = AJS.$("#assetsTable thead tr");
                            var assetsLength = Object.keys( remediationDetails.assets.values ).length ;
                            AUIUtils.addTableHeader( headerElementAsset,
                                headerNameAsset,
                                AJS.I18n.getText("ci.partials.remediationdetails.js.assets.column.assets") + " ( " +assetsLength + " )",
                                'table-simple-head');

                            for (i in remediationDetails.assets.values)
                            {
                                var target = remediationDetails.assets.values[ i ];
                                var html = "<div>" +target.asset ;
                                html +=        "<div class='detailsAsset'></div>";
                                html +=    "</div>";

                                var tableBody = AJS.$("#assetsTable tbody");
                                var rowData = [
                                    {
                                        data: html,
                                        style: 'table-simple-row'
                                    }
                                ];
                                AUIUtils.createTableRow( tableBody, rowData, 'table-simple-visible', 'showAssetDetailHtml(\'' + i + '\')', target.key);
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

                            for (i in remediationDetails.filters.values)
                            {
                                var tableBody = AJS.$("#filtersTable tbody");
                                var rowData = [
                                    {
                                        header: headerNameFilter,
                                        data: "<div>" + remediationDetails.filters.values[ i ].type + " : " + remediationDetails.filters.values[ i ].filter + "</div>"
                                    }
                                ];

                                AUIUtils.createTableRow( tableBody, rowData);
                            }
                        }
                    };

                    /**
                    * Insert table of evidence
                    */
                    self.buildEvidencesTable = function(){

                        if( remediationDetails.evidences.hasOwnProperty("titles") ){
                            var headerElement = AJS.$("#evidencesTable thead tr");
                            AUIUtils.addTableHeader( headerElement, '', AJS.I18n.getText("ci.partials.remediationdetails.js.html.evidence.title")+" ( " + remediationDetails.evidences.values.length + " )", 'table-simple-head');

                            for (i in remediationDetails.evidences.values)
                            {
                                var tableBody = AJS.$("#evidencesTable tbody");
                                var evidence = remediationDetails.evidences.values[ i ];

                                var html = "<div>" ;
                                    html +=     "<div class='detailsEvidenceHead'>"+  evidence.details.substring(0,30) + "...</div>";
                                    html +=     "<div class='detailsEvidenceBody hidden'>";
                                    html +=          evidence.details ;
                                    html +=     "</div>";
                                    html += "</div>";

                                var rowData = [
                                    {
                                        data: html,
                                        style: 'table-simple-row'
                                    }
                                ];
                                AUIUtils.createTableRow( tableBody, rowData, 'table-simple-visible', 'showEvidenceDetailHtml(\''+evidence.key+'\')', evidence.key );
                            }
                        }
                    };

                    /**
                    * Insert table of details
                    */
                    self.buildDetails = function(){
                        var basicElement = AJS.$("#detailsPanel");
                        if( remediationDetails.basic.hasOwnProperty("titles") ){

                            basicElement.append("<h1>" + AUIUtils.htmlLize( remediationDetails.basic.values.name ) + '</h1>');

                            if( remediationDetails.basic.titles.hasOwnProperty("description") ){
                                basicElement.append('<p><small>' + AUIUtils.htmlLize( remediationDetails.basic.values.description ) + '</small></p>');
                            }
                        }
                        if( remediationDetails.assets.hasOwnProperty("created_on") ){
                            basicElement.append("<p><small>"
                                    + AJS.I18n.getText("ci.partials.remediationdetails.js.remediation.updated")
                                    + remediationDetails.assets.created_on
                                    + "</p></small>");
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

                        self.buildEvidencesTable();
                    };

                    /**
                    * Load the details of a remediations on Cloud Insight
                    */
                    self.loadDetailsFromCI = function(  remediationKey, remediationItemKey ){
                        var environment = remediationsService.getEnvironmentFromRemediationItem( remediationItemKey );
                        var remediationId = AUIUtils.getLastDetailFromKey( remediationKey );
                        var arrayComplementsFromAssets = [];
                        remediationDetails.environment = environment;
                        remediationDetails.remediationId = remediationId;

                        //get information of remediations
                        var filters = remediationsService.getFiltersByRemediationItem( environment, remediationItemKey );
                        var description = remediationsService.getRemediationById( remediationId );
                        var vulnerabilitiesDetails = remediationsService.getVulnerabilityDetailsByRemediationId( remediationId );
                        var assetsAffected = remediationsService.getVulnerabilityAndAssetsByRemediationId( environment, remediationKey );

                        var optionsEvidence =[
                            {
                                key: 'vulnerability.deleted_on',
                                value: 0
                            },
                            {
                                key: 'vulnerability.remediation_id',
                                value: remediationId
                            }
                        ];
                        var vulnerabilitiesEvidence = assetsService.byType( environment ,'vulnerability', optionsEvidence);

                        description.done( function( descriptionData ) {
                            remediationDetails.basic = remediationSupportService.getDescription ( descriptionData );
                        });
                        description.fail( function() {
                            assetsAffected.done( function( data ){
                                remediationDetails.basic = remediationSupportService.getDescriptionFromAssets ( data , remediationKey );
                            });
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
                            remediationComplements.vulnerabilities = remediationSupportService.getComplementVulnerabilityFromAssets( assetsData, remediationKey );
                            remediationComplements.assets = remediationSupportService.getComplementTargetFromAssets( assetsData, remediationKey );
                            remediationComplements.evidences = remediationSupportService.getComplementEvidencesFromAssets( assetsData, remediationKey );
                        });

                        assetsAffected.fail( function() {
                            self.showError( '#assetsTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.assets.notfound") );
                            self.showError( '#vulnerabilitiesTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.vulnerabilities.notfound") );
                            self.showError( '#evidencesTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.evidences.notfound") );
                        });

                        vulnerabilitiesDetails.fail( function() {
                            self.showError( '#vulnerabilitiesTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.vulnerabilities.notfound") );
                        });

                        vulnerabilitiesEvidence.fail( function() {
                            self.showError( '#evidencesTab', AJS.I18n.getText("ci.partials.remediationdetails.js.error.evidences.notfound") );
                        });

                        //whatever
                        filters.always(function(){
                            description.always(function(){
                                assetsAffected.always(function( assetsData ){
                                    vulnerabilitiesEvidence.done( function( evidenceData ) {
                                        remediationDetails.evidences = remediationSupportService.getEvidences( evidenceData , remediationComplements.evidences  );
                                    });

                                    vulnerabilitiesEvidence.always(function(  evidenceData ){
                                        vulnerabilitiesDetails.done( function( vulnsData ) {
                                            remediationDetails.vulnerabilities = remediationSupportService.getVulnerabilitiesDetails ( vulnsData , remediationComplements.vulnerabilities );
                                        });
                                        vulnerabilitiesDetails.always(function(){
                                            self.printHtmlDetails();
                                        });
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
                            //get and transform data
                            var remediationItemKey =  issueData.fields[ remediationItemCustomName ];
                            var remediationKey =  issueData.fields[ remediationIdCustomName ];
                            self.loadDetailsFromCI( remediationKey, remediationItemKey );

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
            });

            issue.fail( function() {
                self.showError( '#details-error',AJS.I18n.getText("ci.partials.remediationdetails.js.error.issue.notfound") );
            });
        }
    );
}
