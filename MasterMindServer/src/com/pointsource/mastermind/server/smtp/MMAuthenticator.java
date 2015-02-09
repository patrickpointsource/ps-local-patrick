package com.pointsource.mastermind.server.smtp;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;

public class MMAuthenticator extends Authenticator{
	private String username;
	private String password;
	
	public MMAuthenticator(String username, String password) {
		this.username = username;
		this.password = password;
	}

	public PasswordAuthentication getPasswordAuthentication() {
		return new PasswordAuthentication(username, password);
	}
}
