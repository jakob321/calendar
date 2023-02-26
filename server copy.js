// Imports
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express()
const server = http.createServer(express);
const wss = new WebSocket.Server({ server })

const port_web = 8000

/* -------------------------------------------
    Here we serve the html to client
--------------------------------------------*/

// Static Files
app.use(express.static('public'));

// Navigation
app.get('', (req, res) => {
    res.render('index')
})

app.listen(port_web, () => console.info(`App listening on port ${port_web}`))
console.log('Server started at http://localhost:' + port_web);

//-------------------------------------------

