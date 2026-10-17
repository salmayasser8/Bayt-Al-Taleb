import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface OtpMailer {
  sendOtpCode(to: string, code: string, purpose: 'login' | 'enable'): Promise<void>;
}

export class EmailService implements OtpMailer {
  private readonly transporter: Transporter | null;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly user: string,
    private readonly pass: string,
    private readonly from: string,
  ) {
    this.transporter = this.host
      ? nodemailer.createTransport({
          host: this.host,
          port: this.port,
          secure: this.port === 465,
          auth: this.user ? { user: this.user, pass: this.pass } : undefined,
        })
      : null;
  }

  async sendOtpCode(to: string, code: string, purpose: 'login' | 'enable'): Promise<void> {
  const title = purpose === 'login' ? 'كود تسجيل الدخول' : 'كود تفعيل التحقق بخطوتين';

  const html = `
  <div dir="rtl" style="font-family: Arial, sans-serif; background:#f4f6fb; padding:30px;">
    <div style="max-width:480px; margin:auto; background:#ffffff; border-radius:16px; padding:32px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <h2 style="color:#1a5fb4; text-align:center; margin:0 0 8px;">بيت الطالب</h2>
      <p style="color:#555; text-align:center; margin:0 0 24px;">${title}</p>
      <p style="color:#333; text-align:center;">استخدم الكود التالي:</p>
      <div style="background:#f0f4ff; border:2px dashed #1a5fb4; border-radius:12px; padding:16px; text-align:center; margin:16px 0;">
        <span style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#1a5fb4;">${code}</span>
      </div>
      <p style="color:#999; font-size:13px; text-align:center;">هذا الكود صالح لمدة 10 دقائق فقط</p>
      <p style="color:#999; font-size:13px; text-align:center;">إذا لم تطلب هذا الكود، تجاهل هذه الرسالة</p>
    </div>
  </div>`;

  if (!this.transporter) {
    console.info(`[OTP] CONSOLE MODE — code ${code} for ${to} (${purpose})`);
    return;
  }

  console.info(`[OTP] SMTP MODE — sending real email to ${to} (${purpose})`);
  await this.transporter.sendMail({
    from: this.from,
    to,
    subject: title,
    text: `كودك هو: ${code} — صالح لمدة 10 دقائق.`,
    html,   // <-- designed version, email apps use this instead of text
  });
}
}
