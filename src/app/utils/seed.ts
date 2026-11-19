import bcrypt from "bcrypt";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { config } from "../config";
import { prisma } from "../lib/prisma";
import { logger } from "./logger";

interface IDemoAccount {
  role: Role;
  name?: string;
  email?: string;
  password?: string;
}

const demoAccounts: IDemoAccount[] = [
  {
    role: Role.ADMIN,
    name: config.demo_admin_name,
    email: config.demo_admin_email,
    password: config.demo_admin_password,
  },
  {
    role: Role.AGENT,
    name: config.demo_agent_name,
    email: config.demo_agent_email,
    password: config.demo_agent_password,
  },
  {
    role: Role.USER,
    name: config.demo_user_name,
    email: config.demo_user_email,
    password: config.demo_user_password,
  },
];

/**
 * Idempotent: creates one demo account per role if it doesn't exist yet.
 * Runs on every server start (same approach as the reference project).
 */
export const seedDemoAccounts = async () => {
  for (const account of demoAccounts) {
    const { role, name, email, password } = account;

    if (!name || !email || !password) {
      logger.error(`Demo ${role} name, email or password missing in env file`);
      continue;
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) continue;

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: UserStatus.ACTIVE,
        phone: role === Role.AGENT ? "01711223344" : undefined,
        ...(role === Role.AGENT && {
          agentProfile: {
            create: {
              agencyName: "Hasan Properties Ltd.",
              licenseNumber: "REHAB-DHK-2019-0412",
              bio: "Residential specialist covering Gulshan, Banani and Bashundhara with 9 years of experience helping families buy and rent apartments in Dhaka.",
              experienceYears: 9,
              serviceAreas: ["Gulshan", "Banani", "Bashundhara R/A", "Baridhara"],
              isVerified: true,
            },
          },
        }),
      },
    });

    logger.info(`Demo ${role} account created: ${email}`);
  }
};
