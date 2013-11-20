package com.pointsource.mastermind.util;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.api.client.util.IOUtils;

public class Data implements CONSTS{

	private static JSONObject GOOGLE_USERS = null;
	private static JSONObject PEOPLE = null;

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
}
