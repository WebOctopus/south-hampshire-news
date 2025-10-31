import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.2';

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

    // Generate PDF invoice
    const pdf = generateInvoicePdf(invoice, booking);
    const pdfBytes = pdf.output('arraybuffer');
    
    console.log('PDF generated, uploading to storage...');

    // Upload PDF to storage
    const fileName = `${invoice.invoice_number}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('invoices')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Generate a signed URL (valid for 1 year) for the private invoice
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('invoices')
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError);
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message}`);
    }

    // Update invoice with PDF URL
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ pdf_url: signedUrlData.signedUrl })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Error updating invoice with PDF URL:', updateError);
      throw new Error(`Failed to update invoice: ${updateError.message}`);
    }

    console.log('PDF uploaded successfully:', signedUrlData.signedUrl);

    // Update booking
    await supabase
      .from('bookings')
      .update({ invoice_generated: true })
      .eq('id', bookingId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice: {
          ...invoice,
          pdf_url: signedUrlData.signedUrl
        },
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

function generateInvoicePdf(invoice: any, booking: any): jsPDF {
  const doc = new jsPDF();
  
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

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Discover Magazine', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Community Magazine & Local Advertising', 20, 27);

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 20);

  // Invoice Details
  let yPos = 50;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Number:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_number, 70, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.invoice_date), 70, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('Direct Debit via GoCardless', 70, yPos);

  // Bill To Section
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(booking.contact_name || '', 20, yPos);
  
  if (booking.company) {
    yPos += 6;
    doc.text(booking.company, 20, yPos);
  }
  
  yPos += 6;
  doc.text(booking.email || '', 20, yPos);
  
  if (booking.phone) {
    yPos += 6;
    doc.text(booking.phone, 20, yPos);
  }

  // Payment Details Section
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS:', 20, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Mandate Reference: ${invoice.gocardless_mandate_id}`, 20, yPos);
  
  yPos += 6;
  doc.text('Statement Reference: Go Cardless REF DISCOVERMAGA', 20, yPos);

  if (invoice.payment_type === 'subscription') {
    yPos += 6;
    doc.text('First Payment: Within 3 business days of setup', 20, yPos);
    yPos += 6;
    doc.text('Subsequent Payments: 10th day of each month', 20, yPos);
  }

  // Campaign Details Table
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('CAMPAIGN DETAILS:', 20, yPos);

  yPos += 10;
  // Table Header
  doc.setFillColor(244, 244, 244);
  doc.rect(20, yPos - 5, 170, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, yPos);
  doc.text('Details', 80, yPos);
  doc.text('Amount', 160, yPos);

  // Table Content
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Advertising Campaign', 25, yPos);
  
  const campaignType = booking.pricing_model === 'fixed' ? 'Fixed Term' : 
                       booking.pricing_model === 'subscription' ? 'Subscription' : 'BOGOF';
  doc.text(campaignType, 80, yPos);
  doc.text(formatPrice(booking.subtotal || 0), 160, yPos);

  yPos += 6;
  doc.setFontSize(9);
  doc.text(`${booking.ad_sizes?.name || 'Standard Ad Size'}`, 80, yPos);
  yPos += 5;
  doc.text(`${booking.selected_area_ids?.length || 0} distribution areas`, 80, yPos);

  if (booking.pricing_breakdown?.designFee > 0) {
    yPos += 8;
    doc.setFontSize(11);
    doc.text('Design Service', 25, yPos);
    doc.text('Professional ad design', 80, yPos);
    doc.text(formatPrice(booking.pricing_breakdown.designFee), 160, yPos);
  }

  // Total
  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const totalLabel = invoice.payment_type === 'subscription' ? 'Total Monthly:' : 'Total:';
  doc.text(totalLabel, 120, yPos);
  doc.text(formatPrice(invoice.amount), 160, yPos);

  // Footer
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 20, yPos);
  yPos += 6;
  doc.text('For any questions about this invoice, please contact us.', 20, yPos);
  yPos += 6;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This invoice was automatically generated by our system.', 20, yPos);

  return doc;
}
