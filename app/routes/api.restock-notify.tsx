import type { ActionFunctionArgs, LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { addNotification } from '~/utils/notificationStorage.server';

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
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, productId, variantId, productTitle, variantTitle } = body as NotificationRequest;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Validate required fields
    if (!productId || !variantId || !productTitle) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Save notification to server-side storage
    addNotification(notification);

    // --- OPTION 3: Integrate with Email Service ---
    // Uncomment and configure based on your email service
    /*
    if (context.env?.SENDGRID_API_KEY) {
      await sendRestockNotificationEmail({
        apiKey: context.env.SENDGRID_API_KEY,
        to: storeAdminEmail,
        customerEmail: email,
        productTitle,
        variantTitle,
        productId,
        variantId,
      });
    }
    */

    // --- OPTION 4: Save to External Database ---
    // If you have a database configured, save it there
    /*
    if (context.env?.DATABASE_URL) {
      await saveToDatabase(context.env.DATABASE_URL, notification);
    }
    */

    // --- OPTION 5: Use Shopify Flow ---
    // Create a custom event that triggers Shopify Flow
    // This requires Shopify Plus
    /*
    if (context.storefront && context.env?.SHOPIFY_FLOW_ENABLED) {
      await context.storefront.query(CREATE_CUSTOM_EVENT_MUTATION, {
        variables: {
          input: {
            namespace: 'restock-notifications',
            topic: 'restock_requested',
            data: JSON.stringify(notification),
          },
        },
      });
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
    console.error('Error processing restock notification:', error);
    return Response.json(
      { error: 'Failed to process notification request' },
      { status: 500 }
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
    throw new Error(`SendGrid API error: ${response.statusText}`);
  }

  return response.json();
}

// Helper function for database integration (example)
async function saveToDatabase(databaseUrl: string, notification: any) {
  // Example with a generic fetch to your database API
  const response = await fetch(`${databaseUrl}/api/restock-notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  });

  if (!response.ok) {
    throw new Error(`Database API error: ${response.statusText}`);
  }

  return response.json();
}
