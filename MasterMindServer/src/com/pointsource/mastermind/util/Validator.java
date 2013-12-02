package com.pointsource.mastermind.util;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

public class Validator implements CONSTS {

	public static void canCreateProject(JSONObject project, JSONObject user)
			throws ValidationException {
		try {
			String[] messages = getCreateProjectValidationMessages(project,
					user);
			if (messages.length > 0) {
				ValidationException ex = new ValidationException(messages[0]);
				ex.setMessages(messages);

				throw ex;
			}
		} catch (ValidationException ex) {
			throw ex;
		} catch (Exception e) {
			String message = e.getClass().getName() + ": "
					+ String.valueOf(e.getLocalizedMessage());
			ValidationException ex = new ValidationException(message);
			ex.setMessages(message);
			throw ex;
		}
	}

	public static String[] getCreateProjectValidationMessages(
			JSONObject project, JSONObject user) throws JSONException {
		List<String> ret = new ArrayList<String>();

		// Customer Name - *required -- Cannot be edited
		if (!project.has(PROP_CUSTOMER_NAME)
				|| project.getString(PROP_CUSTOMER_NAME) == null) {
			ret.add("Customer Name is required");
		}
		
		// Project Name - *required
		if (!project.has(PROP_NAME) || project.getString(PROP_NAME) == null) {
			ret.add("Project Name is required");
		}
		
		// Project Type - Select One a. Paid b. PoC c. PS Invest
		if (!project.has(PROP_TYPE) || project.getString(PROP_TYPE) == null) {
			ret.add("Project Type is required");
		} else if (!project.getString(PROP_TYPE).equals(
				VALUES_PROJECT_TYPE_INVEST)
				&& !project.getString(PROP_TYPE).equals(
						VALUES_PROJECT_TYPE_INVEST)
				&& !project.getString(PROP_TYPE).equals(
						VALUES_PROJECT_TYPE_INVEST)) {
			ret.add("Project Type is an unknown value: "
					+ project.getString(PROP_TYPE));
		}
		
		//Project Start Date - *required  - Date no time 
		if (!project.has(PROP_START_DATE) || project.getString(PROP_START_DATE) == null) {
			ret.add("Project Start Date is required");
		} 

		return ret.toArray(new String[ret.size()]);
	}
}
