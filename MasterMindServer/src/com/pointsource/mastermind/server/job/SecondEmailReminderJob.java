package com.pointsource.mastermind.server.job;

import java.util.Arrays;
import java.util.List;

import com.pointsource.mastermind.util.Data;

public class SecondEmailReminderJob extends InitialEmailReminderJob {
	
	public List<String> getCCAdresses() {
		String[] emails = Data.getInterestedParties(null);
		if (emails != null) {
			return Arrays.asList(emails);
		}
		return null;
	}
}
