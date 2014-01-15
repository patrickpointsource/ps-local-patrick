package com.pointsource.mastermind.util;

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

	/**
	 * Is the hours record valid for creation
	 * 
	 * @param context
	 * @param hoursRecord
	 * @throws ValidationException
	 * @throws JSONException
	 */
	public static void canCreateHours(RequestContext context,
			JSONObject hoursRecord) throws ValidationException, JSONException {
		try {
			String[] messages = getHoursValidationMessages(context,
					hoursRecord);
			if (messages.length > 0) {
				ValidationException ex = new ValidationException(messages[0]);
				ex.setMessages(messages);

				throw ex;
			}
		} catch (ValidationException ex) {
			throw ex;
		}
	}
	
	/**
	 * Is the project valid for creation
	 * 
	 * @param context
	 * @param project
	 * @throws ValidationException
	 * @throws JSONException
	 */
	public static void canCreateProject(RequestContext context,
			JSONObject project) throws ValidationException, JSONException {
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
		}
	}

	/**
	 * Is the project valid for update
	 * 
	 * @param context
	 * @param project
	 * @throws ValidationException
	 * @throws JSONException
	 */
	public static void canUpdateProject(RequestContext context,
			JSONObject project) throws ValidationException, JSONException {
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
		}
	}
	
	/**
	 * Validation Messages for a an hours record
	 * @param context
	 * @param hoursRecord
	 * @return
	 * @throws JSONException
	 */
	public static String[] getHoursValidationMessages(
			RequestContext context, JSONObject hoursRecord) throws JSONException {

		List<String> ret = new ArrayList<String>();

		// Project is required - *required
		if (!hoursRecord.has(PROP_PROJECT)
				|| !hoursRecord.getJSONObject(PROP_PROJECT).has(PROP_RESOURCE)) {
			ret.add("Project is required");
		}
		
		// Person is required - *required
		if (!hoursRecord.has(PROP_PERSON)
				|| !hoursRecord.getJSONObject(PROP_PERSON).has(PROP_RESOURCE)) {
			ret.add("Person is required");
		}
		
		// Date is required - *required
		if (!hoursRecord.has(PROP_DATE)) {
			ret.add("Date is required");
		}
		
		// Hours are required - *required
		if (!hoursRecord.has(PROP_HOURS)) {
			ret.add("Hours are required");
		}
		
		// Description is required - *required
		if (!hoursRecord.has(PROP_DESCRIPTION)) {
			ret.add("Description is required");
		}
		
		return ret.toArray(new String[ret.size()]);
	}

	/**
	 * Validation Messages for a project
	 * @param context
	 * @param project
	 * @return
	 * @throws JSONException
	 */
	public static String[] getCreateProjectValidationMessages(
			RequestContext context, JSONObject project) throws JSONException {

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
				&& !project.getString(PROP_TYPE)
						.equals(VALUES_PROJECT_TYPE_POC)
				&& !project.getString(PROP_TYPE).equals(
						VALUES_PROJECT_TYPE_PAID)) {
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
			JSONObject sponsor = project.getJSONObject(PROP_EXECUTIVE_SPONSOR);
			String sponsorRef = sponsor.getString(PROP_RESOURCE);
			String id = sponsorRef.substring(sponsorRef.lastIndexOf('/')+1);
			JSONObject profile = Data.getPerson(context, id);
			JSONArray groups = profile.getJSONArray(PROP_GROUPS);
			boolean matched = false;

			for (int i = 0; i < groups.length(); i++) {
				String group = groups.getString(i);
				if (GROUPS_EXEC_TITLE.equals(group)) {
					matched = true;
					break;
				}
			}

			if (!matched) {
				ret.add("Executive Sponsor is not a member of the Executive Group");
			}
		}

		// Validate Roles
		if (!project.has(PROP_ROLES)) {
			ret.add("Project must include atleast one role");
		} else {
			JSONArray roles = project.getJSONArray(PROP_ROLES);

			if (roles.length() < 1) {
				ret.add("Project must include atleast one role");
			}

			// Check if project managment was included in the estimate
			boolean hasBAOrPM = false;

			boolean checkedAllRoles = false;
			JSONObject roleTypes = Data.getRoles(context, "{}", "{}");
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
					if (!type.has(PROP_RESOURCE)) {
						ret.add("Each Role type must have an ID");
					} else {
						String typeResource = type.getString(PROP_RESOURCE);

						boolean typeFound = false;
						String typeAbr = null;
						for (int j = 0; j < roleTypeMembers.length(); j++) {
							JSONObject roleType = roleTypeMembers
									.getJSONObject(j);
							String about = roleType.getString(PROP_RESOURCE);
							if (about.equals(typeResource)) {
								typeFound = true;
								typeAbr = roleType.getString(PROP_ABBREVIATION);
								break;
							}
						}

						if (!typeFound) {
							ret.add("Unknown role type: " + typeResource);
							break;
						}

						// Includes BA or PM
						if (typeAbr.equals(ROLE_BA_ID)
								|| typeAbr.equals(ROLE_PM_ID)) {
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
									//BR: Senior UX Designers must have a minimum of 40 hours in a project or no hours.
									if (!rate.has(PROP_FULLY_UTILIZED)
											|| !rate.getBoolean(PROP_FULLY_UTILIZED)) {
										if (!rate.has(PROP_HOURS)
												|| rate.getInt(PROP_HOURS) < 1) {
											ret.add("An Hourly Role must specify the number hours per month");
											break;
										} else {
											int hoursPerMonth = rate.getInt(PROP_HOURS);
											if (hoursPerMonth > 220) {
												ret.add("An Hourly Role cannot exceed 220 hours per month");
												break;
											}
											else if("SXUD".equals(typeAbr) && hoursPerMonth < 40){
												ret.add("Senior UX Designers must have a minimum of 40 hours/month in a project");
											}
										}
									}
								} else if (VALUES_RATE_TYPE_WEEKLY
										.equals(rateType)) {
									// b. Weekly
									// i. 100% Utilization = Yes/No
									// ii. hours per week BR: Cannot exceed 50
									// hours
									//BR: Senior UX Designers must have a minimum of 40 hours in a project or no hours.
									if (!rate.has(PROP_FULLY_UTILIZED)
											|| !rate.getBoolean(PROP_FULLY_UTILIZED)) {
										if (!rate.has(PROP_HOURS)
												|| rate.getInt(PROP_HOURS) < 1) {
											ret.add("A Weekly Role must specify the number hours per week");
											break;
										} else {
											int hoursPerWeek = rate
													.getInt(PROP_HOURS);
											if (hoursPerWeek > 50) {
												ret.add("A Weekly Role cannot exceed 50 hours per week");
												break;
											}
											else if("SXUD".equals(typeAbr) && hoursPerWeek < 10){
												ret.add("Senior UX Designers must have a minimum of 40 hours/month in a project");
											}
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
								// TODO this should be across projects
								// if (ROLE_SSE_ID.equals(typeId)
								// || ROLE_SE_ID.equals(typeId)) {
								// int hours = 180;
								// if (VALUES_RATE_TYPE_WEEKLY
								// .equals(rateType)) {
								// hours = (int) (rate.getInt(PROP_HOURS) * 4);
								// } else if (VALUES_RATE_TYPE_HOURLY
								// .equals(rateType)) {
								// hours = rate.getInt(PROP_HOURS);
								// }
								//
								// if (hours < 130) {
								// ret.add("Software Engineers cannot be booked for less than 130 hours a month");
								// break;
								// }
								// }
							}
						}
					}
				}
			}

			if (checkedAllRoles && !hasBAOrPM) {
				if (project.has(PROP_TERMS)) {
					JSONObject terms = project.getJSONObject(PROP_TERMS);
					hasBAOrPM = terms
							.has(PROP_INCLUDES_PROJECT_MANAGEMENT_OVERHEAD)
							&& terms.getBoolean(PROP_INCLUDES_PROJECT_MANAGEMENT_OVERHEAD);
				}

				if(!hasBAOrPM)ret.add("A Project must include Project Managment or Business Analyst oversight");
			}

		}

		return ret.toArray(new String[ret.size()]);
	}
}
