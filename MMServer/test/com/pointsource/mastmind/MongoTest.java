package com.pointsource.mastmind;

import java.net.UnknownHostException;

import com.mongodb.DB;
import com.mongodb.Mongo;

public class MongoTest {

	/**
	 * @param args
	 * @throws UnknownHostException 
	 */
	public static void main(String[] args) throws UnknownHostException {
		Mongo mongo =  new Mongo("db.mastermind.pointsource.us", 27017);
		DB db = mongo.getDB("mm_db");
	
		String name = db.getName();
		System.out.println("I am alive!!!: " + name);
	}

}
