# quangis-web

The web interface that brings all the different components of the 
QuAnGIS project together into a single pipeline.


## Overview

#### Workflow specifier/generator

The *workflow repository* contains possible GIS workflows that might 
solve a user's task. At the moment, it contains only [example 
workflows][wf]. However, eventually, the [`workflow-synthesis`][wfs] 
module will be used to pre-generate workflows.

To this end, the inputs and outputs of GIS [tools][tls] are annotated 
with [core concept data types][ccd]. We then use [APE][ape] to discover 
sensible workflows in which those tools are used.

(The *specifier* would find meaningful combinations of input/output CCD 
types for the transformation algebra query at hand, suggesting that 
workflows are also generated on-the-fly.)


#### Transformation algebra abstractor

Each workflow in the workflow repository is enriched with a 
*transformation graph*. This is a directed acyclic graph, with core 
concepts of geographical information encoded as [CCT][cct] types at the 
nodes. The edges represent transformations between these concepts.

These transformation graphs are constructed automatically. A workflow 
simply connects individual tool applications, and we have manually 
annotated the [tools][tls] with [CCT][cct] expressions that capture the 
underlying conceptual transformation. The [`transformation-algebra`][ta] 
library parses these expressions into subgraphs for every tool 
application. It then stitches them together, using type inference to 
find the correct [CCT][cct] types at every node.


#### Query formulator

A *web interface* presents users with a constrained natural language, 
using [blockly][blo]. The interface passes the user's question on to the 
rest of the pipeline. The implementation can be found in the current 
repository.


#### Query translator

The user's input is parsed into a tree and then further into a 
*transformation query*, which is essentially a transformation graph that 
represents only parts of the workflow. Leaf nodes may have keywords, to 
be matched with possible data sources. This is implemented in the 
[`geo-question-parser`][gqp] module.


#### Query executor

The transformation query is matched against the transformation graphs in 
the workflow repository. To this end, the transformation query is 
converted to a SPARQL query via the [`transformation-algebra`][ta] 
library and sent to a triple store such as [MarkLogic][ml] or the 
open-source [Apache Jena Fuseki][fus]. This yields a set of workflows 
that are presented back to the user as possible solutions to their task.


#### Data reifier

To be implemented. Finds suitable input data sources to concretize the 
queried workflow. The data repository contains sources that are manually 
or automatically annotated with text descriptions and 
[CCD][ccd]/[CCT][cct] types.


## Installation

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


[cnd]: https://repo.anaconda.com/miniconda/
[cnl]: https://docs.conda.io/projects/conda/en/latest/user-guide/install/rpm-debian.html
[ml]:  https://www.marklogic.com/
[fus]: https://jena.apache.org/documentation/fuseki2/
[blo]: https://developers.google.com/blockly/
[ccd]: https://github.com/simonscheider/QuAnGIS/tree/master/Ontology/CoreConceptData.ttl
[ape]: https://github.com/sanctuuary/APE
[apy]: https://github.com/quangis/pyAPE
[wfs]: https://github.com/quangis/workflow-synthesis
[gqp]: https://github.com/quangis/geo-question-parser
[ta]:  https://github.com/quangis/transformation-algebra
[cct]: https://github.com/quangis/cct
[tls]: https://github.com/quangis/cct/blob/master/tools/tools.ttl
[wf]:  https://github.com/quangis/cct/blob/master/workflows/
[web]: https://github.com/quangis/quangis-web
