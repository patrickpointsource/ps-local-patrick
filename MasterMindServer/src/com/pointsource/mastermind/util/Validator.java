package com.pointsource.mastermind.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

public class Validator implements CONSTS {
	
	private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

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

		// Customer Name - *required
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
		
		//Start data should be in the form yyyy-mm-dd
		else{
			try {
				Date startDate = DATE_FORMAT.parse(project.getString(PROP_START_DATE));
				if(startDate == null){
					ret.add("Failed to parse start date");
				}
				
				else if(project.has(PROP_END_DATE)){
					try {
						Date endDate = DATE_FORMAT.parse(project.getString(PROP_END_DATE));
						if(endDate == null){
							ret.add("Failed to parse end date");
						}
						else{
							if(startDate.after(endDate)){
								ret.add("The start date cannot be later than the end date");
							}
						}
					} catch (ParseException e) {
						e.printStackTrace();
						ret.add("Failed to parse end date: " + e.getLocalizedMessage());
					}
				}
				
			} catch (ParseException e) {
				e.printStackTrace();
				ret.add("Failed to parse start date: " + e.getLocalizedMessage());
			}
		}
		
		//Project State:
		//	a.  Pre-Sales
		//	b.  Planning   - *this is the default for new record
		//	c.  Client Active
		//	d.  Support Active
		//	c.  Done! (complete)
		if(!project.has(PROP_STATE)){
			//default to planning
			project.put(PROP_STATE, VALUES_PROJECT_STATE_PLANNING);
		}
		else{
			String state = project.getString(PROP_STATE);
			
			if(!VALUES_PROJECT_STATE_CLIENT_ACTIVE.equals(state)
					&& !VALUES_PROJECT_STATE_DONE.equals(state)
					&& !VALUES_PROJECT_STATE_PLANNING.equals(state)
					&& !VALUES_PROJECT_STATE_PRE_SALES.equals(state)
					&& !VALUES_PROJECT_STATE_SUPPORT_ACTIVE.equals(state)){
				ret.add("Unrecognized project state: " + state);
			}
		}
		

		return ret.toArray(new String[ret.size()]);
	}
}
