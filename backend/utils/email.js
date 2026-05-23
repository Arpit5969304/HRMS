import nodemailer from "nodemailer";

const parseBooleanEnv = (value = "") =>
  ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());

export const isEmailConfigured = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM?.trim();

  return Boolean(host && port && user && pass && from);
};

export const isLoginOtpEnabled = () => {
  const configuredValue = process.env.LOGIN_OTP_ENABLED;

  if (configuredValue == null || configuredValue.trim() === "") {
    return isEmailConfigured();
  }

  return parseBooleanEnv(configuredValue);
};

const getEmailConfig = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM?.trim();

  if (!host || !port || !user || !pass || !from) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM.",
    );
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
  };
};

const getAppName = () => process.env.APP_NAME?.trim() || "HRMS";

export const sendOtpEmail = async ({
  to,
  firstName,
  otp,
  purpose = "login",
  expiryMinutes = 10,
}) => {
  const { host, port, user, pass, from, secure } = getEmailConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const appName = getAppName();
  const recipientName = firstName?.trim() || "there";
  const isPasswordReset = purpose === "passwordReset";
  const subject = isPasswordReset
    ? `${appName} password reset OTP`
    : `${appName} login OTP`;
  const intro = isPasswordReset
    ? "Use the one-time password below to reset your HRMS password."
    : "Use the one-time password below to finish signing in to your HRMS account.";
  const action = isPasswordReset ? "reset your password" : "complete login";

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: `Hi ${recipientName}, ${intro} Your OTP is ${otp}. It expires in ${expiryMinutes} minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #14213d; line-height: 1.6;">
          <p>Hi ${recipientName},</p>
          <p>${intro}</p>
          <div style="margin: 24px 0; text-align: center;">
            <span style="display: inline-block; padding: 14px 24px; border-radius: 14px; background: #eef4ff; color: #155eef; font-size: 28px; font-weight: 700; letter-spacing: 8px;">
              ${otp}
            </span>
          </div>
          <p>This code will expire in ${expiryMinutes} minutes.</p>
          <p>If you did not request to ${action}, you can safely ignore this email.</p>
          <p>Thanks,<br />${appName}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("OTP EMAIL ERROR:", error);
    throw new Error(
      "Unable to send OTP email. Check the email service configuration.",
    );
  }
};
