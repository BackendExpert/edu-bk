import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import {
    verificationEmailTemplate,
    passwordResetEmailTemplate,
    welcomeEmailTemplate,
    notificationEmailTemplate,
} from "./email.template";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    private readonly transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    private readonly from = `"${process.env.PROJECT_NAME || "Application"}" <${process.env.EMAIL_USER}>`;

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                html,
            });

            this.logger.log(`Email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${to}`,
                error instanceof Error ? error.stack : String(error),
            );

            throw new InternalServerErrorException("Failed to send email");
        }
    }

    async sendVerificationEmail(
        email: string,
        name: string,
        verificationToken: string,
    ): Promise<void> {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const html = verificationEmailTemplate({
            name,
            verificationUrl,
        });

        await this.sendEmail(
            email,
            "Verify Your Email Address",
            html,
        );
    }

    async sendPasswordResetEmail(
        email: string,
        name: string,
        resetToken: string,
    ): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const html = passwordResetEmailTemplate({
            name,
            resetUrl,
        });

        await this.sendEmail(
            email,
            "Reset Your Password",
            html,
        );
    }

    async sendWelcomeEmail(
        email: string,
        name: string,
    ): Promise<void> {
        const html = welcomeEmailTemplate({
            name,
        });

        await this.sendEmail(
            email,
            "Welcome!",
            html,
        );
    }

    async sendNotificationEmail(
        email: string,
        name: string,
        title: string,
        message: string,
    ): Promise<void> {
        const html = notificationEmailTemplate({
            name,
            title,
            message,
        });

        await this.sendEmail(
            email,
            title,
            html,
        );
    }
}