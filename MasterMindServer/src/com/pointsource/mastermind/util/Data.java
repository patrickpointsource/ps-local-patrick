package com.pointsource.mastermind.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import sun.misc.IOUtils;

import com.mongodb.BasicDBObject;
import com.mongodb.CommandResult;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.Mongo;
import com.mongodb.WriteResult;
import com.mongodb.util.JSON;

public class Data implements CONSTS {

	private static Map<String, JSONObject> GOOGLE_USERS = null;
	//private static String GOOGLE_USER_ETAG = "";
	private static Mongo mongo;
	private static DB db;
	private static JSONObject CONFIG = null;

	/**
	 * Mongo Database connection
	 */
	static {
		try {
			JSONObject config = getConfig();
			mongo = new Mongo(config.getString("DB_HOSTNAME"),
					config.getInt("DB_PORT"));
			db = mongo.getDB(config.getString("DB_NAME"));
			db.authenticate(DB_USER, DB_PASS.toCharArray());
		} catch (Exception e) {
			System.err.println("DB Startup Failed!!");
			e.printStackTrace();
		}
	}

	/**
	 * Get the server config info
	 * 
	 * @return
	 */
	public static JSONObject getConfig() {
		if (CONFIG == null) {
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

	/**
	 * 
	 * @param config
	 * @return
	 * @throws UnknownHostException
	 * @throws JSONException
	 */
	public static JSONObject updateConfig(JSONObject config)
			throws UnknownHostException, JSONException {
		try {
			// Close the old connection
			mongo.close();
			db = null;
			mongo = null;

			mongo = new Mongo(config.getString("DB_HOSTNAME"),
					config.getInt("DB_PORT"));
			db = mongo.getDB(config.getString("DB_NAME"));
			db.authenticate(DB_USER, DB_PASS.toCharArray());
		} catch (IllegalArgumentException e) {
			// IDK why mongo is throwing this?
			e.printStackTrace();
		}

		CONFIG = config;
		return config;
	}

//	/**
//	 * Get the list of managed user groups
//	 * 
//	 * @return
//	 * @throws JSONException
//	 */
//	public static JSONObject getRoles() throws JSONException {
//		JSONObject ret = new JSONObject();
//		JSONArray members = new JSONArray();
//
//		JSONObject ssa = new JSONObject();
//		ssa.put(PROP_ABBREVIATION, ROLE_SSA_ID);
//		ssa.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_SSA_ID);
//		ssa.put(PROP_TITLE, ROLE_SSA_TITLE);
//		members.put(ssa);
//
//		JSONObject pm = new JSONObject();
//		pm.put(PROP_ABBREVIATION, ROLE_PM_ID);
//		pm.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_PM_ID);
//		pm.put(PROP_TITLE, ROLE_PM_TITLE);
//		members.put(pm);
//
//		JSONObject ba = new JSONObject();
//		ba.put(PROP_ABBREVIATION, ROLE_BA_ID);
//		ba.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_BA_ID);
//		ba.put(PROP_TITLE, ROLE_BA_TITLE);
//		members.put(ba);
//
//		JSONObject sse = new JSONObject();
//		sse.put(PROP_ABBREVIATION, ROLE_SSE_ID);
//		sse.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_SSE_ID);
//		sse.put(PROP_TITLE, ROLE_SSE_TITLE);
//		members.put(sse);
//
//		JSONObject se = new JSONObject();
//		se.put(PROP_ABBREVIATION, ROLE_SE_ID);
//		se.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_SE_ID);
//		se.put(PROP_TITLE, ROLE_SE_TITLE);
//		members.put(se);
//
//		JSONObject suxd = new JSONObject();
//		suxd.put(PROP_ABBREVIATION, ROLE_SUXD_ID);
//		suxd.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_SUXD_ID);
//		suxd.put(PROP_TITLE, ROLE_SUXD_TITLE);
//		members.put(suxd);
//
//		JSONObject uxd = new JSONObject();
//		uxd.put(PROP_ABBREVIATION, ROLE_UXD_ID);
//		uxd.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + ROLE_UXD_ID);
//		uxd.put(PROP_TITLE, ROLE_UXD_TITLE);
//		members.put(uxd);
//
//		ret.put(PROP_MEMBERS, members);
//		ret.put(PROP_ABOUT, RESOURCE_ROLES);
//		ret.put(PROP_COUNT, members.length());
//		return ret;
//	}
	
	private static ArrayList<String> DEFAULT_SSAs = new ArrayList<String>();
	private static ArrayList<String> DEFAULT_BAs = new ArrayList<String>();
	private static ArrayList<String> DEFAULT_PMs = new ArrayList<String>();
	private static ArrayList<String> DEFAULT_SSEs = new ArrayList<String>();
	private static ArrayList<String> DEFAULT_SEs = new ArrayList<String>();
	private static ArrayList<String> DEFAULT_SUXDs = new ArrayList<String>();
	private static ArrayList<String> DEFAULT_UXDs = new ArrayList<String>();
	static{
		Collections.addAll(DEFAULT_SSAs, "115659942511507270693", "106368930450799539126", "107681682076275621618", "100521746243465967724", "108416099312244834291");
		Collections.addAll(DEFAULT_BAs, "118024801441852864610");
		Collections.addAll(DEFAULT_PMs, "105187489722733399928", "103362960874176228355");
		Collections.addAll(DEFAULT_SSEs, "102037350018901696245", "112959653203369443291");
		Collections.addAll(DEFAULT_SEs, "100090968878728629777", "105526065653554855193");
		Collections.addAll(DEFAULT_SUXDs, "102728171905005423498", "112917239891456752571");
		Collections.addAll(DEFAULT_UXDs, "103450144552825063641", "107385689810002496434");
	}

	private static void initPrimaryRole(JSONObject person, String googleID) throws JSONException{
		String primaryRole = null;
		if(DEFAULT_SSAs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_SSA_ID;
		}
		else if(DEFAULT_BAs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_BA_ID;
		}
		else if(DEFAULT_PMs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_PM_ID;
		}
		else if(DEFAULT_SSEs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_SSE_ID;
		}
		else if(DEFAULT_SEs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_SSE_ID;
		}
		else if(DEFAULT_SUXDs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_SUXD_ID;
		}
		else if(DEFAULT_UXDs.contains(googleID)){
			primaryRole = RESOURCE_ROLES+"/"+ROLE_UXD_ID;
		}
		
		if(primaryRole != null){
			JSONObject roleRef = new JSONObject();
			roleRef.put(PROP_RESOURCE, primaryRole);
			person.put(PROP_PRIMARY_ROLE, roleRef);
		}
	}
	
	
//	/**
//	 * Get the list of managed user groups
//	 * 
//	 * @return
//	 * @throws JSONException
//	 * @throws IOException
//	 */
//	public static JSONObject getRole(RequestContext context, String roleId)
//			throws JSONException, IOException {
//		JSONObject ret = new JSONObject();
//		JSONArray members = new JSONArray();
//
//		if (ROLE_SSA_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_SSA_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_SSA_ID);
//			ret.put(PROP_TITLE, ROLE_SSA_TITLE);
//		}
//
//		else if (ROLE_PM_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_PM_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_PM_ID);
//			ret.put(PROP_TITLE, ROLE_PM_TITLE);
//		}
//
//		else if (ROLE_BA_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_BA_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_BA_ID);
//			ret.put(PROP_TITLE, ROLE_BA_TITLE);
//		}
//
//		else if (ROLE_SSE_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_SSE_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_SSE_ID);
//			ret.put(PROP_TITLE, ROLE_SSE_TITLE);
//		}
//
//		else if (ROLE_SE_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_SE_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_SE_ID);
//			ret.put(PROP_TITLE, ROLE_SE_TITLE);
//		}
//
//		else if (ROLE_SUXD_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_SUXD_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_SUXD_ID);
//			ret.put(PROP_TITLE, ROLE_SUXD_TITLE);
//		}
//
//		else if (ROLE_UXD_ID.equalsIgnoreCase(roleId)) {
//			ret.put(PROP_ABBREVIATION, ROLE_UXD_ID);
//			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + ROLE_UXD_ID);
//			ret.put(PROP_TITLE, ROLE_UXD_TITLE);
//		}
//
//		ret.put(PROP_MEMBERS, members);
//		ret.put(PROP_COUNT, members.length());
//
//		return ret;
//	}
	
	/**
	 * Get a role by id
	 * 
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getRole(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_ROLES);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = projectsCol.findOne(query);

		if (dbObj != null) {
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);
			ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + id);
		}

		return ret;
	}
	
	/**
	 * Get a role
	 * 
	 * @param query
	 *            a filter param
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getRole(RequestContext context, String query,
			String fields) throws JSONException {
		JSONObject ret = null;

		DBCollection rolesCol = db.getCollection(COLLECTION_TITLE_ROLES);
		DBObject queryObject = null;
		DBObject fieldsObject = null;
		if (query != null) {
			queryObject = (DBObject) JSON.parse(query);
		}
		if (fields != null) {
			fieldsObject = (DBObject) JSON.parse(fields);
		}

		DBObject object = rolesCol.findOne(queryObject, fieldsObject);

		if (object != null) {
			String json = JSON.serialize(object);
			JSONObject jsonObject = new JSONObject(json);

			if (object.containsField(PROP__ID)) {
				ObjectId _id = (ObjectId) object.get(PROP__ID);
				jsonObject.put(PROP_ABOUT, RESOURCE_ROLES + "/" + _id);
			}
			ret = jsonObject;
		}

		return ret;
	}
	
	/**
	 * Get the list of assignable roles
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getRoles(RequestContext context,
			String query, String fields) throws JSONException {
		List<JSONObject> roles = new ArrayList<JSONObject>();
		
		DBCollection rolesCol = db.getCollection(COLLECTION_TITLE_ROLES);
		DBObject queryObject = null;
		DBObject fieldsObject = null;
		if (query != null) {
			queryObject = (DBObject) JSON.parse(query);
		}
		if (fields != null) {
			fieldsObject = (DBObject) JSON.parse(fields);
		}

		DBCursor cursur = rolesCol.find(queryObject, fieldsObject);

		while (cursur.hasNext()) {
			DBObject object = cursur.next();

			if (object.containsField(PROP__ID)) {
				String json = JSON.serialize(object);
				JSONObject jsonObject = new JSONObject(json);

				ObjectId _id = (ObjectId) object.get(PROP__ID);
				jsonObject.put(PROP_RESOURCE, RESOURCE_ROLES + "/" + _id);

				roles.add(jsonObject);
			} 
			else {
				System.out
						.println("Role not included because it did not return an _id property: "
								+ object);
			}
		}
		
		JSONObject ret = new JSONObject();
		int total = roles.size();
		ret.put(CONSTS.PROP_COUNT, total);
		
		ret.put(CONSTS.PROP_MEMBERS, roles);

		URI baseURI = context.getBaseURI();
		ret.put(CONSTS.PROP_BASE, baseURI);

		ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_ROLES);

		return ret;
	}
	
	/**
	 * Get the list of assignable skills
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getSkills(RequestContext context,
			String query, String fields) throws JSONException {
		List<JSONObject> skills = new ArrayList<JSONObject>();
		
		DBCollection skillsCol = db.getCollection(COLLECTION_TITLE_SKILLS);
		DBObject queryObject = null;
		DBObject fieldsObject = null;
		if (query != null) {
			queryObject = (DBObject) JSON.parse(query);
		}
		if (fields != null) {
			fieldsObject = (DBObject) JSON.parse(fields);
		}

		DBCursor cursur = skillsCol.find(queryObject, fieldsObject);

		while (cursur.hasNext()) {
			DBObject object = cursur.next();

			if (object.containsField(PROP__ID)) {
				String json = JSON.serialize(object);
				JSONObject jsonObject = new JSONObject(json);

				ObjectId _id = (ObjectId) object.get(PROP__ID);
				jsonObject.put(PROP_RESOURCE, RESOURCE_SKILLS + "/" + _id);

				skills.add(jsonObject);
			} else {
				System.out
						.println("Skill not included because it did not return an _id property: "
								+ object);
			}
		}
		
		JSONObject ret = new JSONObject();
		int total = skills.size();
		ret.put(CONSTS.PROP_COUNT, total);
		
		ret.put(CONSTS.PROP_MEMBERS, skills);

		URI baseURI = context.getBaseURI();
		ret.put(CONSTS.PROP_BASE, baseURI);

		ret.put(CONSTS.PROP_ABOUT, CONSTS.RESOURCE_SKILLS);

		return ret;
	}
	
	/**
	 * Get a skill definition
	 * 
	 * @param query
	 *            a filter param
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getSkill(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_SKILLS);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = projectsCol.findOne(query);

		if (dbObj != null) {
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);
			ret.put(PROP_ABOUT, RESOURCE_SKILLS + "/" + id);
		}

		return ret;
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
			//GOOGLE_USER_ETAG = googleUsers.getString(PROP_ETAG);

			for (int i = 0; i < users.length(); i++) {
				JSONObject ithUser = users.getJSONObject(i);
				GOOGLE_USERS.put(ithUser.getString(PROP_ID), ithUser);
			}
		}
		return GOOGLE_USERS;
	}

	/**
	 * Get all the projects
	 * 
	 * @param query
	 *            a filter param
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static Map<String, JSONObject> getProjects(RequestContext context, String query,
			String fields) throws JSONException {
		Map<String, JSONObject> ret = new HashMap<String, JSONObject>();

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
		DBObject queryObject = null;
		DBObject fieldsObject = null;
		if (query != null) {
			queryObject = (DBObject) JSON.parse(query);
		}
		if (fields != null) {
			fieldsObject = (DBObject) JSON.parse(fields);
		}
		
		//If not managemnet remove the financial fields
		if(!isMember(context.getCurrentUser(), GROUPS_MANAGEMENT_TITLE) &&
				!isMember(context.getCurrentUser(), GROUPS_EXEC_TITLE) ){
			//Fields is null create one to filter out terms
			if(fieldsObject == null){
				fieldsObject = new BasicDBObject(PROP_TERMS, 0);
			}
			//Do we have a fields object and does it contain the key 'terms'
			if(fieldsObject.containsField(PROP_TERMS)){
				int num = (Integer)fieldsObject.get(PROP_TERMS);
				Set<String> keys = fieldsObject.keySet();
				
				//We have multiple requested fields terms is just one so remove it from the list
				if(num != 0 && keys.size() > 1){
					fieldsObject.removeField(PROP_TERMS);
				}
				//Terms was the only requested field flip it to a not
				else{
					fieldsObject.put(PROP_TERMS,0);
				}
			}
			//Fields set does not include terms
			else{
				@SuppressWarnings("unchecked")
				Map<String, Integer> fieldsMap = fieldsObject.toMap();
				//Empty object add filter for terms
				if(fieldsMap.size() == 0){
					fieldsObject.put(PROP_TERMS, 0);
				}
				else{
					int firstFieldNum = fieldsMap.values().iterator().next();
					//Exclusive filter add terms to excludes
					if(firstFieldNum == 0){
						fieldsObject.put(PROP_TERMS, 0);
					}
					
					//Otherwise we are fine because it is not included in the inclusive filters
				}
			}
		}

		DBCursor cursur = projectsCol.find(queryObject, fieldsObject);

		while (cursur.hasNext()) {
			DBObject object = cursur.next();

			if (object.containsField(PROP__ID)) {
				ObjectId oId = (ObjectId) object.get(PROP__ID);
				String json = JSON.serialize(object);
				JSONObject jsonObject = new JSONObject(json);
				jsonObject.put(PROP_RESOURCE, RESOURCE_PROJECTS + "/" + oId);
				ret.put(oId.toString(), jsonObject);
			} else {
				System.out
						.println("Project not included because it did not return an _id property: "
								+ object);
			}
		}

		return ret;
	}

	/**
	 * Get a person
	 * 
	 * @param query
	 *            a filter param
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject getPerson(RequestContext context, String query,
			String fields) throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PEOPLE);
		DBObject queryObject = null;
		DBObject fieldsObject = null;
		if (query != null) {
			queryObject = (DBObject) JSON.parse(query);
		}
		if (fields != null) {
			fieldsObject = (DBObject) JSON.parse(fields);
		}

		DBObject object = projectsCol.findOne(queryObject, fieldsObject);

		if (object != null) {
			String json = JSON.serialize(object);
			JSONObject jsonObject = new JSONObject(json);

			if (object.containsField(PROP__ID)) {
				ObjectId _id = (ObjectId) object.get(PROP__ID);
				jsonObject.put(PROP_ABOUT, RESOURCE_PEOPLE + "/" + _id);
			}
			ret = jsonObject;
		}

		return ret;
	}

	/**
	 * Get all the people
	 * 
	 * @param query
	 *            a filter param
	 * 
	 * @return
	 * @throws JSONException
	 */
	public static Map<String, JSONObject> getPeople(RequestContext context,
			String query, String fields) throws JSONException {
		Map<String, JSONObject> ret = new HashMap<String, JSONObject>();

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PEOPLE);
		DBObject queryObject = null;
		DBObject fieldsObject = null;
		if (query != null) {
			queryObject = (DBObject) JSON.parse(query);
		}
		if (fields != null) {
			fieldsObject = (DBObject) JSON.parse(fields);
		}

		DBCursor cursur = projectsCol.find(queryObject, fieldsObject);

		while (cursur.hasNext()) {
			DBObject object = cursur.next();

			if (object.containsField(PROP__ID)) {
				String json = JSON.serialize(object);
				JSONObject jsonObject = new JSONObject(json);

				ObjectId _id = (ObjectId) object.get(PROP__ID);
				jsonObject.put(PROP_RESOURCE, RESOURCE_PEOPLE + "/" + _id);

				ret.put(_id.toString(), jsonObject);
			} else {
				System.out
						.println("Person not included because it did not return an _id property: "
								+ object);
			}
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
	public static JSONObject getPerson(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PEOPLE);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = projectsCol.findOne(query);

		if (dbObj != null) {
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);
			ret.put(PROP_ABOUT, RESOURCE_PEOPLE + "/" + id);
		}

		return ret;
	}

	/**
	 * Returns true if the user is a member of the given group
	 * @param person
	 * @param group
	 * @return
	 * @throws JSONException 
	 */
	private static boolean isMember(JSONObject person, String group) throws JSONException{
		boolean ret = false;
		
		if(person.has(PROP_GROUPS)){
			JSONArray groups = person.getJSONArray(PROP_GROUPS);
			
			for (int i = 0; i < groups.length(); i++) {
				if(group.equals(groups.getString(i))){
					ret = true;
					break;
				}
			}
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
	public static JSONObject getProject(RequestContext context, String id) throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
		BasicDBObject query = new BasicDBObject(PROP__ID, new ObjectId(id));
		BasicDBObject fields = new BasicDBObject();
		
		//If not managemnet remove the financial fields
		if(!isMember(context.getCurrentUser(), GROUPS_MANAGEMENT_TITLE) &&
				!isMember(context.getCurrentUser(), GROUPS_EXEC_TITLE) ){
			fields.put(PROP_TERMS, 0);
		}
		
		DBObject dbObj = projectsCol.findOne(query, fields);

		if (dbObj != null) {
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);

			ret.put(PROP_ABOUT, RESOURCE_PROJECTS + "/" + id);
		}

		return ret;
	}

	/**
	 * Delete a projects by id
	 * 
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject deleteProject(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_PROJECTS);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = projectsCol.findAndRemove(query);
		if(dbObj != null){
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);
		}
		else{
			throw new WebApplicationException(Response.status(Status.NOT_FOUND).entity("Project not found to delete").build());
		}

		ret.put(PROP_ABOUT, RESOURCE_PROJECTS + "/" + id);

		return ret;
	}

	/**
	 * Delete a person by id
	 * 
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject deletePerson(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection peopleCol = db.getCollection(COLLECTION_TITLE_PEOPLE);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = peopleCol.findAndRemove(query);
		String json = JSON.serialize(dbObj);
		ret = new JSONObject(json);

		ret.put(PROP_ABOUT, RESOURCE_PEOPLE + "/" + id);

		return ret;
	}

	/**
	 * Create a new person
	 * 
	 * @param newPerson
	 * @throws JSONException
	 */
	public static JSONObject createPerson(RequestContext context,
			JSONObject newPerson) throws JSONException {
		newPerson.put(PROP_ETAG, "0");

		String json = newPerson.toString();
		DBObject dbObject = (DBObject) JSON.parse(json);
		DBCollection peopleCol = db.getCollection(COLLECTION_TITLE_PEOPLE);
		WriteResult result = peopleCol.insert(dbObject);

		// TODO Handle Result Issues
		DBCursor cursorDoc = peopleCol.find();
		DBObject created = null;
		while (cursorDoc.hasNext()) {
			created = cursorDoc.next();
			// System.out.println("Found: " + created);
		}

		if (created == null) {
			throw new WebApplicationException(Response.status(Status.NOT_FOUND)
					.entity("Person was not created").build());
		}

		ObjectId oId = (ObjectId) created.get(PROP__ID);
		String idVal = oId.toString();

		newPerson.put(PROP_ABOUT, RESOURCE_PEOPLE + "/" + idVal);

		return newPerson;
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
			// System.out.println("Found: " + created);

			ObjectId oId = (ObjectId) created.get(PROP__ID);
			String idVal = oId.toString();
			newProject.put(PROP_ABOUT,
					RESOURCE_PROJECTS + "/" + idVal);
		}

		return newProject;
	}
	
	/**
	 * Create a new role
	 * 
	 * @param newRole
	 * @throws JSONException
	 */
	public static JSONObject createRole(JSONObject newRole)
			throws JSONException {
		newRole.put(PROP_ETAG, "0");

		String json = newRole.toString();
		DBObject dbObject = (DBObject) JSON.parse(json);
		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_ROLES);
		WriteResult result = projectsCol.insert(dbObject);

		// TODO Handle Result Issues
		DBCursor cursorDoc = projectsCol.find();
		while (cursorDoc.hasNext()) {
			DBObject created = cursorDoc.next();
			// System.out.println("Found: " + created);

			ObjectId oId = (ObjectId) created.get(PROP__ID);
			String idVal = oId.toString();
			newRole.put(PROP_ABOUT,
					RESOURCE_ROLES + "/" + idVal);
		}

		return newRole;
	}
	
	/**
	 * Create a new skill
	 * 
	 * @param newSkill
	 * @throws JSONException
	 */
	public static JSONObject createSkill(JSONObject newSkill)
			throws JSONException {
		newSkill.put(PROP_ETAG, "0");

		String json = newSkill.toString();
		DBObject dbObject = (DBObject) JSON.parse(json);
		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_SKILLS);
		WriteResult result = projectsCol.insert(dbObject);

		// TODO Handle Result Issues
		DBCursor cursorDoc = projectsCol.find();
		while (cursorDoc.hasNext()) {
			DBObject created = cursorDoc.next();
			// System.out.println("Found: " + created);

			ObjectId oId = (ObjectId) created.get(PROP__ID);
			String idVal = oId.toString();
			newSkill.put(PROP_ABOUT,
					RESOURCE_SKILLS + "/" + idVal);
		}

		return newSkill;
	}
	
	/**
	 * Delete a role by id
	 * 
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject deleteRole(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_ROLES);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = projectsCol.findAndRemove(query);
		if(dbObj != null){
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);
		}
		else{
			throw new WebApplicationException(Response.status(Status.NOT_FOUND).entity("Role not found to delete").build());
		}

		ret.put(PROP_ABOUT, RESOURCE_ROLES + "/" + id);

		return ret;
	}
	
	/**
	 * Delete a skill by id
	 * 
	 * @param id
	 * @return
	 * @throws JSONException
	 */
	public static JSONObject deleteSkill(RequestContext context, String id)
			throws JSONException {
		JSONObject ret = null;

		DBCollection projectsCol = db.getCollection(COLLECTION_TITLE_SKILLS);
		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		DBObject dbObj = projectsCol.findAndRemove(query);
		if(dbObj != null){
			String json = JSON.serialize(dbObj);
			ret = new JSONObject(json);
		}
		else{
			throw new WebApplicationException(Response.status(Status.NOT_FOUND).entity("Skill not found to delete").build());
		}

		ret.put(PROP_ABOUT, RESOURCE_SKILLS + "/" + id);

		return ret;
	}

	/**
	 * Update an existing person
	 * 
	 * @param newPerson
	 * @throws JSONException
	 */
	public static JSONObject updatePerson(RequestContext context,
			JSONObject newPerson) throws JSONException {
		if (!newPerson.has(PROP__ID)) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Person does not conatin an id property").build();
			throw new WebApplicationException(response);
		}

		JSONObject _id = newPerson.getJSONObject(PROP__ID);
		if (!_id.has(PROP_$OID)) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Person does not conatin an $oid property").build();
			throw new WebApplicationException(response);
		}

		String id = _id.getString(PROP_$OID);
		JSONObject existing = getPerson(context, id);
		if (existing == null) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Person does not exist").build();
			throw new WebApplicationException(response);
		}

		if (!newPerson.has(PROP_ETAG)) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Person does not conatin an etag property").build();
			throw new WebApplicationException(response);
		}

		String etag = newPerson.getString(PROP_ETAG);
		String old_etag = existing.getString(PROP_ETAG);

		if (!etag.equals(old_etag)) {
			String message = "Person etag (" + etag
					+ ") does not match the saved etag (" + old_etag + ")";
			Response response = Response.status(Status.CONFLICT)
					.entity(message).build();
			throw new WebApplicationException(response);
		}

		int newEtag = Integer.parseInt(old_etag);
		newEtag++;
		newPerson.put(PROP_ETAG, String.valueOf(newEtag));

		String json = newPerson.toString();
		DBObject dbObject = (DBObject) JSON.parse(json);
		DBCollection peopleCol = db.getCollection(COLLECTION_TITLE_PEOPLE);

		BasicDBObject query = new BasicDBObject();
		query.put(PROP__ID, new ObjectId(id));
		// Exclude persisting the base
		BasicDBObject fields = new BasicDBObject();
		dbObject.removeField(PROP_BASE);
		dbObject.removeField(PROP_ABOUT);
		dbObject.removeField(PROP_RESOURCE);
		DBObject result = peopleCol.findAndModify(query, fields, null, false,
				dbObject, true, true);

		json = JSON.serialize(result);
		newPerson = new JSONObject(json);

		newPerson.put(PROP_ABOUT, RESOURCE_PEOPLE + "/" + id);

		return newPerson;
	}

	/**
	 * Update an existing new project
	 * 
	 * @param newProject
	 * @throws JSONException
	 */
	public static JSONObject updateProject(RequestContext context, String id, JSONObject newProject)
			throws JSONException {

		JSONObject existing = getProject(context, id);
		if (existing == null) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Project does not exist").build();
			throw new WebApplicationException(response);
		}

		if (!newProject.has(PROP_ETAG)) {
			Response response = Response.status(Status.BAD_REQUEST)
					.entity("Project does not conatin an etag property")
					.build();
			throw new WebApplicationException(response);
		}

		String etag = newProject.getString(PROP_ETAG);
		String old_etag = existing.getString(PROP_ETAG);

		if (!etag.equals(old_etag)) {
			String message = "Project etag (" + etag
					+ ") does not match the saved etag (" + old_etag + ")";
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
		query.put(PROP__ID, new ObjectId(id));
		// Exclude persisting the base
		BasicDBObject fields = new BasicDBObject();
		dbObject.removeField(PROP_BASE);
		dbObject.removeField(PROP_ABOUT);
		dbObject.removeField(PROP_RESOURCE);
		DBObject result = projectsCol.findAndModify(query, fields, null, false,
				dbObject, true, true);

		json = JSON.serialize(result);
		newProject = new JSONObject(json);

		return newProject;
	}
	
	
	public static void synchDefaultRoles(RequestContext context) throws JSONException{
		List<String> DEFAULT_ROLES = new ArrayList<String>();
		List<String> DEFAULT_ROLE_ABRS = new ArrayList<String>();
		Collections.addAll(DEFAULT_ROLES, ROLE_BA_TITLE, ROLE_PM_TITLE, ROLE_SE_TITLE, ROLE_SSA_TITLE, ROLE_SSE_TITLE, ROLE_SUXD_TITLE, ROLE_UXD_TITLE);
		Collections.addAll(DEFAULT_ROLE_ABRS, ROLE_BA_ID, ROLE_PM_ID, ROLE_SE_ID, ROLE_SSA_ID, ROLE_SSE_ID, ROLE_SUXD_ID, ROLE_UXD_ID);
		Map<String, String> newRoleMapping = new HashMap<String, String>();
		
		
		DBCollection roleCollection = db.getCollection(COLLECTION_TITLE_ROLES);
		DBCollection peopleCollection = db.getCollection(COLLECTION_TITLE_PEOPLE);
		DBCollection projectsCollection = db.getCollection(COLLECTION_TITLE_PROJECTS);
		
		for(int i = 0; i < DEFAULT_ROLES.size(); i++){
			String roleName = DEFAULT_ROLES.get(i);
			String roleAbr = DEFAULT_ROLE_ABRS.get(i);
			
		
			BasicDBObject newRole = new BasicDBObject(PROP_TITLE, roleName);
			
			//Look for role
			DBObject existingRole = roleCollection.findOne(newRole);
			if(existingRole == null){
				newRole.append(PROP_ABBREVIATION, roleAbr).append(PROP_ETAG, "0");
				
				//Create one
				WriteResult result = roleCollection.insert(newRole);
				
				CommandResult error = result.getLastError();
				if(error != null){
					System.err.println("Insert Failed:" + error.getErrorMessage());
					if(error.getException() != null){
						error.getException().printStackTrace();
					}
				}
				
				//Try again
				existingRole = roleCollection.findOne(newRole);
			}
		
			if(existingRole == null){
				throw new WebApplicationException(Response.status(Status.INTERNAL_SERVER_ERROR).entity("Failed to find Role: " + roleName).build());
			}
			
			//Update any people that have this primary role
			String newRoleURL = RESOURCE_ROLES+"/"+((ObjectId)existingRole.get(PROP__ID)).toString();
			String oldRoleURL = RESOURCE_ROLES+"/"+roleAbr;
			
			//Map it for later 
			newRoleMapping.put(oldRoleURL, newRoleURL);
			
			DBObject query = new BasicDBObject(PROP_PRIMARY_ROLE, new BasicDBObject(PROP_RESOURCE, oldRoleURL));
			BasicDBObject update = new BasicDBObject("$set", new BasicDBObject(PROP_PRIMARY_ROLE,  new BasicDBObject(PROP_RESOURCE, newRoleURL)));
			WriteResult result =  peopleCollection.updateMulti(query, update);
			
			CommandResult error = result.getLastError();
			if(error != null){
				System.err.println("Insert Query:" + query);
				System.err.println("Insert Update:" + update);
				System.err.println("Insert Failed:" + error);
				if(error.getException() != null){
					error.getException().printStackTrace();
				}
			}
		}
		
		//Update any projects that have this primary role
		DBObject query = new BasicDBObject(PROP_ROLES, new BasicDBObject("$exists", true));
		DBObject fields = new BasicDBObject(PROP_ROLES,1);
		System.out.println("Find: " + query + ", " + fields);
		DBCursor cursor = projectsCollection.find(query, fields);
		
		//For eacch project update all the roles on the project
		while (cursor.hasNext()) {
			DBObject fetched = cursor.next();
			List<DBObject> newRoles = new ArrayList<DBObject>();

			@SuppressWarnings({ "unchecked" })
			List<DBObject> roles = (List<DBObject>)fetched.get(PROP_ROLES);
			for (Iterator<DBObject> iterator = roles.iterator(); iterator.hasNext();) {
				DBObject role = iterator.next();
				@SuppressWarnings({ "unchecked", "rawtypes" })
				DBObject newRole = new BasicDBObject(new HashMap(role.toMap()));
				
				DBObject type = (DBObject)newRole.get(PROP_TYPE);
				Object resource = type.get(PROP_RESOURCE);
				if(newRoleMapping.containsKey(resource)){
					type.put(PROP_RESOURCE, newRoleMapping.get(resource));
				}
				
				newRoles.add(newRole);
			}
			
			fetched.removeField(PROP_ROLES);
			
			DBObject update = new BasicDBObject("$set",new BasicDBObject(PROP_ROLES, newRoles));
			
			//Update the project
			System.out.println("Insert Query:" + fetched);
			System.out.println("Insert Update:" + update);
			projectsCollection.update(fetched, update);
		}
	}

	public static void synchDefaultGroups(RequestContext context) throws JSONException{
		DBCollection peopleCollection = db.getCollection(COLLECTION_TITLE_PEOPLE);
		
		//The executive group
		String checkExecsStr = "{googleId:{ $in:['114352410049076130019','104614151280118313239','101315305679730171732','102699799438113157547','117612942628688959688']},groups:{$ne:'"+GROUPS_EXEC_TITLE+"'}}";
		DBObject checkExecs = (DBObject)JSON.parse(checkExecsStr);
		
		DBObject addExec = new BasicDBObject("$push", new BasicDBObject(PROP_GROUPS, GROUPS_EXEC_TITLE));
		
		WriteResult errors = peopleCollection.updateMulti(checkExecs, addExec);
		CommandResult error = errors.getLastError();
		if(error != null && errors.getN() > 0){
			System.err.println("Insert Result:" + error);
			if(error.getException() != null){
				error.getException().printStackTrace();
			}
		}
		
		//The executive group
		String checkSalesStr = "{googleId:{ $in:['117612942628688959688','109518736702317118019','111396763357009038073']},groups:{$ne:'"+GROUPS_SALES_TITLE+"'}}";
		DBObject checkSales = (DBObject)JSON.parse(checkSalesStr);
		
		DBObject addSales = new BasicDBObject("$push", new BasicDBObject(PROP_GROUPS, GROUPS_SALES_TITLE));
		
		errors = peopleCollection.updateMulti(checkSales, addSales);
		if(errors != null && errors.getN() > 0){
			error = errors.getLastError();
			System.err.println("Insert Result:" + error);
			if(error.getException() != null){
				error.getException().printStackTrace();
			}
		}
		
		//The management group
		String checkManagementStr = "{googleId:{ $in:['114352410049076130019','104614151280118313239','101315305679730171732','102699799438113157547','117612942628688959688','103362960874176228355','112147186764436526995']},groups:{$ne:'"+GROUPS_MANAGEMENT_TITLE+"'}}";
		DBObject checkManagement = (DBObject)JSON.parse(checkManagementStr);
		
		DBObject addManagement = new BasicDBObject("$push", new BasicDBObject(PROP_GROUPS, GROUPS_MANAGEMENT_TITLE));
		
		errors = peopleCollection.updateMulti(checkManagement, addManagement);
		if(errors != null && errors.getN() > 0){
			error = errors.getLastError();
			System.err.println("Insert Result:" + error);
			if(error.getException() != null){
				error.getException().printStackTrace();
			}
		}
	}
	
	
	/**
	 * Default the database with a list of skills
	 * @param context The requesting context
	 */
	public static void synchDefaultSkills(RequestContext context){
		List<String> DEFAULT_SKILLS = new ArrayList<String>();
		Collections.addAll(DEFAULT_SKILLS, SKILLS_DATA_POWER_TITLE, SKILLS_J2EE_TITLE, SKILLS_JAVA_TITLE, SKILLS_REST_TITLE, SKILLS_WEB_TITLE, SKILLS_WORKLIGHT_TITLE);
		
		DBCollection skillsCollection = db.getCollection(COLLECTION_TITLE_SKILLS);
		
		for (Iterator<String> iterator = DEFAULT_SKILLS.iterator(); iterator.hasNext();) {
			String skillName = iterator.next();
			
			BasicDBObject skill = new BasicDBObject(PROP_TITLE, skillName);
			skill.append(PROP_ETAG, "0");
			
			//Look for skill
			DBObject ret = skillsCollection.findOne(skill);
			if(ret == null){
				//Create one
				WriteResult result = skillsCollection.insert(skill);
				
				CommandResult error = result.getLastError();
				if(error != null){
					System.err.println("Insert Failed:" + error.getErrorMessage());
					if(error.getException() != null){
						error.getException().printStackTrace();
					}
				}
			}
		}
	}
	
	/**
	 * Synchs the DB People with the Google domain users
	 * 
	 * @param context
	 * @throws JSONException
	 * @throws IOException
	 */
	public static void synchPeople(RequestContext context) throws IOException,
			JSONException {
		Map<String, JSONObject> googleUsers = getGoogleUsers(context);
		Collection<JSONObject> users = googleUsers.values();

		URI base = context.getBaseURI();
		URI genericImage = base.resolve("images/generic.png");

		for (Iterator<JSONObject> iterator = users.iterator(); iterator
				.hasNext();) {
			JSONObject googleUserDef = (JSONObject) iterator.next();

			JSONObject person = new JSONObject();

			// Look for existing user
			String googleId = googleUserDef.getString(PROP_ID);
			// JSONObject existingPerson = getPerson(context, googleId);
			JSONObject existingPerson = getUserByGoogleId(context, googleId,
					null);
			if (existingPerson != null) {
				person = existingPerson;
			}

			// Set the account type as Google
			googleUserDef.put(PROP_TYPE, VALUES_ACCOUNT_TYPES_GOOGLE);

			/**
			 * Set the base user properties from the Google user
			 */
			person.put(PROP_GOOGLE_ID, googleUserDef.getString(PROP_ID));
			person.put(PROP_MBOX, googleUserDef.getString(PROP_PRIMARY_EMAIL));
			JSONObject name = googleUserDef.getJSONObject(PROP_NAME);
			person.put(PROP_NAME, name.getString(PROP_FULL_NAME));
			person.put(PROP_FAMILY_NAME, name.getString(PROP_FAMILY_NAME));
			person.put(PROP_GIVEN_NAME, name.getString(PROP_GIVEN_NAME));
			if (googleUserDef.has(PROP_THUMBNAIL_PHOTO_URL)) {
				person.put(PROP_THUMBNAIL, "http://www.google.com"
						+ googleUserDef.getString(PROP_THUMBNAIL_PHOTO_URL));
			} else {
				// Set as generic profileImage
				person.put(PROP_THUMBNAIL, genericImage);
			}

			initPrimaryRole(person, googleUserDef.getString(PROP_ID));
			
			/**
			 * If the user did not exist just create it
			 */
			if (existingPerson == null) {
				JSONArray accounts = new JSONArray();
				accounts.put(googleUserDef);
				person.put(PROP_ACCOUNTS, accounts);
				createPerson(context, person);
			}
			/**
			 * If Update the existing user
			 */
			else {
				// Get the accounts
				JSONArray accounts = person.getJSONArray(PROP_ACCOUNTS);
				if (accounts == null) {
					accounts = new JSONArray();
					person.put(PROP_ACCOUNTS, accounts);
				}

				// Find the Google account
				boolean found = false;
				for (int i = 0; i < accounts.length(); i++) {
					JSONObject ithAccount = accounts.getJSONObject(i);
					String type = ithAccount.getString(PROP_TYPE);
					if (VALUES_ACCOUNT_TYPES_GOOGLE.equals(type)) {
						found = true;
						// Override the Google account
						accounts.put(i, googleUserDef);
						break;
					}
				}

				// Account not found
				if (!found) {
					accounts.put(googleUserDef);
				}

				updatePerson(context, person);
			}
		}
	}

	private static JSONObject getUserByGoogleId(RequestContext context,
			String googleId, String fields) throws JSONException {
		String query = "{googleId:'" + googleId + "'}";
		JSONObject existingPerson = getPerson(context, query, fields);
		return existingPerson;
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

		// System.out.println(escaped);

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

		// System.out.println(escaped);

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
