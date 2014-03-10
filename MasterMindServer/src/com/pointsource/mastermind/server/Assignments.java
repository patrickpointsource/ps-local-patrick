package com.pointsource.mastermind.server;

import java.net.URI;
import java.util.Collection;
import java.util.Map;

import javax.ws.rs.GET;
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
 * @author kmbauer
 *
 * Rest Services for the set of skils
 *
 */
@Path("/" + CONSTS.RESOURCE_ASSIGNMENTS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_ASSIGNMENTS)
public class Assignments extends BaseResource {
	/**
	 * GET assignment documents
	 * 
	 * The list of assignments
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields) {
		try {
			try {
				RequestContext context = getRequestContext();
				Map<String, JSONObject> projects = Data.getAssignments(context, query, fields);
				JSONObject ret = new JSONObject();
				int total = projects.size();
				ret.put(CONSTS.PROP_COUNT, total);

				Collection<JSONObject> values = projects.values();
				ret.put(CONSTS.PROP_DATA, values);

				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_ASSIGNMENTS);

				String str = Data.escapeJSON(ret.toString());
				return Response.ok(str).build();
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
	 * GET an assignment document
	 * 
	 * An assignment by id
	 */
	@GET
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getById(@PathParam("id") String id, @QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getAssignment(context, id, query, fields);

				if (ret == null) {
					throw new WebApplicationException(Status.NOT_FOUND);
				}
				
				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				String retStr = Data.escapeJSON(ret);

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
}