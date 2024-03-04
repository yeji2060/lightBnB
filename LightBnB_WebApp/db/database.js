const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithEmail = function (email) {
//   let resolvedUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     if (user && user.email.toLowerCase() === email.toLowerCase()) {
//       resolvedUser = user;
//     }
//   }
//   return Promise.resolve(resolvedUser);
// }; // I left this on my own purpose! 

const getUserWithEmail = function(email) {
  const queryString = `
    SELECT * 
    FROM users 
    WHERE email = $1;
  `;

  return pool.query(queryString, [email.toLowerCase()])
    .then(res => {
      if (res.rows.length > 0) {
        return res.rows[0]; // User found, return the user object
      } else {
        return null; // No user found, return null
      }
    })
    .catch(err => {
      console.error('query error', err.stack);
      return null; // In case of error, return null
    });
};


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

// const getUserWithId = function (id) {
//   return Promise.resolve(users[id]);
// }; // I left this on my own purpose! 

const getUserWithId = function (id) {
  const queryString = `
    SELECT * 
    FROM users 
    WHERE id = $1;
  `;

  return pool.query(queryString, [id])
    .then(res => {
      if (res.rows.length > 0) {
        return res.rows[0]; // User found, return the user object
      } else {
        return null; // No user found, return null
      }
    })
    .catch(err => {
      console.error('query error', err.stack);
      return null; // In case of error, return null
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
// const addUser = function (user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// }; 

const addUser = function(user) {
  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  return pool.query(queryString, [user.name, user.email, user.password])
    .then(res => {
      return res.rows[0]; // Return the newly added user object
    })
    .catch(err => {
      console.error('query error', err.stack);
      return null; // In case of error, return null
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
// const getAllReservations = function (guest_id, limit = 10) {
//   return getAllProperties(null, 2);
// };

const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `
    SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2;
  `;

  return pool.query(queryString, [guest_id, limit])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {

      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
