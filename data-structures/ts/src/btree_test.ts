import { btreeCreate, btreeInsert } from './btree';

const testBtreeInsertion = () => {
  const btree = btreeCreate(1);
  console.dir(btree, { depth: null });
}

(() => {
  testBtreeInsertion();
})();
