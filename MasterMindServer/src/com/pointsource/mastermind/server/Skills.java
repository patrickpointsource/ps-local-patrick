package com.pointsource.mastermind.server;

import java.net.URI;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
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
@Path("/" + CONSTS.RESOURCE_SKILLS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_SKILLS)
public class Skills extends BaseResource {
	/**
	 * Get / Query the collection of skills
	 * 
	 * @return all skill definitions
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getSkills(context, query, fields);

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
	 * GET skills/:id
	 * 
	 * @param id
	 * @return A skill definition by id
	 */
	@GET
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getSkill(context, id);

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
	
	/**
	 * POST skills
	 * 
	 * Adds a new skill to the collection
	 * 
	 * @param newSkill
	 * 
	 * @return new skill location
	 */
	@POST
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response post(JSONObject newSkill) {
		try {
			try {
				RequestContext context = getRequestContext();

				JSONObject ret = Data.createSkill(newSkill);

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
	 * DELETE a skill
	 */
	@DELETE
	@Path("{id}")
	public Response deleteById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.deleteSkill(context, id);

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
}
