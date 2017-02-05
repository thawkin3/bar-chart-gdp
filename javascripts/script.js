$(document).ready(function() {

	var url = "javascripts/GDP-data.json";
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var formatCurrency = d3.format("$,.2f");

	// GET THE GDP JSON DATA, THEN BUILD THE BAR CHART TO VISUALIZE IT
	d3.json(url, function(error, jsonData) {
		
		// IF THERE WAS AN ERROR, STOP NOW AND SHOW AN ERROR MESSAGE
		if (error) { 
			$(".errorMessage").show();
			return error;
		}
		
		var data = jsonData.data;
		var footnoteText = jsonData.description.split("\n");

		// ADD A FOOTNOTE TO THE BOTTOM OF THE CHART
		var notes = $(".notes");
			
		notes.append("<p>" + footnoteText[1] + "</p>");
		notes.append("<p>Notes: A Guide to the National Income and Product Accounts of the United States (NIPA) - <a href='http://www.bea.gov/national/pdf/nipaguid.pdf' target='_blank'>http://www.bea.gov/national/pdf/nipaguid.pdf</a></p>");

		// SET SOME STYLING VARIABLES FOR THE CHART
		var margin = {
			top: 5,
			right: 10,
			bottom: 30,
			left: 75
		};
		var width = 1000 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;
		var barWidth = Math.ceil(width / data.length);

		// DATES FOR THE SCALE
		var minDate = new Date(data[0][0]);
		var maxDate = new Date(data[274][0]);

		// X SCALE
		// TAKE THE MIN AND THE MAX DATE AND FIT IT TO THE WIDTH WE SET EARLIER
		// TIME.SCALE IS A MODIFCATION TO SCALE.LINEAR TO WORK WELL WITH DATES
		var x = d3.time.scale()
			.domain([minDate, maxDate])
			.range([0, width]);

		// Y SCALE
		// SET THE DOMAIN TO GO FROM 0 TO THE LARGEST VALUE OF OUR DATA SET
		// AND FIT IT TO OUR HEIGHT WE SET EARLIER
		// BUT IT'S FLIPPED BECAUSE WE GO FROM TOP-LEFT TO BOTTOM-RIGHT WITH SVG
		var y = d3.scale.linear()
			.domain([0, d3.max(data, function(d) {
										return d[1];
									}
								)
					]
			)
			.range([height, 0]);


		// X-AXIS
		// PUT THE X-AXIS ON THE BOTTOM AND FORMAT THE TICKS TO BE YEARS AT 5-YEAR INTERVALS
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.ticks(d3.time.years, 5);

		// Y-AXIS
		// PUT THE Y-AXIS ON THE LEFT AND FORMAT THERE TO BE 10 TICKS AND TO HAVE A $ PREFIX AND COMMAS
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10, "")
			.tickFormat(d3.format("$,.0f"));

		// TOOLTIP, CURRENTLY EMPTY AND HIDDEN
		var tooltip = d3.select(".mainContainer").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		// CREATE A SPACE FOR THE CHART TO BE FORMED
		var chart = d3.select(".chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// APPEND THE X-AXIS
		// HAVE IT START IN THE BOTTOM-LEFT CORNER
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// APPEND THE Y-AXIS
		// ALSO APPEND A LABEL FOR THE Y-AXIS, ROTATE IT 90 DEGREES, AND ANCHOR IT TO THE END
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.8em")
			.style("text-anchor", "end")
			.text("Gross Domestic Product, USD in billions");

		// CREATE THE BARS THAT MAKE UP OUR BAR CHART
		// GO THROUGH EACH DATA POINT
		// CREATE A RECTANGLE FOR IT
		// SET THE X COORDINATE FOR IT USING THE DATE IN MILLISECONDS
		// SET THE Y COORDINATE FOR IT USING THE GDP VALUE
		// SET THE HEIGHT OF THE BAR BY FINDING THE DISTANCE FROM THE TOP OF THE BAR TO THE 0 POINT
		// SET THE WIDTH OF THE BAR USING THE EQUALLY DIVIDED WIDTHS WE CALCULATED EARLIER
		// FINALLY, SET THE MOUSEOVER/MOUSEOUT EFFECTS FOR THE TOOLTIP, SETTING THE TOOLTIP CONTENT AND POSITION BASED ON THE BAR HOVERED OVER
		chart.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				return x(new Date(d[0]));
			})
			.attr("y", function(d) {
				return y(d[1]);
			})
			.attr("height", function(d) {
				return height - y(d[1]);
			})
			.attr("width", barWidth)
			.on("mouseover", function(d) {
				var rect = d3.select(this);
				rect.attr("class", "mouseover");
				var currentDateTime = new Date(d[0]);
				var year = currentDateTime.getUTCFullYear();
				var month = currentDateTime.getUTCMonth();
				var dollars = d[1];
				tooltip.transition()
					.duration(200)
					.style("opacity", 0.9);
				tooltip.html("<span class='amount'>" + formatCurrency(dollars) + " Billion </span><br><span class='year'>" + year + " - " + months[month] + "</span>")
					.style("top", (d3.event.pageY - 50) + "px");
				if (d3.event.offsetX - 80 < width/2) {
					tooltip.style("left", (d3.event.pageX + 5) + "px")
							.style("width", "126px");
				} else {
					if (dollars < 10000) {
						tooltip.style("left", (d3.event.pageX - 145) + "px")
							.style("width", "126px");
					} else {
						tooltip.style("left", (d3.event.pageX - 155) + "px")
							.style("width", "136px");
					}
				}
			})
			.on("mouseout", function() {
				var rect = d3.select(this);
				rect.attr("class", "mouseoff");
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

	});

});