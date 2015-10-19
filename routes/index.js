var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || "mongodb://localhost/users-auth");
var users = db.get('users');
var students = db.get('students');
var cookieSession = require('cookie-session');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res){
  res.render('register')
})

router.get('/log-out', function(req, res){
  req.session = null;
  res.redirect('/')
})

router.post('/register', function(req, res){
  var errors = [];
  users.findOne({email: req.body.email}, function(error, success){ 
    if (success){
      errors.push('That email is already registered')
    }
    if (req.body.email.indexOf('.com') < 0 || req.body.email.indexOf('@') < 0){
      errors.push('Please provide a valid email')
    } 
    if (req.body.password.length < 8){
      errors.push('Password must be at least 8 characters')
    }
    if (errors.length > 0){
      res.render('register', {errors: errors})
      console.log('ran this')
    } else {

      var hash = bcrypt.hashSync(req.body.password, 10)
      users.insert({email: req.body.email, password: hash}, function(err, result){
        if (err) throw err;
        console.log(result)
        res.render('index')
      })
    }
  })
})

router.get('/log-in', function(req, res){
  res.render('log-in')
})

router.post('/log-in', function(req, res){
  var errors = []
  users.findOne({email: req.body.email}, function(error, result){ 
    if (!result) {
      errors.push('That email is not registered')
      res.render('log-in', {errors: errors})
    }
    if (!bcrypt.compareSync(req.body.password, result.password)){
      errors.push('Your email/password are incorrect')
      res.render('log-in', {errors: errors})
    } 
    req.session.email = req.body.email
    res.render('index')
  })
})

router.get('/student-list', function(req, res){
  students.find({}, function(err, result){
    if (err) throw err;
    res.render('student-list', {students: result});
  })
  
})

router.get('/add-student', function(req, res){
  res.render('add-student')
})

router.post('/add-student', function(req, res){
  var errors = [];
  if (!req.body.name) {
    errors.push('Please enter a name for the student')
  }
  if (!req.body.phone || req.body.phone.length < 10){
    errors.push('Please enter a valid phone number')
  }
  if (errors.length > 0){
    res.render('add-student', {errors: errors})
  }
  students.insert({name: req.body.name, phone: req.body.phone}, function(err, result){
    if (err) throw err;
    res.redirect('/student-list')
  })
})

router.get('/student/:id', function(req, res){
  students.findById(req.params.id, function(err, result){
    if (err) throw err;
    res.render('student', {student: result})
  })
})

module.exports = router;





















