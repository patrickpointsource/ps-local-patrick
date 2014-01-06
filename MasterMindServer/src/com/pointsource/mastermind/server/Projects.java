package com.pointsource.mastermind.server;

import java.net.URI;
import java.util.Collection;
import java.util.Map;

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
import com.pointsource.mastermind.util.ValidationException;
import com.pointsource.mastermind.util.Validator;

/**
 * REST services for master mind project resource collection
 * 
 * @author kmbauer
 */
@Path("/" + CONSTS.RESOURCE_PROJECTS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_PROJECTS)
public class Projects extends BaseResource {

	/**
	 * GET projects
	 * 
	 * The list of projects
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields) {
		try {
			try {
				RequestContext context = getRequestContext();
				Map<String, JSONObject> projects = Data.getProjects(context, query, fields);
				JSONObject ret = new JSONObject();
				int total = projects.size();
				ret.put(CONSTS.PROP_COUNT, total);

				Collection<JSONObject> values = projects.values();
				ret.put(CONSTS.PROP_DATA, values);

				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_PROJECTS);

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
	 * GET projects/:id
	 * 
	 * @param id
	 * @return A project by id
	 */
	@GET
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getProject(context, id);

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
	 * DELETE a project
	 */
	@DELETE
	@Path("{id}")
	public Response deleteById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.deleteProject(context, id);

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
	 * POST projects
	 * 
	 * Adds a new project to the collection
	 * 
	 * @param newProject
	 * 
	 * @return new project location
	 */
	@POST
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response post(JSONObject newProject) {
		try {
			try {
				RequestContext context = getRequestContext();

				Validator.canCreateProject(context, newProject);
				JSONObject ret = Data.createProject(newProject);

				String about = Data.unescapeJSON(ret
						.getString(CONSTS.PROP_ABOUT));

				URI aboutURI = context.getBaseURI().resolve(about);
				return Response.created(aboutURI).build();
			} catch (ValidationException e) {
				return handleValidationException(e);
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
	 * PUT projects/:id
	 * 
	 * @param id
	 *            id of a project
	 * @param newProject
	 *            new project definition
	 * 
	 * @return updated project
	 */
	@PUT
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response put(@PathParam("id") String id, JSONObject newProject) {
		try {
			try {
				RequestContext context = getRequestContext();
				Validator.canUpdateProject(context, newProject);
				JSONObject json = Data.updateProject(context, id, newProject);
				String ret = Data.escapeJSON(json);
				return Response.ok(ret).build();
			} catch (ValidationException e) {
				return handleValidationException(e);
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
