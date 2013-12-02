package com.pointsource.mastermind.util;

public class ValidationException extends Exception {
	private static final long serialVersionUID = -7465225523840038413L;
	
	private String[] messages;
	
	public ValidationException(String message) {
		super(message);
	}

	public String[] getMessages() {
		return messages;
	}
	
	public void setMessages(String... messages) {
		this.messages = messages;
	}
}
