/**
 * 
 */
package com.pointsource.mastermind.server.config;

import org.json.JSONObject;

/**
 *
 */
public class ConfigurationChangedEvent {
	private final JSONObject oldConfig;
	private final JSONObject newConfig;
	/**
	 * 
	 */
	public ConfigurationChangedEvent(JSONObject oldConfig, JSONObject newConfig) {
		this.oldConfig = oldConfig;
		this.newConfig = newConfig;
	}

	public JSONObject getNewConfig() {
		return newConfig;
	}

}
