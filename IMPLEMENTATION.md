# Technical Implementation Documentation

[Previous content remains unchanged up to Data Flow Architecture section...]

## Data Flow Architecture

[Previous diagrams remain unchanged...]

### AI Integration Flow
```mermaid
sequenceDiagram
    participant UI as User Interface
    participant RS as Recipe Store
    participant AI as AI Service
    participant EF1 as Parse-Recipe Edge Function
    participant EF2 as Generate-Image Edge Function
    participant OAI as OpenAI API

    UI->>RS: Process Recipe Text
    RS->>AI: Parse Recipe
    AI->>EF1: Call Parse-Recipe
    EF1->>OAI: Generate Response
    OAI-->>EF1: Recipe Data
    EF1-->>AI: Parsed Recipe Data
    
    opt Generate Photo
        RS->>AI: Request Image Generation
        AI->>EF2: Call Generate-Image
        EF2->>OAI: Generate Image
        OAI-->>EF2: Image URL
        EF2-->>AI: Image Data
    end
    
    AI-->>RS: Updated Recipe
    RS-->>UI: Display Updated Recipe
```

```

### State Management Flow
```mermaid
graph TB
    subgraph "User Actions"
        UA1[User Input]
        UA2[Form Changes]
        UA3[File Upload]
    end

    subgraph "Store Layer"
        S1[Recipe Store]
        S2[Auth Store]
        S3[UI Store]
    end

    subgraph "Service Layer"
        SV1[Recipe Service]
        SV2[Cost Service]
        SV3[Photo Service]
    end

    subgraph "Persistence Layer"
        P1[(Database)]
        P2[File Storage]
        P3[Local Storage]
    end

    UA1 --> S1 & S3
    UA2 --> S1
    UA3 --> S3
    
    S1 --> SV1 & SV2
    S3 --> SV3
    
    SV1 --> P1
    SV2 --> P1
    SV3 --> P2
    
    S2 --> P3
```

### Error Handling Flow
```mermaid
sequenceDiagram
    participant U as User Interface
    participant S as Store
    participant Sv as Service
    participant DB as Database
    participant L as Logger

    U->>S: Action Request
    S->>Sv: Process Action
    
    alt Success
        Sv->>DB: Database Operation
        DB-->>Sv: Success Response
        Sv-->>S: Update State
        S-->>U: Success UI Update
    else Database Error
        DB-->>Sv: Error Response
        Sv->>L: Log Error
        Sv-->>S: Error State
        S-->>U: Error UI Update
    else Network Error
        Sv->>L: Log Network Error
        Sv-->>S: Connection Error
        S-->>U: Network Error UI
    end
```

### Real-time Updates Flow
```mermaid
graph TB
    subgraph "Client"
        UI[User Interface]
        Store[State Store]
        Sub[Supabase Client]
    end

    subgraph "Server"
        Auth[Auth Service]
        RLS[Row Level Security]
        RT[Real-time Service]
        DB[(Database)]
    end

    UI --> Store
    Store --> Sub
    Sub --> Auth
    Auth --> RLS
    RLS --> RT
    RT --> DB
    DB --> RT
    RT --> Sub
    Sub --> Store
    Store --> UI
```

### Data Validation Flow
```mermaid
sequenceDiagram
    participant U as User Interface
    participant F as Form Handler
    participant V as Validator
    participant S as Store
    participant DB as Database

    U->>F: Submit Data
    F->>V: Validate Input
    
    alt Valid Data
        V->>S: Update Store
        S->>DB: Save Data
        DB-->>S: Confirmation
        S-->>U: Success Message
    else Invalid Data
        V-->>F: Validation Errors
        F-->>U: Display Errors
    end
```

### Component Communication Flow
```mermaid
graph TB
    subgraph "Parent Components"
        RC[Recipe Container]
        CC[Cost Container]
    end

    subgraph "Child Components"
        RI[Recipe Info]
        IL[Ingredient List]
        CA[Cost Analysis]
        PH[Photo Handler]
    end

    subgraph "Shared State"
        RS[Recipe Store]
        CS[Cost Store]
    end

    RC --> RI & IL & PH
    CC --> CA
    RI & IL --> RS
    CA --> CS
    RS --> CS
    CS --> CA
    RS --> RI & IL
```

[Previous content remains unchanged...]