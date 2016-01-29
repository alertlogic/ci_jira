/**
 * A service with support functions using in services that remediations
 * data is manage.
 */
var RemediationSupportService = function() {
    var self = this;

    /**
     * Return an object with titles and values of asset afected of one remediation
     */
	self.getAssets = function( data, key ) {
        var targets = [];
        var threat_level;
        var created_on;

        for (var i = 0; i < data.remediations.assets.length; i++ ) {
            if( data.remediations.assets[ i ].key === key ){

                threat_level = data.remediations.assets[ i ].threat_level;

                created_on = moment( data.remediations.assets[ i ].create_on ).format("MM/DD/YYYY h:mm:ss a");

                for (var j = 0; j < data.remediations.assets[ i ].vulnerabilities.length; j++ ) {

                    var vulnerability = data.remediations.assets[ i ].vulnerabilities[ j ];

                    for (var k = 0; k < vulnerability.vinstances.length; k++ ) {

                        var target = vulnerability.vinstances[ k ].target;

                        targets[ target.key ] = {
                            "type": AUIUtils.getTypeFromKey( target.key ) ,
                            "asset": target.name || "(unknown)"
                        };
                    }
                }
            }
        }
        targets.sort( function( a, b){
            if(a.asset < b.asset) return -1;
            if(a.asset > b.asset) return 1;
            return 0;
        });

        return {
        	"titles" : {
                "type": AJS.I18n.getText("ci.partials.remediationdetails.js.assets.column.type"),
                "asset": AJS.I18n.getText("ci.partials.remediationdetails.js.assets.column.assets")
            },
        	"values" : targets,
            "threat_level": threat_level,
            "created_on": created_on
        };
    };

    /*
    * Return a object with vulnerabilities id that are in assets
    */
    self.getVulnerabilitiesIdFromAssets = function( data, key ) {
        var vulnsAsset = {};

        for ( var i = 0; i < data.remediations.assets.length; i++ ) {
            if( data.remediations.assets[ i ].key === key ){
                for ( j = 0; j < data.remediations.assets[ i ].vulnerabilities.length; j++ ) {

                    var vulnerabilityId = data.remediations.assets[ i ].vulnerabilities[ j ].vulnerability_id;
                    vulnsAsset[ vulnerabilityId ]  = vulnerabilityId;
                }
            }
        }
        return vulnsAsset;
    };

    /*
    * Return a object with titles and values of description of one remediation from assets
    * it is called when we can not found the descriptions
    */
    self.getDescriptionFromAssets = function( data , key ) {
        var values = {};
        for ( i = 0; i < data.remediations.assets.length; i++ ) {
            if( data.remediations.assets[ i ].key === key ){
                values.id =  data.remediations.assets[ i ].remediation_id;
                values.name = data.remediations.assets[ i ].name;
            }
        }
        return {
            "titles" : {
                "id": AJS.I18n.getText("ci.partials.remediationdetails.js.description.column.id"),
                "name": AJS.I18n.getText("ci.partials.remediationdetails.js.description.column.name")
            },
            "values" : values
        };
    };

    /*
    * Return a object with titles and values of description of one remediation
    */
    self.getDescription = function( data ) {
        return {
            "titles" : {
                "id": AJS.I18n.getText("ci.partials.remediationdetails.js.description.column.id"),
                "name": AJS.I18n.getText("ci.partials.remediationdetails.js.description.column.name"),
                "description": AJS.I18n.getText("ci.partials.remediationdetails.js.description.column.description")
            },
            "values" : {
                "id": data.id,
                "name": data.name,
                "description" : data.description
            }
        };
    };

    /*
    * Return a object with titles and values of description of one remediation
    */
    self.getDescriptions = function( data ) {
        var descriptions = {};
        for ( var i=0; i < data.remediations.length; i++){
            descriptions[ data.remediations[ i ].id ] = data.remediations[ i ].description;
        }
        return descriptions;
    };

    /*
    * Return a object with titles and values of filters used of one remediation
    */
    self.getFiltersUsed = function( data ) {
        var filters = [];

        for (var i = 0; i < data.assets.length; i++ ) {

            for (var j = 0; j < data.assets[ i ].length; j++ ) {

				for (var k = 0; k < data.assets[ i ][ j ].filters.length; k++ ) {

                    var filterData = data.assets[ i ][ j ].filters[ k ];

                    var displayName = AUIUtils.getFilterDisplayName({
	                	"type" : filterData.split(":")[0],
	                	"key" : filterData.split(":")[1]
	            	});

                    var filter = {
                        "type": filterData.split(":")[0],
                        "filter": displayName
                    };

	                filters.push(filter);
            	}
            }
        }

        return {
        	"titles" : {
                "type" : AJS.I18n.getText("ci.partials.remediationdetails.js.filter.column.type"),
                "filter" : AJS.I18n.getText("ci.partials.remediationdetails.js.filter.column.filter")
            },
        	"values" : filters
        };
    };

    /**
     * Return the threat level
     */
    self.getThreatLevel = function( severity ) {
        var number = 0;
        switch (severity) {
            case 'High':   number = 3; break;
            case 'Medium': number = 2; break;
            case 'Low':    number = 1; break;
            default:       number = 0; break;
        }
        return number;
    };

	/*
    * Return a object with titles and values of vulnerabilities of one remediation
    */
    self.getVulnerabilitiesDetails = function( dataVuln , vulnFromAssets) {
        var vulns = [];
        for ( var i = 0; i < dataVuln.vulnerabilities.length; i++ ) {
             if( vulnFromAssets[ dataVuln.vulnerabilities[i].id ] ){
                //Search if the vulnerability exist on the assets
                var vuln = {
                    "id": dataVuln.vulnerabilities[ i ].id,
                    "description": dataVuln.vulnerabilities[ i ].description,
                    "impact": dataVuln.vulnerabilities[ i ].impact,
                    "resolution": dataVuln.vulnerabilities[ i ].resolution,
                    "severity": dataVuln.vulnerabilities[ i ].severity
                };

                vulns.push( vuln );
            }
        }

        vulns.sort(function(a,b){
            return self.getThreatLevel( b.severity ) - self.getThreatLevel( a.severity ) ;
        });

        var titles = {
            "id": AJS.I18n.getText("ci.partials.remediationdetails.js.vulnerabilities.column.id"),
            "description": AJS.I18n.getText("ci.partials.remediationdetails.js.vulnerabilities.column.description"),
            "impact": AJS.I18n.getText("ci.partials.remediationdetails.js.vulnerabilities.column.impact"),
            "resolution": AJS.I18n.getText("ci.partials.remediationdetails.js.vulnerabilities.column.resolution"),
            "severity": AJS.I18n.getText("ci.partials.remediationdetails.js.vulnerabilities.column.severity")
        };

        return {
        	"titles" : titles,
        	"values" : vulns
        };
    };

    /**
     * Complete with empty fields and order the properties
     */
    self.completeWithSpace = function( assetTitles, assetsAfected ){
        var assetValues = [];

        //Get the values
        for( assetKey in assetsAfected ){
            var newAsset = {};
            for ( property in assetTitles ) {
                if( assetsAfected[ assetKey ].hasOwnProperty(  property ) ){
                    newAsset[ property ] = assetsAfected[ assetKey ][ property ];
                }
                else{
                    newAsset[ property ]  = "";
                }
            }
            assetValues.push( newAsset );
        }

        return assetValues;
    };

    /**
     * Return an object with titles and values of assets afected of one remediation
     * and bring the details
     */
    self.getAssetsDetailsByType = function( data, assetsAfected ) {
        var assetTitles = [];
        var assetValues = [];

        for (var i = 0; i < data.length; i++ ) {

            var asset = data[ i ];

            if ( assetsAfected[ asset.key ] ){

                assetValues[ asset.key ] = assetDictionaryService.getAssetDetails( asset );
                assetTitles = assetTitles.concat( Object.keys( asset ).filter(function ( item ) {
                    return assetTitles.indexOf( item ) < 0;
                }));
            }
        }

        assetTitles = assetDictionaryService.getAssetTitles( assetTitles );
        assetValues = self.completeWithSpace( assetTitles, assetValues );

        return {
            "titles" : assetTitles,
            "values" : assetValues
        };
    };

};
/**
 * Creates the service instance.
 */
var remediationSupportService =  new RemediationSupportService();
