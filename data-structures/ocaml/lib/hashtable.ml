external seeded_hash_param : int -> int -> int -> 'a -> int = "caml_hash" [@@noalloc]

let rec power_2_above x n =
  if x >= n then x
  else if x * 2 > Sys.max_array_length then x
  else power_2_above (x * 2) n

let prng = lazy (Random.State.make_self_init())

module Hashtable : sig
  type ('a, 'b) t = {
    mutable size: int;
    mutable data: ('a, 'b) bucketlist array;
    mutable seed: int;
    initial_size: int;
  }
  and ('a, 'b) bucketlist =
    | Empty
    | Cons of { mutable key: 'a;
                mutable data: 'b;
                mutable next: ('a, 'b) bucketlist }

  val create : ?random:bool -> int -> ('a, 'b) t

  val add : ('a, 'b) t -> 'a -> 'b -> unit

end = struct
  type ('a, 'b) t = {
    mutable size: int;
    mutable data: ('a, 'b) bucketlist array;
    mutable seed: int;
    initial_size: int;
  }
  and ('a, 'b) bucketlist =
    | Empty
    | Cons of { mutable key: 'a;
                mutable data: 'b;
                mutable next: ('a, 'b) bucketlist }

  let randomized =
    let randomized_default =
      let params =
        try Sys.getenv "OCAMLRUNPARAM" with Not_found ->
        try Sys.getenv "CAMLRUNPARAM" with Not_found -> ""
      in String.contains params 'R'
  in ref randomized_default

  let create ?(random = !randomized) initial_size =
    let s = power_2_above 16 initial_size in
    let seed = if random then Random.State.bits @@ Lazy.force prng else 0 in
    { initial_size = s; size = 0; seed = seed; data = Array.make s Empty }

  let key_index h key =
    if Obj.size (Obj.repr h) >= 4
    then (seeded_hash_param 10 100 h.seed key) land (Array.length h.data - 1)
    else invalid_arg "Hashtable: unsupported hash table format"

  let insert_all_buckets indexfun inplace old_data new_data =
    let nsize = Array.length new_data in
    let ndata_tail = Array.make nsize Empty in
    let rec insert_bucket = function
      | Empty -> ()
      | Cons {key; data; next} as cell ->
          let cell =
            if inplace then cell
            else Cons {key; data; next = Empty}
          in
          let nidx = indexfun key in
          begin match ndata_tail.(nidx) with
          | Empty -> new_data.(nidx) <- cell;
          | Cons tail -> tail.next <- cell;
          end;
          ndata_tail.(nidx) <- cell;
          insert_bucket next
    in
    for i = 0 to Array.length old_data - 1 do
      insert_bucket old_data.(i)
    done;
    if inplace then
      for i = 0 to nsize - 1 do
        match ndata_tail.(i) with
        | Empty -> ()
        | Cons tail -> tail.next <- Empty
      done

  let ongoing_traversal h =
    Obj.size (Obj.repr h) < 4
    || h.initial_size < 0

  let resize indexfun h =
    let old_data = h.data in
    let old_size = h.size in
    let new_size = old_size * 2 in
    if new_size < Sys.max_array_length then begin
      let new_data = Array.make new_size Empty in
      let inplace = not (ongoing_traversal h) in
      h.data <- new_data;
      insert_all_buckets (indexfun h) inplace old_data new_data
    end

  let add h key value =
    let i = key_index h key in
    let bucket = Cons {key; data = value; next = h.data.(i)} in
    h.data.(i) <- bucket;
    h.size <- h.size + 1;
    if h.size > Array.length h.data lsl 1 then resize key_index h
end

let%test_module _ = (module struct
  module T = Hashtable

  let%test "should be able to create a hashtable" =
    let t = T.create 10 in
    let has_initial_size = t.initial_size = 16 in
    let has_size = t.size = 0 in
    let has_seed = t.seed = 0 in
    has_initial_size && has_size && has_seed

  let%test "should be able to add a key-value pair to a hashtable" =
    let t = T.create 10 in
    T.add t "key" "value";
    let has_size = t.size = 1 in
    has_size;
end)
