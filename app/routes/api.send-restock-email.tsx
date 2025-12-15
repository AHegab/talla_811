import type { ActionFunctionArgs } from '@shopify/remix-oxygen';
import { sendRestockNotification } from '~/utils/sendRestockEmail';
import { logError, isValidEmail, sanitizeInput, createErrorResponse, withTimeout, validateEnv } from '~/utils/errorHandling';

/**
 * API endpoint to send restock notification email
 * Called from admin dashboard when "Send Email" is clicked
 */

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Parse request body with timeout
    let body: any;
    try {
      body = await withTimeout(
        request.json(),
        5000,
        'Request timeout while parsing JSON'
      );
    } catch (parseError) {
      logError(parseError, { action: 'api.send-restock-email', step: 'parse-body' });
      return createErrorResponse('Invalid JSON request body', 400);
    }

    const {
      email: rawEmail,
      productTitle: rawProductTitle,
      variantTitle: rawVariantTitle,
      productHandle: rawProductHandle
    } = body;

    // Validate required fields
    if (!rawEmail) {
      logError(new Error('Missing email'), { action: 'api.send-restock-email' });
      return createErrorResponse('Email is required', 400);
    }

    if (!rawProductTitle || !rawProductHandle) {
      logError(new Error('Missing required fields'), {
        action: 'api.send-restock-email',
        fields: { rawProductTitle, rawProductHandle }
      });
      return createErrorResponse('Missing required fields: productTitle, productHandle', 400);
    }

    // Validate and sanitize email
    const email = sanitizeInput(String(rawEmail).trim().toLowerCase());
    if (!isValidEmail(email)) {
      logError(new Error('Invalid email format'), { action: 'api.send-restock-email', email: rawEmail });
      return createErrorResponse('Invalid email address format', 400);
    }

    // Sanitize string inputs
    const productTitle = sanitizeInput(String(rawProductTitle));
    const variantTitle = rawVariantTitle ? sanitizeInput(String(rawVariantTitle)) : 'Default';
    const productHandle = sanitizeInput(String(rawProductHandle));

    // Validate productHandle format (should be URL-safe)
    if (!/^[a-z0-9-]+$/.test(productHandle)) {
      logError(new Error('Invalid productHandle format'), { action: 'api.send-restock-email', productHandle });
      return createErrorResponse('Invalid productHandle: must contain only lowercase letters, numbers, and hyphens', 400);
    }

    // Get store URL from environment or construct from request
    let storeUrl: string;
    try {
      storeUrl = (context.env as any)?.PUBLIC_STORE_URL ||
                 `${new URL(request.url).protocol}//${new URL(request.url).host}`;
    } catch (urlError) {
      logError(urlError, { action: 'api.send-restock-email', step: 'get-store-url' });
      return createErrorResponse('Failed to determine store URL', 500, urlError);
    }

    // Check if email service is configured
    const env = context.env as any;
    if (!env?.SENDGRID_API_KEY && !env?.RESEND_API_KEY) {
      logError(new Error('No email service configured'), { action: 'api.send-restock-email' });
      return createErrorResponse(
        'Email service not configured. Please set SENDGRID_API_KEY or RESEND_API_KEY environment variable.',
        503
      );
    }

    // Send the email with timeout
    let success: boolean;
    try {
      success = await withTimeout(
        sendRestockNotification(
          {
            customerEmail: email,
            productTitle,
            variantTitle,
            productHandle,
            storeUrl,
          },
          context.env
        ),
        30000, // 30 second timeout for email sending
        'Email sending operation timed out'
      );
    } catch (emailError) {
      logError(emailError, {
        action: 'api.send-restock-email',
        step: 'send-email',
        email,
        productHandle
      });
      return createErrorResponse(
        'Failed to send email. The email service may be unavailable.',
        500,
        emailError
      );
    }

    if (!success) {
      logError(new Error('Email sending returned false'), {
        action: 'api.send-restock-email',
        email,
        productHandle
      });
      return createErrorResponse(
        'Failed to send email. Check server logs for details.',
        500,
        { hint: 'Make sure SENDGRID_API_KEY or RESEND_API_KEY is set in your .env file' }
      );
    }

    return Response.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error) {
    logError(error, { action: 'api.send-restock-email', step: 'unexpected-error' });
    return createErrorResponse(
      'An unexpected error occurred while sending email',
      500,
      error
    );
  }
}
