/**
 * 
 */
package com.pointsource.mastermind.util;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 */
public class PermissionUtil {

	/**
	 * 
	 */
	public PermissionUtil() {
		// TODO Auto-generated constructor stub
	}

	public static void checkAdminAccess(RequestContext context, String operation)
			throws WebApplicationException {
		if (!hasAdminAccess(context)) {
			throw new WebApplicationException(Response
					.status(Status.FORBIDDEN)
					.entity("You need admin authority to perform operation: "
							+ operation).build());
		}
	}

	public static boolean hasAdminAccess(RequestContext context)
			throws JSONException {
		return context.getCurrentUser() != null
				&& (isMember(context.getCurrentUser(),
						CONSTS.GROUPS_MANAGEMENT_TITLE) || isMember(
						context.getCurrentUser(), CONSTS.GROUPS_EXEC_TITLE));
	}

	/**
	 * Returns true if the user is a member of the given group
	 * 
	 * @param person
	 * @param group
	 * @return
	 * @throws JSONException
	 */
	private static boolean isMember(JSONObject person, String group)
			throws JSONException {
		boolean ret = false;

		if (person.has(CONSTS.PROP_GROUPS)) {
			JSONArray groups = person.getJSONArray(CONSTS.PROP_GROUPS);

			for (int i = 0; i < groups.length(); i++) {
				if (group.equals(groups.getString(i))) {
					ret = true;
					break;
				}
			}
		}

		return ret;
	}
}
