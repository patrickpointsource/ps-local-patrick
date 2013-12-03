package com.pointsource.mastermind.server;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
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
 * RSET Services for the Master Mind People Resources
 * 
 * @author kmbauer
 */
@Path("/" + CONSTS.RESOURCE_PEOPLE)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_PEOPLE)
public class People extends BaseResource {
	/**
	 * Get the list of all employees
	 * 
	 * @return all employees
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get() {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getPeople(context);
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

	/**
	 * Get a single user definition
	 * 
	 * @return me
	 */
	@GET
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getPerson(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getPerson(context, id);
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

	/**
	 * Who am I
	 * 
	 * @return me
	 */
	@GET
	@Path(CONSTS.RESOURCE_ME)
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getMe() {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject me = context.getCurrentUser();
				return Response.ok(me).build();
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
