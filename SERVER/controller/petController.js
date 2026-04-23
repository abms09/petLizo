const Pet = require("../model/pet");
const Activity = require("../model/activity");

exports.createPet = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const newPet = new Pet({
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description || "",
      gender: req.body.gender || "male", 
      image: req.files?.map((file) => file.filename) || [],
      seller: req.user._id,
    });

    await newPet.save();

    res.json(newPet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({
      status: { $in: ["available", "pending"] },
      approved: "approved", 
    }).populate("seller", "name email");

    res.json({ pets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getSoldPets = async (req, res) => {
  try {
    const pets = await Pet.find({
      status: "sold",
      approved: "approved",
    }).populate("seller", "name email");

    res.json({ pets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsSold = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ message: "Pet not found" });

    pet.status = "sold";
    await pet.save();

    await Activity.create({
      type: "sale",
      message: `${pet.name} sold for ₹${pet.price}`,
    });

    res.json({ message: "Marked as sold", pet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ seller: req.user._id });
    res.json({ pets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ message: "Not found" });

    if (pet.seller.toString() !== req.user._id)
      return res.status(403).json({ message: "Not allowed" });

    const updated = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ message: "Not found" });

    console.log("LOGGED USER:", req.user);
    console.log("USER ID:", req.user._id.toString());
    console.log("PET SELLER:", pet.seller.toString());

    if (pet.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    await pet.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePetStatus = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ message: "Not found" });

    pet.status = "adopted";
    pet.isSold = true;
    pet.soldAt = new Date();

    await pet.save();

    res.json({ message: "Marked adopted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getSinglePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate(
      "seller",
      "name email",
    );
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.status(200).json({ success: true, pet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
