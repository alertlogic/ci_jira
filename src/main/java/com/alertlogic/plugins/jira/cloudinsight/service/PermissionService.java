package com.alertlogic.plugins.jira.cloudinsight.service;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.ArrayList;
import java.util.List;

import net.java.ao.Query;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Permission;
import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.sal.api.message.I18nResolver;

public class PermissionService {
    private final ActiveObjects activeObjects;
    private static final Logger log = LoggerFactory.getLogger(PluginConfigService.class);
    private I18nResolver i18n;

    public PermissionService(ActiveObjects activeObjects, I18nResolver i18n)
    {
        this.activeObjects = checkNotNull(activeObjects);
        this.i18n = i18n;
    }

    /**
     * Store a group that has permission, return the configuration reference object
     */
    public Permission assignPermission(String group)
    {
    	Permission permission;

    	if ( hasPermmisionConfigured(group) ) {
    		log.debug( i18n.getText("ci.service.permission.msg.log.debug.group.haspermission") );
    		return null;
    	}else{
    		permission = activeObjects.create( Permission.class);
    		permission.setGroup( group );
        	permission.save();
        	log.debug(i18n.getText("ci.service.permission.msg.log.debug.group.stored"));
        	return permission;
    	}
    }

    /**
     * Get the group that has permissions in Json format
     * @return JSONArray permission
     */
    public JSONArray getPermmisionsJSON()
    {
    	Permission[]  permissions = activeObjects.find( Permission.class );
    	JSONArray permissionsArray  =  new JSONArray();

    	if ( permissions == null ) {
    		return null;
    	}

        for( int i = 0 ;i < permissions.length ; i++ ) {
            JSONObject obj  =  new JSONObject();
            obj.put("id", permissions[i].getID());
            obj.put("group",permissions[i].getGroup());
            permissionsArray.put( obj );
        }

        return permissionsArray;
    }

    /**
     * Get the group that has permissions
     * @return ArrayList of Permission
     */
    public List<String> getPermmisionsList()
    {
    	List<String> permissionsArrayList = new ArrayList<String>();

    	Permission[]  permissionsArray = activeObjects.find( Permission.class );

        for( int i = 0 ;i < permissionsArray.length ; i++ ) {
        	permissionsArrayList.add( permissionsArray[i].getGroup() );
        }

    	return permissionsArrayList;
    }

    /**
     * Returns true if has this group stored.
     */
    public boolean hasPermmisionConfigured(String group)
    {
    	return (activeObjects.count(Permission.class, Query.select().where("GROUP = ?", group)) > 0);
    }

    /**
     * Remove the permission to a group
     * @param id permission
     * @return boolean
     */
    public Boolean removePermision( int id )
    {
    	try{
    		Permission[]  permissionArray = activeObjects.find( Permission.class, Query.select().where("ID = ?", id));
    		if ( permissionArray.length > 0) {
    			activeObjects.delete( permissionArray );
    			log.debug(i18n.getText("ci.service.permission.msg.log.debug.group.deleted"));
        		return true;
	    	}
    		return false;
    	}
    	catch(Exception e){
    		log.error(i18n.getText("ci.service.permission.msg.log.error") + e.toString());
			e.printStackTrace();
		}
    	return false;
    }
}
