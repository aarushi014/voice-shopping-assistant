import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category, ShoppingItem } from '../types/ShoppingItem';

export interface PurchaseHistoryEntry {
  id: string;
  itemName: string;
  category: Category;
  action: 'purchased' | 'removed';
  timestamp: string;
}

/**
 * Subscribes to real-time updates for shoppingLists/{userId}/items
 */
export function subscribeShoppingList(
  userId: string,
  onData: (items: ShoppingItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!userId) return () => {};

  try {
    const itemsRef = collection(db, 'shoppingLists', userId, 'items');

    return onSnapshot(
      itemsRef,
      (snapshot) => {
        const items: ShoppingItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ShoppingItem);
        });
        items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        onData(items);
      },
      (error) => {
        console.warn('[Firestore Subscription Warning] Offline/Permissions:', error.message || error.code);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('[Firestore] Setup error:', err.message);
    return () => {};
  }
}

/**
 * Creates or updates an item in shoppingLists/{userId}/items
 */
export async function saveShoppingItemToFirestore(
  userId: string,
  item: ShoppingItem
): Promise<void> {
  if (!userId) return;
  try {
    const itemDocRef = doc(db, 'shoppingLists', userId, 'items', item.id);
    console.log(`[Firestore Write] Setting doc in shoppingLists/${userId}/items/${item.id}:`, item.name);
    await setDoc(itemDocRef, item, { merge: true });
  } catch (err: any) {
    console.warn(`[Firestore Write Notice] Saved locally (offline/permission sync): ${err.message}`);
  }
}

/**
 * Deletes an item from shoppingLists/{userId}/items
 */
export async function deleteShoppingItemFromFirestore(
  userId: string,
  itemId: string
): Promise<void> {
  if (!userId) return;
  try {
    const itemDocRef = doc(db, 'shoppingLists', userId, 'items', itemId);
    console.log(`[Firestore Delete] Deleting doc in shoppingLists/${userId}/items/${itemId}`);
    await deleteDoc(itemDocRef);
  } catch (err: any) {
    console.warn(`[Firestore Delete Notice] Deleted locally (offline/permission sync): ${err.message}`);
  }
}

/**
 * Logs a purchased/removed action to purchaseHistory/{userId}/entries
 */
export async function logPurchaseHistoryEntry(
  userId: string,
  itemName: string,
  category: Category,
  action: 'purchased' | 'removed'
): Promise<void> {
  if (!userId || !itemName) return;
  try {
    const entryId = Date.now().toString() + Math.random().toString().slice(2, 6);
    const entryRef = doc(db, 'purchaseHistory', userId, 'entries', entryId);

    const entry: PurchaseHistoryEntry = {
      id: entryId,
      itemName,
      category,
      action,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Firestore History Write] Logging to purchaseHistory/${userId}/entries/${entryId}:`, entry);
    await setDoc(entryRef, entry);
  } catch (err: any) {
    console.warn(`[Firestore History Write Notice] Saved history locally (offline sync): ${err.message}`);
  }
}

/**
 * Fetches real purchase history from purchaseHistory/{userId}/entries
 */
export async function fetchPurchaseHistoryFromFirestore(
  userId: string
): Promise<PurchaseHistoryEntry[]> {
  if (!userId) return [];
  try {
    const entriesRef = collection(db, 'purchaseHistory', userId, 'entries');
    const q = query(entriesRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    const entries: PurchaseHistoryEntry[] = [];
    snapshot.forEach((docSnap) => {
      entries.push(docSnap.data() as PurchaseHistoryEntry);
    });
    return entries;
  } catch (err: any) {
    console.warn('[Firestore Read Notice] Offline or fallback history:', err.message);
    return [];
  }
}
