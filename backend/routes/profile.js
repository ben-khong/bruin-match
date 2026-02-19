const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// Verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Check if profile exists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ hasProfile: false });
    }

    res.json({ hasProfile: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      full_name,
      academic_year,
      major,
      gender,
      contact_info,
      housing_type,
      room_type,
      move_in_term,
    } = req.body;

    // Check if profile already exists
    const existing = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    const result = await pool.query(
      `INSERT INTO user_profiles 
        (user_id, full_name, academic_year, major, gender, contact_info, housing_type, room_type, move_in_term)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [req.user.userId, full_name, academic_year, major, gender, contact_info, housing_type, room_type, move_in_term]
    );

    res.status(201).json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- DEBUGGING PURPOSES --- 
// I will remove this function after the token works (for submitting the onboarding form)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Auth header received:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extracted:', token);

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verify error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}


module.exports = router;