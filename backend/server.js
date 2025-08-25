const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex(
  {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'test',
      database: 'smart-brain'
    }
  }
);

db.select('*').from('users').then(data => {
  console.log(data);
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// DB in memoria (DEMO)
const database = {
  users: [
    {
      id: '123',
      name: 'john',
      email: 'john@gmail.com',
      password: 'cookies', // seed in chiaro (solo per demo)
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'sally',
      email: 'sally@gmail.com',
      password: 'bananas', // seed in chiaro (solo per demo)
      entries: 0,
      joined: new Date()
    }
  ],
  login: []
};

// Rimuove password / hash dalle risposte
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, ...safe } = user;
  return safe;
};

app.get('/', (req, res) => {
  res.json(database.users.map(sanitizeUser));
});

// /register: crea utente con password hashata
app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      const emailValue = (loginEmail && loginEmail[0] && (loginEmail[0].email || loginEmail[0])) || email;
      return trx('users')
        .returning('*')
        .insert({
          email: emailValue,
          name: name,
          joined: new Date()
        })
        .then(user => {
          res.json(user[0]);
        });
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .catch(err => res.status(400).json('unable to register user'));
});

// /signin: verifica hash; fallback per utenti seed con password in chiaro
app.post('/signin', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json('bad form submission');
  }
  db.select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then(rows => {
      if (!rows || rows.length === 0) {
        return res.status(400).json('wrong credentials');
      }
      const { hash } = rows[0];
      const isValid = bcrypt.compareSync(password, hash);
      if (!isValid) {
        return res.status(400).json('wrong credentials');
      }
      return db('users')
        .select('*')
        .where('email', '=', email)
        .first()
        .then(user => {
          if (!user) return res.status(400).json('unable to get user');
          return res.json(user);
        })
        .catch(() => res.status(400).json('unable to get user'));
    })
    .catch(() => res.status(400).json('wrong credentials'));
});

  
   


//   const { email, password } = req.body || {};
//   if (!email || !password) {
//     return res.status(400).json('bad form submission');
//   }

//   const user = database.users.find(u => u.email === email);
//   if (!user) return res.status(400).json('error logging in');

//   // Utenti registrati (hanno passwordHash)
//   if (user.passwordHash) {
//     return bcrypt.compare(password, user.passwordHash, (err, isValid) => {
//       if (err || !isValid) return res.status(400).json('error logging in');
//       return res.json(sanitizeUser(user));
//     });
//   }

//   // Fallback per utenti seed (solo in demo)
//   if (user.password && user.password === password) {
//     return res.json(sanitizeUser(user));
//   }

//   return res.status(400).json('error logging in');
// });

app.get('/profile/:id', (req, res) => {
  const { id } = req.params
  db.select('*').from('users').where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
})
//   const user = database.users.find(u => String(u.id) === String(req.params.id));
//   if (!user) return res.status(400).json('not found');
//   res.json(sanitizeUser(user));
// });

app.put('/image', (req, res) => {
  const { id } = req.body;
 // .where({id}) filtra i record della tabella selezionata in base all'id specificato, restituendo solo quelli che corrispondono.
 db('users')
 .where('id', '=', id )
 .increment ('entries', 1)
 .returning('entries')
 .then(entries => {
  res.json(entries[0]);
 })
 .catch(err => res.status(400).json('unable to get entries'))
});

app.listen(3000, () => {
  console.log('app is running on port 3000');
});

// Endpoints:
// GET    /               → lista utenti (sanificata)
// POST   /register       → crea utente e restituisce utente (senza password/hash)
// POST   /signin         → login, restituisce utente (sanificato)
// GET    /profile/:id    → utente per id (sanificato)
// POST   /image          → incrementa entries e restituisce il numero
