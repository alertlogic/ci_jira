/**
 * Author: MVS
 * Management the conections to servlet to handle rules configuration
 */
var RulesService = function() {
    var self = this;

    var urlBaseServlets;

    /**
     * Inits the url base host variables for the service.
     */
    self.getUrlBaseHost = function() {
        return AJS.params.baseURL + "/plugins/servlet/";
    };

    /**
     * Get Rules
     */
    self.getRules = function() {
        var urlProxyServlet = self.getUrlBaseHost() + "ruleconfigurationservlet";
        var data={
            "option" : "all"
        };

        return jQuery.ajax({
            type: "POST",
            url: urlProxyServlet,
            dataType: 'json',
            data: data 
        });
    };

    /**
     * Get a rule
     */
    self.getRule = function(ruleId) {
        var urlProxyServlet = self.getUrlBaseHost() + "ruleconfigurationservlet";
        var data={
            "option" : "one",
            "id":ruleId
        };

        return jQuery.ajax({
            type: "POST",
            url: urlProxyServlet,
            dataType: 'json',
            data: data
        });
    };

    /**
     * Create Rule
     */
    self.createRule = function( project, group, environment, filters, name) {
        var urlProxyServlet = self.getUrlBaseHost() + "ruleconfigurationservlet";

        var data={
            "project" : project,
            "group" : group,
            "environment": environment,
            "filters": filters,
            "name": name,
            "option": "create"
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlProxyServlet,
            dataType: 'json',
            data: JSON.stringify( data )
        });
    };

    /**
     * Update Rule
     */
    self.updateRule = function( id, project, group, environment, filters, name) {
        var urlProxyServlet = self.getUrlBaseHost() + "ruleconfigurationservlet";

        var data={
            "project" : project,
            "group" : group,
            "environment": environment,
            "filters": filters,
            "name": name,
            "id": id,
            "option":"update"
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlProxyServlet,
            dataType: 'json',
            data: JSON.stringify( data )
        });
    };

    /**
     * Unblock Rule
     */
    self.unblockRule = function( ruleID ) {
        var urlProxyServlet = self.getUrlBaseHost() + "ruleconfigurationservlet";

        var data={
            "id" : ruleID,
            "option": "unblock"
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlProxyServlet,
            dataType: 'json',
            data: JSON.stringify( data )
        });
    };

    /**
     * Detele Rule
     */
    self.deleteRule = function( id ) {
        var urlProxyServlet = self.getUrlBaseHost() + "ruleconfigurationservlet";

        var data={
            "id" : id
        };

        return jQuery.ajax({
            type: "DELETE",
            url: urlProxyServlet,
            dataType: 'json',
            data: JSON.stringify( data )
        });
    };
};
/**
 * Creates the service instance.
 */
var rulesService =  new RulesService();