import { existsSync, readFileSync } from 'node:fs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.ts'
import { insertExtraProjects } from './seed-projects.ts'

function loadEnvFile() {
  const path = new URL('../../.env', import.meta.url)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile()
const memoryOnly = process.env.ELMSWORTH_STORE === 'memory'
if (!memoryOnly && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://elmsworth:elmsworth@127.0.0.1:5433/elmsworth'
}

const url = memoryOnly ? '' : process.env.DATABASE_URL

export const sql = url ? postgres(url) : null
export const db = sql ? drizzle(sql, { schema }) : null

export async function ensureSchema() {
  if (!sql) throw new Error('DATABASE_URL is required')
  await sql`select 1`
  await sql`
    CREATE TABLE IF NOT EXISTS requests (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      phone text,
      message text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false
  `
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id text PRIMARY KEY,
      title text NOT NULL,
      cover text NOT NULL,
      photos text NOT NULL,
      categories text NOT NULL,
      published boolean NOT NULL DEFAULT true
    )
  `
  await sql`
    INSERT INTO projects (id, title, cover, photos, categories, published)
    SELECT
      'court-millvale',
      'A quiet court in Millvale',
      '/design-build/project-1.jpg',
      '/design-build/project-1.jpg,/design-build/project-2.jpg,/design-build/project-3.jpg',
      'Landscapes',
      true
    WHERE NOT EXISTS (SELECT 1 FROM projects)
  `
  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT ''
  `
  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS video text NOT NULL DEFAULT ''
  `
  const terrace = {
    title: 'A terrace for long evenings',
    cover: '/home/projects/1.jpg',
    categories: 'Landscapes,Hardscapes',
    photos: [
      '/home/projects/3.jpg',
      '/home/projects/4.jpg',
      '/home/projects/5.jpg',
      '/kitchens/offer-1.jpg',
      '/kitchens/offer-2.jpg',
      '/kitchens/side.jpg',
      '/patios/offer-1.jpg',
      '/patios/offer-2.jpg',
      '/kitchens/offer-3.jpg',
      '/home/projects/6.jpg',
      '/home/projects/7.jpg',
      '/home/projects/8.jpg',
      '/outdoor-living/offer-2.jpg',
      '/outdoor-living/side.jpg',
      '/hardscapes/side.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<p>The terrace sits against the house as a series of connected rooms: a place to eat, a place to sit by the fire, and a quieter edge where the planting takes over.</p><p>Privacy and openness are held in the same plan. A low wall keeps the main seats tucked in, while the far side stays open to the lawn.</p><h2>Made for gathering</h2><p>The largest stone pad is the evening room. It is split into a dining run and a lower lounge, close enough to share one conversation and separate enough that a smaller group can sit apart.</p><p>A banquet bench is built into the privacy wall, so the seating does not depend on loose chairs. The fire table is the center of that lower room and stays useful after the meal is cleared.</p>',
      },
      {
        type: 'photos',
        images: ['/home/projects/3.jpg', '/home/projects/4.jpg', '/home/projects/5.jpg'],
      },
      {
        type: 'text',
        html: '<h2>A kitchen in the open air</h2><p>The grill, prep counter, and a short bar sit on the same level as the dining table. Whoever is cooking stays in the group instead of disappearing inside.</p><p>The bar is the pause before dinner and the place people drift back to later. Paths between the kitchen, the table, and the fire are short and level.</p>',
      },
      {
        type: 'photos',
        images: [
          '/kitchens/offer-1.jpg',
          '/kitchens/offer-2.jpg',
          '/kitchens/side.jpg',
          '/patios/offer-1.jpg',
          '/patios/offer-2.jpg',
          '/kitchens/offer-3.jpg',
        ],
      },
      {
        type: 'text',
        html: '<p>The kitchen is not a separate pavilion. It is part of the same stone field, so the craft of the counters and the craft of the paving read as one job.</p><h2>A deck between the house and the court</h2><p>The upper deck is the step out of the living room and a seat of its own. Morning light hits it first. From there the patio, the fire, and the kitchen line up as one composition.</p><p>Moving down to the court is a short run of steps, not a detour. The day can start upstairs and finish by the fire without the yard feeling like separate projects.</p>',
      },
      {
        type: 'photos',
        images: [
          '/home/projects/6.jpg',
          '/home/projects/7.jpg',
          '/home/projects/8.jpg',
          '/outdoor-living/offer-2.jpg',
          '/outdoor-living/side.jpg',
          '/hardscapes/side.jpg',
        ],
      },
      {
        type: 'text',
        html: '<p>That easy step between levels is the point of the plan: the outdoor rooms should feel obvious to use from breakfast through a late evening.</p><h2>What it became</h2><p>The finished court holds a dinner, a quiet hour, and a full table of guests without being rebuilt for each one. It is one landscape, meant to stay in use from the first warm week to the last fire of the year.</p>',
      },
    ],
  }
  await sql`
    UPDATE projects
    SET
      title = ${terrace.title},
      cover = ${terrace.cover},
      photos = ${terrace.photos.join(',')},
      categories = ${terrace.categories},
      body = ${JSON.stringify(terrace.body)},
      video = ''
    WHERE id = 'court-millvale' AND title = 'A quiet court in Millvale'
  `
  const pool = {
    id: 'shaded-pool-court',
    title: 'A shaded pool court',
    cover: '/pools/cover.jpg',
    categories: 'Pools & Water Features,Landscapes',
    photos: [
      '/pools/offer-1.jpg',
      '/pools/offer-2.jpg',
      '/pools/offer-3.jpg',
      '/pools/offer-4.jpg',
      '/pools/offer-5.jpg',
      '/pools/side.jpg',
      '/pavilions/offer-1.jpg',
      '/pavilions/offer-2.jpg',
      '/pavilions/offer-3.jpg',
      '/lighting/offer-1.jpg',
      '/lighting/side.jpg',
      '/pools/faq.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>Water held in the garden</h1><p>The pool sits in a stone court rather than on an open lawn. Planting on two sides keeps the water private, and the far edge stays open toward the house.</p><h2>The water room</h2><p>A broad deck wraps the near side, wide enough for lounges without crowding the steps into the water. The coping and the paving are the same stone, so the pool reads as part of the court.</p>',
      },
      {
        type: 'photos',
        images: [
          '/pools/offer-1.jpg',
          '/pools/offer-2.jpg',
          '/pools/offer-3.jpg',
          '/pools/offer-4.jpg',
          '/pools/offer-5.jpg',
          '/pools/side.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Shade over the shallow end</h2><p>A pavilion covers the shallow shelf and a small table. People can eat there at midday without leaving the water behind. The posts land outside the deck, so the walk around the pool stays clear.</p>',
      },
      {
        type: 'photos',
        images: ['/pavilions/offer-1.jpg', '/pavilions/offer-2.jpg', '/pavilions/offer-3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Light after dusk</h2><p>Low fixtures mark the steps and the outer planting. The water stays the brightest surface. The court can be used after dinner without a flood of light on the house.</p><p>What remains is one pool, one shade roof, and a garden edge. It is meant for a long afternoon and a quiet evening, not a separate list of features.</p>',
      },
      {
        type: 'photos',
        images: ['/lighting/offer-1.jpg', '/lighting/side.jpg', '/pools/faq.jpg'],
      },
    ],
  }
  await sql`
    INSERT INTO projects (id, title, cover, photos, categories, body, video, published)
    SELECT
      ${pool.id},
      ${pool.title},
      ${pool.cover},
      ${pool.photos.join(',')},
      ${pool.categories},
      ${JSON.stringify(pool.body)},
      '',
      true
    WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = ${pool.id})
  `
  const hearth = {
    id: 'evening-hearth-garden',
    title: 'An evening hearth garden',
    cover: '/fireplaces/cover.jpg',
    categories: 'Lighting,Hardscapes',
    photos: [
      '/fireplaces/offer-1.jpg',
      '/fireplaces/side.jpg',
      '/fireplaces/bottom.jpg',
      '/hardscapes/offer-1.jpg',
      '/hardscapes/side.jpg',
      '/hardscapes/bottom.jpg',
      '/lighting/offer-1.jpg',
      '/lighting/side.jpg',
      '/lighting/bottom.jpg',
      '/landscapes/craft-1.jpg',
      '/landscapes/craft-2.png',
      '/landscapes/craft-3.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>A fire at the end of the walk</h1><p>The hearth is the last room in the garden, not a feature dropped in the lawn. A stone path leads to it, and the planting closes in on both sides so the seat feels held.</p><h2>The hearth</h2><p>The fire sits in a low wall of the same stone as the path. Benches face it, close enough for a small group and far enough from the house that the evening stays outside.</p>',
      },
      {
        type: 'photos',
        images: [
          '/fireplaces/offer-1.jpg',
          '/fireplaces/side.jpg',
          '/fireplaces/bottom.jpg',
          '/hardscapes/offer-1.jpg',
          '/hardscapes/side.jpg',
          '/hardscapes/bottom.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Light along the path</h2><p>Fixtures stay low, at the edge of the paving. They mark the walk back to the house without lighting the whole garden. The fire remains the bright point.</p>',
      },
      {
        type: 'photos',
        images: ['/lighting/offer-1.jpg', '/lighting/side.jpg', '/lighting/bottom.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Planting that holds the room</h2><p>Shrubs and a narrow bed wrap the benches. In leaf they screen the neighbors. In winter the stone and the fire still read as one place.</p><p>The garden ends here on purpose: a short walk, a fire, and a way home that is easy to see after dark.</p>',
      },
      {
        type: 'photos',
        images: ['/landscapes/craft-1.jpg', '/landscapes/craft-2.png', '/landscapes/craft-3.jpg'],
      },
    ],
  }
  await sql`
    INSERT INTO projects (id, title, cover, photos, categories, body, video, published)
    SELECT
      ${hearth.id},
      ${hearth.title},
      ${hearth.cover},
      ${hearth.photos.join(',')},
      ${hearth.categories},
      ${JSON.stringify(hearth.body)},
      '',
      true
    WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = ${hearth.id})
  `
  await insertExtraProjects(sql)
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id text PRIMARY KEY,
      title text NOT NULL,
      excerpt text NOT NULL DEFAULT '',
      cover text NOT NULL,
      body text NOT NULL DEFAULT '',
      posted_on text NOT NULL DEFAULT '',
      published boolean NOT NULL DEFAULT true
    )
  `
  await sql`
    ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS author text NOT NULL DEFAULT 'Mara Voss'
  `
  const note = {
    id: 'lawn-after-rain',
    title: 'When to mow after a wet spring',
    excerpt:
      'A soaked lawn needs a few dry days before the first cut. Waiting keeps the soil from rutting and gives the grass a cleaner start.',
    cover: '/landscapes/craft-1.jpg',
    postedOn: 'April 18, 2026',
    body: [
      {
        type: 'text',
        html: '<p>The first warm week tempts a full cut. If the ground is still soft, that pass does more harm than the extra height of the grass.</p><h2>Wait for a firm step</h2><p>Walk the lawn in the morning. If your shoe leaves a print that holds water, leave the mower in the shed. Two or three dry days are usually enough on a drained court.</p>',
      },
      {
        type: 'photos',
        images: ['/landscapes/craft-1.jpg', '/landscapes/craft-2.png', '/landscapes/craft-3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Take the height down in steps</h2><p>Drop the blade one setting at a time. A single short cut on tall, wet grass clogs the deck and leaves clumps that shade the turf underneath.</p><p>Bag or rake those clumps the same day. They are the part that turns yellow first.</p>',
      },
    ],
  }
  await sql`
    INSERT INTO posts (id, title, excerpt, cover, body, posted_on, published)
    SELECT
      ${note.id},
      ${note.title},
      ${note.excerpt},
      ${note.cover},
      ${JSON.stringify(note.body)},
      ${note.postedOn},
      true
    WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id = ${note.id})
  `
  const warmSoil = {
    id: 'plant-while-soil-is-warm',
    title: 'Plant while the soil is still warm',
    excerpt:
      'Cool air and warm ground give new trees and shrubs a quieter start. The roots keep working after the leaves have slowed down.',
    cover: '/blog/warm-soil.jpg',
    postedOn: 'October 2, 2025',
    body: [
      {
        type: 'text',
        html: '<p>Spring gets the credit for planting, but the weeks after the heat breaks are often the kinder window. The air has cooled and the soil is still holding summer warmth.</p><h2>Roots before leaves</h2><p>A new tree spends its first season underground. In warm soil it can knit roots without also pushing a full head of leaves through a hot spell. By the next spring the plant is already settled, instead of starting from a fresh hole.</p><h2>Less water, less hurry</h2><p>Cooler days mean the soil stays damp longer between visits. You are not racing a dry week just to keep a new shrub alive. Rain does more of the work, and the planting has time to take hold before winter.</p>',
      },
    ],
  }
  const quietYard = {
    id: 'a-yard-for-slowing-down',
    title: 'A yard for slowing down',
    excerpt:
      'A restorative yard is a sequence of quiet rooms: water, a warm seat, and planting that softens the edge of the house.',
    cover: '/blog/quiet-yard.jpg',
    postedOn: 'March 6, 2026',
    body: [
      {
        type: 'text',
        html: '<p>A yard can do more than host a meal. Set aside one corner that is only for sitting, and the rest of the garden starts to feel less like a project and more like a place you stay.</p><h2>Water, warmth, and a short walk</h2><p>A low basin, a sheltered seat, and a path that does not rush you there. The materials stay natural, and the planting is thick enough that the house drops out of view after a few steps.</p>',
      },
      {
        type: 'photos',
        images: ['/blog/quiet-1.jpg', '/blog/quiet-2.jpg', '/blog/quiet-3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Quiet on purpose</h2><p>The seat faces the planting, not the drive. Evening light stays low. Nothing in the room asks you to entertain, so the same corner works for one person or for two who do not need a conversation.</p>',
      },
    ],
  }
  const eveningLight = {
    id: 'light-after-dusk',
    title: 'Light after dusk',
    excerpt:
      'A few well-placed lights turn the path, the steps, and the table into one evening room instead of a dark yard.',
    cover: '/blog/evening-cover.jpg',
    postedOn: 'January 14, 2026',
    body: [
      {
        type: 'text',
        html: '<p>Daylight does most of the work in a garden. After dusk the same place needs a second plan: where the feet go, where people sit, and what should stay in shadow.</p><h2>Mark the walk, not the whole yard</h2><p>Low lights along the path and at the steps are enough to move through the garden without turning it into a stage. The table gets a warmer pool of light. The planting at the edge stays dim.</p>',
      },
      {
        type: 'photos',
        images: ['/blog/evening-1.jpg', '/blog/evening-2.jpg', '/blog/evening-3.jpg'],
      },
      {
        type: 'text',
        html: '<p>The aim is a route you can follow without a flashlight, and a seat that still feels like night.</p>',
      },
    ],
  }
  const outdoorTable = {
    id: 'a-table-that-cooks',
    title: 'A table that cooks',
    excerpt:
      'An outdoor kitchen works when the fire, the prep, and the seats are one counter, close to the house and out of the wind.',
    cover: '/blog/table-cover.jpg',
    postedOn: 'August 9, 2025',
    body: [
      {
        type: 'text',
        html: '<p>A grill on its own is a chore. A counter with room to set a board, a sink within reach, and seats that face the cook turns the same spot into the meal.</p><h2>Keep the work in one line</h2><p>Prep, heat, and serving should sit on one run so nobody crosses the seating with a hot pan. A roof or a deep overhang keeps that line usable when the weather turns.</p>',
      },
      {
        type: 'photos',
        images: ['/blog/table-1.jpg', '/blog/table-2.jpg', '/blog/table-3.jpg'],
      },
    ],
  }
  const thickerLawn = {
    id: 'a-thicker-lawn',
    title: 'A thicker lawn before winter',
    excerpt:
      'Opening the soil and sowing while the ground is still warm fills the thin patches before the cold shuts growth down.',
    cover: '/blog/lawn-cover.jpg',
    postedOn: 'September 22, 2025',
    body: [
      {
        type: 'text',
        html: '<p>A lawn that looks fine in June can be mostly thatch by September. Seed thrown on a packed surface sits there. Seed worked into opened soil has a chance.</p><h2>Open the ground, then sow</h2><p>A pass that pulls small cores lets air and water reach the roots. The seed goes down the same week, while the soil is still warm enough to germinate and the nights are cool enough that the new grass is not scorched.</p>',
      },
      {
        type: 'photos',
        images: ['/blog/lawn-1.jpg', '/blog/lawn-2.jpg'],
      },
    ],
  }
  const winterClose = {
    id: 'before-the-frost',
    title: 'Before the frost',
    excerpt:
      'A short list for the last mild weeks: cut back what is finished, leave what still feeds the birds, and clear the paths.',
    cover: '/blog/winter-cover.jpg',
    postedOn: 'February 3, 2026',
    body: [
      {
        type: 'text',
        html: '<p>The garden does not need a full reset before winter. It needs the paths clear, the tender pots moved, and the beds left tidy enough that spring is not a rescue.</p><h2>What to cut, what to leave</h2><p>Seed heads that still stand can stay. Soft growth that will only rot should come off. Empty the irrigation lines, coil the hoses, and lift anything that will crack in a freeze.</p><p>One walk with a notebook is enough. Note the thin spots in the lawn and the lights that failed, then leave the rest until the ground is workable again.</p>',
      },
    ],
  }
  const lampCheck = {
    id: 'a-check-on-the-lamps',
    title: 'A check on the lamps',
    excerpt:
      'Once a year the path lights need a wipe, a new bulb where one has gone, and a look at the wires after a wet season.',
    cover: '/blog/lamps-cover.jpg',
    postedOn: 'November 11, 2025',
    body: [
      {
        type: 'text',
        html: '<p>Landscape lights fade quietly. A lens films over, a fitting fills with water, and one dark step is easy to miss until someone uses it at night.</p><h2>Walk the route after dark</h2><p>Turn the system on and walk it. Note every gap, then clean the glass and swap the failed lamps in daylight. Check the connections that sit in mulch; those are the ones that corrode first.</p>',
      },
      {
        type: 'photos',
        images: ['/blog/lamps-1.jpg', '/blog/lamps-2.jpg'],
      },
    ],
  }
  const livingScreen = {
    id: 'a-screen-of-leaves',
    title: 'A screen of leaves',
    excerpt:
      'Privacy does not have to be a tall fence. A planted screen can close the view and still let light into the garden.',
    cover: '/blog/screen-cover.jpg',
    postedOn: 'May 19, 2026',
    body: [
      {
        type: 'text',
        html: '<p>The neighbor’s window and the road do not need a wall. A row of shrubs, or a fence with planting in front of it, takes the sightline away without shutting the garden in.</p><h2>Height where you need it</h2><p>Put the tallest plants where the view is worst, and keep the rest lower so the room still gets sun. Evergreen holds the screen in winter. A few deciduous shrubs keep it from reading as a hedge and nothing else.</p>',
      },
      {
        type: 'photos',
        images: ['/blog/screen-1.jpg', '/blog/screen-2.jpg'],
      },
    ],
  }
  for (const post of [warmSoil, quietYard, eveningLight, outdoorTable, thickerLawn, winterClose, lampCheck, livingScreen]) {
    await sql`
      INSERT INTO posts (id, title, excerpt, cover, body, posted_on, published)
      SELECT
        ${post.id},
        ${post.title},
        ${post.excerpt},
        ${post.cover},
        ${JSON.stringify(post.body)},
        ${post.postedOn},
        true
      WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id = ${post.id})
    `
  }
}
