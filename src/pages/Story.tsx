import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock story data - in a real app this would come from a database
  const stories = [
    {
      id: '1',
      title: 'New Community Garden Opens in Fareham',
      excerpt: 'Local residents celebrate the opening of a beautiful new community garden that brings neighbors together.',
      content: `
        <p>Local residents of Fareham came together this weekend to celebrate the grand opening of the new Millfield Community Garden, a project that has been in development for over two years.</p>
        
        <p>The garden, located on what was previously an unused plot of land on Millfield Road, now features raised vegetable beds, a greenhouse, composting area, and a beautiful wildflower meadow that serves as a habitat for local wildlife.</p>
        
        <p>"This garden represents everything wonderful about our community," said Sarah Mitchell, one of the project's lead organizers. "It's a place where neighbors can meet, children can learn about growing food, and we can all contribute to a more sustainable future."</p>
        
        <p>The project was funded through a combination of council grants, local fundraising events, and donations from area businesses. Over 50 volunteers contributed their time and expertise to transform the space.</p>
        
        <p>The garden will be open to all residents, with individual plots available for rent at £20 per year. Community workshops on composting, organic gardening, and seasonal planting will be held monthly.</p>
        
        <p>Mayor John Thompson, who officially opened the garden by planting the first seeds in the communal herb spiral, praised the initiative: "Projects like this strengthen the fabric of our community and provide valuable green space for future generations."</p>
        
        <p>The garden is open daily from dawn to dusk, and anyone interested in getting involved can contact the organizing committee through the Fareham Community Center.</p>
      `,
      image: '/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png',
      date: '2024-06-01',
      category: 'Community',
      author: 'Emma Thompson',
      readTime: '4 min read'
    },
    {
      id: '2',
      title: 'Local Business Wins Regional Award',
      excerpt: 'Southampton-based bakery receives recognition for outstanding customer service and community involvement.',
      content: `
        <p>The Sweet Spot Bakery in Southampton's city center has been awarded the prestigious "Regional Business Excellence Award" by the Hampshire Chamber of Commerce, recognizing their outstanding contribution to the local community and exceptional customer service.</p>
        
        <p>Owner Maria Santos opened the bakery five years ago with a vision of creating not just delicious baked goods, but a true community hub where neighbors could gather, students could study, and local artists could display their work.</p>
        
        <p>"When I first opened The Sweet Spot, I wanted it to be more than just a bakery," Santos explained. "I wanted it to be a place where the community could come together, where we could support local causes, and where everyone would feel welcome."</p>
        
        <p>The bakery has become known for its weekly "Community Coffee" sessions, where local residents can discuss neighborhood issues, and its "Skills Share Saturdays," where community members teach each other various crafts and skills.</p>
        
        <p>During the pandemic, The Sweet Spot pivoted to provide free meals for healthcare workers and vulnerable community members, delivering over 2,000 meals throughout 2020 and 2021.</p>
        
        <p>"Maria and her team exemplify what it means to be a community-centered business," said Chamber of Commerce President David Clarke. "They've shown that commercial success and community care can go hand in hand."</p>
        
        <p>The award comes with a £5,000 prize, which Santos plans to use to expand the bakery's community programming and create a small community library corner.</p>
      `,
      image: '/lovable-uploads/0cb5406a-eaee-4828-af68-e345305abd9e.png',
      date: '2024-05-28',
      category: 'Business',
      author: 'Michael Roberts',
      readTime: '3 min read'
    },
    {
      id: '3',
      title: 'Charity Walk Raises £15,000',
      excerpt: 'Annual charity walk through Hampshire countryside exceeds fundraising goals for local hospice.',
      content: `
        <p>The annual Hampshire Countryside Charity Walk has smashed its fundraising target, raising over £15,000 for St. Catherine's Hospice in a single day of community spirit and determination.</p>
        
        <p>More than 300 participants took part in the 20-mile walk through some of Hampshire's most beautiful countryside, starting at Winchester Cathedral and finishing at the hospice in Crawley.</p>
        
        <p>The event, now in its eighth year, was organized by the Friends of St. Catherine's Hospice group and supported by numerous local businesses and volunteers who provided refreshment stops, route marshalling, and transportation.</p>
        
        <p>"The support from the community has been absolutely overwhelming," said walk coordinator Janet Phillips. "Every year we're amazed by the generosity and determination of our participants. Many people have personal connections to the hospice, and you can really feel that motivation throughout the day."</p>
        
        <p>Among the walkers was 78-year-old retired teacher Geoffrey Hamilton, who has completed every charity walk since its inception. "St. Catherine's cared for my wife during her final months," he said. "This walk is my way of giving back and ensuring they can continue their incredible work."</p>
        
        <p>The hospice provides end-of-life care and support for patients and families across the region, offering services completely free of charge. The funds raised will help support their patient care programs, family counseling services, and bereavement support.</p>
        
        <p>St. Catherine's Hospice Chief Executive Lisa Morgan expressed her gratitude: "This amazing community effort means we can continue providing compassionate care when it's needed most. Every pound raised makes a real difference to the families we serve."</p>
        
        <p>Next year's walk is already scheduled for the first Saturday in May, with registration opening in January.</p>
      `,
      image: '/lovable-uploads/5c775c6a-2d81-439b-871e-56243f2f1686.png',
      date: '2024-05-25',
      category: 'Events',
      author: 'Rachel Green',
      readTime: '5 min read'
    },
    {
      id: '4',
      title: 'School Art Project Brightens High Street',
      excerpt: 'Students create stunning mural that transforms local shopping area and celebrates community diversity.',
      content: `
        <p>The previously bland wall of Wessex Shopping Center has been transformed into a vibrant celebration of community diversity, thanks to a collaborative art project by students from three local secondary schools.</p>
        
        <p>The 40-meter mural, titled "Our Hampshire Heritage," depicts the multicultural history and contemporary life of the local area, featuring everything from Saxon settlements to modern community festivals, all rendered in bright, eye-catching colors.</p>
        
        <p>The project was initiated by Highfield Academy's art department, led by teacher Claire Morrison, who wanted to give students an opportunity to create something meaningful for their community while developing their artistic skills.</p>
        
        <p>"We wanted the young people to see that their creativity could make a real difference to the area where they live and learn," Morrison explained. "The students researched the history of our community, interviewed local residents, and incorporated all those stories into this beautiful piece of public art."</p>
        
        <p>Students from Highfield Academy, St. Mary's College, and Eastleigh Community School worked together over six months, dedicating weekends and holidays to complete the project. Local businesses donated materials and equipment, while the shopping center provided scaffolding and safety equipment.</p>
        
        <p>Sixteen-year-old Amara Patel, one of the lead student artists, said: "Working on this mural taught me so much more than just painting techniques. I learned about the history of my community and met people from different backgrounds who all call this place home."</p>
        
        <p>The mural includes representations of the area's Roman history, its industrial heritage, waves of immigration that have shaped the community, and contemporary celebrations like the annual multicultural festival.</p>
        
        <p>Local councillor James Wright, who supported the project from its inception, said: "This mural has completely transformed what was a drab corner of our high street. More importantly, it shows our young people that their voices and creativity are valued in our community."</p>
        
        <p>The official unveiling ceremony is planned for next month, with a community celebration featuring food, music, and performances representing the diverse cultures depicted in the mural.</p>
      `,
      image: '/lovable-uploads/3d27ee8c-7011-429f-98ca-06f2a167bed7.png',
      date: '2024-05-22',
      category: 'Education',
      author: 'David Park',
      readTime: '4 min read'
    },
    {
      id: '5',
      title: 'New Cycling Route Connects Villages',
      excerpt: 'Hampshire County Council opens safe cycling path linking rural communities with market towns.',
      content: `
        <p>Hampshire County Council has officially opened the new Meon Valley Cycle Path, a 15-mile dedicated cycling route that safely connects five rural villages with the market towns of Petersfield and Wickham.</p>
        
        <p>The £2.3 million project converts the former railway line into a traffic-free path suitable for cyclists, walkers, and horse riders, providing a safe alternative to busy A-roads for both recreation and daily commuting.</p>
        
        <p>County Councillor Rob Humby, Executive Member for Transport, said at the opening ceremony: "This new cycle path represents our commitment to sustainable transport and healthy communities. It provides safe passage for cyclists of all abilities while preserving the natural beauty of the Meon Valley."</p>
        
        <p>The path features three restored railway bridges, new wildlife viewing areas, and connections to existing footpath networks. Environmental considerations were central to the design, with native tree planting and habitat creation for local wildlife incorporated throughout.</p>
        
        <p>Local cycling group Hampshire Wheelers, who campaigned for the route for over a decade, organized a inaugural ride with over 200 participants ranging from families with young children to experienced cyclists.</p>
        
        <p>"This path opens up so many possibilities," said cycling enthusiast and project supporter Margaret Walsh. "Families can safely cycle to schools and shops, commuters have a car-free option, and tourists can explore our beautiful countryside without worrying about traffic."</p>
        
        <p>The route includes several rest areas with information boards about local history and ecology, making it educational as well as recreational. The path surface is suitable for standard bicycles, mobility scooters, and wheelchairs.</p>
        
        <p>Business owners in connected communities have already reported increased footfall, with several bike-friendly cafes and repair shops opening along the route.</p>
        
        <p>The path is open year-round from dawn to dusk, and cycle hire is available at both Petersfield and Wickham stations for visitors arriving by train.</p>
      `,
      image: '/lovable-uploads/6ce5a96b-19dd-49ab-aa34-4a048c3c22d2.png',
      date: '2024-05-20',
      category: 'Transport',
      author: 'Sophie Williams',
      readTime: '4 min read'
    },
    {
      id: '6',
      title: 'Local Hero Honored for Volunteer Work',
      excerpt: 'Grandmother of four receives community award for decades of service to local food bank.',
      content: `
        <p>Dorothy Henderson, a 68-year-old grandmother from Alton, has been recognized with the Hampshire Community Hero Award for her extraordinary 25-year commitment to supporting families facing food insecurity.</p>
        
        <p>Henderson began volunteering at the Alton Community Food Bank in 1999, initially helping one afternoon per week. Today, she coordinates the entire operation, managing a team of 40 volunteers and overseeing the distribution of food to over 150 families each week.</p>
        
        <p>"Dorothy is the heart and soul of our food bank," said center manager Patricia Collins. "Her dedication, compassion, and organizational skills have transformed what started as a small church initiative into a lifeline for hundreds of local families."</p>
        
        <p>Under Henderson's leadership, the food bank has expanded from a single room in St. Lawrence Church to a purpose-built facility with refrigeration, storage, and a welcoming cafe area where clients can access additional support services.</p>
        
        <p>"I never set out to do anything extraordinary," Henderson said modestly. "I just saw families in my community who needed help, and I wanted to do what I could. Before you know it, 25 years have passed, and it's become my life's work."</p>
        
        <p>Henderson's innovations include establishing partnerships with local supermarkets to rescue surplus food, creating a community garden to provide fresh produce, and developing a mentorship program that helps families develop cooking skills and budget management.</p>
        
        <p>The award, presented by Hampshire's Lord Lieutenant Nigel Atkinson, comes with a £1,000 prize that Henderson immediately donated back to the food bank to purchase new equipment.</p>
        
        <p>Local MP Caroline Nokes, who nominated Henderson for the award, said: "Dorothy embodies the very best of community spirit. Her quiet, consistent service has touched thousands of lives and made our community stronger and more caring."</p>
        
        <p>Henderson continues to work at the food bank four days a week and has no plans to slow down. "As long as there are families who need support, I'll be here," she said.</p>
      `,
      image: '/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png',
      date: '2024-05-18',
      category: 'People',
      author: 'James Mitchell',
      readTime: '5 min read'
    }
  ];

  const story = stories.find(s => s.id === id);

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-community-navy mb-4">
              Story Not Found
            </h1>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} className="bg-community-navy hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="mb-8 text-community-navy hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>

          <article>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-community-green text-white text-sm font-medium rounded-full">
                  <Tag className="w-3 h-3 mr-1" />
                  {story.category}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {story.date}
                </span>
                <span className="text-gray-500 text-sm">{story.readTime}</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-community-navy mb-4">
                {story.title}
              </h1>
              
              <p className="text-xl text-gray-600 font-body mb-6">
                {story.excerpt}
              </p>
              
              <p className="text-sm text-gray-500">
                By {story.author}
              </p>
            </div>

            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
              <img 
                src={story.image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div 
              className="prose prose-lg max-w-none font-body"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          </article>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-semibold text-community-navy mb-2">
                  Share this story
                </h3>
                <p className="text-gray-600">Help spread the word about community news</p>
              </div>
              <Button onClick={() => navigate('/')} className="bg-community-navy hover:bg-slate-700">
                Read More Stories
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Story;