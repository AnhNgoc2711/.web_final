CREATE TABLE USER
(
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  is_active BOOLEAN DEFAULT FALSE,
  theme ENUM('light', 'dark') DEFAULT 'light',
  font_size ENUM('small', 'normal', 'large') DEFAULT 'normal'
);

CREATE TABLE NOTE
(
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  color VARCHAR(20),
  pinned BOOLEAN DEFAULT FALSE,
  pinned_at DATETIME,
  locked BOOLEAN DEFAULT FALSE,
  lock_password VARCHAR(255),
  is_shared BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE ATTACHMENT
(
  attach_id INT AUTO_INCREMENT PRIMARY KEY,
  note_id INT NOT NULL,
  img VARCHAR(255),
  FOREIGN KEY (note_id) REFERENCES NOTE(note_id)
);

CREATE TABLE LABEL
(
  label_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name_label VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE TOKEN
(
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) ,
  type ENUM('activation','reset') NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE NOTE_SHARE
(
  share_id INT AUTO_INCREMENT PRIMARY KEY,
  note_id INT NOT NULL,
  owner_id INT NOT NULL,
  share_to INT NOT NULL,
  permission ENUM('view','edit') NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES USER(user_id),
  FOREIGN KEY (share_to) REFERENCES USER(user_id),
  FOREIGN KEY (note_id) REFERENCES NOTE(note_id),
  UNIQUE (share_to, note_id)
);

CREATE TABLE NOTE_LABEL
(
  label_id INT NOT NULL,
  note_id INT NOT NULL,
  PRIMARY KEY (label_id, note_id),
  FOREIGN KEY (label_id) REFERENCES LABEL(label_id),
  FOREIGN KEY (note_id) REFERENCES NOTE(note_id)
);