import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceRequest {
  bookingId: string;
  paymentId?: string;
  subscriptionId?: string;
  mandateId: string;
  type: 'payment' | 'subscription';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId, paymentId, subscriptionId, mandateId, type }: InvoiceRequest = await req.json();

    console.log('Generating invoice for booking:', bookingId);

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('gocardless_mandate_id', mandateId)
      .maybeSingle();

    if (existingInvoice) {
      console.log('Invoice already exists for this booking');
      return new Response(
        JSON.stringify({ message: 'Invoice already exists', invoiceId: existingInvoice.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate invoice number
    const { data: invoiceNumber, error: invoiceNumberError } = await supabase
      .rpc('generate_invoice_number');

    if (invoiceNumberError) {
      throw new Error(`Failed to generate invoice number: ${invoiceNumberError.message}`);
    }

    // Determine amount
    let amount = booking.final_total || booking.subtotal || 0;
    
    // For subscriptions, amount is the monthly price
    if (type === 'subscription') {
      amount = booking.monthly_price || amount;
    }

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        booking_id: bookingId,
        invoice_number: invoiceNumber,
        amount,
        payment_type: type,
        gocardless_payment_id: paymentId,
        gocardless_subscription_id: subscriptionId,
        gocardless_mandate_id: mandateId,
        status: 'generated',
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    // Generate HTML invoice (simplified version - can be enhanced with PDF generation later)
    const invoiceHtml = generateInvoiceHtml(invoice, booking);

    // For now, we'll store the invoice record without PDF
    // In the future, you can add PDF generation using a library like puppeteer or an API service
    console.log('Invoice HTML generated, ready for PDF conversion');

    // Update booking
    await supabase
      .from('bookings')
      .update({ invoice_generated: true })
      .eq('id', bookingId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice,
        message: 'Invoice generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateInvoiceHtml(invoice: any, booking: any): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-title { font-size: 28px; font-weight: bold; margin: 20px 0; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background-color: #f4f4f4; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Discover Magazine</div>
        <div>Community Magazine & Local Advertising</div>
      </div>

      <div class="invoice-title">INVOICE</div>

      <div class="invoice-details">
        <div>
          <strong>Invoice Number:</strong> ${invoice.invoice_number}<br>
          <strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date)}<br>
          <strong>Payment Method:</strong> Direct Debit via GoCardless
        </div>
        <div>
          <strong>Bill To:</strong><br>
          ${booking.contact_name}<br>
          ${booking.company || ''}<br>
          ${booking.email}<br>
          ${booking.phone || ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <p>
          <strong>Mandate Reference:</strong> ${invoice.gocardless_mandate_id}<br>
          <strong>Statement Reference:</strong> Go Cardless REF DISCOVERMAGA<br>
          ${invoice.payment_type === 'subscription' ? `
            <strong>First Payment:</strong> Within 3 business days of setup<br>
            <strong>Subsequent Payments:</strong> 10th day of each month
          ` : ''}
        </p>
      </div>

      <div class="section">
        <div class="section-title">Campaign Details</div>
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Details</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Advertising Campaign</td>
              <td>
                ${booking.pricing_model === 'fixed' ? 'Fixed Term Campaign' : booking.pricing_model === 'subscription' ? 'Subscription Campaign' : 'BOGOF Campaign'}<br>
                ${booking.ad_sizes?.name || 'Standard Ad Size'}<br>
                ${booking.selected_area_ids?.length || 0} distribution areas
              </td>
              <td>${formatPrice(booking.subtotal || 0)}</td>
            </tr>
            ${booking.pricing_breakdown?.designFee > 0 ? `
              <tr>
                <td>Design Service</td>
                <td>Professional ad design</td>
                <td>${formatPrice(booking.pricing_breakdown.designFee)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      <div class="total">
        Total ${invoice.payment_type === 'subscription' ? 'Monthly' : ''}: ${formatPrice(invoice.amount)}
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>For any questions about this invoice, please contact us.</p>
        <p>This invoice was automatically generated by our system.</p>
      </div>
    </body>
    </html>
  `;
}
