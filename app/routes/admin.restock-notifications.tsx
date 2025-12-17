import { useState } from 'react';
import type { Route } from './+types/admin.restock-notifications';

/**
 * Admin Dashboard for Restock Notifications
 *
 * View and manage customer restock notification requests
 * Access at: /admin/restock-notifications
 */

export const meta: Route.MetaFunction = () => {
  return [{ title: 'Restock Notifications - TALLA Admin' }];
};

export async function loader({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  // In a production app, you'd fetch from a database
  // For now, we'll just return empty and use client-side localStorage

  return {
    notifications: [],
  };
}

export default function RestockNotificationsAdmin() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  // Load notifications from localStorage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('talla_restock_notifications');
        if (stored) {
          setNotifications(JSON.parse(stored) as any[]);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
  });

  const checkInventory = async (variantId: string) => {
    setLoading(true);
    try {
      // You can add API call here to check Shopify inventory
      // For demo purposes, we'll just alert
      alert('Check your Shopify admin to see if this variant is in stock');
    } catch (err) {
      console.error('Failed to check inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notification: any) => {
    setSending(notification.variantId);
    try {
      // Extract product handle from product ID
      const productHandle = notification.productId?.split('/').pop() || 'product';

      // Call API to send email
      const response = await fetch('/api/send-restock-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: notification.email,
          productTitle: notification.productTitle,
          variantTitle: notification.variantTitle,
          productHandle,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Success! Remove from localStorage
      const updated = notifications.filter(
        n => !(n.variantId === notification.variantId && n.email === notification.email)
      );
      setNotifications(updated);
      localStorage.setItem('talla_restock_notifications', JSON.stringify(updated));

      alert(`✅ Email sent successfully to ${notification.email}!`);
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      alert(`❌ Failed to send email: ${err.message}\n\nMake sure you've set up your email service (see RESTOCK_EMAIL_SETUP.md)`);
    } finally {
      setSending(null);
    }
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      localStorage.removeItem('talla_restock_notifications');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restock Notifications</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage customer notification requests for out-of-stock items
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Refresh
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Total Requests</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{notifications.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Unique Customers</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {new Set(notifications.map(n => n.email)).size}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Unique Products</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {new Set(notifications.map(n => n.variantId)).size}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                Customer notification requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{notification.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{notification.productTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{notification.variantTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => checkInventory(notification.variantId)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Check Stock
                          </button>
                          <button
                            onClick={() => sendNotification(notification)}
                            disabled={sending === notification.variantId}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {sending === notification.variantId ? 'Sending...' : 'Send Email'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">How to use this dashboard</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>When a customer requests a notification, it appears here</li>
                  <li>Click "Check Stock" to verify inventory in Shopify</li>
                  <li>When the item is back in stock, click "Send Email"</li>
                  <li>This will open a mailto link - replace with actual email service for automation</li>
                </ol>
              </div>
              <div className="mt-3">
                <a
                  href="/config/restock-notifications.md"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View integration guide →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
