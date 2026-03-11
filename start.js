const { spawn } = require('child_process');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

// Start backend
const server = spawn('node', ['index.js'], {
    cwd: serverDir,
    stdio: 'inherit',
    env: { ...process.env },
});

// Start frontend
const client = spawn('npx', ['vite', '--host'], {
    cwd: clientDir,
    stdio: 'inherit',
    env: { ...process.env },
});

// Handle exit
process.on('SIGINT', () => {
    server.kill();
    client.kill();
    process.exit();
});

server.on('exit', (code) => {
    if (code) console.log(`Server exited with code ${code}`);
    client.kill();
    process.exit(code);
});

client.on('exit', (code) => {
    if (code) console.log(`Client exited with code ${code}`);
    server.kill();
    process.exit(code);
});
