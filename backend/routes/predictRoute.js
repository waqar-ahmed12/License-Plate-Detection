const router = require('express').Router();
const upload = require('../middleware/upload');
const {predictVideo, getCsv} = require('../controllers/predictController');

router.post('/', upload.single('video'), predictVideo);
router.get('/:fileName/csv', getCsv);

module.exports = router;