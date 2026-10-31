# Deploy readiness implementation plan

**Goal:** Make the Soul540 monorepo deployable through the Docker Compose topology without broken images, routes, assets, or startup races.

**Approach:** Keep the existing prefixed URLs used by the main portal (`/fabrica`, `/itu`, `/franchise-assets`) and make the portal containers serve those prefixes correctly. Select the correct build output and Nginx configuration per portal during the image build. Start the API only after the database connection is ready.

**Scope:** Docker packaging, Nginx routing, standalone portal base paths, API bootstrap sequencing, and regression tests. Existing authentication, tenant isolation, and business rules are unchanged.

**Verification:** Add failing structure/bootstrap tests first, then run the focused tests, all 99 tests, `pnpm build`, `pnpm quality:check`, `docker compose config`, and a Docker build smoke check when available.
