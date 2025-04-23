// scripts/createUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../schema/user.js';

dotenv.config();

// Utilise la clé correcte du fichier .env
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connecté à MongoDB');

    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('Utilisateur déjà existant');
      process.exit(0);
    }

    const newUser = new User({
      id: 1,
      username: 'admin',
      password: 'password123', // sera haché automatiquement
      role: 'user'
    });

    await newUser.save();
    console.log('Utilisateur créé avec succès !');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB', err);
    process.exit(1);
  });
