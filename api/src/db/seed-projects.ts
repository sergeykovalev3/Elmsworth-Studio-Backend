import type postgres from 'postgres'

type SeedProject = {
  id: string
  title: string
  cover: string
  categories: string
  photos: string[]
  body: Array<{ type: string; html?: string; images?: string[] }>
}

const projects: SeedProject[] = [
  {
    id: 'lawn-through-the-year',
    title: 'A lawn held through the year',
    cover: '/maintenance/turf/cover.jpg',
    categories: 'Landscapes',
    photos: [
      '/maintenance/turf/1.jpg',
      '/maintenance/turf/2.jpg',
      '/maintenance/turf/3.jpg',
      '/maintenance/turf/4.jpg',
      '/maintenance/turf/bottom.jpg',
      '/maintenance/turf/side.png',
      '/seasonal/offer-1.jpg',
      '/seasonal/offer-2.jpg',
      '/seasonal/offer-3.jpg',
      '/maintenance/flowers/1.jpg',
      '/maintenance/flowers/2.jpg',
      '/maintenance/flowers/3.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>A lawn that stays even</h1><p>The grass is the open room of the grounds. It is cut, fed, and edged so the rest of the garden has a calm floor to sit against.</p><h2>Through the warm months</h2><p>The mowing line follows the beds, not a rectangle dropped on the site. Edges stay sharp where the lawn meets stone, and softer where it runs into planting.</p>',
      },
      {
        type: 'photos',
        images: [
          '/maintenance/turf/1.jpg',
          '/maintenance/turf/2.jpg',
          '/maintenance/turf/3.jpg',
          '/maintenance/turf/4.jpg',
          '/maintenance/turf/bottom.jpg',
          '/maintenance/turf/side.png',
        ],
      },
      {
        type: 'text',
        html: '<h2>Color at the edge</h2><p>Seasonal planting sits in the beds that frame the lawn. It changes through the year without asking the grass to do that work.</p>',
      },
      {
        type: 'photos',
        images: ['/seasonal/offer-1.jpg', '/seasonal/offer-2.jpg', '/seasonal/offer-3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Flowers for the short season</h2><p>A few concentrated displays carry the brightest weeks. When they finish, the lawn and the evergreen structure are still the garden.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/flowers/1.jpg', '/maintenance/flowers/2.jpg', '/maintenance/flowers/3.jpg'],
      },
    ],
  },
  {
    id: 'working-grounds',
    title: 'A court for working grounds',
    cover: '/commercial/cover.jpg',
    categories: 'Commercial,Hardscapes',
    photos: [
      '/commercial/offer-2.jpg',
      '/commercial/offer-3.jpg',
      '/commercial/side.jpg',
      '/commercial/faq.jpg',
      '/maintenance/commercial/2.jpg',
      '/maintenance/commercial/3.jpg',
      '/maintenance/commercial/cover.jpg',
      '/maintenance/commercial/faq.jpg',
      '/maintenance/commercial/side.jpg',
      '/architecture/step-1.jpg',
      '/architecture/step-2.jpg',
      '/architecture/step-3.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>Grounds that have to work every day</h1><p>The paving, the entries, and the planted edges are built for people arriving, leaving, and crossing the site all week.</p><h2>The arrival</h2><p>The walk from the drive to the door is wide, level, and lit at the edges. Planting marks the entry without blocking it.</p>',
      },
      {
        type: 'photos',
        images: [
          '/commercial/offer-2.jpg',
          '/commercial/offer-3.jpg',
          '/commercial/side.jpg',
          '/commercial/faq.jpg',
          '/maintenance/commercial/2.jpg',
          '/maintenance/commercial/3.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Care that keeps the first impression</h2><p>Beds are kept tight, and the hard surfaces stay clear. The grounds should look the same on a Monday as they did on the day they were finished.</p>',
      },
      {
        type: 'photos',
        images: [
          '/maintenance/commercial/cover.jpg',
          '/maintenance/commercial/faq.jpg',
          '/maintenance/commercial/side.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Built in stages</h2><p>The work landed in clear pieces: grading, paving, then planting. Each piece had to stand on its own while the next one was still open.</p>',
      },
      {
        type: 'photos',
        images: ['/architecture/step-1.jpg', '/architecture/step-2.jpg', '/architecture/step-3.jpg'],
      },
    ],
  },
  {
    id: 'border-that-changes',
    title: 'A border that changes',
    cover: '/theme-gardens/cover.jpg',
    categories: 'Landscapes',
    photos: [
      '/theme-gardens/offer-1.jpg',
      '/theme-gardens/offer-2.jpg',
      '/theme-gardens/side.jpg',
      '/theme-gardens/faq.jpg',
      '/seasonal/side.jpg',
      '/seasonal/bottom.jpg',
      '/maintenance/flowers/4.jpg',
      '/maintenance/flowers/5.jpg',
      '/maintenance/flowers/side.jpg',
      '/landscapes/cover.jpg',
      '/landscapes/side.jpg',
      '/landscapes/bottom.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>One border, several seasons</h1><p>The bed runs along the house and turns the corner. Structure plants stay. The flowers in front of them are allowed to change.</p><h2>The lasting layer</h2><p>Shrubs and a few small trees set the height. They hold the border in winter, when the seasonal color is gone.</p>',
      },
      {
        type: 'photos',
        images: [
          '/theme-gardens/offer-1.jpg',
          '/theme-gardens/offer-2.jpg',
          '/theme-gardens/side.jpg',
          '/theme-gardens/faq.jpg',
          '/seasonal/side.jpg',
          '/seasonal/bottom.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>The short layer</h2><p>Annuals and a few perennials fill the front edge. They are replanted when the show is over, so the border does not go empty.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/flowers/4.jpg', '/maintenance/flowers/5.jpg', '/maintenance/flowers/side.jpg'],
      },
      {
        type: 'text',
        html: '<h2>How it meets the house</h2><p>The bed is deep enough to read from the windows, and narrow enough that the walk beside it stays comfortable. The house and the planting share one edge.</p>',
      },
      {
        type: 'photos',
        images: ['/landscapes/cover.jpg', '/landscapes/side.jpg', '/landscapes/bottom.jpg'],
      },
    ],
  },
  {
    id: 'kitchen-court',
    title: 'A kitchen court',
    cover: '/kitchens/cover.jpg',
    categories: 'Hardscapes',
    photos: [
      '/kitchens/offer-1.jpg',
      '/kitchens/offer-2.jpg',
      '/kitchens/offer-3.jpg',
      '/kitchens/side.jpg',
      '/kitchens/bottom.jpg',
      '/kitchens/faq.jpg',
      '/patios/offer-1.jpg',
      '/patios/offer-2.jpg',
      '/patios/offer-3.jpg',
      '/outdoor-living/offer-1.jpg',
      '/outdoor-living/offer-2.jpg',
      '/outdoor-living/offer-3.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>Cooking in the court</h1><p>The kitchen sits on the same stone as the table. Whoever is at the grill stays in the conversation instead of stepping inside.</p><h2>The working counter</h2><p>Grill, prep, and a short run of bar are in one line. The bar is where people stand before the meal and where they come back after it.</p>',
      },
      {
        type: 'photos',
        images: [
          '/kitchens/offer-1.jpg',
          '/kitchens/offer-2.jpg',
          '/kitchens/offer-3.jpg',
          '/kitchens/side.jpg',
          '/kitchens/bottom.jpg',
          '/kitchens/faq.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>The table beside it</h2><p>Dining is one step from the counter, on the same level. Chairs pull out onto stone, not onto grass, so the meal does not depend on the weather underfoot.</p>',
      },
      {
        type: 'photos',
        images: ['/patios/offer-1.jpg', '/patios/offer-2.jpg', '/patios/offer-3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Room to stay after</h2><p>Past the table the court opens into a lower seat. The evening can move there without a second destination being built somewhere else in the yard.</p>',
      },
      {
        type: 'photos',
        images: ['/outdoor-living/offer-1.jpg', '/outdoor-living/offer-2.jpg', '/outdoor-living/offer-3.jpg'],
      },
    ],
  },
  {
    id: 'water-at-the-edge',
    title: 'Water at the edge',
    cover: '/maintenance/water/cover.jpg',
    categories: 'Pools & Water Features,Landscapes',
    photos: [
      '/maintenance/water/1.jpg',
      '/maintenance/water/2.jpg',
      '/maintenance/water/3.jpg',
      '/maintenance/water/side.jpg',
      '/maintenance/water/bottom.jpg',
      '/maintenance/water/faq.jpg',
      '/maintenance/irrigation/1.jpg',
      '/maintenance/irrigation/2.jpg',
      '/maintenance/irrigation/3.jpg',
      '/maintenance/irrigation/cover.jpg',
      '/maintenance/irrigation/side.jpg',
      '/maintenance/irrigation/bottom.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>A thin sheet of water</h1><p>The water is a edge, not a pool to swim. It runs beside the walk and gives the garden a sound that stays after the talking stops.</p><h2>The basin</h2><p>Stone holds a shallow run. The surface stays clear because the basin is simple to reach and simple to keep.</p>',
      },
      {
        type: 'photos',
        images: [
          '/maintenance/water/1.jpg',
          '/maintenance/water/2.jpg',
          '/maintenance/water/3.jpg',
          '/maintenance/water/side.jpg',
          '/maintenance/water/bottom.jpg',
          '/maintenance/water/faq.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Water for the planting</h2><p>Irrigation sits under the beds that frame the basin. The plants stay even through a dry week without hoses left on the paving.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/irrigation/1.jpg', '/maintenance/irrigation/2.jpg', '/maintenance/irrigation/3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Hidden where it can be reached</h2><p>Heads and valves are placed where a caretaker can find them, and where a guest walking past does not. The water shows. The equipment does not.</p>',
      },
      {
        type: 'photos',
        images: [
          '/maintenance/irrigation/cover.jpg',
          '/maintenance/irrigation/side.jpg',
          '/maintenance/irrigation/bottom.jpg',
        ],
      },
    ],
  },
  {
    id: 'roof-over-the-table',
    title: 'A roof over the table',
    cover: '/pavilions/cover.jpg',
    categories: 'Hardscapes',
    photos: [
      '/pavilions/offer-4.jpg',
      '/pavilions/offer-5.jpg',
      '/pavilions/side.jpg',
      '/pavilions/faq.jpg',
      '/pavilions/bottom.png',
      '/outdoor-living/side.jpg',
      '/outdoor-living/cover.jpg',
      '/outdoor-living/bottom.jpg',
      '/outdoor-living/faq.jpg',
      '/patios/side.jpg',
      '/patios/bottom.jpg',
      '/patios/cover.png',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>Shade where the meal happens</h1><p>The roof is sized to the table, not to the whole yard. People sit under it at noon and still see the garden beyond the posts.</p><h2>The roof</h2><p>Posts land outside the walk. The table and the chairs have a clear square, and rain stays off the place where food is set down.</p>',
      },
      {
        type: 'photos',
        images: [
          '/pavilions/offer-4.jpg',
          '/pavilions/offer-5.jpg',
          '/pavilions/side.jpg',
          '/pavilions/faq.jpg',
          '/pavilions/bottom.png',
          '/outdoor-living/side.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>The seat beyond the posts</h2><p>Just outside the roof the paving continues into an open seat. The shade is a choice, not a wall. A group can split between the two without leaving the court.</p>',
      },
      {
        type: 'photos',
        images: ['/outdoor-living/cover.jpg', '/outdoor-living/bottom.jpg', '/outdoor-living/faq.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Stone under all of it</h2><p>One paving field runs under the roof and past it. The roof reads as furniture for the court, not as a separate building set on the lawn.</p>',
      },
      {
        type: 'photos',
        images: ['/patios/side.jpg', '/patios/bottom.jpg', '/patios/cover.png'],
      },
    ],
  },
  {
    id: 'lights-along-the-walk',
    title: 'Lights along the walk',
    cover: '/maintenance/lights/cover.jpg',
    categories: 'Lighting',
    photos: [
      '/maintenance/lights/1.jpg',
      '/maintenance/lights/2.jpg',
      '/maintenance/lights/3.jpg',
      '/maintenance/lights/4.jpg',
      '/maintenance/lights/side.jpg',
      '/maintenance/lights/bottom.jpg',
      '/maintenance/lights/faq.jpg',
      '/lighting/cover.png',
      '/lighting/faq.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>A walk you can see after dark</h1><p>The lights stay low, at the edge of the paving. They mark the path back to the house without turning the garden into a lit room.</p><h2>Along the paving</h2><p>Each fixture sits just off the walk. The beam hits the stone, not the windows. The path is obvious, and the beds stay dark.</p>',
      },
      {
        type: 'photos',
        images: [
          '/maintenance/lights/1.jpg',
          '/maintenance/lights/2.jpg',
          '/maintenance/lights/3.jpg',
          '/maintenance/lights/4.jpg',
          '/maintenance/lights/side.jpg',
          '/maintenance/lights/bottom.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Kept so they still work</h2><p>Heads are placed where they can be cleaned and aimed again. A light that has drifted into a shrub is not doing its job.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/lights/faq.jpg', '/lighting/cover.png', '/lighting/faq.jpg'],
      },
    ],
  },
  {
    id: 'garden-after-snow',
    title: 'A garden after snow',
    cover: '/maintenance/snow/cover.jpg',
    categories: 'Landscapes',
    photos: [
      '/maintenance/snow/1.png',
      '/maintenance/snow/2.png',
      '/maintenance/snow/3.png',
      '/maintenance/snow/side.jpg',
      '/maintenance/snow/bottom.jpg',
      '/maintenance/snow/faq.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>Clear paths, quiet beds</h1><p>Snow is taken off the walks and the drive. The beds are left alone, so the planting is not scraped along with the ice.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/snow/1.png', '/maintenance/snow/2.png', '/maintenance/snow/3.png'],
      },
      {
        type: 'text',
        html: '<h2>Where the snow goes</h2><p>It is stacked where it will not bury a hedge or block a gate. When it melts, the water has a way off the paving.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/snow/side.jpg', '/maintenance/snow/bottom.jpg', '/maintenance/snow/faq.jpg'],
      },
    ],
  },
  {
    id: 'steps-down-the-grade',
    title: 'Steps down the grade',
    cover: '/architecture/cover.jpg',
    categories: 'Hardscapes',
    photos: [
      '/architecture/step-1.jpg',
      '/architecture/step-2.jpg',
      '/architecture/step-3.jpg',
      '/architecture/step-4.jpg',
      '/architecture/side.jpg',
      '/architecture/bottom.jpg',
      '/architecture/faq.jpg',
      '/hardscapes/faq.jpg',
      '/hardscapes/cover.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>A slope made into rooms</h1><p>The grade drops from the house to the lower lawn. Steps and landings turn that drop into places to pause, not a single steep run.</p><h2>The steps</h2><p>Treads are wide enough for two people to pass. Landings sit where the view opens, so the walk down is not only a way to get lower.</p>',
      },
      {
        type: 'photos',
        images: [
          '/architecture/step-1.jpg',
          '/architecture/step-2.jpg',
          '/architecture/step-3.jpg',
          '/architecture/step-4.jpg',
          '/architecture/side.jpg',
          '/architecture/bottom.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Walls that hold the soil</h2><p>The stone walls keep the beds from sliding onto the treads. Planting sits on the terraces, above the line of the walk.</p>',
      },
      {
        type: 'photos',
        images: ['/architecture/faq.jpg', '/hardscapes/faq.jpg', '/hardscapes/cover.jpg'],
      },
    ],
  },
  {
    id: 'flowers-at-the-door',
    title: 'Flowers at the door',
    cover: '/maintenance/flowers/cover.jpg',
    categories: 'Landscapes',
    photos: [
      '/maintenance/flowers/1.jpg',
      '/maintenance/flowers/2.jpg',
      '/maintenance/flowers/3.jpg',
      '/maintenance/flowers/bottom.jpg',
      '/maintenance/flowers/faq.jpg',
      '/seasonal/cover.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>Color where people arrive</h1><p>The brightest planting is at the door and along the front walk. The rest of the garden can stay quieter.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/flowers/1.jpg', '/maintenance/flowers/2.jpg', '/maintenance/flowers/3.jpg'],
      },
      {
        type: 'text',
        html: '<h2>Changed when the show ends</h2><p>These beds are replanted through the year. When one round finishes, the next is already chosen, so the entry does not go bare.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/flowers/bottom.jpg', '/maintenance/flowers/faq.jpg', '/seasonal/cover.jpg'],
      },
    ],
  },
  {
    id: 'service-court',
    title: 'A service court',
    cover: '/commercial/offer-1.png',
    categories: 'Commercial',
    photos: [
      '/commercial/offer-4.png',
      '/commercial/bottom.png',
      '/maintenance/commercial/1.png',
      '/maintenance/commercial/4.png',
      '/maintenance/commercial/bottom.png',
      '/design-build/side.png',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>The side of the grounds nobody tours</h1><p>Bins, a work door, and a place to turn a cart still have to look considered. The service court is paved, screened, and easy to keep clear.</p>',
      },
      {
        type: 'photos',
        images: ['/commercial/offer-4.png', '/commercial/bottom.png', '/maintenance/commercial/1.png'],
      },
      {
        type: 'text',
        html: '<h2>Screened from the arrival</h2><p>Planting and a low wall hide the court from the front walk. Staff can reach it without crossing the guest path.</p>',
      },
      {
        type: 'photos',
        images: ['/maintenance/commercial/4.png', '/maintenance/commercial/bottom.png', '/design-build/side.png'],
      },
    ],
  },
  {
    id: 'three-garden-rooms',
    title: 'Three garden rooms',
    cover: '/home/projects/2.jpg',
    categories: 'Landscapes,Hardscapes',
    photos: [
      '/home/projects/3.jpg',
      '/home/projects/4.jpg',
      '/home/projects/5.jpg',
      '/home/projects/6.jpg',
      '/home/projects/7.jpg',
      '/home/projects/8.jpg',
      '/design-build/project-1.jpg',
      '/design-build/project-2.jpg',
      '/design-build/project-3.jpg',
    ],
    body: [
      {
        type: 'text',
        html: '<h1>One yard, three rooms</h1><p>The grounds are split by planting and a change of level, not by fences. Each room has its own use, and you can see from one into the next.</p><h2>Near the house</h2><p>The first room is the evening seat. Stone underfoot, a short step from the door, and planting that closes the sides.</p>',
      },
      {
        type: 'photos',
        images: [
          '/home/projects/3.jpg',
          '/home/projects/4.jpg',
          '/home/projects/5.jpg',
          '/home/projects/6.jpg',
          '/home/projects/7.jpg',
          '/home/projects/8.jpg',
        ],
      },
      {
        type: 'text',
        html: '<h2>Further out</h2><p>The lower rooms open toward the lawn. One is for a table. One is only grass and a tree, left unfurnished on purpose.</p>',
      },
      {
        type: 'photos',
        images: ['/design-build/project-1.jpg', '/design-build/project-2.jpg', '/design-build/project-3.jpg'],
      },
    ],
  },
]

export async function insertExtraProjects(sql: postgres.Sql) {
  for (const project of projects) {
    await sql`
      INSERT INTO projects (id, title, cover, photos, categories, body, video, published)
      SELECT
        ${project.id},
        ${project.title},
        ${project.cover},
        ${project.photos.join(',')},
        ${project.categories},
        ${JSON.stringify(project.body)},
        '',
        true
      WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = ${project.id})
    `
  }
}
