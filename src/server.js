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
const validateEnv = require('./config/validateEnv');
validateEnv();
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ===== MIDDLEWARES DE SEGURIDAD Y REGISTRO =====

// helmet: ajusta las cabeceras HTTP para proteger la app de
// vulnerabilidades web comunes (XSS, clickjacking, etc.).
// Es como poner cerraduras en puertas y ventanas antes de abrir.
app.use(helmet());

// morgan: registra en consola cada petición que llega
// (método, URL, código de estado, tiempo de respuesta).
// El formato 'dev' es compacto y con colores, ideal para desarrollo.
app.use(morgan('dev'));

// ===== LECTURA DE CUERPO DE LAS PETICIONES =====
// Estos dos "traducen" los datos crudos que llegan en una petición
// y los dejan listos para usar en req.body.

// express.urlencoded: lee datos de formularios HTML (cuando el usuario
// llena un <form> y le da enviar). Sin esto, req.body llegaría vacío.
// extended: true permite objetos anidados, no solo pares simples.
app.use(express.urlencoded({ extended: true }));

// express.json: lee datos que llegan en formato JSON, típicamente
// desde fetch, axios o peticiones de API.
app.use(express.json());

// ===== COOKIES Y MÉTODO HTTP =====
// cookieParser: lee las cookies que envía el navegador en cada petición
// y la deja disponibles en req.cookies para poder usarlas.
app.use(cookieParser());

// methodOverride: los formularios HTML solo pueden hacer GET Y POST.
// Pero para editar o eliminar productos se necesitan PUT Y DELETE.
// Este middleware permite simularlos usando un campo oculto _method
// en el formulario. Es lo que hace posible el CRUD completo.
app.use(methodOverride('_method'));

// ===== SESIONES =====
// Mantiene al usuario "logueado" mientras navega entre páginas.
// Sin sesiones, tendría que iniciar sesión en cada pagina que visita.
const sessionMiddleware = session({
  // secret: firma la cookie de sesión para que no pueda falsificarse.
  // Viene del .env (la cadena aleatoria que generamos).
  secret: process.env.SESSION_SECRET,

  // resave: false -> no vuelve a guardar la sesión si no cambió nada.
  resave: false,

  // saveUninitialized: false -> no crea sesiones para visitantes
  // anónimos que aún no han iniciado sesión (ahorra espacio).
  saveUninitialized: false,

  // store: guarda las sesiones en MongoDB, no en la memoria del servidor.
  // Así sobreviven aunque la app se reinicie.
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),

  // cookie: la sesión dura 2 horas (1000 ms x 60 x 60 x 2).
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
});

app.use(sessionMiddleware);

// ===== MOTOR DE VISITAS (HANDLEBARS) =====
// Configura Handlebars como el motor que arma las páginas HTML.
app.engine('hbs', exphbs.engine({
  extname: '.hbs',                                        // extensión de los archivos de vista
  defaultLayout: 'main',                                  // layout base que envuelve todas la vistas
  layoutsDir: path.join(__dirname, 'views', 'layouts'),   // carpeta de layouts
  partialsDir: path.join(__dirname, 'views', 'partials')  // carpeta de partials (trozos reutilizables)
}));
app.set('view engine', 'hbs');                    // usar hbs por defecto al hacer res.render()
app.set('views', path.join(__dirname, 'views'));  // carpeta donde viven las vistas

// ===== ARCHIVOS ESTÁTICOS =====
// Sirve archivos que no cambian (CSS, JS del cliente, imágenes)
// directamente al navegador, sin pasar por una ruta.
app.use(express.static(path.join(__dirname, 'public')));

// Archivos subidos por los usuarios (por ejemplo, fotos de productos).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/chat', require('./routes/chat'));
app.use(notFound);
app.use(errorHandler);

// ===== SOCKET,IO: COMPARTIR SESIÓN Y AUTENTICAR =====

// Hacemos que Socket.io use el MISMO middlerare de sesión que Express.
// Así cada conexión de socket puede leer la sesión del usuario.
io.engine.use(sessionMiddleware);

// Middleware de autenticación del chat: se ejecuta ANTES de cada
// conexión. Si el usuario no tiene sesión iniciada, se rechaza.
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.userId) {
    socket.userId = session.userId; // guardamos el userId en el socket
    next();
  } else {
    next(new Error('No autorizado'));
  }
});

// Solo llegan aquí las conexiones que pasaron la autenticación.
io.on('connection', (socket) => {
  console.log(`🟢 Usuario conectado al chat: ${socket.userId}`);

  socket.on('chat:mensaje', (msg) => {
    // 1. Debe ser texto (string). Si no, lo ignoramos.
    if (typeof msg !== 'string') return;

    //2. Quitamos espacios de los extremos y validamos que no quede vacio.
    const limpio = msg.trim();
    if (limpio.length === 0) return;

    //3. Límite de longitud: máximo 500 caracteres.
    if (limpio.length > 500) return;

    //Si pasó las tres validaciones, lo reenviamos a todos.
    io.emit('chat:mensaje', limpio);

  })
  socket.on('disconnect', () => console.log(`🔴 Usuario desconectado: ${socket.userId}`));
});

// Arranque
(async () => {
  await connectDB(process.env.MONGO_URI);
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`🚀 http://localhost:${port}`));
})();
