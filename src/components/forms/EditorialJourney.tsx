import { EditorialData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, MapPin, Tag } from 'lucide-react';

interface EditorialJourneyProps {
  data: Partial<EditorialData>;
  onChange: (updates: Partial<EditorialData>) => void;
  errors?: Partial<Record<keyof EditorialData, string>>;
}

const areas = [
  'Eastleigh',
  'Fair Oak & Horton Heath', 
  'Hedge End',
  'West End',
  'Botley',
  'Bishops Waltham',
  'Chandlers Ford',
  'Southampton',
  'Other'
];

const categories = [
  'Community News',
  'Business News',
  'Events',
  'Sports',
  'Arts & Culture',
  'Education',
  'Health & Wellbeing',
  'Environment',
  'Other'
];

const EditorialJourney = ({ data, onChange, errors = {} }: EditorialJourneyProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Tell Us Your Story
        </h2>
        <p className="text-gray-600 text-sm">
          Share the details of your news or community story
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="story_title" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Story Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="story_title"
            value={data.story_title || ''}
            onChange={(e) => onChange({ story_title: e.target.value })}
            placeholder="Give your story a catchy headline"
            required
          />
          {errors.story_title && (
            <p className="text-sm text-destructive">{errors.story_title}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="area" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              Area <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.area || ''}
              onValueChange={(value) => onChange({ area: value })}
            >
              <SelectTrigger id="area">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.category || ''}
              onValueChange={(value) => onChange({ category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="story_summary">
            Short Summary <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="story_summary"
            value={data.story_summary || ''}
            onChange={(e) => onChange({ story_summary: e.target.value })}
            placeholder="A brief 2-3 sentence summary of your story"
            rows={3}
            required
          />
          <p className="text-xs text-gray-500">This may be used as a preview or excerpt</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="story_content">
            Full Story <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="story_content"
            value={data.story_content || ''}
            onChange={(e) => onChange({ story_content: e.target.value })}
            placeholder="Write your full story here. Include all relevant details, quotes, and information..."
            rows={8}
            required
          />
          <p className="text-xs text-gray-500">
            Aim for 200-500 words. Our editors may edit for length and clarity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditorialJourney;
