        var map = L.map('map').setView([35.731447, 139.709856], 16);

        mapLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + 'Contributors ',
            maxZoom: 19,
        }).addTo(map);

        var svg = d3.select(map.getPanes().overlayPane).append('svg'),
            g = svg.append('g').attr('class', 'leaflet-zoom-hide');

        var div = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('float', 'left')
            .style('opacity', 0);

        d3.json('tOutline.json', function(error, collection) {
            if (error) throw error;

            d3.csv('park.csv', function(error, point) {
                if (error) throw error;


                //console.log(collection);

                var transform = d3.geo.transform({
                        point: projectPoint
                    }),
                    path = d3.geo.path().projection(transform);

                var feature = g.selectAll('path')
                    .data(collection.features)
                    .enter().append('path');


                map.on('viewreset', reset);
                reset();

                function reset() {

                    bounds = path.bounds(collection);
                    var topLeft = bounds[0],
                        bottomRight = bounds[1];

                    svg.attr('width', bottomRight[0] - topLeft[0])
                        .attr('height', bottomRight[1] - topLeft[1])
                        .style('left', topLeft[0] + "px")
                        .style('top', topLeft[1] + "px");

                    g.attr('transform', 'translate(' + -topLeft[0] + "," + -topLeft[1] + ')');

                    feature.attr('d', path)
                        .style('stroke', 'steelblue')
                        .style('stroke-width', '0.5px')
                        .style('fill-opacity', .15)
                        .style('fill', 'steelblue')
                        .on('click', function(d) {
                            div.transition().duration(500)
                                .style('opacity', 0);
                        });


                }

                function projectPoint(x, y) {
                    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                    this.stream.point(point.x, point.y);
                }


                point.forEach(function(d) {
                    d.Lat = +d.Lat,
                        d.Lng = +d.Lng;
                    d.LatLngObj = new L.LatLng(d.Lat, d.Lng);
                });

                var circle = g.selectAll('circle')
                    .data(point)
                    .enter()
                    .append('circle')
                    .attr('class', 'dots')
                    .attr({
                        'opacity': .7,
                        'fill': 'red',
                        'r': 16
                    })
                    .on('click', function(d) {
                        d3.select(this).transition()
                            .duration(400)
                            .ease('elastic')
                            .attr('r', 35)
                            .transition()
                            .duration(100)
                            .ease('elastic')
                            .attr('r', 16)

                        div.transition().duration(200)
                            .style('opacity', .9);
                        //div.html('<b>' + d.name + '公園: </b>' + d.address);
                        div.html('<table id="tooltip_table"><tr><td><b>' +
                            d.name + '公園 </b></td><td rowspan="2">' +
                            d.address + '</td></tr><tr><td><img id="tooltip_img" src="images/' +
                            d.image + '.jpg"/></td></tr></table>');
                    });


                map.on('viewreset', update);

                update();


                function update() {
                    circle.attr('transform', function(d) {
                        return 'translate(' +
                            map.latLngToLayerPoint(d.LatLngObj).x + ',' +
                            map.latLngToLayerPoint(d.LatLngObj).y + ')';
                    });
                };


            });
        });

        function setCenter() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        var data = position.coords;

                        var lat = data.latitude;
                        var lng = data.longitude;

                        marker = L.marker([lat, lng]).addTo(map);

                        map.setView([lat, lng], 18);
                    });
            } else {
                alert("あなたの端末では、現在位置を取得できません。");
            };
        };