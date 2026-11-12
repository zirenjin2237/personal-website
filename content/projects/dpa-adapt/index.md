---
title: "DPA-ADAPT: Atomistic DPA Adaptation for Property Tasks"
subtitle: "Adapting pretrained DPA models to downstream property prediction"
date: "2026-08"
authors:
  - "Ziren Jin"
status: "Released in DeePMD-kit · grouped-property training under review"
summary: "A DeePMD-kit module that adapts pretrained DPA models to property prediction, from frozen-descriptor baselines to full and multi-task fine-tuning, without writing DeePMD-kit training configs."
featured: true
order: 2
tags:
  - Machine Learning Interatomic Potential
  - Transfer learning
  - Software

links:
  code: "https://github.com/deepmodeling/deepmd-kit"
  project: "https://docs.deepmodeling.com/projects/deepmd/en/stable/dpa_adapt/index.html"
---

## Three keywords and a whiteboard

In the summer of 2026 I arrived at the AI for Science Institute (AISI) for an internship. My very first task was to build a Python adaptation interface for the DPA series of pretrained atomistic models. At the time my knowledge of machine-learning interatomic potentials was close to zero, and I had never touched a large, complex open-source codebase like DeePMD-kit [2].

My mentor sat me down for an hour-long whiteboard session to explain the architecture. I nodded throughout, but by the end my overloaded brain had kept only three fragments: *"scikit-learn"*, *"pooling"* and *"avoid the JSON configs"*.

Those three fragments turned out to be exactly the right compass. Chemists and materials scientists wanted to use pretrained DPA models to predict downstream properties, such as molecular orbital energies or band gaps. To do that, they had to wrestle with DeePMD-kit's dense JSON training configurations and `dp train` pipelines. A good API and clear documentation could take that weight off them.

DPA-ADAPT came out of that need. I wanted one interface that covers the whole range, from a quick baseline to end-to-end fine-tuning, without the user ever writing a training JSON or setting up a type map by hand.

## The Python toolkit

DPA-ADAPT installs with `pip install deepmd-kit[dpa-adapt]`. It provides a command-line tool, `dpa-adapt` (short alias `dpaad`), and a Python package, `dpa_adapt`. It was merged into DeePMD-kit in July 2026 through [pull request #5572](https://github.com/deepmodeling/deepmd-kit/pull/5572).

Following the breadcrumbs from that whiteboard, I built it around four training strategies. They scale from a laptop CPU to a GPU cluster, depending on how much data you have:

<!-- OPTIONAL: one or two sentences on why four strategies (what you tried first, which interface you threw away). The page has no wrong turns yet; this is the best place for one. -->

| Strategy | What is trained | Typical data size | Hardware |
| --- | --- | --- | --- |
| `frozen_sklearn` | scikit-learn regressor on pooled frozen descriptors | small (< 1k) | CPU |
| `frozen_head` | DeePMD property head, backbone frozen | medium (1k–10k) | GPU |
| `finetune` | full model, end to end | large (> 10k) | GPU |
| `mft` | property head and force-field head on a shared descriptor | small, low-data | GPU |

`mft` is multi-task fine-tuning, the recipe of Zhang *et al.* [5]. It trains the property task together with an auxiliary force-field task inherited from pretraining, which the authors show keeps the shared representation from collapsing under distribution shift. DPA-ADAPT does not change the method; it makes it one `strategy=` argument. It is worth trying when property labels are scarce.

## What a run looks like

The goal was a pipeline that looks like ordinary data science. Here is the minimal workflow: convert structures, train a random forest on frozen DPA-3.1 features [1], and predict a HOMO energy.

```bash
# 1. Convert structures to DeePMD numpy format
dpa-adapt data convert --input POSCAR --output ./npy

# 2. Extract frozen features and train a scikit-learn random forest
dpa-adapt fit --train-data ./npy/train --pretrained DPA-3.1-3M \
    --strategy frozen_sklearn --predictor rf --target-key homo --output model.pth

# 3. Predict on unseen data
dpa-adapt predict --model model.pth --data ./npy/test --output pred.npy

# 4. Evaluate
dpa-adapt evaluate --model model.pth --data ./npy/test
```

If you prefer code, the same steps are available in Python through the `DPAFineTuner` and `DPAPredictor` classes.

Frozen descriptors are extracted once and cached on disk, so refitting a baseline takes seconds. A DeePMD training run on the same data takes hours. <!-- TODO: replace "seconds" and "hours" with measured numbers: frozen_sklearn fit time versus one DeePMD run on the same dataset. -->

## Handling the messy parts of data

Under the hood, DPA-ADAPT takes care of the data wrangling that usually slows materials informatics down:

- **Input data.** It reads `deepmd/npy`, SMILES CSV files (3D conformers generated with RDKit) and about 60 other structure formats through dpdata.
- **Pooling** (the second keyword). Per-atom representations become one feature vector per structure by `mean`, `sum`, `mean+std` or `mean+std+max+min`.
- **Regressors** (the first keyword). `frozen_sklearn` offers random forest, ridge regression and MLP.
- **Uncertainty.** Random-forest out-of-bag variance, or an MLP committee.
- **Context features.** `fparam` columns feed conditions such as temperature or composition descriptors directly into the head.
- **Validation.** Formula-grouped cross-validation is built in, so the same composition never sits on both sides of a split.


## Labels that belong to several structures

### Overpotentials

Eventually you hit a wall. The first one came from Yuxiang, who studies oxygen-evolution catalysts in our group. 

Her data arrived as a folder dated 14 May: a base slab, two scripts and a list of compositions. The slab has 350 atoms (100 Ni, 50 H, 200 O). For each of 19 compositions, such as `Ni0.50Co0.15Fe0.15Gd0.15Lu0.05`, her script substitutes other metals (Co, Fe, rare earths) onto the Ni sites at random, ten times. Each substitution becomes three structures: the slab with O\*, OH\* or OOH\* adsorbed on top, padded with virtual atoms so that all three have 353 atoms. The label is one overpotential per composition, between 241.6 and 316.6.

That makes 190 groups of three frames, 570 frames in all, but only 19 distinct labels. Her split script keeps every random structure of a composition on the same side of the split (five folds of 13–14 training and 3–4 validation compositions, plus two held-out test compositions). Any accuracy number on this set is a statement about 19 compositions.

The label belongs to the three structures together. An overpotential is set by the energy differences between the O\*, OH\* and OOH\* intermediates, so no single frame determines it. DeePMD-kit's property training expects one label per frame, so her script copies the overpotential onto all three frames (`np.full((nframes, 1), overpotential)`). A frame-level head is then asked to read the number off O\* alone, and the differences that set it are never seen together.

The configuration for this task ran to 266 lines of JSON: 118 element symbols listed one per line, a 16-layer DPA-3 descriptor block, a force-field head and a property head with a 50/50 sampling probability between them.

### Grouped training

For these cases I designed **grouped-property training** ([pull request #5982](https://github.com/deepmodeling/deepmd-kit/pull/5982)). It learns labels defined over a collection of structures, an idea related to building a whole material from its parts, as fragment-based training does for MOF potentials [4].

- Per-frame representations are pooled into one group embedding, and the loss is computed once per group.
- Groups are declared inside ordinary `deepmd/npy` data, so no new training entry point is needed.
- Grouped data works with the `frozen_head`, `finetune` and `mft` strategies.

Each `set.*` directory gets up to three extra files:

| File | Shape | Meaning |
| --- | --- | --- |
| `group_id.npy` | (nframes,) | which group each frame belongs to |
| `weight.npy` | (nframes,) | weight of each frame or component in pooling |
| `pool_mask.npy` | (nframes, natoms) | which atoms are included in pooling |

Pooling is a weighted mean or a weighted sum (`group_reduce`), for intensive and extensive properties. `dpa-adapt data mark-groups` writes the group files for you. The pull request also adds an optional training-time regularizer and a post-training calibrator.

Yuxiang's layout, one system directory per labeled group, is the one the documentation now calls the common OER layout. The whole job is two calls (this snippet is from the PR documentation):

```python
from dpa_adapt import DPAFineTuner, mark_groups

# add group markers in place: one system directory == one labeled group
mark_groups("oer/dpdata", target="overpotential", group_by="system")

model = DPAFineTuner(
    pretrained="DPA-3.1-3M",
    strategy="finetune",
    property_name="overpotential",
    task_dim=1,
    init_branch="SPICE2",
    max_steps=50_000,
)
model.fit(train_data="oer/train/*", valid_data="oer/valid/*")
```

<!-- TODO: result of grouped training on Yuxiang's data (grouped model versus the per-frame baseline on the same folds). This is the missing number for the section above. -->

### A second test: polymer cloud points

A second kind of label is the cloud point of a polymer, which depends on its repeat units and end groups together [3]. A sample is a group of components, each with a weight, and the label is a temperature in °C. The dataset has 591 groups.

In the July runs, the best grouped model (15,000 steps) reached an RMSE of 7.1 °C on the training groups and 7.7 °C on validation, with the slope of predicted against true values at 0.78 and 0.70. On a split that holds out the highest cloud points, the RMSE was 25.9 °C and the slope was 0.07: the model puts almost every polymer in that range near the middle of the training distribution.

The gap between training and validation error was only 0.6 °C, so this was not overfitting. A nearest-neighbour check on the model's inputs showed why. Among the 141 tail samples in the training set, the nearest neighbour's label differs by a median of 2.4 °C, but for 24% it differs by more than 10 °C and for 9% by more than 20 °C. The worst pair sits 0.43 apart in the input space of the check and has cloud points of 19.5 °C and 61.5 °C. Those two samples look the same to the model and have labels 42 °C apart, so something that sets the cloud point is not in the input.

Two obvious fixes did not help. Adding molecular weight, dispersity and tacticity as extra features gave no improvement, and `mft` made the compression worse (training slope 0.60 against 0.78 for the best run). MFT is designed to protect the pretrained representation under distribution shift [5]; here the limit looks like missing information in the input, and the multi-task term cannot add it. <!-- TODO: update with the latest cloud-point runs if the missing variable has been found since July. -->


## What's next?

The whiteboard hour left me three words. `scikit-learn` became the `fit` / `predict` / `evaluate` interface and the `frozen_sklearn` strategy. `pooling` became the step from atoms to structures, and then from structures to groups. "Avoid the JSON configs" is the difference between 266 lines and the few lines above.

DPA-ADAPT is still under active development. The four strategies are released in DeePMD-kit, and grouped-property training is under review. I am adding support for the newest DPA-4 models, testing it on more MLIP tasks, refining the documentation, and optimizing speed and memory use. Issues and suggestions are welcome on [GitHub](https://github.com/deepmodeling/deepmd-kit).

## References

1. D. Zhang *et al.*, A graph neural network for the era of large atomistic models, arXiv:2506.01686 (2025). (DPA-3)
2. J. Zeng *et al.*, DeePMD-kit v2: a software package for deep potential models, *J. Chem. Phys.* **159**, 054801 (2023). [doi:10.1063/5.0155600](https://doi.org/10.1063/5.0155600)
3. Y. Köster, J. Kimmig, S. Zechel and U. S. Schubert, Fingerprint applicable for machine learning tested on LCST behavior of polymers, *Cell Rep. Phys. Sci.* **4**, 101553 (2023). [doi:10.1016/j.xcrp.2023.101553](https://doi.org/10.1016/j.xcrp.2023.101553)
4. X. Zhang, Y. Li, X. Jin and B. Smit, FFLAME: a fragment-to-framework learning approach for MOF potentials, *Digital Discovery* **4**, 3466–3477 (2025). [doi:10.1039/d5dd00321k](https://doi.org/10.1039/d5dd00321k)
5. C. Zhang, D. Zhang, A. Peng, M. Guo, Y. Zhang, L. Wang, G. Ke, L. Zhang, T. Li and H. Wang, Multi-Task Fine-Tuning Enables Robust Out-of-Distribution Generalization in Atomistic Models, arXiv:2601.08486 (2026). [arxiv.org/abs/2601.08486](https://arxiv.org/abs/2601.08486)
