const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(nocache());

app.use(express.static('public'));

app.get('/', (req, res) => {

    const sessionId = req.cookies['session-id'];
    const cookieToken = req.cookies['csrf-token'];

    if (sessionId && cookieToken) {
        res.sendFile('public/form.html', {root: __dirname});
    } else {
        res.sendFile('public/login.html', {root: __dirname});
    }
});

app.post('/home', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const sessionId = req.cookies['session-id'];
    const cookieToken = req.cookies['csrf-token'];

    if (username === 'guest' && password === 'guest@123') {
        const SESSION_ID = uuidv1();
        const CSRF_TOKEN = uuidv1();

        if (!sessionId && !cookieToken) {
            res.setHeader('Set-Cookie', [`session-id=${SESSION_ID}`, `time=${Date.now()}`, `csrf-token=${CSRF_TOKEN}`]);
        } else {
            console.log('POST /home found a session id and a csrf token');
        }

        res.sendFile('public/form.html', {root: __dirname});
    } else {
        const error = {status: 401, message: 'Invalid Credentials'};
        res.sendFile('public/form-error.html', {root: __dirname});
    }

});

app.post('/posts', (req, res) => {
    const token = req.body.token;
    const tokenInCookie = req.cookies['csrf-token'];

    if (tokenInCookie === token) {
        res.sendFile('public/form-success.html', {root: __dirname});
    } else {
        res.sendFile('public/form-error.html', {root: __dirname});
    }

});

app.post('/logout', (req, res) => {
    const sessionId = req.cookies['session-id'];

    res.clearCookie("session-id");
    res.clearCookie("time");
    res.clearCookie("csrf-token");

    res.sendFile('public/login.html', {root: __dirname});
});

app.get('/home', (req, res) => {
    const sessionId = req.cookies['session-id'];
    const tokenInCookie = req.cookies['csrf-token'];

    if (sessionId && tokenInCookie) {
        res.sendFile('public/form.html', {root: __dirname});
    } else {
        res.sendFile('public/login.html', {root: __dirname});
    }

});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

// // respond with "hello world" when a GET request is test route
// app.get('/health', function (req, res) {
//     res.send('Welcome to Double Submit Cookies Pattern Demo !')
// });

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});