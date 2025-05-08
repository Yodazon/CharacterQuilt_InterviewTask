# CharacterQuilt_Interview Task - May 8, 2025

Hi there! My name is Michael Karas.

This repo is intended to showcase the task given by the CharacterQuilt Team.

The task given was to build a Smart Worksheet similar to clay.com or ottogrid.ai.

I chose clay.com as the product of choice for this task. Used AI tools such as Cursor for coding, Chat GPT to generate logo.

## TechStack
- React
- NextJS
- OpenAI & Anthropic API



## Mermaid Chart of Code Structure

```mermaid
graph TD
    %% Main Application Structure
    A[Home Page - page.js] --> B[Header]
    A --> C[Main Content]
    A --> D[Footer]
    
    %% Header Components
    B --> B1[Logo]
    B --> B2[Title]
    B --> B3[Subtitle]
    
    %% Main Content Components
    C --> C1[WorksheetsManager - worksheetsManager.js]
    C1 --> C2[Worksheet - worksheet.js]
    C1 --> C3[EnrichModal - EnrichModal.js]
    C2 --> C4[CellEditor - CellEditor.js]
    C2 --> C5[ColumnHeader - ColumnHeader.js]
    
    %% Footer Components
    D --> D1[Copyright]

    %% Layout and Configuration
    E[Layout - layout.js] --> A
    F[Global Styles - globals.css] --> A

    %% Styling
    style A fill:#f8e9d2,stroke:#bfa76a
    style B fill:#ffffff,stroke:#bfa76a
    style C fill:#f5f3ee,stroke:#bfa76a
    style D fill:#ffffff,stroke:#bfa76a
    style C1 fill:#e6d3b3,stroke:#bfa76a
    style C2 fill:#e6d3b3,stroke:#bfa76a
    style C3 fill:#e6d3b3,stroke:#bfa76a
    style C4 fill:#e6d3b3,stroke:#bfa76a
    style C5 fill:#e6d3b3,stroke:#bfa76a
    style E fill:#f5f3ee,stroke:#bfa76a
    style F fill:#f5f3ee,stroke:#bfa76a

    %% Legend
    subgraph Legend
        L1[Page Component]:::page
        L2[Component]:::component
        L3[Layout/Style]:::layout
    end

    classDef page fill:#f8e9d2,stroke:#bfa76a
    classDef component fill:#e6d3b3,stroke:#bfa76a
    classDef layout fill:#f5f3ee,stroke:#bfa76a
```
