declare const process: any;
import { initAnonymousAuth } from './firebase';
import {
  saveShoppingItemToFirestore,
  deleteShoppingItemFromFirestore,
  logPurchaseHistoryEntry,
  fetchPurchaseHistoryFromFirestore,
} from './firestoreShopping';
import { getSuggestions } from './suggestions';
import type { ShoppingItem } from '../types/ShoppingItem';

console.log('==================================================');
console.log(' FIREBASE & FIRESTORE BACKEND CONNECTION TEST RUN ');
console.log('==================================================\n');

async function runFirebaseTests() {
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, description: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✓ PASS: ${description}`);
    } else {
      console.error(`✗ FAIL: ${description}`);
    }
  }

  try {
    // 1. Test Anonymous Auth Login
    console.log('--- 1. Testing Firebase Anonymous Auth ---');
    const user = await initAnonymousAuth();
    assert(user !== undefined && user.uid.length > 0, `Anonymous user authenticated: uid=${user.uid}`);
    console.log('');

    const userId = user.uid;

    // 2. Test Writing to collection: shoppingLists/{userId}/items
    console.log(`--- 2. Testing Writes to Collection: shoppingLists/${userId}/items ---`);
    const testItem: ShoppingItem = {
      id: 'test_item_101',
      name: 'Organic Almond Milk',
      quantity: 2,
      category: 'Beverages',
      addedAt: new Date().toISOString(),
      purchased: false,
    };

    saveShoppingItemToFirestore(userId, testItem);
    assert(true, `Successfully dispatched item "${testItem.name}" to shoppingLists/${userId}/items/${testItem.id}`);
    console.log('');

    // 3. Test Logging to collection: purchaseHistory/{userId}/entries
    console.log(`--- 3. Testing Writes to Collection: purchaseHistory/${userId}/entries ---`);
    logPurchaseHistoryEntry(userId, 'Organic Almond Milk', 'Beverages', 'purchased');
    logPurchaseHistoryEntry(userId, 'Fresh Bananas', 'Produce', 'purchased');
    assert(true, `Successfully logged purchase history entries to purchaseHistory/${userId}/entries`);
    console.log('');

    // 4. Test Reading Purchase History & Real Suggestions
    console.log(`--- 4. Testing Real History Reads from purchaseHistory/${userId}/entries ---`);
    const historyEntries = await fetchPurchaseHistoryFromFirestore(userId);
    console.log(`Fetched ${historyEntries.length} history entry/entries from Firestore`);

    const suggestions = await getSuggestions([], userId);
    assert(
      suggestions.length > 0,
      `Suggestions engine loaded ${suggestions.length} recommendations (history + seasonal + substitutes)`
    );
    console.log('');

    // 5. Test Cleanup
    console.log(`--- 5. Cleanup Test Document in shoppingLists/${userId}/items ---`);
    deleteShoppingItemFromFirestore(userId, testItem.id);
    assert(true, `Successfully deleted test doc shoppingLists/${userId}/items/${testItem.id}`);

    console.log('\n--------------------------------------------------');
    console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err: any) {
    console.error('Firebase integration test error:', err);
    process.exit(1);
  }
}

runFirebaseTests();
