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
import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

public class InitialEmailReminderJob implements Job {
	private final static Logger LOGGER = Logger.getLogger(InitialEmailReminderJob.class.getName());
	private final static String MAILBOX_KEY = "mBox";
	private final static String RESOURCE_KEY = "resource";
	private final static String GIVENNAME_KEY = "givenName";
	private final static String NAME_KEY = "name";
	private final static String ACTIVE_KEY = "isActive";
	private final static String PRIMARY_ROLE_KEY = "primaryRole";
		
	private final static SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

	@Override
	public void execute(JobExecutionContext context)
			throws JobExecutionException {
		try {
			boolean isActive = Data.getReminderActive(null);
			boolean isDebug = Data.getReminderDebug(null);
			LOGGER.log(Level.INFO, "reminder.active=" + isActive);
			LOGGER.log(Level.INFO, "reminder.debug=" + isDebug);
			RequestContext rContext = getRequestContext();
			JSONArray people = Data.getPeople(rContext, "", "", "");
			JSONObject roles = Data.getRoles(rContext, "{\"$and\":[{\"isNonBillable\":true}]}", "");
			if (people != null) {
				for( int i = 0; i < people.length(); i++) {
					JSONObject contact = (JSONObject) people.get(i);
					String resource = (String) contact.get(RESOURCE_KEY);
					String givenName = (String) contact.get(GIVENNAME_KEY);
					String fullName = (String) contact.get(NAME_KEY);
					String mBox = (String) contact.get(MAILBOX_KEY);
					Boolean isActiveContact = false;
					
					if (contact.has(ACTIVE_KEY) && contact.get(ACTIVE_KEY).toString().toLowerCase().equals("true"))
						isActiveContact = true;
					
					JSONObject primaryRole = null;
					try {
						primaryRole = (JSONObject)contact.get(PRIMARY_ROLE_KEY);
					}
					catch (Exception jsone) {
						LOGGER.log(Level.FINE, jsone + " for " + fullName);
					}
						
					LOGGER.log(Level.INFO, "fullName=" + fullName);
					LOGGER.log(Level.INFO, "isActiveContact=" + isActiveContact);
					LOGGER.log(Level.INFO, "primaryRole=" + primaryRole);
					if (primaryRole != null) {
						LOGGER.log(Level.INFO, "primaryRole.getString(resource)=" + primaryRole.getString("resource"));
					}
					LOGGER.log(Level.INFO, "roles.toString()=" + roles.toString());

					if (isActiveContact && primaryRole != null && roles.toString().indexOf(primaryRole.getString("resource")) == -1 ) 
					{
						String date= DATE_FORMAT.format(getPreviousWorkingDay());
							
						String query = "{\"person\":{\"resource\":\"" + resource + "\"},\"date\":\"" + date + "\"}";
						JSONArray vacation = Data.getVacations(null, query, "", "");
						JSONArray hours = Data.getHours(null, query, "", "");
						LOGGER.log(Level.INFO, "vacation=" + vacation);
						if ((vacation == null || vacation.length() == 0 ) && (hours == null || hours.length() == 0)) {
							try {
								List<String> emails = getCCAdresses();
								LOGGER.log(Level.INFO, "emails=" + emails);
								LOGGER.log(Level.INFO, "isActive=" + isActive);
								if (isActive) {
									LOGGER.log(Level.INFO, "givenName=" + givenName);
									String message = SmtpHelper.getReminderMessage(givenName);
									LOGGER.log(Level.INFO, "message=" + message);
									LOGGER.log(Level.INFO, "mBox=" + mBox);
									LOGGER.log(Level.INFO, "fullName=" + fullName);
									if (message != null && !message.equals("")) {
										SmtpSender.getInstance().sendTLSEmail(Arrays.asList(new String[]{mBox}), emails, "Reminder for " + fullName, message);
									}
								}
								LOGGER.log(Level.INFO, "isDebug=" + isDebug);
								if (isDebug) {
									String computerName=InetAddress.getLocalHost().getHostName();
									LOGGER.log(Level.INFO, "computerName=" + computerName);
									String ccMail = null;
									if (emails != null) {
										ccMail = Arrays.toString(emails.toArray());
									}
									else {
										ccMail = "";
									}
									LOGGER.log(Level.INFO, "ccMail=" + ccMail);
									String message = SmtpHelper.getReminderDebugMessage(givenName, mBox, ccMail, computerName);
									LOGGER.log(Level.INFO, "message=" + message);
									String[] notificationList = Data.getDebugNotificationList(null);
									LOGGER.log(Level.INFO, "notificationList=" + notificationList);
									if (notificationList != null && notificationList.length > 0) {
										SmtpSender.getInstance().sendTLSEmail(Arrays.asList(notificationList), null, "Reminder for " + fullName + " (Limited Notification List)", message);
									}
										
								}
							} catch (SmtpException e) {
								e.printStackTrace();
								LOGGER.log(Level.SEVERE, e.getMessage());
							}
							catch (UnknownHostException e) {
								e.printStackTrace();
								LOGGER.log(Level.SEVERE, e.getMessage());
							}
						}
					}
				}
			}
		}
		catch (Exception e) {
				e.printStackTrace();
				LOGGER.log(Level.SEVERE, e.getMessage());
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
	
	protected RequestContext getRequestContext() {
		RequestContext context = new RequestContext();
		JSONObject user = new JSONObject();
		JSONArray groups = new JSONArray();
		groups.put(CONSTS.GROUPS_MANAGEMENT_TITLE);
		user.put(CONSTS.PROP_GROUPS, groups);
		context.setCurrentUser(user);
		return context;
	}

}
