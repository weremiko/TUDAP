import { pgTable, text, timestamp, boolean, serial, integer } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  institution: text('institution'),
  bio: text('bio'),
  profileVisibility: boolean('profile_visibility').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const glossaryEntries = pgTable('glossary_entries', {
  id: serial('id').primaryKey(),
  term: text('term').notNull(),
  phonetic: text('phonetic').notNull().default(''),
  category: text('category').notNull().default('Genel Dilbilim'),
  definition: text('definition').notNull(),
  englishEquivalent: text('english_equivalent').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const queryLogs = pgTable('query_logs', {
  id: serial('id').primaryKey(),
  inputText: text('input_text').notNull(),
  ipaOutput: text('ipa_output').notNull(),
  transcriptionType: text('transcription_type').notNull().default('broad'),
  charCount: integer('char_count').notNull().default(0),
  ipAddress: text('ip_address'),
  userId: text('user_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const errorReports = pgTable('error_reports', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  userEmail: text('user_email').notNull().default('anonymous'),
  url: text('url').notNull().default(''),
  errorWord: text('error_word').notNull().default(''),
  resolved: boolean('resolved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull().default(''),
  excerpt: text('excerpt').notNull().default(''),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull().default(''),
  tags: text('tags').notNull().default(''),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const customTranscriptions = pgTable('custom_transcriptions', {
  id: serial('id').primaryKey(),
  input: text('input').notNull().unique(),
  output: text('output').notNull(),
  category: text('category').notNull().default('exception'),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const pageSections = pgTable('page_sections', {
  id: serial('id').primaryKey(),
  page: text('page').notNull(),
  key: text('key').notNull(),
  label: text('label').notNull(),
  content: text('content').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  eventType: text('event_type').notNull().default('seminar'),
  date: timestamp('date').notNull(),
  location: text('location').notNull().default(''),
  organizer: text('organizer').notNull().default(''),
  url: text('url').notNull().default(''),
  tags: text('tags').notNull().default(''),
  endDate: timestamp('end_date'),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ---
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
