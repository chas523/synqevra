# API

The backend runs on **NestJS** on port `3003`. It sits between the frontend and every external service (ThingsBoard, Medplum, the MLLP server) — nothing talks to those services directly, everything goes through here - our proxy.

---

## Code Architecture

### Domain-Driven Design (DDD)

The code is split into domain modules. Each module owns one business area and doesn't bleed into others. Inside every module there are four folders with a clear job:

- `domain/` — entities, repository contracts, and domain models (sometimes repository contracts are placed in application/ports folder).
- `application/` — use cases, commands, queries, and orchestration. This is where the actual business logic lives.
- `infrastructure/` — repository implementations, HTTP clients, database access. 
- `interface/` — REST controllers, pipes, WebSocket gateways. The public-facing entry points of the module.

### Ports & Adapters

Cross-module communication happens through **ports** — abstract classes that define an abstract functions. The best example is `ThingsboardApiPort`, which declares hundreds of methods for talking to ThingsBoard. The actual HTTP adapter is injected via NestJS DI using the `THINGSBOARD_API_PORT` token. This means it's possible to swap the implementation without touching a single line of business logic.

### CQRS

The `thingsboard` module uses CQRS. Every operation is either a:
- **Command** (`application/commands/`) — something that changes state: `register-tenant`, `create-device`, `delete-rule-chain`, etc.
- **Query** (`application/queries/`) — something that only reads: `fetch-devices`, `fetch-tenants`, `fetch-rule-chains`, etc.

The `@nestjs/cqrs` package is registered globally in `AppModule`.

### Use cases

There are couple of modules that use use cases in application/ folder instead of CQRS patterns. Those are for example: `medplum`, `iam` or `connection` modules. So keep in mind which module uses CQRS/use case pattern to match your code to codebase properly.


### Error Handling

Two patterns coexist in the codebase depending on the module.

**Standard NestJS exceptions** — most modules (e.g. `iam`, `medplum`) just throw `BadRequestException`, `NotFoundException`, `InternalServerErrorException`, etc. NestJS catches them and maps them to the right HTTP status codes. Nothing fancy, gets the job done.

**`oxide.ts` Result type** — the `thingsboard` and `pending-user` modules use a more explicit approach. Handlers return `Result<OkType, ErrType>` instead of throwing. The handler itself returns either `Ok(value)` or `Err(domainError)`, and the controller unpacks it using `match`:

```typescript
// Command handler — returns a Result instead of throwing
async execute(command: CreatePendingUserCommand): Promise<Result<PendingUserModel, UserAlreadyExistsError>> {
  const existing = await this.repository.findByEmail(command.email);
  if (existing) return Err(new UserAlreadyExistsError());

  const user = await this.repository.save(/* ... */);
  return Ok(user);
}

// Controller — unpacks the Result and maps domain errors to HTTP exceptions
const result: Result<PendingUserModel, UserAlreadyExistsError> = await this.commandBus.execute(command);

return match(result, {
  Ok: (model) => PendingUserResponseMapper.toDto(model),
  Err: (error) => {
    if (error instanceof UserAlreadyExistsError) throw new ConflictHttpException(error.message);
    throw error;
  },
});
```

This way domain errors stay as plain classes inside the application layer, and only the controller decides which HTTP status to return. Errors don't bleed through as raw exceptions, they're just values.


### Unit of Work (Transactions)

For operations that touch multiple tables at once (like tenant registration), we use the **Unit of Work** pattern. The `UnitOfWork` class (in `connection/infrastructure/transaction/`) wraps all repositories and a TypeORM `QueryRunner` into a single object. Usage looks like this:

```typescript
const uow = await this.unitOfWorkFactory.create();
try {
  await this.someUseCase.executeWithUOW(command, uow);
  await uow.commit();
} catch (error) {
  await uow.rollback();
  throw error;
} finally {
  await uow.release();
}
```

Everything in that block either fully succeeds or fully rolls back.

### Global Stuff

- **ThrottlerGuard** is applied globally — 10 requests per 10 seconds by default. Individual endpoints can override this (e.g. `POST /auth/login` is limited to 5 per 30 seconds).
- **CacheModule** is registered globally and used for things like HL7 message deduplication and caching Medplum client instances.
- **Swagger** is available at `/swagger` and auto-documents all endpoints.
- The global API prefix is `/api`, except for `/fhir/* (which is used for HL7 integration)`, `/public-api/*`, and `/swagger`.

### ThingsBoard Auth Proxy (port 3002)

`main.ts` also starts a second Express server on port `3002`. The whole point of it is to let the frontend embed ThingsBoard dashboards directly inside the app using `<iframe>` tags — instead of having to manually re-implement every chart, graph, or widget ThingsBoard already provides. This way we get all that functionality for free, rendered inside our own UI.

The proxy sits in front of ThingsBoard and makes this possible: it handles authentication bridging, strips response headers that would block iframe embedding, and injects CSS to hide ThingsBoard's own navigation — so the user only sees the dashboard content, not the ThingsBoard UI shell around it.

---


## Modules Description

### `auth`

It provides the Passport.js strategies and guards used across the rest of the app (`local`, `jwt`, `refresh`, `google`, plus admin and patient variants of each). By default every endpoint requires a valid JWT. To open up a specific endpoint, use the `@Public()` decorator. Does not contain controllers or api endpoints.

---

### `iam` (Identity & Access Management)

Handles our application's users (stored in PostgreSQL). Registration, login, logout, token refresh. Important distinction: this manages *our* users, not ThingsBoard users. So only manages objects inside our own PostgreSQL database.

**Controllers:**
- `auth.controller.ts` — registration, login (email/password and Google OAuth 2.0), logout, token refresh, inviting new practitioners.
- `users.controller.ts` — reading and updating user profiles.
- `admin.controller.ts` — admin-only endpoints: accepting pending users, impersonating ThingsBoard tenants.
- `patient.controller.ts` — patient login flow (link-based, separate from the regular login).

**Notable use cases:**
- `RegisterUserUseCase` — saves a new user to the database. They land in a "pending" state first.
- `LoginUserUseCase` / `LoginAdminUseCase` — generate an access + refresh token pair and set them as HTTP-only cookies. Different endpoints, used in different routes on frontend.
- `RefreshTokensUseCase` — exchanges a refresh token for a new access token (for our database, not thingsboard one). The refresh token is hashed and stored in the database.
- `InvitePractitionerUseCase` — creates a user with the Practitioner role and sends them an activation email. Requires MODERATOR role (so tenant owners can invite other people to their project - only works in medplum addon, we might want to use this logic for non-medplum case too).

**Roles:** `ADMIN` - superadmin of application (sysadmin of thingsboard), `MODERATOR` - project admin, the one who created the project (tenant admin of thingsboard), `PRACTITIONER` - tenant admin of thingsboard as well, but he's invided, so we don't treat him as the 'owner' of the project, has slightly less permissions than MODERATOR", `USER` - basically not used, could be removed `PATIENT` - patient role, the authentication functionality (endpoints) is prepared, but we don't use this - the plan was to prepare mobile app for patients."

---

### `connection`

Manages the link between our application user and their ThingsBoard account. When a user logs in, we need to know which ThingsBoard tenant they belong to and what their access tokens are.

This module holds the `UnitOfWorkFactory` for creating transactional contexts, and the `Connection` entity repositories — records that tie our user to a ThingsBoard tenant ID, access token, and refresh token.

---

### `thingsboard`

The biggest module in the codebase. It acts as a proxy between the frontend and the ThingsBoard API — every ThingsBoard operation goes through here. The frontend never calls ThingsBoard directly.

This setup lets us inject our own logic around ThingsBoard operations. The clearest example is tenant registration: when a new tenant is created, we don't just call ThingsBoard — we also configure rule chains, and create our database records, all in one  flow.

**CQRS breakdown:**
- Commands (C~~R~~UD) `RegisterTenantCommand`, `CreateDeviceCommand`, `DeleteRuleChainCommand`, `SaveOAuth2ClientCommand`, and many more.
- Queries (~~C~~**R**~~UD~~)`FetchDevicesQuery`, `FetchRuleChainsQuery`, `FetchTenantsQuery`, etc.

Each command/query has its own folder with a handler that injects `ThingsboardApiPort` and calls the right method.

**Example operation — `RegisterTenantCommand`:**

Tenant registration is one of the most involved flows in the entire app. The handler (`register-tenant.command-handler.ts`) does the following in sequence:
1. Logs into ThingsBoard as SysAdmin.
2. Creates the tenant profile and an admin account in ThingsBoard.
3. Creates the corresponding records in our own database (inside a UnitOfWork transaction).
4. Creates a "Base Rule Chain" from `base_rule_chain.json` and wires it into the tenant's Root Rule Chain, so telemetry can flow to the Medplum proxy.


**Bundled assets:**
- `base_rule_chain.json` — the Rule Chain template automatically deployed for every new tenant. Defines nodes for filtering telemetry and forwarding medical alerts to the proxy endpoint.

**Example dashoard**:
- `hospital_room_monitoring.json` — a ThingsBoard dashboard template for hospital room monitoring. It's not used in the code. It's just an example of what we can do with our application.

---

### `medplum`

Handles everything related to the Medplum FHIR platform. The full feature description is in the top-level `Readme.md`.

**MedplumClientFactory** is the key piece here. Initializing a `MedplumClient` from `@medplum/core` is expensive — it has to authenticate against Medplum. So the factory keeps authenticated instances in two in-memory caches:
- `clientCache` — indexed by `userId`, used for user-facing API calls.
- `proxyCache` — indexed by `tenantId`, used for calls coming from the Rule Chain proxy.

Every subsequent request gets the cached instance instead of going through the login flow again. If authentication fails, the entry is removed from the cache so the next request can try fresh.

**Use cases:**
- `CreateMedplumTenantUseCase` — the big one. Creates a Medplum project, sets up the admin client, creates the Medplum admin user, syncs existing ThingsBoard devices as FHIR resources, and saves the credentials to our database. It's called when sysadmin triggers this action manually for a tenant - toggle Medplum addon state 'ON'.
- `RegisterMedplumUseCase` — registers a Medplum connection for an individual user.
- `PatientUseCase` — fetches patient lists and individual patient details from Medplum.
- `DeviceUseCase` — syncs ThingsBoard devices to Medplum.
- `GetPractitionerListUseCase` / `GetPractitionerByIdUseCase` — reads practitioner data.

**Controller:**
- `medplum.controller.ts` — endpoints for managing patients, practitioners, and devices. Also includes the endpoint that triggers Medplum initialization for a tenant.

**Supporting services:**
- `MedplumRegistrationService` — the actual step-by-step logic for setting up a Medplum project (called by `CreateMedplumTenantUseCase`).
- `MedplumRollbackService` — cleans up a partial Medplum setup if something fails mid-way.
- `PasswordGeneratorService` — generates secure passwords for Medplum admin accounts.

---

### `hl7`

Handles incoming **HL7 v2** messages from hospital systems (typically sent via the MLLP server sitting in front of it).

Messages arrive at `POST /public-api/hl7-decode` — no authentication required, since this endpoint is only called by the local MLLP server. The hospital should know proper tenantId to route messages to the proper project (medplum addon instance). Before the request even reaches the controller, it passes through two pipes:
1. `Hl7ValidationPipe` — checks that the payload is a valid HL7 message.
2. `HL7ToFHIRPipe` — parses the message do valid FHIR resources using `@medplum/core`, checks a deduplication cache to skip already-processed messages, and maps the HL7 segments to FHIR resources.

The mapped FHIR resources are then pushed to a BullMQ queue (`hl7_processing`) and processed asynchronously, saving them to Medplum.

**Mapping use cases:**
- `CreatePatientFromPidUseCase` — maps the PID segment to a FHIR `Patient`. Checks if the patient already exists in Medplum by identifier. Also handles `A40` merge messages.
- `CreateEncounterPv1UseCase` — maps the PV1 segment to a FHIR `Encounter`. Extracts the attending practitioner and creates a `Practitioner` resource if needed.

---

### `proxy`

A small but important module. It exposes one endpoint: `POST /api/proxy/telemetry`. This is called by the **Base Rule Chain in ThingsBoard**, not by the frontend. It's public (no auth) because we don't pass any token through ThingsBoard rule chain. Actually an investigation should be made if we can pass authorization in rulechain to make it more secure.

When the rule chain detects a medical threshold breach (e.g. heart rate out of range), it sends the telemetry data here. The backend then creates an `Observation` resource in Medplum for the corresponding patient.

The code responsible for this is in `base_rule_chain.json` - check "Script" node for the exact code to filter abnormal telemetry and forward it to this endpoint.

Basically it's about reading what should be measured by device in device "Shared attributes". Then checking if the data that came is correct (the keys are equal with "shared attributes" keys).  Then checking if the measured value is within the range (so if the value is greater or less than the threshold value that is saved in shared attributes). If not, it sends the telemetry data to this endpoint.

---

### `pending-user`

Manages users waiting for admin approval. New users — whether they register with email/password or come in via Google OAuth — don't get access right away. They land in a "pending" state first.

They should be then accepted at the /dashboard/requestedUsers path at frontend.

Uses CQRS internally: `CreatePendingUserCommand`, `UpdatePendingUserCommand`, `DeletePendingUserCommand`, plus queries for listing pending users. Admins approve or reject them through the `admin.controller.ts` endpoint in the `iam` module.

---

### `mailer`

Handles sending emails. Currently used for:
- New user email invitation (we send invitation email to user at the moment he's accepted by admin - he can then go to his activation form through e-mail).
- Practitioner invitation emails with an activation link (`InvitePractitionerUseCase`).


SMTP configuration (host, port, credentials) comes from environment variables in `.env`.

---

### `config`

NestJS configuration factories (`dbConfig`, `minioConfig`). Loaded globally via `ConfigModule.forRoot()` in `AppModule` and accessible anywhere through `ConfigService`.

---

```
src/
├── app.module.ts          # Root module,registers everything
├── main.ts                # App bootstrap + <iframe> handler (port 3002)
│
├── auth/                  # Passport.js strategies and guards
├── config/                # DB and MinIO config factories
├── connection/            # User <-> ThingsBoard link + Unit of Work
├── hl7/                   # HL7 → FHIR parsing and processing (for HL7 via MLLP integration)
├── iam/                   # Users, roles, login, tokens
├── mailer/                # Email sending
├── medplum/               # Medplum addon integration
├── pending-user/          # Users waiting for approval
├── proxy/                 # Telemetry endpoint for ThingsBoard Rule Chain
├── thingsboard/           # CQRS proxy for ThingsBoard API (basically all thingsboard endpoints)
└── utils/                 # Shared helpers
```
