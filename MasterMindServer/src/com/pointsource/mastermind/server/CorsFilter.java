package com.pointsource.mastermind.server;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response.Status;

import com.pointsource.mastermind.util.CONSTS;

/**
 * This filter adds headers to allow Cross-Origin Resource Sharing to
 * the response.
 * 
 * @author Zachary Kuhn
 */
public class CorsFilter implements Filter {

	@Override
	public void destroy() {
		
	}

	/**
	 * Adds headers for Cross-Origin Resource Sharing.
	 * 
	 * These headers are:
	 *   - Access-Control-Allow-Origin
	 *   - Access-Control-Allow-Headers
	 *   - Access-Control-Allow-Methods
	 *   
	 * The Access-Control-Allow-Headers header is set to the request's
	 * Access-Control-Request-Headers header.
	 * 
	 * The Access-Control-Allow-Methods header is set to the request's
	 * Access-Control-Request-Method header.
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		
		String method = httpRequest.getMethod();
		
		//httpResponse.setHeader("Access-Control-Allow-Origin", httpRequest.getHeader("Origin"));
		httpResponse.setHeader("Access-Control-Allow-Origin", CONSTS.WEB_SITE_URL);
		httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
		httpResponse.setHeader("Access-Control-Allow-Headers",
				httpRequest.getHeader("Access-Control-Request-Headers"));
		httpResponse.setHeader("Access-Control-Allow-Methods",
				httpRequest.getHeader("Access-Control-Request-Method"));
		
		//Eats all OPtions Requests
		if(method.equalsIgnoreCase("OPTIONS")){
			httpResponse.setStatus(Status.OK.getStatusCode());
		}
		else{
			chain.doFilter(httpRequest, httpResponse);
		}
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		
	}

}
