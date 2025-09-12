import nodemailer from "nodemailer";
import { AppError } from "./app-error.js";

/**
 * Create a test transporter using Ethereal.email
 * This is useful for development and testing
 * @returns {Promise<Object>} Nodemailer transporter
 */
const createTestTransporter = async () => {
  try {
    console.log("Error : env not found using fallback test account.");
    // Create a test account at ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using the test account
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return transporter;
  } catch (error) {
    throw new AppError("Failed to create test email transporter", 500);
  }
};

/**
 * Create a nodemailer transporter using SMTP
 * @returns {Promise<Object>} Nodemailer transporter
 */
const createTransporter = async () => {
  try {
    // Check if we have the required SMTP configuration
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      return await createTestTransporter();
    }

    const secure = process.env.EMAIL_SECURE === "true";
    const port = parseInt(process.env.EMAIL_PORT, 10);

    const config = {
      host: process.env.EMAIL_HOST,
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // If not using secure mode but using a common TLS port, add tls options
    if (!secure && (port === 587 || port === 25 || port === 2525)) {
      config.tls = {
        rejectUnauthorized: false, // Accepts self-signed certificates
        minVersion: "TLSv1.2",
      };
    }

    return nodemailer.createTransport(config);
  } catch (error) {
    // Fall back to test email account on error
    return await createTestTransporter();
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "auctioneer"}" <${process.env.EMAIL_FROM_ADDRESS || "noreply@auctioneer.com"}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html || "",
    };

    const info = await transporter.sendMail(mailOptions);

    // Only log preview URL in development environment
    if (
      process.env.NODE_ENV !== "production" &&
      info &&
      nodemailer.getTestMessageUrl
    ) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Email preview URL: ${previewUrl}`);
      }
    }

    return info;
  } catch (error) {
    // Only log minimal error information
    throw new AppError("Failed to send email", 500);
  }
};

/**
 * Send a verification email with a code
 * @param {string} email - Recipient email
 * @param {string} verificationCode - The verification code
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  const subject = "Verify Your Email Address";
  const text = `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`;
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Thank you for signing up! Please use the following code to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
                ${verificationCode}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <p>Best regards,<br>The Auctioneer Team</p>
        </div>
    `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send a password reset email with a token
 * @param {string} email - Recipient email
 * @param {string} resetToken - The reset token
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  console.log("email", email);
  const subject = "Password Reset Request";
  const text = `Your password reset code is: ${resetToken}. This code will expire in 1 hour.`;
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset. Please use the following code to reset your password:</p>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
                <a href="${resetUrl}">${resetUrl}</a>
            </div>
            <p>This code will expire in 1 hour.</p>
            <p>When resetting your password, you'll need to provide both this code and your email address.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The Fun2Plan Team</p>
        </div>
    `;

  return sendEmail({ to: email, subject, text, html });
};
export const sendForgotPasswordEmail = async (email, resetToken) => {
  const subject = "Password Reset Request";
  const text = `Your password reset code is: ${resetToken}. This code will expire in 1 hour.`;
  const html = `
          <p>You requested a password reset.</p>
          <p>Click this link to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link is valid for 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `;
  return sendEmail({ to: email, subject, text, html });
};
