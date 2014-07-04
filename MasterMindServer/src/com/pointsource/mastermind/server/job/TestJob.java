package com.pointsource.mastermind.server.job;

import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class TestJob implements Job{
	private final static Logger LOGGER = Logger.getLogger(TestJob.class.getName());

	@Override
	public void execute(JobExecutionContext context)
			throws JobExecutionException {
		LOGGER.log(Level.INFO,"Test job has been started at " +  new Date());
	}

}
