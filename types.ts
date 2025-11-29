
export enum AppState {
  IDLE,
  ANALYZING,
  REVIEWING_CARD,
  GENERATING,
  VIEWING_CODE,
  ERROR,
}

export enum BackendTech {
  NESTJS = 'NestJS (Node.js)',
  FASTAPI = 'FastAPI (Python)',
}

export interface UserInput {
  painPoint: string;
  projectName: string;
  backendTech: BackendTech;
  userRoles: string;
  compliance: string;
}

export interface EntityField {
  name: string;
  type: string;
  description?: string;
}

export interface Entity {
  name: string;
  fields: EntityField[];
  description?: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description?: string;
}

export interface Action {
  name: string;
  entity: string;
  description: string;
  inputs: { name: string; type: string; }[];
  outputs: { name: string; type: string; }[];
}

export interface Policy {
  role: string;
  actions: string[];
  description: string;
}

export interface ProblemCard {
  title: string;
  description: string;
  entities: Entity[];
  relationships: Relationship[];
  actions: Action[];
  policies: Policy[];
  compliance: string[];
}
