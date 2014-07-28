package com.pointsource.mastermind.server.smtp;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SmtpHelper {
	private final static Logger LOGGER = Logger.getLogger(SmtpHelper.class.getName());
	private static final String REMINDER_NOTICE = "/com/pointsource/mastermind/server/smtp/reminder.notice";
	private static final String REMINDER_DEBUG_NOTICE = "/com/pointsource/mastermind/server/smtp/reminder.debug.notice";

	public static String getReminderMessage(String userName) {
		BufferedInputStream bis = new BufferedInputStream(SmtpHelper.class.getResourceAsStream(REMINDER_NOTICE));
		StringBuffer buf = new StringBuffer();
		int x;
		try {
			while ((x = bis.read()) != -1) {
				buf.append((char) x);
			}
		} catch (IOException e) {
			LOGGER.log(Level.WARNING, e.getMessage());
		}
		
		String msg = buf.toString();
		msg = msg.replaceAll("!userName!", userName);
		return msg;
	}

	public static String getReminderDebugMessage(String userName, String userMail, String ccMail, String computerName) {
		BufferedInputStream bis = new BufferedInputStream(SmtpHelper.class.getResourceAsStream(REMINDER_DEBUG_NOTICE));
		StringBuffer buf = new StringBuffer();
		int x;
		try {
			while ((x = bis.read()) != -1) {
				buf.append((char) x);
			}
		} catch (IOException e) {
			LOGGER.log(Level.WARNING, e.getMessage());
		}
		
		String msg = buf.toString();
		msg = msg.replaceAll("!userName!", userName);
		msg = msg.replaceAll("!computerName!", computerName);
		msg = msg.replaceAll("!ccMail!", ccMail);
		msg = msg.replaceAll("!userMail!", userMail);
		return msg;
	}
}
