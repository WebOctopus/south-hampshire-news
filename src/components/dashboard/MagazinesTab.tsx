import { useMagazineEditions } from '@/hooks/useMagazineEditions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, BookOpen } from 'lucide-react';

interface MagazinesTabProps {
  /** When true, hides the most recent (current) edition. */
  lapsed?: boolean;
}

const MagazinesTab = ({ lapsed = false }: MagazinesTabProps) => {
  const { data: editions, isLoading } = useMagazineEditions(false, 'front_cover');

  // For lapsed users, exclude the most recent edition (lowest sort_order = newest in this app).
  // Sort_order ascending is current-first, so drop index 0.
  const visibleEditions = (() => {
    if (!editions) return [];
    if (!lapsed) return editions;
    if (editions.length <= 1) return [];
    return editions.slice(1);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Magazines Online
        </h2>
        <p className="text-muted-foreground">
          {lapsed
            ? 'Browse past editions you have access to. Reactivate your account to view the current issue.'
            : 'Read current and past editions of the magazine online.'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : visibleEditions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No magazines available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleEditions.map((edition) => (
            <Card key={edition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-muted overflow-hidden">
                <img
                  src={edition.image_url}
                  alt={edition.alt_text || edition.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold leading-tight">{edition.title}</h3>
                {edition.issue_month && (
                  <p className="text-sm text-muted-foreground">{edition.issue_month}</p>
                )}
                {edition.link_url && (
                  <Button
                    asChild
                    size="sm"
                    className="w-full mt-2"
                    variant="outline"
                  >
                    <a href={edition.link_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Online
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MagazinesTab;
