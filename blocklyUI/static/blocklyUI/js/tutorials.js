///////////////////////////////////////////////////////////////////////////////////////////
////// [SC] Toturial page code

// [SC] This script should be at the bottom of the page, or called by the onload event.
function createBlocklyDoc(){
    console.log("createBlocklyDoc method called.");
    
    // [SC] get the sidebar
    let sidebarElem = document.getElementById("docSidebar");
    // [SC] create sub link container
    let navDiv = document.createElement("div");
    sidebarElem.appendChild(navDiv);
    navDiv.setAttribute("class", "subbar");

    // [SC] create a dummy workspace to render blocks. 
    let docWs = Blockly.inject("docWsCont", {
        comments: false,
        toolbox: false,
        trashcan: false,
        readOnly: true,
        scrollbars: false,
        zoom: false
    });
    
    // [SC] get container elements
    let blocklyDocElem = document.getElementById("blocklyDocElem");
    let blockOverviewElem = document.getElementById("blockOverviewSec");
    // [SC] used to adjust blockly block svg elem rendering size
    let svgWidth = "100%";
    let svgHeight = "50";
    let svgHeightSide = "50";
    
    // [SC] sort blocks by order number
    let qBlocksS = qBlocks.sort((a, b) => {
        if (a.custom.order < b.custom.order) {
            return -1;
        }
    });
    
    // [SC] generate g tags with SVG images for all blocks 
    // [SC] generate an overview of all blocks
    let gTags = {};
    let overElems = {};
    for(let blockDef of qBlocksS){
        // [SC] make sure it has an explicitly assigned category, otherwise skip
        let cat = blockDef["custom"]["category"];
        if (!(Array.isArray(cat) && cat.length)){
            continue;
        }
        
        // [SC] generate the g element for the block
        let tempBlock = docWs.newBlock(blockDef["type"]);
        tempBlock.initSvg();
        tempBlock.render();
        let gElem = tempBlock.getSvgRoot();
        let gWidth = Math.round(gElem.getBBox().width)+10;
        let gHeight = Math.round(gElem.getBBox().height)+10;
        gTags[blockDef["type"]] = {"g": gElem, "gWidth": gWidth, "gHeight": gHeight};
        
        // [SC] generate or retrieve the subsection that should contain the block image
        let overElem = null;
        if (overElems.hasOwnProperty(blockDef.custom.type)) {
            overElem = overElems[blockDef.custom.type];
        } else{
            overElem = document.createElement("section");
            blockOverviewElem.appendChild(overElem);
            overElem.setAttribute("class", "featureL");
            overElems[blockDef.custom.type] = overElem;
            
            let typeLabel = document.createElement("label");
            overElem.appendChild(typeLabel);
            typeLabel.innerHTML = blockDef.custom.type;
        }
        
        // [SC] generate a hyperlink to the block's definition
        let blockA = document.createElement("a");
        overElem.appendChild(blockA);
        blockA.setAttribute("href", `#${blockDef.type}`);
        // [SC] generate a svg element for the block
        let currHeight = ((svgHeight < gHeight) ? svgHeight : gHeight);
        let currWidth = gWidth*currHeight/gHeight;
        let svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        blockA.appendChild(svgElem);
        svgElem.setAttribute("width", currWidth);
        svgElem.setAttribute("height", currHeight);
        svgElem.setAttribute("viewBox", `0 0 ${gWidth} ${gHeight}`);
        svgElem.appendChild(gElem);
    }
    // [SC] create a sidebar link for the overview
    let navA = document.createElement("a");
    navDiv.appendChild(navA);
    navA.setAttribute("href", "#blockOverviewSec");
    navA.innerHTML = "Overview of All Blocks";
    
    // [SC] generate documentation for each block
    for(let blockDef of qBlocksS){
        // [SC] make sure it has an explicitly assigned category, otherwise skip
        let cat = blockDef["custom"]["category"];
        if (!(Array.isArray(cat) && cat.length)){
            continue;
        }
        
        let gElem = gTags[blockDef["type"]]["g"];
        let gWidth = gTags[blockDef["type"]]["gWidth"];
        let gHeight = gTags[blockDef["type"]]["gHeight"];
        
        // [SC] create container sections
        let sectToolL = document.createElement("section");
        sectToolL.setAttribute("id", blockDef["type"]);
        sectToolL.setAttribute("class", "toolL");
        blocklyDocElem.appendChild(sectToolL);
        // [SC] create title using the block's type
        let subtitleP = document.createElement("p");
        sectToolL.appendChild(subtitleP);
        subtitleP.setAttribute("class", "section-subtitle");
        subtitleP.innerHTML = `\"${blockDef["type"]}\" block`;
        // [SC] create inner section
        let sectFeatL = document.createElement("section");
        sectFeatL.setAttribute("class", "featureL");
        sectToolL.appendChild(sectFeatL);
        
        // [SC] create a header row
        let headRowDiv = document.createElement("div");
        headRowDiv.setAttribute("class", "w-row parent");
        sectFeatL.appendChild(headRowDiv);
        // [SC] create other header columns
        for (let colName of ["This block fits in these blocks", "", "Blocks that fit in this block"]){
            let headCol = document.createElement("div");
            headCol.setAttribute("class", "w-col w-col-4");
            headRowDiv.appendChild(headCol);
            let headLab = document.createElement("label");
            headLab.setAttribute("class", "inline");
            headLab.innerHTML = colName;
            headCol.appendChild(headLab);
        }
        
        // [SC] create a content row
        let contRowDiv = document.createElement("div");
        contRowDiv.setAttribute("class", "w-row parent");
        sectFeatL.append(contRowDiv); 
        // [SC] create a block info col
        let contColBlock = document.createElement("div");
        contColBlock.setAttribute("class", "w-col w-col-4");
        // [SC] create a new SVG elem and append the g elem with blockly image into it
        let imageLab = document.createElement("label");
        contColBlock.appendChild(imageLab);
        imageLab.setAttribute("class", "inline");
        imageLab.innerHTML = "Block visual:";
        // [SC] create a new SVG elem and append the g elem with blockly image into it
        let blockSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        contColBlock.appendChild(blockSvg);
        blockSvg.setAttribute("width", svgWidth);
        blockSvg.setAttribute("height", svgHeight);
        blockSvg.setAttribute("viewBox", `0 0 ${gWidth} ${gHeight}`);
        blockSvg.append(gElem.cloneNode(true));
        // [SC] create block custom type info
        let typeDiv = document.createElement("div");
        contColBlock.appendChild(typeDiv);
        let typeLab = document.createElement("label");
        typeDiv.appendChild(typeLab);
        typeLab.setAttribute("class", "inline");
        typeLab.innerHTML = "Type:";
        typeDiv.innerHTML += ` ${blockDef["custom"]["type"]}`;
        // [SC] create block custom category info
        let catDiv = document.createElement("div");
        contColBlock.appendChild(catDiv);
        let catLab = document.createElement("label");
        catDiv.appendChild(catLab);
        catLab.setAttribute("class", "inline");
        catLab.innerHTML = "Category:";
        catDiv.innerHTML += ` ${blockDef["custom"]["category"].join(", ")}`;
        // [SC] create block tooltip info
        let tipDiv = document.createElement("div");
        contColBlock.appendChild(tipDiv);
        let tipLab = document.createElement("label");
        tipDiv.appendChild(tipLab);
        tipLab.setAttribute("class", "inline");
        tipLab.innerHTML = "Tooltip:";
        tipDiv.innerHTML += ` ${blockDef["tooltip"]}`;
        // [SC] create block description info
        let descDiv = document.createElement("div");
        contColBlock.appendChild(descDiv);
        let descLab = document.createElement("label");
        descDiv.appendChild(descLab);
        descLab.setAttribute("class", "inline");
        descLab.innerHTML = "Description:";
        descDiv.innerHTML += ` ${blockDef["custom"]["text"]}`;
        
        // [SC] create a block output col
        let contColOutput = document.createElement("div");
        contColOutput.setAttribute("class", "w-col w-col-4");
        // [SC] create a block input col
        let contColInput = document.createElement("div");
        contColInput.setAttribute("class", "w-col w-col-4");
        
        // [SC] add the cols to the row
        contRowDiv.appendChild(contColOutput);
        contRowDiv.appendChild(contColBlock);
        contRowDiv.appendChild(contColInput);
        
        // [SC] get block's output type
        let outputType = null;
        if (blockDef.hasOwnProperty("output")){
            outputType = blockDef.output;
        }
        // [SC] get types of previous statement blocks that this block can be attached to
        let prevTypes = [];
        if (blockDef.hasOwnProperty("previousStatement")){
            if (Array.isArray(blockDef.previousStatement)) {
                prevTypes.push.apply(prevTypes, blockDef.previousStatement);
            } else{
                prevTypes.push(blockDef.previousStatement);
            }
        }
        
        // [SC] get the types of input blocks and input statements that can be connected to this block
        let inputTypes = [];
        let inputStates = [];
        if (blockDef.hasOwnProperty("args0")){
            for(let argObj of blockDef["args0"]){
                if (argObj.type === "input_value"){
                    inputTypes.push(argObj.check);
                }
                else if (argObj.type === "input_statement"){
                    inputStates.push(argObj.check);
                }
            }
        }
        // [SC] get the types of blocks that can be connected to this block as statements
        let nextTypes = [];
        if (blockDef.hasOwnProperty("nextStatement")){
            if (Array.isArray(blockDef.nextStatement)) {
                nextTypes.push.apply(nextTypes, blockDef.nextStatement);
            } else{
                nextTypes.push(blockDef.nextStatement);
            }
        }
        
        // [SC] find all blocks that this block can connect to and can be connected to
        for(let sBlockDef of qBlocksS){
            // [SC] ignore shadow blocks without category
            let cat = sBlockDef["custom"]["category"];
            if (!(Array.isArray(cat) && cat.length)){
                continue;
            }
            // [SC] avoid the same block
            if (blockDef.type === sBlockDef.type){
                continue;
            }
        
            let addOrgFlag = false;
            let addToOrgFlag = false;
        
            // [SC] original block's output type matches an input type of the second blocks
            if (!addOrgFlag && outputType && sBlockDef.hasOwnProperty("args0")){
                for(let argObj of sBlockDef["args0"]){
                    if ((argObj.type === "input_value" || argObj.type === "input_statement") 
                        && argObj.check === outputType){
                        addOrgFlag = true;
                        break;
                    }
                }
            }
            
            // [SC] original block's previous statement type matches an input statement type of the second blocks
            if (!addOrgFlag && prevTypes.length && sBlockDef.hasOwnProperty("args0")){
                for(let argObj of sBlockDef["args0"]){
                    if (argObj.type === "input_statement" && prevTypes.includes(argObj.check)){
                        addOrgFlag = true;
                        break;
                    }
                }
            }
            
            // [SC] original block's previous statement type matches a next statement type of the second blocks
            if (!addOrgFlag && prevTypes.length && sBlockDef.hasOwnProperty("nextStatement")){
                if (Array.isArray(sBlockDef.nextStatement) && 
                    (prevTypes.filter(value => sBlockDef.nextStatement.includes(value))).length) {
                    addOrgFlag = true;
                } else if (prevTypes.includes(sBlockDef.nextStatement)){
                    addOrgFlag = true;
                }
            }
            
            // [SC] add an svg element for the second block
            if (addOrgFlag) {
                let outA = document.createElement("a");
                contColOutput.appendChild(outA);
                outA.setAttribute("href", `#${sBlockDef.type}`);
                
                let ogElem = gTags[sBlockDef["type"]]["g"];
                let ogWidth = gTags[sBlockDef["type"]]["gWidth"];
                let ogHeight = gTags[sBlockDef["type"]]["gHeight"];
                
                let maxWidth = contColOutput.clientWidth-10;
                let currHeight = ((svgHeightSide < ogHeight) ? svgHeightSide : ogHeight);
                let currWidth = ogWidth*currHeight/ogHeight;                                
                if (currWidth > maxWidth) {
                    currWidth = maxWidth;
                    currHeight = ogHeight*currWidth/ogWidth;
                }
                
                let outSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                outA.appendChild(outSvg);
                outSvg.setAttribute("width", currWidth);
                outSvg.setAttribute("height", currHeight);
                outSvg.setAttribute("viewBox", `0 0 ${ogWidth} ${ogHeight}`);
                outSvg.appendChild(ogElem.cloneNode(true));
            }
            
            // [SC] the second block's output type matches the original block's input type
            if (!addToOrgFlag && sBlockDef.hasOwnProperty("output") && inputTypes.length) {
                if (inputTypes.includes(sBlockDef.output)){
                    addToOrgFlag = true;
                }
            }
            
            // [SC] the second block's output type matches the original block's input type
            // [SC][TODO] is it necessary? can output match to statement input type?
            if (!addToOrgFlag && sBlockDef.hasOwnProperty("output") && inputStates.length) {
                if (inputStates.includes(sBlockDef.output)){
                    addToOrgFlag = true;
                }
            }
            
            // [SC] the second block's previous statement type matches an input statement type of the original blocks
            if (!addToOrgFlag && sBlockDef.hasOwnProperty("previousStatement") && inputStates.length) {
                if (Array.isArray(sBlockDef.previousStatement) && 
                    (inputStates.filter(value => sBlockDef.previousStatement.includes(value))).length) {
                    addToOrgFlag = true;
                } else if (inputStates.includes(sBlockDef.previousStatement)){
                    addToOrgFlag = true;
                }
            }
            
            // [SC] the second block's previous statement type matches a next statement type of the original blocks
            if (!addToOrgFlag && sBlockDef.hasOwnProperty("previousStatement") && nextTypes.length){
                if (Array.isArray(sBlockDef.previousStatement) && 
                    (nextTypes.filter(value => sBlockDef.previousStatement.includes(value))).length) {
                    addToOrgFlag = true;
                } else if (nextTypes.includes(sBlockDef.previousStatement)){
                    addToOrgFlag = true;
                }
            }
            
            // [SC] add an svg element for the second block
            if (addToOrgFlag) {
                let inA = document.createElement("a");
                contColInput.appendChild(inA);
                inA.setAttribute("href", `#${sBlockDef.type}`);
                
                let igElem = gTags[sBlockDef["type"]]["g"];
                let igWidth = gTags[sBlockDef["type"]]["gWidth"];
                let igHeight = gTags[sBlockDef["type"]]["gHeight"];
                
                let maxWidth = contColInput.clientWidth-10;
                let currHeight = ((svgHeightSide < igHeight) ? svgHeightSide : igHeight);
                let currWidth = igWidth*currHeight/igHeight;
                if (currWidth > maxWidth) {
                    currWidth = maxWidth;
                    currHeight = igHeight*currWidth/igWidth;
                }
                
                let inSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                inA.appendChild(inSvg);
                inSvg.setAttribute("width", currWidth);
                inSvg.setAttribute("height", currHeight);
                inSvg.setAttribute("viewBox", `0 0 ${igWidth} ${igHeight}`);
                inSvg.appendChild(igElem.cloneNode(true));
            }
        }
        
        // [SC] create a sidebar link for the block definition
        let bNavA = document.createElement("a");
        navDiv.appendChild(bNavA);
        bNavA.setAttribute("href", `#${blockDef["type"]}`);
        bNavA.innerHTML = `\"${blockDef["type"]}\" block`;
    }

    // [SC] dispose of the temporary blockly workspace
    // [SC][TODO] resolve these errors; the error also occurs when the browser window is resized
    try { docWs.clear(); }
    catch(e) { console.log(e); }
    try { docWs.dispose(); }
    catch(e) { console.log(e); }
}
