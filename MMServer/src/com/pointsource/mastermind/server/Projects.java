package com.pointsource.mastermind.server;

import java.net.URI;
import java.util.Collection;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.wink.common.annotations.Workspace;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;

@Path("/"+CONSTS.RESOURCE_PROJECTS)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_PROJECTS)
public class Projects extends BaseResource {
	
	@GET
	@Produces({MediaType.APPLICATION_JSON})
	public String get(){
		try {
			Map<String, JSONObject> projects = Data.getProjects();
			JSONObject ret = new JSONObject();
			int total = projects.size();
			ret.put(CONSTS.PROP_COUNT, total);
			
			Collection<JSONObject> values = projects.values();
			ret.put(CONSTS.PROP_DATA, values);
			
			URI baseURI = uriInfo.getBaseUri();
			ret.put(CONSTS.PROP_BASE, baseURI);
			ret.put(CONSTS.PROP_BASE, baseURI);
			
			ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_PROJECTS);
			
			return Data.escapeJSON(ret.toString());
		} catch (WebApplicationException e) {
			throw e;
		}catch (JSONException e) {
			throw new WebApplicationException(e, Status.BAD_REQUEST);
		} 
		catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GET
	@Path("{id}")
	@Produces({MediaType.APPLICATION_JSON})
	public String get(@PathParam("id")String id){
		try {
			JSONObject ret = Data.getProject(id);
			
			if(ret == null){
				throw new WebApplicationException(Status.NOT_FOUND);
			}
			
			URI baseURI = uriInfo.getBaseUri();
			ret.put(CONSTS.PROP_BASE, baseURI);
			
			return Data.escapeJSON(ret);
		} catch (WebApplicationException e) {
			throw e;
		}catch (JSONException e) {
			throw new WebApplicationException(e, Status.BAD_REQUEST);
		} 
		catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
	
	@POST
	@Produces({MediaType.APPLICATION_JSON})
	@Consumes({MediaType.APPLICATION_JSON})
	public Response post(JSONObject newProject){
		try {
			JSONObject ret = Data.createProject(newProject);
			
			String about  = Data.unescapeJSON(ret.getString(CONSTS.PROP_ABOUT));
			
			URI aboutURI = uriInfo.getBaseUri().resolve(about);
			
			return Response.created(aboutURI).build();
		} catch (WebApplicationException e) {
			throw e;
		}catch (JSONException e) {
			throw new WebApplicationException(e, Status.BAD_REQUEST);
		} 
		catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PUT
	@Path("{id}")
	@Produces({MediaType.APPLICATION_JSON})
	@Consumes({MediaType.APPLICATION_JSON})
	public Response put(@PathParam("id")String id, JSONObject newProject){
		try {
			newProject.put(CONSTS.PROP_ID, id);
			JSONObject json = Data.updateProject(newProject);
			String ret = Data.escapeJSON(json);
			return Response.ok(ret).build();
		} catch (WebApplicationException e) {
			throw e;
		}catch (JSONException e) {
			throw new WebApplicationException(e, Status.BAD_REQUEST);
		} 
		catch (Exception e) {
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}
	}
}
