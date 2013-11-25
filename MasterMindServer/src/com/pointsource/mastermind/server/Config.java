package com.pointsource.mastermind.server;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.json.JSONObject;

import com.pointsource.mastermind.util.Data;

@Path("/config")
public class Config extends BaseResource {
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public String get() {
		try {
			JSONObject ret = Data.getConfig();

			return Data.escapeJSON(ret.toString());
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	@PUT
	@Produces({MediaType.APPLICATION_JSON})
	@Consumes({MediaType.APPLICATION_JSON})
	public Response put(JSONObject newProject){
		try {
			JSONObject json = Data.updateConfig(newProject);
			String ret = Data.escapeJSON(json);
			return Response.ok(ret).build();
		} catch (WebApplicationException e) {
			throw e;
		}
		catch (Exception e) {
			e.printStackTrace();
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
}
