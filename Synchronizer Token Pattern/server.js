const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');

const PORT = process.env.PORT || 3000;
const SESSION_IDS_CSRF_TOKENS = {};

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(nocache());

app.get('/', (req, res) => {
    const sessionId = req.cookies['session_id'];
    if (sessionId && SESSION_IDS_CSRF_TOKENS[sessionId]) {
        res.sendFile('public/form.html', { root: __dirname });
    } else {
        res.sendFile('public/login.html', { root: __dirname });
    }
});

app.post('/home', (req, res) => {
    if (req.body.username === 'guest' && req.body.password === 'guest@123') {
        const SESSION_ID = uuidv1();
        const CSRF_TOKEN = uuidv1();

        SESSION_IDS_CSRF_TOKENS[SESSION_ID] = CSRF_TOKEN;

        res.setHeader('Set-Cookie', [`session-id=${SESSION_ID}`, `time=${Date.now()}`]);
        res.sendFile('public/form.html', { root: __dirname });
    } else {
        const error = {
            status: 401,
            message: 'Invalid credentials'
        };
        res.sendFile('public/form-error.html', { root: __dirname });
    }
});

app.post('/tokens', (req, res) => {
    const sessionId = req.cookies['session-id'];
    const csrfToken = SESSION_IDS_CSRF_TOKENS[sessionId];

    if (csrfToken) {
        const response = { token: csrfToken };
        res.json(response);
    } else {
        const error = {
            status: 400,
            message: 'Invalid Session ID'
        };
        res.status(400).json(error);
    }
});


app.post('/posts', (req, res) => {
    const token = req.body.token;
    const sessionId = req.cookies['session-id'];

    if (SESSION_IDS_CSRF_TOKENS[sessionId] && SESSION_IDS_CSRF_TOKENS[sessionId] === token) {
        res.sendFile('public/form-success.html', { root: __dirname });
    } else {
        res.sendFile('public/form-error.html', { root: __dirname });
    }
});

app.post('/logout', (req, res) => {
    const sessionId = req.cookies['session-id'];
    delete SESSION_IDS_CSRF_TOKENS[sessionId];

    res.clearCookie("session-id");
    res.clearCookie("time");

    res.sendFile('public/login.html', { root: __dirname });
});

app.get('/home', (req, res) => {
    const sessionId = req.cookies['session-id'];

    if (sessionId && SESSION_IDS_CSRF_TOKENS[sessionId]) {
        res.sendFile('public/form.html', { root: __dirname });
    } else {
        res.sendFile('public/login.html', { root: __dirname });
    }
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});