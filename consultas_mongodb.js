// Use no mongosh depois de importar os JSONs nas colecoes:
// characters, universes, species, equipment e movies.

// Teste principal de relacionamento com $lookup.
db.characters.aggregate([
  {
    $lookup: {
      from: "universes",
      localField: "universe_id",
      foreignField: "_id",
      as: "universe",
    },
  },
  { $unwind: "$universe" },
  {
    $lookup: {
      from: "species",
      localField: "species_id",
      foreignField: "_id",
      as: "species",
    },
  },
  { $unwind: "$species" },
  {
    $lookup: {
      from: "equipment",
      localField: "equipment_ids",
      foreignField: "_id",
      as: "equipment",
    },
  },
  {
    $lookup: {
      from: "movies",
      localField: "movie_ids",
      foreignField: "_id",
      as: "movies",
    },
  },
  {
    $project: {
      _id: 1,
      name: 1,
      powerLevel: 1,
      debut_year: 1,
      universe: "$universe.name",
      species: "$species.name",
      equipment: "$equipment.name",
      movies: "$movies.name",
    },
  },
]);

// Personagem mais poderoso de cada universo.
db.characters.aggregate([
  { $sort: { universe_id: 1, powerLevel: -1, name: 1 } },
  {
    $group: {
      _id: "$universe_id",
      character: { $first: "$name" },
      powerLevel: { $first: "$powerLevel" },
    },
  },
  {
    $lookup: {
      from: "universes",
      localField: "_id",
      foreignField: "_id",
      as: "universe",
    },
  },
  { $unwind: "$universe" },
  {
    $project: {
      _id: 0,
      universe: "$universe.name",
      character: 1,
      powerLevel: 1,
    },
  },
  { $sort: { universe: 1 } },
]);

// Universo com mais personagens registrados.
db.characters.aggregate([
  { $group: { _id: "$universe_id", total_characters: { $sum: 1 } } },
  { $sort: { total_characters: -1 } },
  { $limit: 1 },
  {
    $lookup: {
      from: "universes",
      localField: "_id",
      foreignField: "_id",
      as: "universe",
    },
  },
  { $unwind: "$universe" },
  {
    $project: {
      _id: 0,
      universe: "$universe.name",
      total_characters: 1,
    },
  },
]);

// Quantos personagens possuem mais de 3 equipamentos.
db.characters.aggregate([
  {
    $match: {
      $expr: { $gt: [{ $size: "$equipment_ids" }, 3] },
    },
  },
  { $count: "characters_with_more_than_3_equipment" },
]);
