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
    | Cons of 'a * 'b * ('a, 'b) bucketlist

  val create : ?random:bool -> int -> ('a, 'b) t
end = struct
  type ('a, 'b) t = {
    mutable size: int;
    mutable data: ('a, 'b) bucketlist array;
    mutable seed: int;
    initial_size: int;
  }
  and ('a, 'b) bucketlist =
    | Empty
    | Cons of 'a * 'b * ('a, 'b) bucketlist

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
end

let%test_module _ = (module struct
  module T = Hashtable

  let%test "should be able to create a hashtable" =
    let t = T.create 10 in
    let has_initial_size = t.T.initial_size = 16 in
    let has_size = t.T.size = 0 in
    let has_seed = t.T.seed = 0 in
    has_initial_size && has_size && has_seed
end)
