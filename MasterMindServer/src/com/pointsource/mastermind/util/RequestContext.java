package com.pointsource.mastermind.util;

import java.net.URI;

/**
 * An info the data layer will need about the current request
 * 
 * @author kmbauer
 */
public class RequestContext {
	private String authorization;
	private URI baseURI;

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
