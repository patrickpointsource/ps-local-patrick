/**
 * 
 */
package com.pointsource.mastermind.util;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

/**
 *
 */
public class ConflictException extends WebApplicationException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	public ConflictException(String message) {
		super(Response.status(Status.CONFLICT).entity(message).build());
	}







}
