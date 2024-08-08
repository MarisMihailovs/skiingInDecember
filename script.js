import { data } from "./data.js";

var backgroundDiv = document.querySelector('.hero');
backgroundDiv.style.backgroundPosition = 'center 30%';



document.addEventListener('scroll', function () {
    var scrollPosition = window.scrollY;
    backgroundDiv.style.backgroundPosition = 'center ' + ((scrollPosition * 0.1) + 30) + '%';

});

let span = document.getElementById("heroMonth");

// Get the text content of the span
let text = span.textContent;

// Split the text into individual letters
let letters = text.split("");

// Clear the span content
span.textContent = "";

letters.forEach((letter, idx) => {
    let letterSpan = document.createElement("span");
    letterSpan.textContent = letter;
    letterSpan.classList.add("heroMonth"); // Add a class to each letter span
    letterSpan.style.animationDelay = `${idx * 200}ms`; // Set different delay for each letter
    span.appendChild(letterSpan);
});

const container = d3.select('.data');

function updateCards(data) {
    container.html(''); // Clear existing cards

    data.forEach(d => {
        const card = container.append('div').attr('class', 'card');
        card.append('img').attr('class', 'img').attr('src', `${d.image}`);
        card.append('h3').text(d.name);

        const h3 = card.select('h3');

        if (Array.isArray(d.flag)) {
            d.flag.forEach(flag => {
                h3.append('img').attr('src', flag).attr('alt', `${d.country} flag`);
            });
        } else {
            h3.append('img').attr('src', d.flag).attr('alt', `${d.country} flag`);
        }

        card.append('p').attr('class', 'price').text(`Ski Pass Price: €${d.skiPassPrice6Days}`);
        card.append('p').attr('class', 'price').text(`Avg. Hotel Price (6 Days): €${d.averageHotelPrice6Days}`);
        card.append('p').attr('class', 'details').text(`Total Slope Length: ${d.totalSlopeKm} km`);
        card.append('p').attr('class', 'details').text(`Green Slopes: ${d.greenSlopeKm} km, Blue Slopes: ${d.blueSlopeKm} km`);
        card.append('p').attr('class', 'details').text(`Red Slopes: ${d.redSlopeKm} km, Black Slopes: ${d.blackSlopeKm} km`);
        card.append('p').attr('class', 'details').text(`Altitude: ${d.altitude}`);
        card.append('p').attr('class', 'details').text(`Closest Airport: ${d.closestAirport} (${d.distanceFromAirportKm} km)`);
        card.append('p').attr('class', 'details').text(`Transfer Options: ${d.transferOptions.join(', ')}`);
        card.append('p').attr('class', 'description').text(d.description);
    });
}

function sortData(criteria) {
    if (criteria === 'averageHotelPrice6Days' || criteria === 'skiPassPrice6Days' || criteria === 'distanceFromAirportKm') {
        data.sort((a, b) => a[criteria] - b[criteria]);
    } else {
        data.sort((a, b) => b[criteria] - a[criteria]);
    }
    updateCards(data);
}


d3.select('#sort-options').on('change', function () {
    const selectedOption = d3.select(this).property('value');
    sortData(selectedOption);
});

// Initial load
updateCards(data);
sortData('totalSlopeKm');


// slope chart
// Set up the dimensions and margins of the graph
const margin = { top: 40, right: 30, bottom: 50, left: 200 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select(".slopeChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// List of subgroups
const subgroups = ["greenSlopeKm", "blueSlopeKm", "redSlopeKm", "blackSlopeKm"];

// List of groups
const groups = data.map(d => d.name);

// Add X axis
const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.totalSlopeKm)])
    .range([0, width]);
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleBand()
    .domain(groups)
    .range([0, height])
    .padding([0.2]);
svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "14px"); // Increase the font size for resort names

// Color palette
const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['green', 'blue', 'red', 'black']);

// Stack the data per subgroup
const stackedData = d3.stack()
    .keys(subgroups)
    (data);

// Show the bars
svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(d => d)
    .enter().append("rect")
    .attr("y", d => y(d.data.name))
    .attr("x", d => x(d[0]))
    .attr("width", d => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth())
    .append("title") // Add tooltips
    .text(d => `${d[1] - d[0]} km`);

// Add labels
svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(d => d)
    .enter().append("text")
    .attr("x", d => x(d[1]) - (x(d[1]) - x(d[0])) / 2)
    .attr("y", d => y(d.data.name) + y.bandwidth() / 2 + 5)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "white")
    .text(d => `${d[1] - d[0]} km`);

//price chart

// Create the price chart
// Create the price chart
const priceMargin = { top: 40, right: 30, bottom: 50, left: 150 },
    priceWidth = 1000 - priceMargin.left - priceMargin.right,
    priceHeight = 600 - priceMargin.top - priceMargin.bottom;

const priceSvg = d3.select(".priceChart")
    .append("svg")
    .attr("width", priceWidth + priceMargin.left + priceMargin.right)
    .attr("height", priceHeight + priceMargin.top + priceMargin.bottom)
    .append("g")
    .attr("transform", `translate(${priceMargin.left},${priceMargin.top})`);

// List of groups for the price chart
const priceGroups = data.map(d => d.name);

// Add X axis for price chart
const priceX = d3.scaleBand()
    .domain(priceGroups)
    .range([0, priceWidth])
    .padding([0.2]);
priceSvg.append("g")
    .attr("transform", `translate(0,${priceHeight})`)
    .call(d3.axisBottom(priceX))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "12px"); // Increase the font size for resort names

// Add Y axis for price chart
const priceY = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.skiPassPrice6Days, d.averageHotelPrice6Days))])
    .range([priceHeight, 0]);
priceSvg.append("g")
    .call(d3.axisLeft(priceY));

// Color palette for price chart
const priceColor = d3.scaleOrdinal()
    .domain(["skiPassPrice6Days", "averageHotelPrice6Days"])
    .range(['#1f77b4', '#ff7f0e']);

// Bars for ski pass prices
priceSvg.selectAll(".bar.skiPass")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar skiPass")
    .attr("x", d => priceX(d.name))
    .attr("y", d => priceY(d.skiPassPrice6Days))
    .attr("width", priceX.bandwidth() / 2)
    .attr("height", d => priceHeight - priceY(d.skiPassPrice6Days))
    .attr("fill", priceColor("skiPassPrice6Days"))
    .append("title")
    .text(d => `Ski Pass Price: €${d.skiPassPrice6Days}`);

// Bars for average hotel prices
priceSvg.selectAll(".bar.hotel")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar hotel")
    .attr("x", d => priceX(d.name) + priceX.bandwidth() / 2)
    .attr("y", d => priceY(d.averageHotelPrice6Days))
    .attr("width", priceX.bandwidth() / 2)
    .attr("height", d => priceHeight - priceY(d.averageHotelPrice6Days))
    .attr("fill", priceColor("averageHotelPrice6Days"))
    .append("title")
    .text(d => `Hotel Price: €${d.averageHotelPrice6Days}`);

//distance chart

function createDistanceChart(data, containerSelector) {
    // Set up dimensions and margins for the chart
    const width = 1000;
    const height = 600;
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const centerX = width / 2;
    const centerY = height / 2;

    // Append the svg object to the specified container
    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate maximum distance for scaling
    const maxDistance = d3.max(data, d => d.distanceFromAirportKm);

    // Create a scale for distances
    const distanceScale = d3.scaleLinear()
        .domain([0, maxDistance])
        .range([0, Math.min(width, height) / 2 - margin.top]);

    // Draw central circle for the airport (firstly drawn to ensure it is below the lines)


    // Function to calculate position based on angle and distance
    function calculatePosition(angle, distance) {
        return {
            x: centerX + distance * Math.cos(angle),
            y: centerY + distance * Math.sin(angle)
        };
    }

    // Calculate angle for each resort
    const angleScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 2 * Math.PI]);

    // Draw lines and resort circles
    data.forEach((d, i) => {
        const angle = angleScale(i);
        const distance = distanceScale(d.distanceFromAirportKm);
        const pos = calculatePosition(angle, distance);

        // Draw line
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", pos.x)
            .attr("y2", pos.y)
            .attr("stroke", "black");

        // Draw resort circle
        svg.append("circle")
            .attr("cx", pos.x)
            .attr("cy", pos.y)
            .attr("r", 10)  // Increased size of the resort circles
            .style("fill", "black");

        // Add resort label
        svg.append("text")
            .attr("x", pos.x)
            .attr("y", pos.y)
            .attr("dx", (pos.x > centerX) ? "0.5em" : "-0.5em")
            .attr("dy", (pos.y > centerY) ? "1.5em" : "-0.5em")
            .style("text-anchor", (pos.x > centerX) ? "start" : "end")
            .style("font-size", "12px")
            .text(d.name);
    });
    const airportGroup = svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

    airportGroup.append("circle")
        .attr("r", 60)  // Increased size of the central circle
        .style("fill", "lightgray")
        .style("stroke", "black");


    airportGroup.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .style("font-size", "26px")
        .text("Airport");
}


// Call the function to create the distance chart
createDistanceChart(data, '.distanceChart');