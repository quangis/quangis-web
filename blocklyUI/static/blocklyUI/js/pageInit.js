// [SC] init the demo page
function initDemo(){
    console.log("init demo method called.");
    
    Promise.all([
        loadRetriBC(),
        loadSupToolAnnot(),
        loadConToolAnnot(),
        loadAbsToolAnnot(),
        loadArcScrapes(),
        loadParserCct()
    ]).then(function (responses) {
        prepareBlocklyConstructs();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
    
    // [SC] fetch the list of existing workflows IDs from the remote database
    fetch(getWfListUrl, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(data => {        
        let wfFileSelector = document.getElementById("wfFileSelector");
        wfFileSelector.innerHTML = "";
        
        let defOption = document.createElement("option");
        wfFileSelector.appendChild(defOption);
        defOption.disabled = true;
        defOption.selected = true;
        defOption.value = true;
        defOption.innerHTML = " -- Select a predefined workflow independent of your query -- ";
        
        for (let jsonObj of data.results.bindings){
            let newOption = document.createElement("option");
            wfFileSelector.appendChild(newOption);
            newOption.value = jsonObj.g.value;
            newOption.innerHTML = jsonObj.g.value; 
        }
    });
    
    document.getElementById("queryDownloadBtn").addEventListener('change', function() {
        if (this.value === "json"){
            prepareJsonDownload(queryObj, "query");
        }
        else if (this.value === "png"){
            preparePngDownload(queryCy, "query");
        }
        
        this.value = "idle";
    });
    
    // [SC][TODO][REMOVE]
    /*document.getElementById('queryFileSelector').addEventListener('change', function() {
        visualizezQueryGraphFile(this.value);
    });*/
    
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
        document.getElementById('matchingWfSelector').selectedIndex = 0;
        visualizezWfGraphRemote(this.value);
    });
    
    document.getElementById('matchingWfSelector').addEventListener('change', function() {
        document.getElementById('wfFileSelector').selectedIndex = 0;
        visualizezWfGraphRemote(this.value);
    });
}

// [SC] init the [documentation.tool ontology] page
function initDocsTool(){
    console.log("init docs-tools method called.");
    
    Promise.all([
        loadSupToolAnnot(),
        loadConToolAnnot(),
        loadAbsToolAnnot(),
        loadArcScrapes(),
        loadCCDOnto()
    ]).then(function (responses) {
        generateAbsToolDoc();
        navToAnchor();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
}

// [SC] init the [documentation.ccd ontology] page
function initDocsCcd(){
    console.log("init docs method called.");
    
    Promise.all([
        loadCCDOnto()
    ]).then(function (responses) {
        generateCCDDoc();
        navToAnchor();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
}

// [SC] init the [documentation.algebra expression] page
function initDocsAlg(){
    console.log("init docs method called.");
    
    Promise.all([
        loadAlgebraDoc()
    ]).then(function (responses) {
        generateAlgDoc();
        navToAnchor();
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    });
}

// [SC] init a page
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
    else if (page === 'tutorials'){ 
        createBlocklyDoc();
        navToAnchor();
    } 
    
    document.getElementById(`nav.${page}`).classList.add('active');
}

// [SC] if anchor is present, navigate to it
function navToAnchor(){
    let urlParts = document.URL.split('#');
    if (urlParts.length > 1) {
        let anchorPos = document.getElementById(urlParts[1]).offsetTop;
        window.scrollTo(0, anchorPos);
    }
}