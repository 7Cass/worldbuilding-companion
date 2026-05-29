# Worldbuilding Companion

Worldbuilding Companion is a creative context for shaping, checking, and navigating fictional canons for writers, tabletop RPG creators, and game lore creators.

## Language

**Canon**:
The coherent body of worldbuilding truth for a creative work, campaign, or lore project. A Canon may contain many worlds, regions, factions, characters, events, rules, and sources.
_Avoid_: World, universe, workspace, project

**Worldbuilding**:
The creative domain of constructing fictional settings, histories, peoples, places, rules, and relationships. Worldbuilding is the product's domain, not a generic metaphor for personal knowledge management.
_Avoid_: Knowledge management, study system, general note taking

**World**:
A setting entity within a Canon, when the fiction itself contains a world, planet, realm, or similar place. World is not the root container for a user's whole body of imagination.
_Avoid_: Canon, project

**Character**:
A named actor in a Canon, such as a protagonist, NPC, deity, creature, or historically relevant figure in the fiction. A Character may belong to factions, appear in events, and have relationships with other Characters or setting entities.
_Avoid_: Person, NPC as the generic term, actor

**Location**:
A place, region, structure, realm, planet, or other spatial setting within a Canon. A Location can contain other Locations and can be associated with Characters, Factions, Events, and Worldbuilding details.
_Avoid_: Place, setting as the generic term

**Faction**:
An organized group with identity, goals, and a meaningful boundary of membership, such as an empire, noble house, guild, cult, government, corporation, army, school, or clan. A religion as an organized institution can be a Faction; a religion as doctrine or belief system is a Lore Entry.
_Avoid_: Organization, group, institution

**Event**:
A meaningful occurrence in the Canon, such as a war, birth, death, coronation, betrayal, discovery, disaster, ritual, founding, journey, battle, or tabletop session event. A Timeline is a view over Events, not a separate Canon element in the initial language.
_Avoid_: Scene as the generic term, timeline item

**Relationship**:
A meaningful connection between two parts of a Canon, such as membership, location, alliance, opposition, kinship, creation, rule, or participation. The initial Relationship types are Member Of, Located In, Allied With, Opposed To, Related To, Created By, Rules Over, and Participated In; each Relationship should name what the connection means, not merely that two things are linked.
_Avoid_: Link, reference, association

**Lore Entry**:
A typed worldbuilding element that is not primarily a Character, Location, Faction, or Event, such as a species, culture, religion, magic system, technology, artifact, language, custom, or law. A Lore Entry must have a subtype so it remains a specific piece of lore rather than a miscellaneous note.
_Avoid_: Misc note, concept, idea

**Source**:
A cited origin for information in the Canon, such as a Notion page, chapter, session note, draft, document, or imported reference. A Source explains where a claim or detail came from; it is not itself the claim.
_Avoid_: Metadata, reference as a catch-all, note

**Review Queue**:
The place where AI-produced summaries, gaps, consistency findings, and proposed changes wait for creator approval before affecting the Canon. The Review Queue protects the Canon from unapproved AI changes.
_Avoid_: Auto-apply, inbox as the generic term, suggestions

## Flagged Ambiguities

**World vs Canon**:
Use Canon for the top-level body of truth the creator is building. Use World only when referring to an in-fiction setting entity inside that Canon.

## Example Dialogue

Developer: "Is the user's workspace called a World?"
Domain expert: "No. The top-level body of truth is the Canon; a World can exist inside that Canon."

Developer: "Can one Canon contain several planets or universes?"
Domain expert: "Yes. The Canon can contain many setting entities, including worlds, planets, realms, or universes."

Developer: "Is this also for students organizing history notes?"
Domain expert: "Not as the primary domain. The product is for fictional worldbuilding by writers, RPG creators, and game lore creators."

Developer: "Should every important detail point back to a note?"
Domain expert: "When possible, yes. The Source is what lets the creator understand where a Canon detail came from."

Developer: "Is a page mention enough to count as a Relationship?"
Domain expert: "No. A Relationship says what the connection means, such as loyalty, conflict, membership, or origin."

Developer: "Where does a magic system go?"
Domain expert: "It is a Lore Entry with the Magic System subtype unless it later needs its own dedicated model."

Developer: "Is the Church of the Silver Flame a Faction or a Lore Entry?"
Domain expert: "The church as an institution is a Faction; the faith's doctrine is a Lore Entry."

Developer: "Should we store a Timeline separately?"
Domain expert: "No. The Timeline is a way to view Events."

Developer: "Can the AI update the Canon directly?"
Domain expert: "No. AI output goes through the Review Queue before it can affect the Canon."
