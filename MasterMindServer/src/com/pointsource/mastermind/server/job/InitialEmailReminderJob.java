package com.pointsource.mastermind.server.job;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.pointsource.mastermind.server.smtp.SmtpException;
import com.pointsource.mastermind.server.smtp.SmtpHelper;
import com.pointsource.mastermind.server.smtp.SmtpSender;
import com.pointsource.mastermind.util.Data;

public class InitialEmailReminderJob implements Job {
	private final static Logger LOGGER = Logger.getLogger(InitialEmailReminderJob.class.getName());
	private final static String MAILBOX_KEY = "mBox";
	private final static String RESOURCE_KEY = "resource";
	private final static String GIVENNAME_KEY = "givenName";
	private final static String NAME_KEY = "name";
	private final static String ACTIVE_KEY = "isActive";
	
	private final static SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

	@Override
	public void execute(JobExecutionContext context)
			throws JobExecutionException {
		
		boolean isActive = Data.getReminderActive(null);
		boolean isDebug = Data.getReminderDebug(null);
		
		LOGGER.log(Level.INFO, "reminder.active=" + isActive);
		LOGGER.log(Level.INFO, "reminder.debug=" + isDebug);
		
		JSONArray people = Data.getPeople(null, "", "", "");
		if (people != null) {
			for( int i = 0; i < people.length(); i++) {
				JSONObject contact = (JSONObject) people.get(i);
				String resource = (String) contact.get(RESOURCE_KEY);
				String givenName = (String) contact.get(GIVENNAME_KEY);
				String fullName = (String) contact.get(NAME_KEY);
				String mBox = (String) contact.get(MAILBOX_KEY);
				Boolean isActiveContact = Boolean.valueOf((String)contact.get(ACTIVE_KEY));
					
				if (isActiveContact) 
				{
					String date= DATE_FORMAT.format(getPreviousWorkingDay());
						
					String query = "{\"person\":{\"resource\":\"" + resource + "\"},\"date\":\"" + date + "\"}";
					JSONArray vacation = Data.getVacations(null, query, "", "");
					JSONArray hours = Data.getHours(null, query, "", "");
					if ((vacation == null || vacation.length() == 0 ) && (hours == null || hours.length() == 0)) {
						try {
							if (isActive) {
								String message = SmtpHelper.getReminderMessage(givenName);
								SmtpSender.getInstance().sendTLSEmail(Arrays.asList(new String[]{mBox}), getCCAdresses(), "Reminder for " + fullName, message);
							}
							if (isDebug) {
								String computerName=InetAddress.getLocalHost().getHostName();
								String message = SmtpHelper.getReminderDebugMessage(givenName, computerName);
								String[] notificationList = Data.getDebugNotificationList(null);
								if (notificationList != null && notificationList.length > 0) {
									SmtpSender.getInstance().sendTLSEmail(Arrays.asList(notificationList), null, "Reminder for " + fullName + " (" + mBox + ")", message);
								}
									
							}
						} catch (SmtpException e) {
							LOGGER.log(Level.SEVERE, e.getMessage());
						}
						catch (UnknownHostException e) {
							LOGGER.log(Level.SEVERE, e.getMessage());
						}
					}
				}
			}
		}
	}

	private Date getPreviousWorkingDay() {
	    Calendar cal = Calendar.getInstance();
	    cal.setTime(new Date());

	    int dayOfWeek;
	    do {
	        cal.add(Calendar.DAY_OF_MONTH, -1);
	        dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
	    } while (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY);

	    return cal.getTime();
	}
	
	public List<String> getCCAdresses() {
		return null;
	}
}
