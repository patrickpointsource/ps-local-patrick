/**
 * 
 */
package com.pointsource.mastermind.server.jazzhub;

import java.io.IOException;

import org.apache.http.client.ClientProtocolException;
import org.json.JSONObject;

/**
 * Represents a single jazz instance
 */
public interface IJazzDataProvider {
	public JSONObject getJazzHubProjects()
			throws ClientProtocolException, IOException;
}
