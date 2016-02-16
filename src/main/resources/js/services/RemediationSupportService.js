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
                            "key": target.key,
                            "type": AUIUtils.getTypeFromKey( target.key ) ,
                            "asset": target.name || "(unknown)",
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
    * Return a object with vulnerabilities id, targets and vulnerability instances
    */
    self.getComplementVulnerabilityFromAssets = function( data, key ) {
        var vulnsAsset = {};

        for ( var i = 0; i < data.remediations.assets.length; i++ ) {
            if( data.remediations.assets[ i ].key === key ){
                for ( j = 0; j < data.remediations.assets[ i ].vulnerabilities.length; j++ ) {

                    var vulnerability = data.remediations.assets[ i ].vulnerabilities[ j ];
                    var targets = [];

                    for (var k = 0; k < vulnerability.vinstances.length; k++ ) {
                        targets.push( vulnerability.vinstances[k].target.key )
                    }

                    vulnsAsset[ vulnerability.vulnerability_id ] = {
                        'key': vulnerability.vulnerability_id,
                        'assets': targets,
                        'evidences': vulnerability.instances
                    };
                }
            }
        }
        return vulnsAsset;
    };

    /*
    * Return a object with affected asset id, vulnerabilities and vulnerability instances
    */
    self.getComplementTargetFromAssets = function( data, key ) {
        var targets = {};
        var vulnerabilities = {};
        var instances = {};

        for ( var i = 0; i < data.remediations.assets.length; i++ ) {
            if( data.remediations.assets[ i ].key === key ){
                for ( j = 0; j < data.remediations.assets[ i ].vulnerabilities.length; j++ ) {

                    var vulnerability = data.remediations.assets[ i ].vulnerabilities[ j ];

                    for (var k = 0; k < vulnerability.vinstances.length; k++ ) {
                        var targetKey = vulnerability.vinstances[ k ].target.key;

                        if( !targets[ targetKey ] ){
                            targets[ targetKey ] = {'key' : targetKey };
                            vulnerabilities [ targetKey ] = [ vulnerability.vulnerability_id ];
                            instances [ targetKey ] = [ vulnerability.vinstances[ k ].key ];
                        }
                        else{
                            if( vulnerabilities [ targetKey ].indexOf( vulnerability.vulnerability_id ) === -1 ){
                                vulnerabilities [ targetKey ].push ( vulnerability.vulnerability_id );
                            }

                            if( instances [ targetKey ].indexOf( vulnerability.vinstances[ k ].key ) === -1 ){
                                instances [ targetKey ].push ( vulnerability.vinstances[ k ].key );
                            }
                        }
                    }
                }
            }
        }

        for(i in targets){
            targets[ i ].evidences = instances [ i ];
            targets[ i ].vulnerabilities = vulnerabilities [ i ];
        }

        return targets;
    };

    /*
    * Return a object with vulnerabilities intances with vulnerabilities and assets
    */
    self.getComplementEvidencesFromAssets = function( data, key ) {
        var targets = {};
        var vulnerabilities = {};
        var instances = {};

        for ( var i = 0; i < data.remediations.assets.length; i++ ) {
            if( data.remediations.assets[ i ].key === key ){
                for ( j = 0; j < data.remediations.assets[ i ].vulnerabilities.length; j++ ) {

                    var vulnerability = data.remediations.assets[ i ].vulnerabilities[ j ];

                    for (var k = 0; k < vulnerability.vinstances.length; k++ ) {
                        var instanceKey = vulnerability.vinstances[ k ].key;

                        if( !targets[ instanceKey ] ){
                            instances [ instanceKey ] = {'key' : instanceKey };
                            vulnerabilities [ instanceKey ] = [ vulnerability.vulnerability_id ];
                            targets[ instanceKey ] = [ vulnerability.vinstances[ k ].target.key ];

                        }
                        else{
                            if( vulnerabilities [ instanceKey ].indexOf( vulnerability.vulnerability_id ) === -1 ){
                                vulnerabilities [ instanceKey ].push ( vulnerability.vulnerability_id );
                            }

                            if( instances [ instanceKey ].indexOf( vulnerability.vinstances[ k ].target.key ) === -1 ){
                                instances [ instanceKey ].push ( vulnerability.vinstances[ k ].target.key );
                            }
                        }
                    }
                }
            }
        }

        for(i in instances){
            instances[ i ].assets = targets [ i ];
            instances[ i ].vulnerabilities = vulnerabilities [ i ];
        }

        return instances;
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

    /**
     * Return an object with titles and values of assets afected of one remediation
     * and bring the details
     */
    self.getEvidences = function( data ) {
        var evidenceTitles = {
            "key":  AJS.I18n.getText("ci.partials.remediationdetails.js.evidences.column.key"),
            "details": AJS.I18n.getText("ci.partials.remediationdetails.js.evidences.column.details"),
            "vulnerability_id": AJS.I18n.getText("ci.partials.remediationdetails.js.evidences.column.vulnerability")
        };
        var evidenceValues = [];

        for (var i = 0; i < data.assets.length; i++ ) {

            for (var j = 0; j < data.assets[ i ].length; j++ ) {
                var vulnerabilityIntance = data.assets[ i ][ j ];

                evidenceValues.push({
                    'key' : vulnerabilityIntance.key,
                    'details' : vulnerabilityIntance.details,
                    'vulnerability_id' : vulnerabilityIntance.vulnerability_id
                });

            }
        }

        return {
            "titles" : evidenceTitles,
            "values" : evidenceValues
        };
    };

};
/**
 * Creates the service instance.
 */
var remediationSupportService =  new RemediationSupportService();
