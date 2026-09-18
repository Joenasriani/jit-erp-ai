import type { ProblemCard, UserInput, BackendTech } from '../types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function generateProblemCard(userInput: UserInput): Promise<ProblemCard> {
  return postJson<ProblemCard>('/api/analyze', userInput);
}

export async function generateAppCode(
  card: ProblemCard,
  backendTech: BackendTech,
): Promise<Record<string, string>> {
  return postJson<Record<string, string>>('/api/generate', {
    problemCard: card,
    backendTech,
  });
}
