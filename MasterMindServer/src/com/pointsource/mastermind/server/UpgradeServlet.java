package com.pointsource.mastermind.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

import com.pointsource.mastermind.util.CONSTS;
import com.pointsource.mastermind.util.Data;
import com.pointsource.mastermind.util.RequestContext;

/**
 * @author kmbauer
 *
 */
public class UpgradeServlet extends HttpServlet {

	private static final long serialVersionUID = 6855195588055192352L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException{
		RequestContext context = new RequestContext();
		HttpSession session = req.getSession();
		Object user = session.getAttribute(CONSTS.SESSION_USER_KEY);
		context.setCurrentUser((JSONObject)user);
		Object auth = session.getAttribute(CONSTS.COOKIE_NAME_ACCESS_TOKEN);
		context.setAuthorization(String.valueOf(auth));
		context.setServletContext(req.getServletContext());
		
		//Synch Users
		try {
			context.setBaseURI(new URI(CONSTS.PUBLIC_BASE_URL));
			Data.synchPeople(context);
			Data.migrateServicesEstimate(context);
			Data.removeProjectEstimateFields(context);
			//Data.migrateAssignees(context);
			Data.convertAssignmentPercentageToHoursPerWeek(context);
			Data.removeRolesAbout(context);
		} catch (Exception e) {
			e.printStackTrace();
			resp.sendError(500, e.getLocalizedMessage());
		}
		
		resp.setContentType("text/html");
	    PrintWriter out = resp.getWriter();

	    out.println("<html>");
	    out.println("<head>");
	    out.println("<title>Upgrade</title>");
	    out.println("</head>");
	    out.println("<body><h1>You are now up to date!</h1>");
	    out.println("</body>");
	    out.println("</html>");
	}

}
