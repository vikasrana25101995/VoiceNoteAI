# Architecture Migration Guide v2

## Purpose

This project is being migrated from a legacy architecture to a fully modular architecture.

The migration is incremental.

The primary objective is to isolate every page and reusable component into a completely self-contained module while preserving **100% of the existing behaviour**.

Architecture improvements must **never** modify business functionality.

---

# Core Principles

## Principle 1 — Functionality First

Architecture must never change behaviour.

Never modify:

* Business logic
* API contracts
* Routing
* Validation
* State flow
* Component props
* UI behaviour
* Error handling

Optimisation must never take priority over preserving functionality.

---

## Principle 2 — Module Isolation

Every page and reusable component must become completely independent.

Each module owns:

* UI
* Actions
* Services
* Hooks
* Constants
* Types
* Imports
* Styles

A module must never depend on implementation files from another feature.

---

## Principle 3 — Isolation Before Optimisation

During migration:

* Temporary duplication is acceptable.
* Hidden dependencies are not.

Do **not** create shared utilities or common abstractions until the **entire project** has been migrated.

---

## Principle 4 — One Module at a Time

Never migrate multiple modules simultaneously.

Workflow:

1. Analyse
2. Plan
3. Migrate
4. Verify
5. Complete
6. Move to the next module

---

# Target Module Structure

Every page and reusable component must follow this structure.

```text
Component/

    index.tsx

    CORE/
        actions.ts
        services.ts
        hooks.ts
        constants.ts
        imports.ts
        types.ts

    STYLE/
        desktop.scss
        tablet.scss
        mobile.scss
        index.module.scss
```

---

# Folder Responsibilities

## Root

The root should remain minimal.

Only:

```text
index.tsx
CORE/
STYLE/
```

The root must never become cluttered.

`index.tsx` should always be immediately identifiable as the module entry point.

---

## CORE

The CORE folder contains every implementation file.

### actions.ts

Contains

* Business logic
* Event handlers
* State updates
* Helper methods

Must use class-based architecture.

Example

```typescript
export class HomeActions {

    submit(){}

    reset(){}

}
```

Do not export standalone functions.

---

### services.ts

Contains

* API calls
* REST
* GraphQL
* Supabase
* Database communication

Must use class-based architecture.

```typescript
export class HomeService {

    async getData(){}

}
```

Never include UI logic.

---

### hooks.ts

Contains

* Custom hooks
* State management hooks
* Effects
* Module-specific reusable logic

Never place reusable hooks inside index.tsx.

---

### constants.ts

Contains

* Strings
* Configuration
* Enums
* Magic values
* Repeated values

---

### imports.ts

Contains

* Module imports
* Shared exports
* Organised imports

---

### types.ts

Contains

* Interfaces
* Models
* Enums
* DTOs
* Response types
* Shared module types

---

# Styling

Every module owns its own styles.

```text
STYLE/

desktop.scss

tablet.scss

mobile.scss

index.module.scss
```

`index.module.scss` imports

* desktop.scss
* tablet.scss
* mobile.scss

Use BEM naming.

Every selector starts with the module name.

Example

```scss
home

home__header

home__button

home__button--primary
```

Never import styles from another feature.

Copy only the required styles.

Rename selectors when necessary.

Preserve identical UI behaviour.

---

# Migration Workflow

Every migration must follow these phases.

---

# Phase 1 — Analyse

Before modifying any code:

Inspect the module completely.

Produce an analysis report containing:

* Module path
* Current structure
* Imports
* Exports
* API usage
* Hooks
* Styles
* Types
* Constants
* Services
* Business logic
* Cross-feature dependencies

Do not modify any files during this phase.

---

# Phase 2 — Migration Plan

Generate a migration plan.

Include

* Files to create
* Logic to move
* Services to move
* Hooks to move
* Constants to move
* Types to move
* Styles to move
* Dependencies to remove

No implementation yet.

---

# Phase 3 — Execute

Create the required structure.

```text
Component/

    index.tsx

    CORE/
        actions.ts
        services.ts
        hooks.ts
        constants.ts
        imports.ts
        types.ts

    STYLE/
        desktop.scss
        tablet.scss
        mobile.scss
        index.module.scss
```

Move code into the correct files.

Only modify the current module.

---

# Migration Rules

## Rule 1

Move business logic into Actions.

---

## Rule 2

Move API communication into Services.

---

## Rule 3

Move reusable React logic into Hooks.

---

## Rule 4

Move repeated values into Constants.

---

## Rule 5

Move interfaces into Types.

---

## Rule 6

Organise imports using imports.ts.

---

## Rule 7

Keep index.tsx focused on UI composition.

---

# Cross-Feature Dependencies

Search for:

* Actions
* Services
* Hooks
* Constants
* Types
* Styles

Examples

```text
Home imports Dashboard actions

Login imports Dashboard styles

Profile imports Home service
```

These dependencies must never remain.

Instead:

Copy only the required implementation.

Place it inside the current module.

Preserve behaviour.

Do not optimise.

---

# Ownership Rules

Each module owns:

* Actions
* Services
* Hooks
* Constants
* Types
* Styles

Every file has exactly one owner.

If another module requires the same implementation:

Copy it.

Do not create Common.

Do not create Utility folders.

Do not create Shared folders.

---

# Common Layer

The Common layer is intentionally postponed.

Do NOT create

```text
common/

shared/

utils/

helpers/

global-services/

global-actions/
```

until every module is fully independent.

---

# Behaviour Preservation

Migration must never change:

* Validation
* Routing
* Business logic
* API requests
* API responses
* UI behaviour
* State flow
* Component props
* Existing functionality

Only file organisation may change.

---

# Verification Phase

Every migrated module must pass all verification checks.

---

## Folder Verification

Must contain

```text
index.tsx

CORE/
STYLE/
```

---

## CORE Verification

Must contain

```text
actions.ts

services.ts

hooks.ts

constants.ts

imports.ts

types.ts
```

---

## Style Verification

Verify

* Own styles only
* BEM naming
* index.module.scss imports desktop/tablet/mobile
* No external feature styles

---

## Dependency Verification

Search for imports from other features.

These should not exist.

```text
../../Home/

../../Dashboard/

../Profile/

../Settings/
```

Only these imports are allowed:

* React
* Next.js
* Third-party libraries
* Current module files

---

## Actions Verification

Verify

* Class-based architecture
* No standalone functions
* No imported actions from another feature

---

## Services Verification

Verify

* All API calls inside Services
* No API logic inside components
* No imported services from another feature

---

## Hooks Verification

Verify

* Reusable hooks inside hooks.ts
* No large hook implementations inside index.tsx

---

## Constants Verification

Verify

* Strings extracted
* Configuration extracted
* Magic numbers removed

---

## Types Verification

Verify

* Interfaces extracted
* Models extracted
* Enums extracted

---

## Component Verification

index.tsx should primarily contain:

* Rendering
* JSX
* Hook usage
* Calling Actions

Large business logic should not remain.

---

## Behaviour Verification

Confirm

* Same routes
* Same API
* Same validation
* Same UI
* Same props
* Same state flow
* Same functionality

---

## Build Verification

Run

* TypeScript compile
* ESLint
* Project build

Resolve any issues introduced by migration.

---

# Migration Report

After completing each module, generate a report.

Example

```text
Migration Report

Module:
Home

Created
✓ CORE/actions.ts
✓ CORE/services.ts
✓ CORE/hooks.ts
✓ CORE/constants.ts
✓ CORE/imports.ts
✓ CORE/types.ts
✓ STYLE/

Dependencies Removed
✓ DashboardActions
✓ Dashboard styles
✓ Shared Home service

Logic Moved
✓ API calls
✓ Business logic
✓ Event handlers
✓ Hooks

Verification
✓ No cross-feature imports
✓ Own styles only
✓ Own actions
✓ Own services
✓ Own hooks
✓ TypeScript passes
✓ ESLint passes

Status
SUCCESS
```

---

# Critical Rules

## Never Delete Functionality

If uncertain:

Copy the implementation.

Never rewrite business logic.

---

## Never Optimise During Migration

Do not

* Refactor algorithms
* Simplify logic
* Merge files
* Extract utilities
* Introduce Common
* Introduce Shared

Migration is organisational only.

---

## Search Before Modify

Before editing any file:

Search for

* Imports
* Exports
* References
* Usage

Never assume.

---

## Completion Rule

A module is complete only when:

* Folder structure is correct
* No cross-feature implementation imports remain
* Module owns all implementation
* Verification passes
* TypeScript compiles
* ESLint passes
* Behaviour is unchanged

Only then proceed to the next module.

---

# Initial Audit Requirement

Before making any changes, perform a complete project audit.

For every page and reusable component, produce:

* Module path
* Current structure
* Missing required files
* Cross-feature imports
* Business logic inside index.tsx
* API calls inside components
* Shared styles
* Shared services
* Shared actions
* Missing BEM styles
* Migration priority (High/Medium/Low)
* Estimated migration complexity (Small/Medium/Large)

Do **not** modify any files during this audit.

Only after the audit is complete should migration begin, proceeding **one module at a time**, with a full verification report after each completed module.
