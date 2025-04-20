const Campsite = require('../models/Campsite');

exports.getAllCampsites = async (req, res) => {
  try {
    const campsites = await Campsite.find();
    res.json(campsites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCampsiteById = async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id);
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });
    res.json(campsite);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCampsite = async (req, res) => {
  try {
    const campsite = new Campsite(req.body);
    await campsite.save();
    res.status(201).json({ message: 'Campsite created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCampsite = async (req, res) => {
  try {
    const campsite = await Campsite.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });
    res.json({ message: 'Campsite updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCampsite = async (req, res) => {
  try {
    const campsite = await Campsite.findByIdAndDelete(req.params.id);
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });
    res.json({ message: 'Campsite deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
