/**
 * 
 */
package com.pointsource.mastermind.server;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author kmbauer
 *
 */
public class AuthFilter implements Filter {

	/* (non-Javadoc)
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest req, ServletResponse resp,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpReq = (HttpServletRequest) req;
		
		//Check the param
		String token = httpReq.getParameter("access_token");
		
		if(token == null){
			Cookie[] cookies = httpReq.getCookies();
			if(cookies != null){
				for(int i = 0; i < cookies.length; i++){
					Cookie ith = cookies[i];
					String name = ith.getName();
					
					if("access_token".equals(name)){
						token = ith.getValue();
						break;
					}
				}
			}
		}
		
		if(token == null){
			String context = httpReq.getContextPath();
			String redirect = context+"/index.html";
			
			HttpServletResponse httpResponse = (HttpServletResponse) resp;
			httpResponse.sendRedirect(redirect);
		}
		
		else{
			chain.doFilter(req, resp);
		}
	}

	/* (non-Javadoc)
	 * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
	 */
	@Override
	public void init(FilterConfig config) throws ServletException {
		
	}

	/* (non-Javadoc)
	 * @see javax.servlet.Filter#destroy()
	 */
	@Override
	public void destroy() {
		
	}
}
