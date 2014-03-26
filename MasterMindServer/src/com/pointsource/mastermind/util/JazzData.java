package com.pointsource.mastermind.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.CookieStore;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.json.JSONArray;
import org.json.JSONObject;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResIterator;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;

public class JazzData implements CONSTS {
	public static JSONObject getJazzHubProjects() throws ClientProtocolException, IOException{
		DefaultHttpClient httpClient = new DefaultHttpClient();
		
		CookieStore cookieStore = new BasicCookieStore();
		HttpContext localContext = new BasicHttpContext();
		localContext.setAttribute(ClientContext.COOKIE_STORE,cookieStore);

		List<NameValuePair> authFormParams = new ArrayList<NameValuePair>();
		authFormParams.add(new BasicNameValuePair("j_username", CONSTS.JAZZ_HUB_USERID));
		authFormParams.add(new BasicNameValuePair("j_password", CONSTS.JAZZ_HUB_USER_PASS));
		UrlEncodedFormEntity entity = new UrlEncodedFormEntity(authFormParams, "UTF-8");
		HttpPost httpPostAuth = new HttpPost(CONSTS.JAZZ_HUB_BASE+"j_security_check");
		httpPostAuth.setEntity(entity);
//		HttpResponse response = 
		httpClient.execute(httpPostAuth, localContext);
		httpPostAuth.abort();
		
//		List<Cookie> cookies2 = cookieStore.getCookies();
//		for (Cookie cookie : cookies2) {
//			System.out.println("\t"+cookie.getName()+" : "+cookie.getValue());
//		}
//	
//		ResponseBuilder builder = Response.ok(response.getEntity().getContent()).status(response.getStatusLine().getStatusCode());
//		
//		Header[] headers = response.getAllHeaders();
//		for(int i = 0;i < headers.length;i++){
//			Header header = headers[i];
//			builder.header(header.getName(), header.getValue());
//		}
//		
//		return builder.build();

		HttpGet httpget = new HttpGet(CONSTS.JAZZ_HUB_BASE+"oslc/workitems/catalog");
		httpget.setHeader("Accept", "application/rdf+xml");
		httpget.setHeader("OSLC-Core-Version", "2.0");
		httpget.setHeader("X-com-ibm-team-foundation-auth-loop-avoidance","false");
		
		HttpResponse response = httpClient.execute(httpget, localContext);
		
		
		 // create an empty model
		 Model model = ModelFactory.createDefaultModel();
		 
		 InputStream in = response.getEntity().getContent();

		// read the RDF/XML file
		model.read(in, CONSTS.JAZZ_HUB_BASE+"oslc/workitems/catalog");
		
		ResIterator iter = model.listSubjects();
		JSONObject ret = new JSONObject();
		JSONArray array = new JSONArray();
		ret.put(PROP_MEMBERS, array);
		
		Property TITLE =  model.createProperty(NS_DCTERMS+PROP_TITLE);
		Property DETAILS = model.createProperty(NS_OSLC+"details");
		//Property RESOURCE = model.createProperty(NS_RDF+PROP_RESOURCE);
		while (iter.hasNext()) {
		    Resource r = iter.nextResource();
		    JSONObject project = new JSONObject();
		    //System.out.println(r.getURI());
		    project.put(PROP_RESOURCE, r.getURI());
		    String title = r.getProperty(TITLE).getString();
		    project.put(PROP_TITLE, title);
		    Statement detailStmt = r.getProperty(DETAILS);
		    if(detailStmt != null){
		    	String detailResource = detailStmt.getObject().toString();
			    JSONObject detail = new JSONObject();
			    detail.put(PROP_RESOURCE, detailResource);
			    project.put("details", detail);
		    }
		    
		    String[] parts = title.split("\\|");
		    if(parts.length >= 2){
			    String userPart = parts[0].trim();
			    String projPart = URLEncoder.encode(parts[1].trim(), "UTF-8");
			    //Use %20 not +
			    projPart = projPart.replaceAll("\\+", "%20");
			    
			    /**
			     * Create a Jazz Hub Project Link in the form https://hub.jazz.net/project/kmbauer/PointSource%20MasterMind
			     * from the title kmbauer|PointSource MasterMind
			     */
			    String url = "https://hub.jazz.net/project/"+userPart+"/"+projPart;
			    JSONObject homePage = new JSONObject();
			    homePage.put(PROP_RESOURCE, url);
			    project.put("homePage", homePage);
			    
			    /**
			     * Create a link to the Dashboard in the form https://hub.jazz.net/ccm01/web/projects/kmbauer/PointSource%20MasterMind#action=com.ibm.team.dashboard.viewDashboard
			     * from the title kmbauer|PointSource MasterMind
			     */
			    String dashURL = "https://hub.jazz.net/ccm01/web/projects/"+userPart+"%20%7C%20"+projPart+"#action=com.ibm.team.dashboard.viewDashboard";
			    JSONObject dashboard = new JSONObject();
			    dashboard.put(PROP_RESOURCE, dashURL);
			    project.put("dashboard", dashboard);
			    
			    /**
			     * Create a link to the current project plans in the form https://hub.jazz.net/ccm01/web/projects/kmbauer%20%7C%20PointSource%20MasterMind#action=com.ibm.team.apt.search&predef=current
			     * from the title kmbauer|PointSource MasterMind
			     */
			    String plansUrl = "https://hub.jazz.net/ccm01/web/projects/"+userPart+"%20%7C%20"+projPart+"#action=com.ibm.team.apt.search&predef=current";
			    JSONObject plans = new JSONObject();
			    plans.put(PROP_RESOURCE, plansUrl);
			    project.put("currentPlans", plans);
			    
		    }
		    else{
		    	System.err.println("Failed to parse project title: " + title);
		    }
		    
		    
		    
		    array.put(project);
		}
		
		ret.put(PROP_COUNT, array.length());
//		
//		System.out.println(ret);
		
//		BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
//        StringBuilder out = new StringBuilder();
//        String line;
//        while ((line = reader.readLine()) != null) {
//            out.append(line);
//        }
//        
//        String ret = out.toString();
//        System.out.println(ret);  
//		 reader.close();
		 
		 return ret;
	}
	
	public static void main(String[] args) {
		try {
			getJazzHubProjects();
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
