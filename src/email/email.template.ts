interface VerificationEmailTemplateProps {
    name: string;
    verificationUrl: string;
}

interface PasswordResetEmailTemplateProps {
    name: string;
    resetUrl: string;
}

interface WelcomeEmailTemplateProps {
    name: string;
}

interface NotificationEmailTemplateProps {
    name: string;
    title: string;
    message: string;
}

const emailLayout = (
    title: string,
    content: string,
): string => {
    const projectName = process.env.PROJECT_NAME || "Application";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />
    <title>${title}</title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    "
>
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="padding: 40px 15px;"
    >
        <tr>
            <td align="center">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            style="
                                padding: 28px;
                                text-align: center;
                                background-color: #111827;
                                color: #ffffff;
                            "
                        >
                            <h1
                                style="
                                    margin: 0;
                                    font-size: 24px;
                                "
                            >
                                ${projectName}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td
                            style="
                                padding: 40px 35px;
                            "
                        >
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="
                                padding: 20px 30px;
                                text-align: center;
                                background-color: #f9fafb;
                                color: #6b7280;
                                font-size: 13px;
                            "
                        >
                            <p style="margin: 0;">
                                This is an automated email.
                                Please do not reply to this message.
                            </p>

                            <p style="margin: 8px 0 0;">
                                © ${new Date().getFullYear()}
                                ${projectName}
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>
`;
};


export const verificationEmailTemplate = ({
    name,
    verificationUrl,
}: VerificationEmailTemplateProps): string => {
    return emailLayout(
        "Verify Your Email",
        `
            <h2
                style="
                    margin-top: 0;
                    color: #111827;
                "
            >
                Verify your email address
            </h2>

            <p>
                Hello ${name},
            </p>

            <p>
                Thank you for creating an account.
                Please verify your email address by clicking
                the button below.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a
                    href="${verificationUrl}"
                    style="
                        display: inline-block;
                        padding: 13px 24px;
                        background-color: #111827;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    Verify Email
                </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                If you did not create this account, you can safely
                ignore this email.
            </p>
        `,
    );
};


export const passwordResetEmailTemplate = ({
    name,
    resetUrl,
}: PasswordResetEmailTemplateProps): string => {
    return emailLayout(
        "Reset Your Password",
        `
            <h2
                style="
                    margin-top: 0;
                    color: #111827;
                "
            >
                Reset your password
            </h2>

            <p>
                Hello ${name},
            </p>

            <p>
                We received a request to reset your password.
                Click the button below to create a new password.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        padding: 13px 24px;
                        background-color: #111827;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    Reset Password
                </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <p style="font-size: 13px; color: #9ca3af;">
                For security reasons, this link should only be
                used by you.
            </p>
        `,
    );
};


export const welcomeEmailTemplate = ({
    name,
}: WelcomeEmailTemplateProps): string => {
    return emailLayout(
        "Welcome",
        `
            <h2
                style="
                    margin-top: 0;
                    color: #111827;
                "
            >
                Welcome, ${name}! 🎉
            </h2>

            <p>
                Your account has been successfully created.
            </p>

            <p>
                We're happy to have you with us.
                You can now sign in and start using
                the application.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a
                    href="${process.env.FRONTEND_URL}"
                    style="
                        display: inline-block;
                        padding: 13px 24px;
                        background-color: #111827;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    Get Started
                </a>
            </div>
        `,
    );
};

export const notificationEmailTemplate = ({
    name,
    title,
    message,
}: NotificationEmailTemplateProps): string => {
    return emailLayout(
        title,
        `
            <h2
                style="
                    margin-top: 0;
                    color: #111827;
                "
            >
                ${title}
            </h2>

            <p>
                Hello ${name},
            </p>

            <p>
                ${message}
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a
                    href="${process.env.FRONTEND_URL}"
                    style="
                        display: inline-block;
                        padding: 13px 24px;
                        background-color: #111827;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    View Application
                </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                You are receiving this email because there is a new
                notification related to your account.
            </p>
        `,
    );
};