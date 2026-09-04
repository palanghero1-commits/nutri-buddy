export function normalizeGrowthDateInput(value: string | null | undefined) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return trimmed.slice(0, 10);
}

export function isRequestSuccessful(payload: { success?: boolean; message?: string } | null | undefined) {
  return Boolean(payload && payload.success === true);
}
