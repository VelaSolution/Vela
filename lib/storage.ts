// lib/storage.ts
// 중앙 localStorage 관리 모듈
// 모든 localStorage 접근은 이 모듈을 통해서만 수행

// ─── 스토리지 키 상수 ─────────────────────────────────────────────
export const STORAGE_KEYS = {
  /** 시뮬레이터 폼 데이터 */
  FORM: "vela-form-v3",
  /** 시뮬레이터 다중 저장 슬롯 */
  SAVES: "vela-saves-v1",
  /** 빠른 입력 데이터 (도구 공유) */
  QUICK: "vela-quick-v1",
  /** 시뮬레이션 히스토리 */
  HISTORY: "vela-history-v2",
  /** 게임 세이브 */
  GAME: "vela-game-v3",
} as const;

/** 폼 데이터 변경 시 발생하는 커스텀 이벤트 이름 */
export const FORM_UPDATED_EVENT = "vela-form-updated";

// ─── 안전한 localStorage 래퍼 ──────────────────────────────────
const isClient = typeof window !== "undefined";

/**
 * localStorage에서 JSON 데이터를 안전하게 읽기
 * @returns 파싱된 데이터 또는 null (오류 시 null 반환)
 */
export function getStorageItem<T>(key: string): T | null {
  if (!isClient) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[VELA Storage] "${key}" 읽기 실패:`, e);
    return null;
  }
}

/**
 * localStorage에 JSON 데이터를 안전하게 저장
 * @returns 성공 여부
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isClient) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[VELA Storage] "${key}" 저장 실패:`, e);
    return false;
  }
}

/**
 * localStorage에서 항목 안전하게 삭제
 */
export function removeStorageItem(key: string): void {
  if (!isClient) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[VELA Storage] "${key}" 삭제 실패:`, e);
  }
}

// ─── 시뮬레이터 폼 전용 헬퍼 ──────────────────────────────────
/**
 * 시뮬레이터 폼 데이터를 저장하고 변경 이벤트를 발생시킴
 * useSimulatorData 훅이 이 이벤트를 감지하여 자동 업데이트함
 */
export function saveFormData(form: Record<string, unknown>): boolean {
  const success = setStorageItem(STORAGE_KEYS.FORM, form);
  if (success && isClient) {
    window.dispatchEvent(new Event(FORM_UPDATED_EVENT));
  }
  return success;
}

/**
 * 시뮬레이터 폼 데이터 읽기
 */
export function loadFormData<T = Record<string, unknown>>(): T | null {
  return getStorageItem<T>(STORAGE_KEYS.FORM);
}

/**
 * 기존 폼 데이터에 부분 데이터를 병합하여 저장
 * SendToSimulator, quickStore 등에서 사용
 */
export function mergeFormData(partial: Record<string, unknown>): boolean {
  const existing = loadFormData() ?? {};
  const merged = { ...existing, ...partial };
  return saveFormData(merged);
}

// ─── 저장 슬롯 전용 헬퍼 ───────────────────────────────────────
export type SaveSlot = {
  id: string;
  label: string;
  savedAt: string;
  form: Record<string, unknown>;
};

const MAX_SAVES = 10;

export function getSaveSlots(): SaveSlot[] {
  return getStorageItem<SaveSlot[]>(STORAGE_KEYS.SAVES) ?? [];
}

export function addSaveSlot(form: Record<string, unknown>): string {
  const saves = getSaveSlots();
  const now = new Date();
  const id = String(now.getTime());
  const label = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const newSave: SaveSlot = { id, label, savedAt: now.toISOString(), form };
  setStorageItem(STORAGE_KEYS.SAVES, [newSave, ...saves].slice(0, MAX_SAVES));
  return label;
}

export function deleteSaveSlot(id: string): void {
  setStorageItem(STORAGE_KEYS.SAVES, getSaveSlots().filter((s) => s.id !== id));
}
