package com.pointsource.mastermind.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.UnknownHostException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import sun.misc.IOUtils;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.Mongo;
import com.mongodb.WriteResult;
import com.mongodb.util.JSON;

public class Data implements CONSTS {

	private static Map<String, JSONObject> GOOGLE_USERS = null;
	private static String GOOGLE_USER_ETAG = "";
	private static JSONObject PEOPLE = null;
	private static Mongo mongo;
	private static DB db;
	private static JSONObject CONFIG = null;

	/**
	 * Get the server config info
	 * @return
	 */
	public static JSONObject getConfig(){
		if(CONFIG == null){
			try {
				JSONObject ret = new JSONObject();
				ret.put("DB_HOSTNAME", DB_HOSTNAME_DEFAULT);
				ret.put("DB_PORT", DB_PORT_DEFAULT);
				ret.put("DB_NAME", DB_NAME_DEFAULT);
				ret.put("BUILD_NUMBER", BUILD_NUMBER);
				
				CONFIG = ret;
			} catch (Exception e) {
				e.printStackTrace(System.err);
			}
		}
		return CONFIG;
	}
	
	public static JSONObject updateConfig(JSONObject config) throws UnknownHostException, JSONException{
		try {
			//Close the old connection
			mongo.close();
			db = null;
			mongo = null;
			
			mongo = new Mongo(config.getString("DB_HOSTNAME"), config.getInt("DB_PORT"));
			db = mongo.getDB(config.getString("DB_NAME"));
			db.authenticate(DB_USER, DB_PASS.toCharArray());
		} catch (IllegalArgumentException e) {
			//IDK why mongo is throwing this?
			e.printStackTrace();
		}
		
		CONFIG = config;
		return config;
	}
	
	static {
		try {
			JSONObject config = getConfig();
			mongo = new Mongo(config.getString("DB_HOSTNAME"), config.getInt("DB_PORT"));
			db = mongo.getDB(config.getString("DB_NAME"));
			db.authenticate(DB_USER, DB_PASS.toCharArray());
		} catch (Exception e) {
			System.err.println("DB Startup Failed!!");
			e.printStackTrace();
		}
	}
	
	/**
	 * Get the list of managed user groups
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getRoles() throws JSONException{
		JSONObject ret = new JSONObject();
		JSONArray members = new JSONArray();
		
		JSONObject ssa = new JSONObject();
		ssa.put(PROP_ID, ROLE_SSA_ID);
		ssa.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_SSA_ID);
		ssa.put(PROP_TITLE, ROLE_SSA_TITLE);
		members.put(ssa);
		
		JSONObject pm = new JSONObject();
		pm.put(PROP_ID, ROLE_PM_ID);
		pm.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_PM_ID);
		pm.put(PROP_TITLE, ROLE_PM_TITLE);
		members.put(pm);
		
		JSONObject ba = new JSONObject();
		ba.put(PROP_ID, ROLE_BA_ID);
		ba.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_BA_ID);
		ba.put(PROP_TITLE, ROLE_BA_TITLE);
		members.put(ba);
		
		JSONObject sse = new JSONObject();
		sse.put(PROP_ID, ROLE_SSE_ID);
		sse.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_SSE_ID);
		sse.put(PROP_TITLE, ROLE_SSE_TITLE);
		members.put(sse);
		
		JSONObject se = new JSONObject();
		se.put(PROP_ID, ROLE_SE_ID);
		se.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_SE_ID);
		se.put(PROP_TITLE, ROLE_SE_TITLE);
		members.put(se);
		
		JSONObject suxd = new JSONObject();
		suxd.put(PROP_ID, ROLE_SUXD_ID);
		suxd.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_SUXD_ID);
		suxd.put(PROP_TITLE, ROLE_SUXD_TITLE);
		members.put(suxd);
		
		JSONObject uxd = new JSONObject();
		uxd.put(PROP_ID, ROLE_UXD_ID);
		uxd.put(PROP_RESOURCE, RESOURCE_ROLES+"/"+ROLE_UXD_ID);
		uxd.put(PROP_TITLE, ROLE_UXD_TITLE);
		members.put(uxd);
		
		ret.put(PROP_MEMBERS, members);
		ret.put(PROP_ABOUT, RESOURCE_ROLES);
		ret.put(PROP_COUNT, members.length());
		return ret;
	}
	
	/**
	 * Get the list of managed user groups
	 * @return
	 * @throws JSONException
	 * @throws IOException 
	 */
	public static JSONObject getRole(RequestContext context, String roleId) throws JSONException, IOException{
		JSONObject ret = new JSONObject();
		JSONArray members = new JSONArray();
		
		Map<String, JSONObject> users = getGoogleUsers(context);
		
		if(ROLE_SSA_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_SSA_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_SSA_ID);
			ret.put(PROP_TITLE, ROLE_SSA_TITLE);
			
			JSONObject aaron = users.get("115659942511507270693");
			addGroupMember(members, aaron);
			JSONObject andy = users.get("106368930450799539126");
			addGroupMember(members, andy);
			JSONObject barry = users.get("107681682076275621618");
			addGroupMember(members, barry);
			JSONObject john = users.get("100521746243465967724");
			addGroupMember(members, john);
			JSONObject kevin = users.get("108416099312244834291");
			addGroupMember(members, kevin);
		}
		
		else if(ROLE_PM_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_PM_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_PM_ID);
			ret.put(PROP_TITLE, ROLE_PM_TITLE);
			
			JSONObject kristal = users.get("118024801441852864610");
			addGroupMember(members, kristal);
			JSONObject susan = users.get("105187489722733399928");
			addGroupMember(members, susan);
			JSONObject krista = users.get("103362960874176228355");
			addGroupMember(members, krista);
		}
		
		else if(ROLE_BA_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_BA_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_BA_ID);
			ret.put(PROP_TITLE, ROLE_BA_TITLE);
			
			JSONObject kristal = users.get("118024801441852864610");
			addGroupMember(members, kristal);
			JSONObject susan = users.get("105187489722733399928");
			addGroupMember(members, susan);
		}
		
		else if(ROLE_BA_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_BA_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_BA_ID);
			ret.put(PROP_TITLE, ROLE_BA_TITLE);
			
			JSONObject kristal = users.get("118024801441852864610");
			addGroupMember(members, kristal);
			JSONObject susan = users.get("105187489722733399928");
			addGroupMember(members, susan);
		}
		
		else if(ROLE_SSE_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_SSE_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_SSE_ID);
			ret.put(PROP_TITLE, ROLE_SSE_TITLE);
			
			JSONObject nate = users.get("102037350018901696245");
			addGroupMember(members, nate);
			JSONObject jm = users.get("118074563586812975506");
			addGroupMember(members, jm);
			JSONObject chris = users.get("112959653203369443291");
			addGroupMember(members, chris);
		}
		
		else if(ROLE_SE_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_SE_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_SE_ID);
			ret.put(PROP_TITLE, ROLE_SE_TITLE);
			
			JSONObject hunter = users.get("100090968878728629777");
			addGroupMember(members, hunter);
			JSONObject brent = users.get("105526065653554855193");
			addGroupMember(members, brent);
		}
		
		else if(ROLE_SUXD_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_SUXD_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_SUXD_ID);
			ret.put(PROP_TITLE, ROLE_SUXD_TITLE);
			
			JSONObject eric = users.get("102728171905005423498");
			addGroupMember(members, eric);
			JSONObject melissa = users.get("112917239891456752571");
			addGroupMember(members, melissa);
		}
		
		else if(ROLE_UXD_ID.equalsIgnoreCase(roleId)){
			ret.put(PROP_ID, ROLE_UXD_ID);
			ret.put(PROP_ABOUT, RESOURCE_ROLES+"/"+ROLE_UXD_ID);
			ret.put(PROP_TITLE, ROLE_UXD_TITLE);
			
			JSONObject melissa = users.get("103450144552825063641");
			addGroupMember(members, melissa);
			JSONObject amanda = users.get("107385689810002496434");
			addGroupMember(members, amanda);
		}
		
		ret.put(PROP_MEMBERS, members);
		ret.put(PROP_COUNT, members.length());
		
		return ret;
	}
	
	/**
	 * Get the list of managed user groups
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getGroups() throws JSONException{
		JSONObject ret = new JSONObject();
		JSONArray members = new JSONArray();
		
		JSONObject g1 = new JSONObject();
		g1.put(PROP_ID, GROUPS_EXEC_ID);
		g1.put(PROP_RESOURCE, RESOURCE_GROUPS+"/"+GROUPS_EXEC_ID);
		g1.put(PROP_TITLE, GROUPS_EXEC_TITLE);
		members.put(g1);
		
		JSONObject g2 = new JSONObject();
		g2.put(PROP_ID, GROUPS_SALES_ID);
		g2.put(PROP_RESOURCE, RESOURCE_GROUPS+"/"+GROUPS_SALES_ID);
		g2.put(PROP_TITLE, GROUPS_SALES_TITLE);
		members.put(g2);
		
		ret.put(PROP_MEMBERS, members);
		ret.put(PROP_ABOUT, RESOURCE_GROUPS);
		ret.put(PROP_COUNT, members.length());
		return ret;
	}
	
	/**
	 * Get the list of managed user groups
	 * @return
	 * @throws JSONException
	 * @throws IOException 
	 */
	public static JSONObject getGroup(RequestContext context, String groupId) throws JSONException, IOException{
		JSONObject ret = new JSONObject();
		JSONArray members = new JSONArray();
		
		Map<String, JSONObject> users = getGoogleUsers(context);
		
		//Executives Group
		if(GROUPS_EXEC_ID.equals(groupId)){
			JSONObject chris = users.get("114352410049076130019");
			addGroupMember(members, chris);
			JSONObject kevin = users.get("104614151280118313239");
			addGroupMember(members, kevin);
			JSONObject erik = users.get("101315305679730171732");
			addGroupMember(members, erik);
			JSONObject steph = users.get("102699799438113157547");
			addGroupMember(members, steph);
		}
		//Sales Group
		if(GROUPS_SALES_ID.equals(groupId)){
			JSONObject luke = users.get("117612942628688959688");
			addGroupMember(members, luke);
			JSONObject david = users.get("109518736702317118019");
			addGroupMember(members, david);
			JSONObject lori = users.get("111396763357009038073");
			addGroupMember(members, lori);
		}
		
		ret.put(PROP_MEMBERS, members);
		ret.put(PROP_ABOUT, RESOURCE_GROUPS+"/"+groupId);
		ret.put(PROP_COUNT, members.length());
		return ret;
	}
	
	private static void addGroupMember(JSONArray members, JSONObject gUser) throws JSONException{
		JSONObject user = new JSONObject();
		user.put(PROP_ID, gUser.get("id"));
		user.put(PROP_RESOURCE, RESOURCE_PEOPLE+"/"+gUser.get("id"));
		user.put(PROP_TITLE, gUser.getJSONObject("name").get("fullName"));
		members.put(user);
	}

	/**
	 * Gets the list of Google Users
	 * 
	 * @return
	 * @throws IOExceptionz
	 * @throws JSONException
	 */
	public static Map<String, JSONObject> getGoogleUsers(RequestContext context)
			throws IOException, JSONException {
		if (GOOGLE_USERS == null) {
			InputStream is = context.getServletContext().getResourceAsStream(
					"/WEB-INF/googleUsers.json");
			byte[] bytes = IOUtils.readFully(is, -1, true);
			String jsonTxt = new String(bytes, "UTF-8");

			JSONObject googleUsers = new JSONObject(jsonTxt);
			JSONArray users = googleUsers.getJSONArray(PROP_USERS);
			GOOGLE_USERS = new HashMap<String, JSONObject>();
			GOOGLE_USER_ETAG = googleUsers.getString(PROP_ETAG);

			for (int i = 0; i < users.length(); i++) {
				JSONObject ithUser = users.getJSONObject(i);
				GOOGLE_USERS.put(ithUser.getString(PROP_ID), ithUser);
			}
		}
		return GOOGLE_USERS;
	}
	
	public static JSONObject getPerson(RequestContext context, String id) throws IOException, JSONException{
		
		JSONObject people = getPeople(context);
		JSONArray members = people.getJSONArray(PROP_PEOPLE);
		
		JSONObject ret = null;
		
		for(int i = 0; i < members.length();i++){
			JSONObject p = members.getJSONObject(i);
			String ithId = p.getString(PROP_ID);
			
			if(id.equals(ithId)){
				ret = p;
				break;
			}
		}
		
		if(ret == null){
			throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
		}
		
		return ret;
	}

	/**
	 * Gets the list of JSON people objects
	 * 
	 * @return
	 * @throws IOException
	 * @throws JSONException
	 */
	public static JSONObject getPeople(RequestContext context)
			throws IOException, JSONException {
		if (PEOPLE == null) {

			JSONArray mmPeople = new JSONArray();

			Map<String, JSONObject> googleUsers = getGoogleUsers(context);
			Collection<JSONObject> users = googleUsers.values();

			for (Iterator<JSONObject> iterator = users.iterator(); iterator
					.hasNext();) {
				JSONObject ithUser = (JSONObject) iterator.next();
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
			PEOPLE.put(PROP_ETAG, GOOGLE_USER_ETAG);
			PEOPLE.put(PROP_COUNT, mmPeople.length());
			PEOPLE.put(PROP_PEOPLE, mmPeople);
		}

		return PEOPLE;
	}

	/**
	 * Get all the projects
	 * 
	 * @param query a filter param 
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static Map<String, JSONObject> getProjects(String query) throws JSONException {
		Map<String, JSONObject> ret = new HashMap<String, JSONObject>();

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
		DBCursor cursur = null;
		if(query != null){
			DBObject queryObject = (DBObject) JSON.parse(query);
			cursur = projectsCol.find(queryObject);
		}
		else{
			cursur = projectsCol.find();
		}
	
		while (cursur.hasNext()) {
			DBObject object = cursur.next();
			ObjectId oId = (ObjectId) object.get("_id");
			String json = JSON.serialize(object);
			JSONObject jsonObject = new JSONObject(json);
			jsonObject.put(PROP_ID, oId);
			jsonObject.put(PROP_ABOUT, RESOURCE_PROJECTS + "/" + oId);
			ret.put(oId.toString(), jsonObject);
		}

		return ret;
	}

	/**
	 * Get a projects by id
	 * 
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getProject(String id) throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
		BasicDBObject query = new BasicDBObject();
		query.put("_id", new ObjectId(id));
		DBObject dbObj = projectsCol.findOne(query);
		String json = JSON.serialize(dbObj);
		ret = new JSONObject(json);

		ret.put(PROP_ID, id);
		ret.put(PROP_ABOUT, RESOURCE_PROJECTS + "/" + id);

		return ret;
	}

	/**
	 * Create a new project
	 * 
	 * @param newProject
	 * @throws JSONException
	 */
	public static JSONObject createProject(JSONObject newProject)
			throws JSONException {
		newProject.put(PROP_ETAG, "0");

		String json = newProject.toString();
		DBObject dbObject = (DBObject) JSON.parse(json);
		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
		WriteResult result = projectsCol.insert(dbObject);
		// TODO Handle Result Issues
		DBCursor cursorDoc = projectsCol.find();
		while (cursorDoc.hasNext()) {
			DBObject created = cursorDoc.next();
			//System.out.println("Found: " + created);

			ObjectId oId = (ObjectId) created.get("_id");
			String idVal = oId.toString();
			newProject.put(PROP_ID, idVal);
		}

		newProject.put(PROP_ABOUT,
				RESOURCE_PROJECTS + "/" + newProject.getString(PROP_ID));

		return newProject;
	}

	/**
	 * Update an existing new project
	 * 
	 * @param newProject
	 * @throws JSONException
	 */
	public static JSONObject updateProject(JSONObject newProject)
			throws JSONException {
		if (!newProject.has(PROP_ID)) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Project does not conatin an id property").build();
			throw new WebApplicationException(response);
		}

		String id = newProject.getString(PROP_ID);
		JSONObject existing = getProject(id);
		if (existing == null) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Project does not exist").build();
			throw new WebApplicationException(response);
		}

		if (!newProject.has(PROP_ETAG)) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Project does not conatin an etag property").build();
			throw new WebApplicationException(response);
		}

		String etag = newProject.getString(PROP_ETAG);
		String old_etag = existing.getString(PROP_ETAG);

		if (!etag.equals(old_etag)) {
			String message = "Project etag (" + etag
							+ ") does not match the saved etag (" + old_etag
							+ ")";
			Response response = Response.status(Status.CONFLICT)
					.entity(message).build();
			throw new WebApplicationException(response);
		}

		int newEtag = Integer.parseInt(old_etag);
		newEtag++;
		newProject.put(PROP_ETAG, String.valueOf(newEtag));

		String json = newProject.toString();
		DBObject dbObject = (DBObject) JSON.parse(json);
		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);

		BasicDBObject query = new BasicDBObject();
		query.put("_id", new ObjectId(id));
		// Exclude persisting the base
		BasicDBObject fields = new BasicDBObject();
		fields.put(PROP_BASE, 0);
		DBObject result = projectsCol.findAndModify(query, fields, null, false,
				dbObject, true, true);

		json = JSON.serialize(result);
		newProject = new JSONObject(json);

		return newProject;
	}
	
	
	
	/**
	 * Un Escape JSON
	 * 
	 * @param value
	 * @return
	 */
	public static String unescapeJSON(Object value) {
		String s = String.valueOf(value);

		if (s == null)
			return null;

		// StringBuffer sb = new StringBuffer();
		// escape(s, sb);
		// return sb.toString();

		// String escaped = JSONObject.quote(s);

		String escaped = s.replaceAll("\\\\\\\\/", "/");
		// escaped = "'"+escaped+"'";

		//System.out.println(escaped);

		return escaped;
	}

	/**
	 * Escape JSON
	 * 
	 * @param value
	 * @return
	 */
	public static String escapeJSON(Object value) {
		String s = String.valueOf(value);

		if (s == null)
			return null;

		// StringBuffer sb = new StringBuffer();
		// escape(s, sb);
		// return sb.toString();

		// String escaped = JSONObject.quote(s);

		String escaped = s.replaceAll("/", "\\\\/");
		// escaped = "'"+escaped+"'";

		//System.out.println(escaped);

		return escaped;
	}

	/**
	 * @param s
	 *            - Must not be null.
	 * @param sb
	 */
	static void escape(String s, StringBuffer sb) {
		for (int i = 0; i < s.length(); i++) {
			char ch = s.charAt(i);
			switch (ch) {
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
				// Reference: http://www.unicode.org/versions/Unicode5.1.0/
				if ((ch >= '\u0000' && ch <= '\u001F')
						|| (ch >= '\u007F' && ch <= '\u009F')
						|| (ch >= '\u2000' && ch <= '\u20FF')) {
					String ss = Integer.toHexString(ch);
					sb.append("\\u");
					for (int k = 0; k < 4 - ss.length(); k++) {
						sb.append('0');
					}
					sb.append(ss.toUpperCase());
				} else {
					sb.append(ch);
				}
			}
		}// for
	}
}
