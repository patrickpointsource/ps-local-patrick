package com.pointsource.mastermind.server;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.apache.wink.common.annotations.Workspace;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;

@Path("/"+CONSTS.RESOURCE_PEOPLE)
@Workspace(workspaceTitle = CONSTS.WORKSPACE_TITLE, collectionTitle = CONSTS.RESOURCE_TITLE_PEOPLE)
public class People extends BaseResource {
	@GET
	@Produces({MediaType.APPLICATION_JSON})
	public JSONObject get() throws JSONException, IOException{
		JSONObject ret = Data.getPeople();
		return ret;
	}
	
	
}
