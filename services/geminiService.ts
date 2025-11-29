
import { GoogleGenAI, Type } from "@google/genai";
import type { ProblemCard, UserInput } from '../types';
import { BackendTech } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const problemCardSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, descriptive title for the problem." },
    description: { type: Type.STRING, description: "A one-paragraph summary of the business problem to be solved." },
    entities: {
      type: Type.ARRAY,
      description: "The data models or nouns in the system.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Singular name of the entity (e.g., 'User', 'Invoice')." },
          description: { type: Type.STRING, description: "A brief description of the entity's purpose." },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Field name (e.g., 'firstName', 'amountDue')." },
                type: { type: Type.STRING, description: "Data type (e.g., 'string', 'number', 'date', 'boolean')." },
                description: { type: Type.STRING, description: "Brief description of the field." },
              },
              required: ["name", "type"],
            },
          },
        },
        required: ["name", "fields"],
      },
    },
    relationships: {
      type: Type.ARRAY,
      description: "How entities relate to each other.",
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING, description: "The source entity name." },
          to: { type: Type.STRING, description: "The target entity name." },
          type: { type: Type.STRING, description: "Cardinality ('one-to-one', 'one-to-many', 'many-to-many')." },
          description: { type: Type.STRING, description: "Description of the relationship (e.g., 'A User has many Posts')." },
        },
        required: ["from", "to", "type"],
      },
    },
    actions: {
      type: Type.ARRAY,
      description: "The primary operations or verbs in the system.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The action name (e.g., 'createInvoice', 'approveTimesheet')." },
          entity: { type: Type.STRING, description: "The primary entity this action operates on." },
          description: { type: Type.STRING, description: "What this action does." },
          inputs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } } } },
          outputs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } } } },
        },
        required: ["name", "entity", "description"],
      },
    },
    policies: {
      type: Type.ARRAY,
      description: "Access control rules.",
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING, description: "User role (e.g., 'Admin', 'Manager', 'Employee')." },
          actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of action names this role can perform." },
          description: { type: Type.STRING, description: "Explanation of the policy." },
        },
        required: ["role", "actions"],
      },
    },
    compliance: {
      type: Type.ARRAY,
      description: "Applicable compliance standards.",
      items: { type: Type.STRING },
    },
  },
  required: ["title", "description", "entities", "relationships", "actions", "policies"],
};


export async function generateProblemCard(userInput: UserInput): Promise<ProblemCard> {
  const prompt = `You are an expert business analyst. A user has described a pain point and provided some initial project requirements. Analyze this information to create a formal "problem card" that defines a micro-SaaS application to solve it.

**Project Name:** ${userInput.projectName}
**User's Pain Point:** "${userInput.painPoint}"
**Suggested User Roles:** ${userInput.userRoles || 'Not specified, please infer from the pain point.'}
**Required Compliance Standards:** ${userInput.compliance || 'Not specified, please infer if any are relevant.'}

Base your analysis on the user's pain point. Use the Project Name for the problem card's "title". Incorporate the suggested roles and compliance standards into the generated 'policies' and 'compliance' sections of the card. If they are not provided, you should infer them from the context of the pain point. Output ONLY a valid JSON object that follows the provided schema.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: problemCardSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("API returned no text in response.");
  }
  try {
    return JSON.parse(text) as ProblemCard;
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw new Error("The API returned an invalid JSON format.");
  }
}

export async function generateAppCode(card: ProblemCard, backendTech: BackendTech): Promise<Record<string, string>> {
  // FIX: Escaped backticks in the template literal to prevent syntax errors.
  
  const backendInstruction = backendTech === BackendTech.NESTJS 
    ? `
1.  **Backend (NestJS + Prisma):**
    *   Generate a \`prisma/schema.prisma\` file that accurately reflects the entities and relationships from the problem card. Use PostgreSQL as the database provider.
    *   Create NestJS modules, controllers, and services for each entity.
    *   Implement RESTful endpoints for all the specified actions.
    *   Use Prisma Client for database interactions.
    *   Include basic Swagger documentation for the API.
    *   (Do not implement authentication or authorization for this prototype).
` 
    : `
1.  **Backend (FastAPI + SQLAlchemy):**
    *   Generate a complete Python project structure for a FastAPI application.
    *   Create SQLAlchemy models in a \`backend/app/models.py\` file that reflect the entities and relationships. Use asyncio and asyncpg for the database driver.
    *   Create Pydantic schemas in a \`backend/app/schemas.py\` file for data validation and serialization.
    *   Create API routers in a \`backend/app/api/\` directory for each entity, with endpoints for all specified actions.
    *   Set up a main application file (\`backend/app/main.py\`) and a database session manager (\`backend/app/db.py\`).
    *   Use SQLAlchemy 2.0 async syntax for database interactions.
    *   Include automatically generated OpenAPI documentation (via FastAPI).
    *   Generate a \`requirements.txt\` file with all necessary dependencies (fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, pydantic).
    *   (Do not implement authentication or authorization for this prototype).
`;

  const frontendInstruction = `
2.  **Frontend (React + Tailwind CSS):**
    *   Create a functional React single-page application using TypeScript and Vite.
    *   Use functional components with React Hooks.
    *   Use Tailwind CSS for styling. Create a clean, modern, and user-friendly interface.
    *   Build components to list, view, create, and update the primary entities.
    *   Create a simple API service to communicate with the ${backendTech === BackendTech.NESTJS ? 'NestJS' : 'FastAPI'} backend.
    *   Make sure file paths start with \`frontend/\`.
`;

  const prompt = `
You are a world-class full-stack developer specializing in modern web technologies.
You have been given a "problem card" (a JSON object) that describes a micro-SaaS application.
Your task is to generate the complete source code for this application based on the user's selected technology stack.

**Problem Card:**
\`\`\`json
${JSON.stringify(card, null, 2)}
\`\`\`

**Technology Stack:**
*   Frontend: React (TypeScript) + Tailwind CSS
*   Backend: ${backendTech}

**Requirements:**

${backendInstruction}

${frontendInstruction}

3.  **Output Format:**
    *   Provide the code for each file separately.
    *   For each file, specify its full path starting from the project root (e.g., \`backend/src/main.ts\`, \`frontend/src/App.tsx\`).
    *   Wrap each file's content in a markdown code block with the correct language identifier.

**Example Output:**

\`path/to/file1.ts\`
\`\`\`typescript
// content of file1.ts
\`\`\`

\`path/to/file2.py\`
\`\`\`python
# content of file2.py
\`\`\`

Now, generate the complete application code based on the provided problem card and technology choices.
`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
        temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("API returned no code.");
  }

  return parseCodeResponse(text);
}


function parseCodeResponse(responseText: string): Record<string, string> {
    const files: Record<string, string> = {};
    const fileRegex = /`((?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+)`\s*```(?:\w+)?\n([\s\S]*?)\n```/g;

    let match;
    while ((match = fileRegex.exec(responseText)) !== null) {
        const filePath = match[1].trim();
        const fileContent = match[2].trim();
        files[filePath] = fileContent;
    }

    if (Object.keys(files).length === 0) {
        // Fallback for slightly different formatting
        const fallbackRegex = /([a-zA-Z0-9/._-]+)\s*\n```(?:\w+)?\n([\s\S]+?)\n```/g;
        while ((match = fallbackRegex.exec(responseText)) !== null) {
            const filePath = match[1].trim();
            if (filePath.includes('`')) continue; // Avoid capturing the prompt example
            const fileContent = match[2].trim();
            files[filePath] = fileContent;
        }
    }
    
    if (Object.keys(files).length === 0) {
        throw new Error("Could not parse the generated code. The model response might be in an unexpected format.");
    }

    return files;
}
