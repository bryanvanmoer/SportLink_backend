const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let { authorize, signAsynchronous } = require("../utils/auth");

/* mongodb User model */
const Player = require("../models/Player");

const jwtSecret = "jkjJ1235Ohno!";
const LIFETIME_JWT = 24 * 60 * 60 * 1000; // 10;// in seconds // 24 * 60 * 60 * 1000 = 24h

//const NotFoundError = require("../utils/NotFoundError");

/*
 * GET ALL PLAYERS
 */
router.get("/", authorize, function (req, res, next) {
  Player.find({})
    .then((users) => res.json(users))
    .catch((err) => next(err));
});

/*
 * SIGNUP PLAYER
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
  Player.find({ email }).then((result) => {
    if (result.length) {
      return res.status(400).send("Player with this provided email exists.");
    } else {
      // Hash password
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const newPlayer = Player({
            firstname,
            lastname,
            email,
            password: hashedPassword,
          });
          // Save user
          newPlayer
            .save()
            .then((result) => {
              // Sign a token
              jwt.sign(
                { email: newPlayer.email },
                jwtSecret,
                { expiresIn: LIFETIME_JWT },
                (err, token) => {
                  if (err) {
                    return res.status(400).send("Jwt Sign");
                  }
                  res.json({
                    token: token,
                    data: result,
                  });
                }
              );
            })
            .catch((err) => {
              return res
                .status(400)
                .send("Error occurred while saving a player.");
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
  Player.find({ email }).then((data) => {
    if (data.length) {
      const hashedPassword = data[0].password;
      bcrypt
        .compare(password, hashedPassword)
        .then((result) => {
          if (result) {
            // Sign token
            jwt.sign(
              { email: data.email },
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
      return res.status(404).send("Player not found.");
    }
  });
});

// Find user by ID
router.get("/:id", (req, res, next) => {
  Player.findById(req.params.id)
    .then((player) => {
      if (player) {
        res.json(player);
      } else {
        return res.status(404).send("Player not found.");
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
