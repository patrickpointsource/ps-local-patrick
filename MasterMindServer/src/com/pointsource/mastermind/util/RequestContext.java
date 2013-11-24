package com.pointsource.mastermind.util;

import java.net.URI;

import javax.servlet.ServletContext;

import org.json.JSONObject;

/**
 * An info the data layer will need about the current request
 * 
 * @author kmbauer
 */
public class RequestContext {
	private String authorization;
	private URI baseURI;
	private ServletContext servletContext;
	private JSONObject currentUser;
	
	
	/**
	 * The Current Authorized User
	 * @return
	 */
	public JSONObject getCurrentUser() {
		return currentUser;
	}

	public void setCurrentUser(JSONObject currentUser) {
		this.currentUser = currentUser;
	}

	/**
	 * Servlet Context
	 * @return
	 */
	public ServletContext getServletContext() {
		return servletContext;
	}

	public void setServletContext(ServletContext servletContext) {
		this.servletContext = servletContext;
	}

	/**
	 * The Authorization Header
	 */
	public String getAuthorization() {
		return authorization;
	}

	public void setAuthorization(String authorization) {
		this.authorization = authorization;
	}

	/**
	 * Base URI of the request
	 */
	public URI getBaseURI() {
		return baseURI;
	}

	public void setBaseURI(URI baseURI) {
		this.baseURI = baseURI;
	}
}
