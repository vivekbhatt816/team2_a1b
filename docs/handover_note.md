# Handover Note – BiteStream (Project 1)

**Course:** CS6.302 Software System Development – Assignment 2 (Front End Design)  
**Inherited from:** Assignment 1 Team [team 5] – [[repository link](https://github.com/adimitt/team5_a1)]  
**Our team:** Assignment 1B Team [team 2]

## What we inherited

We inherited the Assignment 1 BiteStream backend, consisting of PostgreSQL and MongoDB databases, SQL/MongoDB workflow scripts, and data-generation scripts. The four workflows are:

| # | Workflow | Main implementation |
|---|---|---|
| 1 | Place an order: wallet debit, order creation, wallet audit trigger, and prevention of a second active order | PostgreSQL stored procedure, trigger, and partial unique index (`sql/`) |
| 2 | Revenue analytics: seven-day moving average and restaurant ranking, with materialized-view summaries | PostgreSQL window queries and materialized view (`sql/`) |
| 3 | Find nearby active drivers for a restaurant | MongoDB `$geoNear` aggregation and geospatial index (`mongo/`) |
| 4 | Review analytics and menu data | MongoDB `$facet` aggregation and `Menus` collection (`mongo/`) |

## What worked

- We were able to start the inherited system locally and load the database data and workflow components using the repository setup instructions, with local environment configuration.
- The frontend/API launched locally, and the main screens were available: Overview, Browse, Checkout, Wallet Audit, Analytics, Live Driver Map, and Reviews.
- The checkout flow was exercised successfully through the UI.
- The PostgreSQL window-analytics script completed all three queries.
- The materialized-view refresh procedure completed successfully and reported 1,000 rows in the local test environment.
- The MongoDB nearby-driver workflow returned a nearby active driver for a restaurant. Its explain output showed the geospatial index (`ix_pings_geo`) and `GEO_NEAR_2DSPHERE`, with no `COLLSCAN` in the winning geospatial plan.
- The MongoDB review workflow returned review statistics. Its explain output used `ix_reviews_restaurant_recent` for the restaurant-scoped query, with no `COLLSCAN` in the winning cursor plan.

These checks confirm that the listed workflows executed in our local test environment; they do not establish that every error path or concurrency edge case has been tested.

## What did not work / limitations observed

- The DriverPings collection uses a 2-hour TTL (7,200 seconds), as required by the Assignment 1 specification. Older pings expire automatically, so the available ping count may decrease over time. This is expected behaviour, not a defect.
- Some setup instructions and database defaults in the inherited README may not match every developer's local environment. Follow the actual environment configuration used by your team rather than treating a machine-specific database name as an inherited project change.

## What we changed and why

| File/folder | Change | Reason |
|---|---|---|
| `api/` | Added/integrated the API and frontend connection to the inherited PostgreSQL and MongoDB workflows | Lets users access the workflows through a browser rather than running database scripts manually |
| `docs/design/` | Added wireframes for Overview, Browse, Checkout, Wallet Audit, Analytics, Live Map, and Reviews | To document the screen design before/alongside implementation |

## Suggestions for the original authors

1. Document the exact setup order for schema, triggers/procedures, seed data, indexes, materialized views, and MongoDB workflows in one place.
2. Ensure the MongoDB setup creates the `2dsphere` index and that coordinates are stored as `[longitude, latitude]`.
3. Return clear checkout error statuses/messages for cases such as insufficient funds and an existing active order.
4. Document when the materialized view should be refreshed, or provide a refresh schedule if appropriate.
5. Consider a smaller seed-data option for faster local development and testing.

## Final handover note

The inherited BiteStream backend and its four main workflows were exercised in our local environment, and the frontend/API was launched with the main screens available. The tests recorded above are execution checks, not a claim that every constraint, failure path, or concurrency case has been exhaustively verified. Machine-specific database names, credentials, and environment variables are local setup details and should not be described as changes to the inherited project.
