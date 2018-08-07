const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests the posts route
// @access Public
router.get('/test', (req, res) => res.json( {
  msg: 'Posts works'
}));

// @route GET api/posts
// @desc Get posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
  .sort({ date: -1 })
  .then(posts => {
    if (posts.length === 0) {
      return res.json({ nopostsfound: 'No posts found' });
    }
    res.json(posts);
  }
  )
  .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// @route GET api/posts/:id
// @desc Get post by id
// @access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
  .then(post => res.json(post))
  .catch(err =>
    res.status(404).json({ nopostfound: 'No post found with that ID'})
  );
});

// @route POSt api/posts
// @desc Create post
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      video: req.body.video,
      image: req.body.image,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @access Private
router.delete(
  '/:id', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
      .then(post => {
        // Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(404).json({ notauthorized: 'User not authorized' });
        }

        //Delete
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
    });
  }
);

// @route Post api/posts/like/:id
// @desc Like post
// @access Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false} ),
  (req, res) => {
    Profile.findOne({ user: req.user.id}).then(profile => {
      Post.findById(req.params.id)
      .then(post => {
      if (
        post.likes.filter(like => like.user.toString === req.user.id).length > 0
      ) { 
          return res.status(400).json({ alreadyliked: 'User already liked this post'});
        }

        // Add user id to likes array
        post.likes.unshift({ user: req.user.id });

        post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  });
  
});

// @route POSt api/posts/unlike/:id
// @desc Unlike post
// @access Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id).length === 0
        ) {
          return res.status(400).json({ notliked: 'You have not yet liked this post' });
        }

        // Get remove index
        const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        // Save
        post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
    });
  }
);

// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(404).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found '}));
  }
);

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Remove comment from post
// @access Private
router.delete(
  '/comment/:id/:comment_id',
  (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
      // Check to see if comment exists
      if (
        post.comments.filter( comment => comment._id.toString() === req.params.comment_id).length === 0
      ) {
        return res.status(404).json({ commentnotexists: 'Comment does not exist'});
      }

      // Get move index
      const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

      // Splice comment out of array
      post.comments.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    })
  }
)

// @route POST api/posts/video/:id
// @desc Add a video to post
// @access Private
router.post(
  '/video/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      console.log(isValid);
      return res.status(404).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newVideo = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          video: req.body.video,
          user: req.user.id
        };

        // Add to comments array
        post.video.unshift(newVideo);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ videonotfound: 'Video not found'}));
  }
);

// @route GET api/posts/video
// @desc Tests the getting a video
// @access Public
router.get('/posts/video', passport.authenticate('jwt', {session:
  false}), (req, res) =>  {
    res.json({
      text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          video: req.body,video,
          image: req.body.image,
          user: req.user.id,
    });
  });

// @route DELETE api/posts/video/:id/:video_id
// @desc delete a video from post
// @access Private
router.delete(
  '/video/:id/:video_id',
  (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
      // Check to see if video exists
      if (
        post.video.filter( video => video._id.toString() === req.params.video_id)
      ) {
        return res.status(404).json({ videonotexists: 'Video does not exist'});
      }

      // Get move index
      const removeIndex = post.video.map(item => item._id.toString()).indexOf(req.params.video_id);

      // Splice video out of array
      post.video.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    })
  }
)



module.exports = router;