/**
 * Common JIRA AUI Utils
 */
var AUIUtilsService = function() {
    var self = this;

    /**
     * Replaces the data received and converting it to html.
     */
    self.htmlLize = function(val) {
        if ( ! val ) {
            return "";
        }
        val = val.replace( /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, '<a href="$1" target="_blank">$1</a>' );
        val = val.replace( /(^|[^\/])(www\.[\S]+(\b|$))/gim, '$1<a href="http://$2" target="_blank">$2</a>');
        val = val.replace( /\r\n/g, "\n" );
        val = val.replace( /\n/g, "<br/>" );
        val = val.replace( /\ \ \ \ /g, "&nbsp;&nbsp;&nbsp;&nbsp;" );
        return val;
    };

    /**
     * Add options to a select based on a data, and
     * some two customs fields.
     * @param {String} selectId  The selectId selector
     * @param {Object} data      The data object
     * @param {String} fieldId   The id field
     * @param {String} fieldName The name field
     */
    self.addOptions = function( selectId, data, fieldId, fieldName ) {
        var element = AJS.$(selectId);

        if ( data ) {
            for (var i = 0; i < data.length; i++) {
                self.addSelectOption(
                    element,
                    data[i][fieldId],
                    data[i][fieldName]
                );
            }
        }
    };

    /**
     * Select the first record
     * some two customs fields.
     * @param {String} selectId  The selectId selector
     * @param {Object} data      The data object
     * @param {String} fieldId   The id field
     */
    self.selectFirstRecord = function( selectId, data, fieldId, fieldName ) {
        var element = AJS.$(selectId);

        if ( data ) {
            if ( data.length > 0 ){
                AJS.$( selectId ).select2().select2('val',data[0][fieldId]);
            }
        }
    };

    /**
     * Adds an option to a select
     * @param {Object} element The element reference
     * @param {String} id      The id of the option
     * @param {String} name    The text for the option
     */
    self.addSelectOption = function(element, id, name) {
        element.append('<option value="'+ id +'">'+ name + '</option>');
    };

    /**
     * Clears a select
     * @param  {String} selector The selector for the select
     */
    self.clearSelect = function( selector ) {
        AJS.$(selector).find('option').remove();
        AJS.$(selector).empty();
    }

    /**
     * Clears the table.
     * @param  {String} tableId   The table ID.
     * @param  {Boolean} clearHead True if you want to clear the header too.
     */
    self.clearTable = function( tableId, clearHead) {
        if (clearHead){
            AJS.$(tableId+' thead tr th').remove();
        }
        AJS.$(tableId+' tbody tr').remove();
    };

    /**
     * Add a tab to a menu table in JIRA
     * @param {Object} element The element reference
     * @param {String} href    The url
     * @param {String} name    The tab name
     * @param {Boolean} active  True if is the active tab
     */
    self.addTabMenu = function( element, href, name, active) {
        var activeClass = "";
        if (active) {
            activeClass = " active-tab";
        }
        var htmlData = '<li class="menu-item'+ activeClass +'">';
        htmlData +=      '<a href="'+ href +'"><strong>'+ name +'</strong></a>';
        htmlData +=    '</li>';
        element.append(htmlData);
    };

    /**
     * Return date in timestamp
     */
    self.todayToTimestamp = function() {
        var now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        return now.getTime();
    };

    /**
     * Add a table header to the element
     * @param {Object} element    The object reference
     * @param {String} headerId   The header ID
     * @param {String} headerName The header Name
     * @param {String} className  The CSS class (Optional)
     */
    self.addTableHeader = function( element, headerId, headerName, className ) {
        var rowHtml = '<th';

        if (headerId != undefined) {
            rowHtml += ' id="'+headerId+'" ';
        }

        if (className != undefined) {
            rowHtml += ' class="'+className+'"';
        }

        rowHtml += '>'+headerName+'</th>';

        element.append( rowHtml );
    };

    /**
     * Add a row to a row table
     * @param  {Object} element The element reference
     * @param  {Object} rowData The header data
     * @param  {Object} styleTr Style
     */
    self.createTableRow = function( element, rowData, styleTr, actionTr, idTr){
        var rowHtml = '<tr';

        if( styleTr ){
            rowHtml +=  ' class=\"' + styleTr + '\"';
        }
        if( actionTr ){
            rowHtml +=  ' onClick = \"' + actionTr + '\"';
        }
        if( idTr ){
            rowHtml +=  ' id = \"' + idTr + '\"';
        }
        rowHtml += '>';

        for (var i = 0; i < rowData.length; i++) {
            rowHtml += '<td';
            if( rowData[i].style != undefined ){
                rowHtml +=  ' class = \"' + rowData[i].style + '\"';
            }
            if( rowData[i].action != undefined ){
                rowHtml +=  ' onClick = \"' + rowData[i].action + '\"';
            }
            if(rowData[i].header) {
                rowHtml += ' headers="'+rowData[i].header+'" ';
            }

            rowHtml += '>'+rowData[i].data+'</td>';
        }
        rowHtml += '</tr>';
        element.append(rowHtml);
    };

    /**
     * Validate url
     * @param  str
     */
    self.validateUrl =  function( str ) {
        var regExp = /^https\:\/\/([a-z0-9\.-])+\.[a-z]{2,4}$/;
        return regExp.test(str);
    }

    /**
     * Validate email
     * @param  str
     */
    self.validateEmail =  function( str ) {
        var regExp = /\S+@\S+\.\S+/;
        return regExp.test(str);
    }

    /**
     * Get the display name for the filter, infers the name from
     * the key.
     * @param  {Object} filter The filter information
     * @return {String}        The display name
     */
    self.getFilterDisplayName = function( filter ){
        if (filter) {

            if (filter.type === "tag") {
                return filter.scope_aws_tag_value+" ("+filter.scope_aws_tag_key+")";
            }

            if (filter.type === "user") {
                if (filter.name) {
                    if(filter.user_name){
                        return filter.name+" ("+filter.user_name+")";
                    }
                    return filter.name;
                }
                if (filter.key) {
                    return self.getLastDetailFromKey(filter.key);
                }
                return "("+filter.user_name+")";
            }

            if (filter.type === "s3-bucket") {
                if (filter.name) {
                    if(filter.bucket_name){
                        return filter.name+" ("+filter.bucket_name+")";
                    }
                    return filter.name;
                }
                return "("+filter.bucket_name+")";
            }

            if (filter.type === "region") {
                return assetDictionaryService.getType(filter.type).renderName(filter);
            }

            if (   filter.type === "environment"
                || filter.type === "auto-scaling-group"
                || filter.type === "image"
                || filter.type === "subnet"
                || filter.type === "vpc"
                || filter.type === "sg") {
                    if (filter.name) {
                        return filter.name+" ("+self.getLastDetailFromKey(filter.key)+")";
                    }
                    return "("+self.getLastDetailFromKey(filter.key)+")";
            }

            if (filter.name) {
                return filter.name;
            } else {
                return self.getLastDetailFromKey(filter.key);
            }

        }
        return "";
    };

    /**
     * Get the last detail in a url key.
     * @param  {String} stringKey The url detail.
     * @return {String}           The detail.
     */
    self.getLastDetailFromKey = function( stringKey ){
        if (stringKey) {
            var strArray = stringKey.split("/");
            strArray.reverse();
            return strArray[0];
        }
        return "";
    };

    /**
     * Get type of an assets key.
     * @param  {String} stringKey The asset key.
     * @return {String}           Type.
     */
    self.getTypeFromKey = function( stringKey ){
        if (stringKey) {
            var strArray = stringKey.split("/");
            return strArray[3];
        }
        return "";
    };

    /**
     * return a string with the inforation of an array
     * @param  {Array} array.
     * @param {String} option can be vertical horizontal none
     * @return text
     */
    self.arrayToCsv = function( obj , option ){
        var line = '';
        for(var idx in obj) {
            var item = obj[ idx ];

            if( typeof item == 'object' ){
                line += self.arrayToCsv( item , 'horizontal');
            }
            else{
                line += self.csvCellFormat( item ) + ',';
            }

            if( option == 'vertical'){
                line += '\n';
            }
        }

        if( option == 'horizontal'){
            line += '\n';
        }
        return line;
    };

    /**
     * To remove some characters(,.\n\t\r) from a text that going to be put on a csv
     * @param {String} text
     * @return text
     */
    self.csvCellFormat = function( val ){
        val = val.replace( /\r\n/g , "." );
        val = val.replace( /\n/g , "." );
        val = val.replace( /,/g , " " )
        val = val.replace( /\t/g , " ");
        return val;
    };

    /**
     * Put format to csv title
     * @param {String} text
     * @return text
     */
    self.csvTitleFormat = function( val ){
        return val +':\n';
    };

    /**
     * Put format to csv header
     * @param {Array} text
     * @return text
     */
    self.csvHeaderFormat = function( titles ){
        var line = '';

        for(var idx in titles) {
            line += titles[idx]+',';
        }
        return line +'\n';
    };

    /**
     * Return text for creating a new line on csv
     * @return text
     */
    self.csvNewLine = function(){
        return '\n';
    };

    /**
     * Return the threat level css class to create a
     * visual bezel.
     */
    self.getThreatLevelClass = function(level){
        var className = "";
        switch (level) {
            case 3:        className = "high-risk"; break;
            case 2:        className = "medium-risk"; break;
            case 1:        className = "low-risk"; break;
            case 'High':   className = "high-risk"; break;
            case 'Medium': className = "medium-risk"; break;
            case 'Low':    className = "low-risk"; break;
            default:       className = "none-risk"; break;
        }
       return className;
    };

    /**
     * Return the summary with the correct format
     */
    self.formatSummary = function( val ){
        val = val.replace( /\r\n/g , " " );
        val = val.replace( /\n/g , " " );
        val = val.replace( /\t/g , " ");
        val = val.substring(0,200);
        return val;
    };

    /**
     * Show and hidde an element
     */
    self.loadingMsg = function( selector , bool ) {
        var loading = AJS.$(selector);

        if( bool ){
            loading.show();
        }
        else{
           loading.hide();
        }
    };

    /**
     * Creates a confirm dialog for an operation.
     * @param  {String}     name        The id of the dialog
     * @param  {String}     message     The message
     * @param  {function}   callback    The callback function
     */
    self.confirmDialog = function( name, message, callback ) {

        var dialog = new AJS.Dialog({
            width:400,
            height:200,
            id:name,
            closeOnOutsideClick: true
        });

        dialog.addHeader(AJS.I18n.getText("ci.atlassianplugin.utils.confirmation.header"));

        dialog.addPanel("", "<p>"+message+"</p>", "panel-body");

        dialog.addButton(AJS.I18n.getText("ci.atlassianplugin.utils.cancel.button"), function(){
            dialog.hide();
        });

        dialog.addButton(AJS.I18n.getText("ci.atlassianplugin.utils.ok.button"), function(){
            callback();
            dialog.hide();
        });

        dialog.show();
    };

    /**
     * Make it visible
     */
    self.visible = function( selector ) {
        if(AJS.$(selector)){
            AJS.$(selector).css("visibility", "visible");
        }
    };

    /**
     * Make it invisible
     */
    self.invisible = function( selector ) {
        if(AJS.$(selector)){
            AJS.$(selector).css("visibility", "hidden");
        }
    };

    /**
    * Escape the special characters in a selector
    * */
    self.escapeSelector = function( id ){
        id = id.replace(/\//g,'\\/');
        id = id.replace(/\@/g,'\\@');
        id = id.replace(/\./g,'\\.');
        id = id.replace(/\'/g,"\\'");
        id = id.replace(/\"/g,'\\"');

        return id;
    };

    /**
     * Get the url to reset password based on the API url.
     * @return string url endpoint reset passwor
     */
    self.getResetPasswordUrl = function( url ) {

        var domain = url.split(".");

        var tld  = domain[domain.length-1];

        if ( tld === "uk" ) {
            return configService.url.uk;
        } else {
            return configService.url.us;
        }
    };

    /**
     * Search an element in the DOM and add a success message.
     * @param  {string} selector
     * @param  {string} msg
     * @return show a message
     */
    self.showMsgSuccess = function( selector, msg ){
        AJS.messages.success( selector, {
            title: AJS.I18n.getText("ci.atlassianplugin.utils.success.title") ,
            fadeout: true,
            body: msg
        });
    };

    /**
     * Search an element in the DOM and add a error message.
     * @param  {string} selector
     * @param  {string} msg
     * @return show a message
     */
    self.showMsgError = function( selector, msg ){
        AJS.messages.error( selector, {
            title: AJS.I18n.getText("ci.atlassianplugin.utils.error.title") ,
            fadeout: true,
            body: msg
        });
    };
};
/**
 * Creates the service instance.
 */
var AUIUtils =  new AUIUtilsService();