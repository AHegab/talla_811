import type { ActionFunctionArgs } from '@shopify/remix-oxygen';
import { sendRestockNotification } from '~/utils/sendRestockEmail';

/**
 * API endpoint to send restock notification email
 * Called from admin dashboard when "Send Email" is clicked
 */

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, productTitle, variantTitle, productHandle } = body;

    // Validate required fields
    if (!email || !productTitle || !productHandle) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get store URL from environment or construct from request
    const storeUrl = context.env?.PUBLIC_STORE_URL ||
                     `${new URL(request.url).protocol}//${new URL(request.url).host}`;

    // Send the email
    const success = await sendRestockNotification(
      {
        customerEmail: email,
        productTitle,
        variantTitle: variantTitle || 'Default',
        productHandle,
        storeUrl,
      },
      context.env
    );

    if (!success) {
      return Response.json(
        {
          error: 'Failed to send email. Check server logs for details.',
          hint: 'Make sure SENDGRID_API_KEY or RESEND_API_KEY is set in your .env file'
        },
        { status: 500 }
      );
    }

    console.log('✅ Restock email sent to:', email);

    return Response.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error) {
    console.error('Error sending restock email:', error);
    return Response.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
