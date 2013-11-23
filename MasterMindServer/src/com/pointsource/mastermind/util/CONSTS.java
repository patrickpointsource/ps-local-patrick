package com.pointsource.mastermind.util;

public interface CONSTS {
	/**
	 * Resource Paths
	 */
	public String RESOURCE_ME = "me";
	public String RESOURCE_NEW = "new";
	public String RESOURCE_PEOPLE = "people";
	public String RESOURCE_PROJECTS = "projects";
	
	/**
	 * Property Names
	 */
	public String PROP_ABOUT = "about";
	public String PROP_BASE = "base";
	public String PROP_COUNT = "count";
	public String PROP_DATA = "data";
	public String PROP_ETAG = "etag";
	public String PROP_FAMILY_NAME = "familyName";
	public String PROP_FULL_NAME = "fullName";
	public String PROP_GIVEN_NAME = "givenName";
	public String PROP_ID = "id";
	public String PROP_MBOX = "mBox";
	public String PROP_NAME = "name";
	public String PROP_PEOPLE = "people";
	public String PROP_PRIMARY_EMAIL = "primaryEmail";
	public String PROP_RESOURCE = "resource";
	public String PROP_USERS = "users";
	
	/**
	 * Rest Summary Constants
	 */
	public String WORKSPACE_TITLE = "PointSource Master Mind";
	public String RESOURCE_TITLE_PEOPLE = "People";
	public String RESOURCE_TITLE_PROJECTS = "Projects";
	
	
	/**
	 * Mongo Constants
	 */
	public String DB_USER = "admin";
	public String DB_PASS = "t0ddSucks";
	public String DB_HOSTNAME = "db.mastermind.pointsource.us";
	public int DB_PORT = 27017;
	public String DB_NAME = "mm_db_test_2013_11_21";
	public String COLLECTION_TITLE_PROJECTS = "Projects";
	
	
	/**
	 * Google Constants
	 */
	public String CLIENT_ID = "141952851027.apps.googleusercontent.com";
	public String CLIENT_SECRET = "Jiy0OMx_vOzHK1mXSIGSoog1";
	public String APPLICATION_NAME = "PS Master Mind";
	public String COOKIE_NAME_ACCESS_TOKEN = "access_token";
	public String HEADER_AUTHORIZATION = "Authorization";
	public String AUTH_TYPE = "Bearer";
	public String GOOGLE_PLUS_PEOPLE_URI = "https://www.googleapis.com/plus/v1/people/";
}
