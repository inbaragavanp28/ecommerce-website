const express = require('express');
const { Comment } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Create comment
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const comment = await Comment.create({
      content,
      postId,
      userId: req.userId
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;