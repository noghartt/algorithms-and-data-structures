type BTreePair<K, V> = {
  key: K;
  value: V;
}

type BTreeNode<K, V> = {
  length: number;
  items: Array<BTreePair<K, V> | null>;
  children: Array<BTreeNode<K, V>>;
};

type BTree<K, V> = {
  root: BTreeNode<K, V> | null;
  length: number;
  min: number;
  max: number;
}

export function btreeCreate<K, V>(degree?: number): BTree<K, V> {
  const [min, max] = degreeToMinMax(degree || 0);
  return {
    root: null,
    length: 0,
    min,
    max,
  }
}

export function btreeInsert<K, V>(btree: BTree<K, V>, key: K, value: V) {
  const item: BTreePair<K, V> = { key, value };
  if (btree.root === null) {
    btree.root = makeNode(true);
    btree.root.length = 1;
    btree.root.items = [item];
    btree.length = 1;
    return [null, false];
  }
  const [prev, replaced, split] = insertNode(btree, btree.root, item);
  if (split) {
    const left = btree.root;
    const [right, median] = splitNode(btree, left);
    btree.root = makeNode(false);
    btree.root.children = [left, right];
    btree.root.items = [median];
    updateCount(btree.root);
    return btreeInsert(btree, key, value);
  }
  if (replaced) {
    return [prev, true];
  }
  btree.length++;
  return [null, false];
}

const insertNode = <K, V>(btree: BTree<K, V>, parent: BTreeNode<K, V>, item: BTreePair<K, V>): [BTreePair<K, V> | null, boolean, boolean] => {
  const [i, found] = binarySearch(parent, item.key);
  if (found) {
    const prev = parent.items[i];
    parent.items[i] = item;
    return [prev, true, false];
  }
  if (nodeIsLeaf(parent)) {
    const itemLength = parent.items.length;
    if (itemLength == btree.max) {
      return [null, false, true];
    }
    parent.items.splice(i, 0, item);
    parent.length++;
    return [null, false, false];
  }
  const [prev, replaced, split] = insertNode(btree, parent.children[i], item);
  if (split) {
    const itemsLength = parent.items.length;
    if (itemsLength == btree.max) {
      return [null, false, true];
    }
    const child = parent.children![i];
    const [right, median] = splitNode(btree, child);
    parent.children.splice(i + 1, 0, right);
    parent.items.splice(i, 0, median);
    return insertNode(btree, parent, item);
  }
  if (replaced) {
    parent.length++;
  }
  return [prev, replaced, false];
}

const splitNode = <K, V>(btree: BTree<K, V>, node: BTreeNode<K, V>): [BTreeNode<K, V>, BTreePair<K, V>] => {
  const i = Math.floor(btree.max / 2);
  const median = node.items[i];

  const right = makeNode<K, V>(nodeIsLeaf(node));
  right.items = node.items.splice(i + 1);

  if (!nodeIsLeaf(node)) {
    right.children = node.children.splice(i + 1);
  }

  updateCount(right);

  node.items = node.items.splice(0, i);
  if (!nodeIsLeaf(node)) {
    node.children = node.children.splice(0, i + 1);
  }
  updateCount(node);

  return [right, median!];
}

const degreeToMinMax = (degree: number): [number, number] => {
  const _degree = degree <= 0 ? 32 : degree == 1 ? 2 : degree;
  const max = 2 * _degree - 1;
  const min = Math.floor(max / 2);
  return [min, max];
}

const makeNode = <K, V>(isLeaf: boolean): BTreeNode<K, V> => {
  return {
    length: 0,
    items: [],
    children: [],
  }
}

const nodeIsLeaf = <K, V>(node: BTreeNode<K, V>): boolean =>
  node.children.length === 0;

const updateCount = <K, V>(node: BTreeNode<K, V>) => {
  node.length = node.items.length;
  if (!nodeIsLeaf(node)) {
    if (!node.children) {
      return;
    }

    for (const child of node.children) {
      updateCount(child);
    }
  }
}

const binarySearch = <K, V>(node: BTreeNode<K, V>, key: K): [number, boolean] => {
  let low = 0;
  let high = node.items.length;
  while (low < high) {
    const h = Math.floor((low + high) / 2);
    const item = node.items[h];
    if (!(key < item!.key)) {
      low = h + 1;
    } else {
      high = h;
    }
  }
  const item = node.items[low - 1];
  if (low > 0 && !(item!.key < key)) {
    return [low - 1, true];
  }
  return [low, false];
}
