const router = require('express').Router()

const Games = require("../models/games");
const NotFoundError = require("../utils/NotFoundError");

// Find all
router.get("/", (req, res, next) => {
    Games.find({})
    .then((game) => res.json(game))
    .catch((err) => next(err));
});

// Find by ID
router.get("/:id", (req, res, next) => {
    Games.findById(req.params.id)
    .then((game) => {
      if (game) {
        res.json(game);
      } else {
        throw new NotFoundError();
      }
    })
    .catch((err) => next(err));
});

// Delete one
router.delete("/:id", (req, res, next) => {
    Games.findByIdAndRemove(req.params.id)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        throw new NotFoundError();
      }
    })
    .catch((err) => next(err));
});

// Insert one
router.post("/", (req, res, next) => {
  const body = req.body;
  // Check body
  const errorMessages = [];
  if (!body.name) errorMessages.push("name must be present");
  if (!body.price) errorMessages.push("price must be present");
  if (!body.stock) errorMessages.push("stock must be present");
  if (body.stock<=0) errorMessages.push("stock must be positif or nul");
  if (errorMessages.length > 0) {
    res.status(422).json({ errorMessages });
    return;
  }
  const game = new Games(body);
  game
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => next(err));
});

module.exports = router;
