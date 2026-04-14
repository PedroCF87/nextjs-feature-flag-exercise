# Architecture Diagram — nextjs-feature-flag-exercise

![Architecture-Diagram](./architecture-diagram.png)

> Data flow: `shared/types.ts` → Zod validation → Service → Routes → Client API → UI

```mermaid
graph TD
    subgraph Client["Client (React 19 + Vite — port 3000)"]
        APP["App.tsx\nuseQuery(['flags', filterState])\nuseMutation (create/update/delete)"]
        API["api/flags.ts\ngetFlags(filters)\nURLSearchParams → fetch"]
        TABLE["flags-table.tsx\nFlagsTable props"]
        MODAL["flag-form-modal.tsx\nCreate / Edit"]
        APP -->|"flags: FeatureFlag[]"| TABLE
        APP -->|"open/onSubmit"| MODAL
        APP -->|"getFlags(filterState)"| API
    end

    subgraph Shared["shared/types.ts"]
        TYPES["FeatureFlag\nCreateFlagInput · UpdateFlagInput\nEnvironment · FlagType · ApiError\nFlagFilters ← EPIC-1"]
    end

    subgraph Server["Server (Node.js ESM + Express v5 — port 3001)"]
        ROUTES["routes/flags.ts\nGET /  POST /\nGET /:id  PUT /:id  DELETE /:id"]
        VALID["middleware/validation.ts\ncreateFlagSchema\nupdateFlagSchema\nflagsQuerySchema ← EPIC-1"]
        ERR["middleware/error.ts\nNotFoundError 404\nConflictError 409\nValidationError 400"]
        SVC["services/flags.ts\ngetAllFlags()\ngetFilteredFlags() ← EPIC-1\ngetFlagById · getFlagByName\ncreateFlag · updateFlag · deleteFlag"]
        DBCLIENT["db/client.ts\ngetDb() · saveDb()\n_resetDbForTesting()"]
        SCHEMA["db/schema.ts\nCREATE TABLE flags"]
        SEED["db/seed.ts\n25 seed flags"]

        ROUTES -->|"next(error)"| ERR
        ROUTES -->|"parse body"| VALID
        ROUTES -->|"delegate"| SVC
        SVC -->|"getDb()"| DBCLIENT
    end

    subgraph DB["SQL.js (SQLite WASM — in-memory + flags.db)"]
        SQLDB["flags table\nid TEXT PK\nname TEXT UNIQUE\nenabled INTEGER 0/1\nenvironment TEXT\ntype TEXT\nrollout_percentage INTEGER\nowner TEXT\ntags TEXT JSON\ncreated_at · updated_at TEXT"]
    end

    subgraph Tests["server/src/__tests__/flags.test.ts (Vitest)"]
        TEST["16 it() blocks\nbeforeEach: new SQL.Database\n+ createTables + _resetDbForTesting\nafterEach: _resetDbForTesting(null) + db.close()"]
    end

    API -->|"HTTP GET /api/flags?..."| ROUTES
    DBCLIENT -->|"db.exec / db.prepare + stmt.bind"| SQLDB
    SCHEMA -->|"createTables(db)"| SQLDB
    SEED -.->|"dev only"| SQLDB
    DBCLIENT ---|"_resetDbForTesting()"| TEST
    Client -.->|"@shared/*"| Shared
    Server -.->|"@shared/*"| Shared

    style TYPES fill:#f0e68c,stroke:#b8860b
    style VALID fill:#ffe4b5,stroke:#daa520
    style SVC fill:#e0f0ff,stroke:#4682b4
    style APP fill:#e0f0ff,stroke:#4682b4
    style SQLDB fill:#f5f5f5,stroke:#888
```

**Nodes marked `← EPIC-1`** are not yet implemented and represent the filtering feature target (see [TASK.md](../TASK.md)).
