package com.pointsource.mastermind.server;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.UriInfo;

import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.RequestContext;

public abstract class BaseResource {
	@Context private UriInfo uriInfo;
	@Context private ServletContext servletContext;
	@Context private HttpHeaders headers;
	@Context private HttpServletRequest request;
	
	protected RequestContext getRequestContext(){
		RequestContext context = new RequestContext();
		HttpSession session = request.getSession();
		Object user = session.getAttribute(CONSTS.SESSION_USER_KEY);
		context.setCurrentUser((JSONObject)user);
		Object auth = session.getAttribute(CONSTS.COOKIE_NAME_ACCESS_TOKEN);
		context.setAuthorization(String.valueOf(auth));
		context.setBaseURI(uriInfo.getBaseUri());
		context.setServletContext(servletContext);
		
		return context;
	}
}
