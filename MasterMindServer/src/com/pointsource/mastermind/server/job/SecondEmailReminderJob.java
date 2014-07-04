package com.pointsource.mastermind.server.job;

import java.util.Arrays;
import java.util.List;

public class SecondEmailReminderJob extends InitialEmailReminderJob {
	
	public List<String> getCCAdresses() {
		return Arrays.asList(new String[] {"dino.odessa@gmail.com"});
	}
}
