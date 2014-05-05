package com.pointsource.mastermind.server.config;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.json.JSONObject;

import com.pointsource.mastermind.server.BaseResource;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.PermissionUtil;

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
		} catch (Exception e) {
			e.printStackTrace();
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}

	}

	@Path("/services")
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getServiceConfig() {
		try {
			PermissionUtil.checkAdminAccess(getRequestContext(),
					"fetch service config");
			JSONObject ret = Data.getServiceConfig();
			return sendResponseWithSerializedJson(ret, Status.OK);
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}

	@Path("/services")
	@PUT
	@Produces({ MediaType.APPLICATION_JSON })
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response putServiceConfiguration(JSONObject config) {
		try {
			Data.updateServiceConfig(getRequestContext(),
					config);
			return sendResponseWithSerializedJson(config, Status.OK);
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}

	@Path("/services")
	@DELETE
	public Response deleteServiceConfiguration() {
		try {
			Data.deleteServiceConfig(getRequestContext());
			return Response.ok().build();
		} catch (WebApplicationException e) {
			throw e;
		} catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}

}
