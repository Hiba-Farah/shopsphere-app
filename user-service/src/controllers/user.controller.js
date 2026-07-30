const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Récupérer tous les utilisateurs
exports.getUsers = async (req, res) => {
    try {

        const users = await userModel.getAllUsers();

        res.status(200).json(users);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });

    }
};

// Inscription d'un utilisateur
exports.register = async (req, res) => {
    try {

        const { fullname, email, password } = req.body;

        // Vérifier les champs
        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await userModel.getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Chiffrer le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await userModel.createUser(
            fullname,
            email,
            hashedPassword
        );

        res.status(201).json({
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            created_at: user.created_at
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });

    }
};

// Connexion (à implémenter plus tard)
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Vérifier les champs
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Rechercher l'utilisateur
        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Générer le token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });

    }
};