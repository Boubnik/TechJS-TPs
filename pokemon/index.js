import inquirer from "inquirer";
import fetch from "node-fetch";

const API = "https://pokeapi.co/api/v2";
const MAX_HP = 300;

// Helpers
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fetch Pokémon data
async function getPokemon(name) {
  const idOrName = String(name).toLowerCase();
  const res = await fetch(`${API}/pokemon/${idOrName}`);
  if (!res.ok) throw new Error(`Pokémon "${name}" non trouvé !`);
  return res.json();
}

// Fetch moves with valid power and accuracy
async function getValidMoves(pokemon) {
  const moves = pokemon.moves.map((m) => m.move.name);
  const subset = moves.sort(() => Math.random() - 0.5).slice(0, 40);

  const details = [];
  for (const move of subset) {
    const res = await fetch(`${API}/move/${move}`);
    if (!res.ok) continue;
    const data = await res.json();
    if (data.power && data.accuracy)
      details.push({
        name: data.name,
        power: data.power,
        accuracy: data.accuracy,
      });
  }

  if (details.length < 5) throw new Error("Pas assez d'attaques valides !");
  return details;
}

// Display HP bars
function showHP(name, hp) {
  const bar = "=".repeat(Math.floor(hp / 10)) + " ".repeat(30 - Math.floor(hp / 10));
  console.log(`${name}: [${bar}] ${hp} HP`);
}

// Attack with accuracy
function attack(attacker, move, defenderHP) {
  const hitRoll = randInt(1, 100);
  if (hitRoll > move.accuracy) {
    console.log(`❌ ${attacker} rate son attaque "${move.name}" !`);
    return defenderHP;
  }
  const damage = Math.floor(move.power * (0.8 + Math.random() * 0.4));
  console.log(`💥 ${attacker} utilise ${move.name} et inflige ${damage} dégâts !`);
  return Math.max(0, defenderHP - damage);
}

// Main battle loop
async function battle(player, bot) {
  let playerHP = MAX_HP;
  let botHP = MAX_HP;

  console.clear();
  console.log(`\n🔥 Combat : ${player.name} (Vous) VS ${bot.name} (Bot) 🔥\n`);

  while (playerHP > 0 && botHP > 0) {
    showHP(player.name, playerHP);
    showHP(bot.name, botHP);
    console.log();

      // Prompt the player for a move. Use objects so we get the chosen move object directly.
      const { chosenMove } = await inquirer.prompt([
        {
          type: "list",
          name: "chosenMove",
          message: "Choisissez une attaque :",
          choices: player.moves.map((m) => ({
            name: `${m.name} (Puissance: ${m.power}, Précision: ${m.accuracy}%)`,
            value: m,
          })),
        },
      ]);

      const moveObj = chosenMove;
      botHP = attack(player.name, moveObj, botHP);
    if (botHP <= 0) break;

    await sleep(800);
    const botMove = bot.moves[randInt(0, bot.moves.length - 1)];
    console.log(`\n🤖 ${bot.name} prépare "${botMove.name}"...`);
    await sleep(800);
    playerHP = attack(bot.name, botMove, playerHP);

    console.log("\n-------------------------------\n");
    await sleep(800);
  }

  if (playerHP <= 0 && botHP <= 0) console.log(" draw");
  else if (botHP <= 0) console.log("Vous avez gagné");
  else console.log(" Vous avez perdu ");
}

// Setup & start
async function main() {
  console.clear();
  console.log("=== Pokemon===\n");

  const { playerName } = await inquirer.prompt([
    { type: "input", name: "playerName", message: "Entrez le nom de votre Pokémon :" },
  ]);

  let playerPokemon, playerMoves;
  try {
    playerPokemon = await getPokemon(playerName);
    playerMoves = await getValidMoves(playerPokemon);
  } catch (err) {
    console.log("Erreur :", err.message);
    return;
  }

  // Bot random Pokémon
  const botId = randInt(1, 151); // Gen 1
  const botPokemon = await getPokemon(botId);
  let botMoves = await getValidMoves(botPokemon);
  botMoves = botMoves.sort(() => Math.random() - 0.5).slice(0, 5);

  const player = { name: playerPokemon.name, moves: playerMoves.slice(0, 5) };
  const bot = { name: botPokemon.name, moves: botMoves };

  console.log(`\nVous avez choisi ${player.name}.`);
  console.log(`Votre adversaire est ${bot.name}.\n`);

  await battle(player, bot);

  
}

main();
