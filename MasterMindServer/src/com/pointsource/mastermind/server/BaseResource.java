package com.pointsource.mastermind.server;

import javax.servlet.ServletContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;

public abstract class BaseResource {
	@Context protected UriInfo uriInfo;
	@Context protected ServletContext servletContext;
	
	
}
