package com.pointsource.mastermind.server;

import java.net.URI;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.wink.common.annotations.Workspace;
import org.json.JSONException;
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
	 * DELETE a role
	 */
	@DELETE
	@Path("{id}")
	public Response deleteById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.deleteRole(context, id);

				if (ret == null) {
					throw new WebApplicationException(Status.NOT_FOUND);
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
	 * Get the list of all user groups
	 * 
	 * @return all employees
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getRoles(context, query, fields);

				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				String retStr = Data.escapeJSON(ret.toString());
				return Response.ok(retStr).build();
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
	 * Get the list of all roles groups
	 * 
	 * @return all employees
	 */
	@GET
	@Path("{roleId}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@PathParam("roleId") String roleId) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getRole(context, roleId);

				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				String retStr = Data.escapeJSON(ret.toString());
				return Response.ok(retStr).build();
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
	 * POST role
	 * 
	 * Adds a new role to the collection
	 * 
	 * @param newRole
	 * 
	 * @return new role location
	 */
	@POST
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response post(JSONObject newRole) {
		try {
			try {
				RequestContext context = getRequestContext();

				JSONObject ret = Data.createRole(context, newRole);

				String about = Data.unescapeJSON(ret
						.getString(CONSTS.PROP_ABOUT));

				URI aboutURI = context.getBaseURI().resolve(about);
				return Response.created(aboutURI).build();
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
	 * PUT roles/:id
	 * 
	 * @param id
	 *            id of a role
	 * @param newRole
	 *            new role type definition
	 * 
	 * @return updated role
	 */
	@PUT
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response put(@PathParam("id") String id, JSONObject newRole) {
		try {
			try {
				RequestContext context = getRequestContext();
				
				JSONObject json = Data.updateRole(context, newRole);
				
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
