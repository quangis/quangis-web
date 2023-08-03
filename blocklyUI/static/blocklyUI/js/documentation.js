///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] tool documentation code

function createContainerElem(contTitle, anchorId){
    let mainElem = document.getElementById("main");
    
    let sidebarElem = document.getElementById("docSidebar");
    
    // [SC] update side navigation
    let ontNavA = document.createElement("a");
    sidebarElem.appendChild(ontNavA);
    ontNavA.setAttribute("href", anchorId);
    ontNavA.innerHTML = contTitle;
    
    // [SC] creat a container element
    let containerElem = document.createElement("div");
    mainElem.appendChild(containerElem);
    containerElem.setAttribute("class", "w-container");
    containerElem.setAttribute("id", anchorId);
    
    let titleElem = document.createElement("h2");
    containerElem.appendChild(titleElem);
    titleElem.setAttribute("class", "section-title");
    titleElem.innerHTML = contTitle;
    
    return containerElem;
}

function createSideNavElem(){
    let sidebarElem = document.getElementById("docSidebar");
    let navDiv = document.createElement("div");
    sidebarElem.appendChild(navDiv);
    navDiv.setAttribute("class", "subbar");
    
    return navDiv;
}

function createToolElem(toolName, navPrefix, contElem, navDiv){
    // [SC] create section elem that will contain all info for the tool
    let toolSect = document.createElement("section");
    contElem.appendChild(toolSect);
    toolSect.setAttribute("class", "toolL");
    
    // [SC] add tool title
    let titleP = document.createElement("p");
    toolSect.appendChild(titleP);
    titleP.setAttribute("class", "section-subtitle");
    titleP.setAttribute("id", `${navPrefix}${toolName}`);
    titleP.innerHTML = toolName;
    
    // [SC] update side navigation
    let navA = document.createElement("a");
    navDiv.appendChild(navA);
    navA.setAttribute("href", `#${navPrefix}${toolName}`);
    navA.innerHTML = toolName;
    
    return toolSect;
}

// [SC][TODO] update all calls of this function
function createToolFeatureSection(labelStr, toolSect){
    let featureSection = document.createElement("section");
    toolSect.appendChild(featureSection);
    featureSection.setAttribute("class", "featureL");
    
    let featureLabel = document.createElement("label");
    featureLabel.innerHTML = labelStr;
    featureSection.appendChild(featureLabel);

    return featureSection;
}

function createIODescr(ioLabel, ccdTypes, signSect){
    let paramParentRow = document.createElement("div");
    signSect.appendChild(paramParentRow);
    paramParentRow.setAttribute("class", "w-row parent");
    
    let paramHeadCol = document.createElement("div");
    paramParentRow.appendChild(paramHeadCol);
    paramHeadCol.setAttribute("class", "w-col w-col-1");
    paramHeadCol.innerHTML = ioLabel;
    
    let paramDescrCol = document.createElement("div");
    paramParentRow.appendChild(paramDescrCol);
    paramDescrCol.setAttribute("class", "w-col w-col-11");
    
    for(let paramType of ccdTypes){
        let typeName = parseUrlId(paramType);
        
        let paramDescrRow = document.createElement("div");
        paramDescrCol.appendChild(paramDescrRow);
        paramDescrRow.setAttribute("class", "w-row child");
        
        let paramTypeCol = document.createElement("div");
        paramDescrRow.appendChild(paramTypeCol);
        paramTypeCol.setAttribute("class", "w-col w-col-3");
        
        let navA = document.createElement("a");
        paramTypeCol.appendChild(navA);
        navA.setAttribute("target", "_blank");
        navA.setAttribute("href", `/docs-ccd#${typeName}`);
        navA.innerHTML = typeName; 
        
        let typeDescrCol = document.createElement("div");
        paramDescrRow.appendChild(typeDescrCol);
        typeDescrCol.setAttribute("class", "w-col w-col-9");
        typeDescrCol.innerHTML = "No description";
        
        if (ccdGraph){
            let typeObj = ccdGraph.find(elem => elem[idP] === paramType);
            
            if (typeObj){
                typeDescrCol.innerHTML = typeObj[commentP][0][valP];
            }
        }
    }
}

function generateAbsToolDoc(){
    if (!absToolGraph){
        return;
    }
    
    // [SC] this prefix is used to disambiguate the navigation IDs
    let navPrefix = "abs_";
    let supNavPrefix = "sup_";
    
    // [SC] create a container for all descriptions of abstract tools
    let containerElem = createContainerElem("Abstract Tools", "absToolsDocContainer");
    
    // [SC] create a container for side navbar that will contain all links
    let navDiv = createSideNavElem();
    
    // [SC] create a sorted list of tool names
    let sortedToolNames = [];
    let nameUriDict = {};
    for(let index=0; index<absToolGraph.length; index++){
        let nquad = absToolGraph[index];
        
        if (nquad[idP].includes(absToolUri)){
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
        let absToolDef = absToolGraph.find(elem => elem[idP] === nameUriDict[toolName]);
        
        // [SC] create the section that will contain all the info about this tool
        let toolSect = createToolElem(toolName, navPrefix, containerElem, navDiv);
        
        // [SC] create concept URI section
        let uriSect = createToolFeatureSection("Tool URI", toolSect);
        let uriP = document.createElement("p");
        uriSect.appendChild(uriP);
        uriP.innerHTML = absToolDef[idP];
        
        // [SC] add signature
        let signSect = createToolFeatureSection("Signature", toolSect);
        // [SC] add input descriptions
        for(let inputStub of absToolDef[tInputP]){
            let inputObj = absToolGraph.find(elem => elem[idP] === inputStub[idP]);
            let inputLab = `input${inputObj[tIdP][0][valP]}`;
            
            createIODescr(inputLab, inputObj[typeP], signSect);
        }
        // [SC] add output description
        let outputObj = absToolGraph.find(elem => elem[idP] === absToolDef[tOutputP][0][idP]);
        createIODescr("output", outputObj[typeP], signSect);
        
        // [SC] add tool comment
        if (absToolDef.hasOwnProperty(commentP) && absToolDef[commentP][0][valP]){
            let summarySect = createToolFeatureSection("Summary", toolSect);
            let summaryP = document.createElement("p");
            summarySect.appendChild(summaryP);
            summaryP.innerHTML = absToolDef[commentP][0][valP];
        }
        
        // [SC] add tool cct expression
        if (absToolDef.hasOwnProperty(cctExpP) && absToolDef[cctExpP][0][valP]){
            let algSect = createToolFeatureSection("CCT expression", toolSect);
            let algP = document.createElement("pre");
            algSect.appendChild(algP);
            algP.innerHTML = absToolDef[cctExpP][0][valP];
        }
        
        // [SC] add tool implementation
        if (absToolDef.hasOwnProperty(tImplP)) {
            // [SC] get the id of the tool implementing the abstract tool
            let implId = absToolDef[tImplP][0][idP];
            
            // [SC] if true, the abstract tool is implemented by an ArcGIS tool
            if (implId.includes(concToolUri) && conToolGraph && arcDataGraph){
                let arcToolStub = conToolGraph.find(elem => elem[idP] === implId);
                let arcToolDef = arcDataGraph.find(elem => elem[idP] === arcToolStub[seeAlsoP][0][idP]);
                
                if (arcToolDef){
                    let arcSect = createToolFeatureSection("Corresponding ArcPro tool", toolSect);
                    
                    let arcRowDiv = document.createElement("div");
                    arcSect.appendChild(arcRowDiv);
                    arcRowDiv.setAttribute("class", "w-row");
                    
                    let arcColDiv = document.createElement("div");
                    arcRowDiv.appendChild(arcColDiv);
                    arcColDiv.setAttribute("class", "w-col w-col-5");
                    
                    let arcA = document.createElement("a");
                    arcColDiv.appendChild(arcA);
                    arcA.setAttribute("href", arcToolDef[idP]);
                    arcA.setAttribute("target", "_blank");
                    arcA.innerHTML = arcToolDef[labelP][0][valP];
                    
                    arcColDiv = document.createElement("div");
                    arcRowDiv.appendChild(arcColDiv);
                    arcColDiv.setAttribute("class", "w-col w-col-7");
                    arcColDiv.innerHTML = arcToolDef[commentP][0][valP];
                }
            }
            // [SC] if true, the abstract tool is implemented by a supertool
            else if (implId.includes(superToolUri) && supToolGraph){                
                let superSect = createToolFeatureSection("Corresponding supertool", toolSect);
                let supToolName = parseUrlId(implId);

                // [SC] row for supertool name and comment
                let arcRowDiv = document.createElement("div");
                superSect.appendChild(arcRowDiv);
                arcRowDiv.setAttribute("class", "w-row");
                
                // [SC] add a column for the supertool name if it exists
                let arcColDiv = document.createElement("div");
                arcRowDiv.appendChild(arcColDiv);
                arcColDiv.setAttribute("class", "w-col");
                arcColDiv.setAttribute("id", `${supNavPrefix}${supToolName}`);
                arcColDiv.innerHTML = implId;
                
                // [SC] add a column for the supertool comment if it exists
                let superDef = supToolGraph.find(elem => elem[idP] === implId);
                if (superDef.hasOwnProperty(commentP) && superDef[commentP][0][valP]) {
                    let arcCommColDiv = document.createElement("div");
                    arcRowDiv.appendChild(arcCommColDiv);
                    arcCommColDiv.setAttribute("class", "w-col");
                    arcCommColDiv.innerHTML = `${superDef[commentP][0][valP]}`;
                }
                
                // [SC] create the section that contain the supertool workflow image
                let wfSect = createToolFeatureSection("Supertool workflow", toolSect);
                
                let graphDiv = document.createElement("div");
                wfSect.appendChild(graphDiv);
                graphDiv.setAttribute("class", "miniCyCont");
                
                let jsonWf = superToConcWf(implId, "_:tempDoc");
                if (jsonWf){
                    // [SC][TODO] disable listeners that show detailed info on node clicks
                    let cyElems = jsonLdToCytoscapeJson(jsonWf);
                    createWfCanvas(cyElems['elems'], graphDiv, false);
                }
            }
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
        
        // [SC] create concept URI section
        let uriSect = createToolFeatureSection("Concept URI", conceptSect);
        let uriP = document.createElement("p");
        uriSect.appendChild(uriP);
        uriP.innerHTML = nquad[idP];
        
        // [SC] add the concept summary
        if (nquad.hasOwnProperty(commentP) && nquad[commentP][0][valP]){
            let summarySect = createToolFeatureSection("Summary", conceptSect);
            let summaryP = document.createElement("p");
            summarySect.appendChild(summaryP);
            summaryP.innerHTML = nquad[commentP][0][valP];
        }
        
        // [SC] list constraints
        if (nquad.hasOwnProperty(eqClassP)) {
            let superSect = createToolFeatureSection("Constraints", conceptSect);
            
            let explP = document.createElement("p");
            superSect.appendChild(explP);
            
            let constrUL = document.createElement("ul");
            superSect.appendChild(constrUL);
            
            if (isValidUrl(nquad[eqClassP][0][idP])){
                let targetName = parseUrlId(nquad[eqClassP][0][idP]);
                explP.innerHTML = `
                    This concept ${conceptName} is equivalent to another concept <a href='#${targetName}'>${nquad[eqClassP][0][idP]}</a>
                `;
            }
            else {
                let eqClassObj = ccdGraph.find(elem => elem[idP] === nquad[eqClassP][0][idP]);
                if (eqClassObj[typeP][0] === classC){
                    if (eqClassObj.hasOwnProperty(intersectP)) {
                        explP.append(`Any concept is of type ${conceptName} if it satisfies all following constraints:`);
                        
                        for (let constrDef of eqClassObj[intersectP][0][listP]) {
                            let constrLI = document.createElement("li");
                            constrUL.appendChild(constrLI);
                            
                            if (isValidUrl(constrDef[idP])){
                                let targetName = parseUrlId(constrDef[idP]);
                                constrLI.innerHTML = `
                                    is a subclass of <a href='#${targetName}'>${targetName}</a>
                                `;
                            }
                            else{
                                let constObj = ccdGraph.find(elem => elem[idP] === constrDef[idP]);
                                if (constObj[typeP][0] === restrictC){
                                    let targetId = "";
                                    if (constObj.hasOwnProperty(someValP)){
                                        targetId = constObj[someValP][0][idP];
                                    }
                                    else if (constObj.hasOwnProperty(allValP)){
                                        targetId = constObj[allValP][0][idP];
                                    }
                                    
                                    if (constObj.hasOwnProperty(onPropP)){
                                        let targetName = parseUrlId(targetId);
                                        if (constObj[onPropP][0][idP] == ofDataSetP){
                                            constrLI.innerHTML = `
                                                belongs to <a href='#${targetName}'>${targetName}</a> dataset
                                            `;
                                        }
                                        else if (constObj[onPropP][0][idP] == hasElementP){
                                            constrLI.innerHTML = `
                                                has a property of <a href='#${targetName}'>${targetName}</a>
                                            `;
                                        }
                                        else if (constObj[onPropP][0][idP] == hasAttrP){
                                            constrLI.innerHTML = `
                                                has a <a href='#${targetName}'>${targetName}</a> geometry
                                            `;
                                        }
                                    }
                                }
                                else if (constObj[typeP][0] === classC){
                                    let targetName = parseUrlId(constObj[complOfP][0][idP]);
                                    if (constObj.hasOwnProperty(complOfP)){
                                        constrLI.innerHTML = `
                                            is subclass of any type that is not <a href='#${targetName}'>${targetName}</a>
                                        `;
                                    }
                                }
                            }
                        }
                    }
                    else if (eqClassObj.hasOwnProperty(unionP)) {
                        explP.append(`Any concept is of type ${conceptName} if it satisfies one or more following constraints:`);
                        
                        for (let constrDef of eqClassObj[unionP][0][listP]) {
                            let constrLI = document.createElement("li");
                            constrUL.appendChild(constrLI);
                            
                            if (isValidUrl(constrDef[idP])){
                                let targetName = parseUrlId(constrDef[idP]);
                                constrLI.innerHTML = `
                                    is a superclass of or a type of <a href='#${targetName}'>${targetName}</a>
                                `;
                            }
                        }
                    }
                }
                else if (eqClassObj[typeP][0] === restrictC){
                    explP.append(`Any concept is of type ${conceptName} if it satisfies all following constraints:`);
                    
                    let constrLI = document.createElement("li");
                    constrUL.appendChild(constrLI);
                    
                    let targetId = "";
                    if (eqClassObj.hasOwnProperty(someValP)){
                        targetId = eqClassObj[someValP][0][idP];
                    }
                    else if (eqClassObj.hasOwnProperty(allValP)){
                        targetId = eqClassObj[allValP][0][idP];
                    }
                    
                    if (eqClassObj.hasOwnProperty(onPropP)){
                        let targetName = parseUrlId(targetId);
                        if (eqClassObj[onPropP][0][idP] == ofDataSetP){
                            constrLI.innerHTML = `
                                belongs to <a href='#${targetName}'>${targetName}</a> dataset
                            `;
                        }
                        else if (eqClassObj[onPropP][0][idP] == hasElementP){
                            constrLI.innerHTML = `
                                has a property of <a href='#${targetName}'>${targetName}</a>
                            `;
                        }
                        else if (eqClassObj[onPropP][0][idP] == hasAttrP){
                            constrLI.innerHTML = `
                                has a <a href='#${targetName}'>${targetName}</a> geometry
                            `;
                        }
                    }
                }
            }
        }
        
        // [SC] list concept superclasses
        if (nquad.hasOwnProperty(subClassOfP)){
            let superSect = createToolFeatureSection("Superclasses", conceptSect);
            
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
        
        // [SC] list disjoint classes
        if (nquad.hasOwnProperty(disjointP)){
            let disjSect = createToolFeatureSection("Disjoint classes", conceptSect);
            
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
    let dsInclElems = [ // [SC][TODO] this a quick fix
        "Point", "Region", "Line", "Spatial", "LineData", 
        "SpatialData", "PointData", "RegionData"
    ];
    
    let rootA = "http://geographicknowledge.de/vocab/CoreConceptData.rdf#Attribute";
    let aNquads = [];
    let aElems = [];
    let aIncElem = ["Attribute"];
    
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
        
            if (nquad[idP] === rootDS || isSubClassOf(nquad, dsNquads) 
                || dsInclElems.includes(parseUrlId(nquad[idP]))){
                dsNquads.push(nquad);
                removeNquad = true;
            }
            else if(nquad[idP] === rootA || isSubClassOf(nquad, aNquads) 
                || aIncElem.includes(parseUrlId(nquad[idP]))){ 
                aNquads.push(nquad);
                removeNquad = true;
            }
            
            if (removeNquad){
                nquadsToRemove.push(nquad);
            }
        }
        
        currIter += 1;

        if (nquadsToRemove.length != 0){
            for(let index=0; index<nquadsToRemove.length; index++){
                ccdGraphCopy.splice(ccdGraphCopy.indexOf(nquadsToRemove[index]), 1);
            }
        } else{
            break;
        }
    }
    
    createCyElems(aElems, aNquads, "aSection", "Dataset Attribute Ontology");
    createCyElems(dsElems, dsNquads, "dsSection", "Dataset ontology");
}

///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] Algebra expression documentation code

function generateAlgDoc(){
    if (!algGraph){
        return;
    }
    
    // [SC] case insensitive sort
    algGraph = algGraph.sort(function (a, b) {        
        return a[idP].toLowerCase().localeCompare(b[idP].toLowerCase());
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
        if (!nquad.hasOwnProperty(typeP)){
            continue;
        }
        
        if (nquad[typeP][0] !== cctOperC){
            continue;
        }
        
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
            let summarySect = createToolFeatureSection("Summary", conceptSect);
            let summaryP = document.createElement("p");
            summarySect.appendChild(summaryP);
            summaryP.innerHTML = nquad[commentP][0][valP];
        }
        
        // [SC] operation signature
        if (nquad.hasOwnProperty(cctSignP) && nquad[cctSignP][0][valP]){
            let aSignSect = createToolFeatureSection("Signature", conceptSect);
            let aSignPTag = document.createElement("p");
            aSignSect.appendChild(aSignPTag);
            aSignPTag.innerText = nquad[cctSignP][0][valP];
        }
    }
}