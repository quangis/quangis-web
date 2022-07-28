# quangis-web

The web interface that brings all the different components of the 
QuAnGIS project together into a single pipeline.


## Overview

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

