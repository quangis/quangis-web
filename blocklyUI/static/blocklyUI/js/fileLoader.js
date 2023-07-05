// [SC][REMOVE]
//const toolsFileName = "tools.json";
//let toolsGraph = null;
//const toolsKey = "toolsKey";

const retriBCFileName = "retriBlocklyConstructs.json";
const retriKey = "retriKey";
let retriJson = null;

const absToolFileName = "abstract.json";
const absToolKey = "absToolKey";
let absToolGraph = null;

const conToolFileName = "arcgis.json";
const conToolKey = "conToolKey";
let conToolGraph = null;

const supToolFileName = "multi.json";
const supToolKey = "supToolKey";
let supToolGraph = null;

const arcDataFileName = "arcData.json";
const acrDataKey = "acrDataKey";
let arcDataGraph = null;

const ccdFileName = "ccd.json";
const ccdKey = "ccdKey";
let ccdGraph = null;

const algFileName = "cct.json";
const algKey = "algKey";
let algGraph = null;

let ls = window.localStorage;

// [SC] a generic async function for loading remote file
async function loadFile(path) {    
    // [SC] load the json data from the file as string
    let response = await fetch(path);
    let data = await response.text();
    
    return data;
}

// [SC] loads blockly constructs for the retrieval questions
async function loadRetriBC(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(retriKey)){
            // [SC] loading the super tools ontology from the local storage
            retriJson = JSON.parse(ls.getItem(retriKey));
            console.log("Loaded the predefined blockly constructs.");
            return resolve("");
        }
        else {
            console.log("Can't load the predefined blockly constructs from local storage. Fetching remote file.");
            // [SC] fetching the remote super tools ontology
            loadFile(datapath + retriBCFileName).then(function(results){
                retriJson = JSON.parse(results);
                ls.setItem(retriKey, results);
                console.log("Fetched the predefined blockly constructs.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch the predefined blockly constructs.");
                return reject(error);
            });
        }
    });
}

// [SC] loads multi.json file
async function loadSupToolAnnot(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(supToolKey)){
            // [SC] loading the super tools ontology from the local storage
            supToolGraph = JSON.parse(ls.getItem(supToolKey));
            console.log("Loaded the super tools ontology from the local storage.");
            return resolve("");
        }
        else {
            console.log("Can't load super tools ontology from local storage. Fetching remote file.");
            // [SC] fetching the remote super tools ontology
            loadFile(datapath + supToolFileName).then(function(results){
                supToolGraph = JSON.parse(results);
                ls.setItem(supToolKey, results);
                console.log("Fetched super tools ontology.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch super tools ontology.");
                return reject(error);
            });
        }
    });
}

// [SC] loads arcgis.json file
async function loadConToolAnnot(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(conToolKey)){
            // [SC] loading the concrete tools ontology from the local storage
            conToolGraph = JSON.parse(ls.getItem(conToolKey));
            console.log("Loaded the concrete tools ontology from the local storage.");
            return resolve("");
        }
        else {
            console.log("Can't load concrete tools ontology from local storage. Fetching remote file.");
            // [SC] fetching the remote concrete tools ontology
            loadFile(datapath + conToolFileName).then(function(results){
                conToolGraph = JSON.parse(results);
                ls.setItem(conToolKey, results);
                console.log("Fetched concrete tools ontology.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch concrete tools ontology.");
                return reject(error);
            });
        }
    });
}

// [SC] loads abstract.json file
async function loadAbsToolAnnot(){
    return new Promise(function(resolve,reject){
        if (ls.getItem(absToolKey)){
            // [SC] loading the abstract tools ontology from the local storage
            absToolGraph = JSON.parse(ls.getItem(absToolKey));
            console.log("Loaded the abstract tools ontology from the local storage.");
            return resolve("");
        }
        else {
            console.log("Can't load abstract tools ontology from local storage. Fetching remote file.");
            // [SC] fetching the remote abstract tools ontology
            loadFile(datapath + absToolFileName).then(function(results){
                absToolGraph = JSON.parse(results);
                ls.setItem(absToolKey, results);
                console.log("Fetched abstract tools ontology.");
                return resolve("");
            }).catch(error => {
                console.error("Unable to fetch abstract tools ontology.");
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