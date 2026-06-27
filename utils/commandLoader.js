/**
 * utils/commandLoader.js
 * -----------------------
 * Automatically discovers and loads every command module inside the
 * /commands folder, so you never have to manually register a new command
 * in a central switch-statement or index file.
 *
 * HOW TO ADD A NEW COMMAND:
 * 1. Create a new file in /commands, e.g. commands/hello.js
 * 2. Export an object with at least { name, execute } (see commands/ping.js
 *    for a template).
 * 3. Restart the bot. That's it — it will be picked up automatically.
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Reads every .js file in the commands directory, requires it, and
 * validates that it has the minimum shape we need (name + execute).
 *
 * @param {string} commandsPath - absolute path to the commands directory
 * @returns {Map<string, object>} map of commandName -> command module
 */
function loadCommands(commandsPath) {
  const commands = new Map();

  // Read all files in the commands folder, but only consider .js files.
  // This protects us from accidentally trying to "require" non-code files
  // like README notes or .DS_Store that might end up in that folder.
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      // require() caches modules by resolved path, so this is cheap to call
      // even if loadCommands() is ever invoked more than once.
      const command = require(filePath);

      // Defensive validation: skip (and warn about) malformed command files
      // instead of letting one bad file crash the whole bot on startup.
      if (!command || !command.name || typeof command.execute !== 'function') {
        logger.warn(
          `[commandLoader] Skipping "${file}" — it must export { name, execute }.`
        );
        continue;
      }

      commands.set(command.name.toLowerCase(), command);
      logger.info(`[commandLoader] Loaded command: ${command.name}`);
    } catch (error) {
      // If a single command file has a bug (e.g. syntax error after editing),
      // we log it clearly and keep loading the rest of the commands rather
      // than letting the entire bot fail to start.
      logger.error(`[commandLoader] Failed to load "${file}": ${error.message}`);
    }
  }

  return commands;
}

module.exports = { loadCommands };
