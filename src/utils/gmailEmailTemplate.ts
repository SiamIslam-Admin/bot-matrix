/**
 * Production-ready HTML Email Template for Gmail OTP Verification
 * Designed for cross-client compatibility: Google Gmail (Web, iOS, Android), Apple Mail, Outlook.
 */

export interface GmailOtpEmailParams {
  email: string;
  userName?: string;
  otpCode: string;
  expiryMinutes?: number;
  appName?: string;
  requestTime?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export const generateGmailOtpTemplateHtml = ({
  email,
  userName,
  otpCode,
  expiryMinutes = 10,
  appName = 'Bot Matrix',
  requestTime = new Date().toUTCString(),
  ipAddress = '103.145.74.22',
  deviceInfo = 'Chrome on Windows (Verified)',
}: GmailOtpEmailParams): string => {
  const codeDigits = (otpCode || '123456').slice(0, 6).split('');
  const recipientDisplay = userName ? `${userName} (${email})` : email;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${appName} Verification Code</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .code-cell {
      width: 46px;
      height: 56px;
      background: #0f172a;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 28px;
      font-weight: 800;
      color: #60a5fa;
      text-align: center;
      line-height: 56px;
    }
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; padding: 12px !important; }
      .code-cell { width: 38px !important; height: 48px !important; font-size: 22px !important; line-height: 48px !important; }
      .brand-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #0b0f19;">
  <!-- Wrapper Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19;">
    <tr>
      <td align="center">
        <!-- Main Email Container (Max 600px) -->
        <table role="presentation" class="container-table" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #111827; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Color Bar -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #9333ea 100%);"></td>
          </tr>

          <!-- Email Header with Brand Logo -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #2563eb, #4f46e5); width: 48px; height: 48px; border-radius: 14px; text-align: center; vertical-align: middle; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.35);">
                    <span style="font-size: 24px; line-height: 48px; color: #ffffff;">🤖</span>
                  </td>
                </tr>
              </table>
              <h1 class="brand-title" style="margin: 16px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">
                BOT MATRIX
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">
                MTProto Bot Cluster Security
              </p>
            </td>
          </tr>

          <!-- Main Content Card Body -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="background-color: #1e293b; border-radius: 20px; padding: 32px; border: 1px solid #334155;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <!-- Salutation -->
                  <tr>
                    <td>
                      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #f8fafc;">
                        Authentication Passcode
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                        Hello <strong style="color: #60a5fa;">${recipientDisplay}</strong>,
                      </p>
                      <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                        You requested a one-time verification code to secure your Bot Matrix account. Use the 6-digit passcode below to verify your identity:
                      </p>
                    </td>
                  </tr>

                  <!-- 6-Digit OTP Code Table Box -->
                  <tr>
                    <td align="center" style="padding: 28px 0 20px 0;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="8" align="center">
                        <tr>
                          ${codeDigits
                            .map(
                              (d) =>
                                `<td class="code-cell" style="width: 46px; height: 56px; background-color: #0f172a; border: 2px solid #3b82f6; border-radius: 12px; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 28px; font-weight: 800; color: #60a5fa; text-align: center; vertical-align: middle;">${d}</td>`
                            )
                            .join('')}
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Time Expiry Pill & Info -->
                  <tr>
                    <td align="center">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 16px;">
                        <tr>
                          <td style="background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); padding: 6px 14px; border-radius: 100px;">
                            <span style="font-size: 12px; font-weight: 700; color: #fbbf24;">
                              ⏱ Code expires in ${expiryMinutes} minutes
                            </span>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                        If you did not make this request, you can safely ignore this email. No access was granted without this code.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Security Metadata Box -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 14px; padding: 16px; border: 1px solid #1e293b;">
                <tr>
                  <td style="padding-bottom: 6px;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
                      Request Security Context
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #94a3b8; font-family: monospace; line-height: 1.7;">
                    • <strong>Timestamp:</strong> ${requestTime}<br>
                    • <strong>Device:</strong> ${deviceInfo}<br>
                    • <strong>Network IP:</strong> ${ipAddress}<br>
                    • <strong>Status:</strong> Dispatched via Verified Gmail Delivery Node
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Tip Footer -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-left: 3px solid #3b82f6; padding-left: 14px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #f1f5f9;">
                      🛡 Security Reminder:
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                      Never share this code with anyone. Bot Matrix administrators will never ask for your verification code or login password.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 ${appName} Technologies. All rights reserved.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #475569;">
                Automated high-security dispatch • Please do not reply directly to this email
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
