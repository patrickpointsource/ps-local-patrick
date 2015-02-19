package com.pointsource.mastermind.util;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.api.client.util.IOUtils;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.Mongo;
import com.mongodb.WriteResult;
import com.mongodb.util.JSON;

public class Data implements CONSTS{

	private static JSONObject GOOGLE_USERS = null;
	private static JSONObject PEOPLE = null;
	private static Map<String, JSONObject> PROJECTS = new HashMap<String, JSONObject>();
	private static int nextId = 0;
	private static Mongo mongo;
	private static DB db;
	
	static{
		try {
			mongo =  new Mongo(DB_HOSTNAME, DB_PORT);
			db = mongo.getDB(DB_NAME);
			db.authenticate(DB_USER, DB_PASS.toCharArray());
		} catch (Exception e) {
			System.err.println("DB Startup Failed!!");
			e.printStackTrace();
		}
	}
	
	
	/**
	 * Gets the list of Google Users
	 * @return
	 * @throws IOException
	 * @throws JSONException
	 */
	public static JSONObject getGoogleUsers() throws IOException, JSONException {
		if (GOOGLE_USERS == null) {
			File googleUsers = new File("WEB-INF/googleUsers.json");
			FileInputStream is = new FileInputStream(googleUsers);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			IOUtils.copy(is, baos);
			String jsonTxt = baos.toString();

			JSONObject json = new JSONObject(jsonTxt);
			GOOGLE_USERS = json;
		}
		return GOOGLE_USERS;
	}
	
	/**
	 * Gets the list of JSON people objects
	 * @return
	 * @throws IOException
	 * @throws JSONException
	 */
	public static JSONObject getPeople() throws IOException, JSONException {
		if(PEOPLE == null){
			JSONObject googleUsers = getGoogleUsers();
			JSONArray users = googleUsers.getJSONArray(PROP_USERS);
			JSONArray mmPeople = new JSONArray();
			
			for (int i = 0; i < users.length(); i++) {
				JSONObject ithUser = users.getJSONObject(i);
				JSONObject person = new JSONObject();
				person.put(PROP_ID, ithUser.getString(PROP_ID));
				person.put(PROP_MBOX, ithUser.getString(PROP_PRIMARY_EMAIL));
				JSONObject name = ithUser.getJSONObject(PROP_NAME);
				person.put(PROP_NAME, name.getString(PROP_FULL_NAME));
				person.put(PROP_FAMILY_NAME, name.getString(PROP_FAMILY_NAME));
				person.put(PROP_GIVEN_NAME, name.getString(PROP_GIVEN_NAME));
				person.put(PROP_ETAG, ithUser.getString(PROP_ETAG));
				mmPeople.put(person);
			}
			
			PEOPLE = new JSONObject();
			PEOPLE.put(PROP_ETAG, googleUsers.getString(PROP_ETAG));
			PEOPLE.put(PROP_COUNT, mmPeople.length());
			PEOPLE.put(PROP_PEOPLE, mmPeople);
		}
		
		return PEOPLE;
	}
	
	/**
	 * Get all the projects
	 * @return
	 */
	public static Map<String, JSONObject> getProjects(){
		return PROJECTS;
	}
	
	/**
	 * Get a projects by id
	 * @param id
	 * @return
	 * @throws JSONException 
	 */
	public static JSONObject getProject(String id){
		JSONObject ret = PROJECTS.get(id);
		return ret;
	}
	
	/**
	 * Create a new project 
	 * 
	 * @param newProject
	 * @throws JSONException 
	 */
	public static JSONObject createProject(JSONObject newProject) throws JSONException{
		String id = String.valueOf(nextId++);
		
		//Set ID 
		//newProject.put(PROP_ID, id);
		newProject.put(PROP_ETAG, "0");
		newProject.put(PROP_ABOUT, RESOURCE_PROJECTS+"/"+id);
		
		//Cache it
		if(db != null){
			String json = newProject.toString();
			DBObject dbObject = (DBObject) JSON.parse(json);
			DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
			WriteResult result = projectsCol.insert(dbObject);
			//TODO Handle Result Issues
			DBCursor cursorDoc = projectsCol.find();
			while (cursorDoc.hasNext()) {
				System.out.println(cursorDoc.next());
			}
		}
		else{
			PROJECTS.put(id, newProject);
		}
		return newProject;
	}
	
	/**
	 * Update an existing new project 
	 * 
	 * @param newProject
	 * @throws JSONException 
	 */
	public static JSONObject updateProject(JSONObject newProject) throws JSONException{
		if(!newProject.has(PROP_ID)){
			IllegalArgumentException cause = new IllegalArgumentException("Project does not conatin an id property");
			throw new WebApplicationException(cause, Status.BAD_REQUEST);
		}
		
		String id = newProject.getString(PROP_ID);
		JSONObject existing = PROJECTS.get(id);
		if(existing == null){
			throw new WebApplicationException(Status.NOT_FOUND);
		}
		
		if(!newProject.has(PROP_ETAG)){
			IllegalArgumentException cause = new IllegalArgumentException("Project does not conatin an etag property");
			throw new WebApplicationException(cause, Status.BAD_REQUEST);
		}
		
		String etag = newProject.getString(PROP_ETAG);
		String old_etag = existing.getString(PROP_ETAG);
		
		if(!etag.equals(old_etag)){
			IllegalArgumentException cause = new IllegalArgumentException("Project etag ("+etag+") does not match the saved etag ("+old_etag+")");
			throw new WebApplicationException(cause, Status.CONFLICT);
		}
		
		int newEtag = Integer.parseInt(old_etag);
		newEtag++;
		newProject.put(PROP_ETAG, String.valueOf(newEtag));
		
		//Set About
		
		newProject.put(PROP_ABOUT, RESOURCE_PROJECTS+"/"+id);
		
		//Cache it
		PROJECTS.put(id, newProject);
		
		return newProject;
	}
	
	public static String unescapeJSON(Object value){
		String s = String.valueOf(value);
		
		if(s==null)
            return null;

//		StringBuffer sb = new StringBuffer();
//		escape(s, sb);
//		return sb.toString();
		
		//String escaped = JSONObject.quote(s);
		
		String escaped = s.replaceAll("\\\\\\\\/", "/");
		//escaped = "'"+escaped+"'";
		
		System.out.println(escaped);
		
		return escaped;
	}
	
	public static String escapeJSON(Object value){
		String s = String.valueOf(value);
		
		if(s==null)
            return null;

//		StringBuffer sb = new StringBuffer();
//		escape(s, sb);
//		return sb.toString();
		
		//String escaped = JSONObject.quote(s);
		
		String escaped = s.replaceAll("/", "\\\\/");
		//escaped = "'"+escaped+"'";
		
		System.out.println(escaped);
		
		return escaped;
	}
	
	/**
     * @param s - Must not be null.
     * @param sb
     */
    static void escape(String s, StringBuffer sb) {
                for(int i=0;i<s.length();i++){
                        char ch=s.charAt(i);
                        switch(ch){
                        case '"':
                                sb.append("\\\"");
                                break;
                        case '\\':
                                sb.append("\\\\");
                                break;
                        case '\b':
                                sb.append("\\b");
                                break;
                        case '\f':
                                sb.append("\\f");
                                break;
                        case '\n':
                                sb.append("\\n");
                                break;
                        case '\r':
                                sb.append("\\r");
                                break;
                        case '\t':
                                sb.append("\\t");
                                break;
                        case '/':
                                sb.append("\\/");
                                break;
                        default:
                //Reference: http://www.unicode.org/versions/Unicode5.1.0/
                                if((ch>='\u0000' && ch<='\u001F') || (ch>='\u007F' && ch<='\u009F') || (ch>='\u2000' && ch<='\u20FF')){
                                        String ss=Integer.toHexString(ch);
                                        sb.append("\\u");
                                        for(int k=0;k<4-ss.length();k++){
                                                sb.append('0');
                                        }
                                        sb.append(ss.toUpperCase());
                                }
                                else{
                                        sb.append(ch);
                                }
                        }
                }//for
        }
}
