/**
 * Perform the conections to the CI API.
 */
var AssetDictionaryService = function() {
    var self = this;

    /**
     * Mock for future translations.
     */
    var gettext = function( text ) {
        return text;
    };

    // Here we define the attributes from the asset details
    // we are going to show in the details view
    self.assetDetailsInfo = {
        "key" : {
                caption: gettext("Key"),
                format: null
            },
        "type" : {
                caption: gettext("Type"),
                format: null
            },
        "name" : {
                caption: gettext("Name"),
                format: null
            },
        "scope_aws_region_endpoint" : {
                caption: gettext("Region Endpoint"),
                format: null
            },
        "scope_aws_asset" : {
                caption: gettext("Asset"),
                format: null
            },
        "scope_aws_tag_key" : {
                caption: gettext("Tag Key"),
                format: null
            },
        "scope_aws_tag_value" : {
                caption: gettext("Tag"),
                format: null
            },
        "scope_aws_availability_zone" : {
                caption: gettext("Availability Zone"),
                format: null
            },
        "scope_aws_vpc_id" : {
                caption: gettext("VPC ID"),
                format: null
            },
        "scope_aws_subnet_id" : {
                caption: gettext("Subnet ID"),
                format: null
            },
        "cidr_block" : {
                caption: gettext("CIDR Block"),
                format: null
            },
        "instance_id" : {
                caption: gettext("Instance ID"),
                format: null
            },
        "instance_type" : {
                caption: gettext("Instance Type"),
                format: null
            },
        "private_ip_address" : {
                caption: gettext("Private IP Address"),
                format: null
            },
        "ip_address" : {
                caption: gettext("IP Address"),
                format: null
            },
        "architecture" : {
                caption: gettext("Architecture"),
                format: null
            },
        "dns_name" : {
                caption: gettext("DNS Name"),
                format: null
            },
        "scope_aws_iam_instance_profile" : {
                caption: gettext("IAM Instance Profile"),
                format: null
            },
        "scope_aws_image_id" : {
                caption: gettext("Image ID"),
                format: null
            },
        "scope_aws_kernel_id" : {
                caption: gettext("Kernel ID"),
                format: null
            },
        "scope_aws_key_name" : {
                caption: gettext("Key Name"),
                format: null
            },
        "scope_aws_state" : {
                caption: gettext("Current State"),
                format: null
            },
        "scope_aws_private_dns_name" : {
                caption: gettext("Private DNS Name"),
                format: null
            },
        "scheme" : {
                caption: gettext("Scheme"),
                format: null
            },
        "source_security_group" : {
                caption: gettext("Security Group"),
                format: null
            },
        "scope_aws_canonical_hosted_zone_id" : {
                caption: gettext("Canonical Hosted Zone ID"),
                format: null
            },
        "scope_aws_canonical_hosted_zone_name" : {
                caption: gettext("Canonical Hosted Zone Name"),
                format: null
            },
        "scope_aws_dns_name" : {
                caption: gettext("DNS Name"),
                format: null
            },
        "scope_aws_group_description" : {
                caption: gettext("Group Description"),
                format: null
            },
        "scope_aws_launch_time" : {
                caption: gettext("Launch Time"),
                format: "date"
            },
        "scope_scan_last_scan_time" : {
                caption: gettext( "Last Scanned" ),
                format: "date"
            },
        "create_time" : {
                caption: gettext("Create Time"),
                format: "date"
            },
        "created_on" : {
                caption: gettext("Created on"),
                format: "date"
            },
        "modified_on" : {
                caption: gettext("Modified on"),
                format: "date"
        }
    };

    /**
     * Parse the name of a region
     * @param  {String} asset name
     * @return {String} region name
     */
    self.getRegionName = function(assetName){

        switch(assetName) {
            case "us-east-1":
                return gettext( "US East (N. Virginia)" );
            case "us-west-2":
                return gettext( "US West (Oregon)" );
            case "us-west-1":
                return gettext( "US West (N. California)" );
            case "eu-west-1":
                return gettext( "EU (Ireland)" );
            case "eu-central-1":
                return gettext( "EU (Frankfurt)" );
            case "ap-southeast-1":
                return gettext( "Asia Pacific (Singapore)" );
            case "ap-northeast-1":
                return gettext( "Asia Pacific (Tokyo)" );
            case "ap-southeast-2":
                return gettext( "Asia Pacific (Sydney)" );
            case "sa-east-1":
                return gettext( "South America (São Paulo)" );
            case "ap-northeast-2":
                return gettext( "Asia Pacific (Seoul)" );
            default:
                return assetName;
        }
    };

    self.assetTypeDictionary = {

        "_default" : {
            getTypeName: function() {
                return gettext("Asset");
            }
        },

        "acl" : {
            getTypeName: function() {
                return gettext( "Access Control List" );
            }
        },

        "application" : {
            getTypeName: function( asset ) {
                return gettext( "Application" );
            }
        },

        "application-set" : {
            getTypeName: function() {
                return gettext("Application Set");
            }
        },

        "auto-scaling-group" : {
            getTypeName: function() {
                return gettext( "Auto Scaling Group" );
            }
        },

        "db-instance" : {
            getTypeName: function() {
                return gettext("DB Instance");
            }
        },

        "disposition" : {
            getTypeName: function() {
                return gettext("Disposition" );
            }
        },

        "host" : {
            getTypeName: function() {
                return gettext("Host");
            }
        },

        "host-scan-in-progress" : {
            getTypeName: function() {
                return gettext("Host");
            }
        },

        "image" : {
            getTypeName: function() {
                return gettext( "Amazon Machine Image" );
            }
        },

        "launch-config" : {
            getTypeName: function() {
                return gettext("Launch Configuration" );
            }
        },

        "load-balancer" : {
            getTypeName: function() {
                return gettext( "Load Balancer" );
            }
        },

        "network-interface" : {
            getTypeName: function() {
                return gettext( "Network Interface" );
            }
        },

        "region" : {
            getTypeName: function() {
                return gettext("Region");
            },
            renderName: function( asset ) {

                if (asset.name && asset.name !== asset.key) {
                    return self.getRegionName(asset.name);
                } else if (asset.scope_aws_region_name) {
                    return "Region " + asset.scope_aws_region_name;
                } else {
                    var posibleName = AUIUtils.getLastDetailFromKey( asset.key );
                    return  self.getRegionName( posibleName );
                }
            }
        },

        "sg" : {
            getTypeName: function() {
                return gettext("Security Group");
            }
        },

        "subnet" : {
            getTypeName: function() {
                return gettext("Subnet");
            }
        },

        "s3-bucket" : {
            getTypeName: function() {
                return gettext("S3-bucket");
            }
        },

        "environment" : {
            getTypeName: function() {
                return gettext("Environment");
            }
        },

        "user" : {
            getTypeName: function() {
                return gettext("User");
            }
        },

        "tag" : {
            getTypeName: function() {
                return gettext("Tag");
            }
        },

        "vpc" : {
            getTypeName: function() {
                return gettext("Virtual Private Cloud");
            }
        },

        "vulnerability" : {
            getTypeName: function() {
                return gettext("Vulnerability");
            }
        },

        "vulnerability-set" : {
            getTypeName: function() {
                return gettext("Vulnerability Set");
            }
        },

        "zone" : {
            getTypeName: function() {
                return gettext( "Zone" );
            }
        },

        "role" : {
            getTypeName: function() {
                return gettext( "Role" );
            }
        },

        "instance-profile" : {
            getTypeName: function() {
                return gettext( "Instance Profile" );
            }
        },

        "volume" : {
            getTypeName: function() {
                return gettext( "Volume" );
            }
        },

        "redshift-cluster" : {
            getTypeName: function() {
                return gettext( "Redshift Cluster" );
            }
        }
    };

    self.getType = function( assetType ) {
        return self.assetTypeDictionary[assetType] === undefined ? self.assetTypeDictionary["_default"] : self.assetTypeDictionary[assetType];
    };

    self.getCaption = function( property ) {
        return self.assetDetailsInfo[property].caption;
    };

    self.getAssetDetails = function( asset ) {
        var obj={};

        for ( var property in self.assetDetailsInfo ) {

            var assetDetail = self.assetDetailsInfo[property];

            if ( asset.hasOwnProperty( property )) {

                if(asset[property] !== ""){
                    var propertyValue = asset[property];

                    if ( assetDetail.format === 'date' ) {
                        propertyValue = moment( asset[property] ).format("MMM DD - YYYY h:mm:ss a");
                    }

                    obj[ property ] = propertyValue;
                } else{
                    obj[ property ] = "";
                }
            }
        }
        return obj ;
    };

    self.getAssetTitles = function( asset ) {
        var obj={};

        for ( var property in self.assetDetailsInfo ) {

            if ( asset.indexOf(property) != -1 ) {
                obj[ property ] = self.getCaption( property );
            }
        }
        return obj ;
    };

};
/**
 * Creates the service instance.
 */
var assetDictionaryService =  new AssetDictionaryService();