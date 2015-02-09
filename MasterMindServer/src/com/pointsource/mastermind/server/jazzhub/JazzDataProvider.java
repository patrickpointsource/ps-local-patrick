/**
 * 
 */
package com.pointsource.mastermind.server.jazzhub;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.HttpVersion;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.CookieStore;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.params.ClientPNames;
import org.apache.http.client.params.CookiePolicy;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.HttpConstants;
import com.pointsource.mastermind.util.JsonUtils;

/**
 *
 */
public class JazzDataProvider implements IJazzDataProvider {
	public final static String SERVICE = "service";
	public final static String PROCESS_WEB_UI_SERVICE = "com.ibm.team.process.internal.service.web.IProcessWebUIService";
	public final static String ALL_PROJECT_AREAS = SERVICE
			+ HttpConstants.SLASH + PROCESS_WEB_UI_SERVICE
			+ HttpConstants.SLASH + "allProjectAreas";
	public final static String AUTHENTICATED = "authenticated";
	public final static String AUTHENTICATED_IDENTITY = AUTHENTICATED
			+ HttpConstants.SLASH + "identity";

	private final Config config;
	private HttpClient httpClient;
	/**
	 * 
	 */
	public JazzDataProvider(Config config) {
		this.config = config;
		httpClient = new DefaultHttpClient();
		CookieStore cookieStore = new BasicCookieStore();
		((DefaultHttpClient) httpClient).setCookieStore(cookieStore);
		((DefaultHttpClient) httpClient).setParams(createHttpParms());
	}

	private HttpParams createHttpParms() {
		HttpParams httpParams = new BasicHttpParams();

		HttpProtocolParams.setVersion(httpParams, HttpVersion.HTTP_1_1);
		HttpProtocolParams.setContentCharset(httpParams, HTTP.UTF_8);
		HttpClientParams.setCookiePolicy(httpParams,
				CookiePolicy.BROWSER_COMPATIBILITY);
		HttpProtocolParams.setUseExpectContinue(httpParams, false);

		httpParams.setBooleanParameter(ClientPNames.HANDLE_REDIRECTS, false);
		HttpConnectionParams.setConnectionTimeout(httpParams, 60000);
		HttpConnectionParams.setSoTimeout(httpParams, 300000);
		HttpClientParams.setRedirecting(httpParams, true);
		HttpProtocolParams.setUserAgent(httpParams, "JazzHttpClient"); //$NON-NLS-1$
		return httpParams;
	}


	private HttpResponse executeRequest(HttpUriRequest request)
			throws ClientProtocolException, IOException {

		HttpResponse response = httpClient.execute(request);

		if (response.getStatusLine().getStatusCode() == HttpStatus.SC_UNAUTHORIZED) {
			request.abort();
			response = login();
			// 302 expected to go back to original resource
			if (response.getStatusLine().getStatusCode() == HttpStatus.SC_MOVED_TEMPORARILY) {
				// NOTE: This is considered incomplete. The request should be
				// correctly re-written for the appropriate type
				// i.e. If there is a post, put, etc... Right now, this code
				// only makes use of get
				HttpGet get = new HttpGet(request.getURI());
				get.setHeaders(request.getAllHeaders());
				return executeRequest(get);

			}
		}
		return response;
	}

	public JSONObject getJazzHubProjects() throws ClientProtocolException,
			IOException {
		JSONObject ret = new JSONObject();

		List<NameValuePair> parms = new ArrayList<NameValuePair>();
		parms.add(new BasicNameValuePair("userId", config.userid));
		HttpGet get = new HttpGet(config.serverUrl + ALL_PROJECT_AREAS
				+ HttpConstants.QUESTION
				+ URLEncodedUtils.format(parms, "UTF-8"));
		get.addHeader(HttpConstants.CONTENT_TYPE,
				HttpConstants.CONTENT_TYPE_FORM_URL_ENCODED);
		prepareJsonRequest(get);
		HttpResponse response = executeRequest(get);
		try {
			InputStream is = null;

			HttpEntity httpEntity = response.getEntity();
			if (httpEntity != null)
				is = httpEntity.getContent();
			JSONArray jazzProjectArray = null;
			JSONArray mmProjectArray = new JSONArray();
			try {
				jazzProjectArray = JsonUtils.getValues(is);
				if (jazzProjectArray != null) {
					for (int i = 0; i < jazzProjectArray.length(); i++) {
						JSONObject jazzProject = jazzProjectArray.getJSONObject(i);
						if (isUserMember(jazzProject)) {
							mmProjectArray.put(createProject(jazzProject));
						}
					}
				}
			} catch (JSONException ex) {
				// Can assume not found
			}
			ret.put(CONSTS.PROP_COUNT, mmProjectArray.length());
			ret.put(CONSTS.PROP_MEMBERS, mmProjectArray);
		} finally {
			finalizeResponse(response);
		}

		return ret;
	}

	private boolean isUserMember(JSONObject jazzProject) {
		return jazzProject.getBoolean("myProjectArea");
	}

	private JSONObject createProject(JSONObject jazzJson) throws JSONException,
			UnsupportedEncodingException {
		String itemId = jazzJson.getString("itemId");
		String webUrl = jazzJson.getString("webUrl");
		String name = jazzJson.getString(CONSTS.PROP_NAME);
		JSONObject project = new JSONObject();
		project.put(CONSTS.PROP_TITLE, name);
		JSONObject details = new JSONObject();
		details.put(CONSTS.PROP_RESOURCE, webUrl + "/process/project-areas/"
				+ itemId);
		project.put("details", details);
		project.put(CONSTS.PROP_RESOURCE, config.serverUrl + "oslc/contexts/"
				+ itemId + "/workitems/services.xml");
		JSONObject currentPlans = new JSONObject();
		currentPlans.put(CONSTS.PROP_RESOURCE, webUrl
				+ "#action=com.ibm.team.apt.search&predef=current");
		project.put("currentPlans", currentPlans);
		JSONObject dashboard = new JSONObject();
		dashboard.put(CONSTS.PROP_RESOURCE, webUrl
				+ "#action=com.ibm.team.dashboard.viewDashboard");
		project.put("dashboard", dashboard);

		String[] parts = name.split("\\|");
		if (parts.length >= 2) {
			String userPart = parts[0].trim();
			String projPart = URLEncoder.encode(parts[1].trim(), "UTF-8");
			// Use %20 not +
			projPart = projPart.replaceAll("\\+", "%20");
			JSONObject homepage = new JSONObject();
			homepage.put(CONSTS.PROP_RESOURCE, "https://hub.jazz.net/project/" + userPart + "/" + projPart);
			project.put("homePage", homepage);
		}

		return project;
	}

	private HttpResponse login()
			throws ClientProtocolException, IOException {
		List<NameValuePair> authFormParams = new ArrayList<NameValuePair>();
		authFormParams.add(new BasicNameValuePair("j_username", config.userid));
		authFormParams
				.add(new BasicNameValuePair("j_password", config.password));
		UrlEncodedFormEntity entity = new UrlEncodedFormEntity(authFormParams,
				"UTF-8");
		HttpPost httpPostAuth = new HttpPost(config.serverUrl
				+ "j_security_check");
		httpPostAuth.setEntity(entity);
		HttpResponse response = httpClient.execute(httpPostAuth);
		try {
			httpPostAuth.abort();
		} finally {
			finalizeResponse(response);
		}
		return response;
		// We should verify the user has actually logged in and throw an exception
		// if not
		// verifyUserLoggedIn(httpClient);
	}

	// private boolean doesResponseHaveAuthenticationChallenge(
	// HttpResponse response) {
	// Header headers[] = response
	// .getHeaders("X-com-ibm-team-repository-web-auth-msg");
	// return headers != null && headers.length > 0;
	// }
	//
	// private boolean verifyUserLoggedIn(HttpClient httpClient)
	// throws ClientProtocolException, IOException {
	// HttpGet get = new HttpGet(config.serverUrl + AUTHENTICATED_IDENTITY);
	// boolean isLoggedIn = false;
	// HttpResponse response = httpClient.execute(get);
	// try {
	// int status = response.getStatusLine().getStatusCode();
	// if (status == HttpStatus.SC_OK) {
	// isLoggedIn = doesResponseHaveAuthenticationChallenge(response) == false;
	// }
	// } finally {
	// finalizeResponse(response);
	// }
	// return isLoggedIn;
	// }

	private void finalizeResponse(HttpResponse response) {
		HttpEntity entity = response.getEntity();
		if (entity != null) {
			try {
				EntityUtils.consume(entity);
			} catch (IOException e) {
				// Ignore
			}
		}
	}

	private void prepareJsonRequest(HttpUriRequest request) {
		request.addHeader(HttpConstants.ACCEPT, HttpConstants.CONTENT_TYPE_JSON);
		request.addHeader(HttpConstants.CONTENT_TYPE,
				HttpConstants.CONTENT_TYPE_FORM_URL_ENCODED);
	}

	static public class Config {
		public String serverUrl;
		public String userid;
		public String password;

		public Config(String serverUrl, String userid, String password) {
			this.serverUrl = serverUrl;
			this.userid = userid;
			this.password = password;
		}

		@Override
		public String toString() {
			StringBuilder builder = new StringBuilder();
			builder.append("Server url: " + serverUrl);
			builder.append(",");
			builder.append(" UserId: " + userid);
			builder.append(",");
			builder.append(" Password: " + password);
			return builder.toString();
		}

	}


}
