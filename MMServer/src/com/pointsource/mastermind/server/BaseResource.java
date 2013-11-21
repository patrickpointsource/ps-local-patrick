package com.pointsource.mastermind.server;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;

public abstract class BaseResource {
	@Context protected UriInfo uriInfo;
	
	
	
}
