-- Users table (authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Combined profile + housing preferences
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  major VARCHAR(100) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  housing_type VARCHAR(50) NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  move_in_term VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);