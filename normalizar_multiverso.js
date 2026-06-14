const fs = require("fs");
const path = require("path");

const baseDir =
  process.argv[2] || __dirname;

const files = {
  cleanSource: "Multiverso.multiverso_limpo.json",
  cleanRequired: "nerd_universe_clean.json",
  cleanMirror: "Multiverso.multiverso_limpo.json",
  characters: "Multiverso.Characters.json",
  universes: "Multiverso.universes.json",
  species: "Multiverso.species.json",
  equipment: "Multiverso.equipments.json",
  movies: "Multiverso.movies.json",
};

function readJson(fileName, fallback = []) {
  const filePath = path.join(baseDir, fileName);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(fileName, data) {
  fs.writeFileSync(
    path.join(baseDir, fileName),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function cleanString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
  return cleanString(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function compactKey(value) {
  return normalizeKey(value).replace(/\s+/g, "");
}

function oid(prefix, index) {
  return { $oid: `${prefix}${String(index).padStart(24 - prefix.length, "0")}` };
}

function oidValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.$oid) return value.$oid;
  return "";
}

function sameOid(a, b) {
  return oidValue(a) === oidValue(b);
}

function uniqueArray(values) {
  const seen = new Set();
  const result = [];
  for (const value of values || []) {
    if (value === null || value === undefined) continue;
    const text = cleanString(value);
    if (!text || normalizeKey(text) === "n a") continue;
    const key = normalizeKey(text);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}

function field(record, names) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(record, name)) return record[name];
  }
  return undefined;
}

const universeNameMap = new Map([
  ["marvel", "Marvel"],
  ["marvel studios", "Marvel"],
  ["marvel comics", "Marvel"],
  ["dc", "DC Comics"],
  ["dc comics", "DC Comics"],
  ["starwars", "Star Wars"],
  ["star wars", "Star Wars"],
  ["wizarding world", "Wizarding World"],
  ["middle earth", "Middle-Earth"],
  ["middle earth", "Middle-Earth"],
  ["rick and morty", "Rick And Morty"],
  ["god of war", "God Of War"],
  ["the legend of zelda", "The Legend Of Zelda"],
  ["sonic the hedgehog", "Sonic The Hedgehog"],
  ["avatar the last airbender", "Avatar: The Last Airbender"],
  ["avatar last airbender", "Avatar: The Last Airbender"],
  ["pokemon", "Pokémon"],
  ["the simpsons", "The Simpsons"],
  ["mega man", "Mega Man"],
]);

function canonicalUniverse(value) {
  const text = cleanString(value);
  const key = normalizeKey(text);
  return universeNameMap.get(key) || text;
}

const characterNameMap = new Map([
  ["riri stark", "Riri Williams"],
  ["megaman", "Mega Man"],
]);

function canonicalCharacterName(value) {
  const text = cleanString(value);
  return characterNameMap.get(normalizeKey(text)) || text;
}

const speciesMap = new Map([
  ["human", "Human"],
  ["human cyborg", "Human (Cyborg)"],
  ["maia spirit", "Maia (Spirit)"],
  ["mutant human", "Mutant (Human)"],
  ["demi god", "Demigod"],
  ["demigod", "Demigod"],
  ["amazonian demigoddess", "Amazon Demigoddess"],
  ["human air nomad", "Human (Air Nomad)"],
  ["human italian plumber", "Human (Italian Plumber)"],
  ["human cartoon", "Human (Cartoon)"],
  ["human the one", "Human (The One)"],
  ["human", "Human"],
  ["human", "Human"],
  ["human", "Human"],
]);

function canonicalSpecies(value) {
  const text = cleanString(value);
  return speciesMap.get(normalizeKey(text)) || text;
}

const equipmentMap = new Map([
  ["ai assistant", "AI Assistant"],
  ["armor", "Armor"],
  ["batsuit", "Batsuit"],
  ["batmobile", "Batmobile"],
  ["blades of chaos", "Blades of Chaos"],
  ["buster sword", "Buster Sword"],
  ["devil fruit powers", "Devil Fruit Powers"],
  ["energon sword", "Energon Sword"],
  ["focus device", "Focus Device"],
  ["force wisdom", "Force Wisdom"],
  ["fusion cannon", "Fusion Cannon"],
  ["grappling hook", "Grappling Hook"],
  ["infinity gauntlet", "Infinity Gauntlet"],
  ["kung fu", "Kung Fu"],
  ["lasso of truth", "Lasso of Truth"],
  ["leviathan axe", "Leviathan Axe"],
  ["martial arts", "Martial Arts"],
  ["masamune sword", "Masamune Sword"],
  ["master sword", "Master Sword"],
  ["mega buster", "Mega Buster"],
  ["mjolnir armor", "Mjolnir Armor"],
  ["one ring", "One Ring"],
  ["one wing", "One Wing"],
  ["pokeballs", "Pokéballs"],
  ["portal gun", "Portal Gun"],
  ["power pole", "Power Pole"],
  ["silver sword", "Silver Sword"],
  ["spider powers", "Spider Powers"],
  ["steel sword", "Steel Sword"],
  ["vibranium suit", "Vibranium Suit"],
  ["virus powers", "Virus Powers"],
  ["waterbending", "Waterbending"],
  ["web shooters", "Web Shooters"],
]);

function titleEquipment(value) {
  const text = cleanString(value);
  const mapped = equipmentMap.get(normalizeKey(text));
  if (mapped) return mapped;
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const weaponKeys = new Set([
  "lightsaber",
  "assault rifle",
  "staff",
  "sword",
  "pistols",
  "silver sword",
  "steel sword",
  "master sword",
  "bow",
  "blades of chaos",
  "leviathan axe",
  "blaster",
  "kunai",
  "energon sword",
  "fusion cannon",
  "buster sword",
  "masamune sword",
  "boomerang",
  "guns",
  "hidden blades",
  "spear",
  "knife",
  "revolver",
  "mega buster",
  "fists",
  "claws",
]);

const armorKeys = new Set([
  "armor",
  "mjolnir armor",
  "batsuit",
  "costume",
  "shield",
  "vibranium suit",
  "hoodie",
  "suit",
]);

const vehicleKeys = new Set(["batmobile", "nimbus", "horse", "glider"]);

const gadgetKeys = new Set([
  "ai assistant",
  "web shooters",
  "grappling hook",
  "scouter",
  "portal gun",
  "pokeballs",
  "focus device",
  "vacuum",
  "backpack",
]);

const powerKeys = new Set([
  "force",
  "signs",
  "rage",
  "speed",
  "chakra",
  "rasengan",
  "sharingan",
  "devil fruit powers",
  "telekinesis",
  "spider powers",
  "thunderbolt",
  "waterbending",
  "speed force",
  "speedforce",
  "kung fu",
  "code vision",
  "martial arts",
  "virus powers",
  "magic",
  "darkness",
  "force wisdom",
  "jump",
  "immunity",
]);

function equipmentType(name) {
  const key = normalizeKey(name);
  if (weaponKeys.has(key)) return "Arma";
  if (armorKeys.has(key)) return "Armadura";
  if (vehicleKeys.has(key)) return "Veículo";
  if (gadgetKeys.has(key)) return "Gadget";
  if (powerKeys.has(key)) return "Poder";
  return "Artefato";
}

const movieMap = new Map([
  ["iron man 1", "Iron Man"],
  ["iron man", "Iron Man"],
  ["iron man 2", "Iron Man 2"],
  ["avengers", "Avengers"],
  ["endgame", "Avengers: Endgame"],
  ["avengers endgame", "Avengers: Endgame"],
  ["infinity war", "Infinity War"],
  ["a new hope", "A New Hope"],
  ["empire strikes back", "Empire Strikes Back"],
  ["return of the jedi", "Return of the Jedi"],
  ["star wars episode iv", "A New Hope"],
  ["sorcerers stone", "Sorcerer's Stone"],
  ["sorcerer s stone", "Sorcerer's Stone"],
  ["chamber of secrets", "Chamber of Secrets"],
  ["prisoner of azkaban", "Prisoner of Azkaban"],
  ["halo nightfall", "Halo: Nightfall"],
  ["dragon ball super broly", "Dragon Ball Super: Broly"],
  ["broly", "Dragon Ball Super: Broly"],
  ["resurrection f", "Resurrection F"],
  ["super mario bros 1993", "Super Mario Bros"],
  ["super mario bros movie 2023", "Super Mario Bros Movie"],
  ["super mario bros movie", "Super Mario Bros Movie"],
  ["sonic 2020", "Sonic the Hedgehog"],
  ["sonic the hedgehog", "Sonic the Hedgehog"],
  ["sonic 2 2022", "Sonic the Hedgehog 2"],
  ["sonic the hedgehog 2", "Sonic the Hedgehog 2"],
  ["the mandalorian", "The Mandalorian"],
  ["the last naruto the movie", "The Last: Naruto the Movie"],
  ["boruto naruto the movie", "Boruto: Naruto the Movie"],
  ["one piece red", "One Piece: Red"],
  ["transformers 2007", "Transformers"],
  ["rise of the beasts", "Rise of the Beasts"],
  ["dark of the moon", "Dark of the Moon"],
  ["tv series", "Rick And Morty"],
  ["rick and morty", "Rick And Morty"],
  ["netflix series", "Stranger Things"],
  ["stranger things", "Stranger Things"],
  ["the simpsons movie", "The Simpsons Movie"],
  ["across the spider verse", "Spider-Man: Across the Spider-Verse"],
  ["detective pikachu", "Detective Pikachu"],
  ["mewtwo strikes back", "Mewtwo Strikes Back"],
  ["i choose you", "I Choose You!"],
  ["advent children", "Advent Children"],
  ["the last airbender", "The Last Airbender"],
  ["animated series", "Animated Series"],
  ["black panther", "Black Panther"],
  ["black panther wakanda forever", "Black Panther: Wakanda Forever"],
  ["wonder woman", "Wonder Woman"],
  ["justice league", "Justice League"],
  ["the flash 2023", "The Flash"],
  ["the flash", "The Flash"],
  ["shrek", "Shrek"],
  ["shrek 2", "Shrek 2"],
  ["matrix", "The Matrix"],
  ["the matrix", "The Matrix"],
  ["matrix reloaded", "Matrix Reloaded"],
  ["matrix revolutions", "Matrix Revolutions"],
  ["deathly hallows", "Deathly Hallows"],
  ["fellowship of the ring", "The Fellowship of the Ring"],
  ["the fellowship of the ring", "The Fellowship of the Ring"],
  ["the two towers", "The Two Towers"],
  ["the return of the king", "The Return of the King"],
  ["tomb raider 2001", "Tomb Raider (2001)"],
  ["tomb raider 2018", "Tomb Raider"],
  ["tomb raider", "Tomb Raider"],
  ["the witcher", "The Witcher"],
  ["assassins creed 2016", "Assassin's Creed"],
  ["assassin s creed 2016", "Assassin's Creed"],
  ["horizon zero dawn", "Horizon Zero Dawn"],
  ["the last of us hbo", "The Last of Us"],
  ["the last of us", "The Last of Us"],
  ["john wick", "John Wick"],
  ["john wick 4", "John Wick 4"],
  ["what if", "What If...?"],
  ["what if", "What If...?"],
  ["what if", "What If...?"],
  ["one punch man series", "One Punch Man"],
  ["one punch man", "One Punch Man"],
]);

function canonicalMovie(value) {
  const text = cleanString(value);
  if (!text) return "";
  const key = normalizeKey(text);
  return movieMap.get(key) || text;
}

function inferMovieMeta(name, fallbackUniverse) {
  const yearMatch = name.match(/\((\d{4})\)/);
  const key = normalizeKey(name);
  const series = new Set([
    "rick and morty",
    "stranger things",
    "the mandalorian",
    "animated series",
    "the witcher",
    "the last of us",
    "halo nightfall",
    "what if",
  ]);
  const anime = new Set(["one punch man"]);
  const games = new Set(["horizon zero dawn"]);
  return {
    type: anime.has(key)
      ? "Anime"
      : games.has(key)
        ? "Game"
        : series.has(key)
          ? "Série"
          : "Filme",
    year: yearMatch ? Number(yearMatch[1]) : null,
    universe: fallbackUniverse,
  };
}

function fixMovieMetaFromExisting(existingMovies) {
  const meta = new Map();
  for (const movie of existingMovies || []) {
    const name = canonicalMovie(movie.name);
    if (!name || meta.has(name)) continue;
    meta.set(name, {
      type: movie.type || inferMovieMeta(name, movie.universe).type,
      year: typeof movie.year === "number" ? movie.year : inferMovieMeta(name, movie.universe).year,
      universe: canonicalUniverse(movie.universe || ""),
    });
  }
  const explicit = {
    "Super Mario Bros": { type: "Filme", year: 1993 },
    "Tomb Raider (2001)": { type: "Filme", year: 2001 },
    "One Punch Man": { type: "Anime", year: 2015 },
    "Rick And Morty": { type: "Série", year: 2013 },
    "Stranger Things": { type: "Série", year: 2016 },
  };
  for (const [name, info] of Object.entries(explicit)) {
    meta.set(name, { ...meta.get(name), ...info });
  }
  return meta;
}

const speciesDescriptions = new Map();
for (const species of readJson(files.species, [])) {
  const name = canonicalSpecies(species.name);
  if (!name || speciesDescriptions.has(name)) continue;
  speciesDescriptions.set(name, species.descricao || species.description || "");
}

function descriptionForSpecies(name) {
  if (speciesDescriptions.has(name)) return speciesDescriptions.get(name);
  const fallback = {
    Human: "Ser humano comum, sem poderes inatos",
    "Human (Cyborg)": "Humano com partes mecânicas integradas ao corpo",
    "Maia (Spirit)": "Ser espiritual de ordem superior do universo de Tolkien",
    "Mutant (Human)": "Humano geneticamente alterado com habilidades superiores",
    Saiyan: "Raça alienígena guerreira com força que cresce após batalhas",
    Hylian: "Raça élfica do reino de Hyrule com conexão ao Triforce",
    Demigod: "Ser com sangue divino, entre mortal e deus",
    Hedgehog: "Ouriço antropomórfico com supervelocidade",
    Autobot: "Robô alienígena senciente alinhado aos Autobots",
    Decepticon: "Robô alienígena senciente alinhado aos Decepticons",
    Ogre: "Criatura fantástica de grande força física",
    Donkey: "Burro falante de universo fantástico",
    "AI Program": "Programa inteligente criado dentro de uma realidade simulada",
    Android: "Ser artificial com corpo robótico",
  };
  return fallback[name] || "Espécie registrada no multiverso nerd";
}

const rawClean = readJson(files.cleanSource, []);
const existingUniverses = readJson(files.universes, []);
const existingMovies = readJson(files.movies, []);
const movieMeta = fixMovieMetaFromExisting(existingMovies);

const clean = rawClean
  .map((record) => {
    const name = canonicalCharacterName(
      field(record, ["name", "Name", "nome", "Nome", "char_name"])
    );
    const universe = canonicalUniverse(field(record, ["universe", "Universe"]));
    const species = canonicalSpecies(field(record, ["species", "Species"]));
    const powerLevel = Number(field(record, ["powerLevel", "PowerLevel", "powerlevel", "power_level"])) || 0;
    const debutYear = Number(field(record, ["debut_year", "DebutYear"])) || null;
    const alias = uniqueArray([].concat(field(record, ["alias", "Alias"]) || [])).map(cleanString);
    const equipment = uniqueArray([].concat(field(record, ["equipment", "Equipment"]) || [])).map(titleEquipment);
    const movies = uniqueArray([].concat(field(record, ["movies", "Movies"]) || []))
      .map(canonicalMovie)
      .filter(Boolean);

    return {
      _id: Number(record._id),
      name,
      alias,
      universe,
      first_appearance: cleanString(
        field(record, ["first_appearance", "First_Appearance", "firstAppearance"])
      ),
      powerLevel,
      equipment,
      species,
      movies,
      debut_year: debutYear,
    };
  })
  .filter((record) => record._id && record.name)
  .sort((a, b) => a._id - b._id);

const characterSeen = new Set();
const dedupedClean = [];
for (const record of clean) {
  const key = compactKey(record.name);
  if (characterSeen.has(key)) continue;
  characterSeen.add(key);
  dedupedClean.push(record);
}

const existingUniverseIds = new Map();
for (const universe of existingUniverses || []) {
  const name = canonicalUniverse(universe.name);
  if (!name || existingUniverseIds.has(name)) continue;
  existingUniverseIds.set(name, universe._id || oid("6b110", existingUniverseIds.size + 1));
}

const universeMeta = new Map();
for (const universe of existingUniverses || []) {
  const name = canonicalUniverse(universe.name);
  if (!name || universeMeta.has(name)) continue;
  universeMeta.set(name, {
    type: universe.type || "Filmes",
    origin: universe.origin || "Desconhecida",
  });
}

const universeNames = [...new Set(dedupedClean.map((record) => record.universe))].sort();
const universes = universeNames.map((name, index) => {
  const meta = universeMeta.get(name) || { type: "Filmes", origin: "Desconhecida" };
  return {
    _id: existingUniverseIds.get(name) || oid("6b110", index + 1),
    name,
    type: meta.type,
    origin: meta.origin,
  };
});

const universeIdByName = new Map(universes.map((universe) => [universe.name, universe._id]));

const existingSpeciesIds = new Map();
for (const species of readJson(files.species, [])) {
  const name = canonicalSpecies(species.name);
  if (!name || existingSpeciesIds.has(name)) continue;
  existingSpeciesIds.set(name, species._id || oid("6b120", existingSpeciesIds.size + 1));
}

const speciesNames = [...new Set(dedupedClean.map((record) => record.species))].sort();
const species = speciesNames.map((name, index) => ({
  _id: existingSpeciesIds.get(name) || oid("6b120", index + 1),
  name,
  descricao: descriptionForSpecies(name),
}));

const speciesIdByName = new Map(species.map((item) => [item.name, item._id]));

const equipmentUsage = new Map();
for (const character of dedupedClean) {
  for (const item of character.equipment) {
    const key = normalizeKey(item);
    if (!equipmentUsage.has(key)) {
      equipmentUsage.set(key, {
        name: item,
        type: equipmentType(item),
        character_ids: [],
      });
    }
    const usage = equipmentUsage.get(key);
    if (!usage.character_ids.includes(character._id)) usage.character_ids.push(character._id);
  }
}

const equipment = [...equipmentUsage.values()]
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  .map((item, index) => ({
    _id: oid("6b130", index + 1),
    name: item.name,
    type: item.type,
    character_ids: item.character_ids.sort((a, b) => a - b),
  }));

const equipmentIdByName = new Map(equipment.map((item) => [normalizeKey(item.name), item._id]));

const movieUsage = new Map();
for (const character of dedupedClean) {
  for (const movieName of character.movies) {
    const key = normalizeKey(movieName);
    if (!movieUsage.has(key)) {
      movieUsage.set(key, {
        name: movieName,
        universe: character.universe,
        character_ids: [],
      });
    }
    const usage = movieUsage.get(key);
    if (!usage.character_ids.includes(character._id)) usage.character_ids.push(character._id);
  }
}

const movies = [...movieUsage.values()]
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  .map((movie, index) => {
    const meta = movieMeta.get(movie.name) || inferMovieMeta(movie.name, movie.universe);
    return {
      _id: oid("6b140", index + 1),
      name: movie.name,
      type: meta.type || "Filme",
      year: meta.year || inferMovieMeta(movie.name, movie.universe).year,
      universe_id: universeIdByName.get(canonicalUniverse(meta.universe || movie.universe)),
      character_ids: movie.character_ids.sort((a, b) => a - b),
    };
  });

const movieIdByName = new Map(movies.map((movie) => [normalizeKey(movie.name), movie._id]));

const characters = dedupedClean.map((character) => ({
  _id: character._id,
  name: character.name,
  alias: character.alias,
  first_appearance: character.first_appearance,
  powerLevel: character.powerLevel,
  debut_year: character.debut_year,
  universe_id: universeIdByName.get(character.universe),
  species_id: speciesIdByName.get(character.species),
  equipment_ids: character.equipment
    .map((item) => equipmentIdByName.get(normalizeKey(item)))
    .filter(Boolean),
  movie_ids: character.movies
    .map((item) => movieIdByName.get(normalizeKey(item)))
    .filter(Boolean),
}));

writeJson(files.cleanRequired, dedupedClean);
writeJson(files.cleanMirror, dedupedClean);
writeJson(files.universes, universes);
writeJson(files.species, species);
writeJson(files.equipment, equipment);
writeJson(files.movies, movies);
writeJson(files.characters, characters);

console.log(`Registros limpos: ${dedupedClean.length}`);
console.log(`Universes: ${universes.length}`);
console.log(`Species: ${species.length}`);
console.log(`Equipment: ${equipment.length}`);
console.log(`Movies: ${movies.length}`);
console.log(`Characters: ${characters.length}`);
