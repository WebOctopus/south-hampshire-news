import { User, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  ownerName?: string | null;
  ownerRole?: string | null;
  ownerPhotoUrl?: string | null;
  ownerQuote?: string | null;
}

export function MeetTheOwnerCard({ ownerName, ownerRole, ownerPhotoUrl, ownerQuote }: Props) {
  if (!ownerName && !ownerQuote && !ownerPhotoUrl) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <User className="h-4 w-4" /> Meet the owner
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4 items-start">
        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center flex-shrink-0 border">
          {ownerPhotoUrl ? (
            <img src={ownerPhotoUrl} alt={ownerName || 'Owner'} className="w-full h-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {ownerName && <div className="font-semibold">{ownerName}</div>}
          {ownerRole && <div className="text-sm text-muted-foreground mb-2">{ownerRole}</div>}
          {ownerQuote && (
            <blockquote className="border-l-2 border-orange-400 pl-3 italic text-sm text-foreground/80">
              <Quote className="inline h-3 w-3 text-orange-400 mr-1" />
              {ownerQuote}
            </blockquote>
          )}
        </div>
      </CardContent>
    </Card>
  );
}