// lib/conditionStorage.ts

export type Document = {
  id: string;
  name: string;
  type: "Lab Report" | "Prescription" | "Imaging" | "Other";
  fileUrl: string;
  reportId: string;
  uploadedAt: string;
  reportDate: string;
};

export type Condition = {
  id: string;
  name: string;
  status: "active" | "recurring" | "resolved";
  documents: Document[];
};

export type TimelineCache = {
  conditions: Condition[];
  lastUpdated: string;
};

// Get all conditions from localStorage
export function getConditions(): Condition[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("jeevantrack_conditions");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save conditions to localStorage
export function saveConditions(conditions: Condition[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("jeevantrack_conditions", JSON.stringify(conditions));
}

// Get a single condition by ID
export function getConditionById(id: string): Condition | null {
  const conditions = getConditions();
  return conditions.find((c) => c.id === id) || null;
}

// Add or update a condition
export function upsertCondition(condition: Condition): void {
  const conditions = getConditions();
  const index = conditions.findIndex((c) => c.id === condition.id);
  if (index >= 0) {
    conditions[index] = condition;
  } else {
    conditions.push(condition);
  }
  saveConditions(conditions);
  setNeedsRefresh(true);
}

// Delete a condition (only if it has no documents)
export function deleteConditionIfEmpty(id: string): void {
  const conditions = getConditions();
  const condition = conditions.find((c) => c.id === id);
  if (condition && condition.documents.length === 0) {
    const filtered = conditions.filter((c) => c.id !== id);
    saveConditions(filtered);
    setNeedsRefresh(true);
  }
}

// Add a document to a condition
export function addDocumentToCondition(conditionId: string, document: Document): void {
  const conditions = getConditions();
  const condition = conditions.find((c) => c.id === conditionId);
  if (condition) {
    condition.documents.push(document);
    saveConditions(conditions);
    setNeedsRefresh(true);
  }
}

// Remove a document from a condition
export function removeDocumentFromCondition(conditionId: string, documentId: string): void {
  const conditions = getConditions();
  const condition = conditions.find((c) => c.id === conditionId);
  if (condition) {
    condition.documents = condition.documents.filter((d) => d.id !== documentId);
    saveConditions(conditions);
    setNeedsRefresh(true);
    // If condition has no documents left, delete it
    if (condition.documents.length === 0) {
      deleteConditionIfEmpty(conditionId);
    }
  }
}

// Get or create "Uncategorized" condition
export function getOrCreateUncategorized(): Condition {
  const conditions = getConditions();
  let uncategorized = conditions.find((c) => c.name === "Uncategorized");
  if (!uncategorized) {
    uncategorized = {
      id: "uncategorized",
      name: "Uncategorized",
      status: "active",
      documents: [],
    };
    conditions.push(uncategorized);
    saveConditions(conditions);
  }
  return uncategorized;
}

// --- Cache functions ---

export function getCache(): TimelineCache | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("jeevantrack_timeline_cache");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveCache(conditions: Condition[]): void {
  if (typeof window === "undefined") return;
  const cache: TimelineCache = {
    conditions,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem("jeevantrack_timeline_cache", JSON.stringify(cache));
}

export function getNeedsRefresh(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("jeevantrack_needs_refresh") !== "false";
}

export function setNeedsRefresh(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("jeevantrack_needs_refresh", String(value));
}

export function clearNeedsRefresh(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("jeevantrack_needs_refresh", "false");
}