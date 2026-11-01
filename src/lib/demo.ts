export const DEMO_USER_ID = 'budgeteer-demo';
export const DEMO_EMAIL = 'demo@budgeteer.invalid';

export function isDemoUser(id: string | undefined) {
  return id === DEMO_USER_ID;
}
