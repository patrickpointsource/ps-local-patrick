/**
 * 
 */
package com.pointsource.mastermind.server.jazzhub;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.client.ClientProtocolException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.pointsource.mastermind.server.config.ConfigHelper;
import com.pointsource.mastermind.server.config.ConfigurationChangedEvent;
import com.pointsource.mastermind.server.config.ConfigurationEventDispatcher;
import com.pointsource.mastermind.server.config.IConfigurationChangeListener;
import com.pointsource.mastermind.server.jazzhub.JazzDataProvider.Config;
import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;

/**
 * Used to aggregate across multiple jazz servers
 */
public class ComposedJazzDataProvider implements IJazzDataProvider,
		IConfigurationChangeListener {
	private static final Log LOGGER = LogFactory
			.getLog(ComposedJazzDataProvider.class);
	public final static String PROP_JAZZ_HUB_SERVERS = "jazz.hub.servers";
	public final static String PROP_JAZZ_HUB_USERID = "jazz.hub.userid";
	public final static String PROP_JAZZ_HUB_PASSWORD = "jazz.hub.password";
	private List<IJazzDataProvider> providers = new ArrayList<IJazzDataProvider>();
	/**
	 * 
	 */
	public ComposedJazzDataProvider() {
		initialize();
		ConfigurationEventDispatcher.INSTANCE.registerListener(this);
	}

	private void initialize() {
		providers.clear();
		ConfigHelper config = new ConfigHelper(Data.getServiceConfig());
		try {
			String userId = config.getProperty(PROP_JAZZ_HUB_USERID);
			String password = config.getProperty(PROP_JAZZ_HUB_PASSWORD);

			for (String server : getJazzServers(config)) {
				Config serverConfig = new Config(server, userId, password);
				LOGGER.debug("Adding a provider with configuration: "
						+ config.toString());
				providers.add(new JazzDataProvider(serverConfig));
			}
		} catch (JSONException ex) {
			// Ignore
		}
	}

	private String[] getJazzServers(ConfigHelper config) {

		String value = "";
		try {
			value = config.getProperty(PROP_JAZZ_HUB_SERVERS);
		} catch (JSONException ex) {
			// Ignore
		}
		return value.split(",");
	}

	@Override
	public void configChanged(ConfigurationChangedEvent event) {
		LOGGER.debug("Configuration change detected, re-initializing providers");
		initialize();
	}

	/**
	 * This operation is very expensive, may want to think about caching the
	 * result. Considering that project creation occurs pretty infrequently
	 */
	@Override
	public JSONObject getJazzHubProjects() throws ClientProtocolException,
			IOException {
		JSONObject allProjects = new JSONObject();
		JSONArray allMembers = new JSONArray();
		allProjects.put(CONSTS.PROP_MEMBERS, allMembers);
		for (IJazzDataProvider provider : providers) {
			// Aggregate across all
			JSONObject projects = provider.getJazzHubProjects();
			JSONArray projArray = projects.getJSONArray(CONSTS.PROP_MEMBERS);

			for (int i = 0; i < projArray.length(); i++) {
				allMembers.put(projArray.get(i));
			}
		}
		allProjects.put(CONSTS.PROP_COUNT, allMembers.length());
		return allProjects;
	}

}

