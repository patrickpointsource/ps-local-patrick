/**
 * 
 */
package com.pointsource.mastermind.server;

import java.net.URI;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.wink.common.annotations.Workspace;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

/**
 * @author kmbauer
 *
 */
@Path("/" + CONSTS.RESOURCE_HOURS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_HOURS)
public class Hours extends BaseResource {
	/**
	 * Get the list of all recorded hours
	 * 
	 * @return all hours
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get(@QueryParam(CONSTS.REQUEST_PARAM_NAME_QUERY)String query, @QueryParam(CONSTS.REQUEST_PARAM_NAME_FIELDS)String fields, @QueryParam(CONSTS.REQUEST_PARAM_NAME_SORT)String sort) {
		try {
			try {
				RequestContext context = getRequestContext();
				JSONArray hours = Data.getHours(context, query, fields, sort);
				JSONObject ret = new JSONObject();
				int total = hours.length();
				ret.put(CONSTS.PROP_COUNT, total);

				ret.put(CONSTS.PROP_MEMBERS, hours);

				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);

				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_HOURS);

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
}
