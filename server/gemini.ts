import { GoogleGenAI, Type } from '@google/genai';
import type { ProblemCard, UserInput } from '../types';
import { BackendTech } from '../types';

const problemCardSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A short, descriptive title for the problem.',
    },
    description: {
      type: Type.STRING,
      description: 'A one-paragraph summary of the business problem to be solved.',
    },
    entities: {
      type: Type.ARRAY,
      description: 'The data models or nouns in the system.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Singular name of the entity (for example, 'User' or 'Invoice').",
          },
          description: {
            type: Type.STRING,
            description: "A brief description of the entity's purpose.",
          },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Field name.' },
                type: { type: Type.STRING, description: 'Data type.' },
                description: { type: Type.STRING, description: 'Brief field description.' },
              },
              required: ['name', 'type'],
            },
          },
        },
        required: ['name', 'fields'],
      },
    },
    relationships: {
      type: Type.ARRAY,
      description: 'How entities relate to each other.',
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          type: {
            type: Type.STRING,
            description: "Cardinality: 'one-to-one', 'one-to-many', or 'many-to-many'.",
          },
          description: { type: Type.STRING },
        },
        required: ['from', 'to', 'type'],
      },
    },
    actions: {
      type: Type.ARRAY,
      description: 'The primary operations in the system.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          entity: { type: Type.STRING },
          description: { type: Type.STRING },
          inputs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
              },
            },
          },
          outputs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
              },
            },
          },
        },
        required: ['name', 'entity', 'description'],
      },
    },
    policies: {
      type: Type.ARRAY,
      description:
        'Proposed access-policy requirements. These are design inputs, not implemented authorization.',
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          actions: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
        },
        required: ['role', 'actions'],
      },
    },
    compliance: {
      type: Type.ARRAY,
      description:
        'Compliance standards to consider during implementation. Listing a standard does not establish compliance.',
      items: { type: Type.STRING },
    },
  },
  required: ['title', 'description', 'entities', 'relationships', 'actions', 'policies'],
};

function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Server GEMINI_API_KEY is not configured.');
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateProblemCardServer(userInput: UserInput): Promise<ProblemCard> {
  const ai = getAi();

  const prompt = `You are a business-analysis assistant. Convert the supplied workflow problem into a structured problem card for a prototype web application.

Project name: ${userInput.projectName}
Business problem: ${userInput.painPoint}
Suggested roles: ${userInput.userRoles || 'Not specified'}
Compliance requirements to consider: ${userInput.compliance || 'Not specified'}

Rules:
- Use the project name as the title.
- Derive entities, relationships and actions from the stated workflow.
- Treat roles and access policies as proposed requirements only.
- Treat compliance standards as implementation considerations only; do not claim certification or compliance.
- Do not invent deployment status, implemented authentication, authorization or production readiness.
- Return only JSON matching the supplied schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: problemCardSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned no problem-card content.');
  }

  return JSON.parse(text) as ProblemCard;
}

export async function generateAppCodeServer(
  card: ProblemCard,
  backendTech: BackendTech,
): Promise<Record<string, string>> {
  const ai = getAi();

  const backendInstruction =
    backendTech === BackendTech.NESTJS
      ? `
Backend: NestJS + Prisma
- Generate a Prisma schema reflecting the problem-card entities and relationships.
- Use PostgreSQL as the database provider.
- Create NestJS modules, controllers and services for the requested actions.
- Use Prisma Client for database interactions.
- Include basic Swagger/OpenAPI configuration.
- Do not claim authentication or authorization is implemented unless the generated code actually includes and wires it.
`
      : `
Backend: FastAPI + SQLAlchemy
- Generate a FastAPI project structure.
- Create SQLAlchemy 2.0 async models reflecting the problem-card entities and relationships.
- Create Pydantic schemas and API routers for the requested actions.
- Use asyncpg for PostgreSQL access.
- Include FastAPI OpenAPI documentation.
- Do not claim authentication or authorization is implemented unless the generated code actually includes and wires it.
`;

  const prompt = `Generate a reviewable prototype codebase from the problem card below.

Problem card:
```json
${JSON.stringify(card, null, 2)}
```

Technology:
- Frontend: React + TypeScript + Tailwind CSS
- ${backendInstruction}

Frontend requirements:
- Functional React components with hooks.
- Screens for the primary entities and actions described in the problem card.
- A small API service for the selected backend.
- File paths must start with frontend/.

Important boundaries:
- This is prototype code, not a production-ready application.
- Do not state that access policies are enforced unless corresponding authentication/authorization code is generated and wired.
- Do not state that any compliance standard is satisfied or certified.
- Include comments or TODOs where security, authentication, authorization, validation, audit logging or deployment work remains.

Output each file as:
`path/to/file`
```language
file contents
```
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned no generated code.');
  }

  return parseCodeResponse(text);
}

function parseCodeResponse(responseText: string): Record<string, string> {
  const files: Record<string, string> = {};
  const fileRegex =
    /`((?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+)`\s*```(?:\w+)?\n([\s\S]*?)\n```/g;

  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(responseText)) !== null) {
    const filePath = match[1].trim();
    const fileContent = match[2].trim();
    files[filePath] = fileContent;
  }

  if (Object.keys(files).length === 0) {
    const fallbackRegex =
      /([a-zA-Z0-9/._-]+)\s*\n```(?:\w+)?\n([\s\S]+?)\n```/g;

    while ((match = fallbackRegex.exec(responseText)) !== null) {
      const filePath = match[1].trim();
      if (filePath.includes('`')) continue;
      files[filePath] = match[2].trim();
    }
  }

  if (Object.keys(files).length === 0) {
    throw new Error('Could not parse generated files from the Gemini response.');
  }

  return files;
}
