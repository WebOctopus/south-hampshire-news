import { Shield, CreditCard, Phone, Mail, MapPin, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const subscriptionTerms = [
  '"FREE for 3" applies for the first 3 bi-monthly issues only',
  'You must nominate the "paid for" 3+ Subscribed areas',
  'The free areas run concurrently with the "paid for" areas',
  'Paid for areas will continue to run unless cancellation or change of areas/size requested',
  '3+ Subscriptions are paid monthly by direct debit (GoCardless)',
  'By setting up the direct debit you are accepting the terms of a 3+ Subscription with Discover Magazines Ltd',
  'Payments are taken by GoCardless on 10th day of each month',
  'Inflationary increase applies per anniversary after 24 months from start of booking — no increase for 24 months',
];

const fixedTermTerms = [
  'Payment is due in full before publication',
  'Fixed term bookings run for the agreed number of issues only',
  'No automatic renewal — a new booking is required to continue',
  'Cancellation is not available once artwork has been submitted for print',
  'Design fees (if applicable) are non-refundable',
  'Prices are exclusive of VAT',
];

const leafletingTerms = [
  'Once booking is confirmed, 25% of the full amount is required at time of booking. Payment by debit/credit card.',
  'The remaining 75% is due 10 days prior to the delivery date.',
  'If the booking is made within 10 days of delivery, payment is required in full at the time of booking.',
  'No monthly payment plan or extra discount for payment in full in advance is available.',
];

interface BookingTermsProps {
  pricingModel?: string;
}

export default function BookingTerms({ pricingModel }: BookingTermsProps) {
  const isFixed = pricingModel === 'fixed' || pricingModel === 'fixed_term';
  const isLeafleting = pricingModel === 'leafleting';
  const showBoth = !pricingModel;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Terms of Booking &amp; Payment
          </h2>
          <p className="text-muted-foreground text-sm">
            Please review the terms that apply to your advertising bookings with Discover Magazines.
          </p>
        </div>
      </div>

      {/* Accordion sections */}
      <Accordion type="multiple" value={["terms", "fixed-terms", "leaflet-terms", "payment", "support"]} className="space-y-3">
        {/* Subscription or Fixed Term Terms */}
        {(showBoth || (!isFixed && !isLeafleting)) && (
        <AccordionItem value="terms" className="border rounded-lg bg-card px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline gap-3">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground">3+ Subscription Terms</span>
                <Badge variant="secondary" className="ml-2 text-[10px] align-middle">
                  3+ Repeat Package
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3 pl-1">
              {subscriptionTerms.map((term, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        )}

        {(showBoth || isFixed) && (
        <AccordionItem value="fixed-terms" className="border rounded-lg bg-card px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline gap-3">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground">Pay As You Go Booking Terms</span>
                <Badge variant="secondary" className="ml-2 text-[10px] align-middle">
                  Pay As You Go
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3 pl-1">
              {fixedTermTerms.map((term, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        )}

        {/* 2 — Payment & Billing */}
        <AccordionItem value="payment" className="border rounded-lg bg-card px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline gap-3">
            <div className="flex items-center gap-3 text-left">
              <CreditCard className="h-5 w-5 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Payment &amp; Billing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Invoice Issuer</p>
                    <p className="text-muted-foreground">Discover Magazines Ltd, 30 Leigh Road, Eastleigh SO50 9DT</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">GoCardless Bank Reference</p>
                    <p className="text-muted-foreground">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">DISCOVERMAG</code>{" "}
                      — Direct Debit Guarantee
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Payment Schedule</p>
                    <p className="text-muted-foreground">Payments are collected on the 10th of each month via GoCardless Direct Debit</p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3 — Accounts & Support */}
        <AccordionItem value="support" className="border rounded-lg bg-card px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline gap-3">
            <div className="flex items-center gap-3 text-left">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Accounts &amp; Support</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                For account queries, billing questions or changes to your subscription, please contact:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:accounts@discovermagazines.co.uk" className="text-primary hover:underline font-medium">
                    accounts@discovermagazines.co.uk
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href="tel:02380010123" className="text-primary hover:underline font-medium">
                    023 8001 0123
                  </a>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer note */}
      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFixed
              ? 'These terms apply specifically to Fixed Term bookings. Subscription (3+ Repeat) bookings may have different conditions.'
              : showBoth
                ? 'These terms apply to your advertising bookings with Discover Magazines. Different booking types may have specific conditions.'
                : 'These terms apply specifically to 3+ Subscription (Repeat Package) bookings. Fixed-term bookings may have different conditions.'}
            {' '}If you have any questions about your booking terms, please contact us using the details above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
