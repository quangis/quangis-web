// [SC][TODO] in jsonLDs, collapse all nquads with duplicate ids into a single nquad
// [SC][TODO] remove global variables cy and queryCy
// [SC][TODO] order signature types
// [SC][TODO] block tools by supertools in concrete workflows

const toolsFileName = "tools.json";
let toolsGraph = null;
const toolsKey = "toolsKey";

const arcDataFileName = "arcData.json";
let arcDataGraph = null;
const acrDataKey = "acrDataKey";

const ccdFileName = "coreConceptData.json";
let ccdGraph = null;
const ccdKey = "ccdKey";

const algFileName = "operators.json";
let algGraph = null;
const algKey = "algKey";

let ls = window.localStorage;

// [SC] a generic async function for loading remote file
async function loadFile(path) {    
    // [SC] load the json data from the file as string
    let response = await fetch(path);
    let data = await response.text();
    
    return data;
}

// [SC] loads algebra expression documentation
async function loadAlgebraDoc(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(algKey)){
            // [SC] loading the algebra expression documentation from the local storage
            algGraph = JSON.parse(ls.getItem(algKey));
            console.log("Loaded the algebra expression documentation from the local storage.");
            return resolve("");
        }
        else {
            console.log("Cant load the algebra expression documentation from local storage. Fetching remote file.");
            // [SC] fetching remote data
            loadFile(datapath + algFileName).then(function(results){
                algGraph = JSON.parse(results);
                ls.setItem(algKey, results);
                console.log("Fetched the algebra expression.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch the algebra expression.");
                return reject(error);
            });
        }
    });
}

// [SC] loads core concept data ontology
async function loadCCDOnto(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(ccdKey)){
            // [SC] loading the ccd ontology from the local storage
            ccdGraph = JSON.parse(ls.getItem(ccdKey));
            console.log("Loaded the CCD ontology from the local storage.");
            return resolve("");
        }
        else {
            console.log("Cant load the CCD ontology from local storage. Fetching remote file.");
            // [SC] fetching remote data
            loadFile(datapath + ccdFileName).then(function(results){
                ccdGraph = JSON.parse(results);
                ls.setItem(ccdKey, results);
                console.log("Fetched the CCD ontology.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch the CCD ontology.");
                return reject(error);
            });
        }
    });
}

// [SC] loads tools.json file
async function loadToolsAnnot(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(toolsKey)){
            // [SC] loading the tools ontology from the local storage
            toolsGraph = JSON.parse(ls.getItem(toolsKey));
            console.log("Loaded the tools ontology from the local storage.");
            return resolve("");
        }
        else {
            console.log("Cant load tools ontology from local storage. Fetching remote file.");
            // [SC] fetching remote data
            loadFile(datapath + toolsFileName).then(function(results){
                toolsGraph = JSON.parse(results);
                ls.setItem(toolsKey, results);
                console.log("Fetched tools ontology.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch tools ontology.");
                return reject(error);
            });
        }
    });
}

// [SC] loads scraped data on acrpro tools
async function loadArcScrapes(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(acrDataKey)){
            // [SC] loading the arcpro tools' annotation from the local storage
            arcDataGraph = JSON.parse(ls.getItem(acrDataKey));
            console.log("Loaded the arcpro tools' annotation from the local storage.");
            return resolve("");
        }
        else {
            console.log("Cant load arcpro tools' annotation from local storage. Fetching remote file.");
            // [SC] fetching remote data
            loadFile(datapath + arcDataFileName).then(function(results){
                arcDataGraph = JSON.parse(results);
                ls.setItem(acrDataKey, results);
                console.log("Fetched arcpro tools' annotation.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch arcpro tools' annotation.");
                return reject(error);
            });
        }
    });
}

function initDemo(){
    console.log("init demo method called.");
    
    loadToolsAnnot();
    loadArcScrapes();
    
    document.getElementById("queryDownloadBtn").addEventListener('change', function() {
        if (this.value === "json"){
            prepareJsonDownload(queryObj, "query");
        }
        else if (this.value === "png"){
            preparePngDownload(queryCy, "query");
        }
        
        this.value = "idle";
    });
    
    document.getElementById('queryFileSelector').addEventListener('change', function() {
        visualizezQueryGraphFile(this.value);
    });
    
    document.getElementById("expandWfBtn").addEventListener('change', function() {
        if (this.checked){
            createWfCanvas(expWfCyElems, document.getElementById('cy'));
        }
        else {
            createWfCanvas(wfCyElems, document.getElementById('cy'));
        }
    });
    
    document.getElementById("wfDownloadBtn").addEventListener('change', function() {
        if (this.value === "json"){
            prepareJsonDownload(wfObj, "workflow");
        }
        else if (this.value === "png"){
            preparePngDownload(cy, "workflow");
        }
        else if (this.value === "rdf"){
            console.log("rdf selected");
        }
        
        this.value = "idle";
    });
    
    document.getElementById('wfFileSelector').addEventListener('change', function() {
        visualizezWfGraphFilename(this.value);
    });
    
    document.getElementById('matchingWfSelector').addEventListener('change', function() {
        visualizezWfGraphRemote(this.value);
    });
}

function initDocsTool(){
    console.log("init docs-tools method called.");
    
    Promise.all([
        loadToolsAnnot(),
        loadArcScrapes(),
        loadCCDOnto()
    ]).then(function (responses) {
        generateToolDoc();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
}

function initDocsCcd(){
    console.log("init docs method called.");
    
    Promise.all([
        loadCCDOnto()
    ]).then(function (responses) {
        generateCCDDoc();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
}

function initDocsAlg(){
    console.log("init docs method called.");
    
    Promise.all([
        loadAlgebraDoc()
    ]).then(function (responses) {
        generateAlgDoc();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
}

function init(page){
    console.log("init method called.");
    
    if (page === 'demo'){
        initDemo();
    }
    else if (page === 'docs-tool'){
        initDocsTool();
        page = "docs";
    }
    else if (page === 'docs-ccd'){
        initDocsCcd();
        page = "docs";
    }
    else if (page === 'docs-algebra'){
        initDocsAlg();
        page = "docs";
    }
    else if (page === 'tutorials' || page === 'index'){
        document.getElementById("footer").classList.add('absolute');
    }
    
    document.getElementById(`nav.${page}`).classList.add('active');
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] blockly code for question parsing

function parseQuestion(qStr) {
    showDemoLoadScreen();
    
    resetQueryGraph();
    resetWfGraph();

    const parsedQCont = document.getElementById("parsedQContainer");
    parsedQCont.innerHTML = "";
    
    const newUrl = parsedQAsyncUrl + "?qStr=" + encodeURIComponent(qStr);
    
    fetch(newUrl, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(data => {
        parsedQCont.innerHTML = JSON.stringify(data, null, 4);
        
        if (!data.hasOwnProperty("error")) {
            if(data.hasOwnProperty("cctrans")
                && data["cctrans"].hasOwnProperty("types")
                && data["cctrans"].hasOwnProperty("transformations")
                && data["cctrans"]["types"].length > 0
                && data["cctrans"]["transformations"].length > 0
            ){
                visualizezQueryGraph(data);
            }
            
            if(data.hasOwnProperty("matches")
                && data["matches"] instanceof Array
                && data["matches"].length > 0){
                
                let selectElem = document.getElementById("matchingWfSelector");
                
                for(let matchId of data["matches"]){
                    let selOption = document.createElement("option");
                    selectElem.appendChild(selOption);
                    selOption.setAttribute("value", matchId);
                    selOption.innerHTML = matchId;
                }
            }
            
            if(data.hasOwnProperty("workflow") && data["workflow"]){
                visualizezWfGraph(data["workflow"]);
            }
        }
        
        removeDemoLoadScreen();
    })
    .catch(error => {
        parsedQCont.innerHTML = `Query Error: ${error}`;
        console.error('Error in fetch for query!', error);
        
        removeDemoLoadScreen();
    });;
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

function showDemoLoadScreen(){
    let demoLoader = document.getElementById("demoLoader");
    demoLoader.classList.remove("inactive");
    demoLoader.classList.add("active");
}

function removeDemoLoadScreen(){
    let demoLoader = document.getElementById("demoLoader");
    demoLoader.classList.remove("active");
    demoLoader.classList.add("inactive");
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
            sign: [],
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

const baseWfUri = "http://geographicknowledge.de/vocab/Workflow.rdf#";
const workflowC = baseWfUri + "Workflow";
const applP = baseWfUri + "applicationOf";
const sourceP = baseWfUri + "source";
const edgeP = baseWfUri + "edge";
const proxyP = baseWfUri + "proxyFor";
const inputsP = [
    baseWfUri + "input1",
    baseWfUri + "input2",
    baseWfUri + "input3",
    baseWfUri + "input4",
    baseWfUri + "input5"
];
const outputP = baseWfUri + "output";

const commentP = "http://www.w3.org/2000/01/rdf-schema#comment";
const labelP = "http://www.w3.org/2000/01/rdf-schema#label";
const subClassOfP = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const disjointP = "http://www.w3.org/2002/07/owl#disjointWith";

const typeP = "@type";
const valP = "@value";
const idP = "@id";

const baseToolUri = "https://github.com/quangis/cct/blob/master/tools/tools.ttl#";
const algExpP = baseToolUri + "algebraexpression";
const implemP = baseToolUri + "implements";

const aSignP = "https://github.com/quangis/cct#signature";

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

// [SC] expand a workflow to the abstract operations that are implemented directly by real tools
function expandWf(jsonLdWfP, level=0){
    if (!toolsGraph){
        return [];
    }
    
    let nquadsToRemove = [];
    
    for(let index=0; index<jsonLdWfP.length; index++){
        let nquad = jsonLdWfP[index];
        // [SC] if true, nquad represents an operation
        if (nquad.hasOwnProperty(applP)){
            let targetId = nquad[applP][0][idP];

            // [SC] find a tool that implements this tool
            let cToolObj = toolsGraph.find(elem => elem.hasOwnProperty(implemP) && 
                                                   elem[implemP].some(nelem => nelem[idP] === targetId));
            // [SC] if true, an arcpro tool implements this tool
            if (cToolObj && !cToolObj[idP].includes(baseToolUri)){                
                continue;
            }
            // [SC] if true, the nquad is a supertool
            else if(!cToolObj){
                cToolObj = toolsGraph.find(elem => elem[idP] === targetId);
            }
            
            // [SC] retrive the signature of this operation
            let signObj = toolsGraph.find(elem => elem[idP] === targetId);
            let idMatching = [];
            for(let key of Object.keys(signObj)){
                if (inputsP.includes(key) || key === outputP){
                    // [SC] id of I/O used in signature annotation
                    let signId = signObj[key][0][idP];
                    // [SC] id of I/O used in corresponding supertool
                    let proxyId = signId;
                    // [SC] id of I/O used in scenario's workflow
                    let wfId = nquad[key][0][idP];
                    let paramObj = toolsGraph.find(elem => elem[idP] === signId);
                    
                    if (paramObj.hasOwnProperty(proxyP)){
                        proxyId = paramObj[proxyP][0][idP];
                    }
                    
                    idMatching.push({
                        "sign": signId,
                        "proxy": proxyId,
                        "wf": wfId
                    });
                }
            }
            
            
            console.log(`${level}-${index} MATCHING:`);
            console.log(idMatching);
            
            
            console.log(`${level}-${index} IMPLEMENTOR:`);
            console.log(cToolObj);
            
            

            // [SC] collect all edge triplets of the supertool
            let edgeIds = [];
            for(let edgeIndex=0; edgeIndex<cToolObj[edgeP].length; edgeIndex++){
                edgeIds.push(cToolObj[edgeP][edgeIndex][idP]);
            }
            let edgeObjList = toolsGraph.filter(elem => edgeIds.includes(elem[idP]));
            
            
            
            console.log(`${level}-${index} EDGES BEFORE:`);
            console.log(edgeObjList);
            
            
            // [SC] create a copy
            let expEdgeObjList = JSON.parse(JSON.stringify(edgeObjList));
            
            // [SC] change all id among the edges to avoid any possible duplicate id
            let idSuffix = `_exp${level}_${index}`;
            for(let edgeIndex=0; edgeIndex<expEdgeObjList.length; edgeIndex++){
                let edgeNode = expEdgeObjList[edgeIndex];
                edgeNode[idP] = edgeNode[idP] + idSuffix;
                for(let key of Object.keys(edgeNode)){
                    if (inputsP.includes(key) || key === outputP){
                        let matching = idMatching.find(elem => elem["proxy"] === edgeNode[key][0][idP]);
                        if (matching){
                            edgeNode[key][0][idP] = matching["wf"];
                        } 
                        else {
                            edgeNode[key][0][idP] = edgeNode[key][0][idP] + idSuffix;
                        }
                    }
                }
            }
            
            
            console.log(`${level}-${index} EDGES AFTER:`);
            console.log(expEdgeObjList);
            
            
            // [SC] expand all super tools
            expEdgeObjList = expandWf(expEdgeObjList, level+1);
            
            
            console.log(`${level}-${index} EDGES AFTER RECURSION:`);
            console.log(expEdgeObjList);
            

            // [SC] remove the nquad later
            nquadsToRemove.push(nquad);

            // [SC] add the new edges to the workflow
            for(let edgeIndex=0; edgeIndex<expEdgeObjList.length; edgeIndex++){
                jsonLdWfP.push(expEdgeObjList[edgeIndex]);
            }
        }
    }
    
    
    console.log("NQUADS TO REMOVE: ");
    console.log(nquadsToRemove);
    
    
    
    // [SC] remove original edges that were expanded
    for(let index=0; index<nquadsToRemove.length; index++){
        console.log("REMOVING AT INDEX: " + jsonLdWfP.indexOf(nquadsToRemove[index]));
        console.log("LENGTH BEFORE: " + jsonLdWfP.length);
        jsonLdWfP.splice(jsonLdWfP.indexOf(nquadsToRemove[index]), 1);
        console.log("LENGTH AFTER: " + jsonLdWfP.length);
    }
    
    return jsonLdWfP;
}

function expandedJsonLdToCytoscapeJson(){
    let elems = [];

    for(let index=0; index<wfObjExp.length; index++){
        nquad = wfObjExp[index];
        // [SC] if true this is a nquad for applicationOf property
        if (nquad.hasOwnProperty(applP)){
            // [SC] tool URI
            let toolId = nquad[applP][0][idP];
            // [SC] extract tools signature annotation
            let toolDescr = null;
            let realTool = null;
            if (toolsGraph){
                toolDescr = toolsGraph.find(elem => elem[idP] === toolId);
                // [SC] concrete tool that implements this abstract tool
                realTool = toolsGraph.find(elem => elem.hasOwnProperty(implemP) && 
                                                   elem[implemP].some(nelem => nelem[idP] === toolId));
            }
            
            // [SC] extract scraped data from tool's arcpro webpage
            let toolScrape = null;
            if (arcDataGraph && realTool){
                toolScrape = arcDataGraph.find(elem => elem[idP] === realTool[idP]);
            }
            
            // [SC] create tool node
            let toolElem = getVisElemById(elems, nquad[idP]);
            if (!toolElem){
                toolElem = createBlankNode();
                toolElem['data']['id'] = nquad[idP];
                toolElem['data']['group'] = 'toolC';
                if (nquad.hasOwnProperty(commentP)){
                    toolElem['data']['conComment'] = nquad[commentP][0][valP];
                }
                // [SC] link to arcpro tool webpage
                if (isValidUrl(realTool[idP])){
                    toolElem['data']['link'] = realTool[idP]; 
                }
                // [SC] set the name of arcpro tool
                toolElem['data']['name'] = parseUrlId(realTool[idP]);
                toolElem['data']['label'] = createLabel(toolElem['data']['name']);
                toolElem['data']['width'] = maxNodeWidth;

                
                if (toolDescr) {
                    // [SC] attach signature
                    signTemp = {};
                    for(let inputIn=0; inputIn<inputsP.length; inputIn++){
                        inputP = inputsP[inputIn];
                        if (toolDescr.hasOwnProperty(inputP)){
                            signTemp[inputP] = toolsGraph.find(elem => elem[idP] === toolDescr[inputP][0][idP])[typeP];
                        }
                    }
                    signTemp[outputP] = toolsGraph.find(elem => elem[idP] === toolDescr[outputP][0][idP])[typeP];
                    toolElem['data']['sign'] = signTemp;
                    
                    // [SC] algebra expression
                    if (toolDescr.hasOwnProperty(algExpP)) {
                        toolElem['data']['aepx'] = toolDescr[algExpP][0][valP];
                    }
                    
                    // [SC] algebra comment
                    if (toolDescr.hasOwnProperty(commentP)) {
                        toolElem['data']['comment'] = toolDescr[commentP][0][valP];
                    }
                }
                
                if (toolScrape) {
                    // [SC] change label and name to the scraped arcpro tool name
                    toolElem['data']['name'] = toolScrape[labelP][0][valP];
                    toolElem['data']['label'] = createLabel(toolElem['data']['name']);
                    // [SC] add the scraped tool summary
                    toolElem['data']['descr'] = toolScrape[commentP][0][valP];
                }

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
                        dataElem['data']['group'] = "ds";
                        if (isValidUrl(inputId)){
                            dataElem['data']['link'] = inputId;
                        }
                        dataElem['data']['name'] = parseUrlId(inputId);
                        dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                        dataElem['data']['width'] = maxNodeWidth;
                        
                        // [SC] extract rdf.label and rdf.comment values if they exist
                        dataAnnot = wfObjExp.find(elem => elem[idP] === inputId);
                        if (dataAnnot) {
                            if (dataAnnot.hasOwnProperty(labelP)){
                                dataElem['data']['name'] = dataAnnot[labelP][0][valP];
                                dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                            }
                            if (dataAnnot.hasOwnProperty(commentP)){
                                dataElem['data']['conComment'] = dataAnnot[commentP][0][valP];
                            }
                        }
                        
                        // [SC] extract signature annotation
                        if (toolDescr){
                            // [SC] extract signature obj by signature id
                            inputSig = toolsGraph.find(elem => elem[idP] === toolDescr[inputP][0][idP]);
                            if (inputSig) {
                                dataElem['data']['sign'] = inputSig[typeP];
                            }
                        }
                        
                        elems.push(dataElem);
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
                dataElem['data']['group'] = "ds";
                if (isValidUrl(outputId)){
                    dataElem['data']['link'] = outputId;
                }
                dataElem['data']['name'] = parseUrlId(outputId);
                dataElem['data']['label'] =  createLabel(dataElem['data']['name']);
                dataElem['data']['width'] = maxNodeWidth;
                                
                // [SC] extract rdf.label and rdf.comment values if they exist
                dataAnnot = wfObjExp.find(elem => elem[idP] === outputId);
                if (dataAnnot) {
                    if (dataAnnot.hasOwnProperty(labelP)){
                        dataElem['data']['name'] = dataAnnot[labelP][0][valP];
                        dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                    }
                    if (dataAnnot.hasOwnProperty(commentP)){
                        dataElem['data']['conComment'] = dataAnnot[commentP][0][valP];
                    }
                }
                
                // [SC] extract signature annotation
                if (toolDescr){
                    // [SC] extract signature obj by signature id
                    outputSig = toolsGraph.find(elem => elem[idP] === toolDescr[outputP][0][idP]);
                    if (outputSig) {
                        dataElem['data']['sign'] = outputSig[typeP];
                    }
                }
                
                elems.push(dataElem);
            }
                    
            let newEdge = createBlankEdge();
            newEdge['data']['id'] = toolElem['data']['id'] 
                        + "_" + outputId.split("#")[1];
            newEdge['data']['source'] = toolElem['data']['id'];
            newEdge['data']['target'] = dataElem['data']['id'];
            elems.push(newEdge);
        }
    }
    
    return elems;
}

function jsonLdToCytoscapeJson(jsonLdWf){
    let elems = [];
    let qStr = "Test string";
    
    for(let index=0; index<jsonLdWf.length; index++){
        nquad = jsonLdWf[index];
        // [SC] if true this is a nquad for applicationOf property
        if (nquad.hasOwnProperty(applP)){
            // [SC] tool URI
            let toolId = nquad[applP][0][idP];
            // [SC] extract tools signature annotation
            let toolDescr = null;
            if (toolsGraph){
                toolDescr = toolsGraph.find(elem => elem[idP] === toolId);
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
                if (isValidUrl(toolId)){
                    toolElem['data']['link'] = toolId;
                }
                toolElem['data']['name'] = parseUrlId(toolId);
                toolElem['data']['label'] = createLabel(toolElem['data']['name']);
                toolElem['data']['width'] = maxNodeWidth;
                
                if (toolDescr) {
                    // [SC] attach signature
                    signTemp = {};
                    for(let inputIn=0; inputIn<inputsP.length; inputIn++){
                        inputP = inputsP[inputIn];
                        if (toolDescr.hasOwnProperty(inputP)){
                            signTemp[inputP] = toolsGraph.find(elem => elem[idP] === toolDescr[inputP][0][idP])[typeP];
                        }
                    }
                    signTemp[outputP] = toolsGraph.find(elem => elem[idP] === toolDescr[outputP][0][idP])[typeP];
                    toolElem['data']['sign'] = signTemp;
                    
                    // [SC] algebra expression
                    if (toolDescr.hasOwnProperty(algExpP)) {
                        toolElem['data']['aepx'] = toolDescr[algExpP][0][valP];
                    }
                    
                    // [SC] algebra comment
                    if (toolDescr.hasOwnProperty(commentP)) {
                        toolElem['data']['comment'] = toolDescr[commentP][0][valP];
                    }
                    
                    // [SC] id of the tool that implements this tool
                    cToolObj = toolsGraph.find(elem => elem.hasOwnProperty(implemP) && 
                                                   elem[implemP].some(nelem => nelem[idP] === toolId));
                    if (cToolObj) {
                        // [SC] the tool is implemented either by a real tool or a supertool
                        toolElem['data']['cTool'] = cToolObj[idP];
                    } else {
                        // [SC] the tool is a supertool
                        toolElem['data']['cTool'] = toolId;
                    }
                }

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
                        dataElem['data']['group'] = "ds";
                        if (isValidUrl(inputId)){
                            dataElem['data']['link'] = inputId;
                        }
                        dataElem['data']['name'] = parseUrlId(inputId);
                        dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                        dataElem['data']['width'] = maxNodeWidth;
                        
                        // [SC] extract rdf.label and rdf.comment values if they exist
                        dataAnnot = jsonLdWf.find(elem => elem[idP] === inputId);
                        if (dataAnnot) {
                            if (dataAnnot.hasOwnProperty(labelP)){
                                dataElem['data']['name'] = dataAnnot[labelP][0][valP];
                                dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                            }
                            if (dataAnnot.hasOwnProperty(commentP)){
                                dataElem['data']['conComment'] = dataAnnot[commentP][0][valP];
                            }
                        }
                        
                        // [SC] extract signature annotation
                        if (toolDescr){
                            // [SC] extract signature obj by signature id
                            inputSig = toolsGraph.find(elem => elem[idP] === toolDescr[inputP][0][idP]);
                            if (inputSig) {
                                dataElem['data']['sign'] = inputSig[typeP];
                            }
                        }
                        
                        elems.push(dataElem);
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
                dataElem['data']['group'] = "ds";
                if (isValidUrl(outputId)){
                    dataElem['data']['link'] = outputId;
                }
                dataElem['data']['name'] = parseUrlId(outputId);
                dataElem['data']['label'] =  createLabel(dataElem['data']['name']);
                dataElem['data']['width'] = maxNodeWidth;
                                
                // [SC] extract rdf.label and rdf.comment values if they exist
                dataAnnot = jsonLdWf.find(elem => elem[idP] === outputId);
                if (dataAnnot) {
                    if (dataAnnot.hasOwnProperty(labelP)){
                        dataElem['data']['name'] = dataAnnot[labelP][0][valP];
                        dataElem['data']['label'] = createLabel(dataElem['data']['name']);
                    }
                    if (dataAnnot.hasOwnProperty(commentP)){
                        dataElem['data']['conComment'] = dataAnnot[commentP][0][valP];
                    }
                }
                
                // [SC] extract signature annotation
                if (toolDescr){
                    // [SC] extract signature obj by signature id
                    outputSig = toolsGraph.find(elem => elem[idP] === toolDescr[outputP][0][idP]);
                    if (outputSig) {
                        dataElem['data']['sign'] = outputSig[typeP];
                    }
                }
                
                elems.push(dataElem);
            }
                    
            let newEdge = createBlankEdge();
            newEdge['data']['id'] = toolElem['data']['id'] 
                        + "_" + outputId.split("#")[1];
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

    if (createListener) {
        cy.on('tap', 'node', function(evt){
            var node = evt.target;
            infoDiv = document.getElementById("cyInfoBody");
            nodeInfo = "";
            
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
                nodeInfo += "<label>Types</label>[";
                nodeSign = node.data().sign;
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
                nodeInfo += "]";
            }
            else {
                if (node.data().descr){
                    nodeInfo += `<label>Summary</label>${node.data().descr}`;
                }
                
                nodeInfo += "<label>CCD Signature</label>";
                nodeSign = node.data().sign;
                
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
                
                if (node.data().aepx){
                    nodeInfo += `<label>Algebra expression</label>${node.data().aepx}`;
                }
                
                if (node.data().cTool){
                    nodeInfo += "<label>Implementation</label>";
                    if (node.data().cTool.includes(baseToolUri)){
                        nodeInfo += "This abstract tool is composed of other abstract tools.";
                    }
                    else{
                        // [SC][TODO] remove hardcoded ArcGIS reference
                        nodeInfo += `This tool is an abstraction of ArcGIS tool 
                            <a href='${node.data().cTool}' target='_blank'>
                                ${parseUrlId(node.data().cTool)}.
                            </a>
                        `;
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
        //console.log(JSON.stringify(data, null, 4));
    });
}

function visualizezWfGraphFilename(filename){
    loadFile(datapath + filename).then(function(results){
        let jsonObj = JSON.parse(results);
        visualizezWfGraph(jsonObj);
    });
}

function visualizezWfGraph(jsonObj){
    document.getElementById("wfQuestionStr").innerHTML = "";
    document.getElementById("wfDownloadBtn").disabled = true;
    document.getElementById("expandWfBtn").checked = false;
    document.getElementById("expandWfBtn").disabled = true;
    
    let results = jsonLdToCytoscapeJson(jsonObj);
    
    wfObj = results['obj'];
    wfCyElems = results['elems'];
    
    wfObjExp = JSON.parse(JSON.stringify(results['obj']));
    
    wfObjExp = expandWf(wfObjExp);
    
    expWfCyElems = expandedJsonLdToCytoscapeJson();
    
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
    loadFile(datapath + filename).then(function(results){
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
////// [SC] tool documentation code

function createToolFeatureSection(labelStr){
    let featureSection = document.createElement("section");
    featureSection.setAttribute("class", "featureL");
    
    let featureLabel = document.createElement("label");
    featureLabel.innerHTML = labelStr;
    featureSection.appendChild(featureLabel);
    
    return featureSection;
}

function generateToolDoc(){
    if (!toolsGraph){
        return;
    }
    
    let mainElem = document.getElementById("main");
    
    let sidebarElem = document.getElementById("docSidebar");
    
    // [SC] update side navigation
    let ontNavA = document.createElement("a");
    sidebarElem.appendChild(ontNavA);
    ontNavA.setAttribute("href", "#toolsDocContainer");
    ontNavA.innerHTML = "Tool ontology";
    
    let navDiv = document.createElement("div");
    sidebarElem.appendChild(navDiv);
    navDiv.setAttribute("class", "subbar");
    
    // [SC] creat a container element
    let containerElem = document.createElement("div");
    mainElem.appendChild(containerElem);
    containerElem.setAttribute("class", "w-container");
    containerElem.setAttribute("id", "toolsDocContainer");
    
    let titleElem = document.createElement("h2");
    containerElem.appendChild(titleElem);
    titleElem.setAttribute("class", "section-title");
    titleElem.innerHTML = "Tool ontology";
    
    let sortedToolNames = [];
    let nameUriDict = {};
    for(let index=0; index<toolsGraph.length; index++){
        let nquad = toolsGraph[index];
        
        if (nquad[idP].includes(baseToolUri)){
            let toolName = parseUrlId(nquad[idP]);
            sortedToolNames.push(toolName);
            nameUriDict[toolName] = nquad[idP];
        }
    }
    // [SC] case insensitive sort
    sortedToolNames = sortedToolNames.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    
    for(let toolName of sortedToolNames){
        let nquad = toolsGraph.find(elem => elem[idP] === nameUriDict[toolName]);
        
        // [SC] create section elem that will contain all info for the tool
        let toolSect = document.createElement("section");
        containerElem.appendChild(toolSect);
        toolSect.setAttribute("class", "toolL");
        
        // [SC] add tool title
        let titleP = document.createElement("p");
        toolSect.appendChild(titleP);
        titleP.setAttribute("class", "section-subtitle");
        titleP.setAttribute("id", `${toolName}`);
        titleP.innerHTML = toolName;
        
        // [SC] update side navigation
        let navA = document.createElement("a");
        navDiv.appendChild(navA);
        navA.setAttribute("href", `#${toolName}`);
        navA.innerHTML = toolName;
        
        // [SC] add signature
        let signSect = createToolFeatureSection("Signature");
        toolSect.appendChild(signSect);
        let hasSign = false;
        for(let key of Object.keys(nquad)){
            if (inputsP.includes(key) || key === outputP){
                hasSign = true;
                
                let paramTypes = toolsGraph.find(elem => elem[idP] === nquad[key][0][idP])[typeP];
                
                let paramParentRow = document.createElement("div");
                signSect.appendChild(paramParentRow);
                paramParentRow.setAttribute("class", "w-row parent");
                
                let paramHeadCol = document.createElement("div");
                paramParentRow.appendChild(paramHeadCol);
                paramHeadCol.setAttribute("class", "w-col w-col-1");
                paramHeadCol.innerHTML = parseUrlId(key);
                
                let paramDescrCol = document.createElement("div");
                paramParentRow.appendChild(paramDescrCol);
                paramDescrCol.setAttribute("class", "w-col w-col-11");
                
                for(let paramType of paramTypes){
                    let paramDescrRow = document.createElement("div");
                    paramDescrCol.appendChild(paramDescrRow);
                    paramDescrRow.setAttribute("class", "w-row child");
                    
                    let paramTypeCol = document.createElement("div");
                    paramDescrRow.appendChild(paramTypeCol);
                    paramTypeCol.setAttribute("class", "w-col w-col-3");
                    paramTypeCol.innerHTML = parseUrlId(paramType);
                    
                    let typeDescrCol = document.createElement("div");
                    paramDescrRow.appendChild(typeDescrCol);
                    typeDescrCol.setAttribute("class", "w-col w-col-9");
                    typeDescrCol.innerHTML = "No description";
                    
                    // [SC][TODO] handle measurement concepts from the other ontology
                    if (ccdGraph){
                        let typeObj = ccdGraph.find(elem => elem[idP] === paramType);
                        
                        if (typeObj){
                            typeDescrCol.innerHTML = typeObj[commentP][0][valP];
                        }
                    }
                }
            }
        }
        if (!hasSign){
            let signP = document.createElement("p");
            signSect.appendChild(signP);
            signP.innerHTML = "This supertool has no signature. The signature is inferred from an abstract tool it implements.";
        }
        
        // [SC] tool comment
        if (nquad.hasOwnProperty(commentP) && nquad[commentP][0][valP]){
            let summarySect = createToolFeatureSection("Summary");
            toolSect.appendChild(summarySect);
            let summaryP = document.createElement("p");
            summarySect.appendChild(summaryP);
            summaryP.innerHTML = nquad[commentP][0][valP];
        }
        
        // [SC] tool algebra expression
        if (nquad.hasOwnProperty(algExpP) && nquad[algExpP][0][valP]){
            let algSect = createToolFeatureSection("Algebra expression");
            toolSect.appendChild(algSect);
            let algP = document.createElement("p");
            algP.innerHTML = nquad[algExpP][0][valP];
            algSect.appendChild(algP);
        }
        
        // [SC] arc tool
        let cToolObj = toolsGraph.find(elem => elem.hasOwnProperty(implemP) && 
                                               elem[implemP].some(nelem => nelem[idP] === nquad[idP]));
        // [SC] if true, an arcpro tool implements this tool
        if (cToolObj && !cToolObj[idP].includes(baseToolUri) && arcDataGraph){
            let arcToolAnnot = arcDataGraph.find(elem => elem[idP] === cToolObj[idP]);
            
            if (arcToolAnnot){
                let arcSect = createToolFeatureSection("Corresponding ArcPro tool");
                toolSect.appendChild(arcSect);
                
                let arcRowDiv = document.createElement("div");
                arcSect.appendChild(arcRowDiv);
                arcRowDiv.setAttribute("class", "w-row");
                
                let arcColDiv = document.createElement("div");
                arcRowDiv.appendChild(arcColDiv);
                arcColDiv.setAttribute("class", "w-col w-col-5");
                
                let arcA = document.createElement("a");
                arcColDiv.appendChild(arcA);
                arcA.setAttribute("href", cToolObj[idP]);
                arcA.setAttribute("target", "_blank");
                arcA.innerHTML = arcToolAnnot[labelP][0][valP];
                
                arcColDiv = document.createElement("div");
                arcRowDiv.appendChild(arcColDiv);
                arcColDiv.setAttribute("class", "w-col w-col-7");
                arcColDiv.innerHTML = arcToolAnnot[commentP][0][valP];
            }
        }
        // [SC] if true, this tool is implemented by another abstract tool
        else if(cToolObj){
            let otherToolName = parseUrlId(cToolObj[idP])
            
            let absSect = createToolFeatureSection("Corresponding supertool");
            toolSect.appendChild(absSect);
            
            let absP = document.createElement("p");
            absSect.appendChild(absP);
            absP.append("This tool is implemented by a supertool: ");
            
            let absA = document.createElement("a");
            absP.appendChild(absA);
            absA.setAttribute("href", `#${otherToolName}`);
            absA.innerHTML = otherToolName;
        }
        // [SC] this is a supertool
        else {
            // [SC] check if this supertool implements any abstract tool
            if (nquad.hasOwnProperty(implemP)){
                let implSect = createToolFeatureSection("Corresponding abstract tools");
                toolSect.appendChild(implSect);
                
                let implP = document.createElement("p");
                implSect.appendChild(implP);
                implP.append("This is a supertool that implements via a workflow following tools: ");
                
                for (let implIndex=0; implIndex<nquad[implemP].length; implIndex++){
                    let otherToolName = parseUrlId(nquad[implemP][implIndex][idP]);
                    
                    let implA = document.createElement("a");
                    implP.appendChild(implA);
                    implA.setAttribute("href", `#${otherToolName}`);
                    implA.innerHTML = otherToolName;
                    implP.append(", ");
                }
            }

            let wfSect = createToolFeatureSection("Workflow");
            toolSect.appendChild(wfSect);
            
            let graphDiv = document.createElement("div");
            wfSect.appendChild(graphDiv);
            graphDiv.setAttribute("class", "miniCyCont"); 
            
            let jsonWf = [nquad];
            for(let edgeIndex=0; edgeIndex<nquad[edgeP].length; edgeIndex++){
                let edgeId = nquad[edgeP][edgeIndex][idP];
                let edgeNquad = toolsGraph.find(elem => elem[idP] === edgeId);
                jsonWf.push(edgeNquad);
                
                for(let key of Object.keys(edgeNquad)){
                    if (inputsP.includes(key) || key === outputP){
                        let paramId = edgeNquad[key][0][idP];
                        if(!jsonWf.find(elem => elem[idP] === paramId)){
                            jsonWf.push(toolsGraph.find(elem => elem[idP] === paramId));
                        }
                    }
                }
            }

            let cyElems = jsonLdToCytoscapeJson(jsonWf)['elems'];
            createWfCanvas(cyElems, graphDiv, false);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] CCD documentation code

function isSubClassOf(nquad, parentNquads){ 
    if (nquad.hasOwnProperty(subClassOfP)){
        if (nquad[subClassOfP].find(elem => parentNquads.find(pelem => pelem[idP] === elem[idP]))){
            return true;
        }
    }
    
    return false;
}

function createCyElem(nquad, elemList, nquadList){
    let nodeElem = createBlankNode();
        
    nodeElem["data"]["id"] = nquad[idP];
    nodeElem["data"]["name"] = parseUrlId(nquad[idP]);
    nodeElem["data"]["label"] = createLabel(nodeElem['data']['name']);
    nodeElem['data']['width'] = maxNodeWidth;
    nodeElem['data']['comment'] = nquad[commentP];
    nodeElem['data']['group'] = "ds";
    elemList.push(nodeElem);
    
    if (nquad.hasOwnProperty(subClassOfP)){
        for(let subIndex=0; subIndex<nquad[subClassOfP].length; subIndex++){
            let superId = nquad[subClassOfP][subIndex][idP];
            
            if (nquadList.length > 0){
                if (nquadList.find(elem => elem[idP] === superId)){
                    let subEdge = createBlankEdge();
                    subEdge['data']['id'] = nodeElem['data']['id'] 
                                            + "_" + superId;
                    subEdge['data']['source'] = nodeElem['data']['id'];
                    subEdge['data']['target'] = superId;
                    
                    elemList.push(subEdge);
                }
            } 
            else {
                let subEdge = createBlankEdge();
                subEdge['data']['id'] = nodeElem['data']['id'] 
                                        + "_" + superId;
                subEdge['data']['source'] = nodeElem['data']['id'];
                subEdge['data']['target'] = superId;
                
                elemList.push(subEdge);
            }
        }
    }
}

function createCyElems(elemList, nquadList, idStr, titleStr){
    // [SC] case insensitive sort
    nquadList = nquadList.sort(function (a, b) {        
        return a[idP].toLowerCase().localeCompare(b[idP].toLowerCase());
    });
    
    let mainElem = document.getElementById("main");
    
    let sidebarElem = document.getElementById("docSidebar");
    
    // [SC] update side navigation
    let ontNavA = document.createElement("a");
    sidebarElem.appendChild(ontNavA);
    ontNavA.setAttribute("href", `#${idStr}`);
    ontNavA.innerHTML = titleStr;
    
    let navDiv = document.createElement("div");
    sidebarElem.appendChild(navDiv);
    navDiv.setAttribute("class", "subbar");
    
    // [SC] creat a container element
    let containerElem = document.createElement("div");
    mainElem.appendChild(containerElem);
    containerElem.setAttribute("class", "w-container");
    containerElem.setAttribute("id", idStr);
    
    let titleElem = document.createElement("h2");
    containerElem.appendChild(titleElem);
    titleElem.setAttribute("class", "section-title");
    titleElem.innerHTML = titleStr;
    
    // [SC] create the section for the summary graph
    let graphSect = document.createElement("section");
    containerElem.appendChild(graphSect);
    graphSect.setAttribute("class", "toolL");
    
    // [SC] add graph title
    let titleP = document.createElement("p");
    graphSect.appendChild(titleP);
    titleP.setAttribute("class", "section-subtitle");
    titleP.innerHTML = "Ontology graph";
    
    // [SC] add graph canvas container
    let graphDiv = document.createElement("div");
    graphSect.appendChild(graphDiv);
    graphDiv.setAttribute("class", "conceptCyCont");
    
    // [SC] 
    for(let nquad of nquadList){
        createCyElem(nquad, elemList, nquadList);
        
        let conceptName = parseUrlId(nquad[idP]);
        
        // [SC] create section elem that will contain all info for the concept
        let conceptSect = document.createElement("section");
        containerElem.appendChild(conceptSect);
        conceptSect.setAttribute("class", "toolL");
        
        // [SC] add concept title
        let titleP = document.createElement("p");
        conceptSect.appendChild(titleP);
        titleP.setAttribute("class", "section-subtitle");
        titleP.setAttribute("id", `${conceptName}`);
        titleP.innerHTML = conceptName;
        
        // [SC] update side navigation
        let navA = document.createElement("a");
        navDiv.appendChild(navA);
        navA.setAttribute("href", `#${conceptName}`);
        navA.innerHTML = conceptName;
        
        // [SC] tool comment
        if (nquad.hasOwnProperty(commentP) && nquad[commentP][0][valP]){
            let summarySect = createToolFeatureSection("Summary");
            conceptSect.appendChild(summarySect);
            let summaryP = document.createElement("p");
            summarySect.appendChild(summaryP);
            summaryP.innerHTML = nquad[commentP][0][valP];
        }
        
        // [SC] check if this supertool implements any abstract tool
        if (nquad.hasOwnProperty(subClassOfP)){
            let superSect = createToolFeatureSection("Superclasses");
            conceptSect.appendChild(superSect);
            
            let superP = document.createElement("p");
            superSect.appendChild(superP);
            superP.append("This class has following superclasses: ");
            
            for (let superIndex=0; superIndex<nquad[subClassOfP].length; superIndex++){
                let superName = parseUrlId(nquad[subClassOfP][superIndex][idP]);
                
                let superA = document.createElement("a");
                superP.appendChild(superA);
                superA.setAttribute("href", `#${superName}`);
                superA.innerHTML = superName;
                superP.append(", ");
            }
        }
        
        // [SC] check if this supertool implements any abstract tool
        if (nquad.hasOwnProperty(disjointP)){
            let disjSect = createToolFeatureSection("Disjoint classes");
            conceptSect.appendChild(disjSect);
            
            let disjP = document.createElement("p");
            disjSect.appendChild(disjP);
            disjP.append("This class is disjoint with following classes: ");
            
            for (let disjIndex=0; disjIndex<nquad[disjointP].length; disjIndex++){
                let disjName = parseUrlId(nquad[disjointP][disjIndex][idP]);
                
                let disjA = document.createElement("a");
                disjP.appendChild(disjA);
                disjA.setAttribute("href", `#${disjName}`);
                disjA.innerHTML = disjName;
                disjP.append(", ");
            }
        }
    }
    
    createWfCanvas(elemList, graphDiv, false);
}

function generateCCDDoc(){
    if (!ccdGraph){
        return;
    }
    
    
    
    
    /*let mainElem = document.getElementById("main");
    
    let cyElems = [];
    
    for(let nquadIndex=0; nquadIndex<ccdGraph.length; nquadIndex++){
        let nquad = ccdGraph[nquadIndex];
        
        // [SC] skip if a blank node
        if (nquad[idP].startsWith("_:")){
            continue;
        }
        
        createCyElem(nquad, cyElems, []);
    }
    
    let graphDiv = document.createElement("div");
    mainElem.appendChild(graphDiv);
    graphDiv.setAttribute("class", "conceptCyCont");
    
    let tempCy = createWfCanvas(cyElems, graphDiv, false);
    preparePngDownload(tempCy, "ccdOntoOverview");*/
    
    
    
    
    let rootDS = "http://geographicknowledge.de/vocab/AnalysisData.rdf#SpatialDataSet";
    let dsNquads = [];
    let dsElems = [];
    
    let rootML = "http://geographicknowledge.de/vocab/CoreConceptData.rdf#NominalA";
    let mlNquads = [];
    let mlElems = [];
    
    let rootA = "http://geographicknowledge.de/vocab/CoreConceptData.rdf#Attribute";
    let aNquads = [];
    let aElems = [];    
    
    let ccdGraphCopy = [...ccdGraph];
    
    let maxIter = 10;
    let currIter = 1;
    while(currIter < maxIter) {
        let nquadsToRemove = [];
        
        for(let nquadIndex=0; nquadIndex<ccdGraphCopy.length; nquadIndex++){
            let nquad = ccdGraphCopy[nquadIndex];
            let removeNquad = false;
            
            // [SC] skip if a blank node
            if (nquad[idP].startsWith("_:")){
                continue;
            }
        
            if (nquad[idP] === rootDS || isSubClassOf(nquad, dsNquads)){
                dsNquads.push(nquad);
                removeNquad = true;
            }
            else {
                if(nquad[idP] === rootML || isSubClassOf(nquad, mlNquads)){
                    mlNquads.push(nquad);
                    removeNquad = true;
                }
                
                if(nquad[idP] === rootA || nquad[idP] !== rootML && isSubClassOf(nquad, aNquads)){ 
                    aNquads.push(nquad);
                    removeNquad = true;
                }
            }
            
            if (removeNquad){
                nquadsToRemove.push(nquad);
            }
        }
        
        currIter += 1;
        console.log(currIter);
        
        if (nquadsToRemove.length != 0){
            for(let index=0; index<nquadsToRemove.length; index++){
                ccdGraphCopy.splice(ccdGraphCopy.indexOf(nquadsToRemove[index]), 1);
            }
        } else{
            break;
        }
    }
    
    createCyElems(dsElems, dsNquads, "dsSection", "Dataset ontology");
    createCyElems(mlElems, mlNquads, "mlSection", "Measurement level ontology");
    //createCyElems(aElems, aNquads);
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] Algebra expression documentation code

function generateAlgDoc(){
    if (!algGraph){
        return;
    }
    
    // [SC] case insensitive sort
    algGraph = algGraph.sort(function (a, b) {        
        return a[labelP][0][valP].toLowerCase().localeCompare(b[labelP][0][valP].toLowerCase());
    });
    
    let mainElem = document.getElementById("main");
    
    let sidebarElem = document.getElementById("docSidebar");
    
    // [SC] update side navigation
    let ontNavA = document.createElement("a");
    sidebarElem.appendChild(ontNavA);
    ontNavA.setAttribute("href", "#algExp");
    ontNavA.innerHTML = "Algebra expressions";
    
    let navDiv = document.createElement("div");
    sidebarElem.appendChild(navDiv);
    navDiv.setAttribute("class", "subbar");
    
    // [SC] creat a container element
    let containerElem = document.createElement("div");
    mainElem.appendChild(containerElem);
    containerElem.setAttribute("class", "w-container");
    containerElem.setAttribute("id", "algExp");
    
    let titleElem = document.createElement("h2");
    containerElem.appendChild(titleElem);
    titleElem.setAttribute("class", "section-title");
    titleElem.innerHTML = "Algebra expressions";
    
    for(let nquad of algGraph){
        // [SC] create section elem that will contain all info for the concept
        let conceptSect = document.createElement("section");
        containerElem.appendChild(conceptSect);
        conceptSect.setAttribute("class", "toolL");
        
        let labelVal = nquad[labelP][0][valP];
        
        // [SC] add concept title
        let titleP = document.createElement("p");
        conceptSect.appendChild(titleP);
        titleP.setAttribute("class", "section-subtitle");
        titleP.setAttribute("id", `${labelVal}`);
        titleP.innerHTML = labelVal;
        
        // [SC] update side navigation
        let navA = document.createElement("a");
        navDiv.appendChild(navA);
        navA.setAttribute("href", `#${labelVal}`);
        navA.innerHTML = labelVal;
        
        // [SC] operation comment
        if (nquad.hasOwnProperty(commentP) && nquad[commentP][0][valP]){
            let summarySect = createToolFeatureSection("Summary");
            conceptSect.appendChild(summarySect);
            let summaryP = document.createElement("p");
            summarySect.appendChild(summaryP);
            summaryP.innerHTML = nquad[commentP][0][valP];
        }
        
        // [SC] operation signature
        if (nquad.hasOwnProperty(aSignP) && nquad[aSignP][0][valP]){
            let aSignSect = createToolFeatureSection("Signature");
            conceptSect.appendChild(aSignSect);
            let aSignPTag = document.createElement("p");
            aSignSect.appendChild(aSignPTag);
            aSignPTag.innerText = nquad[aSignP][0][valP];
        }
    }
}


/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("docSidebar").style.width = "400px";
    document.getElementById("main").style.marginLeft = "400px";
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("docSidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}
