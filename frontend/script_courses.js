let courses;

function addCourses(courses) {
    const mainElement = document.getElementById("main");
    const courseTemplate = document.getElementById("course-template");

    mainElement.innerHTML = '';

    for (let course of courses) {
        // Clone the course template
        const courseElement = courseTemplate.content.cloneNode(true);

        // Populate the cloned elements with course data
        courseElement.querySelector("h2").textContent = course.name;
        courseElement.querySelector("p").textContent = course.description;
        courseElement.querySelector("a").href = `./courses/${course.name}/buy-page.html`;

        // Append the populated course element to the main element
        mainElement.appendChild(courseElement);
    }
}

function searchCourses() {
    let foundCourses = [];

    if (document.getElementById('search-bar').value.length === 0) {
        foundCourses = courses;
    } else {
        for (let course of courses) {
            if (course.name.toLowerCase().indexOf(document.getElementById('search-bar').value) !== -1) {
                foundCourses.push(course);        
            }
        }
    }

    if (foundCourses.length === 0) {
        document.getElementById('main').innerHTML = '';
        let paraghraph = document.createElement('p');
        paraghraph.innerText = 'No results were found.';
        document.getElementById('main').appendChild(paraghraph);
    } else {
        addCourses(foundCourses);
    }
}

async function main() {
    const response = await fetch("https://codeconcourses.duckdns.org:5555/getCourses");
    courses = await response.json(); // Await here to get the JSON data
    addCourses(courses);
}

main();