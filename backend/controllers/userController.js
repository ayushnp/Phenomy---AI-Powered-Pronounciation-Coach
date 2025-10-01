const db = require('../db');

// Create a new user
const createUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and email are required'
            });
        }

        // Check if username already exists
        const existingUser = await db.query(
            'SELECT * FROM "user" WHERE username = $1',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Insert new user (storing password as plain text is insecure)
        const newUser = await db.query(
            `INSERT INTO "user" (username, password, email)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, sport_count, env_count, politic_count, social_count`,
            [username, password, email]
        );

        // Optional: Send confirmation email
        // await sendConfirmationEmail(email, username);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user with matching username and password
        const user = await db.query(
            'SELECT * FROM "user" WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Return user data (excluding password)
        const userResponse = {
            id: user.rows[0].id,
            username: user.rows[0].username,
            sport_count: user.rows[0].sport_count,
            env_count: user.rows[0].env_count,
            politic_count: user.rows[0].politic_count,
            social_count: user.rows[0].social_count
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update count (sport, env, politic, social)
const updateCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const { countType, increment = 1 } = req.body;

        // Validate count type
        const validCountTypes = ['sport_count', 'env_count', 'politic_count', 'social_count'];
        if (!validCountTypes.includes(countType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid count type. Must be one of: sport_count, env_count, politic_count, social_count'
            });
        }

        // Check if user exists
        const userExists = await db.query(
            'SELECT id FROM "user" WHERE id = $1',
            [userId]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update the specific count
        const updateQuery = `UPDATE "user" SET ${countType} = ${countType} + $1 WHERE id = $2 RETURNING id, username, sport_count, env_count, politic_count, social_count`;
        
        const updatedUser = await db.query(updateQuery, [increment, userId]);

        res.status(200).json({
            success: true,
            message: `${countType} updated successfully`,
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Update count error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await db.query(
            'SELECT id, username, sport_count, env_count, politic_count, social_count FROM "user" WHERE id = $1',
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.rows[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Reset specific count
const resetCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const { countType } = req.body;

        // Validate count type
        const validCountTypes = ['sport_count', 'env_count', 'politic_count', 'social_count'];
        if (!validCountTypes.includes(countType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid count type'
            });
        }

        // Reset the specific count to 0
        const updateQuery = `UPDATE "user" SET ${countType} = 0 WHERE id = $1 RETURNING id, username, sport_count, env_count, politic_count, social_count`;
        
        const updatedUser = await db.query(updateQuery, [userId]);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `${countType} reset successfully`,
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Reset count error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    updateCount,
    getUserById,
    resetCount
};