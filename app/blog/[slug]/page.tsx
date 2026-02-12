import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/marketing";

// Blog post data - In production, this would come from a CMS
const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}> = {
  "ultimate-guide-wedding-invitations-2024": {
    title: "The Ultimate Guide to Wedding Invitations in 2024",
    excerpt: "Everything you need to know about creating stunning wedding invitations that perfectly capture your special day.",
    content: `
      <p class="lead">Your wedding invitation is the first glimpse your guests will have of your special day. It sets the tone, builds excitement, and provides crucial information. In 2024, wedding invitations have evolved beyond simple paper announcements to become true works of art that reflect your unique love story.</p>

      <h2>Trends Shaping Wedding Invitations in 2024</h2>

      <h3>1. Digital-First Designs</h3>
      <p>While traditional paper invitations remain popular, digital invitations have taken center stage in 2024. They offer several advantages:</p>
      <ul>
        <li><strong>Instant delivery</strong> - No waiting for postal mail</li>
        <li><strong>Real-time RSVP tracking</strong> - Know who's coming instantly</li>
        <li><strong>Eco-friendly</strong> - Reduce paper waste</li>
        <li><strong>Cost-effective</strong> - Save on printing and postage</li>
        <li><strong>Interactive elements</strong> - Add videos, maps, and countdown timers</li>
      </ul>

      <h3>2. Minimalist Elegance</h3>
      <p>Clean lines, lots of white space, and sophisticated typography define the minimalist trend. Think simple serif fonts, subtle color palettes (sage green, dusty rose, warm neutrals), and understated illustrations.</p>

      <h3>3. Hand-Drawn & Illustrated Elements</h3>
      <p>Custom illustrations, hand-drawn florals, and watercolor elements add a personal, artisanal touch. These designs feel intimate and unique to each couple.</p>

      <h3>4. Bold Typography</h3>
      <p>Statement fonts are making a splash. Oversized letters, creative layouts, and mixing font styles create visual interest and help your invitation stand out.</p>

      <h3>5. Interactive & Animated Invitations</h3>
      <p>Digital invitations now feature subtle animations, interactive maps, integrated RSVP forms, and even music. These create a memorable experience for your guests.</p>

      <h2>Essential Information to Include</h2>

      <p>Every wedding invitation should include:</p>
      <ol>
        <li><strong>Names</strong> - Bride and groom (in your preferred order)</li>
        <li><strong>Date and time</strong> - Be specific about the ceremony start time</li>
        <li><strong>Venue details</strong> - Full address with any helpful directions</li>
        <li><strong>Dress code</strong> - Black tie, cocktail, casual, etc.</li>
        <li><strong>RSVP information</strong> - Deadline and how to respond</li>
        <li><strong>Wedding website</strong> - For additional details</li>
      </ol>

      <h2>Timeline for Sending Invitations</h2>

      <table>
        <tr>
          <td><strong>Save the Dates:</strong></td>
          <td>6-8 months before (12 months for destination weddings)</td>
        </tr>
        <tr>
          <td><strong>Formal Invitations:</strong></td>
          <td>6-8 weeks before the wedding</td>
        </tr>
        <tr>
          <td><strong>RSVP Deadline:</strong></td>
          <td>2-3 weeks before the wedding</td>
        </tr>
      </table>

      <h2>Creating Your Perfect Invitation with InviteGenerator</h2>

      <p>With InviteGenerator, creating stunning wedding invitations is easier than ever:</p>
      <ol>
        <li><strong>Choose a template</strong> - Browse our collection of 48+ wedding designs</li>
        <li><strong>Customize everything</strong> - Colors, fonts, images, and layout</li>
        <li><strong>Add your details</strong> - Use our guided form to ensure nothing is missed</li>
        <li><strong>Enable RSVP tracking</strong> - Let guests respond with one click</li>
        <li><strong>Share instantly</strong> - Via email, text, or social media</li>
      </ol>

      <h2>Final Thoughts</h2>

      <p>Your wedding invitation should reflect who you are as a couple. Whether you prefer classic elegance, modern minimalism, or playful creativity, there's no wrong choice - only your unique choice.</p>

      <p>Ready to create your dream wedding invitation? <a href="/dashboard/create">Start designing for free</a> with InviteGenerator today.</p>
    `,
    category: "Wedding",
    author: "Emma Wilson",
    authorRole: "Wedding Expert",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "/images/blog/wedding-guide.jpg",
    tags: ["wedding", "invitations", "planning", "design", "2024 trends"],
  },
  "10-birthday-invitation-ideas": {
    title: "10 Creative Birthday Invitation Ideas That Will Wow Your Guests",
    excerpt: "From elegant adult celebrations to fun kids' parties, discover invitation ideas that set the perfect tone for any birthday bash.",
    content: `
      <p class="lead">A birthday invitation is more than just an announcement - it's the opening act of your celebration. The right invitation builds anticipation, sets expectations, and gets your guests excited to attend. Here are 10 creative birthday invitation ideas to inspire your next party.</p>

      <h2>1. Theme-Based Invitations</h2>
      <p>Match your invitation to your party theme for a cohesive experience. Hosting a tropical luau? Use palm trees and hibiscus flowers. Planning a decade party? Go retro with the design elements of that era.</p>
      <p><strong>Pro tip:</strong> Include a teaser about what guests can expect at the party to build excitement.</p>

      <h2>2. Photo Collage Invitations</h2>
      <p>Create a timeline of memories by featuring photos from previous birthdays. This works beautifully for milestone birthdays like 30th, 50th, or 1st birthdays where you can show growth over the years.</p>

      <h2>3. Video Invitations</h2>
      <p>Take your invitation to the next level with a short video. Include a personalized message, clips from past celebrations, or even a countdown to the big day. Digital invitations make this easy to share instantly.</p>

      <h2>4. Interactive Invitations</h2>
      <p>Add gamification elements like:</p>
      <ul>
        <li>A puzzle guests need to solve for party details</li>
        <li>A scratch-off element revealing the theme</li>
        <li>A countdown timer to build anticipation</li>
        <li>An interactive map showing the venue</li>
      </ul>

      <h2>5. Character/Mascot Invitations (for Kids)</h2>
      <p>Feature your child's favorite character or create a custom mascot. Popular themes include superheroes, princesses, dinosaurs, and animals. Include fun facts or trivia about the theme.</p>

      <h2>6. Minimalist Modern Design</h2>
      <p>Sometimes less is more. A clean design with bold typography, subtle color accents, and plenty of white space creates a sophisticated look perfect for adult celebrations.</p>

      <h2>7. Illustrated Custom Portraits</h2>
      <p>Commission or create a cartoon/illustrated portrait of the birthday person. These make the invitation feel special and can be repurposed as party decorations or thank-you cards.</p>

      <h2>8. Ticket-Style Invitations</h2>
      <p>Design your invitation like a concert ticket, movie ticket, or admission pass. This works great for milestone birthdays or when you're planning an experiential celebration.</p>

      <h2>9. Vintage/Retro Designs</h2>
      <p>Draw inspiration from different eras - 70s disco, 80s neon, 90s pop culture, or classic Hollywood glamour. Match fonts, colors, and graphic elements to your chosen decade.</p>

      <h2>10. Personalized QR Code Invitations</h2>
      <p>Create a unique QR code that leads to:</p>
      <ul>
        <li>A personalized video message</li>
        <li>A Spotify playlist for the party</li>
        <li>Your RSVP and event details page</li>
        <li>A memory book where guests can share wishes</li>
      </ul>

      <h2>Tips for Any Birthday Invitation</h2>
      <ol>
        <li><strong>Send early</strong> - 3-4 weeks for casual parties, 6-8 weeks for larger events</li>
        <li><strong>Include all essentials</strong> - Date, time, location, RSVP info, dress code if applicable</li>
        <li><strong>Set the tone</strong> - Your design should hint at what kind of party it will be</li>
        <li><strong>Make RSVPing easy</strong> - Use digital invitations with one-click responses</li>
        <li><strong>Add a personal touch</strong> - A custom note or inside joke makes it memorable</li>
      </ol>

      <h2>Create Your Perfect Birthday Invitation</h2>
      <p>Ready to design an invitation that gets everyone excited? InviteGenerator offers 60+ birthday templates that you can customize to match any theme, age, or style. Plus, built-in RSVP tracking makes managing your guest list a breeze.</p>

      <p><a href="/templates?category=birthday">Browse birthday templates</a> or <a href="/dashboard/create">start creating</a> your custom invitation today!</p>
    `,
    category: "Birthday",
    author: "Sarah Chen",
    authorRole: "Event Designer",
    date: "2024-01-12",
    readTime: "5 min read",
    image: "/images/blog/birthday-ideas.jpg",
    tags: ["birthday", "party planning", "creative ideas", "kids parties", "adult parties"],
  },
  "digital-vs-paper-invitations": {
    title: "Digital vs. Paper Invitations: Which Is Right for Your Event?",
    excerpt: "Weighing the pros and cons of digital and traditional invitations for modern events.",
    content: `
      <p class="lead">The invitation debate has evolved significantly in recent years. While paper invitations carry tradition and tactile charm, digital invitations offer convenience and modern features. Let's explore both options to help you make the best choice for your event.</p>

      <h2>The Case for Digital Invitations</h2>

      <h3>Advantages</h3>
      <ul>
        <li><strong>Instant delivery:</strong> Reach guests anywhere in the world immediately</li>
        <li><strong>Cost-effective:</strong> No printing, paper, or postage costs</li>
        <li><strong>Eco-friendly:</strong> Zero paper waste, reduced carbon footprint</li>
        <li><strong>Easy RSVP tracking:</strong> Real-time responses and automatic tallying</li>
        <li><strong>Easy updates:</strong> Change details without reprinting</li>
        <li><strong>Interactive features:</strong> Add maps, videos, links, and countdown timers</li>
        <li><strong>Guest management:</strong> Send reminders, updates, and thank-you notes</li>
        <li><strong>Analytics:</strong> Know who opened your invitation and when</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Casual gatherings and parties</li>
        <li>Last-minute events</li>
        <li>Large guest lists</li>
        <li>Environmentally conscious hosts</li>
        <li>Budget-conscious planning</li>
        <li>Destination events with guests spread across locations</li>
        <li>Corporate events and professional gatherings</li>
      </ul>

      <h2>The Case for Paper Invitations</h2>

      <h3>Advantages</h3>
      <ul>
        <li><strong>Tactile experience:</strong> Physical invitations feel special and memorable</li>
        <li><strong>Traditional appeal:</strong> Perfect for formal occasions</li>
        <li><strong>Keepsake value:</strong> Guests often save paper invitations as mementos</li>
        <li><strong>No tech barriers:</strong> Everyone can receive and read them</li>
        <li><strong>Design possibilities:</strong> Special papers, textures, and printing techniques</li>
        <li><strong>Perceived formality:</strong> Signals the importance of the event</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Weddings and formal celebrations</li>
        <li>Milestone events (50th anniversary, retirement)</li>
        <li>Events where tradition matters</li>
        <li>Older guests who prefer physical mail</li>
        <li>When you want a keepsake element</li>
      </ul>

      <h2>The Hybrid Approach</h2>

      <p>Why choose when you can have both? Many hosts are now using a hybrid approach:</p>
      <ul>
        <li><strong>Paper + Digital RSVP:</strong> Send beautiful paper invitations with a QR code or link for easy online RSVPing</li>
        <li><strong>Digital first, paper follow-up:</strong> Send digital save-the-dates, then paper formal invitations</li>
        <li><strong>Segmented approach:</strong> Paper for close family, digital for extended network</li>
        <li><strong>Digital + keepsake:</strong> Digital invitation with a printable version for guests who want one</li>
      </ul>

      <h2>Cost Comparison</h2>

      <table>
        <tr>
          <th></th>
          <th>Digital</th>
          <th>Paper (100 guests)</th>
        </tr>
        <tr>
          <td>Design</td>
          <td>$0-30</td>
          <td>$0-500</td>
        </tr>
        <tr>
          <td>Production</td>
          <td>$0</td>
          <td>$200-600</td>
        </tr>
        <tr>
          <td>Postage</td>
          <td>$0</td>
          <td>$60-150</td>
        </tr>
        <tr>
          <td>RSVP Tracking</td>
          <td>Included</td>
          <td>Manual</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>$0-30</strong></td>
          <td><strong>$260-1,250</strong></td>
        </tr>
      </table>

      <h2>Making Your Decision</h2>

      <p>Consider these questions:</p>
      <ol>
        <li>What's your budget?</li>
        <li>How formal is your event?</li>
        <li>Who is your audience? (Age, tech-savviness)</li>
        <li>How important is environmental impact to you?</li>
        <li>Do you need advanced features like RSVP tracking?</li>
        <li>How much time do you have?</li>
      </ol>

      <h2>The Verdict</h2>

      <p>There's no universally "right" answer. Digital invitations are increasingly accepted for all types of events, including weddings. The key is matching your invitation style to your event's tone and your guests' expectations.</p>

      <p>Whatever you choose, InviteGenerator makes digital invitations beautiful, professional, and easy. <a href="/dashboard/create">Try it free</a> and see the difference.</p>
    `,
    category: "Guide",
    author: "Emma Wilson",
    authorRole: "Wedding Expert",
    date: "2024-01-08",
    readTime: "4 min read",
    image: "/images/blog/digital-paper.jpg",
    tags: ["digital invitations", "paper invitations", "comparison", "event planning"],
  },
  "rsvp-management-tips": {
    title: "RSVP Management Made Easy: Tips for Stress-Free Event Planning",
    excerpt: "Learn how to track RSVPs efficiently and ensure your event planning goes smoothly.",
    content: `
      <p class="lead">Managing RSVPs can be one of the most stressful parts of event planning. Between chasing down responses, tracking dietary requirements, and managing last-minute changes, it's easy to feel overwhelmed. Here's how to make RSVP management stress-free.</p>

      <h2>Set Clear Deadlines</h2>

      <p>Be specific about your RSVP deadline and communicate why it matters:</p>
      <ul>
        <li>Set your deadline 2-3 weeks before the event</li>
        <li>Explain that you need headcounts for catering/seating</li>
        <li>Include the deadline prominently on your invitation</li>
        <li>Send a reminder 1 week before the deadline</li>
      </ul>

      <h2>Make Responding Easy</h2>

      <p>The easier you make it to RSVP, the faster you'll get responses:</p>
      <ul>
        <li><strong>One-click digital RSVPs</strong> - Remove all friction</li>
        <li><strong>Multiple response options</strong> - Email, text, or web form</li>
        <li><strong>Mobile-friendly forms</strong> - Most people will RSVP from their phones</li>
        <li><strong>Pre-fill known information</strong> - Don't make guests re-enter details</li>
      </ul>

      <h2>Collect the Right Information</h2>

      <p>Your RSVP form should gather:</p>
      <ol>
        <li>Guest name(s)</li>
        <li>Attendance status (Yes/No/Maybe)</li>
        <li>Number of guests attending</li>
        <li>Meal preferences (if applicable)</li>
        <li>Dietary restrictions/allergies</li>
        <li>Any custom questions you need answered</li>
      </ol>

      <p><strong>Pro tip:</strong> Don't ask for unnecessary information. Every additional field reduces response rates.</p>

      <h2>Track and Organize Responses</h2>

      <p>Keep your RSVP data organized with:</p>
      <ul>
        <li>A centralized tracking system (spreadsheet or dedicated tool)</li>
        <li>Categories: Attending, Not Attending, Pending, No Response</li>
        <li>Special notes (dietary needs, plus-ones, etc.)</li>
        <li>Contact information for follow-ups</li>
      </ul>

      <h2>Handle Non-Responders</h2>

      <p>Some guests will inevitably miss the deadline. Here's how to handle it:</p>
      <ol>
        <li><strong>Send a reminder</strong> - Friendly, not accusatory</li>
        <li><strong>Make it personal</strong> - A quick text or call works better than mass emails</li>
        <li><strong>Set a final deadline</strong> - Be clear about when you need the final count</li>
        <li><strong>Have a backup plan</strong> - Assume 10-15% of non-responders will show up</li>
      </ol>

      <h2>Manage Last-Minute Changes</h2>

      <p>Changes happen. Be prepared:</p>
      <ul>
        <li>Build in a small buffer for your headcount</li>
        <li>Know your venue's final count deadline</li>
        <li>Have a process for communicating changes (guest adds, cancellations)</li>
        <li>Keep your caterer in the loop about dietary changes</li>
      </ul>

      <h2>Use Technology to Your Advantage</h2>

      <p>Modern RSVP tools like InviteGenerator offer:</p>
      <ul>
        <li><strong>Automatic tracking</strong> - See responses in real-time</li>
        <li><strong>Automated reminders</strong> - Set it and forget it</li>
        <li><strong>Guest list exports</strong> - Download data for vendors</li>
        <li><strong>Analytics</strong> - Track open rates and response rates</li>
        <li><strong>Mobile access</strong> - Manage your list from anywhere</li>
      </ul>

      <h2>Sample RSVP Timeline</h2>

      <table>
        <tr><td><strong>6-8 weeks out:</strong></td><td>Send invitations</td></tr>
        <tr><td><strong>3 weeks out:</strong></td><td>RSVP deadline</td></tr>
        <tr><td><strong>2.5 weeks out:</strong></td><td>Send reminders to non-responders</td></tr>
        <tr><td><strong>2 weeks out:</strong></td><td>Final deadline for late RSVPs</td></tr>
        <tr><td><strong>10 days out:</strong></td><td>Finalize headcount for vendors</td></tr>
        <tr><td><strong>1 week out:</strong></td><td>Send final event details to confirmed guests</td></tr>
      </table>

      <h2>Start Tracking with InviteGenerator</h2>

      <p>InviteGenerator's built-in RSVP tracking makes guest management effortless. See responses in real-time, export guest lists with one click, and never chase down another RSVP again.</p>

      <p><a href="/features">Explore RSVP features</a> or <a href="/dashboard/create">create your first invitation</a> with built-in tracking.</p>
    `,
    category: "Planning",
    author: "Michael Torres",
    authorRole: "Event Planner",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "/images/blog/rsvp-tips.jpg",
    tags: ["RSVP", "event planning", "guest management", "organization"],
  },
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return {
      title: "Post Not Found | InviteGenerator Blog",
    };
  }

  return {
    title: `${post.title} | InviteGenerator Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  const shareUrl = `https://invitegenerator.com/blog/${slug}`;

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <article className="pt-32 pb-20">
        <div className="container-custom">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-surface-600 hover:text-brand-600 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-surface-900 mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-surface-600 mb-8">{post.excerpt}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-surface-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  {post.author}, {post.authorRole}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </header>

          {/* Featured Image Placeholder */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="aspect-[16/9] bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center">
              <span className="text-brand-400 text-lg">Featured Image</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg prose-brand max-w-none
                prose-headings:font-heading prose-headings:text-surface-900
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-surface-700 prose-p:leading-relaxed
                prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
                prose-ul:text-surface-700 prose-ol:text-surface-700
                prose-li:mb-2
                prose-table:text-sm prose-table:border prose-table:border-surface-200
                prose-td:p-3 prose-td:border prose-td:border-surface-200
                prose-th:p-3 prose-th:border prose-th:border-surface-200 prose-th:bg-surface-100
                [&_.lead]:text-xl [&_.lead]:text-surface-600 [&_.lead]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-surface-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-surface-100 text-surface-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-surface-600 font-medium flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share:
              </span>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl p-8 text-center text-white">
              <h2 className="font-heading text-2xl font-bold mb-4">
                Ready to Create Your Invitation?
              </h2>
              <p className="mb-6 opacity-90">
                Start designing beautiful invitations for free with InviteGenerator.
              </p>
              <Link href="/dashboard/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-brand-600"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-2xl mx-auto mt-16">
            <NewsletterSignup variant="hero" />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
