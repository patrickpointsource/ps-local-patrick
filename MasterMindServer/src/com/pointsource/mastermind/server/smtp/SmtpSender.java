package com.pointsource.mastermind.server.smtp;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.activation.DataHandler;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.util.ByteArrayDataSource;

public class SmtpSender {
	private final static Logger LOGGER = Logger.getLogger(SmtpSender.class.getName());
	private static final Properties propsTLS = new Properties();
	private static final String PROPS_TLS_PATH = "/com/pointsource/mastermind/server/smtp/mail.tls.properties";
	private static SmtpSender _instance;
	
	private final String MAIL_SMPT_USER_PROPERTY = "mail.smtp.user";
	private final String MAIL_SMPT_PASSWORD_PROPERTY = "mail.smtp.password";
	private final String MAIL_FROM_PROPERTY = "mail.from";
	
	static {
		try {
			_instance = new SmtpSender();
		} catch (SmtpException e) {
			LOGGER.log(Level.SEVERE, e.getMessage());
		}
	}
	
	private SmtpSender() throws SmtpException {
		try {
			propsTLS.load(getClass().getResourceAsStream(PROPS_TLS_PATH));
		} catch (IOException ioEx) {
			throw new SmtpException(ioEx.getMessage());
		}
	}
	
	public void sendTLSEmail(List<String> sendTo, List<String> sendCC, String subject, String body) throws SmtpException {
		String username = propsTLS.getProperty(MAIL_SMPT_USER_PROPERTY);
		String password = propsTLS.getProperty(MAIL_SMPT_PASSWORD_PROPERTY);
		Session session = Session.getInstance(propsTLS, new MMAuthenticator(username, password));		
		MimeMessage message = new MimeMessage(session);
		
		try {
			
			InternetAddress[] addressess = null;
			addressess = getInternetAddresses(sendTo);
			if (addressess != null) {
				message.addRecipients(Message.RecipientType.TO, addressess);
			}
			addressess = getInternetAddresses(sendCC);
			if (addressess != null) {
				message.addRecipients(Message.RecipientType.CC, addressess);
			}
			message.setFrom(new InternetAddress(propsTLS.getProperty(MAIL_FROM_PROPERTY)));
			message.setSubject(subject);
			message.setDataHandler(new DataHandler(new ByteArrayDataSource(body.getBytes(), "text/plain")));		
			Transport.send(message);
			
		} catch (AddressException addressEx) {
			throw new SmtpException(addressEx.getMessage());
		} catch (MessagingException msgEx) {
			throw new SmtpException(msgEx.getMessage());
		}
	}

	public static SmtpSender getInstance() {
		return _instance;
	}
	
	
	private InternetAddress[] getInternetAddresses(List<String> source) throws AddressException, SmtpException {
		InternetAddress[] addressess = null;
		if (source != null && !source.isEmpty()) {
			List<InternetAddress> list = new ArrayList<InternetAddress>();
			Iterator<String> i = source.iterator();
			while (i.hasNext()) {
				try {
					list.add(new InternetAddress(i.next()));
				}
				catch (AddressException ae) {
					LOGGER.log(Level.SEVERE, "Incorrect address : " + ae.getMessage());
				}
			}
			addressess = (InternetAddress[]) list.toArray(new InternetAddress[] {});
		}
		return addressess;
	}

}
