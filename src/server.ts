import app from "./app";
import { config } from "./app/config";
import { startCronJobs } from "./app/lib/cron";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { logger } from "./app/utils/logger";
import { seedDemoAccounts } from "./app/utils/seed";

const PORT = Number(config.port);

const main = async () => {
  try {
    await prisma.$connect();
    logger.info("Connected to the database successfully.");

    await redisClient.connect();
    logger.info("Connected to Redis successfully.");

    // Email is not critical for the API to run, so a bad SMTP config only warns.
    transporter
      .verify()
      .then(() => logger.info("SMTP transporter is ready to send emails."))
      .catch(() => logger.error("SMTP transporter could not be verified. Emails will fail."));

    await seedDemoAccounts();

    startCronJobs();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    const shutdown = async () => {
      server.close();
      await prisma.$disconnect();
      await redisClient.quit();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("Error starting the server:", error);
    process.exit(1);
  }
};

main();
