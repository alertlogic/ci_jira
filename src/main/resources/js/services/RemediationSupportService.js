/**
 * A service with support functions using in services that remediations
 * data is manage.
 */
var RemediationSupportService = function() {
    var self = this;
    
    //Remediation descriptions reference object
    //(Migrated from RemediationsController)
    self.remediationDescriptions = {};
    self.plannedItemMap = {}; /*  all known planned items, indexed by key */
    /*  Note that all of those quotes use double quotes.  How boring.  *Sigh*   */
    self.states = {
        open      : "open",
        planned   : "planned",
        complete  : "complete",
        disposed  : "disposed",
        incomplete: "incomplete",
        verified  : "verified"
    };
    
    /**
     * Used for sorting, using a descending order of priority.
     */
    var stateWeights = {
        open      : 100,
        incomplete: 110,
        planned   : 50,
        disposed  : 10,
        complete  : 10,
        verified  : 0,
        _mine     : 0,      /*  This adjusts the relative importance of items I have added to my plan */
        _theirs   : -5      /*  This adjusts the relative importance of items others have added to their plans */
    };
    
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
                        targets.push( vulnerability.vinstances[k].target.key );
                    }

                    vulnsAsset[ vulnerability.vulnerability_id ] = {
                        'key': vulnerability.vulnerability_id,
                        'assets': targets,
                        'evidences': self.getInstancesForVulnerability( vulnerability )
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

                        if( !instances[ instanceKey ] ){
                            instances [ instanceKey ] = {'key' : instanceKey };
                            vulnerabilities [ instanceKey ] = [ vulnerability.vulnerability_id ];
                            targets[ instanceKey ] = [ vulnerability.vinstances[ k ].target.key ];

                        }
                        else{
                            if( vulnerabilities [ instanceKey ].indexOf( vulnerability.vulnerability_id ) === -1 ){
                                vulnerabilities [ instanceKey ].push ( vulnerability.vulnerability_id );
                            }

                            if( targets [ instanceKey ].indexOf( vulnerability.vinstances[ k ].target.key ) === -1 ){
                                targets [ instanceKey ].push ( vulnerability.vinstances[ k ].target.key );
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
        var vulnIdsFromAssets = [];
        for (var index in vulnFromAssets) vulnIdsFromAssets.push(index);

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
                vulnIdsFromAssets.splice(vulnIdsFromAssets.indexOf(dataVuln.vulnerabilities[i].id), 1);
            }
        }

        for (var i = 0; i < vulnIdsFromAssets.length; i++) {
            var vulnDetailsFromAssets = remediationsService.getVulnerabilityDetails(vulnIdsFromAssets[i]);
            vulnDetailsFromAssets.always( function(vulnData) {
                var vuln = {
                    "id": vulnData.id,
                    "description": vulnData.description,
                    "impact": vulnData.impact,
                    "resolution": vulnData.resolution,
                    "severity": vulnData.severity
                };
                vulns.push( vuln );
            });
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
    self.getEvidences = function( data, instancesFromAssets ) {
        var evidenceTitles = {
            "key":  AJS.I18n.getText("ci.partials.remediationdetails.js.evidences.column.key"),
            "details": AJS.I18n.getText("ci.partials.remediationdetails.js.evidences.column.details"),
            "vulnerability_id": AJS.I18n.getText("ci.partials.remediationdetails.js.evidences.column.vulnerability")
        };
        var evidenceValues = [];

        for (var i = 0; i < data.assets.length; i++ ) {

            for (var j = 0; j < data.assets[ i ].length; j++ ) {
                var vulnerabilityIntance = data.assets[ i ][ j ];

                if( vulnerabilityIntance.hasOwnProperty('details') &&
                    vulnerabilityIntance.details != '' &&
                    instancesFromAssets[ vulnerabilityIntance.key ] ){
                    evidenceValues.push({
                        'key' : vulnerabilityIntance.key,
                        'details' : vulnerabilityIntance.details,
                        'vulnerability_id' : vulnerabilityIntance.vulnerability_id
                    });
                }

            }
        }

        return {
            "titles" : evidenceTitles,
            "values" : evidenceValues
        };
    };
    
    /**
     * Sorts remediation vulnerability types by CVSS descending, then name ascending.
     */
    this.sortByCVSSAndName = function( a, b ) {
        if ( a._cvss_score !== b._cvss_score ) {
            return b._cvss_score - a._cvss_score;
        }
        var aName = a.name;
        var bName = b.name;
        return aName === bName ? 0 : aName < bName ? -1 : 1;
    };

    /**
     * Return the list of instances tie to a vulnerability
     * @param  {obj} vulnerability from assets
     * @return {array}    array with instances keys
     */
    self.getInstancesForVulnerability = function( vulnerability ) {
        var instances = [];
        if( vulnerability.hasOwnProperty('vinstances') ){
            vulnerability.vinstances.forEach( function( instanceItem ) {
                instances.push(instanceItem.key);
            } );
        }
        return instances;
    };

    /**
     * Preprocess the remediation (Migrated from RemediationsController)
     * @param  {Object} remediation The remediation to process.
     * @param  {String} environmentID The environment Id.
     * @param  {String} userID The environment Id.
     * @param  {Object} vulnerabilityInstanceMap A hash of all known vulnerability instances, keyed by their asset key
     * @param  {Array} filtersMap The filters map.
     */
    self.preprocessRemediation = function( remediation,
    										environmentID, 
    										userID, 
    										vulnerabilityInstanceMap, 
    										filtersMap ) {

        var emptyVulnBreakdown = { high: 0, medium: 0, low: 0, none: 0 };
        remediation._vulnerability_count = 0;
        remediation._threatCode = AUIUtils.getThreatLevelFromAsset( remediation ).code;
        remediation._vulnDisplayCount = 4;

        if ( remediation.vulnerabilities ) {
            remediation.vulnerabilities.forEach(function( vulnerabilityGroup, vulnerabilityGroupIndex ) {
                remediation._vulnerability_count += 1;
                vulnerabilityGroup._cvss_score = 0.0;
                if ( vulnerabilityInstanceMap ) {

                    var instances = self.getInstancesForVulnerability( vulnerabilityGroup );

                    instances.forEach( function( vulnerabilityInstanceKey ) {
                        if ( vulnerabilityInstanceMap && vulnerabilityInstanceMap.hasOwnProperty( vulnerabilityInstanceKey ) ) {
                            var vulnerabilityInstance = vulnerabilityInstanceMap[vulnerabilityInstanceKey];
                            vulnerabilityGroup._cvss_score = Math.max( vulnerabilityGroup._cvss_score, vulnerabilityInstance.cvss_score );
                        }
                    } );
                }
                vulnerabilityGroup._threatCode = AUIUtils.getThreatLevelFromCVSS( vulnerabilityGroup._cvss_score ).code;
            } );
            remediation.vulnerabilities.sort( self.sortByCVSSAndName );

            /*  summarize threat level for all of the vulnerabilities we ARE displaying (now we dont need slice at all)*/
            remediation._vulnExtraInfo = AJS.$.extend({}, emptyVulnBreakdown, AUIUtils.countBuckets(remediation.vulnerabilities, function(vulnGroup) { return vulnGroup._threatCode; }));
        }

        /*  Is there a corresponding remediation-item (a "planned" remediation) */
        var plannedItem = null;
        if ( typeof( remediation._plannedItem ) === 'object' ) {
            /*  We already have a planned item associated with this remediation; simply use that to extract data. */
            plannedItem = remediation._plannedItem;
        } else if ( self.plannedItemMap.hasOwnProperty( remediation.remediation_id ) ) {
            plannedItem = self.plannedItemMap[remediation.remediation_id];
        }

        if ( plannedItem !== null ) {
            /*  if there are more than one planned items for a given remediation instance, we'll need to distinguish between those belonging to different users */
            remediation._plannedItem = plannedItem;
            remediation._state = remediation._plannedItem.state;    /*  Inherit state from planned item */
            remediation._actor_id = remediation._plannedItem.user_id;
            remediation._effective_timestamp = remediation._plannedItem.modified_on || remediation._plannedItem.created_on;
            remediation._created_on = remediation._plannedItem.created_on;
            remediation._expiration_date = remediation._plannedItem.expires;
            
            // Here we loop over planned item filters to set up the display information
            if (remediation._plannedItem.filters) {
                for (var filterIndex = 0; filterIndex < remediation._plannedItem.filters.length; filterIndex++) {
                    var filter = remediation._plannedItem.filters[filterIndex];
                    // If the filter is not found in the filters map we remove it from the filters array
                    // meaning is not a selectable one from the left column of remediation list.
                    if (filtersMap[filter]) {
                        remediation._plannedItem.filters[filterIndex] = filtersMap[filter];
                    } else {
                        remediation._plannedItem.filters.splice(filterIndex, 1);
                    }
                }
            }
        } else {
            remediation._plannedItem = null;
            remediation._state = self.states.open;            /*  Default state */
        }
        
        remediation.threat_level = remediation.threat_level || remediation.threatiness_level || 0.0;
        remediation._weight = stateWeights[remediation._state] + remediation.threat_level;  /*  Used for sorting */
        
        if ( remediation._actor ) {
            if ( remediation._actor_id === userID ) {
                remediation._weight += stateWeights._mine;
            } else {
                remediation._weight += stateWeights._theirs;
            }
        }
        /*  Further adjust _weight by threat_level and raw threatiness */
        remediation._weight += ( remediation.threat_level / 4.0 );          //  Add up to 0.75 points for threat level
        remediation._weight += ( remediation.threatiness / 1000000.0 );      //  Add a tiny adjustment based on raw threatiness.  A note: threatiness doesn't have a scale, so if it exceeds ~250,000 is could break the sorting algorithm subtly by causing high-threatiness remediations to be sorted above low-threatiness remediations of a higher threat_level.  This might arguably be the correct behavior anyway :)
        
        //remediation._actionable = self.canSelectItem( remediation, controllerMode, userID );
        if ( self.remediationDescriptions.hasOwnProperty( remediation.remediation_id ) ) {
            remediation.name = self.remediationDescriptions[remediation.remediation_id].name;
            remediation.description = self.remediationDescriptions[remediation.remediation_id].description;
        }
        
        return remediation;
    };
};

/**
 * Creates the service instance.
 */
var remediationSupportService =  new RemediationSupportService();
