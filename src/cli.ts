import * as readline from 'node:readline';
import { GEVI } from './index';

const gevi = new GEVI();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'GEVI> '
});

console.log('--- GEVI Gameboy Emulator Tool CLI ---');
console.log('Type "help" for a list of commands.');
rl.prompt();

rl.on('line', async (line) => {
  const [cmd, ...args] = line.trim().split(' ');

  switch (cmd.toLowerCase()) {
    case 'help':
      console.log('Available commands:');
      console.log('  status           - Get GEVI system status');
      console.log('  palettes         - List available color palettes');
      console.log('  set-palette <id> - Change the color palette');
      console.log('  inspect <addr> <len> - Inspect memory');
      console.log('  disassemble <addr> <len> - Disassemble memory');
      console.log('  tiles [bank]     - View tile data (mocked)');
      console.log('  load <gameId>    - Load a game from registry');
      console.log('  ping             - Check connection');
      console.log('  exit / quit      - Exit CLI');
      break;

    case 'status':
      console.log(await gevi.handleCommand({ command: 'GET_STATUS' }));
      break;

    case 'palettes':
      console.log(await gevi.handleCommand({ command: 'GET_PALETTES' }));
      break;

    case 'set-palette':
      if (!args[0]) {
        console.log('Usage: set-palette <paletteName>');
      } else {
        console.log(await gevi.handleCommand({ command: 'SET_PALETTE', paletteName: args[0] }));
      }
      break;

    case 'inspect':
      if (args.length < 2) {
        console.log('Usage: inspect <address> <length>');
      } else {
        console.log(await gevi.handleCommand({
            command: 'INSPECT_MEMORY',
            address: parseInt(args[0]),
            length: parseInt(args[1])
        }));
      }
      break;

    case 'disassemble':
      if (args.length < 2) {
        console.log('Usage: disassemble <address> <length>');
      } else {
        console.log(await gevi.handleCommand({
            command: 'DISASSEMBLE',
            address: parseInt(args[0]),
            length: parseInt(args[1])
        }));
      }
      break;

    case 'tiles':
        console.log(await gevi.handleCommand({ command: 'GET_TILES', bank: args[0] ? parseInt(args[0]) : 0 }));
        break;

    case 'load':
      if (!args[0]) {
        console.log('Usage: load <gameId>');
      } else {
        console.log(await gevi.handleCommand({ command: 'LOAD_GAME', gameId: args[0] }));
      }
      break;

    case 'ping':
      console.log(await gevi.handleCommand({ command: 'PING' }));
      break;

    case 'exit':
    case 'quit':
      rl.close();
      break;

    case '':
      break;

    default:
      console.log(`Unknown command: ${cmd}`);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Exiting GEVI CLI...');
  process.exit(0);
});
