package com.pointsource.mastermind.util;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Validator implements CONSTS {

	private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat(
			"yyyy-MM-dd");

	public static void canCreateProject(RequestContext context,
			JSONObject project) throws ValidationException {
		try {
			String[] messages = getCreateProjectValidationMessages(context,
					project);
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
			RequestContext context, JSONObject project) throws JSONException {

		JSONObject user = context.getCurrentUser();

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

		// Project Start Date - *required - Date no time
		if (!project.has(PROP_START_DATE)
				|| project.getString(PROP_START_DATE) == null) {
			ret.add("Project Start Date is required");
		}

		// Start data should be in the form yyyy-mm-dd
		else {
			try {
				Date startDate = DATE_FORMAT.parse(project
						.getString(PROP_START_DATE));
				if (startDate == null) {
					ret.add("Failed to parse start date");
				}

				else if (project.has(PROP_END_DATE)) {
					try {
						Date endDate = DATE_FORMAT.parse(project
								.getString(PROP_END_DATE));
						if (endDate == null) {
							ret.add("Failed to parse end date");
						} else {
							if (startDate.after(endDate)) {
								ret.add("The start date cannot be later than the end date");
							}
						}
					} catch (ParseException e) {
						e.printStackTrace();
						ret.add("Failed to parse end date: "
								+ e.getLocalizedMessage());
					}
				}

			} catch (ParseException e) {
				e.printStackTrace();
				ret.add("Failed to parse start date: "
						+ e.getLocalizedMessage());
			}
		}

		// Project State:
		// a. Pre-Sales
		// b. Planning - *this is the default for new record
		// c. Client Active
		// d. Support Active
		// c. Done! (complete)
		if (!project.has(PROP_STATE)) {
			// default to planning
			project.put(PROP_STATE, VALUES_PROJECT_STATE_PLANNING);
		} else {
			String state = project.getString(PROP_STATE);

			if (!VALUES_PROJECT_STATE_CLIENT_ACTIVE.equals(state)
					&& !VALUES_PROJECT_STATE_DONE.equals(state)
					&& !VALUES_PROJECT_STATE_PLANNING.equals(state)
					&& !VALUES_PROJECT_STATE_PRE_SALES.equals(state)
					&& !VALUES_PROJECT_STATE_SUPPORT_ACTIVE.equals(state)) {
				ret.add("Unrecognized project state: " + state);
			}
		}

		// Exec Sponsor - *required
		if (!project.has(PROP_EXECUTIVE_SPONSOR)) {
			ret.add("Project must have an Executive Sponsor");
		} else {
			String sponsor = project.getString(PROP_EXECUTIVE_SPONSOR);

			try {
				JSONObject group = Data.getGroup(context, GROUPS_EXEC_ID);
				JSONArray members = group.getJSONArray(PROP_MEMBERS);

				boolean matched = false;

				for (int i = 0; i < members.length(); i++) {
					JSONObject member = members.getJSONObject(i);
					if (member.has(PROP_ID)) {
						String id = member.getString(PROP_ID);
						if (id.equals(sponsor)) {
							matched = true;
							break;
						}
					}
				}

				if (!matched) {
					ret.add("Executive Sponsor is not a member of the Executive Group");
				}

			} catch (IOException e) {
				e.printStackTrace();
				ret.add("Failed to validate the Executive Sponsor: "
						+ e.getLocalizedMessage());
			}
		}

		// Validate Roles
		if (!project.has(PROP_ROLES)) {
			ret.add("Project must include atleast one role");
		} else {
			JSONArray roles = project.getJSONArray(PROP_ROLES);
			boolean hasBAOrPM = false;
			boolean checkedAllRoles = false;
			JSONObject roleTypes = Data.getRoles();
			JSONArray roleTypeMembers = roleTypes.getJSONArray(PROP_MEMBERS);

			for (int i = 0; i < roles.length(); i++) {
				JSONObject role = roles.getJSONObject(i);

				if (i == roles.length() - 1) {
					checkedAllRoles = true;
				}

				// Role must be of a known type
				if (!role.has(PROP_TYPE)) {
					ret.add("Each Role must include a type");
					break;
				} else {
					JSONObject type = role.getJSONObject(PROP_TYPE);
					if (!type.has(PROP_ID)) {
						ret.add("Each Role type must have an ID");
					} else {
						String typeId = type.getString(PROP_ID);

						boolean typeFound = false;
						for (int j = 0; j < roleTypeMembers.length(); j++) {
							JSONObject roleType = roleTypeMembers
									.getJSONObject(j);
							String id = roleType.getString(PROP_ID);
							if (id.equals(typeId)) {
								typeFound = true;
								break;
							}
						}

						if (!typeFound) {
							ret.add("Unknown role type: " + typeId);
							break;
						}

						// Includes BA or PM
						if (ROLE_BA_ID.equals(typeId)
								|| ROLE_PM_ID.equals(typeId)) {
							hasBAOrPM = true;
						}

						// Role must have a charge rate
						if (!role.has(PROP_RATE)) {
							ret.add("Each Role must include a rate");
							break;
						} else {
							JSONObject rate = role.getJSONObject(PROP_RATE);
							if (!rate.has(PROP_TYPE)) {
								ret.add("Each Role Rate must include a Type");
							} else {
								String rateType = rate.getString(PROP_TYPE);
								if (VALUES_RATE_TYPE_HOURLY.equals(rateType)) {
									// a. Hourly
									// i. 100% Utilization = Yes/No
									// ii. hours per month BR: cannot exceed 220
									// hours
									if ((!rate.has(PROP_FULLY_UTILIZED) || !rate
											.getBoolean(PROP_FULLY_UTILIZED))
											&& rate.has(PROP_HOURS)) {
										int hoursPerMonth = rate
												.getInt(PROP_HOURS);
										if (hoursPerMonth > 220) {
											ret.add("A Role cannot exceed 220 hours per month");
											break;
										}
									}
								} else if (VALUES_RATE_TYPE_WEEKLY
										.equals(rateType)) {
									// b. Weekly
									// i. 100% Utilization = Yes/No
									// ii. hours per week BR: Cannot exceed 50
									// hours
									if ((!rate.has(PROP_FULLY_UTILIZED) || !rate
											.getBoolean(PROP_FULLY_UTILIZED))
											&& rate.has(PROP_HOURS)) {
										int hoursPerMonth = rate
												.getInt(PROP_HOURS);
										if (hoursPerMonth > 220) {
											ret.add("A Role cannot exceed 220 hours per month");
											break;
										}
									}
								} else if (VALUES_RATE_TYPE_MONTHLY
										.equals(rateType)) {
									// b. Weekly
									// c. Monthly Monthly assumes 100%
									// Utilization
									// i. Assumes 100% Utilization or 180 hours
									// per
									// week
									if (!rate.has(PROP_FULLY_UTILIZED)
											|| !rate.getBoolean(PROP_FULLY_UTILIZED)) {
										// Mark 100% utilization
										rate.put(PROP_FULLY_UTILIZED, true);
									}
								} else {
									ret.add("Unknown Role Rate Type: "
											+ rateType);
									break;
								}

								// b. SSE BR: SSE cannot be booked < 75% or 130
								// hours per
								// month
								// c. SE BR: SE cannot be booked < 75% or 130
								// hours
								// per
								// month
								if (ROLE_SSE_ID.equals(typeId)
										|| ROLE_SE_ID.equals(typeId)) {
									int hours = 180;
									if (VALUES_RATE_TYPE_WEEKLY
											.equals(rateType)) {
										hours = (int) (rate.getInt(PROP_HOURS) * 4);
									}
									else if(VALUES_RATE_TYPE_HOURLY.equals(rateType)){
										hours = rate.getInt(PROP_HOURS);
									}

									if (hours < 130) {
										ret.add("Software Engineers cannot be booked for less than 130 hours a month");
										break;
									}
								}
							}
						}
					}
				}
			}

			if (checkedAllRoles && !hasBAOrPM) {
				ret.add("A Project must include Project Managment or Business Analyst oversight");
			}

		}

		return ret.toArray(new String[ret.size()]);
	}
}
