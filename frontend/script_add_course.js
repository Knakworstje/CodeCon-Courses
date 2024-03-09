let sectionCount = 1;

function addSection() {
    const sectionsDiv = document.getElementById('sections');

    const sectionDiv = document.createElement('div');
    sectionDiv.innerHTML = `
        <fieldset>
            <legend>Section ${sectionCount}</legend>
            <label for="section${sectionCount}">Section Name:</label>
            <input type="text" id="section${sectionCount}" name="section${sectionCount}" required>
            <div class="videos" id="videos${sectionCount}">
                <div>
                    <label for="video${sectionCount}_1">Video:</label>
                    <input type="file" id="video${sectionCount}_1" name="video" accept='.mp4' required>
                </div>
            </div>
            <button type="button" onclick="addVideo(${sectionCount})">Add Video</button>
        </fieldset>
    `;
    sectionsDiv.appendChild(sectionDiv);

    sectionCount++;
}

function showNotification(message) {
    const notificationBar = document.getElementById('notification-bar');
    const notificationMessage = document.getElementById('notification-message');
  
    notificationMessage.textContent = message;
    notificationBar.classList.add('show');
  
    setTimeout(() => {
      notificationBar.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}
  
function closeNotification() {
    const notificationBar = document.getElementById('notification-bar');
    notificationBar.classList.remove('show');
}

function addVideo(sectionNumber) {
    const videosDiv = document.getElementById(`videos${sectionNumber}`);

    const videoDiv = document.createElement('div');
    const videoIndex = videosDiv.children.length + 1;
    videoDiv.innerHTML = `
        <label for="video${sectionNumber}_${videoIndex}">Video:</label>
        <input type="file" id="video${sectionNumber}_${videoIndex}" name="video${sectionNumber}_${videoIndex}" required>
    `;
    videosDiv.appendChild(videoDiv);
}

document.getElementById('course-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Gather course details from the form
    const courseData = {
        name: document.getElementById('name').value,
        instructor: document.getElementById('instructor').value,
        description: document.getElementById('description').value,
        sections: []
    };

    async function fetchVideoMetadata(videoFile) {
        return new Promise((resolve, reject) => {
            const videoPlayer = document.createElement('video');
            videoPlayer.src = URL.createObjectURL(videoFile);
            videoPlayer.addEventListener('loadedmetadata', () => {
                URL.revokeObjectURL(videoPlayer.src); // Release object URL
                resolve({ name: videoFile.name, duration: videoPlayer.duration });
            });
            videoPlayer.addEventListener('error', () => {
                reject(new Error('Error loading video metadata'));
            });
        });
    }

    // Gather section details from the form
    for (let i = 1; i < sectionCount; i++) {
        const sectionName = document.getElementById(`section${i}`).value;
        const videos = [];

        // Gather video Files for the section
        const videosDiv = document.getElementById(`videos${i}`);
        for (let j = 0; j < videosDiv.children.length; j++) {
            const videoFile = document.getElementById(`video${i}_${j + 1}`).files[0];
            
            try {
                const videoMetadata = await fetchVideoMetadata(videoFile);
                videos.push(videoMetadata);
            } catch (error) {
                console.error('Error fetching video metadata:', error);
                // Handle error (e.g., show error message to user)
            }
        }

        courseData.sections.push({ name: sectionName, videos });
    }

    // Make the POST request to add the course
    try {
        const addCourseResponse = await fetch('https://codeconcourses.duckdns.org:5555/addCourse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });
        
        if (addCourseResponse.status == 403) {
            window.alert('Course already exists!');
        } else if (!addCourseResponse.ok) {
            window.alert('An error occured when trying to create a course. Please contact support or try again later.');
            throw new Error('Failed to add course');
        } else {
            window.alert('Course created succesfully!');
        }

        // Continue with the image upload
        const imageFile = document.getElementById('image').files[0];
        const formData = new FormData();
        formData.append('course_image', imageFile);

        const uploadImageResponse = await fetch('https://codeconcourses.duckdns.org:5555/uploadImage/' + courseData.name, {
            method: 'POST',
            body: formData
        });

        if (!uploadImageResponse.ok) {
            throw new Error('Failed to upload image');
        } else {
            // Continue with uploading videos
        const allVideos = [];
        for (let i = 1; i < sectionCount; i++) {
            const videosDiv = document.getElementById(`videos${i}`);
            for (let j = 0; j < videosDiv.children.length; j++) {
                const videoFile = document.getElementById(`video${i}_${j + 1}`).files[0];
                allVideos.push(videoFile);
            }
        }

        const formData2 = new FormData();
        for (let videoFile of allVideos) {
            formData2.append('video', videoFile);
        }

        const uploadVideosResponse = await fetch('https://codeconcourses.duckdns.org:5555/uploadVideos/' + courseData.name, {
            method: 'POST',
            body: formData2
        });

        if (!uploadVideosResponse.ok) {
            throw new Error('Failed to upload videos');
        }
        
        }
    } catch (error) {
        console.error('An error occurred:', error);
        // Handle error (e.g., show error message to user)
    }
});