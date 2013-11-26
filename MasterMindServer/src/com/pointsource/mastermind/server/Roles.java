package com.pointsource.mastermind.server;

import java.net.URI;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.apache.wink.common.annotations.Workspace;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

/**
 * Rest services for the User Groups managed by Master Mind
 * 
 * @author kmbauer
 */
@Path("/" + CONSTS.RESOURCE_ROLES)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_ROLES)
public class Roles extends BaseResource {
	/**
	 * Get the list of all user groups
	 * 
	 * @return all employees
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public String get() {
		try{
			RequestContext context = getRequestContext();
			JSONObject ret = Data.getRoles();
			
			URI baseURI = context.getBaseURI();
			ret.put(CONSTS.PROP_BASE, baseURI);
		
			return Data.escapeJSON(ret.toString());
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Get the list of all roles groups
	 * 
	 * @return all employees
	 */
	@GET
	@Path("{roleId}")
	@Produces({ MediaType.APPLICATION_JSON })
	public String get(@PathParam("roleId")String roleId) {
		try{
			RequestContext context = getRequestContext();
			JSONObject ret = Data.getRole(context, roleId);
			
			URI baseURI = context.getBaseURI();
			ret.put(CONSTS.PROP_BASE, baseURI);
		
			return Data.escapeJSON(ret.toString());
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
}
