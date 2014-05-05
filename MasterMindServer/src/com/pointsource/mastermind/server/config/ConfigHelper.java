/**
 * 
 */
package com.pointsource.mastermind.server.config;

import org.json.JSONArray;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;

/**
 *
 */
public class ConfigHelper {
	private JSONObject jsonConfiguration = null;
	/**
	 * 
	 */
	public ConfigHelper(JSONObject object) {
		this.jsonConfiguration = object;
	}

	private JSONArray getProperties() {
		return jsonConfiguration.getJSONArray(CONSTS.PROP_PROPERTIES);
	}

	public String getProperty(String nameToLookup) {
		JSONArray jsonArray = getProperties();
		for (int i = 0; i < jsonArray.length(); i++) {
			JSONObject property = jsonArray.getJSONObject(i);
			String name = property.getString(CONSTS.PROP_NAME);
			if (name.equals(nameToLookup))
				return property.getString(CONSTS.PROP_VALUE);
		}
		return null;
	}

}
