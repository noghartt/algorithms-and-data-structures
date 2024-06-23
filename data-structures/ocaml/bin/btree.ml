type ('k, 'v) pair = ('k * 'v)
type ('k, 'v) node = {
  mutable length : int;
  mutable items : ('k, 'v) pair list;
  mutable children : ('k, 'v) node list option;
}

let make_node is_leaf =
  if is_leaf then
    {
      length = 0;
      items = [];
      children = None;
    }
  else
    {
      length = 0;
      items = [];
      children = Some [];
    }

let set_node_length node length =
  match node with
  | None -> ()
  | Some node ->
    node.length <- length

let set_node_items node items =
  match node with
  | None -> ()
  | Some node ->
    node.items <- items

let node_is_leaf node =
  match node with
  | None -> true
  | Some node ->
    match node.children with
    | None -> true
    | Some _ -> false

let rec list_set_item lst index item =
  match lst with
  | [] -> []
  | hd :: tl ->
    if index = 0 then
      item :: tl
    else
      hd :: list_set_item tl (index - 1) item

let search node key =
  let rec binary_search low high =
    if low < high then
      let h = (low + high) / 2 in
      let item = List.nth node.items h in
      if key >= fst item then
        binary_search (h + 1) high
      else
        binary_search low h
    else
      low
  in
  let low = binary_search 0 (List.length node.items) in
  if low > 0 then
    let item = List.nth node.items (low - 1) in
    if fst item >= key then
      (low - 1, true)
    else
      (low, false)
  else
    (low, false)

let degree_to_min_max degree =
  let degree =
    if degree < 0 then
      32
    else if degree == 1 then
      2
    else degree
  in
  let max = 2 * degree - 1 in
  let min = max / 2 in
  (min, max)

module Btree : sig
  type ('k, 'v) t = {
    mutable root : ('k, 'v) node option;
    mutable length : int;
    mutable min : int;
    mutable max : int;
  }

  val create : int -> ('k, 'v) t

  val insert : ('k, 'v) t -> ('k * 'v) -> ('k, 'v) t

end = struct
  type ('k, 'v) t = {
    mutable root : ('k, 'v) node option;
    mutable length : int;
    mutable min : int;
    mutable max : int;
  }

  let create degree =
    let (min, max) = degree_to_min_max degree in
    {
      root = None;
      length = 0;
      min;
      max;
    }

  let split_node btree node =
    failwith "TODO"

  let rec insert_node btree parent item =
    let key = fst item in
    let (i, found) = search parent key in
    if found then
      let item = List.nth parent.items i in
      let prev = snd item in
      let list_items = list_set_item parent.items i item in
      set_node_items (Some parent) list_items;
      (Some prev, true, false)
    else
      if node_is_leaf (Some parent) then
        let item_length = List.length parent.items in
        if item_length = btree.max then
          (None, false, true)
        else
          (* TODO: It should be improve to assign only once, instead of two mutations. *)
          let new_items = item :: parent.items in
          set_node_items (Some parent) new_items;
          let list_items = list_set_item parent.items i item in
          set_node_items (Some parent) list_items;
          parent.length <- parent.length + 1;
          (None, false, false)
      else
        let child =
          match parent.children with
          (* TODO: Validate a scenario where the parent is a leaf node and the children is not. *)
          | None -> failwith "TODO - missing children on parent"
          | Some children -> List.nth children i
        in
        let (prev, replaced, split) = insert_node btree child item in
        if split then
          let items_length = List.length parent.items in
          if items_length = btree.max then
            (None, false, true)
          else (
            let (right, median) = split_node child in
            parent.children <- None;
            failwith "TODO - split_node"
          )
        else
          if not replaced then
            let () = set_node_length (Some parent) (parent.length + 1) in
            (prev, replaced, false)
          else
            (prev, replaced, false)

  let rec insert btree (key, value) =
    let item = (key, value) in
    match btree.root with
    | None ->
      btree.root <- Some (make_node true);
      set_node_length btree.root 1;
      set_node_items btree.root [item];
      btree.length <- 1;
      btree
    | Some node ->
      let (prev, found, split) = insert_node btree node item in
      if split then
        let left = btree.root in
        let (right, median) = split_node left in
        failwith "TODO"
      else
        failwith "TODO"
end

let () =
  let _btree = Btree.create 32 in
  let _ = Btree.insert _btree (1, "one") in
  let _ = Btree.insert _btree (1, "two") in
  ()
