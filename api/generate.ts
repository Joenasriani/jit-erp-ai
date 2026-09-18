import type { ProblemCard } from '../types';
import { BackendTech } from '../types';
import { generateAppCodeServer } from '../server/gemini';

const MAX_BODY_BYTES = 100_000;

function readBody(req: any): any {
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
      throw new Error('Request body is too large.');
    }
    return JSON.parse(req.body);
  }

  const serialized = JSON.stringify(req.body ?? {});
  if (Buffer.byteLength(serialized, 'utf8') > MAX_BODY_BYTES) {
    throw new Error('Request body is too large.');
  }

  return req.body;
}

function isProblemCard(value: any): value is ProblemCard {
  return (
    value &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    Array.isArray(value.entities) &&
    Array.isArray(value.relationships) &&
    Array.isArray(value.actions) &&
    Array.isArray(value.policies) &&
    Array.isArray(value.compliance)
  );
}

function isBackendTech(value: unknown): value is BackendTech {
  return value === BackendTech.NESTJS || value === BackendTech.FASTAPI;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = readBody(req);

    if (!body || !isProblemCard(body.problemCard) || !isBackendTech(body.backendTech)) {
      return res.status(400).json({ error: 'Invalid generation request.' });
    }

    const files = await generateAppCodeServer(body.problemCard, body.backendTech);
    return res.status(200).json(files);
  } catch (error) {
    console.error('Prototype generation failed:', error);

    if (error instanceof Error && error.message === 'Request body is too large.') {
      return res.status(413).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Prototype generation failed.' });
  }
}
