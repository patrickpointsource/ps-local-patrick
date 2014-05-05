/**
 * 
 */
package com.pointsource.mastermind.server.config;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONObject;

/**
 *
 */
public class ConfigurationEventDispatcher {
	public static ConfigurationEventDispatcher INSTANCE = new ConfigurationEventDispatcher();
	private List<IConfigurationChangeListener> listeners = new ArrayList<IConfigurationChangeListener>();
	/**
	 * 
	 */
	private ConfigurationEventDispatcher() {

	}

	public void registerListener(IConfigurationChangeListener listener) {
		if (listeners.contains(listener) == false) {
			listeners.add(listener);
		}
	}

	public void removeListener(IConfigurationChangeListener listener) {
		listeners.remove(listener);
	}

	public void fireConfigurationChanged(JSONObject oldConfig, JSONObject config) {
		ConfigurationChangedEvent event = new ConfigurationChangedEvent(
				oldConfig, config);
		for (IConfigurationChangeListener listener : listeners) {
			listener.configChanged(event);
		}
	}


}
