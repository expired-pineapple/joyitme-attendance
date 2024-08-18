const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const prisma = require('./db'); // Import the shared database connection

const app = express();

// API endpoint to schedule the cron job
app.post('/schedule-cron', async (req: { body: { startDate: any; endDate: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
  const { startDate, endDate } = req.body;

  // Schedule the cron job with the provided start and end dates
  scheduleCronJob(new Date(startDate), new Date(endDate));

  res.status(200).json({ message: 'Cron job scheduled successfully' });
});

// Function to schedule the cron job
function scheduleCronJob(startDate: Date, endDate:Date) {
  // Calculate the interval between start and end dates (e.g., every 2 weeks)
  const interval = calculateInterval(startDate, endDate);

  // Schedule the cron job to run at the calculated interval
  const job = cron.schedule(interval, async () => {
    try {
      // Call your existing POST endpoint for generating payroll periods
      const response = await axios.post('http://your-next-app.com/api/generate-payroll', {
        startDate,
        endDate,
        // Include any other necessary data
      });

      console.log(response.data);
    } catch (error) {
      console.error('Failed to generate payroll period:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Los_Angeles'
  });

  job.start();
}

function calculateInterval(startDate: Date, endDate: Date) {
    const oneDay = 1000 * 60 * 60 * 24;
    // @ts-ignore
    const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay));
  
    let interval;
    if (diffDays <= 14) {
      // If the difference is 14 days or less, schedule the job to run daily
      interval = '0 0 * * *'; // Run at midnight every day
    } else if (diffDays > 14 && diffDays <= 45) {
      // If the difference is between 15 and 45 days, schedule the job to run every 3 days
      interval = '0 0 */3 * *'; // Run at midnight every 3 days
    } else {
      // If the difference is more than 45 days, schedule the job to run every 7 days
      interval = '0 0 * * 0'; // Run at midnight every Sunday
    }
  
    return interval;
  }

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});