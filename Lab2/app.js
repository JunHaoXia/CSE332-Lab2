d3.csv('youtube_data.csv').then(data => {
    console.log(data)
    const variableNames = Object.keys(data[0]);
    // Create the dropdown variables
    const dropdown = d3.select('#variable-dropdown');
    variableNames.forEach(variable => {
        dropdown.append('option').attr('value', variable).text(variable);
    });

    dropdown.on('change', function() {
        const selectedVariable = this.value;
        const selectedData = data.map(d => d[selectedVariable]);
        // Clear all charts on change
        d3.select('#histogram-container').selectAll('*').remove();
        d3.select('#barchart-container').selectAll('*').remove();
        d3.select('#piechart-container').selectAll('*').remove();
        d3.select('#scatterplot-container').selectAll('*').remove();
        //Display proper charts depending on categories selected
        console.log(selectedData);
        if (!isNaN(selectedData[0])) {
            console.log("If varibles are integers")
            createHistogram(selectedData, selectedVariable);
            getScatterPlot(data, selectedVariable);
        } else {
            console.log("If varibles are not integers")
            getBarChart(selectedData, selectedVariable);
            getPieChart(selectedData);
        }
    });
    function getBarChart(data, category) {
        // Count all the categories
        const categoryCounts = {};
        data.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        // Map the categories and their total occurences
        const barChartData = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
        console.log("BarChartData(Counted)")
        console.log(barChartData);
        createBarChart(barChartData, category);
    }
    function createBarChart(data, category) {
        // Define the borders for the bar chart
        // All chart sizes should be the same
        const svgWidth = 1800;
        const svgHeight = 900;
        const margin = { top: 30, right: 30, bottom: 30, left: 50 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;
        // Select the proper container and save it as a variable
        const svg = d3.select('#barchart-container')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        // Scaling the x axis 
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([margin.left, chartWidth])
        // Scaling the y axis 
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data.map(d => d.count))])
            .range([chartHeight, margin.top]);
    
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        // The borders of the chart
        svg.append('g')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis);
    
        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yAxis);
        // Add x-axis label
        svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "end")
            .attr("x", (chartWidth/2))
            .attr("y", chartHeight + margin.top + 20)
            .text(category);
        // Add y-axis label
        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", margin.top - chartHeight/2)
            .attr("y", 20)
            .text("Amount");
        // The columns
        svg.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('x', d => xScale(d.category))
            .attr('y', d => yScale(d.count))
            .attr('width', xScale.bandwidth())
            .attr('height', d => chartHeight - yScale(d.count))
            .style('fill', 'steelblue');
    }

    function createHistogram(data, category) {
        console.log(data)
        // Define the borders for the histogram
        const svgWidth = 1800;
        const svgHeight = 900;
        const margin = { top: 30, right: 30, bottom: 30, left: 50 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;
        // Clean data up to prevent nan values from appearing
        data = data.filter(value => !isNaN(value));
        
        console.log("Min:")
        console.log(Math.min(...data))
        console.log("Max:")
        console.log(Math.max(...data))
        // Select the proper container and save it as a variable
        const svg = d3.select('#histogram-container')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        // Scaling the x axis 
        const xScale = d3.scaleLinear()
            .domain([Math.min(...data), Math.max(...data)])
            .range([margin.left, chartWidth]);

        console.log(xScale)
        // Minor tweaks to number of bars to allow dates to be seen easier
        let num_bars;
        if (Math.max(...data) > 50){
            num_bars = 20;
        }
        else{
            num_bars = Math.max(...data);
        }
        // Calling the histogram function to a variable
        const histogram = d3.histogram()
            .domain(xScale.domain())
            .thresholds(xScale.ticks(num_bars));
        // Add the data to the function stored earlier
        const bins = histogram(data);
        // Scaling the y axis 
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([chartHeight, margin.top]);
    
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        // Appending all the values to the container
        svg.append('g')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis);
    
        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yAxis);
        // Add x-axis label
        svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "end")
            .attr("x", (chartWidth/2))
            .attr("y", chartHeight + margin.top + 20)
            .text(category);
        // Add y-axis label
        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", margin.top - chartHeight/2)
            .attr("y", 20)
            .text("Amount");
        // Creating the bars
        svg.selectAll('rect')
            .data(bins)
            .enter().append('rect')
            .attr('x', d => xScale(d.x0) + 1)
            .attr('width', d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr('y', d => yScale(d.length))
            .attr('height', d => chartHeight - yScale(d.length))
            .style('fill', 'steelblue');
    }

    function getPieChart(data) {
        console.log("Inside getPieChart function")
        console.log(data)
        const total = data.length;
        
        // Count occurrences of each category
        const categoryCounts = data.reduce((counts, category) => {
            counts[category] = (counts[category] || 0) + 1;
            return counts;
        }, {});
        
        // Convert counts to percentages
        const categoryPercentages = {};
        for (const category in categoryCounts) {
            categoryPercentages[category] = (categoryCounts[category] / total) * 100;
        }
        console.log(categoryPercentages)
        // 'categoryPercentages' now contains the percentages for each category
        const pieData = Object.entries(categoryPercentages).map(([label, value]) => ({ label, value }));
        createPieChart(pieData);
    }

    function createPieChart(data) {
        // Sort the data by value in descending order
        data.sort((a, b) => b.value - a.value);

        // Keep the top 5 values and group the rest into 'others'
        const top5 = data.slice(0, 5);
        const others = data.slice(5);

        // If there are 'others', calculate their total value
        const othersTotal = others.length > 0 ? d3.sum(others, d => d.value) : 0;

        // If there are 'others', add them to the 'top5' with a label 'Others'
        if (othersTotal > 0) {
            top5.push({ label: 'Others', value: othersTotal });
        }
        // Define the borders for the pie chart
        const svgWidth = 1000;
        const svgHeight = 600;
        const radius = Math.min(svgWidth, svgHeight) / 2;
    
        const svg = d3.select('#piechart-container')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
    
        const g = svg.append('g')
            .attr('transform', `translate(${svgWidth / 2},${svgHeight / 2})`);
        // Define a color scale for the pie chart slices
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        // Create a pie layout
        const pie = d3.pie()
            .sort(null)
            .value(d => d.value);
        // Generate the pie chart of the top 5 data values
        const pieData = pie(top5);
        // Define an arc generator
        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);
        // Create pie chart slices
        const slice = g.selectAll('.arc')
            .data(pieData)
            .enter().append('g')
            .attr('class', 'arc');
        // Add the pie slices to the chart
        slice.append('path')
            .attr('d', arc)
            .style('fill', (d, i) => color(i));
        // Add labels to the pie chart
        slice.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .text(d => d.data.label);
        // Add a legend
        const legend = svg.selectAll('.legend')
            .data(data.map(d => d.label))
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(0,${i * 20})`);
        legend.append('rect')
            .attr('x', svgWidth - 36)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', (d, i) => color(i));
        legend.append('text')
            .attr('x', svgWidth - 36)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(d => d);
    }
    function getScatterPlot(data, variablex) {
        console.log("variable x chosen:")
        console.log(variablex);
        const scatterVariableNames = Object.keys(data[0]);
        // Create the dropdown variables
        const scatterDropdown = d3.select('#scatterplot-dropdown');
        scatterVariableNames.forEach(variable => {
            scatterDropdown.append('option').attr('value', variable).text(variable);
        });

        scatterDropdown.on('change', function() {
            const selectedScatterVariable = this.value;
            // Clear scatterplot on change
            d3.select('#scatterplot-container').selectAll('*').remove();
            //Display proper charts depending on categories selected
            console.log("variable y chosen:")
            console.log(selectedScatterVariable)
            createScatterPlot(data, variablex, selectedScatterVariable);
        });
    }
    function createScatterPlot(data, xvalue, yvalue) {
        // Define the borders for the scatter plot
        const svgWidth = 1800;
        const svgHeight = 900;
        const margin = { top: 30, right: 30, bottom: 30, left: 100 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;
        // Select the proper container and save it as a variable
        const svg = d3.select('#scatterplot-container')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        // Obtain the x and y values based on varible names
        const selectedXData = data.map(d => d[xvalue]);
        const selectedYData = data.map(d => d[yvalue]);
        // Clean data up to prevent nan values from appearing
        XData = selectedXData.filter(value => !isNaN(value));
        YData = selectedYData.filter(value => !isNaN(value));
        
        // Scaling the x axis using given x varible name
        const xScale = d3.scaleLinear()
            .domain([Math.min(...XData), Math.max(...XData)])
            .range([margin.left, chartWidth]);
        // Scaling the y axis using given y varible name
        const yScale = d3.scaleLinear()
            .domain([Math.min(...YData), Math.max(...YData)])
            .range([chartHeight, margin.top]);
    
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        // Appending all the values to the container
        svg.append('g')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis);

        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yAxis);
        // Add x-axis label
        svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "end")
            .attr("x", (chartWidth/2))
            .attr("y", chartHeight + margin.top + 20)
            .text(xvalue);
        // Add y-axis label
        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", margin.top - chartHeight/2)
            .attr("y", 20)
            .text(yvalue);
        // Creating the plots
        svg.selectAll('circle')
            .data(data)
            .enter().append('circle')
            .attr('cx', d => xScale(d[xvalue]))
            .attr('cy', d => yScale(d[yvalue]))
            .attr('r', 5)
            .style('fill', 'steelblue');
    }
});