import { User } from 'lucide-react';

interface Props {
  ownerName?: string | null;
  ownerRole?: string | null;
  ownerPhotoUrl?: string | null;
  ownerQuote?: string | null;
}

export function MeetTheOwnerCard({ ownerName, ownerRole, ownerPhotoUrl, ownerQuote }: Props) {
  if (!ownerName && !ownerQuote && !ownerPhotoUrl) return null;
  return (
    <div className="bg-card border border-community-teal/25 rounded-xl p-5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1px] text-muted-foreground mb-4">
        <User className="h-3.5 w-3.5 text-community-teal" /> Meet the owner
      </div>
      <div className="flex gap-4 items-start">
        <div className="w-[72px] h-[72px] rounded-full bg-community-teal/10 overflow-hidden flex items-center justify-center flex-shrink-0 border border-community-teal/25">
          {ownerPhotoUrl ? (
            <img src={ownerPhotoUrl} alt={ownerName || 'Owner'} className="w-full h-full object-cover" />
          ) : (
            <User className="h-7 w-7 text-community-teal" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {ownerName && <div className="font-medium text-sm">{ownerName}</div>}
          {ownerRole && <div className="text-xs text-muted-foreground mb-2.5">{ownerRole}</div>}
          {ownerQuote && (
            <blockquote className="border-l-2 border-community-purple pl-3">
              <span className="font-heading text-3xl leading-none text-community-purple block mb-1.5">“</span>
              <p className="font-heading italic text-sm text-foreground/85 leading-relaxed">
                {ownerQuote}
              </p>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}