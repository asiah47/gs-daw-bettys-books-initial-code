// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10

// list users
router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT username, first_name, last_name, email FROM users";
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err)
        }
        res.render("listusers.ejs", {users:result})
     })
})

// Logging in 

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
})

router.post('/loggedin', function (req, res, next) {
    console.log("Request Body:", req.body);
    
    const username = req.body.username;
    const password = req.body.password;


    console.log("Username:", username); // Log username
    console.log("Password:", password); // Log password

// checking for the username 
const sqlquery = "SELECT * FROM users WHERE username = ?";
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            return next(err);
        }
              
        if (result.length === 0){
            return res.send ("Login failed: Username is not recognised, try again!")
        }
        const user = result [0];
        const hashedPassword = user.hashed_password;

        console.log("Hashed Password:", hashedPassword); // Log hashed password

         // Compare the password supplied with the password in the database
        bcrypt.compare(req.body.password, hashedPassword, function(err, result)
         
        {
            if (err) {
              return next (err);
            }
            else if (result == true) {
                return res.send(`Login was successful! Welcome ${user.first_name} ${user.last_name}.`);
            }
            else {
                return res.send ("Login Failed: Incorrect Password");
            }
    
        });     
    });  
});

// Registering 

router.get('/register', function (req, res, next) {
    res.render('register.ejs')                                                               
})    

router.post('/registered', function (req, res, next) {
    
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // Store hashed password in your database.
        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?, ?)";
        let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
      
    
      db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            return next(err)
        }
                                                  

    // saving data in database
            let resultMessage = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
            resultMessage += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
            res.send(resultMessage);
        });
    });     
});                                                    

// Export the router object so index.js can access it
module.exports = router;
