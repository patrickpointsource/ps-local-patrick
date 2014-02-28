package com.pointsource.mastermind.server;

import java.net.URI;
import java.net.URISyntaxException;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.core.Response.Status;

import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.RequestContext;
import com.pointsource.mastermind.util.ValidationException;

public abstract class BaseResource {
	@Context
	protected UriInfo uriInfo;
	@Context
	protected ServletContext servletContext;
	@Context
	protected HttpHeaders headers;
	@Context
	protected HttpServletRequest request;

	/**
	 * All relevant info about the request
	 * @throws URISyntaxException 
	 */
	protected RequestContext getRequestContext() throws URISyntaxException {
		RequestContext context = new RequestContext();
		HttpSession session = request.getSession();
		Object user = session.getAttribute(CONSTS.SESSION_USER_KEY);
		if (user == null)
			throw new WebApplicationException(Response
					.status(Status.UNAUTHORIZED)
					.header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN)
					.entity("Current User is Not Set!").build());
		context.setCurrentUser((JSONObject) user);
		Object auth = session.getAttribute(CONSTS.COOKIE_NAME_ACCESS_TOKEN);
		context.setAuthorization(String.valueOf(auth));
		context.setBaseURI(new URI(CONSTS.PUBLIC_BASE_URL));
		context.setServletContext(servletContext);

		return context;
	}

	/**
	 * Handle a JSON format exception
	 * 
	 * @param ex
	 * @return
	 */
	protected Response handleJSONException(JSONException ex) {
		ex.printStackTrace(System.err);
		String error = "{\"status\":400,\"message\"=\""
				+ ex.getLocalizedMessage() + "\"}";
		Response ret = Response.status(Status.BAD_REQUEST).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON).entity(error)
				.build();
		return ret;
	}

	/**
	 * Handle a validation exception
	 * 
	 * @param ex
	 * @return
	 * @throws JSONException
	 */
	protected Response handleValidationException(ValidationException ex)
			throws JSONException {
		JSONObject error = new JSONObject();

		int status = Status.BAD_REQUEST.getStatusCode();
		error.put(CONSTS.PROP_STATUS, status);
		error.put(CONSTS.PROP_MESSAGE, ex.getLocalizedMessage());

		String[] messages = ex.getMessages();
		if (messages.length > 0) {
			error.put(CONSTS.PROP_REASONS, messages);
		}

		Response ret = Response.status(status).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON).entity(error).build();
		return ret;
	}

	/**
	 * Handle a thrown WebApplication exception
	 * 
	 * @throws JSONException
	 */
	protected Response handleWebApplicationException(WebApplicationException ex)
			throws JSONException {
		JSONObject error = new JSONObject();
		Response response = ex.getResponse();
		int status = response.getStatus();
		String message = String.valueOf(response.getEntity());
		error.put(CONSTS.PROP_STATUS, status);
		error.put(CONSTS.PROP_MESSAGE, message);

		Response ret = Response.status(status).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON).entity(error).build();
		return ret;
	}

	/**
	 * Handle an unexpected serevr error
	 * 
	 * @throws JSONException
	 */
	protected Response handleInternalServerError(Exception ex)
			throws JSONException {
		ex.printStackTrace(System.err);
		JSONObject error = new JSONObject();

		int status = Status.INTERNAL_SERVER_ERROR.getStatusCode();
		String message = String.valueOf(ex.getLocalizedMessage());
		error.put(CONSTS.PROP_STATUS, status);
		error.put(CONSTS.PROP_MESSAGE, message);

		Response ret = Response.status(status).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON).entity(error).build();
		return ret;
	}

}
