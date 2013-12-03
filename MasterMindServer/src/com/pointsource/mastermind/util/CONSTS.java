package com.pointsource.mastermind.util;

public interface CONSTS {
	/**
	 * Resource Paths
	 */
	public String RESOURCE_ME = "me";
	public String RESOURCE_NEW = "new";
	public String RESOURCE_GROUPS = "groups";
	public String RESOURCE_PEOPLE = "people";
	public String RESOURCE_PROJECTS = "projects";
	public String RESOURCE_ROLES = "roles";
	
	/**
	 * Request Paramter Names
	 */
	public String REQUEST_PARAM_NAME_QUERY = "query";
	
	/**
	 * Property Names
	 */
	public String PROP_ABOUT = "about";
	public String PROP_BASE = "base";
	public String PROP_COUNT = "count";
	public String PROP_CUSTOMER_NAME = "customerName";
	public String PROP_DATA = "data";
	public String PROP_END_DATE = "endDate";
	public String PROP_ETAG = "etag";
	public String PROP_EXECUTIVE_SPONSOR = "executiveSponsor";
	public String PROP_FAMILY_NAME = "familyName";
	public String PROP_FULL_NAME = "fullName";
	public String PROP_FULLY_UTILIZED = "fullyUtilized";
	public String PROP_GIVEN_NAME = "givenName";
	public String PROP_HOURS = "hours";
	public String PROP_ID = "id";
	public String PROP_MBOX = "mBox";
	public String PROP_MEMBERS = "members";
	public String PROP_MESSAGE = "message";
	public String PROP_REASONS = "reasons";
	public String PROP_NAME = "name";
	public String PROP_PEOPLE = "people";
	public String PROP_PRIMARY_EMAIL = "primaryEmail";
	public String PROP_RATE = "rate";
	public String PROP_RESOURCE = "resource";
	public String PROP_ROLES = "roles";
	public String PROP_START_DATE = "startDate";
	public String PROP_STATE = "state";
	public String PROP_STATUS = "status";
	public String PROP_TITLE = "title";
	public String PROP_TYPE = "type";
	public String PROP_USERS = "users";
	
	/**
	 * Constant values 
	 */
	public String VALUES_PROJECT_STATE_PRE_SALES = "preSales";
	public String VALUES_PROJECT_STATE_PLANNING = "planning";
	public String VALUES_PROJECT_STATE_CLIENT_ACTIVE = "clientActive";
	public String VALUES_PROJECT_STATE_SUPPORT_ACTIVE = "supportActive";
	public String VALUES_PROJECT_STATE_DONE = "done";
	public String VALUES_PROJECT_TYPE_INVEST = "invest";
	public String VALUES_PROJECT_TYPE_PAID = "paid";
	public String VALUES_PROJECT_TYPE_POC = "poc";
	public String VALUES_RATE_TYPE_HOURLY = "hourly";
	public String VALUES_RATE_TYPE_MONTHLY = "monthly";
	public String VALUES_RATE_TYPE_WEEKLY = "weekly";
	
	//Magic Group Constants
	public String GROUPS_EXEC_ID = "execs";
	public String GROUPS_EXEC_TITLE = "Executives";
	public String GROUPS_SALES_ID = "sales";
	public String GROUPS_SALES_TITLE = "Sales";
	
	//Magic Role Constants
	public String ROLE_SSA_ID = "SSA";
	public String ROLE_SSA_TITLE = "Senior Software Architect";
	public String ROLE_PM_ID = "PM";
	public String ROLE_PM_TITLE = "Project Manager";
	public String ROLE_BA_ID = "BA";
	public String ROLE_BA_TITLE = "Business Analyst";
	public String ROLE_SSE_ID = "SSE";
	public String ROLE_SSE_TITLE = "Senior Software Engineer";
	public String ROLE_SE_ID = "SE";
	public String ROLE_SE_TITLE = "Senior Engineer";
	public String ROLE_SUXD_ID = "SUXD";
	public String ROLE_SUXD_TITLE = "Senior User Experience Designer";
	public String ROLE_UXD_ID = "UXD";
	public String ROLE_UXD_TITLE = "User Experience Designer";
	
	/**
	 * Rest Summary Constants
	 */
	public String WORKSPACE_TITLE = "PointSource Master Mind";
	public String RESOURCE_TITLE_GROUPS = "Groups";
	public String RESOURCE_TITLE_PEOPLE = "People";
	public String RESOURCE_TITLE_PROJECTS = "Projects";
	public String RESOURCE_TITLE_ROLES = "Roles";
	
	/**
	 * Mongo Constants
	 */
	public String BUILD_NUMBER = "0.1.2013.11.26";
	public String DB_USER = "admin";
	public String DB_PASS = "t0ddSucks";
	public String DB_HOSTNAME_DEFAULT = "db.mastermind.pointsource.us";
	public int DB_PORT_DEFAULT  = 27017;
	public String DB_NAME_DEFAULT  = "mm_db_dev";
	public String COLLECTION_TITLE_PROJECTS = "Projects";
	
	
	/**
	 * Google Constants
	 */
	public String CLIENT_ID = "141952851027.apps.googleusercontent.com";
	public String CLIENT_SECRET = "Jiy0OMx_vOzHK1mXSIGSoog1";
	public String APPLICATION_NAME = "PS Master Mind";
	public String COOKIE_NAME_ACCESS_TOKEN = "access_token";
	public String SESSION_USER_KEY = "current_user";
	public String HEADER_AUTHORIZATION = "Authorization";
	public String AUTH_TYPE = "Bearer";
	public String GOOGLE_PLUS_PEOPLE_URI = "https://www.googleapis.com/plus/v1/people/";
}
