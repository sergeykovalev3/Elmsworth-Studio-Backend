import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  cover: text('cover').notNull(),
  body: text('body').notNull().default(''),
  postedOn: text('posted_on').notNull().default(''),
  author: text('author').notNull().default('Mara Voss'),
  published: boolean('published').notNull().default(true),
})

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  cover: text('cover').notNull(),
  photos: text('photos').notNull(),
  categories: text('categories').notNull(),
  body: text('body').notNull().default(''),
  video: text('video').notNull().default(''),
  published: boolean('published').notNull().default(true),
})

/** Better Auth tables — fill when DATABASE_URL is set. See better-auth drizzle adapter. */
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified').notNull().default(0),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
