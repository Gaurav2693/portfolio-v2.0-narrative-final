// Builds — the things I made myself. One entry per project page at /builds/<slug>.
// Keep each page short: what it is, how it was made, a few screens, the links.
// Screenshots: drop PNG/JPG into /public/builds/<slug>/ and list them in `screens`.
// Anything marked TODO is a link or fact only you can fill in.

export type BuildPage = {
  slug: string;
  title: string;
  tagline: string;           // one line under the title
  clip: string;              // /public/clips/<clip>.mp4
  clipLabel: string;
  status: 'In progress' | 'Alpha' | 'Shipped' | 'Parked';
  year: string;
  stack: string[];
  facts: [string, string][]; // role, scope, anything that frames the work
  what: string[];            // 1–3 short paragraphs
  process: { title: string; body: string }[]; // 3–5 steps, brief
  screens: { src: string; caption: string }[];
  links: { label: string; href: string }[];
  note?: string;             // honest status line, shown under the links
};

export const buildPages: BuildPage[] = [
  {
    slug: 'by1-batcar',
    title: 'BY1 Batcar',
    tagline: 'A vehicle-combat game: drive the city, then stand and fight from the turret.',
    clip: 'by1-batcar', clipLabel: 'Gaurav driving the BY1 car',
    status: 'In progress', year: '2026',
    stack: ['Babylon.js', 'Havok physics', 'Mixamo', 'Meshy', 'TypeScript'],
    facts: [['Role', 'Everything: concept, story, code, assets'], ['Modes', 'Drive · Turret · Sentry'], ['Scope', 'First game, five to six stages planned']],
    what: [
      'My first game. A courier in a half-ruined cyberpunk world carries a message for the last AI that stayed loyal to people. The car he is given is also his weapon, and it evolves to whatever the terrain throws at it.',
      'The first stage is an industrial city with highways and flyovers where the car can get lost in traffic. Each stage is meant to end on a view worth stopping for.',
    ],
    process: [
      { title: 'Story before systems', body: 'Locked the cast and the arc first: the courier, the loyal AI, the rogue one, the message as a glowing cube. A game this size needs a reason to keep building it.' },
      { title: 'Driving feel, then combat', body: 'Babylon.js with Havok for the vehicle. Got the drive loop right before adding the turret mode, so switching between them feels like one machine.' },
      { title: 'AI-assisted asset pipeline', body: 'Characters through Mixamo for rigs and Meshy for geometry, cleaned up by hand. Fast enough that I can iterate on look without stalling the code.' },
      { title: 'Stages as set pieces', body: 'Each stage is a different kind of world with its own boss. The car is at roughly half of its planned powers; the rest arrive stage by stage.' },
    ],
    screens: [], // TODO: /public/builds/by1-batcar/01.png …
    links: [], // TODO: playable link when the first stage is ready
    note: 'Being built on evenings. No public build yet; a first playable stage is the next milestone.',
  },
  {
    slug: 'skyflap',
    title: 'SKYFLAP',
    tagline: 'A 3D airport you can read like a dashboard.',
    clip: 'skyflap', clipLabel: 'Gaurav walking through an airport with a suitcase',
    status: 'Shipped', year: '2026',
    stack: ['Three.js', 'React', 'TypeScript'],
    facts: [['Role', 'Design and build'], ['Recognition', 'Picked up by the official Three.js account'], ['Repo', 'Gaurav2693/SKYFLAP-V1.0']],
    what: [
      'An airport modelled as a live scene instead of a table: terminals, gates and aircraft movement rendered in Three.js so operational state is something you look at, not scroll through.',
      'The point was to see whether spatial layout could carry information that a flat dashboard flattens out. For an airport, where position is the information, it can.',
    ],
    process: [
      { title: 'Pick a domain where space is the data', body: 'Gates, stands and taxiways only make sense in relation to each other. That made the 3D view a necessity, not decoration.' },
      { title: 'Scene graph first', body: 'Modelled the airport as a scene graph with the data model mirrored onto it, so a state change is a property change on a node.' },
      { title: 'Camera as navigation', body: 'Preset camera rigs for the views people actually need, instead of a free orbit that leaves them lost.' },
      { title: 'Ship and share', body: 'Published the build and the source. The Three.js account sharing it was the signal that the idea read clearly to people who know the tool.' },
    ],
    screens: [], // TODO: /public/builds/skyflap/01.png …
    links: [{ label: 'Source on GitHub', href: 'https://github.com/Gaurav2693/SKYFLAP-V1.0' }], // TODO: live link
  },
  {
    slug: 'batcave',
    title: 'Batcave',
    tagline: 'A fully lit cave complex you can walk through, camera by camera, built from scratch in Three.js.',
    clip: 'batcave', clipLabel: 'Gaurav in a cape next to a car in a cave',
    status: 'Shipped', year: '2026',
    stack: ['Three.js', 'GSAP', 'Blender', 'TypeScript'],
    facts: [['Role', 'Concept, asset direction, modelling, lighting, code'], ['Spaces', 'Hangar deck · Exo bay · Command gallery · The Well · Headland surface'], ['Repo', 'Gaurav2693/batcave-by-gaurav']],
    what: [
      'A fan-made underground base with the house above it: hangar deck with a lit launch pad, an exo-suit bay with robotic arms, a command gallery of screens, a deep server well, and tunnels out. Above ground, a cliff house with a pool terrace and a lighthouse across the water.',
      'It is presented as a set of security cameras: each space has a REC view with a slow pan, and you can take the controls. This is where I learned lighting properly; most of the time went into shadows, fill and reflections, not geometry.',
    ],
    process: [
      { title: 'Plan first, in cross-section', body: 'Drew the complex as levels with heights (command gallery at −10, hangar at −18, workshop at −28, the Well down to −60) before touching a model, so every space had a reason to be where it is.' },
      { title: 'Concept art, then an asset library', body: 'Generated concept views per space, then broke them into a modular kit: rock walls, stalactites, platforms, stairs, consoles, lifts, props. Modular pieces meant the cavern could grow without re-modelling.' },
      { title: 'Block out, then light', body: 'Assembled the cavern from the kit with simple geometry, then spent most of the budget on lighting: key, fill, bounce, neon accents on the pad and bay, water reflections.' },
      { title: 'Cameras as the story', body: 'Each space gets a REC camera with its own GSAP move. The same scene plays as a film and runs as an explorable build; one source of truth for both.' },
    ],
    screens: [
      { src: 'builds/batcave/01-hangar-deck.jpg', caption: 'CAM 01 · Hangar deck. Launch pad, command gallery above, exo bay at the back.' },
      { src: 'builds/batcave/02-exo-bay.jpg', caption: 'CAM 07 · Exo bay. Suit on the rig, robotic arms, hazard striping.' },
      { src: 'builds/batcave/03-headland.jpg', caption: 'The headland above: house, sleeping pavilion, pool terrace, the lighthouse across the water.' },
      { src: 'builds/batcave/06-cave-concept.jpg', caption: 'Concept design by level, made before building. Every space has a y-coordinate.' },
      { src: 'builds/batcave/04-asset-library.jpg', caption: 'The modular asset library the cave is assembled from: rock, platforms, consoles, lifts, props.' },
      { src: 'builds/batcave/05-exo-concept.jpg', caption: 'Exo-suit and armour concept sheets used to model the bay.' },
    ],
    links: [{ label: 'Open the cave', href: 'https://batcave-by-gaurav.vercel.app' }, { label: 'Source on GitHub', href: 'https://github.com/Gaurav2693/batcave-by-gaurav' }],
    note: 'Best on a laptop or desktop with a GPU; press H in the scene for controls.',
  },
  {
    slug: 'lanterns',
    title: 'Lanterns',
    tagline: 'A diorama that tells one scene as a sequence of posed beats.',
    clip: 'lanterns', clipLabel: 'Gaurav lifting a glowing green cube',
    status: 'In progress', year: '2026',
    stack: ['Three.js', 'Orthographic camera', 'Rigged character', 'TypeScript'],
    facts: [['Role', 'Story, character, scene, code'], ['Format', 'Orthographic diorama'], ['Scope', 'One scene, told in beats']],
    what: [
      'A fan story told as an orthographic diorama: one location, one event, a character I generated and rigged myself, posed per story beat. You move through beats, not through space.',
      'The constraint was the point. A single scene forces every beat to earn its place.',
    ],
    process: [
      { title: 'One scene, many beats', body: 'Wrote the event as beats first. The diorama only needs what the beats need.' },
      { title: 'Orthographic on purpose', body: 'Orthographic camera keeps the diorama readable from every beat and removes perspective drift between poses.' },
      { title: 'Generate, rig, pose', body: 'Character generated to a definition, rigged, then posed by hand for each beat. Cheaper than animation and more controllable.' },
      { title: 'Light the moment', body: 'Each beat has its own light setup so the same scene reads differently as the event unfolds.' },
    ],
    screens: [], // TODO: /public/builds/lanterns/01.png …
    links: [], // TODO: link when the first beats are public
    note: 'In progress. The first beats exist; the full sequence is being posed.',
  },
  {
    slug: 'ronin',
    title: 'RONIN',
    tagline: 'An orchestration workspace for running AI agents without modes.',
    clip: 'ronin', clipLabel: 'Gaurav wired into several small agent screens',
    status: 'Alpha', year: '2026',
    stack: ['React', 'Vercel AI SDK', 'Inngest', 'Supabase', 'Clerk', 'Langfuse'],
    facts: [['Role', 'Architecture, design, build'], ['Primitives', 'Sessions · Tools · Skills · Workflows · Artifacts · Memory'], ['Public showreel', 'roninos.app (access code)']],
    what: [
      'RONIN is the tool I use to run agents on my own work. Version 3 had eight modes and a council of named agents. Version 4 threw the modes away: one short session loop, five primitives, and a human-editable memory the orchestrator reads before every run.',
      'The public face is Orchestrator Mini: a typed pipeline (orchestrator → researcher → designer → reviewer) with live cost, latency, cache and trace surfaces, so you can watch what a run actually spends.',
    ],
    process: [
      { title: 'Retire the modes', body: 'V3’s modes were eight ways of saying the same thing. V4 replaced them with one ~80-line session loop and let tools and skills carry the difference.' },
      { title: 'Decide the primitives', body: 'Sessions, Tools, Skills, Workflows, Artifacts, then Memory. Eleven architecture decision records, each with the cost of the alternative written down.' },
      { title: 'Show the spend', body: 'Every run surfaces cost, latency, cache hits and a trace. If an agent workspace hides the bill, people cannot make good decisions with it.' },
      { title: 'Ship the showreel, keep the brain honest', body: 'Orchestrator Mini is the presentation layer. The underlying decisions stay optimised for cost and efficiency, not for the demo.' },
    ],
    screens: [], // TODO: /public/builds/ronin/01.png …
    links: [{ label: 'roninos.app', href: 'https://roninos.app' }],
    note: 'Alpha. Phase 1 passes its test suite; CI, self-hosted deploy and tracing are the next debts to pay.',
  },
];

export const findBuild = (slug?: string) => buildPages.find((b) => b.slug === slug);
