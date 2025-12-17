import type { ActionFunctionArgs, LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { addNotification } from '~/utils/notificationStorage.server';
import { logError, isValidEmail, sanitizeInput, createErrorResponse, withTimeout } from '~/utils/errorHandling';

interface NotificationRequest {
  email: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
}

// Handle GET requests
export async function loader({ request }: LoaderFunctionArgs) {
  return Response.json(
    { error: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Parse request body with error handling
    let body: any;
    try {
      body = await withTimeout(
        request.json(),
        5000,
        'Request timeout while parsing JSON'
      );
    } catch (parseError) {
      logError(parseError, { action: 'api.restock-notify', step: 'parse-body' });
      return createErrorResponse('Invalid JSON request body', 400);
    }

    const {
      email: rawEmail,
      productId: rawProductId,
      variantId: rawVariantId,
      productTitle: rawProductTitle,
      variantTitle: rawVariantTitle
    } = body;

    // Validate required fields
    if (!rawEmail) {
      logError(new Error('Missing email'), { action: 'api.restock-notify' });
      return createErrorResponse('Email is required', 400);
    }

    if (!rawProductId || !rawVariantId || !rawProductTitle) {
      logError(new Error('Missing required fields'), {
        action: 'api.restock-notify',
        fields: { rawProductId, rawVariantId, rawProductTitle }
      });
      return createErrorResponse('Missing required fields: productId, variantId, productTitle', 400);
    }

    // Validate and sanitize email
    const email = sanitizeInput(String(rawEmail).trim().toLowerCase());
    if (!isValidEmail(email)) {
      logError(new Error('Invalid email format'), { action: 'api.restock-notify', email: rawEmail });
      return createErrorResponse('Invalid email address format', 400);
    }

    // Sanitize string inputs to prevent XSS
    const productId = sanitizeInput(String(rawProductId));
    const variantId = sanitizeInput(String(rawVariantId));
    const productTitle = sanitizeInput(String(rawProductTitle));
    const variantTitle = rawVariantTitle ? sanitizeInput(String(rawVariantTitle)) : '';

    // Validate IDs format (Shopify GIDs)
    if (!productId.includes('Product') && !productId.match(/^\d+$/)) {
      logError(new Error('Invalid productId format'), { action: 'api.restock-notify', productId });
      return createErrorResponse('Invalid productId format', 400);
    }

    if (!variantId.includes('ProductVariant') && !variantId.match(/^\d+$/)) {
      logError(new Error('Invalid variantId format'), { action: 'api.restock-notify', variantId });
      return createErrorResponse('Invalid variantId format', 400);
    }

    // Create notification data
    const notification = {
      email,
      productId,
      variantId,
      productTitle,
      variantTitle,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Save notification to server-side storage with error handling
    try {
      addNotification(notification);
    } catch (storageError) {
      logError(storageError, {
        action: 'api.restock-notify',
        step: 'save-notification',
        email,
        productId
      });
      return createErrorResponse('Failed to save notification request', 500, storageError);
    }

    // --- OPTION 1: Save to Shopify Customer Metafields ---
    // You can save this to customer metafields or use Shopify's Customer API
    // to track who wants notifications

    // --- OPTION 2: Send Email Notification to Store Admin ---
    // In production, integrate with an email service like:
    // - SendGrid
    // - Mailchimp
    // - Klaviyo
    // - Shopify Email

    // Example: Send to store admin email
    const storeAdminEmail = 'admin@yourdomain.com'; // or from context.env if available

    // --- OPTION 3: Integrate with Email Service ---
    // Uncomment and configure based on your email service
    /*
    if (context.env?.SENDGRID_API_KEY) {
      try {
        await withTimeout(
          sendRestockNotificationEmail({
            apiKey: context.env.SENDGRID_API_KEY,
            to: storeAdminEmail,
            customerEmail: email,
            productTitle,
            variantTitle,
            productId,
            variantId,
          }),
          10000,
          'Email sending timeout'
        );
      } catch (emailError) {
        logError(emailError, {
          action: 'api.restock-notify',
          step: 'send-email',
          email
        });
        // Don't fail the request if email fails
      }
    }
    */

    // --- OPTION 4: Save to External Database ---
    // If you have a database configured, save it there
    /*
    if (context.env?.DATABASE_URL) {
      try {
        await withTimeout(
          saveToDatabase(context.env.DATABASE_URL, notification),
          10000,
          'Database save timeout'
        );
      } catch (dbError) {
        logError(dbError, {
          action: 'api.restock-notify',
          step: 'save-to-database',
          email
        });
        // Don't fail the request if database save fails
      }
    }
    */

    // --- OPTION 5: Use Shopify Flow ---
    // Create a custom event that triggers Shopify Flow
    // This requires Shopify Plus
    /*
    if (context.storefront && context.env?.SHOPIFY_FLOW_ENABLED) {
      try {
        await withTimeout(
          context.storefront.query(CREATE_CUSTOM_EVENT_MUTATION, {
            variables: {
              input: {
                namespace: 'restock-notifications',
                topic: 'restock_requested',
                data: JSON.stringify(notification),
              },
            },
          }),
          10000,
          'Shopify Flow timeout'
        );
      } catch (flowError) {
        logError(flowError, {
          action: 'api.restock-notify',
          step: 'shopify-flow',
          email
        });
        // Don't fail the request if Flow fails
      }
    }
    */

    // For now, we'll return success
    // The notification is logged in the console
    return Response.json({
      success: true,
      message: 'Notification request received',
      notification,
    });

  } catch (error) {
    logError(error, { action: 'api.restock-notify', step: 'unexpected-error' });
    return createErrorResponse(
      'An unexpected error occurred while processing notification request',
      500,
      error
    );
  }
}

// Helper function for SendGrid integration (example)
async function sendRestockNotificationEmail(params: {
  apiKey: string;
  to: string;
  customerEmail: string;
  productTitle: string;
  variantTitle: string;
  productId: string;
  variantId: string;
}) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: params.to }],
            subject: `Restock Notification Request - ${params.productTitle}`,
          },
        ],
        from: {
          email: 'noreply@yourdomain.com',
          name: 'TALLA Store',
        },
        content: [
          {
            type: 'text/html',
            value: `
              <h2>New Restock Notification Request</h2>
              <p><strong>Customer Email:</strong> ${params.customerEmail}</p>
              <p><strong>Product:</strong> ${params.productTitle}</p>
              <p><strong>Variant:</strong> ${params.variantTitle}</p>
              <p><strong>Product ID:</strong> ${params.productId}</p>
              <p><strong>Variant ID:</strong> ${params.variantId}</p>
              <p><strong>Requested:</strong> ${new Date().toLocaleString()}</p>
              <hr>
              <p><em>When this item is back in stock, please notify ${params.customerEmail}</em></p>
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`SendGrid API error (${response.status}): ${errorText}`);
    }

    return response.json();
  } catch (error) {
    logError(error, {
      action: 'sendRestockNotificationEmail',
      to: params.to,
      customerEmail: params.customerEmail
    });
    throw error;
  }
}

// Helper function for database integration (example)
async function saveToDatabase(databaseUrl: string, notification: any) {
  try {
    // Example with a generic fetch to your database API
    const response = await fetch(`${databaseUrl}/api/restock-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Database API error (${response.status}): ${errorText}`);
    }

    return response.json();
  } catch (error) {
    logError(error, {
      action: 'saveToDatabase',
      databaseUrl,
      notification
    });
    throw error;
  }
}
