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
    // x is reusable since time is static regardless of currency

    // y is price

    // init vars
    var yavgUSD = 0;
    var yavgEUR = 0;
    var yavgCHF = 0;

    var numeratorUSD = 0;
    var denominatorUSD = 0;
    
    var numeratorEUR = 0;
    var denominatorEUR = 0;

    var numeratorCHF = 0;
    var denominatorCHF = 0;

    // loop through data. setup and solve for y-intercept
    for(var i in data) {
        if(i <= 766) {
            data[i]['currency'] = 'USD';
            yavgUSD += data[i]['average'];
        }
        else if (i >= 767 && i <= 1533) {
            data[i]['currency'] = 'CHF';
            yavgCHF += data[i]['average'];
        }
        else if (i >= 1534 && i <= 2300) {
            data[i]['currency'] = 'EUR';
            yavgEUR += data[i]['average'];
        }
    }
    yavgUSD /= 767;
    yavgCHF /= (1533 - 767 + 1);
    yavgEUR /= (2300 - 1534 + 1);

    // solving for line of best fit (lobf)
    // lobf for USD
    for(var j = 0; j <= 766; j++) {
        numeratorUSD += ((j + 1 - yavgUSD) * (data[j]['average'] - yavgUSD));
        denominatorUSD += ((j + 1 - xavg) * (j + 1 - xavg));
    }
    var slopeUSD = numeratorUSD / denominatorUSD;
    var interceptUSD = yavgUSD - (slopeUSD * xavg);
    var lobfUSD = `y = ${slopeUSD}x + ${interceptUSD}`;

    // console.log(`line of best fit for USD: ${lobfUSD}`)
    document.getElementById('lobfUSD').innerHTML = lobfUSD;

    // lobf for EUR
    for(var k = 767; k <= 1533; k++) {
        var count = k - 766;
        
        numeratorEUR += ((count - yavgEUR) * (data[k]['average'] - yavgEUR));
        denominatorEUR += ((count - xavg) * (count - xavg));
    }
    var slopeEUR = numeratorEUR / denominatorEUR;
    var interceptEUR = yavgEUR - (slopeEUR * xavg);
    var lobfEUR = `y = ${slopeEUR}x + ${interceptEUR}`;

    // console.log(`line of best fit for EUR: ${lobfEUR}`);
    document.getElementById('lobfEUR').innerHTML = lobfEUR;

    // lobf for CHF
    for(var l = 1534; l <= 2300; l++) {
        var count = l - 1533;

        numeratorCHF += ((count - yavgCHF) * (data[l]['average'] - yavgCHF));
        denominatorCHF += ((count - xavg) * (count - xavg));
    }
    var slopeCHF = numeratorCHF / denominatorCHF;
    var interceptCHF = yavgCHF - (slopeCHF * xavg);
    var lobfCHF = `y = ${slopeCHF}x + ${interceptCHF}`;

    // console.log(`line of best fit for CHF: ${lobfCHF}`);
    document.getElementById('lobfCHF').innerHTML = lobfCHF;

    // end solving for lobf
    
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

