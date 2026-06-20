import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendInviteEmail(email: string, inviteLink: string, cohortName: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@skillforge.app';

    const subject = `Welcome to SkillForge - You've been enrolled in ${cohortName}`;
    const textContent = `Hello! You have been enrolled in the cohort "${cohortName}" on SkillForge.\n\nTo accept this invitation and set up your student profile, please register using the following link:\n${inviteLink}\n\nHappy coding!\n- The SkillForge Team`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px;">
        <h2 style="color: #00B4D8;">Welcome to SkillForge!</h2>
        <p>Hello!</p>
        <p>You have been bulk-enrolled into the cohort <strong>"${cohortName}"</strong> on SkillForge.</p>
        <p>To accept your invitation, activate your account, and set up your student profile, please click the button below to register:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${inviteLink}" style="background-color: #00B4D8; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Activate Account & Register
          </a>
        </div>
        <p style="font-size: 12px; color: #94A3B8;">If the button above does not work, copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #94A3B8; word-break: break-all;">${inviteLink}</p>
        <hr style="border: 0; border-top: 1px solid #e1e8ed; margin: 20px 0;" />
        <p style="font-size: 14px; color: #475569;">Happy coding!<br/>- The SkillForge Team</p>
      </div>
    `;

    this.logger.log(`[EMAIL SEND] To: ${email} | Subject: ${subject}`);
    this.logger.log(`[EMAIL SEND] Activation Link: ${inviteLink}`);

    if (!apiKey) {
      this.logger.log(`[EMAIL MOCK] Resend API key missing. Logged activation email details above.`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        this.logger.error(`Resend API Error: ${JSON.stringify(data)}`);
        return { success: false, error: data };
      }

      this.logger.log(`Email sent successfully via Resend. ID: ${data.id}`);
      return { success: true, id: data.id };
    } catch (err) {
      this.logger.error(`Failed to send email via Resend: ${err}`);
      return { success: false, error: err };
    }
  }
}
