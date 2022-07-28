function parseQuestion(qStr) {
    const newUrl = parsedQAsyncUrl + "?qStr=" + qStr;
    
    fetch(newUrl, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(data => {
        const parsedQCont = document.getElementById("parsedQContainer");
        parsedQCont.innerHTML = JSON.stringify(data, null, 4);
    });
}

// [TODO]
// function checkQuestionStringValidity(){}

function parseBlocklyQ(){
    let qStr = document.getElementById("questionDiv").innerHTML;
    // [TODO] check question string validity
    parseQuestion(qStr);
}

function parseCorpusQ(){
    let qStr = document.getElementById("qCorpusList").value;
    parseQuestion(qStr);
}

function parseNLQ(){
    let qStr = document.getElementById("nlQuestionStr").value;
    parseQuestion(qStr); 
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for the tabs

function openPage(pageName, elmnt, color) {
    // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    // Show the specific tab content
    document.getElementById(pageName).style.display = "block";

    // Add the specific color to the button used to open the tab content
    elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
// [SC][TODO]
// document.getElementById("defaultOpen").click();

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for parsing JSON-LD into Cytoscape elements

async function getVisElem(filename) {
    console.log(datapath)
    
    // [SC] load the json data from the file as string
    let response = await fetch(datapath + filename);
    let data = await response.text();
    
    // [SC] parse the string into json object
    let jsonLdWf = JSON.parse(data);
    
    return jsonLdToCytoscapeJson(jsonLdWf);
}

function createBlankNode(){
    return {
        data: {
            id: '',
            name: '',
            link: '',
            comment: '',
            group: ''
        }
    };
}

function createBlankEdge(){
    return {
        data: {
            id: '',
            source: '',
            target: '',
            comment: ''
        }
    };
}

const applP = "http://geographicknowledge.de/vocab/Workflow.rdf#applicationOf";
const sourceP = "http://geographicknowledge.de/vocab/Workflow.rdf#source";
const idP = "@id";
const commP = "http://www.w3.org/2000/01/rdf-schema#comment";
const valP = "@value";
const inputsP = [
    "http://geographicknowledge.de/vocab/Workflow.rdf#input1",
    "http://geographicknowledge.de/vocab/Workflow.rdf#input2"
];
const outputP = "http://geographicknowledge.de/vocab/Workflow.rdf#output";

const workflowC = "http://geographicknowledge.de/vocab/Workflow.rdf#Workflow";
const typeP = "@type";

function getVisElemById(elems, idVal){
    let match = elems.filter(item => item['data'].id === idVal);
    if(match.length == 1){
        return match[0];
    }
    return null;
}

function jsonLdToCytoscapeJson(jsonLdWf){   
    let elems = [];
    let sources = [];
    let dataCounter = 0;
    
    for(let index=0; index<jsonLdWf.length; index++){
        nquad = jsonLdWf[index];
        // [SC] if true this is a nquad for applicationOf property
        if (nquad.hasOwnProperty(applP)){
            // [SC] create tool node
            let toolElem = getVisElemById(elems, nquad[idP]);
            if (!toolElem){
                toolElem = createBlankNode();
                toolElem['data']['id'] = nquad[idP];
                toolElem['data']['link'] = nquad[applP][0][idP];
                toolElem['data']['group'] = 'tool';
                if (nquad.hasOwnProperty(commP)){
                    toolElem['data']['comment'] = nquad[commP][0][valP];
                }
                toolElem['data']['name'] = toolElem['data']['link'].split("#")[1];
                elems.push(toolElem);
            } else{
                // [SC] if this code is reached then jsonld has incorrect structure
            }
            
            // [SC] create input nodes and edges
            for(let inputIn=0; inputIn<inputsP.length; inputIn++){
                inputP = inputsP[inputIn];
                if (nquad.hasOwnProperty(inputP)){
                    inputId = nquad[inputP][0][idP];
                    
                    let dataElem = getVisElemById(elems, inputId);
                    if (!dataElem){
                        dataElem = createBlankNode();
                        dataElem['data']['id'] = inputId;
                        dataElem['data']['name'] = "ds" + dataCounter;
                        dataElem['data']['group'] = "ds";
                        elems.push(dataElem);
                        dataCounter++;
                    }
                    
                    let newEdge = createBlankEdge();
                    newEdge['data']['id'] = toolElem['data']['id'] 
                        + "_" + inputP.split("#")[1];
                    newEdge['data']['source'] = dataElem['data']['id'];
                    newEdge['data']['target'] = toolElem['data']['id'];
                    elems.push(newEdge);
                }
            }
            
            // [SC] create output node and edge
            outputId = nquad[outputP][0][idP];
                    
            let dataElem = getVisElemById(elems, outputId);
            if (!dataElem){
                dataElem = createBlankNode();
                dataElem['data']['id'] = outputId;
                dataElem['data']['name'] = "ds" + dataCounter;
                dataElem['data']['group'] = "ds";
                elems.push(dataElem);
                dataCounter++;
            }
                    
            let newEdge = createBlankEdge();
            newEdge['data']['id'] = toolElem['data']['id'] 
                        + "_" + outputId.split("#")[1];
            newEdge['data']['source'] = toolElem['data']['id'];
            newEdge['data']['target'] = dataElem['data']['id'];
            elems.push(newEdge);
        
        } else if (nquad.hasOwnProperty(sourceP)){
            sources = nquad[sourceP];
        }
    }
    
    return elems;
    //for(let index=0; index<sources.length; index++){
    //    sources
    //}
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for cytoscape drawing

document.getElementById('wfFileSelector').addEventListener('change', function() {
    visualizezGraph(this.value);
});

let cy = null;

function visualizezGraph(filename){
    elems = getVisElem(filename);
    
    cy = cytoscape({
        container: document.getElementById('cy'),
        // [SC] mouse wheel zoom sensitivity; any value from 0
        wheelSensitivity: 0.1,
        
        // [SC][TODO]
        //pan: { x: 1, y: 1 },
        
        elements: elems,
        style: [
            {
                selector: 'node',
                style: {
                    label: 'data(name)',
                    // position the label at node center
                    'text-halign': 'center',
                    'text-valign': 'center',
                    
                    // [SC][TODO]
                    // size the node according to the label
                    //'width': 'label'
                    //'width': (node) => { return node.data('name').length * 10 }
                    
                    // [SC] fixes the klay problem
                    'width': 250
                    
                    //"font-size": 17
                }
            },
            {
                selector: "node[group='tool']",
                style: {
                    shape: 'rectangle',
                    'background-color': 'cyan'
                }
            },
            {
                selector: "node[group='ds']",
                style: {
                    shape: 'cut-rectangle',
                    'background-color': 'green'
                }
            },
            {
                selector: 'edge',
                style: {
                    width: 2,
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    targetArrowShape: 'triangle',
                    curveStyle: 'bezier'
                    //label: 'data(label)'
                    
                }
            }
        ],
        layout: {
            name: 'klay',
            //spacingFactor: 0.8,
            directed: true
        }
    });

    cy.on('tap', 'node', function(evt){
        var node = evt.target;
        
        infoCnt = `<p>Link: <a href='${node.data().link}' target='_blank'>${node.data().link}</a></p><p>Description: ${node.data().comment}</p>`;
      
        infoDiv = document.getElementById("cyInfo");
        infoDiv.innerHTML = infoCnt;
      
        console.log(infoCnt);
        //console.log( 'tapped ' + node.id() );
        //console.log( 'tapped ' + match['data'].id );
    });
}