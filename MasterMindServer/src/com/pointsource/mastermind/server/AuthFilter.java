/**
 * 
 */
package com.pointsource.mastermind.server;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.wink.client.ClientResponse;
import org.apache.wink.client.Resource;
import org.apache.wink.client.RestClient;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

/**
 * @author kmbauer
 * 
 */
public class AuthFilter implements Filter {

	/*
	 * (non-Javadoc)
	 * 
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
	 * javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest req, ServletResponse resp,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpReq = (HttpServletRequest) req;
		HttpServletResponse httpResponse = (HttpServletResponse) resp;
		
		try {
			HttpSession session = httpReq.getSession(true);
			JSONObject domainUser = null;
			String fields = "{"+CONSTS.PROP_ACCOUNTS+":0}";
			
			if (CONSTS.USE_LOCAL_AUTH) {
				/*
				 * To be used primarily for local demo purposes
				 */
				String authorizationHeader = httpReq.getHeader("Authorization");
				System.out.println("authorizationHeader =" + authorizationHeader);
				
				if (authorizationHeader != null) {
					String[] headerParts = authorizationHeader.split(" ");
					for(int i=0; i< headerParts.length; i++) {
						System.out.println("headerParts[" + i + "]=" + headerParts[i]);
					}			
					
					System.out.println("httpReq =" + httpReq);
					String query = "{"+"mBox"+":'"+headerParts[1]+"'}";
					domainUser = Data.getPerson(null, query, fields);
				}
				
				if (domainUser == null) {
					/*
					 * Use Aditya's google ID by default
					 */
					String query_old = "{"+CONSTS.PROP_GOOGLE_ID+":'"+"102238582318534521897"+"'}";
					domainUser = Data.getPerson(null, query_old, fields);
				}
				System.out.println("Setting user to:" + domainUser);
				session.setAttribute(CONSTS.SESSION_USER_KEY, domainUser);
			}
			else {
				String authToken = checkAuth(httpReq);
				
				String existingToken = String.valueOf(session
						.getAttribute(CONSTS.COOKIE_NAME_ACCESS_TOKEN));
				/**
				 * If we have a new access token or the session no longer contains a session user
				 */
				if (!authToken.equals(existingToken) || session.getAttribute(CONSTS.SESSION_USER_KEY) == null) {
				
					String id = getUserId(httpReq, authToken);
		
					// Check if the User is in our domain
					RequestContext context = new RequestContext();
					context.setServletContext(httpReq.getServletContext());
					
					String query = "{"+CONSTS.PROP_GOOGLE_ID+":'"+id+"'}";
					domainUser = Data.getPerson(context, query, fields);

					if(domainUser == null){
						System.err.println(403 + ": "+ domainUser + " is not a member of the PointSource domain");
						throw new WebApplicationException(
								Response.status(Status.FORBIDDEN)
										.entity("User is not a member of the PointSource domain")
										.build());
					}
					
					// Set the User context into the session
					session.setAttribute(CONSTS.COOKIE_NAME_ACCESS_TOKEN, authToken);
					session.setAttribute(CONSTS.SESSION_USER_KEY, domainUser);
				}
			}
			
			chain.doFilter(req, resp);
			
		} catch (WebApplicationException e) {
			e.printStackTrace();
			httpResponse.sendError(e.getResponse().getStatus(),
					String.valueOf(e.getResponse().getEntity()));
		} catch (Exception e) {
			e.printStackTrace();
			httpResponse.sendError(
					Status.INTERNAL_SERVER_ERROR.getStatusCode(),
					e.getLocalizedMessage());
		}
	}

	public static String checkAuth(HttpServletRequest httpReq)
			throws URISyntaxException {
		String authToken = httpReq.getHeader(CONSTS.HEADER_AUTHORIZATION);

		if (authToken == null) {
			// Check the param and cookies
			String token = httpReq
					.getParameter(CONSTS.COOKIE_NAME_ACCESS_TOKEN);
			if (token == null) {
				Cookie[] cookies = httpReq.getCookies();
				if (cookies != null) {
					for (int i = 0; i < cookies.length; i++) {
						Cookie ith = cookies[i];
						String name = ith.getName();

						if (CONSTS.COOKIE_NAME_ACCESS_TOKEN.equals(name)) {
							token = ith.getValue();
							break;
						}
					}
				}
			}

			// If not found redirect to the login page
			if (token == null) {
				throw new WebApplicationException(
						Response.status(Status.UNAUTHORIZED)
								.entity("No Access Token was sent with the request")
								.build());

			}

			// Create Auth Header from access token
			else {
				authToken = CONSTS.AUTH_TYPE + " " + token;
			}
		}

		return authToken;
	}
	
	
	public static String getUserId(HttpServletRequest httpReq, String authToken) throws URISyntaxException{
		String id = null;
		HttpSession session = httpReq.getSession(true);
		
		URI googleProfile = new URI(CONSTS.GOOGLE_PLUS_PEOPLE_URI
				+ CONSTS.RESOURCE_ME);
		RestClient client = new RestClient();
		Resource resource = client.resource(googleProfile);
		ClientResponse response = resource
				.header(CONSTS.HEADER_AUTHORIZATION, authToken)
				.accept(MediaType.APPLICATION_JSON).get();

		if (response.getStatusCode() != Status.OK.getStatusCode()) {
			session.removeAttribute(CONSTS.COOKIE_NAME_ACCESS_TOKEN);
			session.removeAttribute(CONSTS.SESSION_USER_KEY);
			
			//Error authenticating with Google...
			String err = response.getEntity(String.class);
			System.err.println(response.getStatusCode() + ": "+err);
			
			throw new WebApplicationException(
					Response.status(response.getStatusCode())
							.entity(err)
							.build());
		}

		String str = response.getEntity(String.class);
		JSONObject ret = new JSONObject(str);
		
		if(!ret.has(CONSTS.PROP_ID)){
			throw new WebApplicationException(
					Response.status(Status.FORBIDDEN)
							.entity("Failed to fetch Google user")
							.build());
		}
		
		id = ret.getString(CONSTS.PROP_ID);
			
		return id;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
	 */
	@Override
	public void init(FilterConfig config) throws ServletException {

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see javax.servlet.Filter#destroy()
	 */
	@Override
	public void destroy() {

	}
}
