package com.pointsource.mastermind.server;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.apache.wink.common.annotations.Workspace;
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
	public JSONObject get() {
		try{
			JSONObject ret = Data.getPeople(servletContext);
			return ret;
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
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
	public JSONObject getMe() {
		try {
			RequestContext context = getRequestContext();
			JSONObject me = Data.getMe(context);
			return me;
		} catch (WebApplicationException e) {
			e.printStackTrace();
			throw e;
		} catch (Exception e) {
			e.printStackTrace();
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
}
