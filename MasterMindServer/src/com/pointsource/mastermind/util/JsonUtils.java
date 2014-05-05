package com.pointsource.mastermind.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class JsonUtils {

	/**
	 * 
	 */
	public JsonUtils() {
		// TODO Auto-generated constructor stub
	}

	private static String readString(InputStream is) throws IOException {
		BufferedReader reader = new BufferedReader(new InputStreamReader(is,
				"UTF-8"));
		StringBuilder sb = new StringBuilder();

		String line = null;
		try {
			while ((line = reader.readLine()) != null) {
				sb.append((line + "\n"));
			}
		} finally {
			is.close();
		}
		return sb.toString();
	}

	public static JSONObject getJsonObject(InputStream is) throws IOException,
			JSONException {
		return new JSONObject(readString(is));
	}

	public static JSONObject getValue(InputStream is) throws IOException,
			JSONException {
		JSONObject jObj = getJsonObject(is);
		return jObj.getJSONObject("soapenv:Body").getJSONObject("response")
				.getJSONObject("returnValue").getJSONObject("value");
	}

	public static JSONArray getValues(InputStream is) throws IOException,
			JSONException {
		JSONObject jObj = getJsonObject(is);
		return jObj.getJSONObject("soapenv:Body").getJSONObject("response")
				.getJSONObject("returnValue").getJSONArray("values");

	}

}
