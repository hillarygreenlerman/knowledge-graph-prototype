var testObjectives = [
    {'id':0, 'text':'Learner will be able to construct basic argument structure for functions.'},
    {'id':1, 'text':'Learner will be able to identify when to turn a section of code into a function.'},
    {'id':2, 'text':'Learner will be able to identify when to break a function into multiple functions.'},
    {'id':3, 'text':'Learner will be able to distinguish between mutable and immutable arguments.'},
    {'id':4, 'text':'Learner will be able to describe how to use variable arguments.'},
    {'id':5, 'text':'Learner will be able to explain the use of default arguments.'},
    {'id':6, 'text':'Learner will be able to dentify bugs related to argument ordering (keyword before positional, etc).'},
    {'id':7, 'text':'Learner will be able to differentiate between lambda expressions and nested functions.'},
    {'id':8, 'text':'Learner will be able to differentiate between functions and generators.'},
    {'id':9, 'text':'Learner will be able to create generators for use in data science experiments.'},
    {'id':10, 'text':'Learner will be able to assign functions to variables, returning functions from other functions, and passing functions as arguments'},
    {'id':11, 'text':'Learner will be able to inspect function metadata.'},
    {'id':12, 'text':'Learner will be able to use global and nonlocal to gain write access to variables defined outside the current scope.'},
    {'id':13, 'text':'Learner will be able to recognize decorator functions and explain what they do.'},
    {'id':14, 'text':'Learner will be able to compose new decorator functions.'},
    {'id':15, 'text':'Learner will be able to create decorator functions that take extra arguments.'},
    {'id':16, 'text':'Learner will be able to explain the value of functools.wraps() and functools.partial().'},
    {'id':17, 'text':'Learner will be able to create novel context managers.'},
    {'id':18, 'text':'Learner will be able to recognize how to use the contextlib.contextmanager() decorator.'},
    {'id':19, 'text':'Learner will be able to apply type hinting to functions.'},
    {'id':20, 'text':'Learner will be able to construct new type hinting values for custom data types.'},
    {'id':21, 'text':'Learner will be able to use mypy to check code for potential data type errors,'},
    {'id':22, 'text':'Learner will be able to understand best practices in function design, with respect to DRY, doing one thing, avoiding side effects, docstrings, scope, global variables, and code formatting.'},
    {'id':23, 'text':'Learner will be able to exercise the inspect module to discover information about function signatures.'}
    ]

var edges = [];

var maxWidth = 25;
var maxLines = 4;
var objWidth = 5 * maxWidth;
var objHeight= 18 * maxLines;
var svgWidth = 0.9 * window.innerWidth;
var svgHeight = 0.8 * window.innerHeight;
var svgPadding = 20;
var objPadding = 10;
var gridWidth = Math.floor( (svgWidth - (2 * svgPadding)) / (objWidth + objPadding) );
     
function splitText(s, maxWidth) {
    var splitIndex = s.slice(0, maxWidth).lastIndexOf(' ');
    if (splitIndex == -1) {
        if (splitIndex < maxWidth) {
            return [s, '']
        } else {
            return [s.slice(0, maxWidth - 1).concat('-'), s.slice(maxWidth,)]
        }        
    } else {
        if (splitIndex < maxWidth) {
            return [s.slice(0, splitIndex), s.slice(splitIndex + 1,)]
        } else {
            return [s.slice(0, maxWidth - 1).concat('-'), s.slice(maxWidth,)]
        }
    }
}

function wrapText(s, maxWidth, maxLines) {
    if (s.length > maxWidth) {
        var lines = []
        for (i=1; i <= maxLines; i+=1) {
            var split = splitText(s, maxWidth);
            if (i == maxLines & split[1].length > 0) {
                lines.push(split[0].concat('...'));
            } else {
                lines.push(split[0])
            }
            var s = split[1];
        }
        return lines
    } else {
        return [s]
    }
    
}

function setupGraph() {
    
    var svg = d3.select('#content')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // Append Arrow Head Definition
    svg.append('defs')
          .append('marker')
          .attr('id', "arrow")
          .attr('markerUnits', "strokeWidth")
          .attr('markerWidth', "12")
          .attr('markerHeight', "12")
          .attr('viewBox', "0 0 12 12")
          .attr('refX', "6")
          .attr('refY', "6")
          .attr('orient', "auto")
          .append('path')
          .attr('d', "M2,2 L10,6 L2,10 L2,2")
          .style('fill', 'black');
                 
    // Create gs
    var gs = svg.selectAll('g')
       .data(testObjectives)
       .enter()
       .append('g');
    
    // Move gs
    gs
        .attr('class', 'objective')
        .attr('transform', function(d, i) {
        var x = svgPadding + ( (objWidth + objPadding) * (i % gridWidth) );
        var y = svgPadding + ( (objHeight + objPadding) * Math.floor(i / gridWidth) );
        return 'translate(' + x.toString() + ' ' + y.toString() + ')'
    });
    
    // Add borders
    gs.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', objHeight)
      .attr('width', objWidth); 
    
    // Add text
    gs.append('text')
        .selectAll('tspan')
        .data(function(d) {
            return wrapText(d['text'], maxWidth, maxLines)
        })
        .enter()
        .append('tspan')
        .attr('dy', 15)
        .attr('x', 5)
        .html(function(d) {return d});
    
    // Add double-click behavior
    gs.on('dblclick', function(d) {
        alert(d['text']);
    });
    
    // Add drag behavior
    gs
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Right-click
    gs.on('contextmenu', function(d, i) {
        d3.event.preventDefault();
        var thisId = d['id'];
        var currentPrereq = $('.prereq');
        if (currentPrereq.length == 1) {
            // Re-define as a d3 selection
            var currentPrereq = d3.select('.prereq')
            var prereqId = currentPrereq.data()[0]['id'];
            
            if (prereqId == thisId) {
                // We right-clicked the same node twice; let's de-select it
                currentPrereq.classed('prereq', false);
            } else {
                // We have a different prereq; let's draw an edge
                addEdge(prereqId, thisId);
                currentPrereq.classed('prereq', false);
                drawEdges();
            }
        } else {
            // We want this to be the prereq
                d3.selectAll('.objective')
                  .classed('prereq', function(d) {
                    if ( d['id'] == thisId ) {
                        return true
                    } else {
                        return false
                    }
                });
        }
    });
}

function dragstarted(d) {
  d3.select(this).raise().classed("active", true);
}

function dragged(d) {
  d3.select(this).attr("transform", 'translate(' + d3.event.x.toString() + ' ' + d3.event.y.toString() + ')' );
  drawEdges();
}

function dragended(d) {
  d3.select(this).classed("active", false);
}

function addEdge(prereqId, postreqId) {
    var canAdd = true;
    edges.forEach(function(e) {
        // Check that this edge does not already exist
        if ((e['prereq_id'] == prereqId) & (e['postreq_id'] == postreqId)) {
            canAdd = false;
        }
        // Check that the reverse edge does not already exist
        if ((e['postreq_id'] == prereqId) & (e['prereq_id'] == postreqId)) {
            canAdd = false;
        }
    });

    // If possible, add the edge
    if (canAdd == true) {
        edges.push({
            'prereq_id': prereqId,
            'postreq_id': postreqId
        });
    }
}

function getG(gid) {
    var g = d3.selectAll('.objective')
        .filter(function(d) {
            return d['id'] == gid
        });
    if (g._groups[0].length == 1) {
        return g
    } else {
        throw "No objective with id [" + gid.toString() + "] was found.";
    }
}
    
function getCenter(gid) {
    var g = getG(gid);
    var transform = g.attr('transform').split('(')[1].replace(')', '').split(' ');
    var x = parseFloat(transform[0]) + (objWidth / 2);
    var y = parseFloat(transform[1]) + (objHeight / 2);
    return [x, y]
}
    
function getEndPoints(c1, c2) {
    var run = c2[0] - c1[0] ;
    var rise = c2[1] - c1[1];
    if (Math.abs(run) <= 0.1) {
        var slope = 1000;
    } else {
        var slope = rise / run;
    }
    
    var compareSlope = objHeight / objWidth;
    
    if ( Math.abs(slope) > Math.abs(compareSlope) ) {
        // Arrow should come out of top or bottom
        if (rise > 0) {
            // Arrow should come out of bottom
            var x1 = c1[0];
            var y1 = c1[1] + (objHeight / 2);
            // Arrow should end at top
            var x2 = c2[0];
            var y2 = c2[1] - (objHeight / 2);            
        } else {
            // Arrow should come out of top
            var x1 = c1[0];
            var y1 = c1[1] - (objHeight / 2);
            // Arrow should end at bottom
            var x2 = c2[0];
            var y2 = c2[1] + (objHeight / 2);
        }
    } else {
        // Arrow should come out of left our right
        if (run > 0) {
            // Arrow should come out of right
            var x1 = c1[0] + (objWidth / 2);
            var y1 = c1[1];
            // Arrow should end at left
            var x2 = c2[0] - (objWidth / 2);
            var y2 = c2[1];
        } else {
            // Arrow should come out of left
            var x1 = c1[0] - (objWidth / 2);
            var y1 = c1[1];
            // Arrow should end at right
            var x2 = c2[0] + (objWidth / 2);
            var y2 = c2[1];
        }
    }
    return [[x1, y1], [x2, y2]]
}
    
function drawEdge(e) {
    var c1 = getCenter(e['prereq_id']);
    var c2 = getCenter(e['postreq_id']);
    var endPoints = getEndPoints(c1, c2);
    var x1 = endPoints[0][0];
    var y1 = endPoints[0][1];
    var x2 = endPoints[1][0];
    var y2 = endPoints[1][1];
    var line = d3.select('svg')
        .selectAll('foo')
        .data([e])
        .enter()
        .append("line")
        .attr("x1", x1)  
        .attr("y1", y1)  
        .attr("x2", x2)  
        .attr("y2", y2)  
        .attr("marker-end","url(#arrow)");
    
    // Add right-click bevehavior
    line.on('contextmenu', deleteButton);
}
            
function deleteButton(e, i) {
    d3.event.preventDefault();
    var position = $('svg').offset()
    var coords = [d3.event.x - position['left'], d3.event.y - position['top']]
    
    if (d3.select('.delete').empty() == false) {
        // Check if delete button exists and remove
        d3.select('.delete').remove()
    } else {
        // Build a new delete button
        var g = d3.select('svg')
            .append('g')
            .attr('transform', 'translate(' +
                  coords[0].toString() +
                  ', ' +
                  coords[1].toString() +
                  ')'
            )
            .attr('class', 'delete')

        // Add click behavior
        g.on('click', function() {
                deleteEdge(e);
                drawEdges();
                g.remove();
        });

        // Add actual button
        g.append('rect')
            .attr('width', 40)
            .attr('height', 15)
        g.append('text')
            .attr('y', 15)
            .html('Delete');
    }        
}

function deleteEdge(toDelete) {
    edges = edges.filter(function(e) {
        if ((e['prereq_id'] == toDelete['prereq_id']) & (e['postreq_id'] == toDelete['postreq_id'])) {
            return false
        } else {
            return true
        }
    });
}

function drawEdges() {
    // Kill all old edges
    d3.selectAll('line').remove()
    
    // Draw new edges
    edges.forEach(function(e) {
        drawEdge(e);
    });
}

function exportEdges() {
    $.ajax({
            url: '/export_edges',
            contentType: 'application/json',
            dataType : 'json',
            data: JSON.stringify({
                edgeList: edges,
                courseName: $('#courseName').html()
                }),
            type: 'POST',
            success: function(response) {
                console.log("Success");
                console.log(response);
            },
            error: function(error) {
                console.log("Error");
                console.log(error);
                alert(error.responseText);
            }
        });
}
