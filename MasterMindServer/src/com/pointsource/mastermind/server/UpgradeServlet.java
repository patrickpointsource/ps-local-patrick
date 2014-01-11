package com.pointsource.mastermind.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URISyntaxException;

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
			context.setBaseURI(getBaseUrl(req));
			//Data.synchDefaultSkills(context);
			Data.synchPeople(context);
			Data.synchDefaultGroups(context);
			Data.synchDefaultRoles(context);

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
	 /**
	   * Returns the base url (e.g, <tt>http://myhost:8080/myapp/</tt>) suitable for
	   * using in a base tag or building reliable urls.
	 * @throws URISyntaxException 
	   */
	  public static URI getBaseUrl( HttpServletRequest request ) throws URISyntaxException {
	    if ( ( request.getServerPort() == 80 ) ||
	         ( request.getServerPort() == 443 ) )
	      return new URI(request.getScheme() + "://" +
	             request.getServerName() +
	             request.getContextPath() +  "/");
	    else
	      return new URI(request.getScheme() + "://" +
	             request.getServerName() + ":" + request.getServerPort() +
	             request.getContextPath() + "/");
	  }

}
