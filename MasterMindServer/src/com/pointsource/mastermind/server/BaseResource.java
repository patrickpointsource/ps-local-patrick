package com.pointsource.mastermind.server;

import java.util.Iterator;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.UriInfo;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.RequestContext;

public abstract class BaseResource {
	@Context protected UriInfo uriInfo;
	@Context protected ServletContext servletContext;
	@Context protected HttpHeaders headers;
	
	protected RequestContext getRequestContext(){
		RequestContext context = new RequestContext();
		
		java.util.List<String> authHeaders = headers.getRequestHeader(CONSTS.HEADER_AUTHORIZATION);
		String authHeader = null;
		if(authHeaders != null){
			for (Iterator iterator = authHeaders.iterator(); iterator.hasNext();) {
				String string = (String) iterator.next();
				if(string.startsWith(CONSTS.AUTH_TYPE)){
					authHeader = string;
					break;
				}
			}
		}
		
		/**
		 * If we have not found the access token check the cookies
		 */
		if(authHeader == null){
			Map<String, Cookie>cookies = headers.getCookies();
			Cookie cookie = cookies.get(CONSTS.COOKIE_NAME_ACCESS_TOKEN);
			if(cookie != null){
				authHeader = CONSTS.AUTH_TYPE + " " + cookie.getValue();
			}
		}
		
		context.setAuthorization(authHeader);
		context.setBaseURI(uriInfo.getBaseUri());
		
		return context;
	}
}
