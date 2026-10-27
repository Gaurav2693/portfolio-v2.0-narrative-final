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
  principles?: { title: string; body: string }[]; // optional: the rules the thing is built on
  timeline?: { heading: [string, string, string]; intro?: string; rows: { t: string; a: string; b: string }[] }; // optional: two tracks against one clock
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
    screens: [
      { src: 'builds/by1-batcar/01-ch1-turnaround.jpg', caption: 'Ch1 turnaround: the courier, with the cybernetic arm and the core on his chest.' },
    ],
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
    tagline: 'One night in Rushville, Nebraska. Two heroes on opposite ends of the same road, four orbital strikes, and both of them go up.',
    clip: 'lanterns', clipLabel: 'Gaurav lifting a glowing green cube',
    status: 'Shipped', year: '2026',
    stack: ['Three.js', 'Orthographic film camera', 'Behind-hero chase camera', 'Rigged low-poly characters', 'Web Audio', 'TypeScript'],
    facts: [['Role', 'Story, direction, world, characters, cameras, code'], ['Tracks', 'GL1 · 48 s · 12 panels — BY1 · 51 s · 15 panels'], ['Town', 'Farm, two stations, grain elevator, working yard, football field, highway stop, wind farm'], ['Checkpoint', '28 · every panel is a real frame from the film']],
    what: [
      'A fan film told as an isometric diorama of a whole town. On the west side, GL1 is on his couch at the farmhouse when the first beam lands on the petrol pump. On the east side, BY1 is at a table in a pub at the highway stop when a second weapon locks on the wind farm. The film runs both tracks against one clock.',
      'GL1 is late for the first strike, holds a shield over the second, and loses the third to the grain elevator. BY1 cannot shield anything; his aircraft rises from a hatch under the football field, picks him up behind the pub, and a decoy drone pulls the next lock off the motel roof into an empty field. Then both climb through the same cloud deck, toward whatever is firing.',
      'Two cameras carry it: an orthographic film camera that sees the town as a model, and a behind-the-hero chase camera, the kind you get in a third-person game, for the moments where you should feel the speed. Sound is what GL1 hears. There is no dialogue; every attack is announced by the same targeting scan, so you learn the weapon by watching it.',
    ],
    timeline: {
      heading: ['Film time', 'GL1 · west, the farmhouse', 'BY1 · east, the highway stop'],
      intro: 'Both boards are captured from the same build, so the two tracks line up frame for frame. Read down for the night; read across for who is where.',
      rows: [
        { t: '0 – 4 s', a: 'High over the county, Rushville under a ring of cloud. Down to one farmhouse: GL1 on the couch. In town, strike 1 has locked on the petrol pump and is charging.', b: 'The Windbreak, a pub at the highway stop. BY1 at a table, civil clothes, a drink. At 3.4 s the weapon locks on the wind farm behind the car park.' },
        { t: '4 – 8 s', a: 'Beam 1 fires. He sees it through the window; the shockwave is 1.5 s away. Out in the yard the suit spreads from the ring hand. Crouch, launch.', b: 'The beam drills the turbine nearest the pub. The top comes off, the blades fly, the stop blacks out.' },
        { t: '8 – 14 s', a: 'Corn skim, climb, cruise. Behind GL1, the town coming up.', b: 'Up and running for the kitchen door, through the kitchen, out the back. He stops in the yard and looks north at the fire.' },
        { t: '14 – 20 s', a: 'He brakes into a hover at the pump as the underground tank goes. Strike 1: lost.', b: 'Left wrist up, a cyan pip. Twenty miles west, under the football field, three quarters of the pitch is doors. They open; the aircraft rises on the lift, cyan under the hangar lights.' },
        { t: '20 – 29 s', a: 'Strike 2 locks on the Gas & Go. He leaves at once, flat out across town. A dome over the forecourt; beam 2 lands on it and holds. Strike 2: saved.', b: 'Lift-off from midfield, away east over the county. He runs round the yard to the field behind the pub as it comes in. Wings fold, canopy opens, lift pods glowing. He climbs in as he is; the canopy closes over him.' },
        { t: '29 – 39 s', a: 'Pinned under beam 2 he could not leave. Now to the elevator, which beam 3 has been cooking since 30.4 s. A clean shield on the silo, beam cut; the grain dust goes anyway. Strike 3: lost. Rain starts.', b: 'Up, and a circuit over the stop toward town. The bay opens; the drone drops. A fourth lock is on the motel. The drone pulls the lock off the roof and the beam follows it to an empty field.' },
        { t: '39 – 51 s', a: 'He looks at the sky, then goes. Ring at 80%. Power was never the problem; time was. Through the cloud: the boom, the decks, out through the top. Toward the source.', b: 'Nose up, then a trajectory: level to vertical over the county. Not a missile; a ship. The same shots GL1 got, small against the cloud, the boom, the rings. Above the top deck, after GL1.' },
      ],
    },
    principles: [
      { title: 'Late, not empty', body: 'GL1 fails the third strike because he was pinned under the second, not because the ring ran out. It ends the night at 80%. A hero who runs out of power is an excuse; a hero who runs out of time is a story.' },
      { title: 'One weapon rule, no dialogue', body: 'Low-power targeting scan, aim refined from the reflected signal, lock freezes, then the pulse. The same visual before every attack. Once you have seen it twice you can read the fourth one, which is what lets the decoy work without a word.' },
      { title: 'Two heroes, two answers', body: 'GL1 holds. BY1 diverts. Same weapon, same night, and the film is about which answer each of them can afford.' },
      { title: 'Sound is what GL1 hears', body: 'Procedural Web Audio, mixed from his position. The first strike is something he feels through the house before he understands it.' },
      { title: 'Same climb, different physics', body: 'Both get the cinematic climb. GL1 is a streak that gets visibly faster midway. The aircraft is a trajectory, level to vertical, like a ship and not a missile, because nothing about it is powered the way he is.' },
      { title: 'Build the world first', body: 'The town was planned and built in phases before the action was re-cut into it: farm, stations, elevator, a working yard, the football field with the hatch, the highway stop, the wind farm. Action sequences stayed where they were; the world grew around them.' },
    ],
    process: [
      { title: 'Shot 1 as proof', body: 'Started with one shot, the petrol pump and the lock-on, to settle the look: a Three.js NPR pass with ink outlines from depth and normals, hatching, stepped frames with line boil. The look got approved before a second shot existed.' },
      { title: 'Two cameras, then the town', body: 'An orthographic film camera for the town-as-model view, and a behind-hero chase camera for speed. Then the world: a plan with real places, built in phases, each phase live on the page before the next.' },
      { title: 'A second track against the same clock', body: 'BY1’s 51 seconds were written as a parallel sequence to GL1’s 48: the highway stop at the other end of the main road, the hatch under the football field, the decoy drone. Characters, aircraft and drone generated and rigged to sheets, then placed.' },
      { title: 'Boards captured, not drawn', body: 'Both storyboards are real frames from checkpoint 28 with titles hidden, timecoded in film seconds. The board is a view of the build, so it cannot lie about what exists.' },
    ],
    screens: [
      { src: 'builds/lanterns/06-gl1-three-strikes-one-night.jpg', caption: 'GL1 — three strikes, one night. 12 panels, 48 s. ORTHO film camera and POV behind GL1.' },
      { src: 'builds/lanterns/05-by1-highway-stop.jpg', caption: 'BY1 — the highway stop. 15 panels, 51 s. A civilian at a pub, an aircraft under the stadium, a drone that takes the lock.' },
      { src: 'builds/lanterns/02-three-strikes-storyboard.jpg', caption: 'Earlier board, film version 7: the strike clock that set the timing of the night.' },
      { src: 'builds/lanterns/01-departure-storyboard.jpg', caption: 'Departure storyboard: from home to target in twelve panels, the first thing boarded.' },
      { src: 'builds/lanterns/04-suit-sheet.jpg', caption: 'GL1 suit sheet: turnaround, head views, ring hand, flight and shield poses.' },
      { src: 'builds/lanterns/03-civilian-sheet.jpg', caption: 'GL1 civilian sheet: turnaround, head angles, everyday poses and props for the home scenes.' },
    ],
    links: [{ label: 'Watch the film', href: 'https://lanterns-by-gaurav.vercel.app' }],
    note: 'Act 1 is live. Next: where the beams come from, and the two of them noticing each other above the cloud. Source is in a private repo (site, tools, boards); ask and I will walk you through it.',
  },
  {
    slug: 'ronin',
    title: 'RONIN',
    tagline: 'An orchestration workspace that routes one request across several models and shows you what it cost.',
    clip: 'ronin', clipLabel: 'Gaurav wired into several small agent screens',
    status: 'Alpha', year: '2026',
    stack: ['React', 'Vercel AI SDK', 'Inngest', 'Supabase', 'Clerk', 'Langfuse'],
    facts: [['Role', 'Architecture, design, build'], ['Primitives', 'Sessions · Tools · Skills · Workflows · Artifacts · Memory'], ['Outputs', 'Diagram · Storyboard · Code · Compare · Chart · Image · Mind map · Explainer'], ['Try it', 'roninos.app · access code 2693']],
    what: [
      'RONIN is the tool I use to run agents on my own work. Version 3 had eight modes and a council of named agents. Version 4 threw the modes away: one short session loop, five primitives, and a human-editable memory the orchestrator reads before every run.',
      'The public build is Orchestrator Mini. You type what you want; a small router classifies it into one of eight output formats and fires the right agents (orchestrator → researcher → designer → code → reviewer). The rail, the marginalia and the preview reveal as the run progresses, with cost, latency, cache hits and a trace on screen.',
      'It is open for testing. Use the access code above and try one of the suggestions on the welcome screen.',
    ],
    principles: [
      { title: 'Modeless', body: 'No modes to pick before you start. One ~80-line session loop; tools and skills carry the difference, not the UI.' },
      { title: 'Route by task, not by habit', body: 'A cheap, fast model classifies and drafts. A strong model decides architecture and writes code. The same brief can go to two models when the answer matters.' },
      { title: 'Show the spend', body: 'Every run surfaces cost, latency, cache hits and a trace. An agent workspace that hides the bill cannot be reasoned about.' },
      { title: 'Memory is a document, not a database', body: 'Cooker is a human-editable set of pages (identity, voice, projects, decisions, taste) the orchestrator reads before every run. If I can read it, I can correct it.' },
      { title: 'Typed outputs, open brain', body: 'Orchestrator Mini is a closed catalogue of eight formats on top of an open-ended session loop. The catalogue makes the demo legible; the loop keeps the system honest.' },
      { title: 'Decisions on paper', body: 'Eleven architecture decision records, each with the alternative and its cost written down. The showreel is the presentation layer; the ADRs stay optimised for cost and efficiency, not for the demo.' },
    ],
    process: [
      { title: 'Retire the modes', body: 'V3’s modes were eight ways of saying the same thing. V4 replaced them with one session loop and let tools and skills carry the difference.' },
      { title: 'Decide the primitives', body: 'Sessions, Tools, Skills, Workflows, Artifacts, then Memory. Eleven ADRs, each with the cost of the alternative written down.' },
      { title: 'Build the router, then the agents', body: 'A Haiku-class router classifies into eight output formats and a firing matrix decides which of five named agents run. The pipeline is typed end to end.' },
      { title: 'Ship the showreel, keep the brain honest', body: 'Orchestrator Mini went live at roninos.app behind an access code. Phase 1 passes its test suite; CI, self-hosted deploy and full tracing are the next debts to pay.' },
    ],
    screens: [
      { src: 'builds/ronin/01-welcome.jpg', caption: 'Orchestrator Mini, welcome screen: one prompt, eight output formats, suggestions to start from.' },
    ],
    links: [{ label: 'Open roninos.app', href: 'https://roninos.app' }, { label: 'Source · orchestrator-mini', href: 'https://github.com/Gaurav2693/orchestrator-mini' }],
    note: 'Alpha, open for testing. Access code: 2693. Runs cost real tokens, so please be kind.',
  },
];

export const findBuild = (slug?: string) => buildPages.find((b) => b.slug === slug);
