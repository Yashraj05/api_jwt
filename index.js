import express from 'express';
const app = express();
app.use(express.json());

const users = [];

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

app.post('/signup', checkUserExists, (req, res) => {
  const { username, email, password } = req.body;
  const newUser = { username, email, password };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', authenticateUser, (req, res) => {
  res.json({ message: 'Login successful', user: req.user });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
console.log(users);