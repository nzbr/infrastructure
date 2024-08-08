const commandExistsSync = require('command-exists').sync;
const { execSync } = require('child_process');

const cd = (dir: string) => {
  console.log(`> cd ${dir}`);
  process.chdir(dir);
}

const $ = (command: string) => {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

// CHECK DEPENDENCIES //

console.log("Checking for required commands...");

const requiredCommands = [
  'pulumi',
  'pulumictl',
  'go',
  'yarn',
  'make'
]

const missingCommands = requiredCommands.map(command => ({name: command, exists: commandExistsSync(command)}))
  .filter(command => !command.exists)
  .map(command => command.name);

if (missingCommands.length > 0) {
  console.log("The following commands are missing on your system:", missingCommands);
  process.exit(1);
}

console.log("All required commands are available.");

// BUILD //

console.log("Building provider, this may take a while...");

cd('pulumi-desec');
$('make clean');
$('make tfgen');
$('make provider');
$('make build_nodejs');
cd('..');

// INSTALL //

console.log("Installing provider...");

$('pnpm install ./pulumi-desec/sdk/nodejs/bin');

const packageJson = require('./pulumi-desec/sdk/nodejs/bin/package.json');
console.log(`Found built provider ${packageJson.name}@${packageJson.version}`);

$('pulumi plugin rm resource desec -y');
$(`pulumi plugin install resource desec ${packageJson.version} -f ./pulumi-desec/bin/pulumi-resource-desec${process.platform === 'win32' ? '.exe' : ''}`);
