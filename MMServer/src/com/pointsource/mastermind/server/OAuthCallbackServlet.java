package com.pointsource.mastermind.server;

import java.io.IOException;
import java.util.Collections;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.AuthorizationCodeResponseUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.appengine.auth.oauth2.AbstractAppEngineAuthorizationCodeCallbackServlet;
import com.google.api.client.extensions.appengine.auth.oauth2.AppEngineCredentialStore;
import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.services.admin.directory.DirectoryScopes;

public class OAuthCallbackServlet extends AbstractAppEngineAuthorizationCodeCallbackServlet {

		  @Override
		  protected void onSuccess(HttpServletRequest req, HttpServletResponse resp, Credential credential)
		      throws ServletException, IOException {
		    resp.sendRedirect("/");
		  }

		  @Override
		  protected void onError(
		      HttpServletRequest req, HttpServletResponse resp, AuthorizationCodeResponseUrl errorResponse)
		      throws ServletException, IOException {
		    // handle error
		  }

		  @Override
		  protected String getRedirectUri(HttpServletRequest req) throws ServletException, IOException {
		    GenericUrl url = new GenericUrl(req.getRequestURL().toString());
		    url.setRawPath("/oauth2callback");
		    return url.build();
		  }

		  @Override
		  protected AuthorizationCodeFlow initializeFlow() throws IOException {
		    return new GoogleAuthorizationCodeFlow.Builder(new UrlFetchTransport(), new JacksonFactory(),
		        "141952851027.apps.googleusercontent.com", "Jiy0OMx_vOzHK1mXSIGSoog1",
		        Collections.singleton(DirectoryScopes.ADMIN_DIRECTORY_USER_READONLY)).setCredentialStore(
		        new AppEngineCredentialStore()).build();
		  }
		
}
