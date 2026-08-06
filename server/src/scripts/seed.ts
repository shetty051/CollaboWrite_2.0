import dns from 'dns';

// Prioritize IPv4 DNS resolution (resolves Windows Node.js querySrv issues)
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Failed to set public DNS servers:', err);
}

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { User, IUser } from '../models/userModel';
import { Story } from '../models/storyModel';
import { Rating } from '../models/ratingModel';
import { Comment } from '../models/commentModel';

dotenv.config();

const MOCK_TITLES = [
  { title: 'The Silent Whispers of Autumn', genre: 'Fiction', slug: 'silent-autumn-whispers' },
  { title: 'Code of the Constellations', genre: 'Sci-Fi', slug: 'code-constellations' },
  { title: 'Echoes of the High-End Bookstore', genre: 'Memoir', slug: 'echoes-high-end-bookstore' },
  { title: 'Shadows over Terracotta', genre: 'Mystery', slug: 'shadows-terracotta' },
  { title: 'Algorithms & Ink Spills', genre: 'Poetry', slug: 'algorithms-ink-spills' },
  { title: 'The Lost Ledger of Venice', genre: 'Historical', slug: 'lost-ledger-venice' },
  { title: 'Whispering Willow Leaves', genre: 'Fiction', slug: 'whispering-willow' },
  { title: 'The Cyberpunk Library', genre: 'Sci-Fi', slug: 'cyberpunk-library' },
  { title: 'Under the Terracotta Roofs', genre: 'Drama', slug: 'under-terracotta' },
  { title: 'Ink and Iron', genre: 'Historical', slug: 'ink-iron' },
  { title: 'A Study in Gold', genre: 'Mystery', slug: 'study-gold' },
  { title: 'Staring at Bracket Errors', genre: 'Memoir', slug: 'bracket-errors' },
  { title: 'Midnight Coffee Margins', genre: 'Poetry', slug: 'coffee-margins' },
  { title: 'Chronicles of the Burnt Petals', genre: 'Mystery', slug: 'burnt-petals' },
  { title: 'The Silent Editor', genre: 'Drama', slug: 'silent-editor' },
  { title: 'Warp Drive & Quill Pens', genre: 'Sci-Fi', slug: 'warp-drive-quill' },
  { title: 'Anatomy of a Blank Page', genre: 'Memoir', slug: 'blank-page-anatomy' },
  { title: 'The Merchant of Florence', genre: 'Historical', slug: 'merchant-florence' },
  { title: 'Scribbled Dreams', genre: 'Poetry', slug: 'scribbled-dreams' },
  { title: 'The Bookstore at the End of Time', genre: 'Sci-Fi', slug: 'bookstore-end-time' },
  { title: 'Whispers from the Shards', genre: 'Mystery', slug: 'whispers-shards' },
  { title: 'Vellum and Voltage', genre: 'Sci-Fi', slug: 'vellum-voltage' },
  { title: 'The Edinburgh Library Archives', genre: 'Memoir', slug: 'edinburgh-archives' },
  { title: 'The Clay Scribe', genre: 'Historical', slug: 'clay-scribe' },
  { title: 'Starlight Ink', genre: 'Poetry', slug: 'starlight-ink' },
];

const runSeeder = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    // 1. Clear database
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Story.deleteMany({});
    await Rating.deleteMany({});
    await Comment.deleteMany({});

    // 2. Generate and Hash Passwords
    console.log('Hashing passwords for mock users...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    // 3. Create Users
    console.log('Seeding 15 users...');
    const usersData = Array.from({ length: 15 }).map((_, idx) => {
      const isWriter = idx < 7;
      const firstName = isWriter ? 'Writer' : 'Reader';
      const lastName = isWriter ? String(idx + 1) : String(idx - 6);
      return {
        firstName,
        lastName,
        email: isWriter ? `writer${idx + 1}@collabowrite.com` : `reader${idx - 6}@collabowrite.com`,
        passwordHash: defaultPasswordHash,
        role: isWriter ? ('writer' as const) : ('reader' as const),
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=user_${idx}`,
        bio: `This is a mock bio for user number ${idx + 1}, sharing a passion for real-time literature creation.`,
        followers: [],
        following: [],
      };
    });

    const seededUsers = await User.insertMany(usersData);
    console.log(`Seeded ${seededUsers.length} users successfully.`);

    // Extract writers and readers
    const writers = seededUsers.filter((u: IUser) => u.role === 'writer');
    const readers = seededUsers.filter((u: IUser) => u.role === 'reader');

    // 4. Create Stories
    console.log('Seeding 25 stories...');
    const storiesData = MOCK_TITLES.map((t, idx) => {
      const author = writers[idx % writers.length];
      const coAuthorIndex = (idx + 1) % writers.length;
      const coAuthors =
        writers[coAuthorIndex]._id.toString() !== author._id.toString()
          ? [writers[coAuthorIndex]._id]
          : [];

      // 20 published, 5 drafts
      const isPublished = idx < 20;

      return {
        title: t.title,
        subtitle: `An exploration of style, substance, and structure in ${t.genre}.`,
        author: author._id,
        coAuthors,
        genres: [t.genre],
        tags: [t.genre.toLowerCase(), 'editorial', 'collaborative'],
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: `Chapter I: The Genesis of ${t.title}` }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is mock TIptap rich text JSON content. The characters flow smoothly, compiled through WebSocket channels, stored into the cloud document nodes. Writing with co-authors adds a conversational layer to the creative process.',
                },
              ],
            },
          ],
        },
        coverImageUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400`,
        status: isPublished ? ('published' as const) : ('draft' as const),
        isPubliclyShareable: idx % 2 === 0, // Alternate shareability
        shareSlug: t.slug,
        viewCount: Math.floor(Math.random() * 200) + 15,
        publishedAt: isPublished ? new Date(Date.now() - idx * 24 * 60 * 60 * 1000) : undefined,
      };
    });

    const seededStories = await Story.insertMany(storiesData);
    console.log(`Seeded ${seededStories.length} stories successfully.`);

    // 5. Seed Ratings & Comments
    console.log('Seeding ratings and comments...');
    for (const story of seededStories) {
      if (story.status === 'published') {
        // Randomly rate this story by 2 to 5 readers
        const raters = [...readers]
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 4) + 2);

        for (const rater of raters) {
          const ratingVal = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
          await Rating.create({
            story: story._id,
            user: rater._id,
            value: ratingVal,
          });
        }

        // Add 1-2 comments per published story
        const commenters = [...readers, ...writers]
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 2) + 1);
        for (const commenter of commenters) {
          await Comment.create({
            story: story._id,
            user: commenter._id,
            text: `This is a mock collaborative comment for "${story.title}". The editorial spacing is wonderful!`,
          });
        }
      }
    }

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

runSeeder();
