const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

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

// GET /api/users - paginated list of other users with optional filters
router.get('/', authenticateToken, async (req, res) => {
  const { academic_year, major, housing_type, room_type, move_in_term, page = 1, limit = 6 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ['up.user_id != $1'];
  const values = [req.user.userId];
  let i = 2;

  if (academic_year) { conditions.push('up.academic_year = $' + i++); values.push(academic_year); }
  if (major)         { conditions.push('up.major ILIKE $' + i++);     values.push('%' + major + '%'); }
  if (housing_type)  { conditions.push('up.housing_type = $' + i++);  values.push(housing_type); }
  if (room_type)     { conditions.push('up.room_type = $' + i++);     values.push(room_type); }
  if (move_in_term)  { conditions.push('up.move_in_term = $' + i++);  values.push(move_in_term); }

  const where = 'WHERE ' + conditions.join(' AND ');

  try {
    // Total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM user_profiles up ' +
      'INNER JOIN user_preferences upref ON up.user_id = upref.user_id ' +
      where,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Paginated results
    const usersResult = await pool.query(
      'SELECT up.user_id, up.full_name, up.academic_year, up.major, up.gender, ' +
      'up.contact_info, up.housing_type, up.room_type, up.move_in_term, ' +
      'upref.sleep_time, upref.wake_time, upref.thermostat_temp, upref.guest_policy, upref.noise_tolerance ' +
      'FROM user_profiles up ' +
      'INNER JOIN user_preferences upref ON up.user_id = upref.user_id ' +
      where +
      ' ORDER BY up.full_name ASC' +
      ' LIMIT $' + i + ' OFFSET $' + (i + 1),
      [...values, parseInt(limit), offset]
    );

    res.json({
      users: usersResult.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id - single user full profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT up.user_id, up.full_name, up.academic_year, up.major, up.gender, ' +
      'up.contact_info, up.housing_type, up.room_type, up.move_in_term, ' +
      'upref.sleep_time, upref.wake_time, upref.thermostat_temp, upref.guest_policy, upref.noise_tolerance ' +
      'FROM user_profiles up ' +
      'INNER JOIN user_preferences upref ON up.user_id = upref.user_id ' +
      'WHERE up.user_id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;