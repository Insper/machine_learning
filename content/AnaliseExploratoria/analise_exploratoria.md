# Exploratory Data Analysis


## Think about the problem

Context: [the Ames Residential Home Sales](https://www.openintro.org/book/statdata/?data=ames).

Read the page, download the paper, skim the paper and read what's relevant.

FAQ:

- Professor, the link to the paper is not working!

    - Did you know that some bird species teach their young to fly simply by pushing them from the nest? Not true, but there is a message there anyway.


Observations:

- Write your observations as you go, always!


Let's think:

- What are the questions that the client would like to answer?

- Is the question a predictive or inferential one?

    - In Machine Learning, most of the time the goal is to construct a prediction for a target variable from the given features

    - Inference analysis in statistics is concerned with measuring the size of the effect of the independent variables (the features) onto the dependent variable (the target), and whether the measured effect is statistically significant.

- What data would you like to have available, ideally, to answer these questions? 

    - Think about the different variables you would like to have measured for you, and also the possible conditions that could affect the experiment. 

        - For instance: is it reasonable to mix economic data from before and during the pandemic? 

- Also think about the quality of the data for each variable - what does an unbiased data look like? 

    - Think of things like coverage, measurement error, limitations, etc.


## Prepare your workspace

### Software version control

Let's organize our workspace. Create a folder for your project and initialize a `git` repository there. The simplest way to do it is to write the command

```bash
git init
```

in your project folder. Or, equally simple, is to create a repository on github and clone it to your machine. From now on I'll assume that you are a git ace, that git is  second-nature to you. Go [forth](https://www.w3schools.com/git/) and have fun!

We will be developing in Python in this project. Download the file from [here](https://github.com/github/gitignore/blob/main/Python.gitignore) into your project folder and rename it to `.gitignore` simply. This file contains specifications for filenames that must be ignored by `git` (so that we don't commit things like `__pycache__` directories, secrets, etc).

### Virtual environment

We will use virtual environments to better handle dependencies in Python. You can use `virtualenv` or `conda` (from the Anaconda distribution). I prefer `conda`. Also, let's use Python 3.10. You can get a Conda environment named `ames` going with the following commands:

```bash
conda create -n ames python=3.10
conda activate ames
```

### Package management

In order to manage the installed packages we will use [Poetry](https://python-poetry.org/). 

```bash
pip install poetry
```

This tool reads the specification of which packages are required from a `pyproject.toml` file in the project's root folder. You can create an initial `pyproject.toml` file running the command

```bash
poetry init
```
and answering some questions. From now on: whenever we need to install a package in our project we must do it using the `poetry add <package name>`. For instance, if we want to install `numpy`, then we run `poetry add numpy`. After, run `poetry install` to get the packages actually installed.

### Directory structure

Make a README.md file in your project folder to keep your general information about the project (if you went the `github` cloning route you already have this file). For now the file will have little content, maybe only the project name.

Make a `docs` folder. Make a `notes.md` file there to place your annotations. Write your answers from the previous section there! Commit your changes.


## Obtaining the data

Make a `data` folder, and a `raw` subfolder. Download the Ames dataset into this last subfolder.

Edit the `.gitignore` file and add a line with `data/` in it, so that we won't commit our datasets.


## Analyzing the data

First analysis of the data, and quite an obvious one, is to check whether the file was downloaded properly. Check the location of the download and take note of the size of the file. It must be reasonable: not zero, nor several gigabytes (unless you were expecting it).

In regards to the size of the file, compare with the size of the RAM in your system. If the data fits comfortably in RAM, you are good to go with tools like [Pandas](https://pandas.pydata.org/) and [Scikit-Learn](https://scikit-learn.org/). For data that approaches or exceeds in size the capacity of your RAM, you may consider tools like [Dask](https://www.dask.org/) (like Pandas but for large data). For really large data (the so-called Big Data), which may not even fit on a single hard disk, you will need bigger tools, like [Spark](https://spark.apache.org/) running on a cloud cluster.

Our present needs are modest, so let's go with the usual toolchain for the vast majority of use-cases.

We now need the packages for analyzing the data, starting with Jupyter notebooks:

```bash
poetry add jupyterlab numpy scipy matplotlib pandas
```

Create a `notebooks` folder and an `experiment.ipynb` notebook there. Open it up. Read the data - here is a code snippet to help:

```python
import pathlib
import pandas as pd

DATA_DIR = pathlib.Path.cwd().parent / 'data'

raw_data = pd.read_csv(DATA_DIR / 'raw' / 'ames.csv')
```

Now we are ready to proceed with our analysis.

### Level 0 analysis

- Sanity checks
    - size of data, checking a few samples
- First contact with the content
    - what are the columns, what do they mean
    - what is the datatype of each column. Which columns represent continuous variables, ordinal variables (discrete ordered categorical data), and categorical variables (discrete nominal data without order definition)?
    - How many missing values each column has?

### Level 1 analysis

- Analyzing columns individually
    - Analyze categorical variables
        - How many categories? Are they balanced?
        - Bar plots
    - Analyze ordinal variables
        - Just like categorical variables, analyze how many categories exist and whether they are balanced. 
        - Are the "categories" a sequence of low-value positive integers, or are they actually a continuous variable disguised as an ordinal variable (that is, something that should have been of a floating-point type rather than an integer type)?
        - Stem plots of grouped data are useful here
    - Analyze continuous variables
        - Histograms may be very useful, but be careful to choose an adequate number of bins. A rule of thumb is to use the square root of the number of data points
        - Box plots permit the rapid visualization of important quantiles and the existence of outliers
        - Are there anomalies?
            - Outliers
            - Saturation

### Level 2 analysis

- Analyze columns jointly
    - Continuous versus continuous
        - Correlation (Pearson, Spearman, Kendall)
        - Scatter plots
    - Continuous versus discrete (ordinal or categorical)
        - Group continuous values by the discrete variable and make box-plots
    - Discrete versus discrete variables
        - Cross-tables
- Analyze target versus feature
    - For continuous targets, we have a regression problem
    - For categorical targets, we have a classification problem
    - Apply the rules for joint variable analysis shown before
- Look for strong variable associations, they may indicate redundancy. Be especially concerned about strong associations between a feature and the target: a good association is welcome (means we have a good feature) but an extremely good association may signify that a given feature is actually the target in disguise - then what is the point of constructing a predictive model? Like trying to predict the price of a house in dollars given its price in euros and the exchange rate.


