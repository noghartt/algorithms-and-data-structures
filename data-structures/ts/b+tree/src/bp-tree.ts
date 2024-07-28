import { defaultComparator } from './bp-utils';

const undefVals: any[] = [];

type BTreeConfig<K, V> = {
  entries?: Array<[K, V]>;
  maxNodeSize: number;
}

export class BTree<K, V> {
  private root: Node<K, V>;
  public maxNodeSize: number;
  public size: number = 0;

  constructor({ entries, maxNodeSize }: BTreeConfig<K, V>) {
    this.maxNodeSize = maxNodeSize;
    this.root = new Node<K, V>(this);
    if (entries) {
      this.setPairs(entries);
    }
  }

  public set(key: K, value: V) {
    const result = this.root.set(key, value);
    if (typeof result === 'boolean') {
      return result;
    }
    this.root = new NodeInternal(this, [this.root, result]);
    return true;
  }

  private setPairs(pairs: Array<[K, V]>) {
    let added = 0;
    for (let i = 0; i < pairs.length; i++) {
      const key = pairs[i][0];
      const value = pairs[i][1];
      const result = this.set(key, value);
      if (result) {
        added++;
      }
    }
    return added;
  }
}

class Node<K, V> {
  keys: K[];
  values: V[];
  tree: BTree<K, V>

  constructor(tree: BTree<K, V>, keys: K[] = [], values?: V[]) {
    this.keys = keys;
    this.values = values || undefVals;
    this.tree = tree;
  }

  public maxKey(): K {
    return this.keys[this.keys.length - 1];
  }

  public set(key: K, value: V) {
    let i = this.indexOf(key, -1);
    if (i < 0) {
      i = ~i;
      this.tree.size++;
      if (this.keys.length < this.tree.maxNodeSize) {
        return this.insertInLeaf(i, key, value);
      }

      const newRightSibling = this.splitOffRightSide();
      let target: Node<K, V> = this;
      if (i > target.keys.length) {
        i -= this.keys.length;
        target = newRightSibling;
      }
      target.insertInLeaf(i, key, value);
      return newRightSibling;
    } else {
      return false;
    }
  }

  private indexOf(key: K, failXor: number) {
    const keys = this.keys;
    let lo = 0;
    let hi = keys.length;
    let mid = hi >> 1;
    while(lo < hi) {
      var c = defaultComparator(keys[mid], key);
      if (c < 0)
        lo = mid + 1;
      else if (c > 0) // key < keys[mid]
        hi = mid;
      else if (c === 0)
        return mid;
      else {
        // c is NaN or otherwise invalid
        if (key === key) // at least the search key is not NaN
          return keys.length;
        else
          throw new Error("BTree: NaN was used as a key");
      }
      mid = (lo + hi) >> 1;
    }
    return mid ^ failXor;
  }

  private insertInLeaf(i: number, key: K, value: V) {
    this.keys.splice(i, 0, key);
    const values: any[] = [];
    if (this.values === undefVals) {
      while (values.length < this.keys.length) {
        values.push(undefined);
      }
      if (!value) {
        return true;
      }

      this.values = values.slice(0, this.keys.length - 1)
    }
    this.values.splice(i, 0, value);
    return true;
  }

  private splitOffRightSide(): Node<K, V> {
    const half = this.keys.length >> 1;
    const keys = this.keys.splice(half);
    const values = this.values === undefVals ? undefVals : this.values.splice(half);
    return new Node(this.tree, keys, values);
  }
}

class NodeInternal<K, V> extends Node<K, V> {
  children: Node<K, V>[];
  tree: BTree<K, V>;

  constructor(tree: BTree<K, V>, children: Node<K, V>[], keys?: K[]) {
    if (!keys) {
      keys = [];
      for (let i = 0; i < children.length; i++) {
        keys[i] = children[i].maxKey();
      }
    }
    super(tree, keys);
    this.tree = tree;
    this.children = children;
  }
}
