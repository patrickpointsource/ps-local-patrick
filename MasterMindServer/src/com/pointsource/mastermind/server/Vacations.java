/**
 * 
 */
package com.pointsource.mastermind.server;

import java.net.URI;
import java.util.Arrays;

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

import com.pointsource.mastermind.server.smtp.SmtpHelper;
import com.pointsource.mastermind.server.smtp.SmtpSender;
import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

/**
 * @author donila
 *
 */
@Path("/" + CONSTS.RESOURCE_VACATIONS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_VACATIONS)
public class Vacations extends BaseResource {
	
	/**
	 * Get the list of all recorded vacations
	 * 
	 * @return all hours
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields, @QueryParam(CONSTS.REQUEST_PARAM_NAME_SORT)String sort) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONArray hours = Data.getVacations(context, query, fields, sort);
				JSONObject ret = new JSONObject();
				int total = hours.length();
				
				ret.put(CONSTS.PROP_COUNT, total);
				ret.put(CONSTS.PROP_MEMBERS, hours);

				URI baseURI = context.getBaseURI();
				
				ret.put(CONSTS.PROP_BASE, baseURI);
				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_VACATIONS);

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
	 * DELETE a vacation record
	 */
	@DELETE
	@Path("{id}")
	public Response deleteById(@PathParam("id") String id) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = Data.deleteVacationRecord(context, id);

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
	 * POST hours record
	 * 
	 * Adds a new hours record to the collection
	 * 
	 * @param hoursRecord
	 * 
	 * @return new project location
	 */
	@POST
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response post(JSONObject vacationRecord) {
		try {
			try {
				RequestContext context = getRequestContext();

				JSONObject ret = Data.createVacation(context, vacationRecord);
				
				JSONObject vManager = (JSONObject) vacationRecord.get(CONSTS.PROP_VACATION_MANAGER);
				String vManagerRef = vManager.getString(CONSTS.PROP_RESOURCE);
				String vManagerId = vManagerRef.substring(vManagerRef.lastIndexOf('/')+1);
				JSONObject vManagerProfile = Data.getPerson(context, vManagerId);

				JSONObject person = (JSONObject) vacationRecord.get(CONSTS.PROP_PERSON);
				String personRef = person.getString(CONSTS.PROP_RESOURCE);
				String personId = personRef.substring(personRef.lastIndexOf('/')+1);
				JSONObject personProfile = Data.getPerson(context, personId);
				
				String mBox = (String) vManagerProfile.get(CONSTS.PROP_MBOX);
				if (mBox != null) {
					String requestType = (String) vacationRecord.get(CONSTS.PROP_TYPE);
					String startDate = (String) vacationRecord.get(CONSTS.PROP_START_DATE);
					String endDate = (String) vacationRecord.get(CONSTS.PROP_END_DATE);
					String description = (String) vacationRecord.get(CONSTS.PROP_DESCRIPTION);
					String personName = (String) personProfile.get(CONSTS.PROP_NAME);
					String userName = (String) vManagerProfile.get(CONSTS.PROP_GIVEN_NAME);
					String title = "Pending Paid " + requestType + " Request";
					String message = SmtpHelper.getOutOfOfficeRequestMessage(userName, personName, requestType, startDate, endDate, description);
					SmtpSender.getInstance().sendTLSEmail(Arrays.asList(new String[]{mBox}), null, title, message);
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
	 * PUT hours/:id
	 * 
	 * @param id
	 *            id of a hours record
	 * @param newHours
	 *            new hours record definition
	 * 
	 * @return updated hours record
	 */
	@PUT
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response put(@PathParam("id") String id, JSONObject newHours) {
		try {
			try {
				RequestContext context = getRequestContext();
				
				JSONObject json = Data.updateVacation(context, newHours);
				
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
