# Postgres for the Sidecar Database

The companion app will use Postgres as its sidecar database from the MVP. The product needs reliable sync state, Review Queue state, Notion identifiers, and strongly connected Canon elements such as Characters, Locations, Factions, Events, Lore Entries, Relationships, and Sources, making a relational database a better fit than MongoDB's document flexibility or SQLite's local-first simplicity.
