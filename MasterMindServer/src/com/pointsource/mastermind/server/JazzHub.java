package com.pointsource.mastermind.server;

import java.net.URI;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.wink.common.annotations.Workspace;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.server.jazzhub.JazzData;
import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

@Path("/" + CONSTS.RESOURCE_JAZZ_HUB)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_JAZZ_HUB)
public class JazzHub extends BaseResource {
	/**
	 * Get the listing of all jazz hub projects
	 * @param query
	 * @param fields
	 * @param sort
	 * @return
	 */
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response get() {
		DefaultHttpClient httpClient = new DefaultHttpClient();
		try {
			try {
				RequestContext context = getRequestContext();
				JSONObject ret = JazzData.getJazzHubProjects();
				
				URI baseURI = context.getBaseURI();
				ret.put(CONSTS.PROP_BASE, baseURI);
				ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_JAZZ_HUB);

				String str = Data.escapeJSON(ret.toString());
				return Response.ok(str).build();
			} catch (WebApplicationException e) {
				return handleWebApplicationException(e);
			} catch (Exception e) {
				return handleInternalServerError(e);
			}
		} catch (JSONException e) {
			return handleJSONException(e);
		}finally{
			httpClient.getConnectionManager().shutdown();
		}
	}
}
