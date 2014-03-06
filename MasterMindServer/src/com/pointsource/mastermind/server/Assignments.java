package com.pointsource.mastermind.server;

import java.net.URI;



import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;



import org.apache.wink.common.annotations.Workspace;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;


/**
 * Rest services for the Role Assignments managed by Master Mind
 * 
 * @author vyancharuk
 */
@Path("/" + CONSTS.RESOURCE_ASSIGNMENTS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_ASSIGNMENTS)
public class Assignments extends BaseResource {

	/**
	 * GET assignments
	 * 
	 * The list of project's assignments
	 */
	
	@GET
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getById(@QueryParam("projectId")String projectId, @QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getProjectAssignments(context, projectId);
				
				if (ret != null) {

					URI baseURI = context.getBaseURI();
					ret.put(CONSTS.PROP_BASE, baseURI);
	
					ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_ASSIGNMENTS);
	
					String str = Data.escapeJSON(ret.toString());
					return Response.ok(str).build();
				}
				
				return Response.ok().build();
			} catch (WebApplicationException e) {
				return handleWebApplicationException(e);
			} catch (Exception e) {
				return handleInternalServerError(e);
			}
		} catch (JSONException e) {
			return handleJSONException(e);
		}
	}
	
	/**
	 * PUT assignment/:id
	 * 
	 * @param id
	 *            id of a project
	 */
	@PUT
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response put(String projectId, JSONObject assignment) {
		try {
			try {
				RequestContext context = getRequestContext();
				
				//Data.updateRoleAssignments(context, projectId, assignments);
				
				JSONObject json = new JSONObject();
				
				URI baseURI = context.getBaseURI();
				json.put(CONSTS.PROP_BASE, baseURI);
				
				String ret = Data.escapeJSON(json);
				return Response.ok(ret).build();
			} catch (WebApplicationException e) {
				return handleWebApplicationException(e);
			} catch (Exception e) {
				return handleInternalServerError(e);
			}
		} catch (JSONException e) {
			return handleJSONException(e);
		}
	}
	
}
