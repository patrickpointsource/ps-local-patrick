package com.pointsource.mastermind.server.jazzhub;

import java.io.IOException;

import org.apache.http.client.ClientProtocolException;
import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;

public class JazzData implements CONSTS {

	private static IJazzDataProvider jazzDataProvider = new ComposedJazzDataProvider();

	public static JSONObject getJazzHubProjects()
			throws ClientProtocolException, IOException {
		return jazzDataProvider.getJazzHubProjects();
	}
	
	public static void main(String[] args) {
		try {
			getJazzHubProjects();
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
