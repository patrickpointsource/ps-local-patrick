package com.pointsource.mastermind.server;

import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

public class SchedulerServlet extends HttpServlet {
	private final static Logger LOGGER = Logger.getLogger(SchedulerServlet.class.getName());

	private static final long serialVersionUID = 1L;
	private static final String JOB_PROPERTIES_FILE = "/WEB-INF/job.properties";
    private static StdSchedulerFactory schedulerFactory = null;
    
    private final String ACTIVE_KEY = "active";
    private final String SCHEDULER_NAME_KEY = "schedulerName";
    private final String THREADS_KEY = "threads";
    private final String JOB_NAME_KEY = "jobName";
    private final String SCHEDULER_NAME_DEFAULT = "jobScheduler";
    
	public void init() throws ServletException
    {
    	try {
			ServletConfig config = getServletConfig();
			ServletContext context = config.getServletContext();
	    	Properties jobProps = new Properties();
	    	InputStream inStream = context.getResourceAsStream(JOB_PROPERTIES_FILE);
    		if(inStream != null) {
    			jobProps.load(inStream);
    		}
			String tmp = jobProps.getProperty(ACTIVE_KEY);
			boolean isJobSchedulerActive = (tmp!=null && tmp.trim().equalsIgnoreCase("true"));

			if(isJobSchedulerActive) {
				int jobsScheduled = 0;
				String schedulerName = jobProps.getProperty(SCHEDULER_NAME_KEY);
				if(schedulerName != null) {
					schedulerName = schedulerName.trim();
				} else {
					schedulerName = SCHEDULER_NAME_DEFAULT;
				}
				tmp = jobProps.getProperty(THREADS_KEY);
				int threads = 1;
				if(tmp != null) {
					try {
						threads = (tmp!=null?Integer.parseInt(tmp):1); // default to 1 thread unless overridden
					} catch(Throwable t) {
					}
				}

				Properties schedProps = new Properties();
				schedProps.setProperty("org.quartz.threadPool.threadCount", ""+threads);
				schedProps.setProperty("org.quartz.scheduler.instanceName", "DefaultScheduler"); // could configure this if necessary
				schedProps.setProperty("org.quartz.jobStore.class", "org.quartz.simpl.RAMJobStore");
				schedulerFactory = new StdSchedulerFactory(schedProps); // schedulerFactory is a singleton
				Scheduler scheduler = schedulerFactory.getDefaultScheduler();
				
				Enumeration jobKeys = jobProps.keys();
				while(jobKeys.hasMoreElements()) {
					String jobName = ((String)jobKeys.nextElement()).trim();
					if(false == jobName.equalsIgnoreCase(ACTIVE_KEY)
							&& false == jobName.equalsIgnoreCase(THREADS_KEY)
							&& false == jobName.equalsIgnoreCase(SCHEDULER_NAME_KEY)
							) {
						String jobInfoText = jobProps.getProperty(jobName);
						try {
							if(jobInfoText != null) {
								String jobInfo[] = jobInfoText.split(",");
								boolean jobActive = jobInfo[0].equalsIgnoreCase("true");
								if(jobActive) {
									String jobGroup = jobInfo[1];
									String jobClass = jobInfo[2];
									String jobCronEntry = jobInfo[3];
									JobDataMap jobData = new JobDataMap();
									jobData.put(JOB_NAME_KEY, jobName); 
									if(jobInfo.length > 4) {
										int ctr = 4;
										for( ; ctr < jobInfo.length; ++ctr) {
	                                        String[] paramInfo = jobInfo[ctr].split(":");
	                                        if (paramInfo.length == 3) {
	                                        	jobData.put(paramInfo[0], paramInfo[1] + ":" + paramInfo[2]);
	                                        } else
	                                        	jobData.put(paramInfo[0], paramInfo[1]);
										}
									}
									
									Class jobClassDef = Class.forName(jobClass);
									JobDetail job = JobBuilder.newJob(jobClassDef)
														.withIdentity(jobName,jobGroup)
														.usingJobData(jobData)
														.build();
	                                jobCronEntry = jobCronEntry.replace("\"","");
	                                
	                                // using Trigger for production 
									Trigger trigger = TriggerBuilder.newTrigger().withIdentity(jobName, jobGroup).withSchedule(CronScheduleBuilder.cronSchedule(jobCronEntry)).build();

									// schedule it
									scheduler.scheduleJob(job, trigger);
									++jobsScheduled;
								}
							} else {
								LOGGER.log(Level.WARNING,"Job '" + jobName + "' has a null definition. Check " + JOB_PROPERTIES_FILE);
							}
						} catch(ClassNotFoundException cnfe) {
							LOGGER.log(Level.WARNING, "Job '" + jobName + "' specifies an invalid job classname. Check " + JOB_PROPERTIES_FILE);
						} catch(Throwable t) {
							t.printStackTrace();
							LOGGER.log(Level.WARNING,"Job '" + jobName + "' has an invalid format. Check " + JOB_PROPERTIES_FILE);
						}
					}
				}
				
				if( jobsScheduled > 0 ) {
					if(false == scheduler.isStarted()) {
						scheduler.start();
					}
					LOGGER.log(Level.INFO,"Job scheduler is started.");
				}
			}
			
    	} catch(Throwable t) {
    		t.printStackTrace();
    	} finally {
    	}
    }

    public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

}
