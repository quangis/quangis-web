# quangis-web

The web interface that brings all the different components of the 
QuAnGIS project together into a single pipeline.

1.  [Overview](#overview)
    -   [Workflow generator](#workflow-generator)
    -   [Algebra abstractor](#algebra-abstractor)
    -   [Query formulator](#query-formulator)
    -   [Query translator](#query-translator)
    -   [Query executor](#query-executor)
    -   [Data reifier](#data-reifier)
2.  [Usage](#usage)
    -   [Setting up the environment](#setting-up-the-environment)
    -   [Setting up JavaScript libraries](#setting-up-javascript-libraries)
    -   [Loading data](#loading-data)


## Overview

#### Workflow generator

The *workflow repository* contains possible GIS workflows that might 
solve a user's task. At the moment, it contains only [example 
workflows][wf]. However, eventually, the [`workflow-synthesis`][wfs] 
module will be used to pre-generate workflows. This module interfaces 
with the [Automated Pipeline Explorer][ape] via [`apey`][apy] to 
discover sensible workflows. It does this by matching [core concept data 
types][ccd] of the [GIS tools'][tls] inputs and outputs.

(The *workflow specifier* would find meaningful combinations of 
input/output CCD types for the transformation algebra query at hand, 
suggesting that workflows are also generated on-the-fly.)


#### Algebra abstractor

Each workflow in the workflow repository is enriched with a 
*transformation graph*. This is a directed acyclic graph with core 
concepts of geographical information encoded as [CCT][cct] types at the 
nodes. The edges represent transformations between these concepts.

These graphs are constructed automatically. We have manually annotated 
the [tools][tls] with [CCT][cct] expressions that capture the underlying 
conceptual transformation. A workflow connects individual tool 
applications, each of them now associated with a CCT expression that is 
parsed into a subgraph by the [`transformation-algebra`][ta] library. 
The library then stitches the subgraphs together, using type inference 
to find the most specific type at every node.

#### Query formulator

A *web interface* presents users with a constrained natural language, 
using [`blockly`][blo]. The interface passes the user's question on to 
the rest of the pipeline. At the end of the pipeline, it presents a set 
of workflows to the user as possible solutions to their task. The 
implementation is in this repository, [`quangis-web`][web].


#### Query translator

The user's natural language question is parsed into a tree and then 
further into a *transformation query*, which is essentially a 
transformation graph that represents only parts of the workflow. Leaf 
nodes may have keywords, to be matched with possible data sources. This 
is implemented in the [`geo-question-parser`][gqp] module.


#### Query executor

The transformation query is matched against the transformation graphs in 
the workflow repository. To this end, the transformation query is 
converted to a SPARQL query via the [`transformation-algebra`][ta] 
library and sent to a triple store such as [MarkLogic][ml] or the 
open-source [Apache Jena Fuseki][fus]. This yields a set of workflows 
that may solve the user's task.


#### Data reifier

To be implemented. Finds suitable input data sources to concretize the 
queried workflow. The data repository contains sources that are manually 
or automatically annotated with text descriptions and 
[CCD][ccd]/[CCT][cct] types.


## Usage

#### Setting up the environment

There are myriad ways to manage Python packages and environments. We 
have chosen [Miniconda][cnd]; also see [instructions for Linux][cnl]. 
After installing it, create and activate the `quangis` environment:

    conda env create --file environment.yml
    conda activate quangis

After the environment is set up, make sure that you have downloaded 
relevant data files:

    python -m spacy download en_core_web_sm
    python -m nltk.downloader averaged_perceptron_tagger omw-1.4


#### Setting up JavaScript libraries

We use the [`blockly`][blo], [`cytoscape`][cts] and [`klay`][kly] 
JavaScript libraries. For now, these are just bundled as static JS 
files; we will need a maintainable front-end workflow in the future. 
(Also, `klay` is deprecated.)

    npm install
    cp  node_modules/blockly/blockly.min.js \
        node_modules/cytoscape/dist/cytoscape.min.js \
        node_modules/cytoscape-klay/cytoscape-klay.js \
        node_modules/klay/klay.js \
        blocklyUI/static/blocklyUI/js/


#### Loading data

The [`cct`][cct] repository contains example workflows. These can be 
augmented with their transformation graphs using the tools in that 
repository:

    make build/everything.ttl

This will produce `everything.ttl` in the `build/` directory. For 
MarkLogic, these triples can be [loaded][mls84491] into the database via 
its [REST API][mlrest] (for now, just into the default graph):

    curl -s -X PUT --data-binary '@everything.ttl' \
        -H "Content-type: application/turle" \
        --digest --user "<user>:<pass>" \
        "http://<server>:8000/v1/graphs?default"


### Running the server

During debugging, we can use the built-in Django test server. However, 
do set environment variables with the appropriate secrets:

    DJANGO_KEY=… TDB_USER=… TDB_PASS=… python manage.py runserver 3000

Or, on Windows:

    set DJANGO_KEY=… & TDB_USER=… & TDB_PASS=… & python manage.py runserver 3000


<!-- References -->

[cnd]: https://repo.anaconda.com/miniconda/
[ml]:  https://www.marklogic.com/
[fus]: https://jena.apache.org/documentation/fuseki2/
[blo]: https://developers.google.com/blockly/
[cts]: https://cytoscape.org/
[kly]: https://github.com/kieler/klayjs
[ccd]: https://github.com/simonscheider/QuAnGIS/tree/master/Ontology/CoreConceptData.ttl
[ape]: https://github.com/sanctuuary/APE
[apy]: https://github.com/quangis/apey
[wfs]: https://github.com/quangis/workflow-synthesis
[gqp]: https://github.com/quangis/geo-question-parser
[ta]:  https://github.com/quangis/transformation-algebra
[cct]: https://github.com/quangis/cct
[tls]: https://github.com/quangis/cct/blob/master/tools/tools.ttl
[wf]:  https://github.com/quangis/cct/blob/master/workflows/
[web]: https://github.com/quangis/quangis-web
[cnl]: https://docs.conda.io/projects/conda/en/latest/user-guide/install/rpm-debian.html
[mls84491]: https://docs.marklogic.com/guide/semantics/loading#id_84491
[mlrest]: https://docs.marklogic.com/guide/semantics/REST
