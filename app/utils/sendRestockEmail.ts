/**
 * Send restock notification email to customer
 *
 * This is a helper function to send emails when products are back in stock.
 * Configure your email service provider below.
 */

interface RestockEmailParams {
  customerEmail: string;
  productTitle: string;
  variantTitle: string;
  productHandle: string;
  storeUrl: string;
}

/**
 * Send email using SendGrid
 */
export async function sendRestockEmailViaSendGrid(
  params: RestockEmailParams,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: params.customerEmail }],
            subject: `${params.productTitle} is back in stock! 🎉`,
          },
        ],
        from: {
          email: 'support@talla.online', // Change this to your verified sender
          name: 'TALLA',
        },
        content: [
          {
            type: 'text/html',
            value: generateEmailHTML(params),
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send email using Resend (resend.com)
 */
export async function sendRestockEmailViaResend(
  params: RestockEmailParams,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TALLA <noreply@yourdomain.com>', // Change to your domain
        to: params.customerEmail,
        subject: `${params.productTitle} is back in stock! 🎉`,
        html: generateEmailHTML(params),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(params: RestockEmailParams): string {
  const productUrl = `${params.storeUrl}/products/${params.productHandle}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Back in Stock</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1f191a; padding: 40px 40px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 32px; margin: 0; letter-spacing: 0.05em;">TALLA</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1f191a; font-size: 24px; margin: 0 0 20px 0;">Good News! 🎉</h2>

                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    The item you requested is now back in stock and ready to order!
                  </p>

                  <div style="background-color: #f9fafb; border-left: 4px solid #1f191a; padding: 20px; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Product</p>
                    <p style="color: #1f191a; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">${params.productTitle}</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">${params.variantTitle}</p>
                  </div>

                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    Don't wait too long – popular items sell out quickly!
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${productUrl}" style="display: inline-block; background-color: #1f191a; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; letter-spacing: 0.05em;">
                          SHOP NOW
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                    Thank you for shopping with TALLA
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    You received this email because you requested to be notified when this item was back in stock.
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
 * Main function to send restock notification
 * Automatically picks the configured email service
 */
export async function sendRestockNotification(
  params: RestockEmailParams,
  env?: any
): Promise<boolean> {
  // Try SendGrid first
  if (env?.SENDGRID_API_KEY) {
    return sendRestockEmailViaSendGrid(params, env.SENDGRID_API_KEY);
  }

  // Try Resend
  if (env?.RESEND_API_KEY) {
    return sendRestockEmailViaResend(params, env.RESEND_API_KEY);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('No email service configured. Set SENDGRID_API_KEY or RESEND_API_KEY in .env');
  }
  return false;
}
