// lib/conditionStorage.ts
// Simple localStorage wrapper - NO business logic

export type Document = {
  id: string;
  name: string;
  type: "Lab Report" | "Prescription" | "Imaging" | "Other";
  fileUrl: string;
  reportId: string;
  uploadedAt: string;
  reportDate: string;
  extractedData?: any;
};

export type Condition = {
  id: string;
  name: string;
  status: "active" | "recurring" | "resolved";
  documents: Document[];
};

// ─── PRIVATE: Read/Write localStorage ────────────────────────

function getData(): Condition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem('jeevantrack_conditions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setData(conditions: Condition[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem('jeevantrack_conditions', JSON.stringify(conditions));
}

// ─── PUBLIC API ──────────────────────────────────────────────

export function getConditions(): Condition[] {
  return getData();
}

export function saveConditions(conditions: Condition[]): void {
  setData(conditions);
}

export function getCache(): { conditions: Condition[] } | null {
  const data = getData();
  return data.length > 0 ? { conditions: data } : null;
}

export function saveCache(conditions: Condition[]): void {
  setData(conditions);
}

export function getNeedsRefresh(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem('jeevantrack_needs_refresh') !== 'false';
}

export function setNeedsRefresh(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem('jeevantrack_needs_refresh', String(value));
}

export function clearNeedsRefresh(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem('jeevantrack_needs_refresh', 'false');
}

export function getConditionById(id: string): Condition | null {
  const conditions = getData();
  return conditions.find((c) => c.id === id) || null;
}

export function upsertCondition(condition: Condition): void {
  const conditions = getData();
  const index = conditions.findIndex((c) => c.id === condition.id);
  if (index >= 0) {
    conditions[index] = condition;
  } else {
    conditions.push(condition);
  }
  setData(conditions);
}

export function addDocumentToCondition(conditionId: string, document: Document): void {
  const conditions = getData();
  const condition = conditions.find((c) => c.id === conditionId);
  if (condition) {
    condition.documents.push(document);
    setData(conditions);
  }
}

export function removeDocumentFromCondition(conditionId: string, documentId: string): void {
  const conditions = getData();
  const condition = conditions.find((c) => c.id === conditionId);
  if (condition) {
    condition.documents = condition.documents.filter((d) => d.id !== documentId);
    setData(conditions);
  }
}