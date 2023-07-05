// [SC][TODO] in jsonLDs, collapse all nquads with duplicate ids into a single nquad
// [SC][TODO] remove global variables cy and queryCy
// [SC][TODO] order signature types
// [SC][TODO] block tools by supertools in concrete workflows

///////////////////////////////////
// [SC]2023.06.28
// [SC][TODO] error: clear description when another workflow is selected from the options
// [SC][TODO] error: add cct description in the query viewer
// [SC][TODO] make sure only relevant scripts are imported into the html files


///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for parsing JSON-LD into Cytoscape elements

let queryObj = {};
let wfObj = [];
let wfCyElems = [];

let wfObjExp = [];
let expWfCyElems = [];

function createBlankNode(){
    return {
        data: {
            id: '',
            name: '', // [SC] either extracted from the URI or from the 'label' RDF property
            label: '', // [SC] truncated name
            link: '',
            conComment: '', // [SC] rdf.comment in the context of the workflow
            comment: '', // [SC] rdf.comment given in specification
            descr: '', // [SC] description fetched from the data webpage
            sign: null,
            aexp: '',
            cTool: '',
            group: '',
            width: ''
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

/* [SC][TODO] rewrite to use saveFile.js */
function prepareJsonDownload(jsonObj, filename){
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${filename}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

/* [SC][TODO] Dynamically calculate optimal image size based on node count */
function preparePngDownload(cyObj, filename){    
    let blobText = cyObj.png({
        'output': 'blob',
        'maxHeight': '6000',
        'scale': 3,
        'full': true
    });
    var imgBlob = new Blob([blobText], {type: 'image/png'});
    saveAs(imgBlob, `${filename}.png`);
}

function isValidUrl(_string) {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(_string);
}

///////////////////////////////////////////////////////////////////
////// [SC] general ontological concepts
const commentP = "http://www.w3.org/2000/01/rdf-schema#comment";
const labelP = "http://www.w3.org/2000/01/rdf-schema#label";
const seeAlsoP = "http://www.w3.org/2000/01/rdf-schema#seeAlso";
const subClassOfP = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const disjointP = "http://www.w3.org/2002/07/owl#disjointWith";

const typeP = "@type";
const valP = "@value";
const idP = "@id";


///////////////////////////////////////////////////////////////////
////// [SC] concepts of the workflow ontology
const baseWfUri = "http://geographicknowledge.de/vocab/Workflow.rdf#";
const workflowC = baseWfUri + "Workflow";
const applP = baseWfUri + "applicationOf";
const sourceP = baseWfUri + "source";
const targetP = baseWfUri + "target";
const edgeP = baseWfUri + "edge";
const bInputP = baseWfUri + "input";
const inputsP = [
    bInputP + "1",
    bInputP + "2",
    bInputP + "3",
    bInputP + "4",
    bInputP + "5"
];
const outputP = baseWfUri + "output";


///////////////////////////////////////////////////////////////////
////// [SC] concepts of the tool ontology
const baseToolUri = "https://quangis.github.io/vocab/tool#";
const absToolUri = "https://quangis.github.io/tool/abstract#";
const superToolUri = "https://quangis.github.io/tool/multi#";
const concToolUri = "https://quangis.github.io/tool#";
//const tAbstC = baseToolUri + "Abstraction";
//const tMultiC = baseToolUri + "Multi";
const tInputP = baseToolUri + "input";
const tOutputP = baseToolUri + "output";
const tIdP = baseToolUri + "id";
const tImplP = baseToolUri + "implementation";
const tActionP = baseToolUri + "action";
const tApplyP = baseToolUri + "apply";


///////////////////////////////////////////////////////////////////
////// [SC] concepts of the cct ontology
const baseCctUri = "https://quangis.github.io/vocab/cct#";
const cctOperC = "https://github.com/quangis/transforge#Operation";
const cctExpP = baseCctUri + "expression";
const cctSignP = baseCctUri + "signature";


function getVisElemById(elems, idVal){
    let match = elems.filter(item => item['data'].id === idVal);
    if(match.length == 1){
        return match[0];
    }
    return null;
}

// [SC][TODO] a hack to enable variable node size in cytoscape
let fontCanvas = document.createElement('canvas');
let fontCtx = fontCanvas.getContext("2d");
const fontSize = 15;
fontCtx.font = `50 ${fontSize}px Montserrat, sans-serif`;
const maxNodeWidth = 250;
const labelPadding = 5;
const maxLabelWidth = maxNodeWidth - 2*labelPadding;
const charWidth = calcStrWidth("w");
const maxLabelLength = maxLabelWidth/charWidth;
// [SC] calculates pixel width of a string based on a font
function calcStrWidth(strVal){
    if (strVal) {
        return fontCtx.measureText(strVal).width;
    } else{
        return 0;
    }
}
// [SC] clips any label that does not fit the node and attaches "..." at the end
function createLabel(nodeName){
    if (!nodeName){
        nodeName = "NA"
    }
    
    if (nodeName.length > maxLabelLength) {
        return nodeName.substring(0, maxLabelLength-1)+"...";
    } else{
        return nodeName;
    }
}

function parseUrlId(urlStr){
    // [SC] check if the id is a valid url
    if (isValidUrl(urlStr)){
        // [SC] derive name from the link
        if (urlStr.includes("#")){
            let temp = urlStr.split("#");
            return temp[temp.length - 1];
        }
        else if (urlStr.includes("/")){
            let temp = urlStr.split("/");
            return temp[temp.length - 1];
        }
        else{
            return urlStr;
        }
    }
    else{
        return urlStr;
    }
}

// [SC] generates a new id by attaching the prefix to the existing id
function getNewId(idStr, idPrefix){
    if (idStr.startsWith("_:")){
        idStr = idStr.substring(2);
    }
    
    return `${idPrefix}_${idStr}`;
}

// [SC] creates a copy and removes from the copy any triples
//      that do not define data, operation, and the Workflow.
//      returns the copy
function cleanWfNquads(jsonLdWfP){
    let cleanedWf = [];
    
    // [SC] get the nquad defining the workflow
    let wfDef = jsonLdWfP.find(elem => elem.hasOwnProperty(typeP) && 
                                        elem[typeP].includes(workflowC));
    cleanedWf.push(JSON.parse(JSON.stringify(wfDef)));
    
    // [SC] get the nquad defining each operation
    for (let operStub of wfDef[edgeP]){
        let operDef = jsonLdWfP.find(elem => elem[idP] === operStub[idP]);
        cleanedWf.push(JSON.parse(JSON.stringify(operDef)));
        
        // [SC] get the nquad defining each input
        for (let inputP of inputsP){
            if (operDef.hasOwnProperty(inputP)){
                let inputId = operDef[inputP][0][idP];
                // [SC] make sure the input definition was not already added previsouly
                if (!cleanedWf.find(elem => elem[idP] === inputId)){
                    let inputDef = jsonLdWfP.find(elem => elem[idP] === inputId);
                    cleanedWf.push(JSON.parse(JSON.stringify(inputDef)));
                }
            }
        }
        
        // [SC] get the nquad defining the operation's output
        // [SC] make sure the output definition was not already added previsouly
        let outputId = operDef[outputP][0][idP];
        if (!cleanedWf.find(elem => elem[idP] === outputId)){
            let outputDef = jsonLdWfP.find(elem => elem[idP] === outputId);
            cleanedWf.push(JSON.parse(JSON.stringify(outputDef)));
        }
    }
    
    return cleanedWf;
}

// [SC] coverts supertool definition into a workflow definition
function superToConcWf(superId, idPrefix="") {    
    if (!supToolGraph){
        return [];
    } 
    
    // [SC] definition of the super tool
    let superDef = supToolGraph.find(elem => elem[idP] === superId);
    
    let allDefs = [];
    
    let concWfDef = {
        [idP]: getNewId(idPrefix, superDef[idP]),
        [typeP]: [workflowC],
        [edgeP]: [],
        [sourceP]: [],
        [targetP]: []
    };
    allDefs.push(concWfDef);
    
    let allInputsIds = [];
    let allOutputIds = [];
    
    // [SC] convert each action in the supertool into a workflow operation
    for(let actionStub of superDef[tActionP]){
        let actionDef = supToolGraph.find(elem => elem[idP] === actionStub[idP]);
        
        // [SC] generate new operation id
        let operId = getNewId(actionDef[idP], idPrefix);
        concWfDef[edgeP].push({[idP]: operId});
        
        // [SC] generate new operation definition
        let operDef = {
            [idP]: operId,
            [applP]: [{[idP]: actionDef[tApplyP][0][idP]}] // [SC] concrete tool id
        };
        allDefs.push(operDef);
        
        // [SC] convert inputs
        let inputIndex = 0;
        for (let inputStub of actionDef[tInputP]){
            // [SC] get action input definition
            let inputDef = supToolGraph.find(elem => elem[idP] === inputStub[idP]);
            
            // [SC] generate new operation input id
            let operInId = getNewId(inputDef[idP], idPrefix);
            // [SC] add new input id into the operation definition
            operDef[inputsP[inputIndex]] = [{[idP]: operInId}];
            
            if (!allDefs.find(elem => elem[idP] === operInId)) {
                // [SC] generate new operation input definition
                let operInDef = JSON.parse(JSON.stringify(inputDef));
                operInDef[idP] = operInId;
                // [SC] add to the definition list 
                allDefs.push(operInDef);
            }
            
            if (!allInputsIds.includes(operInId)){
                allInputsIds.push(operInId);
            }
            
            inputIndex++;
        }
        
        // [SC] get action output definition
        let outputDef = supToolGraph.find(elem => elem[idP] === actionDef[tOutputP][0][idP]);
        // [SC] generate new operation output id
        let operOutId = getNewId(outputDef[idP], idPrefix);
        // [SC] add new output id into the operation definition
        operDef[outputP] = [{[idP]: operOutId}];
        if (!allDefs.find(elem => elem[idP] === operOutId)) {
            // [SC] generate new operation output definition 
            let operOutDef = JSON.parse(JSON.stringify(outputDef));
            operOutDef[idP] = operOutId;
            // [SC] add to the definition list 
            allDefs.push(operOutDef);
        }
        
        if (!allOutputIds.includes(operOutId)){
            allOutputIds.push(operOutId);
        }
    }
    
    // [SC] add source input properties
    for(let inId of allInputsIds){
        if (!allOutputIds.includes(inId)){
            concWfDef[sourceP].push({[idP]: inId});
        }
    }
    
    // [SC] add the output target property
    for(let outId of allOutputIds){
        if (!allInputsIds.includes(outId)){
            concWfDef[targetP].push({[idP]: outId});
        }
    }
    
    return allDefs;
}

// [SC] expand a workflow to the abstract operations that are implemented directly by real tools
function expandWf(jsonLdWfP){
    if (!(absToolGraph && conToolGraph && supToolGraph)){
        return [];
    }
    
    let nquadsToRemove = [];
    let nquadsToAdd = [];
    
    // [SC] get the nquad defining the workflow
    let wfDef = jsonLdWfP.find(elem => elem.hasOwnProperty(typeP) && 
                                       elem[typeP].includes(workflowC));
    
    for(let index=0; index<jsonLdWfP.length; index++){
        let nquad = jsonLdWfP[index];
        
        // [SC] if true, nquad represents an operation
        if (nquad.hasOwnProperty(applP)){
            // [SC] extract the abstract tool id
            let absId = nquad[applP][0][idP];
            // [SC] retrieve the asbtract tool definition
            let absToolDef = absToolGraph.find(elem => elem[idP] === absId);
            
            // [SC] if true the abstract tool has no implementation; skip the operation
            if (!absToolDef.hasOwnProperty(tImplP)) {
                continue;
            }
                    
            // [SC] get the id of the tool implementing the abstract tool
            let implId = absToolDef[tImplP][0][idP];
            
            // [SC] if true, the abstract tool is implemented by an ArcGIS tool
            // [SC] replace the abstract tool id with the concrete tool id in the nquad
            if (implId.includes(concToolUri)){
                continue;
            }
            
            // [SC] this condition should not be reached; if true, skip the operation
            if (!implId.includes(superToolUri)){
                console.log(`ERROR : expandWf : The abstract tool '${absId}' has an unknown implementation '${implId}'.`);
                continue;
            }
            
            // [SC] translate the abstract tool definition into a workflow definition
            let subWf = superToConcWf(implId, nquad[idP]);
            
            // [SC] contains mappings of ids between the operation and correspoding subworkflow
            let ioMapping = {};
            // [SC] get the subworkflow definition
            let subWfDef = subWf.find(elem => elem.hasOwnProperty(typeP) && 
                                              elem[typeP].includes(workflowC));
            // [SC] map input ids in the subworkflow to the input ids of the operation
            // [SC][TODO] derive source inputs if the workflow does not contain the "source" property
            //            or the list of sources is incomplete
            for (let srcInStub of subWfDef[sourceP]){
                let srcInDef = subWf.find(elem => elem[idP] === srcInStub[idP]);
                
                let inputProp = `${bInputP}${srcInDef[tIdP][0][valP]}`;
                let replaceWithId = nquad[inputProp][0][idP];
                
                ioMapping[srcInDef[idP]] = replaceWithId;
            }
            // [SC] map the output id in the subworkflow to the output id of the operation
            // [SC][TODO] derive final output if the workflow does not contain the "target" property
            ioMapping[subWfDef[targetP][0][idP]] = nquad[outputP][0][idP];
            
            // [SC] remap the data node ids and mark the relevant nquads
            for (let subNquad of subWf){
                // [SC] skip the workflow nquad
                if (subNquad.hasOwnProperty(typeP) && subNquad[typeP].includes(workflowC)){
                    continue;
                }
                // [SC] if true this an operation nquad
                else if (subNquad.hasOwnProperty(applP)){
                    // [SC] remap the input ids
                    for (let inputP of inputsP){
                        if (subNquad.hasOwnProperty(inputP)){
                            let oldId = subNquad[inputP][0][idP];
                            if (oldId in ioMapping){
                                subNquad[inputP][0][idP] = ioMapping[oldId];
                            }
                        }
                    }
                    
                    // [SC] remap the output id
                    let oldId = subNquad[outputP][0][idP];
                    if (oldId in ioMapping){
                        subNquad[outputP][0][idP] = ioMapping[oldId];
                    }
                    
                    // [SC] mark the operation nquad to be added to the main workflow
                    nquadsToAdd.push(subNquad);
                    
                    // [SC] add the operation id to the list of edges
                    wfDef[edgeP].push({[idP]: subNquad[idP]});
                }
                // [SC] else it is a data nquad
                else {
                    // [SC] if true it is an intermediate data node in the subworkflow
                    // [SC] mark the intermediate data nodes to be added to the main workflow
                    if (!(subNquad[idP] in ioMapping)){
                        nquadsToAdd.push(subNquad);
                    }
                }
            }
            
            // [SC] remove the nquad later
            nquadsToRemove.push(nquad);
            
            // [SC] remove the old operation id from the list of edges
            let edgeDef = wfDef[edgeP].find(elem => elem[idP] === nquad[idP]);
            wfDef[edgeP].splice(wfDef[edgeP].indexOf(edgeDef), 1);
        }
    }
    
    // [SC] remove original edges that were expanded
    for(let index=0; index<nquadsToRemove.length; index++){
        jsonLdWfP.splice(jsonLdWfP.indexOf(nquadsToRemove[index]), 1);
    }
    
    // [SC] add the new edges to the workflow
    for(let edgeIndex=0; edgeIndex<nquadsToAdd.length; edgeIndex++){
        jsonLdWfP.push(nquadsToAdd[edgeIndex]);
    }
    
    return jsonLdWfP;
}

function jsonLdToCytoscapeJson(jsonLdWf){
    let elems = [];
    let qStr = "NONE";
    
    for(let index=0; index<jsonLdWf.length; index++){
        let nquad = jsonLdWf[index];
        // [SC] if true this is a nquad for applicationOf property
        if (nquad.hasOwnProperty(applP)){
            // [SC] tool URI
            let toolId = nquad[applP][0][idP];
            
            // [SC] extract the abstract tool definition
            let absToolDef = null;
            if (toolId.includes(absToolUri) && absToolGraph){
                absToolDef = absToolGraph.find(elem => elem[idP] === toolId);
            }

            // [SC] create tool node
            let toolElem = getVisElemById(elems, nquad[idP]);
            if (!toolElem){
                toolElem = createBlankNode();
                toolElem['data']['id'] = nquad[idP];
                toolElem['data']['group'] = 'tool';
                if (nquad.hasOwnProperty(commentP)){
                    toolElem['data']['conComment'] = nquad[commentP][0][valP];
                }
                //if (isValidUrl(toolId)){
                //    toolElem['data']['link'] = toolId;
                //}
                toolElem['data']['name'] = parseUrlId(toolId);
                toolElem['data']['label'] = createLabel(toolElem['data']['name']);
                toolElem['data']['width'] = maxNodeWidth;
                
                if (absToolDef) {
                    // [SC] update the link to refer to the documentation page
                    toolElem['data']['link'] = `/docs-tool#abs_${parseUrlId(toolId)}`;
                    
                    // [SC] convert abs tool signature to the visual format
                    let signTemp = {};
                    // [SC] convert the inputs
                    for (let inputSignObj of absToolDef[tInputP]){
                        let inputDef = absToolGraph.find(elem => elem[idP] === inputSignObj[idP]);
                        let inputIndex = inputDef[tIdP][0][valP];
                        
                        let inputP = baseWfUri + "input" + inputIndex;
                        signTemp[inputP] = inputDef[typeP];
                    }
                    // [SC] convert the output
                    signTemp[outputP] = absToolGraph.find(elem => elem[idP] === absToolDef[tOutputP][0][idP])[typeP];
                    // [SC] store the visual signature format in the tool node
                    toolElem['data']['sign'] = signTemp;
                    
                    // [SC] convert the cct signature (algebra expression)
                    if (absToolDef.hasOwnProperty(cctExpP)) {
                        toolElem['data']['aepx'] = absToolDef[cctExpP][0][valP];
                    }
                    
                    // [SC] convert the comment
                    if (absToolDef.hasOwnProperty(commentP)) {
                        toolElem['data']['comment'] = absToolDef[commentP][0][valP];
                    }
                    
                    // [SC] id of the tool that implements this tool
                    if (absToolDef.hasOwnProperty(tImplP)) {
                        // [SC] the tool is implemented either by a concrete tool or a supertool
                        toolElem['data']['cTool'] = absToolDef[tImplP][0][idP];
                    }
                }
                else if(toolId.includes(concToolUri)){
                    // [SC] the operation already uses a concrete tool; provide the tool id
                    toolElem['data']['cTool'] = toolId;
                }
                else {
                    // [SC] this code should not be reached
                    console.log(`jsonLdToCytoscapeJson : ERROR : Unknown tool type for ${toolId}`);
                }

                elems.push(toolElem);
            } else{
                // [SC] if this code is reached then jsonld has incorrect structure
            }
            
            // [SC] create input nodes and edges
            for(let inputIn=0; inputIn<inputsP.length; inputIn++){
                let inputP = inputsP[inputIn];
                if (nquad.hasOwnProperty(inputP)){
                    let inputId = nquad[inputP][0][idP];
                    
                    let dataElem = getVisElemById(elems, inputId);
                    if (!dataElem){
                        dataElem = createBlankNode();
                        dataElem['data']['id'] = inputId;
                        dataElem['data']['group'] = "ds";
                        if (isValidUrl(inputId)){
                            dataElem['data']['link'] = inputId;
                        }
                        dataElem['data']['name'] = parseUrlId(inputId);
                        dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                        dataElem['data']['width'] = maxNodeWidth;
                        
                        // [SC] extract rdf.label and rdf.comment values if they exist
                        let dataAnnot = jsonLdWf.find(elem => elem[idP] === inputId);
                        if (dataAnnot) {
                            if (dataAnnot.hasOwnProperty(labelP)){
                                dataElem['data']['name'] = dataAnnot[labelP][0][valP];
                                dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                            }
                            if (dataAnnot.hasOwnProperty(commentP)){
                                dataElem['data']['conComment'] = dataAnnot[commentP][0][valP];
                            }
                        }
                        
                        elems.push(dataElem);
                    }
                    
                    // [SC] extract signature annotation from the tool node
                    if (toolElem['data']['sign']){
                        if (!dataElem['data']['sign']) { 
                            dataElem['data']['sign'] = []; 
                        }
                        dataElem['data']['sign'].push({
                            'sign': toolElem['data']['sign'][inputP],
                            'tool': toolElem['data']['name'],
                            'ioType': inputP.split("#")[1]
                        });
                    }
                    
                    let newEdge = createBlankEdge();
                    newEdge['data']['id'] = toolElem['data']['id'] + "_" + inputP.split("#")[1];
                    newEdge['data']['source'] = dataElem['data']['id'];
                    newEdge['data']['target'] = toolElem['data']['id'];
                    elems.push(newEdge);
                }
            }
            
            // [SC] create output node and edge
            let outputId = nquad[outputP][0][idP];
                    
            let dataElem = getVisElemById(elems, outputId);
            if (!dataElem){
                dataElem = createBlankNode();
                dataElem['data']['id'] = outputId;
                dataElem['data']['group'] = "ds";
                if (isValidUrl(outputId)){
                    dataElem['data']['link'] = outputId;
                }
                dataElem['data']['name'] = parseUrlId(outputId);
                dataElem['data']['label'] =  createLabel(dataElem['data']['name']);
                dataElem['data']['width'] = maxNodeWidth;
                                
                // [SC] extract rdf.label and rdf.comment values if they exist
                let dataAnnot = jsonLdWf.find(elem => elem[idP] === outputId);
                if (dataAnnot) {
                    if (dataAnnot.hasOwnProperty(labelP)){
                        dataElem['data']['name'] = dataAnnot[labelP][0][valP];
                        dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                    }
                    if (dataAnnot.hasOwnProperty(commentP)){
                        dataElem['data']['conComment'] = dataAnnot[commentP][0][valP];
                    }
                }
                
                elems.push(dataElem);
            }
            
            // [SC] extract signature annotation from the tool node
            if (toolElem['data']['sign']){
                if (!dataElem['data']['sign']) {
                    dataElem['data']['sign'] = []; 
                }
                dataElem['data']['sign'].push({
                    'sign': toolElem['data']['sign'][outputP],
                    'tool': toolElem['data']['name'],
                    'ioType': outputP.split("#")[1]
                });
            }
                    
            let newEdge = createBlankEdge();
            newEdge['data']['id'] = toolElem['data']['id'] + "_" + outputId.split("#")[1];
            newEdge['data']['source'] = toolElem['data']['id'];
            newEdge['data']['target'] = dataElem['data']['id'];
            elems.push(newEdge);
        
        } else if (nquad.hasOwnProperty(sourceP) && nquad.hasOwnProperty(commentP)){
            qStr = nquad[commentP][0]['@value']; // [SC][TODO] remove
        }
    }
    
    return {'q': qStr, 'elems': elems, 'obj': jsonLdWf};
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for cytoscape-based workflow drawing

let cy = null;

const wfStyle = [
    {
        selector: 'node',
        style: {
            label: 'data(label)',
            // position the label at node center
            'text-halign': 'center',
            'text-valign': 'center',
            
            "font-family": "Montserrat, sans-serif",
            "font-size": "15px",
            "font-weight": 900,
            
            // [SC] fixes the klay problem
            'height': 50,
            'width': 'data(width)'
        }
    },
    {
        selector: "node[group='tool']",
        style: {
            shape: 'rectangle',
            'border-width': '4',
            'border-color': '#ffd538',
            'background-color': '#dc821c',
            //'background-opacity': '1',
            'color': "#000000"
        }
    },
    {
        selector: "node[group='toolC']",
        style: {
            shape: 'rectangle',
            'border-width': '4',
            'border-color': '#e0aae8',
            'background-color': '#af48bf',
            //'background-opacity': '1',
            'color': "#000000"
        }
    },
    {
        selector: "node[group='ds']",
        style: {
            shape: 'cut-rectangle',
            'border-width': '4',
            'border-color': '#6ab9ff',
            'background-color': '#1377cf',
            //'background-opacity': '1',
            'color': "#ffffff"
        }
    },
    {
        selector: 'edge',
        style: {
            width: 4,
            'line-color': 'white',
            'target-arrow-color': 'white',
            targetArrowShape: 'triangle',
            curveStyle: 'bezier'
            //label: 'data(label)'
            
        }
    }
];
const wfLayout = {
    name: 'klay',
    //spacingFactor: 1,
    //grid: false,
    //fit: false,
    avoidOverlap: true,
    directed: true
};

function createWfCanvas(elems, domContainer, createListener=true){
    cy = cytoscape({
        container: domContainer,
        // [SC] mouse wheel zoom sensitivity; any value from 0
        wheelSensitivity: 0.1,
        
        // [SC][TODO] for these params to work disable fit in layout: "fit: false"
        //pan: { x: 1, y: 1 },
        //zoom: 1,
        
        elements: elems,
        style: wfStyle,
        layout: wfLayout
    });

    // [SC] node listerner part; create a node description on a node click
    if (createListener) {
        cy.on('tap', 'node', function(evt){
            var node = evt.target;
            let infoDiv = document.getElementById("cyInfoBody");
            let nodeInfo = "";
            
            if (node.data().link){
                nodeInfo += `
                    <label>Name</label>
                    <a href='${node.data().link}' target='_blank'>
                        ${node.data().name}
                    </a>
                `;
            } else {
                nodeInfo += `<label>Name</label>${node.data().name}`;
            }
            
            if (node.data().group == "ds") {
                if (node.data().sign) {
                    nodeInfo += "<label>Types</label>";
                    
                    let nodeSignList = node.data().sign;
                    for (let nodeSignObj of nodeSignList){
                        nodeInfo += `<div><div class="signLongL">${nodeSignObj.tool}.${nodeSignObj.ioType}: </div>`;
                        
                        let nodeSign = nodeSignObj.sign;
                        nodeInfo += '[';
                        for(let typeIndex=0; typeIndex<nodeSign.length; typeIndex++){
                            if (typeIndex > 0) {
                                nodeInfo += ", ";
                            }
                            nodeInfo += `
                                <a href='${nodeSign[typeIndex]}' target='_blank'>
                                    ${parseUrlId(nodeSign[typeIndex])}
                                </a>
                            `;  
                        }
                        nodeInfo += "]</div>";
                    }
                }
            }
            else {
                if (node.data().descr){
                    nodeInfo += `<label>Summary</label>${node.data().descr}`;
                }
                
                if (node.data().sign) {
                    nodeInfo += "<label>CCD Signature</label>";
                    let nodeSign = node.data().sign;
                    
                    Object.keys(nodeSign).forEach((keyVal, index) => {
                        nodeInfo += `<div><div class="signL">${parseUrlId(keyVal)}: </div>[`;
                        for(let typeIndex=0; typeIndex<nodeSign[keyVal].length; typeIndex++){
                            if (typeIndex > 0) {
                                nodeInfo += ", ";
                            }
                            nodeInfo += `
                                <a href='${nodeSign[keyVal][typeIndex]}' target='_blank'>
                                    ${parseUrlId(nodeSign[keyVal][typeIndex])}
                                </a>
                            `;  
                        }
                        nodeInfo += "]</div>";
                    });
                }
                
                if (node.data().aepx){
                    nodeInfo += `<label>Algebra expression</label><pre>${node.data().aepx}</pre>`;
                }
                
                if (node.data().cTool){
                    nodeInfo += "<label>Implementation</label>";
                    
                    let refUrl = node.data().cTool;
                    
                    if (refUrl.includes(superToolUri)){
                        nodeInfo += `This tool is implemented by a supertool (another workflow) 
                            <a href='${refUrl}' target='_blank'>
                                ${parseUrlId(refUrl)}.
                            </a>
                        `;
                        
                        if (supToolGraph) {
                            let superDef = supToolGraph.find(elem => elem[idP] === refUrl);
                            if (superDef && superDef.hasOwnProperty(commentP)) {
                                nodeInfo += `${superDef[commentP][0][valP]}`;
                            }
                        }
                    }
                    else if (refUrl.includes(concToolUri)){
                        // [SC] if possible, extract the link to the concrete tool documentation
                        if (conToolGraph) {
                            refUrl = conToolGraph.find(elem => elem[idP] === refUrl)[seeAlsoP][0][idP];
                        }
                        
                        let toolName = parseUrlId(refUrl);
                        let toolDescr = null;
                        // [SC] retrieve arctool's details
                        if (arcDataGraph) {
                            let arcDef = arcDataGraph.find(elem => elem[idP] === refUrl);
                            if (arcDef) {
                                toolName = arcDef[labelP][0][valP];
                                toolDescr = arcDef[commentP][0][valP];
                            }
                        }
                        
                        // [SC][TODO] hardcoded reference to ArcGIS
                        nodeInfo += `This tool is an abstraction of the ArcGIS tool 
                            <a href='${refUrl}' target='_blank'>${toolName}</a>.
                        `;
                        
                        if (toolDescr) {
                            nodeInfo += `${toolDescr}`;
                        }
                    }
                }
            }
            
            if (node.data().conComment){
                nodeInfo += `<label>Contextual comment</label>${node.data().conComment}`;
            }
            
            if (node.data().comment){
                nodeInfo += `<label>General comment</label>${node.data().comment}`;
            }
            
            infoDiv.innerHTML = nodeInfo;
        });
    }
    
    //cy.resize(); // Force the renderer to recalculate the viewport bounds.
    //cy.fit(); //Pan and zooms the graph to fit to a collection.
    //cy.zoom()
    //cy.pan()
    //cy.viewport()
    
    return cy;
}

function visualizezWfGraphRemote(graphId){    
    const newUrl = getWfGraphUrl + "?graphId=" + encodeURIComponent(graphId);
    
    fetch(newUrl, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(data => {
        visualizezWfGraph(data);
    });
}

function visualizezWfGraphFilename(filename){
    loadFile(datapathTest + filename).then(function(results){
        let jsonObj = JSON.parse(results);
        visualizezWfGraph(jsonObj);
    });
}

function visualizezWfGraph(jsonObj){
    document.getElementById("wfQuestionStr").innerHTML = "";
    document.getElementById("wfDownloadBtn").disabled = true;
    document.getElementById("expandWfBtn").checked = false;
    document.getElementById("expandWfBtn").disabled = true;
    
    let cleanedObj = cleanWfNquads(jsonObj);
    
    let results = jsonLdToCytoscapeJson(cleanedObj);
    
    wfObj = results['obj'];
    wfCyElems = results['elems'];
    
    // [SC] concretize workflow
    wfObjExp = JSON.parse(JSON.stringify(results['obj']));
    wfObjExp = expandWf(wfObjExp);
    expWfCyElems = jsonLdToCytoscapeJson(wfObjExp)['elems'];
    
    createWfCanvas(results['elems'], document.getElementById('cy'));
    
    document.getElementById("wfQuestionStr").innerHTML = results['q'];
    document.getElementById("wfDownloadBtn").disabled = false;
    document.getElementById("expandWfBtn").disabled = false;
}

function resetWfGraph(){
    document.getElementById("wfQuestionStr").innerHTML = "";
    document.getElementById("wfDownloadBtn").disabled = true;
    document.getElementById("expandWfBtn").checked = false;
    document.getElementById("expandWfBtn").disabled = true;
    document.getElementById("cyInfoBody").innerHTML = "";
    document.getElementById("cy").innerHTML = "";
    document.getElementById('wfFileSelector').selectedIndex = 0;
    
    let matchingSelector = document.getElementById("matchingWfSelector");
    matchingSelector.innerHTML = "";
    
    let defOption = document.createElement("option");
    matchingSelector.appendChild(defOption);
    defOption.disabled = true;
    defOption.selected = true;
    defOption.value = true;
    defOption.innerHTML = " -- select an option -- ";
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for cytoscape-based query drawing

const queryNodeWidth = 200;
let queryCy = null;

function queryToCytoscapeJson(queryJson){
    let elems = [];
    let nodeElemDict = {};
    let types = queryJson['cctrans']['types'];
    let transes = queryJson['cctrans']['transformations'];
    let pushedIds = [];
    
    // [SC] create node elements
    // [SC] node elems are not yet pushed to the elems since not all types are part of the graphs
    for(let typeIndex=0; typeIndex<types.length; typeIndex++){
        let nodeElem = createBlankNode();
        nodeElem['data']['id'] = types[typeIndex]['id'];
        nodeElem['data']['label'] = `${types[typeIndex]['id']}: ${types[typeIndex]['cct']}`;
        nodeElem['data']['cct'] = types[typeIndex]['cct'];
        nodeElem['data']['name'] = types[typeIndex]['type'];
        if (types[typeIndex].hasOwnProperty('keyword')){
            nodeElem['data']['keyword'] = types[typeIndex]['keyword'];
        } else{
            nodeElem['data']['keyword'] = '';
        }
        if (types[typeIndex].hasOwnProperty('measureLevel')){
            nodeElem['data']['measureLevel'] = types[typeIndex]['measureLevel'];
        } else{
            nodeElem['data']['measureLevel'] = '';
        }
        nodeElem['data']['key'] = '';
        nodeElem['data']['width'] = queryNodeWidth;
        
        nodeElemDict[nodeElem['data']['id']] = nodeElem;
    }
    
    // [SC] create edge elems
    for(let transIndex=0; transIndex<transes.length; transIndex++){
        let trans = transes[transIndex];
        
        // [SC] push after node elem
        elems.push(nodeElemDict[trans['after'][0]]);
        pushedIds.push(trans['after'][0]);
        
        for(let beforeIndex=0; beforeIndex<trans['before'].length; beforeIndex++){
            let edgeElem = createBlankEdge();
            edgeElem['data']['id'] = `${trans['before'][beforeIndex]}-${trans['after'][0]}`
            edgeElem['data']['source'] = trans['before'][beforeIndex];
            edgeElem['data']['target'] = trans['after'][0];
            elems.push(edgeElem);
            
            if (!pushedIds.includes(trans['before'][beforeIndex])){
                elems.push( nodeElemDict[trans['before'][beforeIndex]]);
            }
        }
        
        // [SC] if key present assign it to the node elem
        if (trans.hasOwnProperty('key')){
            nodeElemDict[trans['after'][0]]['data']['key'] = trans['key'];
        }
    }
    
    return {'q': queryJson['question'], 'elems': elems, 'obj': queryJson};
}

function visualizezQueryGraphFile(filename){    
    loadFile(datapathTest + filename).then(function(results){
        let jsonObj = JSON.parse(results);
        visualizezQueryGraph(jsonObj);
    });
}

function visualizezQueryGraph(jsonObj){
    let results = queryToCytoscapeJson(jsonObj);
    
    elems = results['elems'];

    queryCy = cytoscape({
        container: document.getElementById('queryCy'),
        // [SC] mouse wheel zoom sensitivity; any value from 0
        wheelSensitivity: 0.1,
        
        // [SC][TODO] for these params to work disable fit in layout: "fit: false"
        //pan: { x: 1, y: 1 },
        //zoom: 1,
        
        elements: elems,
        style: [
            {
                selector: 'node',
                style: {
                    label: 'data(label)',
                    // position the label at node center
                    'text-halign': 'center',
                    'text-valign': 'center',
                    
                    "font-family": "Montserrat, sans-serif",
                    "font-size": "15px",
                    "font-weight": 900,
                    
                    // [SC] fixes the klay problem
                    'height': 50,
                    'width': 'data(width)',
                    
                    shape: 'ellipse',
                    'border-width': '4',
                    'border-color': '#8affad',
                    'background-color': '#409459',
                    //'background-opacity': '1',
                    'color': "#000000"
                }
            },
            {
                selector: 'edge',
                style: {
                    width: 4,
                    'line-color': 'white',
                    'target-arrow-color': 'white',
                    targetArrowShape: 'triangle',
                    curveStyle: 'bezier'
                    //label: 'data(label)'
                }
            }
        ],
        layout: {
            name: 'klay',
            //spacingFactor: 1,
            //grid: false,
            //fit: false,
            avoidOverlap: true,
            directed: true
        }
    });

    document.getElementById("queryQuestionStr").innerHTML = results['q'];
    
    document.getElementById("queryDownloadBtn").disabled = false;
    queryObj = results['obj'];

    queryCy.on('tap', 'node', function(evt){
        var node = evt.target;
        
        infoCnt = `
            <label>Summary</label>
            <div><div class="shortL">Id: </div>${node.data().id}</div>
            <div><div class="shortL">Type: </div>${node.data().name}</div>
            <div><div class="shortL">Keyword: </div>${node.data().keyword}</div>
            <div><div class="shortL">Measure. level: </div>${node.data().measureLevel}</div>
            <div><div class="shortL">Attribute Of: </div>${node.data().key}</div>
            <div><div class="shortL">CCT: </div>${node.data().cct}</div>
            <label>CCT description</label>${node.data().comment}
        `;
      
        infoDiv = document.getElementById("queryCyInfoBody");
        infoDiv.innerHTML = infoCnt;
    });
}

function resetQueryGraph(){
    document.getElementById("queryDownloadBtn").disabled = true;
    document.getElementById("queryQuestionStr").innerHTML = "";
    document.getElementById("queryCyInfoBody").innerHTML = "";
    document.getElementById('queryCy').innerHTML = "";
    document.getElementById('queryFileSelector').selectedIndex = 0;
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] Code for floating buttons

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openCloseNav() {
    let sideElem = document.getElementById("docSidebar");
    let mainElem = document.getElementById("main");
    if (sideElem.clientWidth == 0){
        sideElem.style.width = "400px";
        mainElem.style.marginLeft = "400px";
    }
    else {
        sideElem.style.width = "0";
        mainElem.style.marginLeft = "0";
    }
}

function openNav(){
    openCloseNav();
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
    openCloseNav();
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] code for the tabs

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  
    if (tabName === "blocklyTab"){
        Blockly.svgResize(workspace);
        //workspace.render();
    } 
    else if (tabName === "wfTab"){
        if (cy){
            cy.resize();
            cy.center();
        }
    }
    else if (tabName === "queryTab") {
        if (queryCy){
            queryCy.resize();
            queryCy.center();
        }
    }
}
