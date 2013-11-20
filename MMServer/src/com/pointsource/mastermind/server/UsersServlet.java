package com.pointsource.mastermind.server;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.api.client.googleapis.extensions.appengine.auth.oauth2.AppIdentityCredential;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.services.admin.directory.Directory;
import com.google.api.services.admin.directory.DirectoryScopes;
import com.google.api.services.admin.directory.model.User;
import com.google.api.services.admin.directory.model.Users;

public class UsersServlet extends HttpServlet {
	/**
	 * Replace this with the client ID you got from the Google APIs console.
	 */
	public static final String CLIENT_ID = "141952851027.apps.googleusercontent.com";

	/**
	 * Replace this with the client secret you got from the Google APIs console.
	 */
	public static final String CLIENT_SECRET = "Jiy0OMx_vOzHK1mXSIGSoog1";

	/**
	 * MIME type to use when sending responses back to PhotoHunt clients.
	 */
	public static final String JSON_MIMETYPE = "application/json";

	/**
	 * Key name in the session referring to the Google user ID of the current
	 * user.
	 */
	public static final String CURRENT_USER_SESSION_KEY = "me";

	/**
	 * JsonFactory to use in parsing JSON.
	 */
	public static final JsonFactory JSON_FACTORY = new JacksonFactory();

	/**
	 * HttpTransport to use for external requests.
	 */
	public static final HttpTransport TRANSPORT = new NetHttpTransport();
	
	/**
	 * Scopes
	 */
	List<String> SCOPES = Arrays.asList(DirectoryScopes.ADMIN_DIRECTORY_USER_READONLY);

	/**
	 * 100 seconds in milliseconds for token expiration calculations.
	 */
	private static final Long HUNDRED_SECONDS_IN_MS = 100000l;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {
		

		File p12Key = new File(
				"WEB-INF/cf678a8add92d20cf396cf7eca272d874fd11c77-privatekey.p12");

//		String path = p12Key.getAbsolutePath();
//		System.out.println("key path = " + path);
//
//		GoogleCredential credential;
//		try {
//			credential = new GoogleCredential.Builder()
//					.setTransport(TRANSPORT)
//					.setJsonFactory(JSON_FACTORY)
//					.setServiceAccountId(
//							"141952851027-1u88oc96rik8l6islr44ha65o984tn3q@developer.gserviceaccount.com")
//					// .setServiceAccountId("ps-mastermind@appspot.gserviceaccount.com")
//					.setServiceAccountUser("psapps@pointsourcellc.com")
//					.setServiceAccountScopes(SCOPES)
//					.setServiceAccountPrivateKeyFromP12File(p12Key).build();
//		} catch (GeneralSecurityException e) {
//			e.printStackTrace();
//			throw new ServletException(e);
//		}
//
//		System.out.println(credential.getServiceAccountId());
//		credential.refreshToken();
//		String accessToken = credential.getAccessToken();
//
//		System.out.println(credential.getServiceAccountId());
		
		AppIdentityCredential credential = new AppIdentityCredential(SCOPES);

		Directory directory = new Directory.Builder(TRANSPORT, JSON_FACTORY,
				credential).build();
		Directory.Users.List list = directory.users().list();
		list.setKey("AIzaSyDKtGMQ-7kVeuBCCCdquoay34cZLQ8dRdM");
		list.setDomain("pointsourcellc.com");
		list.setCustomer("psapps@pointsourcellc.com");
		Users users = list.execute();

		List<com.google.api.services.admin.directory.model.User> userList = users
				.getUsers();
		for (Iterator iterator = userList.iterator(); iterator.hasNext();) {
			User user = (User) iterator.next();
			System.out.println(user);
		}

		response.addHeader("content-type", "text/html");
		PrintWriter out = response.getWriter();
		out.println("<html>");
		out.println("<body>");
		out.println("Success!");
		out.println("</body>");
		out.println("</html>");
	}
}
