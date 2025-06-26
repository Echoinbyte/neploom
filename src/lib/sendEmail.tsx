import { ApiResponse } from "@/types/api.types";
import nodemailer from "nodemailer";

export type EmailType = "verification" | "resend" | "password-reset";

export async function sendEmail(
  email: string | undefined,
  username: string | undefined,
  verifyCode: string | undefined,
  type: EmailType = "verification"
): Promise<ApiResponse> {
  if (!email) {
    return {
      success: false,
      message: "Email address is required to send verification email",
    };
  }

  if (!username) {
    return {
      success: false,
      message: "Username is required to personalize the email",
    };
  }

  if (!verifyCode) {
    return {
      success: false,
      message: "Verification code is required to send email",
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Invalid email address format",
    };
  }

  // Validate verification code format (should be 6 digits)
  if (!/^\d{6}$/.test(verifyCode)) {
    return {
      success: false,
      message: "Invalid verification code format. Expected 6 digits",
    };
  }

  const digits = verifyCode
    .toString()
    .split("")
    .map((digit) => parseInt(digit, 10));

  // Dynamic content based on email type
  const getEmailContent = (emailType: EmailType) => {
    switch (emailType) {
      case "verification":
        return {
          subject: "NepLoom - Verify Your Email",
          greeting: `Hello, <span style="border-bottom: 2px solid #d9634f; display: inline-block;">${username}</span>`,
          message: `Thank you for registering on NepLoom via <span style="color: #ef4444; text-decoration: none;">${email}</span>! Please use the following OTP to verify your email address:`,
          buttonText: "Complete Registration",
          buttonUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/authentication/verify-email/${username}`,
        };
      case "resend":
        return {
          subject: "NepLoom - Verification Code Resent",
          greeting: `Hello again, <span style="border-bottom: 2px solid #d9634f; display: inline-block;">${username}</span>`,
          message: `We've resent your verification code as requested. Please use the following OTP to verify your email address:`,
          buttonText: "Verify Email",
          buttonUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/authentication/verify-email/${username}`,
        };
      case "password-reset":
        return {
          subject: "NepLoom - Password Reset",
          greeting: `Hello, <span style="border-bottom: 2px solid #d9634f; display: inline-block;">${username}</span>`,
          message: `You've requested to reset your password. Please use the following code to proceed with your password reset:`,
          buttonText: "Reset Password",
          buttonUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/authentication/reset-password/${username}`,
        };
      default:
        return {
          subject: "NepLoom - Verification Code",
          greeting: `Hello, <span style="border-bottom: 2px solid #d9634f; display: inline-block;">${username}</span>`,
          message: `Please use the following OTP to verify your email address:`,
          buttonText: "Verify Email",
          buttonUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/authentication/verify-email/${username}`,
        };
    }
  };

  const content = getEmailContent(type);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    });

    const htmlResponse = `
      <body style="font-family: sans-serif; background-color: #f7f7f7; overflow-x: hidden; margin: 0; padding: 0; color: #333; display: flex; justify-content: center; align-items: center;">
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 800px; overflow-x: hidden; line-height: 2; width: 90%; min-width: 280px; margin: 50px auto; padding: 20px; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
          <div style="margin: 50px auto; width: 100%; max-width: 600px; padding: 20px 0;">
            <div style="user-select: none; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
              <a href="http://localhost:3000" style="user-select: none; font-size: 1.8em; color: #ef4444; text-decoration: none; font-weight: 700;">NepLoom</a>
            </div>
            <p style="user-select: none; font-size: 2em; display: inline-block; margin-bottom: 20px;">${
              content.greeting
            }</p>
            <p style="user-select: none; font-size: 1.1em; margin-bottom: 30px; line-height: 1.6;">${
              content.message
            }</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 8px; border-radius: 12px; background-color: #f8f9fa; width: 45px; height: 45px; line-height: 45px; border: 2px solid #e9ecef; margin: 0 3px; font-size: 26px; font-weight: 600; color: #495057;">${
                digits[0]
              }</span><span style="display: inline-block; padding: 8px; border-radius: 12px; background-color: #f8f9fa; width: 45px; height: 45px; line-height: 45px; border: 2px solid #e9ecef; margin: 0 3px; font-size: 26px; font-weight: 600; color: #495057;">${
      digits[1]
    }</span><span style="display: inline-block; padding: 8px; border-radius: 12px; background-color: #f8f9fa; width: 45px; height: 45px; line-height: 45px; border: 2px solid #e9ecef; margin: 0 3px; font-size: 26px; font-weight: 600; color: #495057;">${
      digits[2]
    }</span><span style="display: inline-block; padding: 8px; border-radius: 12px; background-color: #f8f9fa; width: 45px; height: 45px; line-height: 45px; border: 2px solid #e9ecef; margin: 0 3px; font-size: 26px; font-weight: 600; color: #495057;">${
      digits[3]
    }</span><span style="display: inline-block; padding: 8px; border-radius: 12px; background-color: #f8f9fa; width: 45px; height: 45px; line-height: 45px; border: 2px solid #e9ecef; margin: 0 3px; font-size: 26px; font-weight: 600; color: #495057;">${
      digits[4]
    }</span><span style="display: inline-block; padding: 8px; border-radius: 12px; background-color: #f8f9fa; width: 45px; height: 45px; line-height: 45px; border: 2px solid #e9ecef; margin: 0 3px; font-size: 26px; font-weight: 600; color: #495057;">${
      digits[5]
    }</span>
            </div>
            <div style="text-align: center; margin: 40px 0 30px 0;">
              <a href="${
                content.buttonUrl
              }" style="display: inline-block; padding: 15px 30px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: none; cursor: pointer; transition: background-color 0.3s ease;">${
      content.buttonText
    }</a>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 2px solid #ef4444;">
              <p style="user-select: none; font-size: 0.9em; margin: 0; color: #6c757d; line-height: 1.4;">
                <strong>Security Note:</strong> This code will expire in 10 minutes. If you didn't request this email, please ignore it or contact our support team.
              </p>
            </div>
            <p style="user-select: none; font-size: 1em; color: #ef4444; margin-top: 30px;">Warm Regards,</p>
            <p style="user-select: none; font-size: 1em; color: #ef4444; font-weight: 600;">The NepLoom Team</p>
            <hr style="user-select: none; border: none; border-top: 1px solid #eee; margin: 40px 0 20px 0;" />
            <div style="user-select: none; text-align: center; padding: 20px 0; color: #aaa; font-size: 0.8em; line-height: 1.4; font-weight: 300;">
              <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} NepLoom. All rights reserved.</p>
              <p style="margin: 5px 0;">Rupandehi, Nepal</p>
              <p style="margin: 5px 0;">
                <a href="http://localhost:3000/privacy" style="color: #ef4444; text-decoration: none;">Privacy Policy</a> | 
                <a href="http://localhost:3000/terms" style="color: #ef4444; text-decoration: none;">Terms of Service</a> | 
                <a href="http://localhost:3000/support" style="color: #ef4444; text-decoration: none;">Support</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      `;

    const mailOptions = {
      name: "NepLoom",
      address: process.env.USER,
      to: email,
      subject: content.subject,
      text: `Verification Code from NepLoom: ${verifyCode}`,
      html: htmlResponse,
    };

    try {
      await transporter.sendMail(mailOptions);
      return {
        success: true,
        message: "Verification email sent successfully.",
      };
    } catch {
      return { success: false, message: "Failed to send verification email." };
    }
  } catch {
    return { success: false, message: "Failed to set up email transporter." };
  }
}
