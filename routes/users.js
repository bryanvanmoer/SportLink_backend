const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let { authorize, signAsynchronous } = require("../utils/auth");

/* mongodb User model */
const User = require("../models/User");

const jwtSecret = process.env.JWTSECRET;

const LIFETIME_JWT = 24 * 60 * 60 * 1000; // 10;// in seconds // 24 * 60 * 60 * 1000 = 24h

//const NotFoundError = require("../utils/NotFoundError");

/*
 * GET ALL USERS
 */
router.get("/", authorize, function (req, res, next) {
  User.find({})
    .then((users) => res.json(users))
    .catch((err) => next(err));
});

/**
 * GET EMAIL VIA TOKEN
 */

router.get("/user", authorize, function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("You are not authenticated.");
  jwt.verify(token, jwtSecret, (err, token) => {
    if (err) return res.status(401).send(err.message);
    User.find({ email: token.email })
      .then((user) => {
        if (user) {
          res.json(user);
        } else {
          return res.status(404).send("User not found.");
        }
      })
      .catch((err) => next(err));
  });
});

/*
 * REGISTER USER
 */
router.post("/register", async (req, res) => {
  let { firstname, lastname, email, password } = req.body;
  firstname = firstname.trim();
  lastname = lastname.trim();
  email = email.trim();
  password = password.trim();

  if (firstname == "" || lastname == "" || email == "" || password == "") {
    return res.status(400).send("Empty credentials supplied.");
  }

  // Check existing user
  User.find({ email }).then((result) => {
    if (result.length) {
      return res.status(400).send("User with this provided email exists.");
    } else {
      // Hash password
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const newUser = User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
          });
          // Save user
          newUser
            .save()
            .then((result) => {
              return res.status(200).send();
            })
            .catch((err) => {
              return res
                .status(400)
                .send("Error occurred while saving an user.");
            });
        })
        .catch((err) => {
          return res.status(400).send("Error occurred while hashing password.");
        });
    }
  });
});

router.post("/login", (req, res) => {
  let { email, password } = req.body;

  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    return res.status(400).send("Empty credentials supplied.");
  }

  // Find user by the email
  User.find({ email }).then((data) => {
    if (data.length) {
      const hashedPassword = data[0].password;
      bcrypt
        .compare(password, hashedPassword)
        .then((result) => {
          if (result) {
            // Sign token
            jwt.sign(
              { email: data[0].email },
              jwtSecret,
              { expiresIn: LIFETIME_JWT },
              (err, token) => {
                if (err) {
                  return res
                    .status(500)
                    .send("Error occured while checking for signing token");
                }
                return res.json({ token: token, data: data });
              }
            );
          } else {
            return res.status(400).send("Invalid password.");
          }
        })
        .catch((err) => {
          return res
            .status(400)
            .send("Error occurred while comparing password.");
        });
    } else {
      return res.status(404).send("User not found.");
    }
  });
});

// Find user by ID
router.get("/:id", (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        return res.status(404).send("User not found.");
      }
    })
    .catch((err) => next(err));
});

// // Delete one user
// router.delete("/:id", (req, res, next) => {
//   User.findByIdAndRemove(req.params.id)
//     .then((result) => {
//       if (result) {
//         res.json(result);
//       } else {
//         throw new NotFoundError();
//       }
//     })
//     .catch((err) => next(err));
// });

module.exports = router;
