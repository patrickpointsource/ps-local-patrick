package com.pointsource.mastermind.server;

import java.net.URI;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
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
import org.json.JSONArray;
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
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields, @QueryParam(CONSTS.REQUEST_PARAM_NAME_SORT)String sort) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONArray people = Data.getPeople(context, query, fields, sort);
				JSONObject ret = new JSONObject();
				int total = people.length();
				ret.put(CONSTS.PROP_COUNT, total);

				ret.put(CONSTS.PROP_MEMBERS, people);

				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_PEOPLE);

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
	 * DELETE a person
	 */
	@DELETE
	@Path("{id}")
	public Response deleteById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.deletePerson(context, id);

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
	 * GET people/:id
	 * 
	 * @param id
	 * @return A people by id
	 */
	@GET
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.getPerson(context, id);

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
				
				//Get the latest
				JSONObject _id = me.getJSONObject(CONSTS.PROP__ID);
				String query = "{"+CONSTS.PROP__ID+":"+_id+"}";
				
				me = Data.getPerson(context, query, null);

				if (me == null) {
					throw new WebApplicationException(Status.NOT_FOUND);
				}

				URI baseURI = context.getBaseURI();
				me.put(CONSTS.PROP_BASE, baseURI);
				
				//Set the session context
				request.getSession().setAttribute(CONSTS.SESSION_USER_KEY, me);
				
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

//  People Cannot be created	
//	/**
//	 * POST person
//	 * 
//	 * Adds a new person to the collection
//	 * 
//	 * @param newPerson
//	 * 
//	 * @return new person location
//	 */
//	@POST
//	@Produces({ MediaType.APPLICATION_JSON })
//	@Consumes({ MediaType.APPLICATION_JSON })
//	public Response post(JSONObject newPerson) {
//		try {
//			try {
//				RequestContext context = getRequestContext();
//
//				//TODO Validate Person
//				JSONObject ret = Data.createPerson(context, newPerson);
//
//				String about = Data.unescapeJSON(ret
//						.getString(CONSTS.PROP_ABOUT));
//
//				URI aboutURI = context.getBaseURI().resolve(about);
//				return Response.created(aboutURI).build();
//			} catch (WebApplicationException e) {
//				return handleWebApplicationException(e);
//			} catch (Exception e) {
//				return handleInternalServerError(e);
//			}
//		} catch (JSONException e) {
//			return handleJSONException(e);
//		}
//	}

	/**
	 * PUT people/:id
	 * 
	 * @param id
	 *            id of a person
	 * @param newPerson
	 *            new person definition
	 * 
	 * @return updated person
	 */
	@PUT
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response put(@PathParam("id") String id, JSONObject newPerson) {
		try {
			try {
				RequestContext context = getRequestContext();
				
				JSONObject json = Data.updatePerson(context, newPerson);
				
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
