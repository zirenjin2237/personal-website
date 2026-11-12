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

## What it is

DPA-ADAPT adapts pretrained DPA models to downstream atomistic property tasks, such as molecular orbital energies or material properties. One interface covers the whole range from a quick frozen-feature baseline to end-to-end fine-tuning. Users do not write DeePMD-kit JSON configs or `dp train` pipelines.

```bash
pip install deepmd-kit[dpa-adapt]
```

The command-line tool is `dpa-adapt`, with the short alias `dpaad`. The Python package is `dpa_adapt`.

## Strategies

| Strategy | What is trained | Typical data size | Hardware |
| --- | --- | --- | --- |
| `frozen_sklearn` | scikit-learn regressor on pooled frozen descriptors | small (< 1k) | CPU |
| `frozen_head` | DeePMD property head, backbone frozen | medium (1k–10k) | GPU |
| `finetune` | full model, end to end | large (> 10k) | GPU |
| `mft` | property head and force-field head on a shared descriptor | small, low-data | GPU |

`mft` (multi-task fine-tuning) co-trains the property task with an auxiliary force-field task to limit representation collapse when labels are scarce.

## Minimal workflow

```bash
dpa-adapt data convert --input POSCAR --output ./npy
dpa-adapt fit --train-data ./npy/train --pretrained DPA-3.1-3M \
    --strategy frozen_sklearn --predictor rf --target-key homo --output model.pth
dpa-adapt predict  --model model.pth --data ./npy/test --output pred.npy
dpa-adapt evaluate --model model.pth --data ./npy/test
```

The same steps are available in Python through `DPAFineTuner` and `DPAPredictor`.

## Useful details

| Topic | Options |
| --- | --- |
| Input data | `deepmd/npy`; SMILES CSV (3D conformers via RDKit); about 60 structure formats through dpdata |
| Pooling | `mean`, `sum`, `mean+std`, `mean+std+max+min` |
| Regressors (`frozen_sklearn`) | random forest, ridge, MLP |
| Uncertainty | random-forest out-of-bag variance; MLP committee |
| Context features | `fparam` columns, e.g. temperature or composition descriptors |
| Validation | formula-grouped cross-validation to avoid same-composition leakage |
| Output | a frozen `.pth` bundle for prediction and evaluation |

## In review: labels defined over several structures

Some properties do not belong to a single structure. An oxygen-evolution overpotential is computed from several adsorbate states of one surface, and a polymer property depends on its repeat units and end groups. [Pull request #5982](https://github.com/deepmodeling/deepmd-kit/pull/5982) adds **grouped-property training** for such labels:

- per-frame representations are pooled into one group embedding, and the loss is computed once per group;
- groups are declared in ordinary `deepmd/npy` data, so no new training entry point is needed;
- the same grouped data work with `frozen_head`, `finetune` and `mft`.

| Extra file per `set.*` | Shape | Meaning |
| --- | --- | --- |
| `group_id.npy` | (nframes,) | which group each frame belongs to |
| `weight.npy` | (nframes,) | weight of each frame or component in pooling |
| `pool_mask.npy` | (nframes, natoms) | atoms included in pooling |

Pooling is a weighted mean or a weighted sum (`group_reduce`), for intensive and extensive properties. `dpa-adapt data mark-groups` writes the group files. The pull request also adds an optional training-time regularizer and a post-training calibrator.

## References

- D. Zhang *et al.*, A graph neural network for the era of large atomistic models, arXiv:2506.01686 (2025). (DPA-3)
- J. Zeng *et al.*, DeePMD-kit v2: a software package for deep potential models, *J. Chem. Phys.* **159**, 054801 (2023).
- Y. Köster, J. Kimmig, S. Zechel, U. S. Schubert, Fingerprint applicable for machine learning tested on LCST behavior of polymers, *Cell Rep. Phys. Sci.* **4**, 101553 (2023). [doi:10.1016/j.xcrp.2023.101553](https://doi.org/10.1016/j.xcrp.2023.101553)
- X. Zhang, Y. Li, X. Jin, B. Smit, FFLAME: a fragment-to-framework learning approach for MOF potentials, *Digital Discovery* **4**, 3466–3477 (2025). [doi:10.1039/d5dd00321k](https://doi.org/10.1039/d5dd00321k)
