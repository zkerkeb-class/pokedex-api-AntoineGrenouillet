import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../schema/user.js';

// Fonction pour l'authentification (login)
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction d'inscription (register)
export const register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà pris' });
    }

    // Crée un nouvel utilisateur
    const newUser = new User({
      username,
      password,  // Le mot de passe sera haché automatiquement grâce au middleware dans le modèle User
      role: role || 'user',  // Par défaut, le rôle est "user", sauf s'il est précisé
    });

    await newUser.save();  // Sauvegarde l'utilisateur dans la base de données

    const payload = {
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    };

    // Création du token JWT
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction pour récupérer les informations de l'utilisateur connecté
export const getMe = (req, res) => {
  res.status(200).send({ user: req.user });
};
