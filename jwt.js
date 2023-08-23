import express, { json } from 'express';
import { sign, verify } from 'jsonwebtoken';
const app = express();
app.use(json());

const users = [];
const secretKey = 'yourSecretKey'; // Replace with your own secret key

// Middleware to check if the user already exists
function checkUserExists(req, res, next) {
  const { email } = req.body;
  const user = users.find(user => user.email === email);
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }
  next();
}

// Middleware to authenticate user during login
function authenticateUser(req, res, next) {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  req.user = user;
  next();
}

// Middleware to generate JWT
function generateToken(req, res, next) {
  const token = sign({ userId: req.user.id }, secretKey);
  req.token = token;
  next();
}

// Protected route middleware
function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    const decoded = verify(token, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.post('/signup', checkUserExists, (req, res) => {
  const { username, email, password } = req.body;
  const newUser = { id: users.length + 1, username, email, password };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', authenticateUser, generateToken, (req, res) => {
  res.json({ message: 'Login successful', token: req.token });
});

app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully', userId: req.userId });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
