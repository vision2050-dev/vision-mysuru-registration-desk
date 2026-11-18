import nodemailer from 'nodemailer';
import { StudentAttendee } from '@/types';
import { EVENT_DETAILS } from './constants';
import { generateQRCodeDataURL } from './qrcode';

export interface SendEmailResult {
  success: boolean;
  mode: 'smtp' | 'resend' | 'simulated';
  messageId?: string;
  error?: string;
  previewHtml?: string;
}

/**
 * Builds the official Vision Mysuru 2050 branded HTML invitation email.
 */
export function buildInvitationEmailHtml(
  attendee: StudentAttendee,
  qrDataUrl: string,
  passUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Official E-Pass: ${EVENT_DETAILS.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f2ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f140c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f6f2ea;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" max-width="620px" style="max-width:620px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(31,20,12,0.12);box-shadow:0 10px 30px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Royal Crimson Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #8f1b1b 0%, #6e1212 100%);padding:32px 30px;text-align:center;border-bottom:4px solid #b07c12;">
              <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fce79f;margin-bottom:8px;">
                OFFICIAL INVITATION & ENTRY E-PASS
              </div>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                ${EVENT_DETAILS.title}
              </h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#fce79f;font-weight:500;">
                ${EVENT_DETAILS.subtitle}
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 30px 24px 30px;line-height:1.6;">
              <p style="font-size:16px;margin:0 0 16px 0;color:#1f140c;">
                Dear <strong>${attendee.name}</strong>,
              </p>
              
              <p style="font-size:14px;color:#4a3f35;margin:0 0 20px 0;">
                We are thrilled to invite you as an official delegate to <strong>Vision Mysuru 2050</strong>. You are part of a landmark youth and citizen think-tank dedicated to drafting a 25-year sustainable blueprint for Mysuru.
              </p>

              <!-- Digital E-Pass Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;background-color:#fffefc;border:2px dashed #b07c12;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="background-color:#fef8eb;padding:12px 20px;border-bottom:1px solid #fae4b5;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:12px;font-weight:700;color:#8f1b1b;letter-spacing:1px;text-transform:uppercase;">
                          CAMPUS ADMISSION PASS
                        </td>
                        <td align="right" style="font-size:12px;font-weight:600;color:#b07c12;">
                          ${attendee.registrationType}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 20px;text-align:center;">
                    <!-- QR Code Display -->
                    <div style="display:inline-block;padding:12px;background:#ffffff;border:1px solid #ecdcc4;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
                      <img src="${qrDataUrl}" alt="Scannable QR E-Pass" width="180" height="180" style="display:block;margin:0 auto;" />
                    </div>

                    <div style="margin-top:14px;">
                      <div style="font-size:12px;color:#6b5b4d;text-transform:uppercase;letter-spacing:1px;">Pass Verification Code</div>
                      <div style="font-size:22px;font-weight:800;color:#8f1b1b;letter-spacing:2px;margin-top:2px;">
                        ${attendee.passCode}
                      </div>
                    </div>

                    <!-- Attendee Details Grid -->
                    <table role="presentation" width="100%" style="margin-top:20px;border-top:1px solid #f0e6d6;padding-top:16px;text-align:left;font-size:13px;" cellspacing="0" cellpadding="4" border="0">
                      <tr>
                        <td style="color:#6b5b4d;width:35%;"><strong>Delegate Name:</strong></td>
                        <td style="color:#1f140c;font-weight:600;">${attendee.name}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b5b4d;"><strong>Institution / College:</strong></td>
                        <td style="color:#1f140c;">${attendee.college}</td>
                      </tr>
                      ${attendee.usn ? `<tr><td style="color:#6b5b4d;"><strong>USN / Roll No:</strong></td><td style="color:#1f140c;">${attendee.usn}</td></tr>` : ''}
                      <tr>
                        <td style="color:#6b5b4d;"><strong>Event Date:</strong></td>
                        <td style="color:#1f140c;font-weight:600;">${EVENT_DETAILS.date}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b5b4d;"><strong>Reporting Time:</strong></td>
                        <td style="color:#8f1b1b;font-weight:700;">${EVENT_DETAILS.reportingTime}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b5b4d;vertical-align:top;"><strong>Venue:</strong></td>
                        <td style="color:#1f140c;">
                          <strong>${EVENT_DETAILS.venue}</strong><br/>
                          <span style="font-size:12px;color:#6b5b4d;">${EVENT_DETAILS.venueDetails}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <div style="text-align:center;margin:28px 0 20px 0;">
                <a href="${passUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #8f1b1b 0%, #a12626 100%);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;box-shadow:0 4px 14px rgba(143,27,27,0.3);">
                  View & Save Digital E-Pass
                </a>
              </div>

              <!-- Important Check-in Instructions -->
              <div style="background-color:#f9f6f0;border-left:4px solid #b07c12;padding:14px 18px;border-radius:0 8px 8px 0;margin:24px 0;font-size:13px;line-height:1.6;color:#4a3f35;">
                <strong style="color:#1f140c;">Important Registration Desk Instructions:</strong>
                <ul style="margin:6px 0 0 0;padding-left:18px;">
                  <li>Present this <strong>QR E-Pass</strong> (on your smartphone or printed) at the entrance registration desk upon arrival.</li>
                  <li>Please carry a valid College Student ID card for verification.</li>
                  <li>Breakfast, registration kits, and delegate badges will be provided at the desk from 8:30 AM.</li>
                </ul>
              </div>

              <p style="font-size:14px;color:#4a3f35;margin-top:20px;">
                We look forward to welcoming you to the summit and hearing your visionary ideas for Mysuru!
              </p>

              <p style="font-size:14px;color:#1f140c;margin:24px 0 0 0;line-height:1.4;">
                Warm regards,<br/>
                <strong>Vision Mysuru 2050 Secretariat</strong><br/>
                <span style="font-size:12px;color:#6b5b4d;">${EVENT_DETAILS.organizer}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4efe6;padding:20px 30px;text-align:center;font-size:12px;color:#6b5b4d;border-top:1px solid rgba(31,20,12,0.08);">
              <p style="margin:0 0 6px 0;">
                Questions or travel assistance? Email us at
                <a href="mailto:${EVENT_DETAILS.contactEmail}" style="color:#8f1b1b;text-decoration:none;font-weight:600;">
                  ${EVENT_DETAILS.contactEmail}
                </a>
                or call ${EVENT_DETAILS.contactPhone}
              </p>
              <p style="margin:0;font-size:11px;color:#8a7a6c;">
                Official Portal: <a href="${EVENT_DETAILS.website}" style="color:#8f1b1b;text-decoration:none;">visionmysuru2050.in</a> | Mysuru, Karnataka
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
}

/**
 * Sends or simulates the e-pass invitation email.
 */
export async function sendEPassEmail(
  attendee: StudentAttendee,
  originUrl: string = 'http://localhost:3000'
): Promise<SendEmailResult> {
  const passUrl = `${originUrl}/pass/${attendee.passCode}`;
  const qrDataUrl = await generateQRCodeDataURL(passUrl);

  const htmlContent = buildInvitationEmailHtml(attendee, qrDataUrl, passUrl);

  // 1. Check if SMTP credentials exist (User's Gmail or institutional relay)
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Vision Mysuru 2050 Registration" <${emailUser}>`,
        to: attendee.email,
        subject: `Your Official E-Pass: Vision Mysuru 2050 Summit (${attendee.passCode})`,
        html: htmlContent,
      });

      return {
        success: true,
        mode: 'smtp',
        messageId: info.messageId,
        previewHtml: htmlContent,
      };
    } catch (err: any) {
      console.error('SMTP sending failed, falling back to simulated mode:', err);
      return {
        success: false,
        mode: 'smtp',
        error: err.message || 'SMTP delivery failed',
        previewHtml: htmlContent,
      };
    }
  }

  // 2. Simulated Mode (ideal for demo, local testing, or when API keys aren't added yet)
  console.log(`[Email Simulator] Generated E-Pass Invitation for ${attendee.name} <${attendee.email}>`);
  return {
    success: true,
    mode: 'simulated',
    messageId: `sim_${Date.now()}_${attendee.id}`,
    previewHtml: htmlContent,
  };
}
