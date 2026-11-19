import ejs from "ejs";
import path from "node:path";
import { config } from "../config";
import { transporter } from "../lib/nodemailer";

type TemplateName = "forgot-password" | "password-changed" | "notification";

interface ISendEmailOptions {
  to: string;
  subject: string;
  template: TemplateName;
  data: Record<string, unknown>;
}

const TEMPLATE_DIR = path.join(process.cwd(), "src/app/templates");

// RFC 2606 reserved domains (used by demo/seed accounts) can never receive mail.
const RESERVED_DOMAIN_PATTERN = /@(?:example\.(?:com|net|org)|[^@]+\.(?:test|example|invalid|localhost))$/i;

export const sendEmail = async ({ to, subject, template, data }: ISendEmailOptions) => {
  if (RESERVED_DOMAIN_PATTERN.test(to)) return;

  const html = await ejs.renderFile(path.join(TEMPLATE_DIR, `${template}.ejs`), data);

  await transporter.sendMail({
    from: `"EstateHub" <${config.smtp_user}>`,
    to,
    subject,
    html,
  });
};

/**
 * For non-critical emails (notifications): never throws,
 * so a mail outage can't break the API request.
 */
export const sendEmailSafely = (options: ISendEmailOptions) => {
  sendEmail(options).catch(() => undefined);
};
