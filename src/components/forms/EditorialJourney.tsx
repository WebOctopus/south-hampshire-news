import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { EditorialData, Consents } from './types';
import { cn } from '@/lib/utils';
import { X, Upload, Newspaper, MessageSquare, Store, Heart, BookOpen, Star, Award } from 'lucide-react';

interface EditorialJourneyProps {
  data: Partial<EditorialData>;
  onChange: (updates: Partial<EditorialData>) => void;
  errors?: Partial<Record<keyof EditorialData, string>>;
  consents?: Consents;
  onConsentsChange?: (updates: Partial<Consents>) => void;
}

const categories = [
  { value: 'community_news_story', label: 'Community News Story', icon: Newspaper },
  { value: 'personal_story', label: 'Personal Story', icon: MessageSquare },
  { value: 'local_business', label: 'Local Business', icon: Store },
  { value: 'cheer_for_charity', label: 'Cheer for Charity', icon: Heart },
  { value: 'a_good_read', label: 'A Good Read', icon: BookOpen },
  { value: 'young_superstar', label: 'Young Superstar', icon: Star },
  { value: 'community_hero', label: 'Community Hero', icon: Award },
];

const EditorialJourney = ({ data, onChange, errors, consents, onConsentsChange }: EditorialJourneyProps) => {
  const summaryText = data.editorial_story_summary || '';
  const wordCount = summaryText.trim() ? summaryText.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > 30;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const existing = data.editorial_attachments || [];
      onChange({ editorial_attachments: [...existing, ...fileArray] });
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const files = data.editorial_attachments || [];
    const updated = files.filter((_, i) => i !== index);
    onChange({ editorial_attachments: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Story Details</h2>
        <p className="text-muted-foreground text-sm">Tell us about your story for Discover magazine.</p>
      </div>

      {/* Organisation (optional) */}
      <div className="space-y-2">
        <Label htmlFor="editorial_organisation">Organisation (optional)</Label>
        <Input
          id="editorial_organisation"
          placeholder="Your organisation or group name"
          value={data.editorial_organisation || ''}
          onChange={(e) => onChange({ editorial_organisation: e.target.value })}
        />
      </div>

      {/* Story Summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="editorial_story_summary">Summary of your story in one sentence *</Label>
          <span className={cn(
            "text-xs",
            isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {wordCount}/30 words
          </span>
        </div>
        <Input
          id="editorial_story_summary"
          placeholder="Briefly describe your story in one sentence"
          value={data.editorial_story_summary || ''}
          onChange={(e) => onChange({ editorial_story_summary: e.target.value })}
          className={cn(errors?.editorial_story_summary || isOverLimit ? "border-destructive" : "")}
        />
        {isOverLimit && (
          <p className="text-xs text-destructive">Please keep your summary to 30 words or less.</p>
        )}
        {errors?.editorial_story_summary && (
          <p className="text-xs text-destructive">{errors.editorial_story_summary}</p>
        )}
      </div>

      {/* Editorial Category */}
      <div className="space-y-3">
        <Label>Editorial Category *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = data.editorial_category === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => onChange({ editorial_category: category.value })}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "border-community-green bg-community-green/10 text-foreground" 
                    : "border-border hover:border-community-green/50 hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isSelected ? "text-community-green" : "text-muted-foreground"
                )} />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
        {errors?.editorial_category && (
          <p className="text-xs text-destructive">{errors.editorial_category}</p>
        )}
      </div>

      {/* Story Text */}
      <div className="space-y-2">
        <Label htmlFor="editorial_story_text">The text of your story *</Label>
        <p className="text-sm text-muted-foreground italic">
          Please write in 3rd person (he/she/they), not my/our/I.
        </p>
        <Textarea
          id="editorial_story_text"
          placeholder="Write your full story here..."
          value={data.editorial_story_text || ''}
          onChange={(e) => onChange({ editorial_story_text: e.target.value })}
          className={cn(
            "min-h-[200px] resize-y",
            errors?.editorial_story_text ? "border-destructive" : ""
          )}
        />
        {errors?.editorial_story_text && (
          <p className="text-xs text-destructive">{errors.editorial_story_text}</p>
        )}
      </div>

      {/* Attachments */}
      <div className="space-y-3">
        <Label>Attachments (optional)</Label>
        <p className="text-sm text-muted-foreground">
          Upload photos or documents related to your story
        </p>
        
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-border hover:border-community-green hover:bg-muted/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Choose files</span>
            </div>
          </label>
        </div>

        {/* File list */}
        {data.editorial_attachments && data.editorial_attachments.length > 0 && (
          <div className="space-y-2 mt-3">
            {data.editorial_attachments.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <span className="text-sm truncate flex-1 mr-2">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Communication Preferences */}
      {consents && onConsentsChange && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <h3 className="text-sm font-medium text-foreground mb-3">Communication Preferences</h3>
          <div className="flex items-start gap-3">
            <Checkbox
              id="editorial_email_consent"
              checked={consents.email_contact}
              onCheckedChange={(checked) => onConsentsChange({ email_contact: !!checked })}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label 
                htmlFor="editorial_email_consent" 
                className="text-sm font-medium cursor-pointer"
              >
                I consent to being contacted by email regarding my story submission *
              </Label>
              <p className="text-xs text-muted-foreground">
                We'll use your email to follow up on your story and keep you updated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorialJourney;
