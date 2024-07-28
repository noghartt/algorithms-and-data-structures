import { BTree } from './bp-tree';

const run = () => {
  const btree = new BTree<number, number>({ maxNodeSize: 4 });
  btree.set(2, 2);
  btree.set(3, 3);
  btree.set(4, 4);
  btree.set(5, 5);
  btree.set(6, 6);
  btree.set(7, 7);
  btree.set(8, 8);
  btree.set(9, 9);
  btree.set(10, 10);

  console.dir(btree, { depth: null });
}

run();
