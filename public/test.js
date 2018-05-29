// display parameters
var margin = {
    top: 80,
    right: 80,
    bottom: 80,
    left: 80
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// scales parameters stuff
var x = d3.time.scale()
        .range([0, width]),
    y = d3.scale.linear()
        .range([height, 0]),
    xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(-height)
        .tickSubdivide(true),
    yAxis = d3.svg.axis()
        .scale(y)
        .ticks(4)
        .orient('right');

var area = d3.svg.area()
    .interpolate('monotone')
    .x((d) => {
        return x(d.time);
    })
    .y0(height)
    .y1((d) => {
        return y(d.average);
    });

var line = d3.svg.line()
    .interpolate('monotone')
    .x((d) => {
        return x(d.time);
    })
    .y((d) => {
        return y(d.average);
    });

d3.csv('data.csv', type, (err, data) => {
    var xavg = 1;
    // x is time/date
    var yavg = 0;
    // y is price
    var numerator = 0;
    var denominator = 0;
    for(var i in data) {
        if(i <= 766) {
            data[i]['currency'] = 'USD';
            yavg += data[i]['average'];
        }
        else if (i >= 767 && i <= 1533) {
            data[i]['currency'] = 'CHF';
        }
        else if (i >= 1534 && i <= 2300) {
            data[i]['currency'] = 'EUR';
        }
    }
    yavg /= 766;
    // console.log(yavg);
    for(var j = 0; j <= 766; j++) {
        numerator += ((j+1-yavg) * (data[j]['average'] - yavg));
        denominator += ((j+1-xavg) * j+1-xavg);
    }
    // console.log(numerator);
    // console.log(denominator);
    var slope = numerator / denominator;
    // console.log(slope);
    var intercept = yavg - (slope * xavg);
    // console.log(intercept);
    var ulobf = `y = ${slope}x + ${intercept}`;
    console.log(`line of best fit for USD: ${ulobf}`)

    document.getElementById('ulobf').innerHTML = ulobf;





    
    var USD = data.filter((d) => {
        return d.currency == 'USD';
    });
    // console.log(USD);

    var CHF = data.filter((d) => {
        return d.currency == 'CHF';
    });
    // console.log(CHF);

    var EUR = data.filter((d) => {
        return d.currency == 'EUR';
    });
    // console.log(EUR);

    x.domain(
        d3.extent(data, (d) => {
            return d.time;
        })
    );
    y.domain(
        d3.extent(data, (d) => {
            return d.average;
        })
    );

    var svg = d3.select('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // append clip path
    // is this the "curtain?"
    svg.append('clipPath')
        .attr('id', 'clip')
        .append('rect')
            .attr('height', height)
            .attr('width', width);

    // append x axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    // append y axis
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxis);

    // eye candy
    var colors = d3.scale.category10();

    svg.selectAll('.line')
        .data([USD, CHF, EUR])
        .enter()
        .append('path')
            .attr('class', 'line')
            .style('stroke', (d) => {
                return colors(Math.random() * 50);
            })
            .attr('clip-path', 'url(#clip')
            .attr('d', (d) => {
                return line(d);
            });

    var curtain = svg.append('rect')
        .attr('y', -1 * height)
        .attr('x', -1 * width)
        .attr('height', height)
        .attr('width', width)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .style('fill', '#ffffff');

    // animation stuff
    var t = svg.transition()
        .delay(400)
        .duration(5000)
        .ease('linear')
        .each('end', () => {
            d3.select('line.guide')
                .transition()
                .style('opacity', 0)
                .remove()
        });

    t.select('rect.curtain')
        .attr('width', 0);
    t.select('line.guide')
        .attr('transform', `translate(${width}, 0)`)
});

// parsing date for use in d3.csv above
function type(d) {
    d.time = Date.parse(d.time);
    d.average = +d.average;

    return d;
};

