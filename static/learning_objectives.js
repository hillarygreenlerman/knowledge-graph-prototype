var objList = [];

var verb_list = ['define', 'describe', 'apply', 'analyze', 'arrange', 'appraise',
    'list', 'discuss', 'demonstrate', 'appraise', 'assemble', 'assess',
    'name', 'explain', 'dramatize', 'calculate', 'collect', 'choose',
    'recall', 'express', 'employ', 'categorize', 'compose', 'compare',
    'record', 'depict', 'illustrate', 'criticize', 'construct',
    'estimate', 'relate', 'locate', 'interpret', 'debate', 'create',
    'evaluate', 'underline', 'recognize', 'operate', 'diagram',
    'design', 'judge', 'label', 'report', 'practice', 'differentiate',
    'formulate', 'measure', 'quote', 'restate', 'schedule',
    'distinguish', 'manage', 'rate', 'locate', 'review', 'sketch',
    'examine', 'organize', 'revise', 'match', 'translate', 'use',
    'experiment', 'plan', 'score', 'cite', 'inspect', 'prepare',
    'select', 'reproduce', 'question', 'propose', 'value', 'identify',
    'relate', 'combine', 'defend', 'state', 'solve', 'integrate',
    'justify', 'test', 'classify'].sort();

console.log(verb_list);

function getObj() {
    var v = $( '#verbs' ).val();
    var predicate = $( '#lo-text' ).val();
    return {verb:v, predicate:predicate}
}

function addObj(obj) {
    if (obj.predicate.length > 10 & !(obj.verb == null)) {
        objList.push(obj);
    } else {
        alert('Please enter a learning objective!');
    }
}

function buildTable() {
    var table = d3.select('#learning-objectives > tbody');
    table.selectAll('*').remove();
    var trs = table.selectAll('tr')
        .data(objList)
        .enter()
        .append('tr');
    trs.append('td')
        .html(function(obj, i) {
        var objText = "Learner will be able to " + obj.verb + " " + obj.predicate ;
        return objText
    });
    trs.append('td')
        .append('input')
        .attr('value', 'X')
        .attr('type', 'button')
        .on('click', function(obj, i) {
            objList.splice(i, 1);
            buildTable();
        });
}

function cleanObj() {
    var v = $( '#verbs' ).val('');
    var objText = $( '#lo-text' ).val('');
}

function checkObj(objDict) {
    $.ajax({
        url: '/checkObj',
        contentType: 'application/json',
        dataType : 'json',
        data: JSON.stringify({
            objDict: objDict,
            }),
        type: 'POST',
        success: function(response) {
            console.log("Success");
            console.log(response);
            var objJSON = JSON.parse(response);
            buildOtherObjectives(objJSON, objDict);
        },
        error: function(error) {
            console.log("Error");
            console.log(error);
            alert(error.responseText);
        }
    });
}

function submitObj() {
    var objDict = getObj();
    checkObj(objDict);
}

function exportObj() {
    $.ajax({
        
            url: '/export_learning_objectives',
            contentType: 'application/json',
            dataType : 'json',
            data: JSON.stringify({
                objList: objList,
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

function buildOtherObjectives(objJSON, originalObj) {
    // Clear other objectives
    $( '#otherObjectives' ).empty();
    
    // Append original obj to objJSON
    objJSON.unshift(originalObj);
    
    // Build new rows
    console.log('Building alternative objectives');
    var trs = d3.select('#otherObjectives')
      .selectAll('tr')
      .data(objJSON)
      .enter()
      .append('tr');
    trs.append('td')
       .html(function(d) {
           console.log(d);
           return "Learner will be able to " + d.verb + " " + d.predicate
       })
    
    trs.append('td')
       .append('input')
       .attr('type', 'button')
       .attr('value', function(d, i) {
            if (i == 0) {
                return 'Use original objective'
            } else {
                return 'Use alternative objective'
            }
        })
       .on('click', function(d) {
          addObj(d);
          buildTable();
          cleanObj();
          $( '#otherObjectives' ).empty();
       })
}
