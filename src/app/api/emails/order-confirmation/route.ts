import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { formatCurrency } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const order = await req.json();

    if (!order || !order.customerEmail) {
      return NextResponse.json({ error: 'Invalid order data or missing email' }, { status: 400 });
    }

    // Configure the SMTP transporter
    // Users must set these variables in their .env.local file
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate Items HTML
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: left;">
          <strong style="color: #0f172a;">${item.product.name}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">${item.quantity}x @ ${formatCurrency(item.product.price)}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: bold;">
          ${formatCurrency(item.product.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    // Construct the elegant HTML email
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background-color: #10b981; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">FreshMart NZ</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Thank you for your order!</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 15px;">
              Hi ${order.address?.fullName || 'Customer'},<br/>
              We've received your order <strong>#${order.id?.slice(-8).toUpperCase()}</strong> and we're getting it ready for delivery.
            </p>

            <!-- Order Details -->
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">Delivery Information</h3>
              <p style="color: #475569; margin: 0 0 5px 0; font-size: 14px;"><strong>Date:</strong> ${order.deliverySlot?.date}</p>
              <p style="color: #475569; margin: 0 0 5px 0; font-size: 14px;"><strong>Time:</strong> ${order.deliverySlot?.time}</p>
              <p style="color: #475569; margin: 0; font-size: 14px;"><strong>Address:</strong> ${order.address?.street}, ${order.address?.city} ${order.address?.postalCode}</p>
            </div>

            <!-- Receipt Table -->
            <h3 style="color: #0f172a; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              ${itemsHtml}
              <tr>
                <td style="padding: 12px 0; text-align: left; color: #475569; font-size: 14px;">Subtotal</td>
                <td style="padding: 12px 0; text-align: right; color: #0f172a;">${formatCurrency(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: left; color: #475569; font-size: 14px;">Shipping</td>
                <td style="padding: 8px 0; text-align: right; color: #0f172a;">${order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr>
                <td style="padding: 8px 0; text-align: left; color: #10b981; font-size: 14px;">Discount</td>
                <td style="padding: 8px 0; text-align: right; color: #10b981;">-${formatCurrency(order.discount)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 16px 0 0 0; border-top: 2px solid #e2e8f0; text-align: left; color: #0f172a; font-weight: bold; font-size: 18px;">Total</td>
                <td style="padding: 16px 0 0 0; border-top: 2px solid #e2e8f0; text-align: right; color: #10b981; font-weight: 800; font-size: 18px;">${formatCurrency(order.total)}</td>
              </tr>
            </table>

            <p style="color: #475569; font-size: 14px; margin-top: 40px; text-align: center;">
              If you have any questions, simply reply to this email. We're here to help!
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} FreshMart NZ. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    const info = await transporter.sendMail({
      from: `"FreshMart NZ" <${process.env.SMTP_USER || 'noreply@freshmart.co.nz'}>`,
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id?.slice(-8).toUpperCase()}`,
      html: htmlBody,
    });

    console.log('Message sent: %s', info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
