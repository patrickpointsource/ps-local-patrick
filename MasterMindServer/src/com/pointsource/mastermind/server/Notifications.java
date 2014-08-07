/**
 * 
 */
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
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

/**
 * @author donila
 *
 */
@Path("/" + CONSTS.RESOURCE_NOTIFICATIONS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_NOTIFICATIONS)
public class Notifications extends BaseResource {
	
	/**
	 * Get the list of all recorded notifications
	 * 
	 * @return all notifications
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields, @QueryParam(CONSTS.REQUEST_PARAM_NAME_SORT)String sort) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONArray notifications = Data.getNotifications(context, query, fields, sort);
				JSONObject ret = new JSONObject();
				int total = notifications.length();
				
				ret.put(CONSTS.PROP_COUNT, total);
				ret.put(CONSTS.PROP_MEMBERS, notifications);

				URI baseURI = context.getBaseURI();
				
				ret.put(CONSTS.PROP_BASE, baseURI);
				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_NOTIFICATIONS);

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
	 * DELETE a notification record
	 */
	@DELETE
	@Path("{id}")
	public Response deleteById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.deleteNotificationRecord(context, id);

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
	 * POST notification record
	 * 
	 * Adds a new notification record to the collection
	 * 
	 * @param notificationRecord
	 * 
	 * @return new project location
	 */
	@POST
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response post(JSONObject notificationRecord) {
		try {
			try {
				RequestContext context = getRequestContext();

				JSONObject ret = Data.createNotification(context, notificationRecord);

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
	 * PUT notifications/:id
	 * 
	 * @param id
	 *            id of a notification record
	 * @param newNotification
	 *            new notification record definition
	 * 
	 * @return updated notification record
	 */
	@PUT
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response put(@PathParam("id") String id, JSONObject newNotification) {
		try {
			try {
				RequestContext context = getRequestContext();
				
				JSONObject json = Data.updateVacation(context, newNotification);
				
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

