const express = require('express');
const { Post, User, Comment } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id', 'username'] },
        { model: Comment, attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'username'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'username'] }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({
      title,
      content,
      userId: req.userId
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await post.update(req.body);
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;