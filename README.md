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
2.  [Setting up the web application (for Windows)](#setting-up-the-web-application-(for-windows))
    -   [Setup question parser server](#setup-question-parser-server)
        -   [Configuring a conda environment to run the question parser server](#configuring-a-conda-environment-to-run-the-question-parser-server)
        -   [Running the question parser server](#running-the-question-parser-server)
    -   [Setup Django server](#setup-django-server)
        -   [Configuring a conda environment for the Django server](#configuring-a-conda-environment-for-the-django-server)
        -   [Running the Django server in a test mode](#running-the-django-server-in-a-test-mode)
        -   [Django server production deployment](#django-server-production-deployment)
    -   [Loading data to MarkLogic](#loading-data-to-marklogic)

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


# Setting up the web application (for Windows)

## Setup question parser server

#### Configuring a conda environment to run the question parser server
    
1.Install the 64-Bit version of Miniconda 4.10.3  from (https://repo.anaconda.com/miniconda/) (Windows,MaxOS and Linux).

2.Install Git (https://git-scm.com/downloads).

3.Open a new window of anaconda prompt. Create a new conda environment with a name “*D:/condaEnv/qparserSOA*”. This creates the conda environment inside the folder “*D:/condaEnv/qparserSOA*”.

    conda create -p D:/condaEnv/qparserSOA python=3.9.7

4.Activate the new environment:

    conda activate D:/condaEnv/qparserSOA

5.Move to the folder *qparserSOA*. Packages from github will be installed here. 

    d:
    
    cd D:\condaEnv\qparserSOA

6.Install *allennlp* package

    pip install allennlp 

7.Install *allennlp-models* package

    pip install allennlp-models

8.Install *spacy* package from conda-forge

    conda install -c conda-forge spacy

9.Install *spacy* trained pipeline. If the installation throws error, then try executing the command again.

    python -m spacy download en_core_web_sm

10.Install other packages from conda-forge:

    conda install -c conda-forge antlr4-python3-runtime=4.9.3 word2number pyzmq nltk 

11.Install *nltk* modules:

    python -m nltk.downloader averaged_perceptron_tagger
    
    python -m nltk.downloader omw-1.4

12.Optionally, it may be necessary to install the checklist package:
    
    pip install checklist

13.Install the *question parser* package from github:

    pip install --editable=git+https://github.com/quangis/geo-question-parser.git#egg=geo-question-parser


#### Running the question parser server
    
14.Make sure “*D:/condaEnv/qparserSOA*” is activated in the anaconda prompt.

15.In the anaconda prompt, navigate to the folder “*D:/condaEnv/qparserSOA/src/geo-question-parser/geo_question_parser*”. This folder should contain the batch file “*runAsyncWorker.bat*”.

16.Run the batch file by typing
    
    runAsyncWorker.bat

17.If the server starts correctly then you should see a message like below:

    error loading _jsonnet (this is expected on Windows), treating config.json as plain json
    INFO: Bound broker frontend to 'tcp://127.0.0.1:5570' in method 'QparserBroker.run'
    INFO: Bound broker backend to an inter-process port 'inproc://backend' in method 'QparserBroker.run'
    INFO: Started worker '0' on a inter-process socket 'inproc://backend' in method 'QparserWorker.run'
    INFO: Started worker '1' on a inter-process socket 'inproc://backend' in method 'QparserWorker.run'
    INFO: Started worker '2' on a inter-process socket 'inproc://backend' in method 'QparserWorker.run'
    INFO: Started the poller in the broker in method 'QparserBroker.run'

18.To stop the server press the combo “*Ctrl+C*” in the anaconda prompt. Enter ‘*Y*’ when asked “*Terminate batch job (Y/N)?*”.

19.Two parameters can be changed in the batch file “*runAsyncWorker.bat*”. “*FRONT_PORT*” sets to which port server should be bound to. “*INST_COUNT*” sets the number of concurrent worker threads. In other words, it is the number of requests the server can handle simultaneously without requests blocking each other. For example, if “*INST_COUNT*” is set to 1 then only one request is processed at the time, and all other incoming requests are queued until the current request is handled.  “*INST_COUNT*” can be any integer number above 0.


## Setup Django server

#### Configuring a conda environment for the Django server

1.Install the 64-Bit version of Miniconda 4.10.3 from (https://repo.anaconda.com/miniconda/) (Windows,MaxOS and Linux). Skip this step if you have already done so in the previous guides.

2.Install Git (https://git-scm.com/downloads). Skip this step if you have already done so in the previous guides.

3.Open a new window of anaconda prompt. Using the command below, create a new conda environment with a name “*D:/condaEnv/djangoEnv*”. This creates the conda environment inside the folder “*D:/condaEnv/djangoEnv*”.

    conda create -p D:/condaEnv/djangoEnv python=3.9.7

4.Activate the new environment:

    conda activate D:/condaEnv/djangoEnv

5.Move to the folder *djangoEnv*. Packages from github will be installed here.

    d:
    
    cd D:\condaEnv\djangoEnv

6.Install packages from conda-forge:
    
    conda install -c conda-forge django rdflib plumbum pyzmq

7.Install *transformation algebra* and *cct* packages from github:

    pip install --editable=git+https://github.com/quangis/transformation-algebra.git@develop#egg=transformation-algebra

    pip install --editable=git+https://github.com/quangis/cct.git#egg=cct


#### Running the Django server in a test mode

8.Download the github source code and unpack to some folder, e.g., “*D:/quangisWeb*”.

9.The folder “*D:/quangisWeb*” should contain the batch file “*runTest.bat*”.

10.To configure the test server, open the file “*runTest.bat*” in a text editor and change the parameters according to your preferences and the setup of the question parser server. Here is an example:

    set DJANGO_KEY=someRandomKey218478934_ds9394734
    set TDB_USER=someUsername
    set TDB_PASS=somePassword
    set QPARSE_IP=localhost
    set QPARSE_PORT=5570
    set QPARSE_WAIT=60000
    python manage.py runserver 8081

11.Make sure “*D:/condaEnv/djangoEnv*” is activated in the anaconda prompt.

12.In the anaconda prompt, navigate to the folder “*D:/quangisWeb*” and run the batch file “*runTest.bat*”. 

13.If the server starts correctly then you should see a message like below:

    Django version 4.1.1, using settings 'quAnGisWeb.settings'
    Starting development server at http://127.0.0.1:8081/
    Quit the server with CTRL-BREAK.

14.To test if the server is running properly, try opening the server address (e.g., http://127.0.0.1:8081/) in a browser.

15.To stop the server press the combo “*Ctrl+C*” in the anaconda prompt. Enter ‘*Y*’ when asked “*Terminate batch job (Y/N)?*”.


#### Django server production deployment

1.Make sure to install Microsoft Visual C++ 14.0 (64-bit) or greater is installed. Go to https://visualstudio.microsoft.com/downloads/ under *Tools for Visual Studio* download *Build Tools for Visual Studio 2022*. Run Build Tools for Visual Studio, under *Workload* select *Desktop development with C++* and install it. You may need to restart Windows after the installation is complete.

2.Make sure Visual C++ Redistributable for Visual Studio 2015-2019 x64 is installed. If not, download and install it from https://www.apachelounge.com/download/ 

3.Download Apache server binary distribution for Win64 from https://www.apachelounge.com/download/

4.Unzip the *Apache24* folder to “*d:/Apache24*” (the default *ServerRoot* in the config is *c:/Apache24*). In file “*d:/Apache24/conf/httpd.conf*”, change the following line:

    Define SRVROOT "d:/Apache24"

5.To test run the Apache server, (1) run “*d:\Apache24\bin\httpd.exe*” in miniconda prompt and (2) open http://localhost in a browser. You should see “*It Works!*” message in the browser. Stop the apache server by pressing the combo “*Ctrl+C*” in the anaconda prompt.

6.To install mod_wsgi, make sure the “*D:/condaEnv/djangoEnv*” environment is active in the miniconda prompt. In the prompt, run the following two commands:
    
    set MOD_WSGI_APACHE_ROOTDIR=d:/Apache24
    
    pip install mod_wsgi

7.Get module configuration by running command below
    
    mod_wsgi-express module-config

8.Copy the output of the previous command into your Apache's *httpd.conf*. The output should look like this:

    LoadFile "D:/condaEnv/djangoEnv/python39.dll"
    LoadModule wsgi_module "D:/condaEnv/djangoEnv/lib/site-packages/mod_wsgi/server/mod_wsgi.cp39-win_amd64.pyd"
    WSGIPythonHome "D:/condaEnv/djangoEnv"

9.Edit/add the lines below to *httpd.conf*. Note that it assumes that the source code for the Django server is in the folder “*D:/quangisWeb*”.

    WSGIPythonPath D:/quangisWeb
    WSGIScriptAlias / D:/quangisWeb/quAnGisWeb/wsgi.py
    <Directory D:/quangisWeb/quAnGisWeb>
        <Files wsgi.py>
            Require all granted
        </Files>
    </Directory>

10.Create a folder to contain the static files. For example, create a folder named “*allStatics*” with a path “*D:/quangisWeb/allStatics*”

11.Change the settings file at “*D:/quangisWeb/quAnGisWeb/settings.py*”.
First, make sure debug mode is off:

    DEBUG = False

Second, set static root to the absolute path of the folder that will contain all static files:

    STATIC_ROOT = "D:/quangisWeb/allStatics"

12.Inside anaconda prompt, enter the following command to compile all static files into the designated folder. If you get an error, you may need to run the Django server in a test mode at first (see instructions above) before calling the command below.

    python D:/quangisWeb/manage.py collectstatic

After running the command, make sure static files are present inside the “*allStatics*” folder.

13.Add the following lines to *httpd.conf*:

    Alias /static/ D:/quangisWeb/allStatics/
    <Directory D:/quangisWeb/allStatics>
        Require all granted
    </Directory>

14.Make sure Unicode is supported by adding the following line to *httpd.conf*:

    AddDefaultCharset UTF-8

15.Change the following line in *httpd.conf* to get more detailed logging:

    LogLevel info

16.To run the Apache server, you can run the ‘*runApache.bat*’ file. But at first it needs to be configured. Similar to the file “*runTest.bat*”, open “*runApache.bat*” in a text editor and change the parameters according to your preferences and the setup of the question parser server. Here is an example:

    set DJANGO_KEY=someRandomKey218478934_ds9394734
    set TDB_USER=someUsername
    set TDB_PASS=somePassword
    set QPARSE_IP=localhost
    set QPARSE_PORT=5570
    set QPARSE_WAIT=60000
    set PYTHONHOME=D:/condaEnv/djangoEnv
    D:\Apache24\bin\httpd.exe

16.Run ‘*runApache.bat*’ within the miniconda prompt.

17.To test if the server is running properly, try opening the server address (e.g., http://127.0.0.1/) in a browser.

18.To stop the server press the combo “*Ctrl+C*” in the anaconda prompt. Enter ‘*Y*’ when asked “*Terminate batch job (Y/N)?*”.


## Loading data to MarkLogic

The [`cct`][cct] repository contains example workflows. These can be 
augmented with their transformation graphs using the 
[`transformation-algebra`][ta] command-line tool. For example, to 
produce a [TriG][trig] file containing all graphs, you could use:

    python -m transformation_algebra graph -L cct -T tools/tools.ttl \
        workflows/*.ttl -o transformations.trig

To additionally upload these graphs to a graph store, additionally pass 
arguments such as these:

    -b marklogic -u "<user>:<pass>" -s "https://<host>:<port>"


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
[mlrest]: https://docs.marklogic.com/guide/semantics/REST
[trig]: https://www.w3.org/TR/trig/