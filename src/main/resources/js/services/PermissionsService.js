/**
 * Author: MVS
 * Management the conections to servlet to handle permissions configuration
 */
var PermissionsService = function() {
    var self = this;

    /**
     * Inits the url base host variables for the service.
     */
    self.getUrlBaseHost = function() {
        return AJS.params.baseURL + "/plugins/servlet/";
    };

    /**
     * Get Permissions
     */
    self.getPermissions = function() {
        var urlProxyServlet = self.getUrlBaseHost() + "permissionservlet";

        return jQuery.ajax({
            type: "GET",
            url: urlProxyServlet,
            dataType: 'json'
        });
    };

    /**
     * Create Permission
     */
    self.assignPermission = function( group ) {
        var urlProxyServlet = self.getUrlBaseHost() + "permissionservlet";

        var data={
            "group" : group
        };

        return jQuery.ajax({
            type: "PUT",
            url: urlProxyServlet,
            dataType: 'json',
            data: JSON.stringify( data )
        });
    };

    /**
     * Detele Permission
     */
    self.deletePermission = function( id ) {
        var urlProxyServlet = self.getUrlBaseHost() + "permissionservlet";

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
var permissionsService =  new PermissionsService();