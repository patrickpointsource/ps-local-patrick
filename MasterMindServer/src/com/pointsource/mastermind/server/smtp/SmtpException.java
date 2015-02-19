package com.pointsource.mastermind.server.smtp;

public class SmtpException extends Exception {
	private static final long serialVersionUID = 1L;

	public SmtpException(String message) {
        super(message);
    }

}
