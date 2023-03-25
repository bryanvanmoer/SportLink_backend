const router = require('express').Router()

const Sales = require("../models/sales");

const Games = require("../models/games");
const NotFoundError = require("../utils/NotFoundError");

// Find all
router.get("/", (req, res, next) => {
    Sales.find({})
    .then((sales) => res.json(sales))
    .catch((err) => next(err));
});

// Find by ID
router.get("/:id", (req, res, next) => {
    Sales.findById(req.params.id)
    .then((sale) => {
      if (sale) {
        res.json(sale);
      } else {
        throw new NotFoundError();
      }
    })
    .catch((err) => next(err));
});

// Delete one
router.delete("/:id", (req, res, next) => {
    Sales.findByIdAndRemove(req.params.id)
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
  if (!body.buyer) errorMessages.push("buyer must be present");
  if (!body.date) errorMessages.push("date must be present");
  if (!body.quantity) errorMessages.push("quantity must be present");
  if (body.quantity<=0) errorMessages.push("quantity must be positif "); 
  if (!body.game) errorMessages.push("game must be present");
  if (errorMessages.length > 0) {
    res.status(422).json({ errorMessages });
    return;
  }
  Games.findById(body.game)
  .then((game) => {
    if (!game || game.stock<=0) {
      throw new NotFoundError();
    } else {
        body.total=game.price*body.quantity;
        game.stock=game.stock-1;
        game.save();
        const sale = new Sales(body);
        sale
          .save()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => next(err));
    }
  })

});

module.exports = router;
