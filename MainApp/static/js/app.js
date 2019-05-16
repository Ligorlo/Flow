
    let width = 960,
        height = 700,
        border = 10,
        colors = d3.scale.category10(),
        bordercolor = '#40a4ed';

    let svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height)
        .attr("border", border)

    let borderPath = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width)
        .style("stroke", bordercolor)
        .style("fill", "none")
        .style("stroke-width", border);

    let nodes = [
            {id: 0, reflexive: false},
            {id: 1, reflexive: true},
            {id: 2, reflexive: false}
        ],
        links = [
            {source: nodes[0], target: nodes[1], left: false, right: true, type: 12},
            {source: nodes[1], target: nodes[2], left: false, right: true, type: 3}
        ];
    let lastNodeId = 2;

    let force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(150)
        .charge(-500)
        .on('tick', tick);

    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');


    let drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');


    let path = svg.append('svg:g').selectAll('path'),
        circle = svg.append('svg:g').selectAll('g'),
        path_labels = svg.append('svg:g').selectAll('text.path');

// mouse event vars
    let selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;

    function resetMouseVars() {
        mousedown_node = null;
        mouseup_node = null;
        mousedown_link = null;
    }

// update force5 layout (called automatically each iteration)
    function tick() {
        // draw directed edges with proper padding from node centers
        path.attr('d', function (d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = d.left ? 17 : 12,
                targetPadding = d.right ? 17 : 12,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
        path_labels
            .attr("x", function (d) {
                return (d.source.x + d.target.x) / 2
            })
            .attr("y", function (d) {
                return (d.source.y + d.target.y) / 2
            })

    }

// update graph (called when needed)
    function restart() {
        // path (link) group
        path = path.data(links);

        // update existing links5
        path.classed('selected', function (d) {
            return d === selected_link;
        })
            .style('marker-start', function (d) {
                return d.left ? 'url(#start-arrow)' : '';
            })
            .style('marker-end', function (d) {
                return d.right ? 'url(#end-arrow)' : '';
            });


        // add new links5
        path.enter().append('svg:path')
            .attr('class', 'link')
            .classed('selected', function (d) {
                return d === selected_link;
            })
            .style('marker-start', function (d) {
                return d.left ? 'url(#start-arrow)' : '';
            })
            .style('marker-end', function (d) {
                return d.right ? 'url(#end-arrow)' : '';
            })
            .on('mousedown', function (d) {
                if (d3.event.ctrlKey) return;

                // select link
                mousedown_link = d;
                if (mousedown_link === selected_link) selected_link = null;
                else selected_link = mousedown_link;
                selected_node = null;
                restart();
            });


        // remove old links5
        path.exit().remove();

        path_labels = path_labels.data(links);
        path_labels.enter()
            .append("svg:text")
            .attr("class", "path")
            .style("text-anchor", "middle")
            .attr("fill", "red")
            .text(function (d) {
                return d.type
            });

        path_labels.exit()
            .remove();


        // circle (node) group
        // NB: the function arg is crucial here! nodes5 are known by id, not by index!
        circle = circle.data(nodes, function (d) {
            return d.id;
        });

        // update existing nodes5 (reflexive & selected visual states)
        circle.selectAll('circle')
            .style('fill', function (d) {
                return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
            })
            .classed('reflexive', function (d) {
                return d.reflexive;
            });

        // add new nodes5
        var g = circle.enter().append('svg:g');

        g.append('svg:circle')
            .attr('class', 'node')
            .attr('r', 12)
            .style('fill', function (d) {
                return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
            })
            .style('stroke', function (d) {
                return d3.rgb(colors(d.id)).darker().toString();
            })
            .classed('reflexive', function (d) {
                return d.reflexive;
            })
            .on('mouseover', function (d) {
                if (!mousedown_node || d === mousedown_node) return;
                // enlarge target node
                d3.select(this).attr('transform', 'scale(1.1)');
            })
            .on('mouseout', function (d) {
                if (!mousedown_node || d === mousedown_node) return;
                // unenlarge target node
                d3.select(this).attr('transform', '');
            })
            .on('mousedown', function (d) {
                if (d3.event.ctrlKey) return;

                // select node
                mousedown_node = d;
                if (mousedown_node === selected_node) selected_node = null;
                else selected_node = mousedown_node;
                selected_link = null;

                // reposition drag line
                drag_line
                    .style('marker-end', 'url(#end-arrow)')
                    .classed('hidden', false)
                    .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

                restart();
            })
            .on('mouseup', function (d) {
                if (!mousedown_node) return;

                // needed by FF
                drag_line
                    .classed('hidden', true)
                    .style('marker-end', '');

                // check for drag-to-self
                mouseup_node = d;
                if (mouseup_node === mousedown_node) {
                    resetMouseVars();
                    return;
                }

                // unenlarge target node
                d3.select(this).attr('transform', '');

                // add link to graph (update if exists)
                // NB: links5 are strictly source < target; arrows separately specified by booleans
                var source, target, direction;
                source = mousedown_node;
                target = mouseup_node;
                direction = 'right';

                var link;
                link = links.filter(function (l) {
                    return (l.source === source && l.target === target);
                })[0];

                if (link) {
                    link[direction] = true;
                } else {
                    var relationship = prompt("Please enter relationship", 'relationship');
                    link = {source: source, target: target, left: false, right: false, type: relationship};
                    link[direction] = true;

                    links.push(link);
                }

                // select new link
                selected_link = link;
                selected_node = null;
                restart();
            });

        // show node IDs
        g.append('svg:text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('class', 'id')
            .text(function (d) {
                return d.id;
            });

        // remove old nodes5
        circle.exit().remove();

        // set the graph in motion
        force.start();
    }

    function mousedown() {
        // prevent I-bar on drag
        //d3.event.preventDefault();

        // because :active only works in WebKit?
        svg.classed('active', true);

        if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;

        // insert new node at point

        const point = d3.mouse(this);
        const node = {id: ++lastNodeId, reflexive: false, x: point[0], y: point[1], capacity: 0};
        nodes.push(node);


        restart();
    }

    function mousemove() {
        if (!mousedown_node) return;

        // update drag line
        drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

        restart();
    }

    function mouseup() {
        if (mousedown_node) {
            // hide drag line
            drag_line
                .classed('hidden', true)
                .style('marker-end', '');
        }

        // because :active only works in WebKit?
        svg.classed('active', false);

        // clear mouse event vars
        resetMouseVars();
    }

    function spliceLinksForNode(node) {
        var toSplice = links.filter(function (l) {
            return (l.source === node || l.target === node);
        });
        toSplice.map(function (l) {
            links.splice(links.indexOf(l), 1);
        });
    }

// only respond once per keydown

    function keydown() {
        d3.event.preventDefault();

        if (lastKeyDown !== -1) return;
        lastKeyDown = d3.event.keyCode;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle.call(force.drag);
            svg.classed('ctrl', true);
        }

        if (!selected_node && !selected_link) return;
        switch (d3.event.keyCode) {
            case 8: // backspace
            case 46: // delete
                if (selected_node) {
                    nodes.splice(nodes.indexOf(selected_node), 1);
                    spliceLinksForNode(selected_node);
                } else if (selected_link) {
                    links.splice(links.indexOf(selected_link), 1);
                }
                selected_link = null;
                selected_node = null;
                restart();
                break;
            case 66: // B
                if (selected_link) {
                    // set link direction to both left and right
                    selected_link.left = true;
                    selected_link.right = true;
                }
                restart();
                break;
            case 76: // L
                if (selected_link) {
                    // set link direction to left only
                    selected_link.left = true;
                    selected_link.right = false;
                }
                restart();
                break;
            case 82: // R
                if (selected_node) {
                    // toggle node reflexivity
                    selected_node.reflexive = !selected_node.reflexive;
                } else if (selected_link) {
                    // set link direction to right only
                    selected_link.left = false;
                    selected_link.right = true;
                }
                restart();
                break;
        }
    }

    function keyup() {
        lastKeyDown = -1;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle
                .on('mousedown.drag', null)
                .on('touchstart.drag', null);
            svg.classed('ctrl', false);
        }
    }

// app starts here
    svg.on('mousedown', mousedown)
        .on('mousemove', mousemove)
        .on('mouseup', mouseup);
    d3.select(window)
        .on('keydown', keydown)
        .on('keyup', keyup);
    restart();

    let mas;
    let mas2; // матрица смежности
    let sink;
    let fromsink;

    function MyFunction() {
        var n = nodes[nodes.length - 1].id + 1;
        mas = new Array(n);
        mas2 = new Array(n);
        sink = new Array(n);
        fromsink = new Array(n);
        for (var i = 0; i < n; i++) {
            mas[i] = new Array(n);
            mas2[i] = new Array(n);
            sink[i] = -1;
            fromsink[i] = -1;
        }
        for (var i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                mas[i][j] = 0;
                mas2[i][j] = 0;
            }
        }
        for (var i = 0; i < links.length; i++) {
            mas[links[i].source.id][links[i].target.id] = parseInt(links[i].type);
            sink[links[i].target.id] = links[i].source.id;
            fromsink [links[i].source.id] = links[i].target.id;
        }

        var res = 0;
        for (var i = 0; i < n; i++) {
            if (sink[i] == -1 && fromsink[i] != -1) {
                for (var k = 0; k < n; k++) {
                    if (fromsink[k] == -1 && sink[k] != -1) {
                        var h = 0;
                        do {
                            var used = new Array(n);
                            for (var j = 0; j < n; j++) {
                                used[j] = false;
                            }
                            h = dfs(i, k, Number.MAX_SAFE_INTEGER, used);
                            res += h;
                        }
                        while (h > 0)
                    }
                }
            }
        }
        document.getElementById("answer").innerHTML = res;
    }

    function dfs(node, sinkNode, now, used) {
        console.log(used);
        var number = nodes[nodes.length - 1].id + 1;
        if (node === sinkNode) {
            return now;
        }
        used[node] = true;
        for (var to = 0; to < number; to++) {
            var pairforward = Array(2);
            pairforward[0] = mas[node][to];
            pairforward[1] = mas2[node][to];
            var pairbackward = Array(2);
            pairbackward[0] = mas[to][node];
            pairbackward[1] = mas2[to][node];

            if (pairforward[0] == 0 && pairforward[1] == 0) continue;
            if (!used[to]) {
                if (pairforward[0] > pairforward[1]) {
                    var c = dfs(to, sinkNode, Math.min(now, pairforward[0] - pairforward[1]), used);
                    if (c > 0) {
                        mas2[node][to] += c;
                        mas2[to][node] -= c;
                        return c;
                    }
                }
            }
        }
        return 0;

}
    path_labels.attr("fill", "red")
        .attr("font-weight","bold");