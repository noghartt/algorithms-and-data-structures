import { btreeCreate, btreeInsert, btreeGet, btreeDelete } from './btree';

const testBtreeInsertion = () => {
  const btree = btreeCreate(3);
  for (let i = 0; i < 20; i++) {
    btreeInsert(btree, i, i);
  }
  btreeInsert(btree, "test", "test")
  console.dir(btree, { depth: null });
  btreeDelete(btree, "test");
  console.dir(btree, { depth: null });
}

(() => {
  testBtreeInsertion();
})();
