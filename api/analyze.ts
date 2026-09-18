import type { UserInput } from '../types';
import { generateProblemCardServer } from '../server/gemini';

const MAX_BODY_BYTES = 20_000;

function readBody(req: any): unknown {
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

function isUserInput(value: any): value is UserInput {
  return (
    value &&
    typeof value.projectName === 'string' &&
    value.projectName.trim().length > 0 &&
    value.projectName.length <= 120 &&
    typeof value.painPoint === 'string' &&
    value.painPoint.trim().length > 0 &&
    value.painPoint.length <= 10_000 &&
    typeof value.backendTech === 'string' &&
    typeof value.userRoles === 'string' &&
    typeof value.compliance === 'string'
  );
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = readBody(req);

    if (!isUserInput(body)) {
      return res.status(400).json({ error: 'Invalid workflow input.' });
    }

    const card = await generateProblemCardServer(body);
    return res.status(200).json(card);
  } catch (error) {
    console.error('Workflow analysis failed:', error);

    if (error instanceof Error && error.message === 'Request body is too large.') {
      return res.status(413).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Workflow analysis failed.' });
  }
}
