///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] blockly code for question parsing

function prepareBlocklyConstructs(){
    if (!retriJson) {
        return;
    }
    
    let selElem = document.getElementById("bJsonList");
    
    for (let qBlocks of retriJson){
        let option = document.createElement("option");
        option.value = JSON.stringify(qBlocks.blocks);
        option.text = qBlocks.question;
        selElem.appendChild(option);
    }
    
    selElem.addEventListener('change', function(){
        Blockly.serialization.workspaces.load(JSON.parse(this.value), workspace);
    });
}

function parseBlocklyJson(blocklyJsonObj) {
    showDemoLoadScreen();
    
    resetQueryGraph();
    resetWfGraph();

    const parsedQContDiv = document.getElementById("parsedQContainerDiv");
    parsedQContDiv.innerHTML = "";
    
    const downResBtn = document.getElementById("downResBtn");
    downResBtn.disabled = true;
    
    queryObj = {};
    
    // [SC][TODO][REMOVE]
    /*const parsedQCont = document.getElementById("parsedQContainer");
    parsedQCont.innerHTML = "";*/
    
    const newUrl = parsedBJAsyncUrl;
    
    // [SC][TODO] make sure "blocklyJsonObj" has a proper structure
    
    let csrfTokenVal = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    fetch(newUrl, 
        {
            method: "POST",
            credentials: "same-origin",
            body: JSON.stringify(blocklyJsonObj),
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrfTokenVal,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )
    .then(response => response.json())
    .then(data => {
        
        // [SC] using pretty json visualizer
        // [SC]
        let dataCopy = JSON.parse(JSON.stringify(data));
        let reg = new RegExp("<", "g");
        dataCopy.sparql = dataCopy.sparql.replace(reg,"&lt;");
        reg = new RegExp(">", "g");
        dataCopy.sparql = dataCopy.sparql.replace(reg,"&gt;");
        let dataTree = jsonTree.create(dataCopy, parsedQContDiv);
        
        if (!data.hasOwnProperty("error")) {
            downResBtn.disabled = false;
            resObj = data;
            
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
                let visalized = false;
                for(let matchId of data["matches"]){
                    let selOption = document.createElement("option");
                    selectElem.appendChild(selOption);
                    selOption.setAttribute("value", matchId);
                    selOption.innerHTML = matchId;
                    
                    if(!visalized && data.hasOwnProperty("workflow") 
                        && data["workflow"]){
                        visualizezWfGraphRemote(matchId);
                        visalized = true;
                        selOption.selected = true;
                        
                        // [SC][TODO][REMOVE]
                        /*let wfJsonObj = data["workflow"].find(elem => elem.hasOwnProperty(idP) && elem[idP] == matchId);
                        visualizezWfGraph(wfJsonObj);*/
                    }
                }
            }
        }
        
        removeDemoLoadScreen();
    })
    .catch(error => {
        // [SC][TODO][REMOVE]
        //parsedQCont.innerHTML = `Query Error: ${error}`;
        
        parsedQContDiv.innerHTML = `Query Error: <br> ${error}`;
        console.error('Error in fetch for query!', error);
        
        removeDemoLoadScreen();
    });;
}

// [SC][TODO]
// function checkQuestionStringValidity(){}

function parseOutputBlocklyJson(){
    let outputBlocklyJson = block_ner();
    parseBlocklyJson(outputBlocklyJson);
    bresult = {};
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