const fs = require('fs');
const express = require('express');

const bodyParser = require('body-parser');

const multer = require('multer');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Specify your email service provider
    service: 'gmail', // e.g., 'gmail', 'outlook', etc.
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    // Specify your authentication details
    auth: {
      user: 'codeconcoursesautomail@gmail.com',
      pass: 'ereoyxjotlijgwcz'
    }
});

const app = express();

const cors = require('cors');

app.use(bodyParser());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const directoryPath = '../frontend/courses/' + req.params.courseName;
        cb(null, directoryPath);
    },
    filename: function (req, file, cb) {
        cb(null, 'course_image.png');
    }
});

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        const directoryPath = '../frontend/courses/' + req.params.courseName + '/videos';
        cb(null, directoryPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
const upload2 = multer({ storage: storage2 });


const allowedOrigins = ['localhost'];
app.use(cors({
  origin: function(origin, callback){
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }

}));

app.post('/addContact', (req, res) => {
    fs.readFile('./contacts.json', (err, data) => {
        if (err) {
            console.log('ERROR: ' + err);
            return;
        }

        let array = JSON.parse(data);

        array.push(req.body);

        fs.writeFile('./contacts.json', JSON.stringify(array), (err) => {
            if (err) {
                console.log('ERROR: ' + err);
            }
        });
    })

    // Define email options
    const mailOptions = {
        from: `No Reply <codeconcoursesautomail@gmail.com>`,
        to: req.body.email,
        subject: 'Contact Form',
        text: 'Thank you for filling on the contact form on the CodeCon Courses website.\n A representative will be with you shortly.'
    };
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.error('Error occurred:', error);
        } else {
        console.log('Email sent:', info.response);
        }
    });

    res.sendStatus(200);
});

app.post('/uploadImage/:courseName', upload.single('course_image'), (req, res) => {
    res.status(200).send('File uploaded successfully.');
});

app.post('/uploadVideos/:courseName', upload2.array('video'), (req, res) => {
    res.status(200).send('File uploaded successfully.');
});

app.post('/addCourse', (req, res) => {
    if (fs.existsSync('../frontend/courses/' + req.body.name)) {
        res.sendStatus(403);
        return;
    }
    fs.mkdir('../frontend/courses/' + req.body.name, (err) => {
        if (err) {
            console.log('ERROR: ' + err);
            res.sendStatus(404);
        } else {
            fs.mkdir('../frontend/courses/' + req.body.name + '/videos', (err) => {
                if (err) {
                    console.log('ERROR: ' + err);
                    res.sendStatus(404);
                } else {
                    fs.writeFile('../frontend/courses/' + req.body.name + '/buy-page.html', `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Course Name - CodeCon Courses</title>
                                    <link rel="stylesheet" href="style-buy-page.css">
                                </head>
                                <body>
                                
                                    <header class="header">
                                        <h1 class="logo">CodeCon Courses</h1>
                                        <nav class="navbar">
                                            <ul class="nav-list">
                                                <li><a href="../../index.html" class="nav-link">Home</a></li>
                                                <li><a href="../../courses.html" class="nav-link">Courses</a></li>
                                                <li><a href="../../about.html" class="nav-link">About</a></li>
                                                <li><a href="../../contact.html" class="nav-link">Contact</a></li>
                                            </ul>
                                        </nav>
                                    </header>
                                
                                    <section class="course-details">
                                        <div class="course-image">
                                            <img src="course_image.png" alt="Course Image">
                                        </div>
                                        <div class="course-info">
                                            <h2>${req.body.name}</h2>
                                            <p class="instructor">Instructor: ${req.body.instructor}</p>
                                            <p class="description">${req.body.description}</p>
                                            <p class="price">$0.00 We are CodeCon, everything is free here!!!</p>
                                            <button class="enroll-btn" onclick="window.location.href = './course.html'">Enroll Now</button>
                                        </div>
                                    </section>
                                
                                    <footer class="footer">
                                        <p>&copy; 2024 CodeCon Courses. All rights reserved.</p>
                                    </footer>
                                
                                </body>
                                </html>
                        `, (err) => {
                            if (err) {
                                console.log('ERROR: ' + err);
                                res.sendStatus(404);
                                return;
                            } else {
                                fs.writeFile('../frontend/courses/' + req.body.name + '/style-buy-page.css', `
                                    /* course_styles.css */
                                    /* Global Styles */
                                    body {
                                        font-family: Arial, sans-serif;
                                        margin: 0;
                                        padding: 0;
                                        background-color: #f8f9fa;
                                        color: #333;
                                    }
                                    
                                    /* Header Styles */
                                    .header {
                                        background-color: #5c7cfa;
                                        color: #fff;
                                        padding: 20px;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    }
                                    
                                    .logo {
                                        font-size: 24px;
                                    }
                                    
                                    .nav-list {
                                        list-style: none;
                                        display: flex;
                                    }
                                    
                                    .nav-link {
                                        color: #fff;
                                        text-decoration: none;
                                        margin-right: 20px;
                                    }
                                    
                                    /* Course Details Section Styles */
                                    .course-details {
                                        width: 100%;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        padding: 50px 0;
                                        box-sizing: border-box; /* Ensure padding is included in width calculation */
                                    }
                                    
                                    .course-image {
                                        flex: 1;
                                        padding: 0 20px; /* Add padding to the image container */
                                    }
                                    
                                    .course-image img {
                                        width: 100%;
                                        border-radius: 5px;
                                    }
                                    
                                    .course-info {
                                        flex: 3; /* Adjusted to take up three-quarters of the page width */
                                        padding: 0 20px;
                                    }
                                    
                                    .course-info h2 {
                                        font-size: 36px;
                                        margin-bottom: 20px;
                                        color: #333;
                                    }
                                    
                                    .course-info .instructor {
                                        font-size: 18px;
                                        color: #777;
                                        margin-bottom: 10px;
                                    }
                                    
                                    .course-info .description {
                                        font-size: 16px;
                                        color: #555;
                                        margin-bottom: 20px;
                                    }
                                    
                                    .course-info .price {
                                        font-size: 24px;
                                        color: #333;
                                        margin-bottom: 20px;
                                    }
                                    
                                    .enroll-btn {
                                        background-color: #5c7cfa;
                                        color: #fff;
                                        padding: 10px 20px;
                                        border: none;
                                        border-radius: 5px;
                                        font-size: 18px;
                                        cursor: pointer;
                                        transition: background-color 0.3s ease;
                                    }
                                    
                                    .enroll-btn:hover {
                                        background-color: #4760d1;
                                    }
                                    
                                    /* Footer Styles */
                                    .footer {
                                        background-color: #5c7cfa;
                                        color: #fff;
                                        padding: 20px;
                                        text-align: center;
                                    }
                                `,(err) => {
                                    if (err) {
                                        console.log('ERROR: ' + err);
                                        res.sendStatus(404);
                                        return;
                                    } else {
                                        let sections = [];

                                        let videosArray = [];

                                        console.log(req.body);

                                        for (let section of req.body.sections) {
                                            let videos = [];

                                            for (let video of section.videos) {
                                                if (video.duration >= 60) {
                                                    videos.push(`<li><button class="section-button" onclick="window.location.href='./course.html?video=${video.name}'">${video.name} (${Math.round(video.duration/60)} min)</button></li>`);
                                                } else {
                                                    videos.push(`<li><button class="section-button" onclick="window.location.href='./course.html?video=${video.name}'">${video.name} (${Math.round(video.duration)} sec)</button></li>`);
                                                }
                                                videosArray.push(video.name.split('.mp4')[0]);
                                            }

                                            videos = videos.join('\n');
                                            
                                            sections.push(`
                                                <li>
                                                <p>${section.name}</p>
                                                    <ul>${videos}</ul>
                                                </li>
                                            `);
                                        }

                                        sections = sections.join('\n');

                                        fs.writeFile('../frontend/courses/' + req.body.name + '/course.html', `
                                        <!DOCTYPE html>
                                        <html lang="en">
                                        <head>
                                            <meta charset="UTF-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <title>Course Name - CodeCon Courses</title>
                                            <link rel="stylesheet" href="course_styles.css">
                                        </head>
                                        <body>
                                        
                                            <header class="header">
                                                <h1 class="logo">CodeCon Courses</h1>
                                                <nav class="navbar">
                                                    <ul class="nav-list">
                                                        <li><a href="../../index.html" class="nav-link">Home</a></li>
                                                        <li><a href="../../courses.html" class="nav-link">Courses</a></li>
                                                        <li><a href="../../about.html" class="nav-link">About</a></li>
                                                        <li><a href="../../contact.html" class="nav-link">Contact</a></li>
                                                    </ul>
                                                </nav>
                                            </header>
                                        
                                            <section class="course-details">
                                                <div class="course-info">
                                                    <h2>${req.body.name}</h2>
                                                    <p class="instructor">Instructor: ${req.body.instructor}</p>
                                                </div>
                                            </section>
                                        
                                            <section class="course-content">
                                                <div class="video-section">
                                                    <h2>Video</h2>
                                                    <!-- Embed your video here -->
                                                    <video width="560" height="315" controls id="video">
                                                        <source src="./videos/" type="video/mp4" id="video-source">
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                                
                                                <div class="qna-section">
                                                    <h2>Q&A</h2>
                                                    <!-- Add your Q&A section here -->
                                                    <div class="qna">
                                                        <h3>Type a question here.</h3>
                                                        <p>And get it answered by the course instrutor.</p>
                                                    </div>
                                                </div>
                                            </section>
                                        
                                            <aside class="course-sidebar">
                                                <h2>Sections</h2>
                                                <ul class="section-list">
                                                    ` + 

                                                    sections

                                                    +
                                                    `
                                                </ul>
                                            </aside>    
                                        
                                            <footer class="footer">
                                                <p>&copy; 2024 CodeCon Courses. All rights reserved.</p>
                                            </footer>
                                        
                                            <script defer>
                                                function getUrlParam(param) {
                                                    const queryString = window.location.search;
                                                    const urlParams = new URLSearchParams(queryString);
                                                    return urlParams.get(param);
                                                }
                                            
                                             const videoIds = ${JSON.stringify(videosArray)}; // Update with your video IDs
                                                let currentVideoIndex = videoIds.indexOf(getUrlParam('video')); // Get the index of the current video
                                                
                                                if (currentVideoIndex === -1) {
                                                    currentVideoIndex = 0;
                                                }

                                                console.log(currentVideoIndex);
                                        
                                                const video = document.getElementById('video-source');
                                                video.src = './videos/' + videoIds[currentVideoIndex] + '.mp4'; // Set the source of the video
                                            
                                                document.getElementById('video').onended = function() {
                                                    console.log('ended, new video: ' + videoIds[currentVideoIndex + 1]);
                                                    currentVideoIndex = currentVideoIndex + 1; // Move to the next video
                                                    if (currentVideoIndex < videoIds.length) {
                                                        // If there are more videos in the section, play the next one
                                                        var nextVideoSrc = './videos/' + videoIds[currentVideoIndex] + '.mp4';
                                                        console.log('Next video source: ' + nextVideoSrc);
                                                        video.src = nextVideoSrc;
                                                        console.log('New video source set: ' + video.src);
                                                        document.getElementById('video').pause();
                                                        document.getElementById('video').load();
                                                        document.getElementById('video').play();
                                                        console.log('Playing next video...');
                                                    } else {
                                                        console.log('No more videos in the section.');
                                                    }
                                                };
                                            </script>
                                            
                                        </body>
                                        </html>
                                        `, (err) => {
                                            if (err) {
                                                console.log('ERROR: ' + err);
                                                res.sendStatus(404);
                                                return;
                                            } else {
                                                fs.writeFile('../frontend/courses/' + req.body.name + '/course_styles.css', `
                                                    /* course_styles.css */
                                                    /* Global Styles */
                                                    body {
                                                        font-family: Arial, sans-serif;
                                                        margin: 0;
                                                        padding: 0;
                                                        background-color: #06bcbf; /* was #f8f9fa */
                                                        color: #333;
                                                    }
                                                    
                                                    /* Header Styles */
                                                    .header {
                                                        background-color: #007bff;
                                                        color: #fff;
                                                        padding: 20px;
                                                        display: flex;
                                                        justify-content: space-between;
                                                        align-items: center;
                                                    }
                                                    
                                                    .logo {
                                                        font-size: 24px;
                                                    }
                                                    
                                                    .nav-list {
                                                        list-style: none;
                                                        display: flex;
                                                    }
                                                    
                                                    .nav-link {
                                                        color: #fff;
                                                        text-decoration: none;
                                                        margin-right: 20px;
                                                    }
                                                    
                                                    /* Course Details Section Styles */
                                                    .course-details {
                                                        width: 100%;
                                                        background-color: #fff;
                                                        padding: 50px 0;
                                                        text-align: center;
                                                    }
                                                    
                                                    .course-info {
                                                        max-width: 800px;
                                                        margin: 0 auto;
                                                    }
                                                    
                                                    .course-info h2 {
                                                        font-size: 36px;
                                                        margin-bottom: 20px;
                                                        color: #333;
                                                    }
                                                    
                                                    .course-info .instructor {
                                                        font-size: 18px;
                                                        color: #777;
                                                        margin-bottom: 10px;
                                                    }
                                                    
                                                    .course-info .description {
                                                        font-size: 16px;
                                                        color: #555;
                                                        margin-bottom: 20px;
                                                    }
                                                    
                                                    .course-info .price {
                                                        font-size: 24px;
                                                        color: #333;
                                                        margin-bottom: 20px;
                                                    }
                                                    
                                                    .enroll-btn {
                                                        background-color: #ec5252;
                                                        color: #fff;
                                                        padding: 10px 20px;
                                                        border: none;
                                                        border-radius: 5px;
                                                        font-size: 18px;
                                                        cursor: pointer;
                                                        transition: background-color 0.3s ease;
                                                    }
                                                    
                                                    .enroll-btn:hover {
                                                        background-color: #c32828;
                                                    }
                                                    
                                                    /* Course Content Section Styles */
                                                    .course-content {
                                                        display: flex;
                                                        flex-wrap: wrap;
                                                        justify-content: center;
                                                        padding: 50px;
                                                    }
                                                    
                                                    .video-section,
                                                    .qna-section {
                                                        width: 50%;
                                                        background-color: #fff;
                                                        border-radius: 10px;
                                                        padding: 20px;
                                                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                                        margin-bottom: 50px;
                                                    }
                                                    
                                                    .video-section h2,
                                                    .qna-section h2 {
                                                        font-size: 24px;
                                                        margin-bottom: 20px;
                                                        color: #333;
                                                    }
                                                    
                                                    .qna {
                                                        margin-bottom: 20px;
                                                    }
                                                    
                                                    .qna h3 {
                                                        font-size: 18px;
                                                        color: #333;
                                                        margin-bottom: 10px;
                                                    }
                                                    
                                                    .qna p {
                                                        font-size: 16px;
                                                        color: #555;
                                                    }
                                                    
                                                    /* Course Sidebar Styles */
                                                    .course-sidebar {
                                                        width: 300px;
                                                        background-color: #fff;
                                                        padding: 20px;
                                                        border-radius: 10px;
                                                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                                        position: absolute;
                                                        top: 375px;
                                                        right: 25px;
                                                    }
                                                    
                                                    .course-sidebar h2 {
                                                        font-size: 24px;
                                                        margin-bottom: 20px;
                                                        color: #333;
                                                    }
                                                    
                                                    .section-list {
                                                        list-style: none;
                                                        padding: 0;
                                                    }
                                                    
                                                    .section-list li {
                                                        margin-bottom: 10px;
                                                    }
                                                    
                                                    .section-list a {
                                                        font-size: 16px;
                                                        color: #333;
                                                        text-decoration: none;
                                                    }
                                                    
                                                    .section-list a:hover {
                                                        color: #ec5252;
                                                    }
                                                    
                                                    /* Add this to your existing CSS */
                                                    .section-list ul {
                                                        list-style-type: none;
                                                        padding: 0;
                                                    }
                                                    
                                                    .section-list ul li {
                                                        margin-top: 10px;
                                                    }
                                                    
                                                    .section-button {
                                                        background-color: #007bff;
                                                        color: #fff;
                                                        border: none;
                                                        border-radius: 5px;
                                                        padding: 10px 20px;
                                                        cursor: pointer;
                                                        transition: background-color 0.3s ease;
                                                    }
                                                    
                                                    .section-button:hover {
                                                        background-color: #0056b3;
                                                    }
                                                    
                                                    /* Footer Styles */
                                                    .footer {
                                                        background-color: #333;
                                                        color: #fff;
                                                        padding: 20px;
                                                        text-align: center;
                                                    }
                                                `, (err) => {
                                                    if (err) {
                                                        console.log('ERROR: ' + err);
                                                        res.sendStatus(404);
                                                        return;
                                                    } else {
                                                        fs.writeFile('../frontend/courses/' + req.body.name + '/description.txt', req.body.description, (err) => {
                                                            if (err) {
                                                                console.log('ERROR: ' + err);
                                                                res.sendStatus(404);
                                                                return;
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })      
                }
            });
        }
    });
    res.sendStatus(200);
});

app.get('/getContacts', (req, res) => {
    fs.readFile('./contacts.json', (err, data) => {
        if (err) {
            console.log('ERROR: ' + err);
            res.sendStatus(404);
            return;
        }

        res.send(JSON.parse(data));
    })
});

app.get('/getCourses', (req, res) => {
    fs.readdir('../frontend/courses', (err, folders) => {
        if (err) {
            console.log('ERROR: ' + err);
            res.sendStatus(500); // Send internal server error status if readdir fails
            return;
        }

        let promises = [];

        for (let folder of folders) {
            let promise = new Promise((resolve, reject) => {
                fs.readFile('../frontend/courses/' + folder + '/description.txt', (err, data) => {
                    if (err) {
                        console.log('ERROR: ' + err);
                        reject(err);
                        return;
                    }
                    resolve({ name: folder, description: data.toString() });
                });
            });
            promises.push(promise);
        }

        Promise.all(promises)
            .then((courses) => {
                res.send(JSON.stringify(courses));
            })
            .catch((err) => {
                res.sendStatus(500); // Send internal server error status if any file reading fails
            });
    });
});

app.listen(5555, () => {
    console.log(`Listening on port: ${5555}`);
});