const express = require('express')
const path = require('path')
const app = express()

// Static Middleware
let staticDirectory = __dirname + '/public';
app.use(express.static(path.join('..', 'html')))

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies
app.use(express.json());

// View Engine Setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Add explicit route for index
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

// Add POST route handler
app.post('/', function(req, res) {
    try {
        console.log('Form submission received');
        
        // Get the manifest data from the request body
        const manifestData = req.body.manifest;
        
        // Get the action URL (GitHub organization URL)
        const actionUrl = req.body.action;
        console.log('Redirecting to:', actionUrl);
        
        if (!actionUrl) {
            return res.status(400).send('Missing action URL');
        }
        
        // Redirect to GitHub with the manifest data
        return res.redirect(actionUrl);
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).send('Error processing your request: ' + error.message);
    }
});
  
app.listen(8080, function(error){
    if(error) throw error
    console.log("Server created Successfully")
    console.log("Open a browser on http://localhost:8080/")
})