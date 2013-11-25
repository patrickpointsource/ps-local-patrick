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
		
		httpResponse.setHeader("Access-Control-Allow-Origin", "*");
		httpResponse.setHeader("Access-Control-Allow-Headers",
				httpRequest.getHeader("Access-Control-Request-Headers"));
		httpResponse.setHeader("Access-Control-Allow-Methods",
				httpRequest.getHeader("Access-Control-Request-Method"));
		
		chain.doFilter(httpRequest, httpResponse);
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		
	}

}
