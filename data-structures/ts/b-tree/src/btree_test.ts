import { btreeCreate, btreeInsert, btreeGet, btreeDelete } from './btree';

const testBtreeInsertion = () => {
  const btree = btreeCreate(3);
  for (let i = 0; i < 10; i++) {
    btreeInsert(btree, i, i);
  }
  console.dir(btree, { depth: null });
  for (let i = 0; i < 10; i++) {
    console.log('Deleting:', i)
    btreeDelete(btree, i);
    console.dir(btree, { depth: null });
  }
  // btreeDelete(btree, 26);
  // btreeDelete(btree, 35);
  console.dir(btree, { depth: null });
}

(() => {
  testBtreeInsertion();
})();
