const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

// Handlebars
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Estáicos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/chat', require('./routes/chat'));

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado al chat');
  socket.on('chat:mensaje', (msg) => io.emit('chat:mensaje', msg));
  socket.on('disconnect', () => console.log('🔴 Usuario desconectado'));
});

// Arranque
(async () => {
  await connectDB(process.env.MONGO_URI);
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`🚀 http://localhost:${port}`));
})();
